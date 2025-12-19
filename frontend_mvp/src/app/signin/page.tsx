"use client";

import { useRouter } from "next/navigation";
import { LoginScreen } from "@/components/LoginScreen";
import { supabase } from "@/lib/supabase";

interface SignUpData {
  firstName: string;
  surname: string;
  username: string;
  classLevel: string;
}

export default function SignInPage() {
  const router = useRouter();

  const handleLogin = async (
    email: string,
    password: string,
    isSignUp: boolean,
    signUpData?: SignUpData
  ) => {
    if (isSignUp && signUpData) {
      // Sign up new user with metadata
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: signUpData.firstName,
            surname: signUpData.surname,
            username: signUpData.username,
            class_level_when_sign_up: signUpData.classLevel, // Historical snapshot
          }
        }
      });

      if (error) throw error;

      // Supabase may require email confirmation
      if (data.user && !data.user.confirmed_at) {
        throw new Error('Please check your email to confirm your account');
      }
    } else {
      // Sign in existing user
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    }

    // Redirect to dashboard
    router.push("/");
    router.refresh();
  };

  return <LoginScreen onLogin={handleLogin} />;
}
