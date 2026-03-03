"use client";
import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from 'motion/react';
import { Eye, EyeOff, Check, ArrowRight, Globe } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Language {
  id: string;
  name_us: string;
  nativeName: string;
  flagUrl: string;
}

const LANGUAGES: Language[] = [
  {
    id: 'en',
    name_us: 'English',
    nativeName: 'English',
    flagUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=100&h=100',
  },
  {
    id: 'fr',
    name_us: 'French',
    nativeName: 'Français',
    flagUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=100&h=100',
  },
  {
    id: 'cn',
    name_us: 'Chinese',
    nativeName: '中文',
    flagUrl: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&q=80&w=100&h=100',
  },
];

export default function LoginForm() {
    const [selectedLang, setSelectedLang] = useState<string>('en');
    const [openLang, setOpenLang] = useState(false);
    const { login } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const verificationMessage =
        searchParams.get("verified") === "1"
            ? searchParams.get("message") || "Email verified successfully."
            : null;

    const loginWithContext = useCallback(async (email: string, password: string): Promise<boolean> => {
    return login(email, password);
    }, [login]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrors([]);

        const validationErrors: string[] = [];
        if (!username.trim()) {
            validationErrors.push("Email is required.");
        }
        if (!password) {
            validationErrors.push("Password is required.");
        }
        if (validationErrors.length > 0) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);
        try {
        const ok = await loginWithContext(username, password);
        if (!ok) {
            setErrors(["Invalid email or password"]);
            return;
        }
        router.replace("/dashboard");
        } catch (error) {
            setErrors([error instanceof Error ? error.message : "Login failed"]);
        } finally {
            setLoading(false);
        }
    };

    return (
    <>
        {/* Decorative Background Blurs */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex-1 flex flex-col px-8 pt-16 pb-12 relative z-10">
        
            {/* Login Header */}
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-8 flex items-center justify-between"
            >
            <h2 className="text-3xl font-bold text-gray-900">Login</h2>

            <div className="relative">
            <button
                type="button"
                onClick={() => setOpenLang(prev => !prev)}
                className="p-2 rounded-full hover:bg-gray-100 transition"
            ><Globe className="w-5 h-5 text-organization" />
            </button>

            {openLang && (
                <div className="absolute right-0 mt-2 w-44 bg-white border rounded-xl shadow-lg overflow-hidden z-50">
                {LANGUAGES.map((lang) => (
                    <button
                    key={lang.id}
                    onClick={() => {
                        setSelectedLang(lang.id);
                        setOpenLang(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 transition ${
                        selectedLang === lang.id ? "bg-gray-50 font-medium" : ""
                    }`}
                    >
                    <Image
                        src={lang.flagUrl}
                        alt={lang.name_us}
                        width={20}
                        height={20}
                        className="rounded-full"
                    />
                    <span>{lang.nativeName}</span>
                    {selectedLang === lang.id && (
                        <Check className="w-4 h-4 ml-auto text-organization" />
                    )}
                    </button>
                ))}
                </div>
            )}
            </div>
            </motion.div>

            {/* Credentials Form */}
            <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-4"
                onSubmit={handleSubmit}
            >
            {verificationMessage && (
                <p className="mb-4 rounded bg-emerald-100 p-2 text-sm text-emerald-700">{verificationMessage}</p>
            )}
            {errors.length > 0 && (
                <Alert variant="destructive" className="mb-4">
                    <AlertDescription>
                        <ul className="list-disc pl-5 space-y-1">
                            {errors.map((message, index) => (
                                <li key={`${message}-${index}`}>{message}</li>
                            ))}
                        </ul>
                    </AlertDescription>
                </Alert>
            )}

            <div className="mb-4">
                <label className="font-semibold text-gray-700">Email</label>
                <input
                className="w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-organization/50"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                />
            </div>
            <div className="mb-6">
                <label className="font-semibold text-gray-700">Password</label>
                <div className="relative">
                <input
                    type={showPassword ? "text" : "password"}
                    className="w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-organization/50"
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

            {/* Footer Action */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-auto pt-8"
            >
                <motion.button
                    type="submit"
                    disabled={loading}
                    className="
                    w-full 
                    bg-organization 
                    hover:bg-organization/90 
                    text-white 
                    font-bold 
                    py-5 
                    rounded-2xl 
                    shadow-lg 
                    shadow-organization/25 
                    transition-all 
                    active:scale-[0.98] 
                    flex 
                    items-center 
                    justify-center 
                    space-x-3 
                    group 
                    cursor-pointer 
                    disabled:cursor-not-allowed 
                    disabled:opacity-50
                    ">
                    <span className="text-lg">{loading ? "Logging in..." : "Login"}</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
            </motion.div>
            </motion.form>
        </div>
    </>
    );
}
