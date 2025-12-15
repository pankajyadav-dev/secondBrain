
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../../lib/auth";
import { prisma } from "@repo/database";
import { AppSidebar } from "../../../components/AppSidebar";
import { EditorClientWrapper } from "../../../components/EditorClientWrapper";


export default async function EditorPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        redirect("/login");
    }

    const { id } = await params;

    const noteId = parseInt(id);
    const authorId = parseInt(session.user.id);

    if (isNaN(noteId) || isNaN(authorId)) {
        return (
            <div className="flex h-screen items-center justify-center">
                Invalid note ID
            </div>
        );
    }

    const note = await prisma.notes.findFirst({
        where: {
            id: noteId,
            authorId: authorId,
        },
    });

    if (!note) {
        return (
            <div className="flex h-screen items-center justify-center">
                Note not found
            </div>
        );
    }

    // Serializable object
    const noteData = {
        _id: note.id.toString(),
        title: note.title,
        content: note.content,
        folderId: note.folderId.toString(),
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString(),
    };

    return (
        <div className="flex h-screen overflow-hidden bg-gray-500">
            <AppSidebar />
            <main className="flex-1 flex flex-col min-w-0 bg-background border-r border-white/10">
                <EditorClientWrapper note={noteData} />
            </main>
        </div>
    );
}
