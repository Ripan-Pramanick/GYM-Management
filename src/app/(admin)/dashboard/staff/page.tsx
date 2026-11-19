"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, UserCircle, IndianRupee, ShieldCheck, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createBrowserClient } from '@supabase/ssr';

export default function StaffPage() {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [payrollList, setPayrollList] = useState<any[]>([]);
  const [staffSearch, setStaffSearch] = useState("");
  const [payrollSearch, setPayrollSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);

    const { data: staffData } = await supabase
      .from('staff')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: payrollData } = await supabase
      .from('payroll')
      .select('*')
      .order('created_at', { ascending: false });

    if (staffData) setStaffList(staffData);
    if (payrollData) setPayrollList(payrollData);

    setIsLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleProcessPayroll = async () => {
    const activeStaff = staffList.filter((s) => s.status?.toLowerCase() === 'active');
    if (activeStaff.length === 0) {
      alert("No active staff members found to process payroll.");
      return;
    }

    try {
      setIsProcessing(true);
      const currentMonth = new Date().toISOString().slice(0, 7);

      const newRecords = activeStaff
        .filter((staff) => !payrollList.some((p) => p.staff_id === staff.id && p.month === currentMonth))
        .map((staff) => ({
          staff_id: staff.id,
          staff_name: staff.full_name,
          job_title: staff.job_title,
          month: currentMonth,
          base_amount: Number(staff.base_salary || 0),
          commission: 0,
          total_amount: Number(staff.base_salary || 0),
          payment_status: 'pending',
        }));

      if (newRecords.length === 0) {
        alert(`Payroll for ${currentMonth} is already generated for all active staff.`);
        return;
      }

      const { error } = await supabase.from('payroll').insert(newRecords);
      if (error) throw error;

      alert(`Generated payroll for ${newRecords.length} staff member(s) for ${currentMonth}!`);
      await fetchData();
    } catch (error: any) {
      console.error(error);
      alert("Failed to process payroll: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMarkPaid = async (payrollId: string) => {
    try {
      const { error } = await supabase
        .from('payroll')
        .update({
          payment_status: 'paid',
          payment_date: new Date().toISOString(),
        })
        .eq('id', payrollId);

      if (error) throw error;
      await fetchData();
    } catch (error: any) {
      console.error(error);
      alert("Failed to update payroll status: " + error.message);
    }
  };

  const filteredStaff = staffList.filter((member) => {
    const query = staffSearch.toLowerCase();
    return (
      (member.full_name?.toLowerCase() || "").includes(query) ||
      (member.job_title?.toLowerCase() || "").includes(query) ||
      (member.role?.toLowerCase() || "").includes(query)
    );
  });

  const filteredPayroll = payrollList.filter((record) => {
    const query = payrollSearch.toLowerCase();
    return (
      (record.staff_name?.toLowerCase() || "").includes(query) ||
      (record.job_title?.toLowerCase() || "").includes(query) ||
      (record.month?.toLowerCase() || "").includes(query)
    );
  });

  const activeStaffCount = staffList.filter((s) => s.status?.toLowerCase() === 'active').length;
  const trainersCount = staffList.filter(
    (s) => s.role?.toLowerCase() === 'trainer' && s.status?.toLowerCase() === 'active'
  ).length;
  const pendingPayroll = payrollList
    .filter((p) => p.payment_status?.toLowerCase() === 'pending')
    .reduce((sum, p) => sum + Number(p.total_amount || 0), 0);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

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
              <Input
                placeholder="Search staff by name or role..."
                value={staffSearch}
                onChange={(e) => setStaffSearch(e.target.value)}
                className="pl-10 bg-[#09090b] border-white/10 text-white h-11 w-full md:max-w-md rounded-xl focus-visible:ring-brand-red"
              />
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
                  <TableHead className="text-brand-gray font-semibold">Base Salary</TableHead>
                  <TableHead className="text-brand-gray font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-brand-gray">
                      Loading staff members...
                    </TableCell>
                  </TableRow>
                ) : filteredStaff.length > 0 ? (
                  filteredStaff.map((member: any) => (
                    <TableRow key={member.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <TableCell className="font-medium text-white">{member.full_name}</TableCell>
                      <TableCell className="text-brand-gray">{member.job_title}</TableCell>
                      <TableCell className="text-brand-gray">{member.specialization || '-'}</TableCell>
                      <TableCell className="text-brand-gray">{member.phone || 'N/A'}</TableCell>
                      <TableCell className="text-white font-medium">{formatCurrency(Number(member.base_salary || 0))}</TableCell>
                      <TableCell>
                        <Badge className={`${
                          member.status?.toLowerCase() === 'active'
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : 'bg-red-500/10 text-red-500'
                        } border-none font-semibold px-3 py-1 capitalize`}>
                          {member.status || 'active'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-brand-gray">
                      No staff members found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="payroll" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 bg-brand-card p-4 rounded-2xl border border-white/5 justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-gray" />
              <Input
                placeholder="Search payroll records..."
                value={payrollSearch}
                onChange={(e) => setPayrollSearch(e.target.value)}
                className="pl-10 bg-[#09090b] border-white/10 text-white h-11 w-full md:max-w-md rounded-xl focus-visible:ring-brand-red"
              />
            </div>
            <Button
              onClick={handleProcessPayroll}
              disabled={isProcessing}
              className="bg-brand-red hover:bg-red-700 text-white font-semibold h-11 px-5 rounded-xl"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Process Payroll"
              )}
            </Button>
          </div>
          <div className="bg-brand-card border border-white/5 rounded-2xl overflow-hidden">
            <Table>
              <TableHeader className="bg-[#09090b]/50 border-b border-white/5">
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="text-brand-gray font-semibold">Staff Member</TableHead>
                  <TableHead className="text-brand-gray font-semibold">Role</TableHead>
                  <TableHead className="text-brand-gray font-semibold">Month</TableHead>
                  <TableHead className="text-brand-gray font-semibold text-right">Base Salary</TableHead>
                  <TableHead className="text-brand-gray font-semibold text-right">Total Payable</TableHead>
                  <TableHead className="text-brand-gray font-semibold">Status</TableHead>
                  <TableHead className="text-brand-gray font-semibold text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-brand-gray">
                      Loading payroll records...
                    </TableCell>
                  </TableRow>
                ) : filteredPayroll.length > 0 ? (
                  filteredPayroll.map((record: any) => (
                    <TableRow key={record.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <TableCell className="font-medium text-white">{record.staff_name}</TableCell>
                      <TableCell className="text-brand-gray">{record.job_title}</TableCell>
                      <TableCell className="text-brand-gray">{record.month}</TableCell>
                      <TableCell className="text-right text-brand-gray">{formatCurrency(Number(record.base_amount || 0))}</TableCell>
                      <TableCell className="text-right font-bold text-white">{formatCurrency(Number(record.total_amount || 0))}</TableCell>
                      <TableCell>
                        <Badge className={`${
                          record.payment_status?.toLowerCase() === 'paid'
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : 'bg-orange-500/10 text-orange-500'
                        } border-none font-semibold px-3 py-1 capitalize`}>
                          {record.payment_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {record.payment_status?.toLowerCase() === 'pending' ? (
                          <Button
                            size="sm"
                            onClick={() => handleMarkPaid(record.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 px-3 rounded-lg text-xs"
                          >
                            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                            Mark Paid
                          </Button>
                        ) : (
                          <span className="text-xs text-brand-gray">Settled</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-brand-gray">
                      No payroll records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}