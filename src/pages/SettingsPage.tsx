import { useState } from "react";
import Button from "@/components/Button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState<"profile" | "notifications" | "billing">("profile");
  const tabs = ["profile", "notifications", "billing"] as const;
  const { user, roles, refreshRoles } = useAuth();

  const [inviteCode, setInviteCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);

  const currentRole = roles.includes("instructor")
    ? "Instructor"
    : roles.includes("student")
    ? "Student"
    : "Viewer";

  const handleRedeemCode = async () => {
    if (!inviteCode.trim()) {
      toast.error("Please enter an invitation code.");
      return;
    }
    setRedeeming(true);
    try {
      const { data, error } = await supabase.rpc("redeem_invitation_code", {
        p_code: inviteCode.trim(),
      });
      if (error) throw error;

      switch (data) {
        case "SUCCESS":
          toast.success("Role updated successfully!");
          await refreshRoles();
          setInviteCode("");
          break;
        case "INVALID_CODE":
          toast.error("Invalid or expired invitation code.");
          break;
        case "ALREADY_HAS_ROLE":
          toast.error("You already have this role.");
          break;
        case "CANNOT_DOWNGRADE":
          toast.error("Cannot downgrade from your current role.");
          break;
        default:
          toast.error("Something went wrong.");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to redeem code.");
    } finally {
      setRedeeming(false);
    }
  };

  const displayName = user?.user_metadata?.display_name || user?.email || "User";

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-5xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.8] font-sans">
          SETTINGS
        </h1>
        <p className="text-base text-foreground/60 mt-3 font-serif">
          Manage your account, notifications, and preferences.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3 mb-8">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`nav-text px-5 py-2.5 rounded-full border-2 border-foreground transition-all duration-200 ${
              activeTab === tab
                ? "bg-foreground text-background"
                : "bg-transparent text-foreground hover:bg-foreground hover:text-background"
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="space-y-8 max-w-2xl">
          <div className="rounded-3xl bg-vibrant-purple p-8">
            <h2 className="text-xl font-extrabold uppercase tracking-tight font-sans mb-6">PROFILE INFORMATION</h2>
            <div className="space-y-5">
              <div>
                <label className="nav-text text-foreground/60 block mb-2">FULL NAME</label>
                <input
                  type="text"
                  defaultValue={displayName}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-foreground/20 bg-transparent text-foreground font-sans focus:outline-none focus:border-foreground/40"
                />
              </div>
              <div>
                <label className="nav-text text-foreground/60 block mb-2">EMAIL</label>
                <input
                  type="email"
                  defaultValue={user?.email || ""}
                  disabled
                  className="w-full px-4 py-3 rounded-2xl border-2 border-foreground/20 bg-transparent text-foreground/50 font-sans focus:outline-none"
                />
              </div>
              <div>
                <label className="nav-text text-foreground/60 block mb-2">CURRENT ROLE</label>
                <div className="px-4 py-3 rounded-2xl border-2 border-foreground/20 bg-transparent text-foreground font-sans font-bold">
                  {currentRole}
                </div>
              </div>
              <Button variant="filled" showArrow={false}>SAVE CHANGES</Button>
            </div>
          </div>

          {/* Invitation Code Section */}
          <div className="rounded-3xl bg-muted p-8">
            <h2 className="text-xl font-extrabold uppercase tracking-tight font-sans mb-2">REDEEM INVITATION CODE</h2>
            <p className="text-sm text-foreground/50 font-serif mb-6">
              Enter a code to upgrade your account role.
            </p>
            <div className="flex gap-3">
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Enter Invitation Code"
                className="flex-1 px-4 py-3 rounded-2xl border-2 border-foreground/20 bg-transparent text-foreground font-sans focus:outline-none focus:border-foreground/40 placeholder:text-foreground/30"
                onKeyDown={(e) => e.key === "Enter" && handleRedeemCode()}
              />
              <Button variant="filled" showArrow={false} onClick={handleRedeemCode} disabled={redeeming}>
                {redeeming ? "REDEEMING..." : "REDEEM CODE"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <div className="rounded-3xl bg-vibrant-yellow p-8 max-w-2xl">
          <h2 className="text-xl font-extrabold uppercase tracking-tight font-sans mb-6">NOTIFICATION PREFERENCES</h2>
          <div className="space-y-4">
            {["Email notifications for new enrollments", "Push alerts before sessions start", "Weekly analytics summary", "Assignment submission alerts"].map((item, i) => (
              <label key={i} className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked={i < 3} className="w-5 h-5 rounded accent-foreground" />
                <span className="text-sm font-sans">{item}</span>
              </label>
            ))}
            <div className="pt-2">
              <Button variant="filled" showArrow={false}>SAVE PREFERENCES</Button>
            </div>
          </div>
        </div>
      )}

      {/* Billing Tab */}
      {activeTab === "billing" && (
        <div className="rounded-3xl bg-vibrant-mint p-8 max-w-2xl">
          <h2 className="text-xl font-extrabold uppercase tracking-tight font-sans mb-6">BILLING & PLAN</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-foreground/10 pb-3">
              <span className="text-sm font-sans text-foreground/60">Current Plan</span>
              <span className="font-bold font-sans">Pro Instructor</span>
            </div>
            <div className="flex justify-between items-center border-b border-foreground/10 pb-3">
              <span className="text-sm font-sans text-foreground/60">Billing Cycle</span>
              <span className="font-bold font-sans">Monthly</span>
            </div>
            <div className="flex justify-between items-center border-b border-foreground/10 pb-3">
              <span className="text-sm font-sans text-foreground/60">Next Invoice</span>
              <span className="font-bold font-sans">May 1, 2026</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-sans text-foreground/60">Amount</span>
              <span className="font-bold font-sans text-xl">$49/mo</span>
            </div>
            <div className="pt-2">
              <Button variant="transparent" showArrow={false}>MANAGE BILLING</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
