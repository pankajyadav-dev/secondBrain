import { cn } from "../utils/cn";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "primary" | "destructive" | "ghost" | "outline";
    size?: "sm" | "md" | "lg";
    children: React.ReactNode;
}

export function Button({
    variant = "default",
    size = "md",
    className,
    children,
    ...props
}: ButtonProps) {
    const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-smooth focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        default: "glass-card hover:glass-hover text-foreground",
        primary: "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg",
        destructive: "bg-destructive hover:bg-destructive/90 text-destructive-foreground",
        ghost: "hover:bg-white/5 text-gray-300 hover:text-white",
        outline: "border border-border hover:bg-white/5 text-gray-300 hover:text-white",
    };

    const sizes = {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
    };

    return (
        <button
            className={cn(baseStyles, variants[variant], sizes[size], className)}
            {...props}
        >
            {children}
        </button>
    );
}
