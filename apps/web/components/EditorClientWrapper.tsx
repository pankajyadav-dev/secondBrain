"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { FolderOpen, Calendar, Clock, Type, Check, Loader2, AlertCircle, Save, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { TipTapEditor } from "./TipTapEditor";
import { AIChatSidebar } from "./AIChatSidebar";
import { Button } from "@repo/ui/Button";
import { cn } from "../../../packages/ui/utils/cn";
import { useDebounce } from "../hooks/useDebounce";

interface NoteData {
    _id: string;
    title: string;
    content: string;
    folderId: string;
    createdAt?: string;
    updatedAt?: string;
}

interface Folder {
    id: number;
    name: string;
}

interface ApiError {
    error: string;
}

export function EditorClientWrapper({ note }: { note: NoteData }) {
    const [content, setContent] = useState(note.content || "");
    const [title, setTitle] = useState(note.title || "Untitled");
    const [folderId, setFolderId] = useState(note.folderId || "");
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [availableFolders, setAvailableFolders] = useState<Folder[]>([]);
    const [isLoadingFolders, setIsLoadingFolders] = useState(true);
    const [isAIOpen, setIsAIOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Debounce content and title for auto-save
    const debouncedContent = useDebounce(content, 1500);
    const debouncedTitle = useDebounce(title, 1500);

    // Fetch folders
    useEffect(() => {
        let isMounted = true;
        setIsLoadingFolders(true);
        setError(null);

        fetch("/api/folders")
            .then(res => {
                if (!res.ok) {
                    return res.json().then((err: ApiError) => {
                        throw new Error(err.error || "Failed to fetch folders");
                    });
                }
                return res.json();
            })
            .then(data => {
                if (isMounted) {
                    setAvailableFolders(data);
                }
            })
            .catch(err => {
                if (isMounted) {
                    const errorMessage = err instanceof Error ? err.message : "Failed to fetch folders";
                    setError(errorMessage);
                    console.error("Failed to fetch folders:", err);
                }
            })
            .finally(() => {
                if (isMounted) {
                    setIsLoadingFolders(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    // Auto-save logic
    const saveNote = useCallback(async (newContent: string, newTitle: string, newFolderId: string) => {
        setIsSaving(true);
        setError(null);

        try {
            const res = await fetch(`/api/notes/${note._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: newContent,
                    title: newTitle,
                    folderId: newFolderId ? parseInt(newFolderId) : undefined
                })
            });

            if (!res.ok) {
                const errorData: ApiError = await res.json().catch(() => ({ error: "Failed to save note" }));
                throw new Error(errorData.error || "Failed to save note");
            }

            setLastSaved(new Date());
            setHasUnsavedChanges(false);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "Failed to save note";
            setError(errorMessage);
            console.error("Failed to save", e);
        } finally {
            setIsSaving(false);
        }
    }, [note._id]);

    // Auto-save when content or title changes
    useEffect(() => {
        // Check if there are actual changes
        const contentChanged = debouncedContent !== note.content;
        const titleChanged = debouncedTitle !== note.title;
        const folderChanged = folderId !== (note.folderId || "");

        if (contentChanged || titleChanged || folderChanged) {
            setHasUnsavedChanges(true);
            saveNote(debouncedContent, debouncedTitle, folderId);
        }

        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [debouncedContent, debouncedTitle, folderId, note.content, note.title, note.folderId, saveNote]);

    // Manual save handler
    const handleManualSave = useCallback(() => {
        saveNote(content, title, folderId);
    }, [content, title, folderId, saveNote]);

    // Calculate word and character count
    const stats = useMemo(() => {
        const text = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
        const words = text ? text.split(' ').filter(w => w.length > 0).length : 0;
        const chars = text.length;
        return { words, chars };
    }, [content]);

    // Parse dates
    const createdDate = note.createdAt ? new Date(note.createdAt) : null;
    const modifiedDate = note.updatedAt ? new Date(note.updatedAt) : null;

    // Warn before leaving with unsaved changes
    useEffect(() => {
        if (!hasUnsavedChanges) return;

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = '';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasUnsavedChanges]);

    return (
        <div className="flex h-screen overflow-hidden">
            <div className="flex-1 flex flex-col min-w-0">
                {/* Enhanced Header */}
                <div className="border-b border-white/10 glass px-4 sm:px-6 py-3 sm:py-4 space-y-3">
                    {/* Title */}
                    <div className="flex items-center gap-2">
                        <input
                            className="bg-transparent text-xl sm:text-2xl font-bold outline-none text-gray-300 w-full placeholder:text-muted-foreground"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Untitled Note"
                        />
                        {hasUnsavedChanges && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <span className="w-2 h-2 bg-warning rounded-full animate-pulse" />
                                Unsaved
                            </span>
                        )}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-2 glass-card border border-destructive/30 rounded-lg flex items-center gap-2 text-sm text-destructive animate-slide-in-down">
                            <AlertCircle size={16} />
                            <span className="flex-1">{error}</span>
                            <button
                                onClick={() => setError(null)}
                                className="hover:bg-white/10 rounded p-1 transition-smooth"
                            >
                                <span className="sr-only">Dismiss</span>
                                ×
                            </button>
                        </div>
                    )}

                    {/* Metadata Row */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 font-bold text-muted-foreground">
                            Folder
                            <div className="flex items-center gap-2 glass-card px-2 sm:px-3 py-1.5 rounded-lg">
                                <FolderOpen size={14} className="text-primary flex-shrink-0" />
                                {isLoadingFolders ? (
                                    <Loader2 size={12} className="animate-spin text-primary" />
                                ) : (
                                    <>
                                        <span>{availableFolders.find(f => f.id == parseInt(folderId))?.name}</span>
                                    </>
                                )}
                            </div>

                            {/* Created Date */}
                            {createdDate && (
                                <div className="flex items-center gap-1.5">
                                    <Calendar size={12} />
                                    <span className="hidden sm:inline">Created {format(createdDate, 'MMM d, yyyy')}</span>
                                    <span className="sm:hidden">{format(createdDate, 'MMM d')}</span>
                                </div>
                            )}

                            {/* Modified Date */}
                            {modifiedDate && (
                                <div className="flex items-center gap-1.5">
                                    <Clock size={12} />
                                    <span className="hidden sm:inline">Modified {format(modifiedDate, 'MMM d, yyyy')}</span>
                                    <span className="sm:hidden">{format(modifiedDate, 'MMM d')}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                            {/* AI Toggle Button */}
                            <Button
                                variant={isAIOpen ? "primary" : "ghost"}
                                size="sm"
                                onClick={() => setIsAIOpen(!isAIOpen)}
                                className={cn(
                                    "flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg transition-smooth", "glass-card"
                                )}
                                title={isAIOpen ? "Close AI Assistant" : "Open AI Assistant"}
                            >
                                <Sparkles size={12} />

                                <span className="hidden sm:inline font-bold text-muted-foreground">AI</span>
                            </Button>

                            {/* Word/Character Count */}
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Type size={12} />
                                <span className="hidden sm:inline">{stats.words} words · {stats.chars} characters</span>
                                <span className="sm:hidden">{stats.words}w</span>
                            </div>

                            {/* Save Status */}
                            <button
                                onClick={handleManualSave}
                                disabled={isSaving || !hasUnsavedChanges}
                                className={cn(
                                    "flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg transition-smooth",
                                    isSaving
                                        ? "glass-card text-primary"
                                        : hasUnsavedChanges
                                            ? "glass-card text-warning hover:glass-hover"
                                            : "glass text-success",
                                    "disabled:opacity-50 disabled:cursor-not-allowed"
                                )}
                                title={hasUnsavedChanges ? "Save changes" : "All changes saved"}
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 size={12} className="animate-spin" />
                                        <span className="hidden sm:inline">Saving...</span>
                                    </>
                                ) : hasUnsavedChanges ? (
                                    <>
                                        <Save size={12} />
                                        <span className="hidden sm:inline">Save</span>
                                    </>
                                ) : (
                                    <>
                                        <Check size={12} />
                                        <span className="hidden sm:inline">
                                            {lastSaved
                                                ? `Saved at ${format(lastSaved, 'HH:mm:ss')}`
                                                : "Saved"}
                                        </span>
                                        <span className="sm:hidden">Saved</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Editor */}
                <TipTapEditor content={content} onChange={setContent} />
            </div>

            {/* AI Chat Sidebar */}
            {isAIOpen && (
                <AIChatSidebar contextContent={content} isOpen={isAIOpen} onToggle={() => setIsAIOpen(!isAIOpen)} />
            )}
        </div>
    );
}
