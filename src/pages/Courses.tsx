import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, BookOpen, Users, Copy, Check, Pencil, Trash2 } from "lucide-react";
import Button from "@/components/Button";
import { useAuth } from "@/hooks/useAuth";

const Courses = () => {
  const { isInstructor, isStudent, user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructorName, setInstructorName] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);

  const { data: courses, isLoading } = useQuery({
    queryKey: ["courses", user?.id],
    queryFn: async () => {
      if (isInstructor) {
        // Instructors see their own courses
        const { data, error } = await supabase
          .from("courses")
          .select("*, course_enrollments(count), sessions(count)")
          .eq("user_id", user!.id)
          .order("created_at", { ascending: false });
        if (error) throw error;
        return data;
      } else {
        // Students see courses they are enrolled in
        const { data: enrollments, error: eErr } = await supabase
          .from("course_enrollments")
          .select("course_id")
          .eq("user_id", user!.id);
        if (eErr) throw eErr;
        const courseIds = enrollments?.map(e => e.course_id) || [];
        if (courseIds.length === 0) return [];
        const { data, error } = await supabase
          .from("courses")
          .select("*, course_enrollments(count), sessions(count)")
          .in("id", courseIds)
          .order("created_at", { ascending: false });
        if (error) throw error;
        return data;
      }
    },
  });


  const updateMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("courses")
        .update({ title, description, instructor_name: instructorName })
        .eq("id", editingCourse.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      setEditingCourse(null);
      setTitle("");
      setDescription("");
      setInstructorName("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (courseId: string) => {
      // Delete related data first
      const { data: sessions } = await supabase.from("sessions").select("id").eq("course_id", courseId);
      if (sessions?.length) {
        const sessionIds = sessions.map(s => s.id);
        await supabase.from("session_materials").delete().in("session_id", sessionIds);
        await supabase.from("session_assignments").delete().in("session_id", sessionIds);
        await supabase.from("session_attendance").delete().in("session_id", sessionIds);
        await supabase.from("session_grades").delete().in("session_id", sessionIds);
      }
      await supabase.from("sessions").delete().eq("course_id", courseId);
      await supabase.from("course_enrollments").delete().eq("course_id", courseId);
      const { error } = await supabase.from("courses").delete().eq("id", courseId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      setDeletingCourseId(null);
    },
  });

  const openEdit = (course: any, e: React.MouseEvent) => {
    e.preventDefault();
    setEditingCourse(course);
    setTitle(course.title);
    setDescription(course.description || "");
    setInstructorName(course.instructor_name);
  };

  const copyJoinCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const colors = [
    "bg-vibrant-coral",
    "bg-vibrant-blue",
    "bg-vibrant-purple",
    "bg-vibrant-mint",
    "bg-vibrant-yellow",
    "bg-vibrant-magenta",
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tighter font-sans leading-[0.85]">
            COURSES
          </h1>
          <p className="text-foreground/60 font-serif mt-2">
            Manage your courses and learning tracks
          </p>
        </div>
        {isInstructor && (
          <Button variant="filled" onClick={() => navigate("/courses/new")}>
            <Plus className="w-4 h-4 mr-2" /> NEW COURSE
          </Button>
        )}
      </div>

      {/* Edit Course Modal */}
      {editingCourse && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-3xl p-8 w-full max-w-lg">
            <h2 className="text-2xl font-extrabold uppercase tracking-tight font-sans mb-6">
              EDIT COURSE
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-foreground/60 mb-1 block">
                  Course Title
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-muted border-none text-foreground font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-foreground/60 mb-1 block">
                  Instructor Name
                </label>
                <input
                  value={instructorName}
                  onChange={(e) => setInstructorName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-muted border-none text-foreground font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-foreground/60 mb-1 block">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-2xl bg-muted border-none text-foreground font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="filled"
                  onClick={() => updateMutation.mutate()}
                  className="flex-1"
                >
                  SAVE CHANGES
                </Button>
                <Button
                  variant="transparent"
                  onClick={() => setEditingCourse(null)}
                  className="flex-1"
                >
                  CANCEL
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCourseId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-3xl p-8 w-full max-w-md text-center">
            <Trash2 className="w-12 h-12 mx-auto text-accent-red mb-4" />
            <h2 className="text-2xl font-extrabold uppercase tracking-tight font-sans mb-2">
              DELETE COURSE?
            </h2>
            <p className="text-foreground/60 font-serif text-sm mb-6">
              This will permanently delete the course and all its sessions, materials, assignments, grades, and enrollments.
            </p>
            <div className="flex gap-3">
              <Button
                variant="filled"
                onClick={() => deleteMutation.mutate(deletingCourseId)}
                className="flex-1 !bg-accent-red"
              >
                DELETE
              </Button>
              <Button
                variant="transparent"
                onClick={() => setDeletingCourseId(null)}
                className="flex-1"
              >
                CANCEL
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Course Grid */}
      {isLoading ? (
        <p className="text-foreground/50 font-sans">Loading courses...</p>
      ) : courses?.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen className="w-12 h-12 mx-auto text-foreground/20 mb-4" />
          <p className="text-foreground/50 font-sans">No courses yet. Create your first course!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses?.map((course, i) => (
            <Link key={course.id} to={`/courses/${course.id}`} className="block">
              <article
                className={`card-hover rounded-3xl overflow-hidden flex flex-col h-full ${colors[i % colors.length]}`}
              >
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground/60">
                      {course.instructor_name}
                    </span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        copyJoinCode(course.join_code);
                      }}
                      className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider bg-foreground/10 px-2 py-1 rounded-full hover:bg-foreground/20 transition-colors"
                    >
                      {copiedCode === course.join_code ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      {course.join_code}
                    </button>
                  </div>

                  <h2 className="text-2xl md:text-3xl leading-[0.85] mb-3 font-sans font-extrabold tracking-tighter uppercase">
                    {course.title}
                  </h2>

                  {course.description && (
                    <p className="text-sm text-foreground/70 font-serif mb-4 line-clamp-2">
                      {course.description}
                    </p>
                  )}

                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-foreground/60 font-sans">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {(course.course_enrollments as any)?.[0]?.count ?? 0} students
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" />
                        {(course.sessions as any)?.[0]?.count ?? 0} sessions
                      </span>
                    </div>
                    {isInstructor && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => openEdit(course, e)}
                          className="p-2 rounded-full hover:bg-foreground/10 transition-colors"
                          title="Edit course"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setDeletingCourseId(course.id);
                          }}
                          className="p-2 rounded-full hover:bg-accent-red/20 transition-colors text-accent-red"
                          title="Delete course"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Courses;
