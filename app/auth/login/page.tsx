"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {

  const signupLink = "/auth/signup";
  // TODO : AuthContext pour partager le state de l'utilisateur connecté dans toute l'app
  //const { login } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // login/logout appellent des endpoints qui gèrent la session côté serveur (création/destroy)
  const login = useCallback(async (username: string, password: string): Promise<void> => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      cache: "no-store",
      credentials: "include",
    });
    if (!res.ok) {
      const errorText = await res.text().catch(() => "Login failed");
      throw new Error(errorText);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
      const next = "/user/dashboard";
      router.replace(next);
    } catch (error) {
        setError(error instanceof Error ? error.message : "Login failed");
    } finally {
        setLoading(false);
    }
  };

  return (
    <>
      <section className="flex flex-col w-2/3 h-full right-container-section">
        <div className="flex items-center justify-center bg-gray-50 p-20 flex-col w-full h-full">
          <form onSubmit={handleSubmit} className="w-full max-w-md rounded-lg border p-8 shadow bg-white">
            <h1 className="mb-6 text-2xl font-semibold">Login</h1>

            {error && (
              <p className="mb-4 rounded bg-red-100 p-2 text-sm text-red-600">{error}</p>
            )}

            <div className="mb-4">
              <label className="mb-1 block text-sm">Email</label>
              <input
                className="w-full rounded border px-3 py-2"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="mb-6">
              <label className="mb-1 block text-sm">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full rounded border px-3 py-2 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full rounded-xl bg-organization px-4 py-2 text-white disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <a href={signupLink} className="text-sm text-gray-500 hover:underline font-bold">
              Don&apos;t have an account? Sign Up
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
