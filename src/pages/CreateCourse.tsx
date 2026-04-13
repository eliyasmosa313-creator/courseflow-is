import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Plus, Trash2, Clock, Calendar, Users, Lock, Globe, Check } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "@/components/Button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

const COLOR_OPTIONS = [
  { name: "Coral", class: "bg-vibrant-coral" },
  { name: "Blue", class: "bg-vibrant-blue" },
  { name: "Purple", class: "bg-vibrant-purple" },
  { name: "Mint", class: "bg-vibrant-mint" },
  { name: "Yellow", class: "bg-vibrant-yellow" },
  { name: "Magenta", class: "bg-vibrant-magenta" },
  { name: "Orange", class: "bg-vibrant-orange" },
  { name: "Lavender", class: "bg-vibrant-lavender" },
];

interface SessionDraft {
  id: string;
  title: string;
  description: string;
  scheduledAt: string;
  duration: string;
  accessType: "all" | "selected";
  selectedStudents: string[];
}

const CreateCourse = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Course fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructorName, setInstructorName] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0].class);

  // Sessions
  const [sessions, setSessions] = useState<SessionDraft[]>([]);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = "Course title is required";
    if (!description.trim()) errs.description = "Description is required";
    if (!instructorName.trim()) errs.instructorName = "Instructor name is required";

    // Validate each session
    sessions.forEach((s, i) => {
      if (!s.title.trim()) errs[`session_${s.id}_title`] = `Session ${i + 1} title is required`;
      if (!s.description.trim()) errs[`session_${s.id}_desc`] = `Session ${i + 1} description is required`;
      if (!s.scheduledAt) errs[`session_${s.id}_time`] = `Session ${i + 1} time is required`;
      if (s.accessType === "selected" && s.selectedStudents.length === 0) {
        errs[`session_${s.id}_students`] = `Session ${i + 1} needs at least one student selected`;
      }
    });

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const addSession = () => {
    const id = crypto.randomUUID();
    setSessions(prev => [
      ...prev,
      { id, title: "", description: "", scheduledAt: "", duration: "60", accessType: "all", selectedStudents: [] },
    ]);
    setExpandedSession(id);
  };

  const updateSession = (id: string, updates: Partial<SessionDraft>) => {
    setSessions(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));
  };

  const removeSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    if (expandedSession === id) setExpandedSession(null);
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      // Create course
      const { data: course, error } = await supabase
        .from("courses")
        .insert({
          title,
          description,
          instructor_name: instructorName,
          user_id: user!.id,
        })
        .select()
        .single();
      if (error) throw error;

      // Create sessions
      for (const s of sessions) {
        const { data: newSession, error: sErr } = await supabase
          .from("sessions")
          .insert({
            course_id: course.id,
            title: s.title,
            description: s.description,
            scheduled_at: new Date(s.scheduledAt).toISOString(),
            duration_minutes: parseInt(s.duration),
            status: "scheduled",
            access_type: s.accessType,
          })
          .select()
          .single();
        if (sErr) throw sErr;

        if (s.accessType === "selected" && s.selectedStudents.length > 0) {
          const accessRows = s.selectedStudents.map(name => ({
            session_id: newSession.id,
            student_name: name,
          }));
          await supabase.from("session_access").insert(accessRows);
        }
      }

      return course;
    },
    onSuccess: (course) => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast({ title: "Course created successfully!" });
      navigate(`/courses/${course.id}`);
    },
    onError: (err: any) => {
      toast({ title: "Error creating course", description: err.message, variant: "destructive" });
    },
  });

  const handleCreate = () => {
    if (!validate()) {
      toast({ title: "Please fix the errors below", variant: "destructive" });
      return;
    }
    createMutation.mutate();
  };

  return (
    <div>
      <Link
        to="/courses"
        className="inline-flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors mb-6 nav-text"
      >
        <ArrowLeft className="w-4 h-4" /> BACK TO COURSES
      </Link>

      <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tighter font-sans leading-[0.85] mb-8">
        CREATE COURSE
      </h1>

      {/* Live Preview Card */}
      <div className={`rounded-3xl p-8 md:p-12 mb-8 transition-colors duration-300 ${selectedColor}`}>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-foreground/60">
            {instructorName || "Instructor Name"}
          </span>
        </div>
        <h2 className="text-5xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.8] font-sans mb-4">
          {title || "COURSE TITLE"}
        </h2>
        {(description || !title) && (
          <p className="text-base md:text-lg text-foreground/80 font-serif max-w-2xl">
            {description || "Course description will appear here..."}
          </p>
        )}
        {sessions.length > 0 && (
          <div className="mt-6 flex items-center gap-4 text-sm text-foreground/60 font-sans">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {sessions.length} session{sessions.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* Form Section */}
      <div className="space-y-6 mb-10">
        {/* Color Picker */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-foreground/60 mb-2 block">
            Course Color
          </label>
          <div className="flex flex-wrap gap-3">
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c.class}
                onClick={() => setSelectedColor(c.class)}
                className={`w-10 h-10 rounded-full ${c.class} border-2 transition-all ${
                  selectedColor === c.class
                    ? "border-foreground scale-110"
                    : "border-transparent hover:scale-105"
                } flex items-center justify-center`}
              >
                {selectedColor === c.class && <Check className="w-4 h-4 text-foreground" />}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-foreground/60 mb-1 block">
            Course Title *
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-muted border-none text-foreground font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="e.g. Advanced React Patterns"
          />
          {errors.title && <p className="text-accent-red text-xs mt-1 font-sans">{errors.title}</p>}
        </div>

        {/* Instructor */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-foreground/60 mb-1 block">
            Instructor Name *
          </label>
          <input
            value={instructorName}
            onChange={(e) => setInstructorName(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-muted border-none text-foreground font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="e.g. Dr. Elena Martinez"
          />
          {errors.instructorName && <p className="text-accent-red text-xs mt-1 font-sans">{errors.instructorName}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-foreground/60 mb-1 block">
            Description *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-2xl bg-muted border-none text-foreground font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            placeholder="What will students learn?"
          />
          {errors.description && <p className="text-accent-red text-xs mt-1 font-sans">{errors.description}</p>}
        </div>

        {/* Sessions Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="text-xs font-bold uppercase tracking-wider text-foreground/60">
              Sessions ({sessions.length})
            </label>
            <button
              onClick={addSession}
              className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider bg-foreground/10 px-3 py-1.5 rounded-full hover:bg-foreground/20 transition-colors"
            >
              <Plus className="w-3 h-3" /> ADD SESSION
            </button>
          </div>

          {sessions.length === 0 && (
            <div className="rounded-2xl bg-muted p-6 text-center">
              <p className="text-foreground/40 text-sm font-sans">
                No sessions yet. Add your first session above.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {sessions.map((session, idx) => (
              <div
                key={session.id}
                className="rounded-3xl bg-muted overflow-hidden"
              >
                {/* Session Header - always visible */}
                <button
                  onClick={() =>
                    setExpandedSession(expandedSession === session.id ? null : session.id)
                  }
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground/40">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span className="font-bold text-sm font-sans uppercase tracking-tight">
                      {session.title || "Untitled Session"}
                    </span>
                    {session.scheduledAt && (
                      <span className="text-xs text-foreground/40 font-sans flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(session.scheduledAt).toLocaleDateString()}
                      </span>
                    )}
                    <span className="text-xs text-foreground/40 flex items-center gap-1">
                      {session.accessType === "selected" ? (
                        <><Lock className="w-3 h-3" /> Private</>
                      ) : (
                        <><Globe className="w-3 h-3" /> All</>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSession(session.id);
                      }}
                      className="p-1.5 rounded-full hover:bg-accent-red/20 transition-colors text-accent-red"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </button>

                {/* Session Detail Form - matches session detail card style */}
                {expandedSession === session.id && (
                  <div className="px-5 pb-5 space-y-4 border-t border-foreground/10 pt-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-foreground/60 mb-1 block">
                        Session Title *
                      </label>
                      <input
                        value={session.title}
                        onChange={(e) => updateSession(session.id, { title: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl bg-background border-none text-foreground font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Session title"
                      />
                      {errors[`session_${session.id}_title`] && (
                        <p className="text-accent-red text-xs mt-1 font-sans">
                          {errors[`session_${session.id}_title`]}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-foreground/60 mb-1 block">
                        Description *
                      </label>
                      <textarea
                        value={session.description}
                        onChange={(e) => updateSession(session.id, { description: e.target.value })}
                        rows={2}
                        className="w-full px-4 py-3 rounded-2xl bg-background border-none text-foreground font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                        placeholder="What will this session cover?"
                      />
                      {errors[`session_${session.id}_desc`] && (
                        <p className="text-accent-red text-xs mt-1 font-sans">
                          {errors[`session_${session.id}_desc`]}
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-foreground/60 mb-1 block">
                          Scheduled At *
                        </label>
                        <input
                          type="datetime-local"
                          value={session.scheduledAt}
                          onChange={(e) => updateSession(session.id, { scheduledAt: e.target.value })}
                          className="w-full px-4 py-3 rounded-2xl bg-background border-none text-foreground font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        {errors[`session_${session.id}_time`] && (
                          <p className="text-accent-red text-xs mt-1 font-sans">
                            {errors[`session_${session.id}_time`]}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-foreground/60 mb-1 block">
                          Duration (minutes)
                        </label>
                        <input
                          type="number"
                          value={session.duration}
                          onChange={(e) => updateSession(session.id, { duration: e.target.value })}
                          className="w-full px-4 py-3 rounded-2xl bg-background border-none text-foreground font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>

                    {/* Access Control */}
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-foreground/60 mb-2 block">
                        Student Access
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            updateSession(session.id, { accessType: "all", selectedStudents: [] })
                          }
                          className={`flex-1 px-4 py-3 rounded-2xl text-sm font-bold uppercase tracking-wider transition-colors ${
                            session.accessType === "all"
                              ? "bg-primary text-primary-foreground"
                              : "bg-background text-foreground/60 hover:bg-foreground/10"
                          }`}
                        >
                          <Globe className="w-3.5 h-3.5 inline mr-1" /> All Enrolled
                        </button>
                        <button
                          onClick={() => updateSession(session.id, { accessType: "selected" })}
                          className={`flex-1 px-4 py-3 rounded-2xl text-sm font-bold uppercase tracking-wider transition-colors ${
                            session.accessType === "selected"
                              ? "bg-primary text-primary-foreground"
                              : "bg-background text-foreground/60 hover:bg-foreground/10"
                          }`}
                        >
                          <Lock className="w-3.5 h-3.5 inline mr-1" /> Selected Only
                        </button>
                      </div>
                      {errors[`session_${session.id}_students`] && (
                        <p className="text-accent-red text-xs mt-1 font-sans">
                          {errors[`session_${session.id}_students`]}
                        </p>
                      )}
                    </div>

                    {session.accessType === "selected" && (
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-foreground/60 mb-1 block">
                          Student Names (comma separated)
                        </label>
                        <input
                          value={session.selectedStudents.join(", ")}
                          onChange={(e) =>
                            updateSession(session.id, {
                              selectedStudents: e.target.value
                                .split(",")
                                .map((s) => s.trim())
                                .filter(Boolean),
                            })
                          }
                          className="w-full px-4 py-3 rounded-2xl bg-background border-none text-foreground font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="e.g. Alex Rivera, Sarah Kim"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="filled"
            onClick={handleCreate}
            className="flex-1"
          >
            {createMutation.isPending ? "CREATING..." : "CREATE COURSE"}
          </Button>
          <Button
            variant="transparent"
            onClick={() => navigate("/courses")}
            className="flex-1"
          >
            CANCEL
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateCourse;
