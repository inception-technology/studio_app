// app/auth/login/page.tsx
"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import LoginForm from "./form";

export default function LoginPage() {

  const signupLink = "/auth/signup";
  const { login } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const loginWithContext = useCallback(async (email: string, password: string): Promise<boolean> => {
    return login(email, password);
  }, [login]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const ok = await loginWithContext(username, password);
      if (!ok) {
        setError("Email ou mot de passe invalide");
        return;
      }
      router.replace("/dashboard");
    } catch (error) {
        setError(error instanceof Error ? error.message : "Login failed");
    } finally {
        setLoading(false);
    }
  };

  return (
    <>
      <section className="right-container-section">
        <div className="inner-container">
          <LoginForm />
          <div className="mt-4 py-4 text-center">
            <Link 
              href={signupLink} 
              className="text-sm text-gray-500 hover:underline font-bold"
            >Don&apos;t have an account? Sign Up
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
