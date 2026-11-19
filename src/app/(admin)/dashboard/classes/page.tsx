"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { Plus, Users, Calendar, Clock, RefreshCw, Trash2, UserCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createBrowserClient } from "@supabase/ssr";

export default function ClassesPage() {
  const [activeTab, setActiveTab] = useState<"schedule" | "checkins">("schedule");
  const [classes, setClasses] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("general");
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
  );

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const today = new Date().toISOString().split("T")[0];

    const [classesRes, membersRes, attendanceRes] = await Promise.all([
      supabase
        .from("classes")
        .select("id, name, instructor, time, duration, capacity, status, created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("members")
        .select("id, full_name, plan")
        .eq("status", "active")
        .order("full_name", { ascending: true }),
      supabase
        .from("attendance")
        .select("*")
        .eq("date", today)
        .order("created_at", { ascending: false }),
    ]);

    if (classesRes.data) setClasses(classesRes.data);
    if (membersRes.data) setMembers(membersRes.data);
    if (attendanceRes.data) setCheckIns(attendanceRes.data);

    setIsLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return "-";
    try {
      const [hours, minutes] = timeStr.split(":");
      const h = parseInt(hours, 10);
      if (isNaN(h) || !minutes) return timeStr;
      const ampm = h >= 12 ? "PM" : "AM";
      const formattedHours = h % 12 || 12;
      return `${String(formattedHours).padStart(2, "0")}:${minutes} ${ampm}`;
    } catch {
      return timeStr;
    }
  };

  const handleToggleClassStatus = async (cls: any) => {
    const nextStatus = (cls.status || "active").toLowerCase() === "active" ? "inactive" : "active";
    const { error } = await supabase
      .from("classes")
      .update({ status: nextStatus })
      .eq("id", cls.id);

    if (error) {
      alert("Failed to update class status: " + error.message);
      return;
    }

    setClasses((prev) =>
      prev.map((c) => (c.id === cls.id ? { ...c, status: nextStatus } : c))
    );
  };

  const handleDeleteClass = async (cls: any) => {
    const confirmed = window.confirm(`Delete class "${cls.name || "this class"}"?`);
    if (!confirmed) return;

    const { error } = await supabase.from("classes").delete().eq("id", cls.id);

    if (error) {
      alert("Failed to delete class: " + error.message);
      return;
    }

    setClasses((prev) => prev.filter((c) => c.id !== cls.id));
  };

  const handleRecordCheckIn = async () => {
    if (!selectedMemberId) {
      alert("Please select a member to check in.");
      return;
    }

    const member = members.find((m) => m.id === selectedMemberId);
    const chosenClass =
      selectedClassId !== "general" ? classes.find((c) => c.id === selectedClassId) : null;

    try {
      setIsCheckingIn(true);
      const now = new Date();
      const today = now.toISOString().split("T")[0];
      const currentTime = now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      const { error } = await supabase.from("attendance").insert([
        {
          member_id: member?.id,
          member_name: member?.full_name || "Member",
          class_id: chosenClass ? chosenClass.id : null,
          class_name: chosenClass ? chosenClass.name : "General Gym Session",
          date: today,
          check_in_time: currentTime,
        },
      ]);

      if (error) throw error;

      setSelectedMemberId("");
      setSelectedClassId("general");
      await fetchData();
    } catch (error: any) {
      console.error(error);
      alert("Failed to record check-in: " + error.message);
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleDeleteCheckIn = async (id: string) => {
    const { error } = await supabase.from("attendance").delete().eq("id", id);
    if (error) {
      alert("Failed to remove check-in: " + error.message);
      return;
    }
    setCheckIns((prev) => prev.filter((item) => item.id !== id));
  };

  const activeClasses = classes.filter(
    (cls) => (cls.status || "active").toLowerCase() === "active"
  );

  const peakTime = useMemo(() => {
    if (activeClasses.length === 0) return "N/A";
    const counts: Record<string, number> = {};
    let topSlot = activeClasses[0].time || "";
    let maxCount = 0;

    activeClasses.forEach((cls) => {
      if (!cls.time) return;
      counts[cls.time] = (counts[cls.time] || 0) + 1;
      if (counts[cls.time] > maxCount) {
        maxCount = counts[cls.time];
        topSlot = cls.time;
      }
    });

    return topSlot ? formatTime(topSlot) : "N/A";
  }, [activeClasses]);

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
          <h3 className="text-3xl font-bold text-white">{isLoading ? "..." : activeClasses.length}</h3>
        </div>

        <div className="bg-brand-card border border-white/5 p-6 rounded-2xl">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
            <Users className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="text-brand-gray text-sm mb-1">Check-ins Today</p>
          <h3 className="text-3xl font-bold text-white">{isLoading ? "..." : checkIns.length}</h3>
        </div>

        <div className="bg-brand-card border border-white/5 p-6 rounded-2xl">
          <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center mb-4">
            <Clock className="h-5 w-5 text-orange-500" />
          </div>
          <p className="text-brand-gray text-sm mb-1">Peak Time</p>
          <h3 className="text-3xl font-bold text-white">{isLoading ? "..." : peakTime}</h3>
        </div>
      </div>

      <div className="bg-brand-card border border-white/5 rounded-2xl overflow-hidden">
        <div className="flex border-b border-white/5">
          <button
            type="button"
            onClick={() => setActiveTab("schedule")}
            className={`px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === "schedule"
                ? "text-white border-b-2 border-brand-red"
                : "text-brand-gray hover:text-white"
            }`}
          >
            Class Schedule ({classes.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("checkins")}
            className={`px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === "checkins"
                ? "text-white border-b-2 border-brand-red"
                : "text-brand-gray hover:text-white"
            }`}
          >
            Today's Check-ins ({checkIns.length})
          </button>
        </div>

        {activeTab === "schedule" && (
          <Table>
            <TableHeader className="bg-[#09090b]/50 hover:bg-[#09090b]/50 border-b border-white/5">
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="text-brand-gray font-semibold">Class Name</TableHead>
                <TableHead className="text-brand-gray font-semibold">Trainer</TableHead>
                <TableHead className="text-brand-gray font-semibold">Time</TableHead>
                <TableHead className="text-brand-gray font-semibold">Duration</TableHead>
                <TableHead className="text-brand-gray font-semibold">Capacity</TableHead>
                <TableHead className="text-brand-gray font-semibold">Status</TableHead>
                <TableHead className="text-brand-gray font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-brand-gray">
                    Loading classes...
                  </TableCell>
                </TableRow>
              ) : classes.length > 0 ? (
                classes.map((cls: any) => {
                  const isActive = (cls.status || "active").toLowerCase() === "active";

                  return (
                    <TableRow key={cls.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                      <TableCell className="font-medium text-white">{cls.name || "N/A"}</TableCell>
                      <TableCell className="text-brand-gray">{cls.instructor || "N/A"}</TableCell>
                      <TableCell className="text-brand-gray">{formatTime(cls.time)}</TableCell>
                      <TableCell className="text-brand-gray">{cls.duration || "N/A"}</TableCell>
                      <TableCell className="text-brand-gray">{cls.capacity} students</TableCell>
                      <TableCell>
                        <Badge
                          className={`uppercase tracking-wider ${
                            isActive
                              ? "bg-emerald-500/10 text-emerald-500"
                              : "bg-red-500/10 text-red-500"
                          } border-none font-semibold px-3 py-1`}
                        >
                          {cls.status || "ACTIVE"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            title={isActive ? "Mark Inactive" : "Mark Active"}
                            onClick={() => handleToggleClassStatus(cls)}
                            className="text-brand-gray hover:text-white h-8 w-8"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Delete Class"
                            onClick={() => handleDeleteClass(cls)}
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
                    No classes scheduled yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}

        {activeTab === "checkins" && (
          <div className="space-y-4">
            <div className="p-4 bg-[#09090b]/40 border-b border-white/5 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <div className="flex-1">
                <Select onValueChange={setSelectedMemberId} value={selectedMemberId}>
                  <SelectTrigger className="bg-[#09090b] border-white/10 text-white h-11 rounded-xl">
                    <SelectValue placeholder="Select active member..." />
                  </SelectTrigger>
                  <SelectContent className="bg-brand-card border-white/10 text-white">
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <Select onValueChange={setSelectedClassId} value={selectedClassId}>
                  <SelectTrigger className="bg-[#09090b] border-white/10 text-white h-11 rounded-xl">
                    <SelectValue placeholder="Select session..." />
                  </SelectTrigger>
                  <SelectContent className="bg-brand-card border-white/10 text-white">
                    <SelectItem value="general">General Gym Session</SelectItem>
                    {activeClasses.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name} ({formatTime(cls.time)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="button"
                onClick={handleRecordCheckIn}
                disabled={isCheckingIn}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-11 px-6 rounded-xl"
              >
                {isCheckingIn ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging...
                  </>
                ) : (
                  <>
                    <UserCheck className="mr-2 h-4 w-4" />
                    Check In
                  </>
                )}
              </Button>
            </div>

            <Table>
              <TableHeader className="bg-[#09090b]/50 border-b border-white/5">
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="text-brand-gray font-semibold">Member</TableHead>
                  <TableHead className="text-brand-gray font-semibold">Session / Class</TableHead>
                  <TableHead className="text-brand-gray font-semibold">Check-in Time</TableHead>
                  <TableHead className="text-brand-gray font-semibold">Status</TableHead>
                  <TableHead className="text-brand-gray font-semibold text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-brand-gray">
                      Loading today's check-ins...
                    </TableCell>
                  </TableRow>
                ) : checkIns.length > 0 ? (
                  checkIns.map((item: any) => (
                    <TableRow key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <TableCell className="font-medium text-white">{item.member_name || "Member"}</TableCell>
                      <TableCell className="text-brand-gray">{item.class_name || "General Gym Session"}</TableCell>
                      <TableCell className="text-brand-gray">{item.check_in_time || "-"}</TableCell>
                      <TableCell>
                        <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-semibold px-3 py-1 uppercase">
                          PRESENT
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Remove Check-in"
                          onClick={() => handleDeleteCheckIn(item.id)}
                          className="text-brand-gray hover:text-brand-red h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-brand-gray">
                      No member check-ins recorded today.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}