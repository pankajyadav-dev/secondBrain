"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
    Folder as FolderIcon,
    FileText,
    Plus,
    Trash2,
    Edit2,
    Search,
    MoreVertical,
    LogOut,
    Menu,
    X,
    Loader2,
    AlertCircle
} from "lucide-react";

import { signOut, useSession } from "next-auth/react";
import { ContextMenu, ContextMenuItem } from "@repo/ui/ContextMenu";
import { Button } from "@repo/ui/Button";
import { Input } from "@repo/ui/Input";
import { cn } from "../../../packages/ui/utils/cn";
import { Badge } from "@repo/ui/Badge";
import { ConfirmDialog } from "@repo/ui/Dialog";
import { useDebounce } from "../hooks/useDebounce";

interface Folder {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
}

interface Note {
    id: number;
    title: string;
    folderId: number;
    updatedAt: string;
}

interface ApiError {
    error: string;
}

export function AppSidebar() {
    const [folders, setFolders] = useState<Folder[]>([]);
    const [notes, setNotes] = useState<Note[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isLoadingFolders, setIsLoadingFolders] = useState(true);
    const [isLoadingNotes, setIsLoadingNotes] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCreatingNote, setIsCreatingNote] = useState(false);

    // Context menu state
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; folderId: string } | null>(null);

    // Dialog states
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; folderId?: string; folderName?: string }>({ open: false });
    const [renameDialog, setRenameDialog] = useState<{ open: boolean; folderId?: string; currentName?: string }>({ open: false });
    const [renameFolderName, setRenameFolderName] = useState("");

    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const selectedFolderId = searchParams.get("folderId");
    const { data: session } = useSession();

    // Debounce search query
    const debouncedSearch = useDebounce(searchQuery, 300);

    // Fetch folders with error handling
    const fetchFolders = useCallback(async () => {
        setIsLoadingFolders(true);
        setError(null);
        try {
            const res = await fetch("/api/folders");
            if (!res.ok) {
                const errorData: ApiError = await res.json().catch(() => ({ error: "Failed to fetch folders" }));
                throw new Error(errorData.error || "Failed to fetch folders");
            }
            const data = await res.json();
            setFolders(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to fetch folders";
            setError(errorMessage);
            console.error("Error fetching folders:", err);
        } finally {
            setIsLoadingFolders(false);
        }
    }, []);

    // Fetch notes with error handling
    const fetchNotes = useCallback(async (folderId: string | null) => {
        setIsLoadingNotes(true);
        setError(null);
        try {
            const url = folderId ? `/api/notes?folderId=${folderId}` : "/api/notes";
            const res = await fetch(url);
            if (!res.ok) {
                const errorData: ApiError = await res.json().catch(() => ({ error: "Failed to fetch notes" }));
                throw new Error(errorData.error || "Failed to fetch notes");
            }
            const data = await res.json();
            setNotes(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to fetch notes";
            setError(errorMessage);
            console.error("Error fetching notes:", err);
        } finally {
            setIsLoadingNotes(false);
        }
    }, []);

    useEffect(() => {
        fetchFolders();
    }, [fetchFolders]);

    useEffect(() => {
        fetchNotes(selectedFolderId);
    }, [selectedFolderId, fetchNotes]);

    const createFolder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFolderName.trim()) return;

        const trimmedName = newFolderName.trim();
        setError(null);

        // Optimistic update
        const tempId = Date.now();
        const optimisticFolder: Folder = {
            id: tempId,
            name: trimmedName,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        setFolders(prev => [optimisticFolder, ...prev]);

        try {
            const res = await fetch("/api/folders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: trimmedName }),
            });

            if (!res.ok) {
                const errorData: ApiError = await res.json().catch(() => ({ error: "Failed to create folder" }));
                throw new Error(errorData.error || "Failed to create folder");
            }

            const newFolder = await res.json();
            setFolders(prev => prev.map(f => f.id === tempId ? newFolder : f));
            setNewFolderName("");
            setIsCreatingFolder(false);
        } catch (err) {
            // Revert optimistic update
            setFolders(prev => prev.filter(f => f.id !== tempId));
            const errorMessage = err instanceof Error ? err.message : "Failed to create folder";
            setError(errorMessage);
            console.error("Error creating folder:", err);
        }
    };

    const createNote = async () => {
        if (isCreatingNote) return;

        setIsCreatingNote(true);
        setError(null);

        try {
            const res = await fetch("/api/notes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: "Untitled Note",
                    folderId: selectedFolderId ? parseInt(selectedFolderId) : undefined
                }),
            });

            if (!res.ok) {
                const errorData: ApiError = await res.json().catch(() => ({ error: "Failed to create note" }));
                throw new Error(errorData.error || "Failed to create note");
            }

            const note = await res.json();
            router.push(`/editor/${note.id}`);
            fetchNotes(selectedFolderId);
            setIsMobileOpen(false);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to create note";
            setError(errorMessage);
            console.error("Error creating note:", err);
        } finally {
            setIsCreatingNote(false);
        }
    };

    const handleFolderContextMenu = (e: React.MouseEvent, folderId: string) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY, folderId });
    };

    const handleRenameFolder = async () => {
        if (!renameDialog.folderId || !renameFolderName.trim()) return;

        const trimmedName = renameFolderName.trim();
        const folderId = renameDialog.folderId;
        setError(null);

        // Optimistic update
        const originalFolders = [...folders];
        setFolders(prev => prev.map(f =>
            f.id.toString() === folderId ? { ...f, name: trimmedName } : f
        ));

        try {
            const res = await fetch(`/api/folders/${folderId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: trimmedName }),
            });

            if (!res.ok) {
                const errorData: ApiError = await res.json().catch(() => ({ error: "Failed to rename folder" }));
                throw new Error(errorData.error || "Failed to rename folder");
            }

            fetchFolders();
            setRenameDialog({ open: false });
            setRenameFolderName("");
        } catch (err) {
            // Revert optimistic update
            setFolders(originalFolders);
            const errorMessage = err instanceof Error ? err.message : "Failed to rename folder";
            setError(errorMessage);
            console.error("Error renaming folder:", err);
        }
    };

    const handleDeleteFolder = async () => {
        if (!deleteDialog.folderId) return;

        const folderId = deleteDialog.folderId;
        setError(null);

        // Optimistic update
        const originalFolders = [...folders];
        setFolders(prev => prev.filter(f => f.id.toString() !== folderId));

        try {
            const res = await fetch(`/api/folders/${folderId}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const errorData: ApiError = await res.json().catch(() => ({ error: "Failed to delete folder" }));
                throw new Error(errorData.error || "Failed to delete folder");
            }

            if (selectedFolderId === folderId) {
                router.push("/dashboard");
            }
            setDeleteDialog({ open: false });
            fetchFolders();
        } catch (err) {
            // Revert optimistic update
            setFolders(originalFolders);
            const errorMessage = err instanceof Error ? err.message : "Failed to delete folder";
            setError(errorMessage);
            console.error("Error deleting folder:", err);
        }
    };

    const getContextMenuItems = (folderId: string): ContextMenuItem[] => {
        const folder = folders.find(f => f.id.toString() === folderId);
        return [
            {
                label: "Rename",
                icon: <Edit2 size={14} />,
                onClick: () => {
                    setRenameDialog({ open: true, folderId, currentName: folder?.name });
                    setRenameFolderName(folder?.name || "");
                },
            },
            {
                label: "Delete",
                icon: <Trash2 size={14} />,
                onClick: () => {
                    setDeleteDialog({ open: true, folderId, folderName: folder?.name });
                },
                variant: "destructive" as const,
            },
        ];
    };

    // Filter notes based on search
    const filteredNotes = useMemo(() => {
        if (!debouncedSearch) return notes;
        const query = debouncedSearch.toLowerCase();
        return notes.filter(note =>
            note.title.toLowerCase().includes(query)
        );
    }, [notes, debouncedSearch]);

    // Count notes per folder
    const getNotesCount = useCallback((folderId: string) => {
        const folderIdNum = parseInt(folderId);
        return notes.filter(n => n.folderId === folderIdNum).length;
    }, [notes]);

    // Check if current path is editor
    const isEditorPage = pathname?.startsWith("/editor");

    const sidebarContent = (
        <>
            {/* Header */}
            <div className="p-3 sm:p-4 border-b border-white/10 flex justify-between items-center">
                <div className="min-w-0 flex-1">
                    <h1 className="font-bold text-lg sm:text-xl  bg-clip-text text-gray-200 truncate">
                        Second Brain
                    </h1>
                    <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">Organize your thoughts</p>
                </div>

            </div>

            {/* Error Message */}
            {error && (
                <div className="mx-3 mt-3 p-2 glass-card border border-destructive/30 rounded-lg flex items-center gap-2 text-sm text-destructive animate-slide-in-down">
                    <AlertCircle size={16} />
                    <span className="flex-1 truncate">{error}</span>
                    <button
                        onClick={() => setError(null)}
                        className="hover:bg-white/10 rounded p-1 transition-smooth"
                    >
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* Search */}
            <div className="p-3 border-b border-white/10">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input
                        placeholder="Search notes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-9 text-sm"
                    />
                </div>
            </div>

            {/* Folders & Notes */}
            <div className="flex-1 overflow-y-auto p-3">
                {/* Folders Section */}
                <div className="mb-6">
                    <div className="flex justify-between items-center px-2 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        <span>Folders</span>
                        <button
                            onClick={() => setIsCreatingFolder(true)}
                            className="hover:text-white transition-smooth p-1 rounded"
                            title="Create folder"
                        >
                            <Plus size={14} />
                        </button>
                    </div>

                    {isCreatingFolder && (
                        <form onSubmit={createFolder} className="px-2 mb-2">
                            <Input
                                autoFocus
                                placeholder="Folder name..."
                                value={newFolderName}
                                onChange={e => setNewFolderName(e.target.value)}
                                onBlur={() => {
                                    if (!newFolderName.trim()) setIsCreatingFolder(false);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Escape") {
                                        setIsCreatingFolder(false);
                                        setNewFolderName("");
                                    }
                                }}
                                className="h-8 text-sm"
                            />
                        </form>
                    )}

                    {isLoadingFolders ? (
                        <div className="px-3 py-6 flex items-center justify-center">
                            <Loader2 size={20} className="animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {folders.map(folder => {
                                const folderIdStr = folder.id.toString();
                                const isSelected = selectedFolderId === folderIdStr;
                                return (
                                    <div
                                        key={folder.id}
                                        onContextMenu={(e) => handleFolderContextMenu(e, folderIdStr)}
                                        className="relative group"
                                    >
                                        <Link
                                            href={`/dashboard?folderId=${folderIdStr}`}
                                            onClick={() => setIsMobileOpen(false)}
                                            className={cn(
                                                "flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-smooth",
                                                isSelected
                                                    ? "glass-card text-white"
                                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                                            )}
                                        >
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <FolderIcon
                                                    size={16}
                                                    className={cn(
                                                        "flex-shrink-0 transition-smooth",
                                                        isSelected && "text-primary"
                                                    )}
                                                />
                                                <span className="truncate">{folder.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <Badge variant="default" className="text-xs">
                                                    {getNotesCount(folderIdStr)}
                                                </Badge>
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleFolderContextMenu(e, folderIdStr);
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded p-1 transition-smooth"
                                                    title="Folder options"
                                                >
                                                    <MoreVertical size={14} />
                                                </button>
                                            </div>
                                        </Link>
                                    </div>
                                );
                            })}
                            {folders.length === 0 && !isLoadingFolders && (
                                <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                                    <FolderIcon className="mx-auto mb-2 opacity-50" size={24} />
                                    <p className="text-xs">No folders yet</p>
                                    <p className="text-xs mt-1">Click + to create one</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Notes Section */}
                <div>
                    <div className="px-2 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {selectedFolderId ? "Notes" : "All Notes"}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <span>Create New Note</span>
                        <Button
                            onClick={createNote}
                            size="sm"
                            variant="primary"
                            disabled={isCreatingNote}
                            className="rounded-full w-8 h-8 sm:w-9 sm:h-9 p-0"
                            title="Create new note"
                        >
                            {isCreatingNote ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
                            )}
                        </Button>
                        <Button
                            onClick={() => setIsMobileOpen(false)}
                            variant="ghost"
                            size="sm"
                            className="lg:hidden rounded-full w-8 h-8 p-0"
                        >
                            <X size={16} />
                        </Button>
                    </div>
                    {isLoadingNotes ? (
                        <div className="px-3 py-6 flex items-center justify-center">
                            <Loader2 size={20} className="animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {!selectedFolderId && folders.length > 0 ? (
                                <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                                    <FileText className="mx-auto mb-2 opacity-50" size={24} />
                                    <p className="text-xs">Select a folder to view notes</p>
                                </div>
                            ) : filteredNotes.length === 0 ? (
                                <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                                    {debouncedSearch ? (
                                        <>
                                            <Search className="mx-auto mb-2 opacity-50" size={24} />
                                            <p className="text-xs">No notes found</p>
                                            <p className="text-xs mt-1">Try a different search term</p>
                                        </>
                                    ) : (
                                        <>
                                            <FileText className="mx-auto mb-2 opacity-50" size={24} />
                                            <p className="text-xs">No notes yet</p>
                                            <p className="text-xs mt-1">Click + to create one</p>
                                        </>
                                    )}
                                </div>
                            ) : (
                                filteredNotes.map(note => {
                                    const isActive = isEditorPage && pathname === `/editor/${note.id}`;
                                    return (
                                        <Link
                                            key={note.id}
                                            href={`/editor/${note.id}`}
                                            onClick={() => setIsMobileOpen(false)}
                                            className={cn(
                                                "block px-3 py-2 rounded-lg text-sm transition-smooth",
                                                isActive
                                                    ? "glass-card text-white"
                                                    : "text-gray-300 hover:text-white hover:bg-white/5"
                                            )}
                                        >
                                            <div className="flex items-center gap-2">
                                                <FileText
                                                    size={14}
                                                    className={cn(
                                                        "flex-shrink-0",
                                                        isActive ? "text-primary" : "text-primary/70"
                                                    )}
                                                />
                                                <span className="truncate">{note.title || "Untitled"}</span>
                                            </div>
                                        </Link>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* User Profile Footer */}
            <div className="p-3 border-t border-white/10">
                <div className="flex items-center justify-between glass px-3 py-2 rounded-sm">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                            {session?.user?.email?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div className="min-w-0 flex-1 hidden sm:block">
                            <p className=" font-bold text-gray-100 truncate">
                                {session?.user?.email?.split('@')[0] || "User"}
                            </p>
                            <p className="text-xs text-gray-200 truncate">
                                {session?.user?.email}
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        variant="ghost"
                        size="sm"
                        className="flex-shrink-0 w-8 h-8 p-0"
                        title="Sign out"
                    >
                        <LogOut size={14} />
                    </Button>
                </div>
            </div>
        </>
    );

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-50 glass-card p-2 rounded-lg shadow-lg"
                aria-label="Open menu"
            >
                <Menu size={20} />
            </button>

            {/* Sidebar */}
            <div className={cn(
                "fixed lg:static inset-y-0 left-0 z-40 w-72 border-r border-white/10 glass-card h-screen flex flex-col animate-slide-in-up transition-transform duration-300",
                isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}>
                {sidebarContent}
            </div>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Context Menu */}
            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    items={getContextMenuItems(contextMenu.folderId)}
                    onClose={() => setContextMenu(null)}
                />
            )}

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={deleteDialog.open}
                onClose={() => setDeleteDialog({ open: false })}
                onConfirm={handleDeleteFolder}
                title="Delete Folder"
                description={`Are you sure you want to delete "${deleteDialog.folderName}"? This will not delete the notes inside.`}
                confirmText="Delete"
                variant="destructive"
            />

            {/* Rename Dialog */}
            {renameDialog.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setRenameDialog({ open: false })} />
                    <div className="relative glass-card rounded-2xl p-6 max-w-md w-full mx-4 animate-scale-in">
                        <h2 className="text-xl font-bold text-white mb-4">Rename Folder</h2>
                        <Input
                            autoFocus
                            value={renameFolderName}
                            onChange={(e) => setRenameFolderName(e.target.value)}
                            placeholder="Folder name"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleRenameFolder();
                                if (e.key === "Escape") setRenameDialog({ open: false });
                            }}
                        />
                        <div className="flex gap-3 justify-end mt-6">
                            <Button variant="ghost" onClick={() => setRenameDialog({ open: false })}>
                                Cancel
                            </Button>
                            <Button variant="primary" onClick={handleRenameFolder}>
                                Rename
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
