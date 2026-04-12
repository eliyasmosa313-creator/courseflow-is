import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  colorClass?: string;
  suffix?: string;
}

const StatCard = ({ label, value, icon: Icon, colorClass = "bg-vibrant-purple", suffix }: StatCardProps) => {
  return (
    <div className={cn("rounded-3xl p-6 card-hover", colorClass)}>
      <div className="flex items-start justify-between mb-4">
        <Icon className="w-6 h-6 text-foreground/70" />
      </div>
      <p className="text-4xl md:text-5xl font-extrabold tracking-tighter font-sans">
        {value}{suffix}
      </p>
      <p className="nav-text text-foreground/60 mt-2">{label}</p>
    </div>
  );
};

export default StatCard;
