"use client";

import { useState, useEffect, useMemo } from "react";
import { Building2, User, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createBrowserClient } from "@supabase/ssr";

export default function SettingsPage() {
  const [branchId, setBranchId] = useState<string | null>(null);
  const [name, setName] = useState("FITCORE");
  const [location, setLocation] = useState("Kolkata");
  const [address, setAddress] = useState("123 Fitness Street, Kolkata, West Bengal, India");
  const [email, setEmail] = useState("info@fitcore.com");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
  );

  useEffect(() => {
    const fetchBranch = async () => {
      setIsLoading(true);
      const { data } = await supabase
        .from("branches")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (data) {
        setBranchId(data.id);
        if (data.name) setName(data.name);
        if (data.location) setLocation(data.location);
        if (data.address) setAddress(data.address);
        if (data.email) setEmail(data.email);
        if (data.phone) setPhone(data.phone);
      }
      setIsLoading(false);
    };

    fetchBranch();
  }, [supabase]);

  const handleSaveBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);

      const payload = {
        name,
        location,
        address,
        email,
        phone,
      };

      if (branchId) {
        const { error } = await supabase
          .from("branches")
          .update(payload)
          .eq("id", branchId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("branches")
          .insert([payload])
          .select()
          .single();

        if (error) throw error;
        if (data) setBranchId(data.id);
      }

      alert("Gym settings saved successfully!");
    } catch (error: any) {
      alert("Failed to save settings: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      alert("Please fill in both current and new password fields.");
      return;
    }
    if (newPassword.length < 6) {
      alert("New password must be at least 6 characters long.");
      return;
    }

    try {
      setIsUpdatingPassword(true);

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user?.email) {
        throw new Error("Unable to verify logged-in admin account.");
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userData.user.email,
        password: currentPassword,
      });

      if (signInError) {
        throw new Error("Current password is incorrect.");
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      setCurrentPassword("");
      setNewPassword("");
      alert("Password updated successfully!");
    } catch (error: any) {
      alert("Failed to update password: " + error.message);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Settings</h1>
        <p className="text-brand-gray text-sm">Manage your gym profile and system configurations.</p>
      </div>

      <Tabs defaultValue="gym" className="w-full">
        <TabsList className="bg-[#09090b] border border-white/5 p-1 rounded-xl mb-8 flex w-full max-w-md">
          <TabsTrigger value="gym" className="flex-1 rounded-lg data-[state=active]:bg-brand-card data-[state=active]:text-white text-brand-gray">
            <Building2 className="w-4 h-4 mr-2" /> Gym Profile
          </TabsTrigger>
          <TabsTrigger value="account" className="flex-1 rounded-lg data-[state=active]:bg-brand-card data-[state=active]:text-white text-brand-gray">
            <User className="w-4 h-4 mr-2" /> Admin Account
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gym" className="space-y-6">
          <form onSubmit={handleSaveBranch} className="bg-brand-card border border-white/5 rounded-2xl p-6 md:p-8 max-w-3xl">
            <h2 className="text-xl font-bold text-white mb-6">Branch Information</h2>

            {isLoading ? (
              <div className="py-8 text-center text-brand-gray">Loading branch settings...</div>
            ) : (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-brand-gray">Gym/Branch Name</label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="bg-[#09090b] border-white/10 text-white h-12 rounded-xl focus:border-brand-red focus:ring-brand-red/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-brand-gray">Location / City</label>
                    <Input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="bg-[#09090b] border-white/10 text-white h-12 rounded-xl focus:border-brand-red focus:ring-brand-red/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-brand-gray">Full Address</label>
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="bg-[#09090b] border-white/10 text-white h-12 rounded-xl focus:border-brand-red focus:ring-brand-red/20"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-brand-gray">Contact Email</label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-[#09090b] border-white/10 text-white h-12 rounded-xl focus:border-brand-red focus:ring-brand-red/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-brand-gray">Contact Phone</label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="bg-[#09090b] border-white/10 text-white h-12 rounded-xl focus:border-brand-red focus:ring-brand-red/20"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-white/5 flex justify-end">
              <Button
                type="submit"
                disabled={isLoading || isSaving}
                className="bg-brand-red hover:bg-red-700 text-white font-bold h-11 px-8 rounded-xl shadow-lg shadow-brand-red/20 disabled:opacity-70"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <form onSubmit={handleUpdatePassword} className="bg-brand-card border border-white/5 rounded-2xl p-6 md:p-8 max-w-3xl">
            <h2 className="text-xl font-bold text-white mb-6">Security & Preferences</h2>
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-brand-gray">Current Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-[#09090b] border-white/10 text-white h-12 rounded-xl focus:border-brand-red focus:ring-brand-red/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-brand-gray">New Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-[#09090b] border-white/10 text-white h-12 rounded-xl focus:border-brand-red focus:ring-brand-red/20"
                />
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-white/5 flex justify-end">
              <Button
                type="submit"
                disabled={isUpdatingPassword}
                className="bg-[#09090b] border border-white/10 text-white hover:bg-white/5 font-bold h-11 px-8 rounded-xl disabled:opacity-70"
              >
                {isUpdatingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}