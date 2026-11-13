"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Users, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { createBrowserClient } from '@supabase/ssr';

export default function ClassesPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchClasses = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('classes')
        .select('id, name, instructor, time, duration, capacity, status, created_at')
        .order('created_at', { ascending: false });

      if (data) {
        setClasses(data);
      }
      setIsLoading(false);
    };

    fetchClasses();
  }, []);

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '-';
    // If it's just a regular string or time like "18:30", we can format it nicely
    try {
      const [hours, minutes] = timeStr.split(':');
      const h = parseInt(hours);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const formattedHours = h % 12 || 12;
      return `${formattedHours}:${minutes} ${ampm}`;
    } catch {
      return timeStr;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Classes & Attendance</h1>
          <p className="text-brand-gray text-sm">Schedule group sessions and track daily member check-ins.</p>
        </div>
        <Link href="/dashboard/classes/new">
          <Button className="bg-brand-red hover:bg-red-700 text-white font-bold h-11 px-6 rounded-xl shadow-lg shadow-brand-red/20">
            <Plus className="mr-2 h-5 w-5" /> Schedule Class
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-brand-card border border-white/5 p-6 rounded-2xl">
          <div className="w-10 h-10 rounded-full bg-brand-red/10 flex items-center justify-center mb-4">
            <Calendar className="h-5 w-5 text-brand-red" />
          </div>
          <p className="text-brand-gray text-sm mb-1">Active Classes</p>
          <h3 className="text-3xl font-bold text-white">{classes.length}</h3>
        </div>
        
        <div className="bg-brand-card border border-white/5 p-6 rounded-2xl">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
            <Users className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="text-brand-gray text-sm mb-1">Check-ins Today</p>
          <h3 className="text-3xl font-bold text-white">0</h3>
        </div>
        
        <div className="bg-brand-card border border-white/5 p-6 rounded-2xl">
          <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center mb-4">
            <Clock className="h-5 w-5 text-orange-500" />
          </div>
          <p className="text-brand-gray text-sm mb-1">Peak Time</p>
          <h3 className="text-3xl font-bold text-white">06:00 PM</h3>
        </div>
      </div>

      <div className="bg-brand-card border border-white/5 rounded-2xl overflow-hidden">
        <div className="flex border-b border-white/5">
          <button className="px-6 py-4 text-sm font-medium text-white border-b-2 border-brand-red">Class Schedule</button>
          <button className="px-6 py-4 text-sm font-medium text-brand-gray hover:text-white transition-colors">Today's Check-ins</button>
        </div>
        
        <Table>
          <TableHeader className="bg-[#09090b]/50 hover:bg-[#09090b]/50 border-b border-white/5">
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="text-brand-gray font-semibold">Class Name</TableHead>
              <TableHead className="text-brand-gray font-semibold">Trainer</TableHead>
              <TableHead className="text-brand-gray font-semibold">Time</TableHead>
              <TableHead className="text-brand-gray font-semibold">Duration</TableHead>
              <TableHead className="text-brand-gray font-semibold">Capacity</TableHead>
              <TableHead className="text-brand-gray font-semibold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-brand-gray">
                  Loading classes...
                </TableCell>
              </TableRow>
            ) : classes.length > 0 ? (
              classes.map((cls: any) => (
                <TableRow key={cls.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                  <TableCell className="font-medium text-white">{cls.name || 'N/A'}</TableCell>
                  <TableCell className="text-brand-gray">{cls.instructor || 'N/A'}</TableCell>
                  <TableCell className="text-brand-gray">{formatTime(cls.time)}</TableCell>
                  <TableCell className="text-brand-gray">{cls.duration || 'N/A'}</TableCell>
                  <TableCell className="text-brand-gray">{cls.capacity} students</TableCell>
                  <TableCell>
                    <Badge className={`uppercase tracking-wider ${
                      cls.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                    } border-none font-semibold px-3 py-1`}>
                      {cls.status || 'ACTIVE'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-brand-gray">
                  No classes scheduled yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}