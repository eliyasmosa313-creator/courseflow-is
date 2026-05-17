import { useEffect, useState } from "react";
import { Bell, Check, BookOpen, ClipboardList, FileText, Megaphone } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const typeIcons: Record<string, any> = {
  session: BookOpen,
  assignment: ClipboardList,
  material: FileText,
  announcement: Megaphone,
};

const NotificationsBell = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: notifications } = useQuery({
    queryKey: ["notifications", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        () => queryClient.invalidateQueries({ queryKey: ["notifications", user.id] })
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, queryClient]);

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] }),
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      await supabase.from("notifications").update({ is_read: true }).eq("user_id", user!.id).eq("is_read", false);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] }),
  });

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-notifications-bell]")) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const formatTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    return `${d}d ago`;
  };

  return (
    <div className="relative" data-notifications-bell>
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-2 rounded-full hover:bg-muted transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 min-w-[18px] h-[18px] px-1 bg-accent-red text-background text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[360px] max-w-[calc(100vw-2rem)] bg-background border border-foreground/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-foreground/10">
            <h3 className="text-sm font-extrabold uppercase tracking-wider font-sans">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead.mutate()}
                className="text-xs font-bold uppercase tracking-wider text-foreground/60 hover:text-foreground transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {!notifications || notifications.length === 0 ? (
              <div className="px-4 py-12 text-center text-sm text-foreground/50 font-serif">
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => {
                const Icon = typeIcons[n.type] || Bell;
                const content = (
                  <div className={cn(
                    "flex gap-3 px-4 py-3 border-b border-foreground/5 hover:bg-muted transition-colors cursor-pointer",
                    !n.is_read && "bg-primary/5"
                  )}>
                    <div className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0",
                      n.type === "announcement" ? "bg-vibrant-yellow" :
                      n.type === "assignment" ? "bg-vibrant-coral" :
                      n.type === "material" ? "bg-vibrant-mint" :
                      "bg-vibrant-blue"
                    )}>
                      <Icon className="w-4 h-4 text-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold font-sans truncate">{n.title}</p>
                      {n.message && (
                        <p className="text-xs text-foreground/60 font-serif line-clamp-2 mt-0.5">{n.message}</p>
                      )}
                      <p className="text-[10px] uppercase tracking-wider text-foreground/40 mt-1 font-bold">{formatTime(n.created_at)}</p>
                    </div>
                    {!n.is_read && (
                      <span className="w-2 h-2 rounded-full bg-accent-red mt-2 flex-shrink-0" />
                    )}
                  </div>
                );
                const handleClick = () => {
                  if (!n.is_read) markRead.mutate(n.id);
                  setOpen(false);
                };
                return n.link ? (
                  <Link key={n.id} to={n.link} onClick={handleClick}>{content}</Link>
                ) : (
                  <div key={n.id} onClick={handleClick}>{content}</div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsBell;
