export const instant = false;

import Link from "next/link";
import { Plus, Search, UserCircle, IndianRupee, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";

export default async function StaffPage() {
  await connection();
  const supabase = await createClient();

  
  const { data: staffList } = await supabase
    .from('staff')
    .select(`
      id, job_title, specialization, base_salary, status,
      profiles (full_name, phone, role)
    `);

  
  const { data: payrollList } = await supabase
    .from('payroll')
    .select(`
      id, month, base_amount, commission, total_amount, payment_status, payment_date,
      staff (
        job_title,
        profiles (full_name)
      )
    `)
    .order('payment_status', { ascending: false });


  const activeStaffCount = staffList?.filter(s => s.status?.toLowerCase() === 'active').length || 0;
  
 
  const trainersCount = staffList?.filter(s => {
    const profile = Array.isArray(s.profiles) ? s.profiles[0] : s.profiles;
    return profile?.role === 'trainer' && s.status?.toLowerCase() === 'active';
  }).length || 0;

  const pendingPayroll = payrollList?.filter(p => p.payment_status?.toLowerCase() === 'pending')
                                     .reduce((sum, p) => sum + Number(p.total_amount), 0) || 0;

 
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="space-y-8">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Staff & Payroll</h1>
          <p className="text-brand-gray text-sm">Manage your team members, roles, and monthly salaries.</p>
        </div>
        <Link href="/dashboard/staff/new">
          <Button className="bg-brand-red hover:bg-red-700 text-white font-bold h-11 px-6 rounded-xl shadow-lg shadow-brand-red/20">
            <Plus className="mr-2 h-5 w-5" /> Add Staff Member
          </Button>
        </Link>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-brand-card border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500"><UserCircle className="h-5 w-5" /></div>
          </div>
          <h3 className="text-brand-gray text-sm font-medium mb-1">Total Active Staff</h3>
          <p className="text-3xl font-bold text-white">{activeStaffCount}</p>
        </div>
        <div className="bg-brand-card border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500"><ShieldCheck className="h-5 w-5" /></div>
          </div>
          <h3 className="text-brand-gray text-sm font-medium mb-1">Active Trainers</h3>
          <p className="text-2xl font-bold text-white mb-1">{trainersCount}</p>
        </div>
        <div className="bg-brand-card border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500"><IndianRupee className="h-5 w-5" /></div>
          </div>
          <h3 className="text-brand-gray text-sm font-medium mb-1">Pending Payroll</h3>
          <p className="text-2xl font-bold text-orange-500 mb-1">{formatCurrency(pendingPayroll)}</p>
        </div>
      </div>

  
      <Tabs defaultValue="team" className="w-full">
        <TabsList className="bg-[#09090b] border border-white/5 p-1 rounded-xl mb-6">
          <TabsTrigger value="team" className="rounded-lg data-[state=active]:bg-brand-card data-[state=active]:text-white text-brand-gray">Team Members</TabsTrigger>
          <TabsTrigger value="payroll" className="rounded-lg data-[state=active]:bg-brand-card data-[state=active]:text-white text-brand-gray">Payroll Ledger</TabsTrigger>
        </TabsList>

        
        <TabsContent value="team" className="space-y-4">
          <div className="flex gap-4 bg-brand-card p-4 rounded-2xl border border-white/5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-gray" />
              <Input placeholder="Search staff by name or role..." className="pl-10 bg-[#09090b] border-white/10 text-white h-11 w-full md:max-w-md rounded-xl" />
            </div>
          </div>
          <div className="bg-brand-card border border-white/5 rounded-2xl overflow-hidden">
            <Table>
              <TableHeader className="bg-[#09090b]/50 border-b border-white/5">
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="text-brand-gray font-semibold">Name</TableHead>
                  <TableHead className="text-brand-gray font-semibold">Role</TableHead>
                  <TableHead className="text-brand-gray font-semibold">Specialization</TableHead>
                  <TableHead className="text-brand-gray font-semibold">Contact</TableHead>
                  <TableHead className="text-brand-gray font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffList?.map((member: any) => {
                  const profile = Array.isArray(member.profiles) ? member.profiles[0] : member.profiles;
                  return (
                    <TableRow key={member.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <TableCell className="font-medium text-white">{profile?.full_name}</TableCell>
                      <TableCell className="text-brand-gray">{member.job_title}</TableCell>
                      <TableCell className="text-brand-gray">{member.specialization || '-'}</TableCell>
                      <TableCell className="text-brand-gray">{profile?.phone}</TableCell>
                      <TableCell>
                        <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-semibold px-3 py-1 capitalize">
                          {member.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            {(!staffList || staffList.length === 0) && (
              <div className="p-8 text-center text-brand-gray">No staff members found.</div>
            )}
          </div>
        </TabsContent>

        
        <TabsContent value="payroll" className="space-y-4">
          <div className="flex gap-4 bg-brand-card p-4 rounded-2xl border border-white/5 justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-gray" />
              <Input placeholder="Search payroll records..." className="pl-10 bg-[#09090b] border-white/10 text-white h-11 w-full md:max-w-md rounded-xl" />
            </div>
            <Button className="bg-[#09090b] border border-white/10 text-white h-11 rounded-xl hover:bg-white/5">Process Payroll</Button>
          </div>
          <div className="bg-brand-card border border-white/5 rounded-2xl overflow-hidden">
            <Table>
              <TableHeader className="bg-[#09090b]/50 border-b border-white/5">
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="text-brand-gray font-semibold">Staff Member</TableHead>
                  <TableHead className="text-brand-gray font-semibold">Role</TableHead>
                  <TableHead className="text-brand-gray font-semibold text-right">Base Salary</TableHead>
                  <TableHead className="text-brand-gray font-semibold text-right">Commission</TableHead>
                  <TableHead className="text-brand-gray font-semibold text-right">Total Payable</TableHead>
                  <TableHead className="text-brand-gray font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrollList?.map((record: any) => {
                  const staffInfo = Array.isArray(record.staff) ? record.staff[0] : record.staff;
                  const profileInfo = Array.isArray(staffInfo?.profiles) ? staffInfo?.profiles[0] : staffInfo?.profiles;
                  
                  return (
                    <TableRow key={record.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <TableCell className="font-medium text-white">{profileInfo?.full_name}</TableCell>
                      <TableCell className="text-brand-gray">{staffInfo?.job_title}</TableCell>
                      <TableCell className="text-right text-brand-gray">{formatCurrency(record.base_amount)}</TableCell>
                      <TableCell className="text-right text-brand-gray">{formatCurrency(record.commission)}</TableCell>
                      <TableCell className="text-right font-bold text-white">{formatCurrency(record.total_amount)}</TableCell>
                      <TableCell>
                        <Badge className={`${record.payment_status?.toLowerCase() === 'paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'} border-none font-semibold px-3 py-1 capitalize`}>
                          {record.payment_status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            {(!payrollList || payrollList.length === 0) && (
              <div className="p-8 text-center text-brand-gray">No payroll records found.</div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}