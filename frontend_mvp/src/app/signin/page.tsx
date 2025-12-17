"use client";

import { useRouter } from "next/navigation";
import { LoginScreen } from "@/components/LoginScreen";

export default function SignInPage() {
  const router = useRouter();

  const handleLogin = () => {
    // Set authentication flag in localStorage
    localStorage.setItem("isAuthenticated", "true");
    // Redirect to dashboard
    router.push("/");
  };

  return <LoginScreen onLogin={handleLogin} />;
}
