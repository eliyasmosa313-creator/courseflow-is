import { useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Upload, Plus, FileText, Image, Link as LinkIcon, StickyNote, Download } from "lucide-react";
import Button from "@/components/Button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

type Tab = "materials" | "assignments" | "attendance" | "grades";

const gradeLabel = (score: number) => {
  if (score >= 90) return { label: "Excellent", color: "text-green-700 bg-green-100" };
  if (score >= 75) return { label: "Good", color: "text-blue-700 bg-blue-100" };
  if (score >= 50) return { label: "Average", color: "text-yellow-700 bg-yellow-100" };
  return { label: "Weak", color: "text-red-700 bg-red-100" };
};

const CourseSessionDetail = () => {
  const { courseId, sessionId } = useParams();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("materials");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isInstructor } = useAuth();

  // Material form
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [matTitle, setMatTitle] = useState("");
  const [matType, setMatType] = useState<"link" | "note">("link");
  const [matContent, setMatContent] = useState("");

  // Assignment form
  const [showAddAssignment, setShowAddAssignment] = useState(false);
  const [assignTitle, setAssignTitle] = useState("");
  const [assignDesc, setAssignDesc] = useState("");
  const [assignDue, setAssignDue] = useState("");

  // Attendance form
  const [attStudentName, setAttStudentName] = useState("");
  const [attStatus, setAttStatus] = useState<"present" | "absent" | "late">("present");

  // Grade form
  const [gradeStudentName, setGradeStudentName] = useState("");
  const [gradeScore, setGradeScore] = useState("");

  const { data: session } = useQuery({
    queryKey: ["session", sessionId],
    queryFn: async () => {
      const { data, error } = await supabase.from("sessions").select("*, courses(title)").eq("id", sessionId!).single();
      if (error) throw error;
      return data;
    },
  });

  const { data: materials } = useQuery({
    queryKey: ["session-materials", sessionId],
    queryFn: async () => {
      const { data, error } = await supabase.from("session_materials").select("*").eq("session_id", sessionId!).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: assignments } = useQuery({
    queryKey: ["session-assignments", sessionId],
    queryFn: async () => {
      const { data, error } = await supabase.from("session_assignments").select("*, assignment_submissions(count)").eq("session_id", sessionId!).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: attendance } = useQuery({
    queryKey: ["session-attendance", sessionId],
    queryFn: async () => {
      const { data, error } = await supabase.from("session_attendance").select("*").eq("session_id", sessionId!).order("student_name");
      if (error) throw error;
      return data;
    },
  });

  const { data: grades } = useQuery({
    queryKey: ["session-grades", sessionId],
    queryFn: async () => {
      const { data, error } = await supabase.from("session_grades").select("*").eq("session_id", sessionId!).order("student_name");
      if (error) throw error;
      return data;
    },
  });

  const { data: enrollments } = useQuery({
    queryKey: ["course-enrollments", courseId],
    queryFn: async () => {
      const { data, error } = await supabase.from("course_enrollments").select("*").eq("course_id", courseId!);
      if (error) throw error;
      return data;
    },
  });

  // Mutations
  const uploadFile = useMutation({
    mutationFn: async (file: File) => {
      const filePath = `${sessionId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("materials").upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("materials").getPublicUrl(filePath);
      const fileType = file.type.startsWith("image/") ? "image" : "pdf";
      const { error } = await supabase.from("session_materials").insert({
        session_id: sessionId!,
        title: file.name,
        type: fileType,
        file_url: urlData.publicUrl,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["session-materials", sessionId] }),
  });

  const addMaterial = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("session_materials").insert({
        session_id: sessionId!,
        title: matTitle,
        type: matType,
        content: matContent,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session-materials", sessionId] });
      setShowAddMaterial(false);
      setMatTitle("");
      setMatContent("");
    },
  });

  const addAssignment = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("session_assignments").insert({
        session_id: sessionId!,
        title: assignTitle,
        description: assignDesc,
        due_date: assignDue ? new Date(assignDue).toISOString() : null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session-assignments", sessionId] });
      setShowAddAssignment(false);
      setAssignTitle("");
      setAssignDesc("");
      setAssignDue("");
    },
  });

  const markAttendance = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("session_attendance").upsert({
        session_id: sessionId!,
        student_name: attStudentName,
        status: attStatus,
      }, { onConflict: "session_id,student_name" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session-attendance", sessionId] });
      setAttStudentName("");
    },
  });

  const setGrade = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("session_grades").upsert({
        session_id: sessionId!,
        student_name: gradeStudentName,
        score: parseInt(gradeScore),
      }, { onConflict: "session_id,student_name" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session-grades", sessionId] });
      setGradeStudentName("");
      setGradeScore("");
    },
  });

  const tabs: { key: Tab; label: string }[] = [
    { key: "materials", label: "MATERIALS" },
    { key: "assignments", label: "ASSIGNMENTS" },
    { key: "attendance", label: "ATTENDANCE" },
    { key: "grades", label: "GRADES" },
  ];

  const materialIcons: Record<string, React.ReactNode> = {
    pdf: <FileText className="w-5 h-5" />,
    image: <Image className="w-5 h-5" />,
    link: <LinkIcon className="w-5 h-5" />,
    note: <StickyNote className="w-5 h-5" />,
  };

  const attendanceStatusColors: Record<string, string> = {
    present: "bg-green-100 text-green-800",
    absent: "bg-red-100 text-red-800",
    late: "bg-yellow-100 text-yellow-800",
  };

  if (!session) return null;

  return (
    <div>
      <Link to={`/courses/${courseId}`} className="inline-flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors mb-6 nav-text">
        <ArrowLeft className="w-4 h-4" /> BACK TO COURSE
      </Link>

      {/* Session Hero */}
      <div className="rounded-3xl bg-vibrant-coral p-8 md:p-12 mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-foreground/60 mb-2 block">
          {(session as any).courses?.title}
        </span>
        <h1 className="text-4xl md:text-6xl font-extrabold uppercase tracking-tighter leading-[0.8] font-sans mb-4">
          {session.title}
        </h1>
        <div className="flex flex-wrap gap-4 text-sm font-sans text-foreground/70">
          <span>{new Date(session.scheduled_at).toLocaleDateString()} · {new Date(session.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          <span>{session.duration_minutes} min</span>
          <span className={cn("px-3 py-0.5 rounded-full text-xs font-bold uppercase", session.status === "live" ? "bg-accent-red" : "bg-foreground/10")}>
            {session.status}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap",
              tab === t.key ? "bg-foreground text-background" : "bg-muted text-foreground/60 hover:bg-foreground/10"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Materials Tab */}
      {tab === "materials" && (
        <div>
          {isInstructor && (
            <div className="flex gap-3 mb-6">
              <Button variant="filled" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" /> UPLOAD FILE
              </Button>
              <input ref={fileInputRef} type="file" accept=".pdf,image/*" className="hidden" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadFile.mutate(file);
              }} />
              <Button variant="transparent" onClick={() => setShowAddMaterial(true)}>
                <Plus className="w-4 h-4 mr-2" /> ADD LINK/NOTE
              </Button>
            </div>
          )}

          {showAddMaterial && (
            <div className="rounded-3xl bg-muted p-6 mb-6">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <button onClick={() => setMatType("link")} className={cn("px-4 py-2 rounded-full text-xs font-bold uppercase", matType === "link" ? "bg-foreground text-background" : "bg-foreground/10")}>Link</button>
                  <button onClick={() => setMatType("note")} className={cn("px-4 py-2 rounded-full text-xs font-bold uppercase", matType === "note" ? "bg-foreground text-background" : "bg-foreground/10")}>Note</button>
                </div>
                <input value={matTitle} onChange={e => setMatTitle(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-background text-foreground font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Title" />
                <textarea value={matContent} onChange={e => setMatContent(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-2xl bg-background text-foreground font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" placeholder={matType === "link" ? "https://..." : "Write your note..."} />
                <div className="flex gap-3">
                  <Button variant="filled" onClick={() => addMaterial.mutate()}>ADD</Button>
                  <Button variant="transparent" onClick={() => setShowAddMaterial(false)}>CANCEL</Button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {materials?.map((m) => (
              <div key={m.id} className="rounded-2xl bg-muted p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-foreground/10 flex items-center justify-center">
                  {materialIcons[m.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm font-sans truncate">{m.title}</p>
                  <p className="text-xs text-foreground/50 uppercase">{m.type}</p>
                </div>
                {m.file_url && (
                  <a href={m.file_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl hover:bg-foreground/10 transition-colors">
                    <Download className="w-4 h-4" />
                  </a>
                )}
              </div>
            ))}
            {materials?.length === 0 && <p className="text-foreground/50 font-sans text-sm">No materials yet.</p>}
          </div>
        </div>
      )}

      {/* Assignments Tab */}
      {tab === "assignments" && (
        <div>
          <Button variant="filled" onClick={() => setShowAddAssignment(true)} className="mb-6">
            <Plus className="w-4 h-4 mr-2" /> ADD ASSIGNMENT
          </Button>

          {showAddAssignment && (
            <div className="rounded-3xl bg-muted p-6 mb-6 space-y-4">
              <input value={assignTitle} onChange={e => setAssignTitle(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-background text-foreground font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Assignment title" />
              <textarea value={assignDesc} onChange={e => setAssignDesc(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-2xl bg-background text-foreground font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" placeholder="Description" />
              <input type="datetime-local" value={assignDue} onChange={e => setAssignDue(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-background text-foreground font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              <div className="flex gap-3">
                <Button variant="filled" onClick={() => addAssignment.mutate()}>CREATE</Button>
                <Button variant="transparent" onClick={() => setShowAddAssignment(false)}>CANCEL</Button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {assignments?.map((a) => (
              <div key={a.id} className="rounded-3xl bg-vibrant-yellow p-6 card-hover">
                <h3 className="text-lg font-extrabold uppercase tracking-tighter font-sans mb-1">{a.title}</h3>
                {a.description && <p className="text-sm text-foreground/70 font-serif mb-3">{a.description}</p>}
                <div className="flex gap-4 text-xs text-foreground/60 font-sans">
                  {a.due_date && <span>Due: {new Date(a.due_date).toLocaleDateString()}</span>}
                  <span>{(a.assignment_submissions as any)?.[0]?.count ?? 0} submissions</span>
                </div>
              </div>
            ))}
            {assignments?.length === 0 && <p className="text-foreground/50 font-sans text-sm">No assignments yet.</p>}
          </div>
        </div>
      )}

      {/* Attendance Tab */}
      {tab === "attendance" && (
        <div>
          <div className="rounded-3xl bg-muted p-6 mb-6">
            <h3 className="text-sm font-bold uppercase tracking-wider font-sans mb-4">MARK ATTENDANCE</h3>
            <div className="flex flex-wrap gap-3">
              <select value={attStudentName} onChange={e => setAttStudentName(e.target.value)} className="px-4 py-3 rounded-2xl bg-background text-foreground font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary flex-1 min-w-[200px]">
                <option value="">Select student...</option>
                {enrollments?.map(e => <option key={e.id} value={e.student_name}>{e.student_name}</option>)}
              </select>
              <div className="flex gap-2">
                {(["present", "absent", "late"] as const).map(s => (
                  <button key={s} onClick={() => setAttStatus(s)} className={cn("px-4 py-2.5 rounded-full text-xs font-bold uppercase", attStatus === s ? "bg-foreground text-background" : "bg-foreground/10")}>
                    {s}
                  </button>
                ))}
              </div>
              <Button variant="filled" onClick={() => markAttendance.mutate()} disabled={!attStudentName}>SAVE</Button>
            </div>
          </div>

          <div className="space-y-2">
            {attendance?.map((a) => (
              <div key={a.id} className="rounded-2xl bg-muted p-4 flex items-center justify-between">
                <span className="font-bold text-sm font-sans">{a.student_name}</span>
                <span className={cn("px-3 py-1 rounded-full text-xs font-bold uppercase", attendanceStatusColors[a.status])}>
                  {a.status}
                </span>
              </div>
            ))}
            {attendance?.length === 0 && <p className="text-foreground/50 font-sans text-sm">No attendance records yet.</p>}
          </div>
        </div>
      )}

      {/* Grades Tab */}
      {tab === "grades" && (
        <div>
          <div className="rounded-3xl bg-muted p-6 mb-6">
            <h3 className="text-sm font-bold uppercase tracking-wider font-sans mb-4">ADD/UPDATE GRADE</h3>
            <div className="flex flex-wrap gap-3">
              <select value={gradeStudentName} onChange={e => setGradeStudentName(e.target.value)} className="px-4 py-3 rounded-2xl bg-background text-foreground font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary flex-1 min-w-[200px]">
                <option value="">Select student...</option>
                {enrollments?.map(e => <option key={e.id} value={e.student_name}>{e.student_name}</option>)}
              </select>
              <input type="number" min="0" max="100" value={gradeScore} onChange={e => setGradeScore(e.target.value)} className="w-24 px-4 py-3 rounded-2xl bg-background text-foreground font-sans text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary" placeholder="0-100" />
              <Button variant="filled" onClick={() => setGrade.mutate()} disabled={!gradeStudentName || !gradeScore}>SAVE</Button>
            </div>
          </div>

          <div className="space-y-2">
            {grades?.map((g) => {
              const gl = gradeLabel(g.score);
              return (
                <div key={g.id} className="rounded-2xl bg-muted p-4 flex items-center justify-between">
                  <span className="font-bold text-sm font-sans">{g.student_name}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg font-sans">{g.score}</span>
                    <span className={cn("px-3 py-1 rounded-full text-xs font-bold uppercase", gl.color)}>{gl.label}</span>
                  </div>
                </div>
              );
            })}
            {grades?.length === 0 && <p className="text-foreground/50 font-sans text-sm">No grades yet.</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseSessionDetail;
