"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Plus, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { createBrowserClient } from '@supabase/ssr';

export default function MembersPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchMembers = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('members')
        .select('id, full_name, phone, plan, status, created_at')
        .order('created_at', { ascending: false });

      if (data) {
        setMembers(data);
      }
      setIsLoading(false);
    };

    fetchMembers();
  }, []);

  const filteredMembers = members.filter((member) => {
    const query = searchQuery.toLowerCase();
    const name = member.full_name?.toLowerCase() || "";
    const phone = member.phone?.toLowerCase() || "";
    const id = member.id?.toLowerCase() || "";
    
    return name.includes(query) || phone.includes(query) || id.includes(query);
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
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

      <div className="flex flex-col sm:flex-row gap-4 bg-brand-card p-4 rounded-2xl border border-white/5">
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
          <Button variant="outline" className="bg-[#09090b] border-white/10 text-white h-11 rounded-xl hover:bg-white/5">Filter</Button>
          <Button variant="outline" className="bg-[#09090b] border-white/10 text-white h-11 rounded-xl hover:bg-white/5">Export</Button>
        </div>
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
              <TableHead className="w-[50px]"></TableHead>
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
              filteredMembers.map((member: any) => (
                <TableRow key={member.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                  <TableCell className="font-medium text-white">{member.full_name || 'N/A'}</TableCell>
                  <TableCell className="text-brand-gray">{member.phone || 'N/A'}</TableCell>
                  
                  <TableCell className="text-brand-gray capitalize">
                    {member.plan ? member.plan.replace('-', ' ') : 'N/A'}
                  </TableCell>
                  
                  <TableCell>
                    <Badge className={`uppercase tracking-wider ${
                      member.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' : 
                      'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                    } border-none font-semibold px-3 py-1`}>
                      {member.status || 'ACTIVE'}
                    </Badge>
                  </TableCell>
                  
                  <TableCell className="text-brand-gray">{formatDate(member.created_at)}</TableCell>
                  
                  <TableCell className="text-right font-medium text-emerald-500">
                    ₹0
                  </TableCell>
                  
                  <TableCell>
                    <Button variant="ghost" size="icon" className="text-brand-gray opacity-0 group-hover:opacity-100 transition-opacity hover:text-white">
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-brand-gray">
                  No members found matching "{searchQuery}"
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}