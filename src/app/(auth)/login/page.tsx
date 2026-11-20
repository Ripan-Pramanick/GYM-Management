import type { Metadata } from "next";
import LoginContent from "./LoginContent";

export const metadata: Metadata = {
  title: "Admin Login",
  description: "Sign in to the FITCORE gym management dashboard.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return <LoginContent />;
}