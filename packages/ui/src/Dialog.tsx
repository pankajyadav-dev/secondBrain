
import { useEffect, useRef } from "react";
import { cn } from "../utils/cn";
import { X } from "lucide-react";
import { Button } from "./Button";

interface DialogProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
}

export function Dialog({ open, onClose, title, description, children, className }: DialogProps) {
    const dialogRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [open]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (open) {
            document.addEventListener("keydown", handleEscape);
        }
        return () => document.removeEventListener("keydown", handleEscape);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Dialog */}
            <div
                ref={dialogRef}
                className={cn(
                    "relative glass-card rounded-2xl p-6 max-w-md w-full mx-4 animate-scale-in",
                    className
                )}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-smooth"
                >
                    <X size={20} />
                </button>

                {/* Header */}
                {(title || description) && (
                    <div className="mb-4 pr-8">
                        {title && <h2 className="text-xl font-bold text-white mb-1">{title}</h2>}
                        {description && <p className="text-sm text-muted-foreground">{description}</p>}
                    </div>
                )}

                {/* Content */}
                <div>{children}</div>
            </div>
        </div>
    );
}

interface ConfirmDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "default" | "destructive";
}

export function ConfirmDialog({
    open,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "default",
}: ConfirmDialogProps) {
    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} title={title} description={description}>
            <div className="flex gap-3 justify-end mt-6">
                <Button variant="ghost" onClick={onClose}>
                    {cancelText}
                </Button>
                <Button
                    variant={variant === "destructive" ? "destructive" : "primary"}
                    onClick={handleConfirm}
                >
                    {confirmText}
                </Button>
            </div>
        </Dialog>
    );
}
