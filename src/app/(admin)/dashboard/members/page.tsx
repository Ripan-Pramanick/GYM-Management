"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { Search, Plus, Filter, Download, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { createBrowserClient } from "@supabase/ssr";

export default function MembersPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [duesByMember, setDuesByMember] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
  );

  const fetchMembersData = useCallback(async () => {
    setIsLoading(true);

    const [membersRes, invoicesRes] = await Promise.all([
      supabase
        .from("members")
        .select("id, full_name, phone, plan, status, created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("invoices")
        .select("member_id, amount")
        .in("status", ["pending", "overdue"]),
    ]);

    if (membersRes.data) {
      setMembers(membersRes.data);
    }

    if (invoicesRes.data) {
      const duesMap: Record<string, number> = {};
      invoicesRes.data.forEach((inv: any) => {
        if (inv.member_id) {
          duesMap[inv.member_id] = (duesMap[inv.member_id] || 0) + Number(inv.amount || 0);
        }
      });
      setDuesByMember(duesMap);
    }

    setIsLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchMembersData();
  }, [fetchMembersData]);

  const handleToggleStatus = async (member: any) => {
    const nextStatus = member.status?.toLowerCase() === "active" ? "inactive" : "active";
    const { error } = await supabase
      .from("members")
      .update({ status: nextStatus })
      .eq("id", member.id);

    if (error) {
      alert("Failed to update member status: " + error.message);
      return;
    }

    setMembers((prev) =>
      prev.map((m) => (m.id === member.id ? { ...m, status: nextStatus } : m))
    );
  };

  const handleDeleteMember = async (member: any) => {
    const confirmed = window.confirm(`Delete member "${member.full_name || "this member"}"?`);
    if (!confirmed) return;

    const { error } = await supabase.from("members").delete().eq("id", member.id);

    if (error) {
      alert("Failed to delete member: " + error.message);
      return;
    }

    setMembers((prev) => prev.filter((m) => m.id !== member.id));
  };

  const filteredMembers = members.filter((member) => {
    const query = searchQuery.toLowerCase();
    const name = member.full_name?.toLowerCase() || "";
    const phone = member.phone?.toLowerCase() || "";
    const id = member.id?.toLowerCase() || "";

    const matchesSearch = name.includes(query) || phone.includes(query) || id.includes(query);
    const memberStatus = (member.status || "active").toLowerCase();
    const matchesStatus = statusFilter === "all" ? true : memberStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const parsed = new Date(dateString);
    if (isNaN(parsed.getTime())) return "N/A";
    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  const handleExportCSV = () => {
    const headers = ["Name", "Contact", "Plan", "Status", "Joined Date", "Dues (INR)"];
    const rows = filteredMembers.map((member) => {
      const dues = duesByMember[member.id] || 0;
      return [
        `"${member.full_name || "N/A"}"`,
        `"${member.phone || "N/A"}"`,
        `"${member.plan ? member.plan.replace("-", " ") : "N/A"}"`,
        (member.status || "active").toUpperCase(),
        formatDate(member.created_at),
        dues,
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Fitcore_Members_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Members</h1>
          <p className="text-brand-gray text-sm">Manage your gym members, subscriptions, and dues.</p>
        </div>
        <Link href="/dashboard/members/new">
          <Button className="bg-brand-red hover:bg-red-700 text-white font-bold h-11 px-6 rounded-xl shadow-lg shadow-brand-red/20">
            <Plus className="mr-2 h-5 w-5" /> Add Member
          </Button>
        </Link>
      </div>

      <div className="space-y-4 bg-brand-card p-4 rounded-2xl border border-white/5">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-gray" />
            <Input
              placeholder="Search by name, phone, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#09090b] border-white/10 text-white h-11 w-full md:max-w-md rounded-xl focus-visible:ring-brand-red"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters((prev) => !prev)}
              className={`border-white/10 text-white h-11 rounded-xl ${
                showFilters || statusFilter !== "all" ? "bg-white/10" : "bg-[#09090b] hover:bg-white/5"
              }`}
            >
              <Filter className="mr-2 h-4 w-4" />
              {statusFilter === "all" ? "Filter" : `Status: ${statusFilter}`}
            </Button>
            <Button
              variant="outline"
              onClick={handleExportCSV}
              className="bg-[#09090b] border-white/10 text-white h-11 rounded-xl hover:bg-white/5"
            >
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-white/5">
            <span className="text-xs text-brand-gray mr-2">Status:</span>
            {(["all", "active", "inactive"] as const).map((status) => (
              <Button
                key={status}
                type="button"
                size="sm"
                onClick={() => setStatusFilter(status)}
                className={`h-8 px-3 rounded-lg capitalize text-xs ${
                  statusFilter === status
                    ? "bg-brand-red text-white hover:bg-red-700"
                    : "bg-[#09090b] text-brand-gray hover:text-white border border-white/10"
                }`}
              >
                {status}
              </Button>
            ))}
          </div>
        )}
      </div>

      <div className="bg-brand-card border border-white/5 rounded-2xl overflow-hidden">
        <Table>
          <TableHeader className="bg-[#09090b]/50 hover:bg-[#09090b]/50 border-b border-white/5">
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="text-brand-gray font-semibold">Name</TableHead>
              <TableHead className="text-brand-gray font-semibold">Contact</TableHead>
              <TableHead className="text-brand-gray font-semibold">Plan</TableHead>
              <TableHead className="text-brand-gray font-semibold">Status</TableHead>
              <TableHead className="text-brand-gray font-semibold">Joined Date</TableHead>
              <TableHead className="text-brand-gray font-semibold text-right">Dues</TableHead>
              <TableHead className="text-brand-gray font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-brand-gray">
                  Loading members...
                </TableCell>
              </TableRow>
            ) : filteredMembers.length > 0 ? (
              filteredMembers.map((member: any) => {
                const memberDues = duesByMember[member.id] || 0;
                const isActive = (member.status || "active").toLowerCase() === "active";

                return (
                  <TableRow key={member.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <TableCell className="font-medium text-white">{member.full_name || "N/A"}</TableCell>
                    <TableCell className="text-brand-gray">{member.phone || "N/A"}</TableCell>
                    <TableCell className="text-brand-gray capitalize">
                      {member.plan ? member.plan.replace("-", " ") : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`uppercase tracking-wider ${
                          isActive
                            ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                            : "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                        } border-none font-semibold px-3 py-1`}
                      >
                        {member.status || "ACTIVE"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-brand-gray">{formatDate(member.created_at)}</TableCell>
                    <TableCell
                      className={`text-right font-medium ${
                        memberDues > 0 ? "text-orange-500" : "text-emerald-500"
                      }`}
                    >
                      {formatCurrency(memberDues)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title={isActive ? "Mark Inactive" : "Mark Active"}
                          onClick={() => handleToggleStatus(member)}
                          className="text-brand-gray hover:text-white h-8 w-8"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Delete Member"
                          onClick={() => handleDeleteMember(member)}
                          className="text-brand-gray hover:text-brand-red h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-brand-gray">
                  {searchQuery || statusFilter !== "all"
                    ? "No members found matching current filters."
                    : "No members found."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}