"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Lock, Mail, Sparkles } from "lucide-react";
import { Input } from "@repo/ui/Input";
import { Button } from "@repo/ui/Button";


export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await signIn("credentials", {
                redirect: false,
                email,
                password,
            });

            if (res?.error) {
                setError("Invalid email or password");
            } else {
                router.push("/dashboard");
            }
        } catch (err) {
            setError("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 px-4 sm:px-6 relative overflow-hidden">
            {/* Decorative background */}
            <div className="absolute inset-0 bg-gradient-radial opacity-30" />
            <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 sm:w-96 h-64 sm:h-96 bg-accent/10 rounded-full blur-3xl" />

            <div className="w-full max-w-md relative z-10 animate-scale-in">
                <div className="glass-card p-6 sm:p-8 rounded-2xl space-y-6 sm:space-y-8">
                    {/* Logo & Title */}
                    <div className="text-center space-y-3">
                        <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-primary mb-2">
                            <Sparkles size={28} className="sm:w-8 sm:h-8 text-white" />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                            Welcome Back
                        </h2>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            Sign in to your Second Brain
                        </p>
                    </div>

                    {/* Form */}
                    <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Email
                                </label>
                                <Input
                                    type="email"
                                    required
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                    className="w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Password
                                </label>
                                <Input
                                    type="password"
                                    required
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading}
                                    className="w-full"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="glass-card p-3 rounded-lg border border-destructive/30 animate-slide-in-down">
                                <p className="text-destructive text-sm text-center">{error}</p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={loading}
                            variant="primary"
                            className="w-full"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 animate-spin" size={16} />
                                    Signing in...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </Button>
                    </form>

                    {/* Footer */}
                    <div className="text-center text-sm">
                        <p className="text-muted-foreground">
                            Don't have an account?{" "}
                            <Link
                                href="/signup"
                                className="font-medium text-primary hover:text-primary/80 transition-smooth"
                            >
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
