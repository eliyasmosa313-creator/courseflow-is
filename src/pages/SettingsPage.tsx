import { useState } from "react";
import Button from "@/components/Button";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState<"profile" | "notifications" | "billing">("profile");
  const tabs = ["profile", "notifications", "billing"] as const;

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
        <div className="rounded-3xl bg-vibrant-purple p-8 max-w-2xl">
          <h2 className="text-xl font-extrabold uppercase tracking-tight font-sans mb-6">PROFILE INFORMATION</h2>
          <div className="space-y-5">
            <div>
              <label className="nav-text text-foreground/60 block mb-2">FULL NAME</label>
              <input
                type="text"
                defaultValue="Dr. Elena Martinez"
                className="w-full px-4 py-3 rounded-2xl border-2 border-foreground/20 bg-transparent text-foreground font-sans focus:outline-none focus:border-foreground/40"
              />
            </div>
            <div>
              <label className="nav-text text-foreground/60 block mb-2">EMAIL</label>
              <input
                type="email"
                defaultValue="elena@courseflow.io"
                className="w-full px-4 py-3 rounded-2xl border-2 border-foreground/20 bg-transparent text-foreground font-sans focus:outline-none focus:border-foreground/40"
              />
            </div>
            <div>
              <label className="nav-text text-foreground/60 block mb-2">ROLE</label>
              <input
                type="text"
                defaultValue="Senior Instructor"
                className="w-full px-4 py-3 rounded-2xl border-2 border-foreground/20 bg-transparent text-foreground font-sans focus:outline-none focus:border-foreground/40"
              />
            </div>
            <Button variant="filled" showArrow={false}>SAVE CHANGES</Button>
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
