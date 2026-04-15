import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Calendar, Users, Palette, Lock, Globe, DollarSign } from "lucide-react";
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

const COURSE_TYPES = [
  { value: "private", label: "Private", icon: Lock },
  { value: "free", label: "Free", icon: Globe },
  { value: "paid", label: "Paid", icon: DollarSign },
] as const;

type CourseType = "private" | "free" | "paid";

const CreateCourse = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch instructor name from profile
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", user!.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  const instructorName = profile?.display_name || user?.email || "Instructor";

  // Course fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0].class);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [courseType, setCourseType] = useState<CourseType>("free");
  const [price, setPrice] = useState("");

  // Inline editing
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mock stats
  const enrolledCount = 0;
  const attendanceCount = 0;

  useEffect(() => {
    if (editingTitle && titleRef.current) titleRef.current.focus();
  }, [editingTitle]);

  useEffect(() => {
    if (editingDesc && descRef.current) descRef.current.focus();
  }, [editingDesc]);

  // Close color picker on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target as Node)) {
        setColorPickerOpen(false);
      }
    };
    if (colorPickerOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [colorPickerOpen]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = "Course title is required";
    if (!description.trim()) errs.description = "Description is required";
    if (!startDate) errs.startDate = "Start date is required";
    if (courseType === "paid" && (!price || parseFloat(price) <= 0)) {
      errs.price = "Price must be greater than 0";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      const { data: course, error } = await supabase
        .from("courses")
        .insert({
          title,
          description,
          instructor_name: instructorName,
          user_id: user!.id,
          color: selectedColor,
          start_date: startDate,
          course_type: courseType,
          price: courseType === "paid" ? parseFloat(price) : 0,
        })
        .select()
        .single();
      if (error) throw error;
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

      {/* Course Type Toggle */}
      <div className="mb-6">
        <label className="text-xs font-bold uppercase tracking-wider text-foreground/60 mb-2 block">
          Course Type
        </label>
        <div className="inline-flex rounded-2xl bg-muted p-1 gap-1">
          {COURSE_TYPES.map((ct) => (
            <button
              key={ct.value}
              onClick={() => setCourseType(ct.value)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                courseType === ct.value
                  ? "bg-foreground text-background shadow-sm"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              <ct.icon className="w-3.5 h-3.5" />
              {ct.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price input for paid courses */}
      {courseType === "paid" && (
        <div className="mb-6">
          <label className="text-xs font-bold uppercase tracking-wider text-foreground/60 mb-1 block">
            Price (USD) *
          </label>
          <div className="relative w-48">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full pl-8 pr-4 py-3 rounded-2xl bg-muted border-none text-foreground font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="29.99"
              min="0"
              step="0.01"
            />
          </div>
          {errors.price && <p className="text-accent-red text-xs mt-1 font-sans">{errors.price}</p>}
        </div>
      )}

      {/* Live Preview Card — matches SessionCard layout exactly */}
      <div className={`rounded-3xl overflow-hidden flex flex-col transition-colors duration-300 relative ${selectedColor}`}>
        {/* Top bar — same as SessionCard */}
        <div className="p-5 pb-0 flex items-center justify-between">
          <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border-2 border-foreground/20 ${
            courseType === "private" ? "bg-foreground/10" :
            courseType === "paid" ? "bg-vibrant-yellow text-foreground" :
            "bg-vibrant-mint text-foreground"
          }`}>
            {courseType === "private" ? "PRIVATE" : courseType === "paid" ? "PAID" : "FREE"}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-foreground/60">
            {startDate ? new Date(startDate + "T00:00:00").toLocaleDateString() : "NO DATE"}
          </span>
        </div>

        {/* Content — same as SessionCard */}
        <div className="p-5 md:p-6 flex flex-col flex-1">
          {/* Inline editable title */}
          {editingTitle ? (
            <input
              ref={titleRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setEditingTitle(false)}
              onKeyDown={(e) => e.key === "Enter" && setEditingTitle(false)}
              className="text-3xl md:text-4xl font-extrabold uppercase tracking-tighter leading-[0.85] font-sans mb-3 bg-transparent border-none outline-none w-full placeholder:text-foreground/30"
              placeholder="COURSE TITLE"
            />
          ) : (
            <h2
              onClick={() => setEditingTitle(true)}
              className="text-3xl md:text-4xl leading-[0.85] mb-3 font-sans font-extrabold tracking-tighter cursor-text hover:opacity-70 transition-opacity"
            >
              {title || <span className="text-foreground/30">COURSE TITLE</span>}
            </h2>
          )}
          {errors.title && <p className="text-accent-red text-xs mb-2 font-sans">{errors.title}</p>}

          {/* Instructor — same as SessionCard */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-foreground/20 flex items-center justify-center text-xs font-bold">
              {instructorName.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-foreground/70">{instructorName}</span>
          </div>

          {/* Meta — same as SessionCard */}
          <div className="flex items-center gap-4 text-sm text-foreground/60 mb-4 font-sans">
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{startDate || "Set date"}</span>
            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{enrolledCount}/{attendanceCount}</span>
          </div>

          {/* Inline editable description */}
          {editingDesc ? (
            <textarea
              ref={descRef}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => setEditingDesc(false)}
              rows={2}
              className="text-sm font-serif mb-4 bg-transparent border-none outline-none w-full resize-none placeholder:text-foreground/30"
              placeholder="Click to add course description..."
            />
          ) : (
            <p
              onClick={() => setEditingDesc(true)}
              className="text-sm text-foreground/70 font-serif mb-4 line-clamp-2 cursor-text hover:opacity-70 transition-opacity"
            >
              {description || <span className="text-foreground/30">Click to add course description...</span>}
            </p>
          )}
          {errors.description && <p className="text-accent-red text-xs mb-2 font-sans">{errors.description}</p>}

          <div className="mt-auto flex items-center justify-between">
            <Button
              variant="filled"
              className="text-xs py-2 px-5 self-start"
              showArrow
            >
              VIEW COURSE
            </Button>
            {/* Color picker */}
            <div className="relative" ref={colorPickerRef}>
              <button
                onClick={() => setColorPickerOpen(!colorPickerOpen)}
                className="w-8 h-8 rounded-full bg-foreground/10 hover:bg-foreground/20 transition-colors flex items-center justify-center"
              >
                <Palette className="w-4 h-4" />
              </button>
              {colorPickerOpen && (
                <div className="absolute right-0 bottom-10 bg-background rounded-2xl shadow-lg p-3 grid grid-cols-4 gap-2 z-10">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.class}
                      onClick={() => {
                        setSelectedColor(c.class);
                        setColorPickerOpen(false);
                      }}
                      className={`w-8 h-8 rounded-full ${c.class} border-2 transition-all ${
                        selectedColor === c.class
                          ? "border-foreground scale-110"
                          : "border-transparent hover:scale-105"
                      }`}
                      title={c.name}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Fields */}
      <div className="space-y-6 mb-10">
        {/* Start Date */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-foreground/60 mb-1 block">
            Start Date *
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full max-w-xs px-4 py-3 rounded-2xl bg-muted border-none text-foreground font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.startDate && <p className="text-accent-red text-xs mt-1 font-sans">{errors.startDate}</p>}
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
