"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, FileText, Sparkles, Trash2, MessageSquare, X } from "lucide-react";
import { Button } from "@repo/ui/Button";
import { cn } from "../../../packages/ui/utils/cn";
import { Textarea } from "@repo/ui/Input";


interface AIChatSidebarProps {
    contextContent: string;
    isOpen?: boolean;
    onToggle?: () => void;
}

interface Message {
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

export function AIChatSidebar({ contextContent, isOpen = true, onToggle }: AIChatSidebarProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [useSelection, setUseSelection] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = {
            role: "user",
            content: input,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            let contextWindow = contextContent;
            if (useSelection) {
                const selection = window.getSelection()?.toString();
                if (selection) {
                    contextWindow = selection;
                }
            }

            const res = await fetch("/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMsg.content,
                    contextWindow: contextWindow,
                    chatHistory: messages.slice(-10),
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                // Handle specific error types
                let errorMessage = "Error communicating with AI. Please try again.";

                if (res.status === 429) {
                    errorMessage = data.error || "Rate limit exceeded. Please wait a moment and try again.";
                } else if (data.code === "QUOTA_NOT_CONFIGURED") {
                    errorMessage = "API quota not configured. Please contact support.";
                } else if (data.error) {
                    errorMessage = data.error;
                }

                throw new Error(errorMessage);
            }

            const aiMsg: Message = {
                role: "assistant",
                content: data.reply,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (err: any) {
            const errorMsg: Message = {
                role: "assistant",
                content: err.message || "Error communicating with AI. Please try again.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    const clearChat = () => {
        setMessages([]);
    };

    // Calculate context size
    const contextSize = useSelection
        ? (window.getSelection()?.toString().length || 0)
        : contextContent.replace(/<[^>]*>/g, '').length;

    return (
        <div className={cn(
            "border-l border-white/10 glass-card flex flex-col h-screen animate-slide-in-up",
            "w-full lg:w-96",
            !isOpen && "hidden"
        )}>
            {/* Header */}
            <div className="p-3 sm:p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-700 flex items-center justify-center">
                        <Sparkles size={14} className="sm:w-4 sm:h-4 text-white" />
                    </div>
                    <div>
                        <h2 className="font-bold text-sm sm:text-base text-white">AI Assistant</h2>
                        <p className="text-xs text-muted-foreground hidden sm:block">Ask about your notes</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {messages.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearChat}
                            className="h-7 sm:h-8 w-7 sm:w-8 p-0"
                        >
                            <Trash2 size={14} />
                        </Button>
                    )}
                    {onToggle && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onToggle}
                            className="h-7 sm:h-8 w-7 sm:w-8 p-0"
                        >
                            <X size={14} />
                        </Button>
                    )}
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4" ref={scrollRef}>
                {messages.length === 0 && (
                    <div className="text-center text-gray-300 text-sm mt-8 sm:mt-16 space-y-3 sm:space-y-4 animate-fade-in">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-700 flex items-center justify-center mx-auto">
                            <MessageSquare size={24} className="sm:w-8 sm:h-8 text-gray-200" />
                        </div>
                        <div>
                            <p className="font-medium">Start a conversation</p>
                            <p className="text-xs mt-2">Ask questions about your notes</p>
                        </div>
                        <div className="space-y-2 text-xs">
                            <div className="glass-card p-2 rounded-lg">
                                💡 Try: "Summarize this note"
                            </div>
                            <div className="glass-card p-2 rounded-lg">
                                💡 Try: "What are the key points?"
                            </div>
                        </div>
                    </div>
                )}

                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={cn(
                            "flex gap-2 sm:gap-3 animate-slide-in-up",
                            msg.role === "user" ? "justify-end" : "justify-start"
                        )}
                    >
                        {msg.role === "assistant" && (
                            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                                <Bot size={12} className="sm:w-[14px] sm:h-[14px] text-white" />
                            </div>
                        )}

                        <div className={cn(
                            "flex flex-col gap-1 max-w-[85%]",
                            msg.role === "user" && "items-end"
                        )}>
                            <div className={cn(
                                "p-2 sm:p-3 rounded-2xl text-xs sm:text-sm leading-relaxed",
                                msg.role === "user"
                                    ? "bg-primary text-white"
                                    : "glass-card text-gray-200"
                            )}>
                                {msg.content}
                            </div>
                            <span className="text-xs text-gray-200 px-1">
                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>

                        {msg.role === "user" && (
                            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                <User size={12} className="sm:w-[14px] sm:h-[14px] text-muted-foreground" />
                            </div>
                        )}
                    </div>
                ))}

                {loading && (
                    <div className="flex gap-2 sm:gap-3 justify-start animate-slide-in-up">
                        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-primary flex items-center justify-center">
                            <Bot size={12} className="sm:w-[14px] sm:h-[14px] text-white" />
                        </div>
                        <div className="glass-card p-2 sm:p-3 rounded-2xl">
                            <Loader2 size={14} className="sm:w-4 sm:h-4 animate-spin text-primary" />
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-3 sm:p-4 border-t border-white/10 space-y-2 sm:space-y-3">
                {/* Context Toggle & Info */}
                <div className="flex items-center justify-between text-xs">
                    <button
                        onClick={() => setUseSelection(!useSelection)}
                        className={cn(
                            "flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-lg transition-smooth border text-xs",
                            useSelection
                                ? "glass-card text-gray-200 border-primary/30"
                                : "glass border-transparent text-muted-foreground hover:text-white"
                        )}
                    >
                        <FileText size={12} />
                        <span className="hidden sm:inline text-gray-300">{useSelection ? "Using Selected Text" : "Using Full Note"}</span>
                        <span className="sm:hidden text-gray-300">{useSelection ? "Selection" : "Full Note"}</span>
                    </button>

                    <span className="text-gray-200 text-xs">
                        {contextSize} chars
                    </span>
                </div>

                {/* Input */}
                <div className="relative">
                    <Textarea
                        className="pr-12 resize-none text-sm text-gray-400"
                        placeholder="Ask AI about your note..."
                        rows={3}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                    />
                    <Button
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                        variant="primary"
                        size="sm"
                        className="absolute right-2 bottom-2 rounded-lg h-7 w-7 p-0"
                    >
                        <Send size={12} />
                    </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center hidden sm:block">
                    Press Enter to send, Shift+Enter for new line
                </p>
            </div>
        </div>
    );
}
