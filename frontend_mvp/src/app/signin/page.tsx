"use client";

import { useRouter } from "next/navigation";
import { LoginScreen } from "@/components/LoginScreen";
import { supabase } from "@/lib/supabase";

interface SignUpData {
  firstName: string;
  surname: string;
  username: string;
  classLevel: string;
  role: 'student' | 'teacher' | 'private_tutor';
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
      // Sign up new user - database trigger will create profile automatically
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: signUpData.firstName,
            surname: signUpData.surname,
            username: signUpData.username,
            role: signUpData.role, // 'student', 'teacher', or 'private_tutor'
            class_level: signUpData.role === 'student' ? signUpData.classLevel : null,
          }
        }
      });

      if (error) {
        throw new Error(`Signup failed: ${error.message}`);
      }

      if (!data.user) {
        throw new Error('Signup failed: No user data returned');
      }

      // Check if user already exists (Supabase returns existing user for email enumeration protection)
      // If identities array is empty, user already existed
      if (data.user.identities && data.user.identities.length === 0) {
        throw new Error('An account with this email already exists. Please sign in instead.');
      }

      // Email confirmation required - show success message
      if (!data.user.confirmed_at) {
        throw new Error('SUCCESS: Please check your email to confirm your account before signing in');
      }

      // If auto-confirmed (unlikely), show success
      throw new Error('SUCCESS: Account created! You can now sign in.');

    } else {
      // Sign in existing user
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(`Sign in failed: ${error.message}`);
      }

      // Successfully signed in - redirect to dashboard
      router.push("/");
      router.refresh();
    }
  };

  return <LoginScreen onLogin={handleLogin} />;
}
