import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Plus, Clock, Copy, Check, Users, UserPlus, Pencil, Trash2, Lock, Globe, Calendar, Megaphone } from "lucide-react";
import Button from "@/components/Button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isInstructor } = useAuth();
  const [copiedCode, setCopiedCode] = useState(false);
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [showEnroll, setShowEnroll] = useState(false);
  const [showJoinCode, setShowJoinCode] = useState(false);
  const [showEditCourse, setShowEditCourse] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editInstructor, setEditInstructor] = useState("");
  const [showAnnounce, setShowAnnounce] = useState(false);
  const [announceTitle, setAnnounceTitle] = useState("");
  const [announceMessage, setAnnounceMessage] = useState("");

  // Session form
  const [sessionTitle, setSessionTitle] = useState("");
  const [sessionDescription, setSessionDescription] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [duration, setDuration] = useState("60");
  const [accessType, setAccessType] = useState<"all" | "selected">("all");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  // Enroll form
  const [studentName, setStudentName] = useState("");
  const [joinCode, setJoinCode] = useState("");

  const { data: course } = useQuery({
    queryKey: ["course", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: sessions } = useQuery({
    queryKey: ["course-sessions", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("course_id", id!)
        .order("scheduled_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: enrollments } = useQuery({
    queryKey: ["course-enrollments", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_enrollments")
        .select("*")
        .eq("course_id", id!)
        .order("enrolled_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createSession = useMutation({
    mutationFn: async () => {
      const { data: newSession, error } = await supabase.from("sessions").insert({
        course_id: id!,
        title: sessionTitle,
        description: sessionDescription,
        scheduled_at: new Date(scheduledAt).toISOString(),
        duration_minutes: parseInt(duration),
        status: "scheduled",
        access_type: accessType,
      }).select().single();
      if (error) throw error;

      // If selected students, insert access records
      if (accessType === "selected" && selectedStudents.length > 0) {
        const accessRows = selectedStudents.map(name => ({
          session_id: newSession.id,
          student_name: name,
        }));
        const { error: accessError } = await supabase.from("session_access").insert(accessRows);
        if (accessError) throw accessError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-sessions", id] });
      setShowCreateSession(false);
      setSessionTitle("");
      setSessionDescription("");
      setScheduledAt("");
      setDuration("60");
      setAccessType("all");
      setSelectedStudents([]);
    },
  });

  const enrollStudent = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("course_enrollments").insert({
        course_id: id!,
        student_name: studentName,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-enrollments", id] });
      setStudentName("");
      setShowEnroll(false);
    },
  });

  const joinCourse = useMutation({
    mutationFn: async () => {
      // Find course by join code
      const { data: foundCourse, error: findError } = await supabase
        .from("courses")
        .select("id")
        .eq("join_code", joinCode)
        .single();
      if (findError) throw new Error("Invalid join code");
      const { error } = await supabase.from("course_enrollments").insert({
        course_id: foundCourse.id,
        student_name: studentName,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-enrollments", id] });
      setJoinCode("");
      setStudentName("");
      setShowJoinCode(false);
    },
  });

  const updateCourse = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("courses")
        .update({ title: editTitle, description: editDescription, instructor_name: editInstructor })
        .eq("id", id!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course", id] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      setShowEditCourse(false);
    },
  });

  const deleteCourse = useMutation({
    mutationFn: async () => {
      const { data: sessions } = await supabase.from("sessions").select("id").eq("course_id", id!);
      if (sessions?.length) {
        const sessionIds = sessions.map(s => s.id);
        await supabase.from("session_materials").delete().in("session_id", sessionIds);
        await supabase.from("session_assignments").delete().in("session_id", sessionIds);
        await supabase.from("session_attendance").delete().in("session_id", sessionIds);
        await supabase.from("session_grades").delete().in("session_id", sessionIds);
      }
      await supabase.from("sessions").delete().eq("course_id", id!);
      await supabase.from("course_enrollments").delete().eq("course_id", id!);
      const { error } = await supabase.from("courses").delete().eq("id", id!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      navigate("/courses");
    },
  });

  const openEditCourse = () => {
    setEditTitle(course?.title || "");
    setEditDescription(course?.description || "");
    setEditInstructor(course?.instructor_name || "");
    setShowEditCourse(true);
  };

  const statusColors: Record<string, string> = {
    draft: "bg-foreground/10",
    scheduled: "bg-vibrant-blue",
    live: "bg-vibrant-coral",
    completed: "bg-vibrant-mint",
  };

  if (!course) return null;

  return (
    <div>
      <Link to="/courses" className="inline-flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors mb-6 nav-text">
        <ArrowLeft className="w-4 h-4" /> BACK TO COURSES
      </Link>

      {/* Course Hero — matches SessionDetail layout */}
      <div className={`rounded-3xl p-8 md:p-12 mb-8 ${(course as any).color || "bg-vibrant-purple"}`}>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border-2 border-foreground/20 ${
            (course as any).course_type === "private" ? "bg-foreground/10" :
            (course as any).course_type === "paid" ? "bg-vibrant-yellow text-foreground" :
            "bg-vibrant-mint text-foreground"
          }`}>
            {((course as any).course_type || "free").toUpperCase()}
          </span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(course.join_code);
              setCopiedCode(true);
              setTimeout(() => setCopiedCode(false), 2000);
            }}
            className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider bg-foreground/10 px-3 py-1 rounded-full hover:bg-foreground/20 transition-colors"
          >
            {copiedCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            JOIN CODE: {course.join_code}
          </button>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.8] font-sans mb-6">
          {course.title}
        </h1>

        {course.description && (
          <p className="text-base md:text-lg text-foreground/80 font-serif mb-6 max-w-2xl">
            {course.description}
          </p>
        )}

        <div className="flex flex-wrap gap-6 text-sm font-sans text-foreground/70 mb-6">
          {(course as any).start_date && (
            <span className="flex items-center gap-2"><Calendar className="w-4 h-4" />{(course as any).start_date}</span>
          )}
          <span className="flex items-center gap-2"><Users className="w-4 h-4" />{enrollments?.length ?? 0} students</span>
          <span className="flex items-center gap-2"><Clock className="w-4 h-4" />{sessions?.length ?? 0} sessions</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-foreground/20 flex items-center justify-center text-sm font-bold">
            {course.instructor_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-sm font-sans">{course.instructor_name}</p>
            <p className="text-xs text-foreground/50">Instructor</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      {isInstructor && (
        <div className="flex flex-wrap gap-3 mb-8">
          <Button variant="filled" onClick={() => setShowCreateSession(true)}>
            <Plus className="w-4 h-4 mr-2" /> ADD SESSION
          </Button>
          <Button variant="transparent" onClick={() => setShowEnroll(true)}>
            <UserPlus className="w-4 h-4 mr-2" /> ENROLL STUDENT
          </Button>
          <Button variant="transparent" onClick={() => setShowJoinCode(true)}>
            <Users className="w-4 h-4 mr-2" /> JOIN WITH CODE
          </Button>
          <Button variant="transparent" onClick={() => setShowAnnounce(true)}>
            <Megaphone className="w-4 h-4 mr-2" /> ANNOUNCE
          </Button>
          <Button variant="transparent" onClick={openEditCourse}>
            <Pencil className="w-4 h-4 mr-2" /> EDIT COURSE
          </Button>
          <Button variant="transparent" onClick={() => setShowDeleteConfirm(true)}>
            <Trash2 className="w-4 h-4 mr-2 text-accent-red" /> DELETE
          </Button>
        </div>
      )}

      {/* Modal: Create Session */}
      {showCreateSession && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-3xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-extrabold uppercase tracking-tight font-sans mb-6">NEW SESSION</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-foreground/60 mb-1 block">Title</label>
                <input value={sessionTitle} onChange={e => setSessionTitle(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-muted border-none text-foreground font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Session title" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-foreground/60 mb-1 block">Description</label>
                <textarea value={sessionDescription} onChange={e => setSessionDescription(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-2xl bg-muted border-none text-foreground font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" placeholder="What will this session cover?" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-foreground/60 mb-1 block">Scheduled At</label>
                <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-muted border-none text-foreground font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-foreground/60 mb-1 block">Duration (minutes)</label>
                <input type="number" value={duration} onChange={e => setDuration(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-muted border-none text-foreground font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>

              {/* Access Control */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-foreground/60 mb-2 block">Student Access</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setAccessType("all"); setSelectedStudents([]); }}
                    className={`flex-1 px-4 py-3 rounded-2xl text-sm font-bold uppercase tracking-wider transition-colors ${accessType === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground/60 hover:bg-foreground/10"}`}
                  >
                    All Enrolled
                  </button>
                  <button
                    onClick={() => setAccessType("selected")}
                    className={`flex-1 px-4 py-3 rounded-2xl text-sm font-bold uppercase tracking-wider transition-colors ${accessType === "selected" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground/60 hover:bg-foreground/10"}`}
                  >
                    Selected Only
                  </button>
                </div>
              </div>

              {/* Student Selection */}
              {accessType === "selected" && (
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground/60 mb-2 block">
                    Select Students ({selectedStudents.length} selected)
                  </label>
                  {enrollments?.length === 0 ? (
                    <p className="text-foreground/40 text-sm font-sans">No enrolled students yet.</p>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto rounded-2xl bg-muted p-3">
                      {enrollments?.map((e) => (
                        <label key={e.id} className="flex items-center gap-3 cursor-pointer py-1.5 px-2 rounded-xl hover:bg-foreground/5 transition-colors">
                          <input
                            type="checkbox"
                            checked={selectedStudents.includes(e.student_name)}
                            onChange={(ev) => {
                              if (ev.target.checked) {
                                setSelectedStudents(prev => [...prev, e.student_name]);
                              } else {
                                setSelectedStudents(prev => prev.filter(n => n !== e.student_name));
                              }
                            }}
                            className="w-4 h-4 rounded accent-primary"
                          />
                          <span className="text-sm font-sans font-medium">{e.student_name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button variant="filled" onClick={() => createSession.mutate()} className="flex-1">CREATE</Button>
                <Button variant="transparent" onClick={() => { setShowCreateSession(false); setAccessType("all"); setSelectedStudents([]); }} className="flex-1">CANCEL</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Enroll Student */}
      {showEnroll && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-3xl p-8 w-full max-w-lg">
            <h2 className="text-2xl font-extrabold uppercase tracking-tight font-sans mb-6">ENROLL STUDENT</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-foreground/60 mb-1 block">Student Name</label>
                <input value={studentName} onChange={e => setStudentName(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-muted border-none text-foreground font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. Alex Rivera" />
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="filled" onClick={() => enrollStudent.mutate()} className="flex-1">ENROLL</Button>
                <Button variant="transparent" onClick={() => setShowEnroll(false)} className="flex-1">CANCEL</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Join with Code */}
      {showJoinCode && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-3xl p-8 w-full max-w-lg">
            <h2 className="text-2xl font-extrabold uppercase tracking-tight font-sans mb-6">JOIN WITH CODE</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-foreground/60 mb-1 block">Student Name</label>
                <input value={studentName} onChange={e => setStudentName(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-muted border-none text-foreground font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Your name" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-foreground/60 mb-1 block">Join Code</label>
                <input value={joinCode} onChange={e => setJoinCode(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-muted border-none text-foreground font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary tracking-widest text-center text-lg" placeholder="abc123" maxLength={6} />
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="filled" onClick={() => joinCourse.mutate()} className="flex-1">JOIN</Button>
                <Button variant="transparent" onClick={() => setShowJoinCode(false)} className="flex-1">CANCEL</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Course */}
      {showEditCourse && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-3xl p-8 w-full max-w-lg">
            <h2 className="text-2xl font-extrabold uppercase tracking-tight font-sans mb-6">EDIT COURSE</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-foreground/60 mb-1 block">Title</label>
                <input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-muted border-none text-foreground font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-foreground/60 mb-1 block">Instructor</label>
                <input value={editInstructor} onChange={e => setEditInstructor(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-muted border-none text-foreground font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-foreground/60 mb-1 block">Description</label>
                <textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-2xl bg-muted border-none text-foreground font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="filled" onClick={() => updateCourse.mutate()} className="flex-1">SAVE</Button>
                <Button variant="transparent" onClick={() => setShowEditCourse(false)} className="flex-1">CANCEL</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-3xl p-8 w-full max-w-md text-center">
            <Trash2 className="w-12 h-12 mx-auto text-accent-red mb-4" />
            <h2 className="text-2xl font-extrabold uppercase tracking-tight font-sans mb-2">DELETE COURSE?</h2>
            <p className="text-foreground/60 font-serif text-sm mb-6">
              This will permanently delete this course and all its sessions, materials, assignments, grades, and enrollments.
            </p>
            <div className="flex gap-3">
              <Button variant="filled" onClick={() => deleteCourse.mutate()} className="flex-1 !bg-accent-red">DELETE</Button>
              <Button variant="transparent" onClick={() => setShowDeleteConfirm(false)} className="flex-1">CANCEL</Button>
            </div>
          </div>
        </div>
      )}

      {/* Sessions List */}
      <h2 className="text-2xl font-extrabold uppercase tracking-tight font-sans mb-4">SESSIONS</h2>
      {sessions?.length === 0 ? (
        <p className="text-foreground/50 font-sans text-sm">No sessions yet. Add your first session!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {sessions?.map((session) => (
            <Link key={session.id} to={`/courses/${id}/sessions/${session.id}`} className="block">
              <article className={`card-hover rounded-3xl p-6 ${statusColors[session.status] || "bg-muted"}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border-2 border-foreground/20 ${session.status === "live" ? "bg-accent-red text-foreground" : "bg-foreground/10"}`}>
                    {session.status === "live" ? "● LIVE" : session.status.toUpperCase()}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-foreground/50">
                    {(session as any).access_type === "selected" ? (
                      <><Lock className="w-3 h-3" /> PRIVATE</>
                    ) : (
                      <><Globe className="w-3 h-3" /> ALL</>
                    )}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold uppercase tracking-tighter font-sans leading-[0.85] mb-2">
                  {session.title}
                </h3>
                {(session as any).description && (
                  <p className="text-sm text-foreground/60 font-serif mb-3 line-clamp-2">
                    {(session as any).description}
                  </p>
                )}
                <div className="flex items-center gap-3 text-sm text-foreground/60 font-sans">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(session.scheduled_at).toLocaleDateString()} · {session.duration_minutes}min
                  </span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}

      {/* Enrolled Students */}
      <h2 className="text-2xl font-extrabold uppercase tracking-tight font-sans mb-4">
        ENROLLED STUDENTS ({enrollments?.length ?? 0})
      </h2>
      {enrollments?.length === 0 ? (
        <p className="text-foreground/50 font-sans text-sm">No students enrolled yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {enrollments?.map((e) => (
            <div key={e.id} className="rounded-3xl bg-vibrant-lavender p-5 card-hover">
              <p className="font-bold text-sm font-sans">{e.student_name}</p>
              <p className="text-xs text-foreground/50 mt-1">
                Enrolled {new Date(e.enrolled_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseDetail;
