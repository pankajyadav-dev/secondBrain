
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
    };

    return (
        <div className="flex h-screen overflow-hidden">
            <AppSidebar />

            <main className="flex-1 flex flex-col min-w-0 bg-background border-r border-white/10">
                <EditorClientWrapper note={noteData} />
            </main>

            {/* AI Sidebar is passed the content. 
          Ideally, Client Wrapper should pass current content to AI Sidebar, 
          but they are siblings here. 
          We can wrap them in a context or pass state up.
          For strict 'siblings' layout without prop drilling from a parent client component that holds state, 
          it is hard to sync "current typed text" to "AI Sidebar" precisely in real-time unless they share a parent.
          
          I will create a client component `EditorLayout` that holds the state `content` and renders both `Editor` and `AIChat`.
      */}
        </div>
    );
}
