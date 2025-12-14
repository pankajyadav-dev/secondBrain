import { cn } from "../utils/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: boolean;
}

export function Input({ className, error, ...props }: InputProps) {
    return (
        <input
            className={cn(
                "w-full glass-card rounded-lg px-3 py-2 text-sm text-foreground",
                "placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
                "transition-smooth disabled:opacity-50 disabled:cursor-not-allowed",
                error && "ring-2 ring-destructive",
                className
            )}
            {...props}
        />
    );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    error?: boolean;
}

export function Textarea({ className, error, ...props }: TextareaProps) {
    return (
        <textarea
            className={cn(
                "w-full glass-card rounded-lg px-3 py-2 text-sm text-foreground",
                "placeholder:text-muted-foreground resize-none",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
                "transition-smooth disabled:opacity-50 disabled:cursor-not-allowed",
                error && "ring-2 ring-destructive",
                className
            )}
            {...props}
        />
    );
}
