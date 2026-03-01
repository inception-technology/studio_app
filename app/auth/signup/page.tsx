"use client";
import SignupForm from "../signup/form";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUpPage() {

  const loginLink = "/auth/login";
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    // Appel FastAPI login route
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        }
      );
      // Si erreur
      if (!res.ok) throw new Error();
      // Redirige vers login après signup réussi
      router.push(loginLink);
    } catch {
      setError("Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="right-container-section">
        <div className="inner-container">
          <SignupForm />
          <div className="text-center">
            <Link
              href={loginLink}
              className="text-sm text-gray-500 hover:underline font-bold"
            >
              Already have an account? Login
            </Link>
        </div>
      </div>
      </section>
    </>
  );
}
