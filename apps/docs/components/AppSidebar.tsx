"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Folder as FolderIcon,
    FileText,
    Plus,
    Trash2,
    Edit2,
    Search,
    MoreVertical,
    LogOut,
    User
} from "lucide-react";

import { signOut, useSession } from "next-auth/react";
import { ContextMenu, ContextMenuItem } from "@repo/ui/ContextMenu";
import { Button } from "@repo/ui/Button";
import { Input } from "@repo/ui/Input";
import { cn } from "../../../packages/ui/utils/cn";
import { Badge } from "@repo/ui/Badge";
import { ConfirmDialog } from "@repo/ui/Dialog";

interface Folder {
    _id: string;
    name: string;
}

interface Note {
    _id: string;
    title: string;
    folderId?: string;
}

export function AppSidebar() {
    const [folders, setFolders] = useState<Folder[]>([]);
    const [notes, setNotes] = useState<Note[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");

    // Context menu state
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; folderId: string } | null>(null);

    // Dialog states
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; folderId?: string; folderName?: string }>({ open: false });
    const [renameDialog, setRenameDialog] = useState<{ open: boolean; folderId?: string; currentName?: string }>({ open: false });
    const [renameFolderName, setRenameFolderName] = useState("");

    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedFolderId = searchParams.get("folderId");
    const { data: session } = useSession();

    useEffect(() => {
        fetchFolders();
        fetchNotes(selectedFolderId);
    }, [selectedFolderId]);

    const fetchFolders = async () => {
        const res = await fetch("/api/folders");
        if (res.ok) setFolders(await res.json());
    };

    const fetchNotes = async (folderId: string | null) => {
        const url = folderId ? `/api/notes?folderId=${folderId}` : "/api/notes";
        const res = await fetch(url);
        if (res.ok) setNotes(await res.json());
    };

    const createFolder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFolderName.trim()) return;

        const res = await fetch("/api/folders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newFolderName }),
        });

        if (res.ok) {
            setNewFolderName("");
            setIsCreatingFolder(false);
            fetchFolders();
        }
    };

    const createNote = async () => {
        const res = await fetch("/api/notes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: "Untitled Note", folderId: selectedFolderId }),
        });

        if (res.ok) {
            const note = await res.json();
            router.push(`/editor/${note._id}`);
            fetchNotes(selectedFolderId);
        }
    };

    const handleFolderContextMenu = (e: React.MouseEvent, folderId: string) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, folderId });
    };

    const handleRenameFolder = async () => {
        if (!renameDialog.folderId || !renameFolderName.trim()) return;

        const res = await fetch(`/api/folders/${renameDialog.folderId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: renameFolderName }),
        });

        if (res.ok) {
            fetchFolders();
            setRenameDialog({ open: false });
            setRenameFolderName("");
        }
    };

    const handleDeleteFolder = async () => {
        if (!deleteDialog.folderId) return;

        const res = await fetch(`/api/folders/${deleteDialog.folderId}`, {
            method: "DELETE",
        });

        if (res.ok) {
            fetchFolders();
            if (selectedFolderId === deleteDialog.folderId) {
                router.push("/dashboard");
            }
            setDeleteDialog({ open: false });
        }
    };

    const getContextMenuItems = (folderId: string): ContextMenuItem[] => {
        const folder = folders.find(f => f._id === folderId);
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
    const filteredNotes = notes.filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Count notes per folder
    const getNotesCount = (folderId: string) => {
        return notes.filter(n => n.folderId === folderId).length;
    };

    return (
        <>
            <div className="w-72 border-r border-white/10 glass-card h-screen flex flex-col animate-slide-in-up">
                {/* Header */}
                <div className="p-4 border-b border-white/10 flex justify-between items-center">
                    <div>
                        <h1 className="font-bold text-xl bg-gradient-primary bg-clip-text text-transparent">
                            Second Brain
                        </h1>
                        <p className="text-xs text-muted-foreground mt-0.5">Organize your thoughts</p>
                    </div>
                    <Button
                        onClick={createNote}
                        size="sm"
                        variant="primary"
                        className="rounded-full w-9 h-9 p-0"
                    >
                        <Plus size={18} />
                    </Button>
                </div>

                {/* Search */}
                <div className="p-3 border-b border-white/10">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                        <Input
                            placeholder="Search notes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-9"
                        />
                    </div>
                </div>

                {/* Folders & Notes */}
                <div className="flex-1 overflow-y-auto p-3">
                    {/* Folders Section */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center px-2 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Folders
                            <button
                                onClick={() => setIsCreatingFolder(true)}
                                className="hover:text-white transition-smooth"
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
                                    className="h-8 text-sm"
                                />
                            </form>
                        )}

                        <div className="space-y-1">
                            {folders.map(folder => (
                                <div
                                    key={folder._id}
                                    onContextMenu={(e) => handleFolderContextMenu(e, folder._id)}
                                    className="relative group"
                                >
                                    <Link
                                        href={`/dashboard?folderId=${folder._id}`}
                                        className={cn(
                                            "flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-smooth",
                                            selectedFolderId === folder._id
                                                ? "glass-card text-white"
                                                : "text-gray-400 hover:text-white hover:bg-white/5"
                                        )}
                                    >
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <FolderIcon size={16} className="flex-shrink-0" />
                                            <span className="truncate">{folder.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="default">{getNotesCount(folder._id)}</Badge>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleFolderContextMenu(e, folder._id);
                                                }}
                                                className="opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded p-1 transition-smooth"
                                            >
                                                <MoreVertical size={14} />
                                            </button>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                            {folders.length === 0 && (
                                <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                                    <FolderIcon className="mx-auto mb-2 opacity-50" size={24} />
                                    <p className="text-xs">No folders yet</p>
                                    <p className="text-xs mt-1">Click + to create one</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Notes Section */}
                    <div>
                        <div className="px-2 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {selectedFolderId ? "Notes" : "Select a Folder"}
                        </div>
                        <div className="space-y-1">
                            {!selectedFolderId ? (
                                <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                                    <FileText className="mx-auto mb-2 opacity-50" size={24} />
                                    <p className="text-xs">Select a folder to view notes</p>
                                </div>
                            ) : filteredNotes.length === 0 ? (
                                <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                                    {searchQuery ? "No notes found" : "No notes yet"}
                                </div>
                            ) : (
                                filteredNotes.map(note => (
                                    <Link
                                        key={note._id}
                                        href={`/editor/${note._id}`}
                                        className="block px-3 py-2 rounded-lg text-sm transition-smooth text-gray-300 hover:text-white hover:bg-white/5"
                                    >
                                        <div className="flex items-center gap-2">
                                            <FileText size={14} className="flex-shrink-0 text-primary" />
                                            <span className="truncate">{note.title || "Untitled"}</span>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* User Profile Footer */}
                <div className="p-3 border-t border-white/10">
                    <div className="flex items-center justify-between glass px-3 py-2 rounded-lg">
                        <div className="flex items-center gap-2 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                                {session?.user?.email?.[0]?.toUpperCase() || "U"}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-white truncate">
                                    {session?.user?.email?.split('@')[0] || "User"}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                    {session?.user?.email}
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={() => signOut({ callbackUrl: "/login" })}
                            variant="ghost"
                            size="sm"
                            className="flex-shrink-0 w-8 h-8 p-0"
                        >
                            <LogOut size={14} />
                        </Button>
                    </div>
                </div>
            </div>

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
