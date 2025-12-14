import { cn } from "../utils/cn";

interface BadgeProps {
    children: React.ReactNode;
    variant?: "default" | "primary" | "success" | "warning" | "destructive";
    className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
    const variants = {
        default: "bg-muted text-muted-foreground",
        primary: "bg-primary/20 text-primary border border-primary/30",
        success: "bg-success/20 text-success border border-success/30",
        warning: "bg-warning/20 text-warning border border-warning/30",
        destructive: "bg-destructive/20 text-destructive border border-destructive/30",
    };

    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium transition-smooth",
                variants[variant],
                className
            )}
        >
            {children}
        </span>
    );
}
