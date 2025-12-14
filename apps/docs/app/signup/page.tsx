"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Sparkles } from "lucide-react";
import { Input } from "@repo/ui/Input";
import { Button } from "@repo/ui/Button";

export default function SignupPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Registration failed");
            }

            router.push("/login");
        } catch (err: any) {
            setError(err.message);
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
                    <div className="text-center space-y-3">
                        <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-primary mb-2">
                            <Sparkles size={28} className="sm:w-8 sm:h-8 text-white" />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                            Create account
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-400">
                            Start building your Second Brain
                        </p>
                    </div>
                    <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Full Name
                                </label>
                                <Input
                                    type="text"
                                    required
                                    placeholder="Enter your full name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    disabled={loading}
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Email address
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
                                    placeholder="Create a password"
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
                                    Creating account...
                                </>
                            ) : (
                                "Sign up"
                            )}
                        </Button>
                    </form>
                    <div className="text-center text-sm">
                        <p className="text-muted-foreground">
                            Already have an account?{" "}
                            <Link
                                href="/login"
                                className="font-medium text-primary hover:text-primary/80 transition-smooth"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
