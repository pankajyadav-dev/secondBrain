
import { useEffect, useRef, useState } from "react";
import { cn } from "../utils/cn";

interface ContextMenuProps {
    x: number;
    y: number;
    items: ContextMenuItem[];
    onClose: () => void;
}

export interface ContextMenuItem {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: "default" | "destructive";
    separator?: boolean;
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x, y });

    useEffect(() => {
        // Adjust position if menu would go off screen
        if (menuRef.current) {
            const rect = menuRef.current.getBoundingClientRect();
            const newX = x + rect.width > window.innerWidth ? window.innerWidth - rect.width - 10 : x;
            const newY = y + rect.height > window.innerHeight ? window.innerHeight - rect.height - 10 : y;
            setPosition({ x: newX, y: newY });
        }
    }, [x, y]);

    useEffect(() => {
        const handleClick = () => onClose();
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        document.addEventListener("click", handleClick);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("click", handleClick);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [onClose]);

    return (
        <div
            ref={menuRef}
            className="fixed z-50 glass-card rounded-lg py-1 min-w-48 shadow-xl animate-scale-in"
            style={{ left: position.x, top: position.y }}
            onClick={(e) => e.stopPropagation()}
        >
            {items.map((item, index) => (
                item.separator ? (
                    <div key={index} className="h-px bg-white/10 my-1" />
                ) : (
                    <button
                        key={index}
                        onClick={() => {
                            item.onClick();
                            onClose();
                        }}
                        className={cn(
                            "w-full flex items-center gap-3 px-3 py-2 text-sm transition-smooth",
                            item.variant === "destructive"
                                ? "text-destructive hover:bg-destructive/10"
                                : "text-gray-300 hover:text-white hover:bg-white/5"
                        )}
                    >
                        {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                        <span>{item.label}</span>
                    </button>
                )
            ))}
        </div>
    );
}
