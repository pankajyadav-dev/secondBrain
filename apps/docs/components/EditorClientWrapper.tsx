"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { FolderOpen, Calendar, Clock, Type, Check, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { TipTapEditor } from "./TipTapEditor";
import { AIChatSidebar } from "./AIChatSidebar";
import { cn } from "../../../packages/ui/utils/cn";

export function EditorClientWrapper({ note }: { note: any }) {
    const [content, setContent] = useState(note.content);
    const [title, setTitle] = useState(note.title);
    const [folderId, setFolderId] = useState(note.folderId || "");
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [availableFolders, setAvailableFolders] = useState<any[]>([]);

    useEffect(() => {
        fetch("/api/folders")
            .then(res => res.json())
            .then(data => setAvailableFolders(data))
            .catch(err => console.error("Failed to fetch folders:", err));
    }, []);

    // Auto-save logic
    const saveNote = async (newContent: string, newTitle: string, newFolderId: string) => {
        setIsSaving(true);
        try {
            await fetch(`/api/notes/${note._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: newContent,
                    title: newTitle,
                    folderId: newFolderId || null
                })
            });
            setLastSaved(new Date());
        } catch (e) {
            console.error("Failed to save", e);
        } finally {
            setIsSaving(false);
        }
    };

    // Debounce save
    useEffect(() => {
        const timer = setTimeout(() => {
            if (content !== note.content || title !== note.title || folderId !== (note.folderId || "")) {
                saveNote(content, title, folderId);
            }
        }, 1500);
        return () => clearTimeout(timer);
    }, [content, title, folderId]);

    // Calculate word and character count
    const stats = useMemo(() => {
        const text = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
        const words = text ? text.split(' ').length : 0;
        const chars = text.length;
        return { words, chars };
    }, [content]);

    // Parse date
    const createdDate = note.createdAt ? new Date(note.createdAt) : null;
    const modifiedDate = note.updatedAt ? new Date(note.updatedAt) : null;

    return (
        <>
            <div className="flex-1 flex flex-col min-w-0">
                {/* Enhanced Header */}
                <div className="border-b border-white/10 glass px-6 py-4 space-y-3">
                    {/* Title */}
                    <input
                        className="bg-transparent text-2xl font-bold outline-none text-white w-full placeholder:text-muted-foreground"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Untitled Note"
                    />

                    {/* Metadata Row */}
                    <div className="flex items-center justify-between flex-wrap gap-3 text-xs">
                        <div className="flex items-center gap-4 text-muted-foreground">
                            {/* Folder Selector */}
                            <div className="flex items-center gap-2 glass-card px-3 py-1.5 rounded-lg">
                                <FolderOpen size={14} className="text-primary" />
                                <select
                                    className="bg-transparent outline-none cursor-pointer"
                                    value={folderId}
                                    onChange={(e) => setFolderId(e.target.value)}
                                >
                                    <option value="" className="bg-secondary">Unfiled</option>
                                    {availableFolders.map(f => (
                                        <option key={f._id} value={f._id} className="bg-secondary">
                                            {f.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Created Date */}
                            {createdDate && (
                                <div className="flex items-center gap-1.5">
                                    <Calendar size={12} />
                                    <span>Created {format(createdDate, 'MMM d, yyyy')}</span>
                                </div>
                            )}

                            {/* Modified Date */}
                            {modifiedDate && (
                                <div className="flex items-center gap-1.5">
                                    <Clock size={12} />
                                    <span>Modified {format(modifiedDate, 'MMM d, yyyy')}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Word/Character Count */}
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Type size={12} />
                                <span>{stats.words} words · {stats.chars} characters</span>
                            </div>

                            {/* Save Status */}
                            <div className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-smooth",
                                isSaving
                                    ? "glass-card text-primary"
                                    : "glass text-success"
                            )}>
                                {isSaving ? (
                                    <>
                                        <Loader2 size={12} className="animate-spin" />
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <Check size={12} />
                                        <span>
                                            {lastSaved
                                                ? `Saved at ${format(lastSaved, 'HH:mm:ss')}`
                                                : "Saved"}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Editor */}
                <TipTapEditor content={content} onChange={setContent} />
            </div>

            {/* AI Chat Sidebar */}
            <AIChatSidebar contextContent={content} />
        </>
    );
}
