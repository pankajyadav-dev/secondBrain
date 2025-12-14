
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { FileText, FolderPlus, Sparkles } from "lucide-react";
import { authOptions } from "../../lib/auth";
import { AppSidebar } from "../../components/AppSidebar";

export default async function Dashboard() {
    const session = await getServerSession(authOptions);
    if (!session) {
        redirect("/login");
    }

    return (
        <div className="flex h-screen overflow-hidden">
            <AppSidebar />
            <main className="flex-1 flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
                {/* Decorative background */}
                <div className="absolute inset-0 bg-gradient-radial opacity-50" />
                <div className="absolute top-1/4 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-accent/10 rounded-full blur-3xl" />

                {/* Content */}
                <div className="relative z-10 text-center space-y-6 sm:space-y-8 max-w-2xl px-4 sm:px-8 animate-fade-in">
                    {/* Icon */}
                    <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-primary animate-pulse-glow">
                        <Sparkles size={32} className="sm:w-10 sm:h-10 text-white" />
                    </div>

                    {/* Heading */}
                    <div className="space-y-3">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
                            <span className="bg-gradient-primary bg-clip-text text-transparent">
                                Welcome to Your Second Brain
                            </span>
                        </h1>
                        <p className="text-base sm:text-lg md:text-xl text-muted-foreground px-4">
                            Organize your knowledge with folders and let AI assist you
                        </p>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto pt-4">
                        <div className="glass-card p-5 sm:p-6 rounded-2xl hover:glass-hover transition-smooth cursor-default group">
                            <FolderPlus size={24} className="text-primary mb-3 group-hover:scale-110 transition-smooth" />
                            <h3 className="font-semibold text-white mb-1">Create Folder</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground">Organize notes by category</p>
                        </div>

                        <div className="glass-card p-5 sm:p-6 rounded-2xl hover:glass-hover transition-smooth cursor-default group">
                            <FileText size={24} className="text-accent mb-3 group-hover:scale-110 transition-smooth" />
                            <h3 className="font-semibold text-white mb-1">Add Notes</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground">Capture your thoughts</p>
                        </div>
                    </div>

                    {/* CTA */}
                    <p className="text-xs sm:text-sm text-muted-foreground pt-4 px-4">
                        ← Create or select a folder to get started
                    </p>
                </div>
            </main>
        </div>
    );
}
