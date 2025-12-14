
import { useState } from "react";
import { cn } from "../utils/cn";

interface TooltipProps {
    children: React.ReactNode;
    content: string;
    side?: "top" | "bottom" | "left" | "right";
}

export function Tooltip({ children, content, side = "top" }: TooltipProps) {
    const [show, setShow] = useState(false);

    const positions = {
        top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
        bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
        left: "right-full top-1/2 -translate-y-1/2 mr-2",
        right: "left-full top-1/2 -translate-y-1/2 ml-2",
    };

    return (
        <div
            className="relative inline-flex"
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
        >
            {children}
            {show && (
                <div
                    className={cn(
                        "absolute z-50 glass-card px-2 py-1 text-xs text-white rounded whitespace-nowrap animate-scale-in pointer-events-none",
                        positions[side]
                    )}
                >
                    {content}
                </div>
            )}
        </div>
    );
}
