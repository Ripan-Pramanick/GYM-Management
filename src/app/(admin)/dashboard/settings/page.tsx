export const instant = false;

import { Building2, User, Bell, Shield, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";

export default async function SettingsPage() {
  await connection();
  const supabase = await createClient();

  const { data: branch } = await supabase.from('branches').select('*').limit(1).single();

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
          <div className="bg-brand-card border border-white/5 rounded-2xl p-6 md:p-8 max-w-3xl">
            <h2 className="text-xl font-bold text-white mb-6">Branch Information</h2>
            
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-brand-gray">Gym/Branch Name</label>
                  <Input defaultValue={branch?.name} className="bg-[#09090b] border-white/10 text-white h-12 rounded-xl focus:border-brand-red focus:ring-brand-red/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-brand-gray">Location / City</label>
                  <Input defaultValue={branch?.location} className="bg-[#09090b] border-white/10 text-white h-12 rounded-xl focus:border-brand-red focus:ring-brand-red/20" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-brand-gray">Full Address</label>
                <Input defaultValue="123 Fitness Street, Kolkata, West Bengal, India" className="bg-[#09090b] border-white/10 text-white h-12 rounded-xl focus:border-brand-red focus:ring-brand-red/20" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-brand-gray">Contact Email</label>
                  <Input defaultValue="info@fitcore.com" className="bg-[#09090b] border-white/10 text-white h-12 rounded-xl focus:border-brand-red focus:ring-brand-red/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-brand-gray">Contact Phone</label>
                  <Input defaultValue="+91 98765 43210" className="bg-[#09090b] border-white/10 text-white h-12 rounded-xl focus:border-brand-red focus:ring-brand-red/20" />
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 flex justify-end">
              <Button className="bg-brand-red hover:bg-red-700 text-white font-bold h-11 px-8 rounded-xl shadow-lg shadow-brand-red/20">
                <Save className="mr-2 h-4 w-4" /> Save Changes
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <div className="bg-brand-card border border-white/5 rounded-2xl p-6 md:p-8 max-w-3xl">
            <h2 className="text-xl font-bold text-white mb-6">Security & Preferences</h2>
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-brand-gray">Current Password</label>
                <Input type="password" placeholder="••••••••" className="bg-[#09090b] border-white/10 text-white h-12 rounded-xl focus:border-brand-red focus:ring-brand-red/20" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-brand-gray">New Password</label>
                <Input type="password" placeholder="••••••••" className="bg-[#09090b] border-white/10 text-white h-12 rounded-xl focus:border-brand-red focus:ring-brand-red/20" />
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-white/5 flex justify-end">
              <Button className="bg-[#09090b] border border-white/10 text-white hover:bg-white/5 font-bold h-11 px-8 rounded-xl">
                Update Password
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}