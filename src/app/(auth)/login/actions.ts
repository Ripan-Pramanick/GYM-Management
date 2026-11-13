"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// 1. Login Action
export async function loginAction(email: string, password: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

// 2. Logout Action
export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}