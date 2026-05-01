import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Lock, Globe, DollarSign, Check } from "lucide-react";
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
  const [startDate, setStartDate] = useState("");
  const [courseType, setCourseType] = useState<CourseType>("free");
  const [price, setPrice] = useState("");

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    <div className="max-w-3xl">
      <Link
        to="/courses"
        className="inline-flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors mb-6 nav-text"
      >
        <ArrowLeft className="w-4 h-4" /> BACK TO COURSES
      </Link>

      <div className="mb-8">
        <h1 className="text-5xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.8] font-sans">
          NEW COURSE
        </h1>
        <p className="text-base text-foreground/60 mt-3 font-serif">
          Fill in the details below to publish a new course.
        </p>
      </div>

      <div className="rounded-3xl bg-muted p-6 md:p-8 space-y-8">
        {/* Title */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-foreground/60 mb-2 block">
            Course Title <span className="text-accent-red">*</span>
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Advanced React Patterns"
            className="w-full px-4 py-3 rounded-2xl bg-background border-2 border-transparent text-foreground font-sans text-sm focus:outline-none focus:border-foreground transition-colors"
          />
          {errors.title && <p className="text-accent-red text-xs mt-1 font-sans">{errors.title}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-foreground/60 mb-2 block">
            Description <span className="text-accent-red">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="What will students learn in this course?"
            className="w-full px-4 py-3 rounded-2xl bg-background border-2 border-transparent text-foreground font-sans text-sm focus:outline-none focus:border-foreground transition-colors resize-none"
          />
          {errors.description && <p className="text-accent-red text-xs mt-1 font-sans">{errors.description}</p>}
        </div>

        {/* Start Date */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-foreground/60 mb-2 block">
            Start Date <span className="text-accent-red">*</span>
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full max-w-xs px-4 py-3 rounded-2xl bg-background border-2 border-transparent text-foreground font-sans text-sm focus:outline-none focus:border-foreground transition-colors"
          />
          {errors.startDate && <p className="text-accent-red text-xs mt-1 font-sans">{errors.startDate}</p>}
        </div>

        {/* Course Type */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-foreground/60 mb-2 block">
            Course Type
          </label>
          <div className="flex flex-wrap gap-2">
            {COURSE_TYPES.map((ct) => {
              const active = courseType === ct.value;
              return (
                <button
                  key={ct.value}
                  type="button"
                  onClick={() => setCourseType(ct.value)}
                  className={`nav-text inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-foreground transition-all duration-200 ${
                    active
                      ? "bg-foreground text-background"
                      : "bg-transparent text-foreground hover:bg-foreground hover:text-background"
                  }`}
                >
                  <ct.icon className="w-3.5 h-3.5" />
                  {ct.label.toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Price (only for paid) */}
        {courseType === "paid" && (
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-foreground/60 mb-2 block">
              Price (USD) <span className="text-accent-red">*</span>
            </label>
            <div className="relative w-48">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full pl-9 pr-4 py-3 rounded-2xl bg-background border-2 border-transparent text-foreground font-sans text-sm focus:outline-none focus:border-foreground transition-colors"
                placeholder="29.99"
                min="0"
                step="0.01"
              />
            </div>
            {errors.price && <p className="text-accent-red text-xs mt-1 font-sans">{errors.price}</p>}
          </div>
        )}

        {/* Card Color */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-foreground/60 mb-2 block">
            Card Color
          </label>
          <div className="flex flex-wrap gap-3">
            {COLOR_OPTIONS.map((c) => {
              const active = selectedColor === c.class;
              return (
                <button
                  key={c.class}
                  type="button"
                  onClick={() => setSelectedColor(c.class)}
                  title={c.name}
                  className={`w-10 h-10 rounded-full ${c.class} flex items-center justify-center transition-all border-2 ${
                    active ? "border-foreground scale-110" : "border-foreground/10 hover:border-foreground/40"
                  }`}
                >
                  {active && <Check className="w-4 h-4 text-foreground" strokeWidth={3} />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-6 mb-10">
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
  );
};

export default CreateCourse;
