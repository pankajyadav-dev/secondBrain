import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "@repo/database";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const noteId = parseInt(id);
        const authorId = parseInt(session.user.id);
        
        if (isNaN(noteId) || isNaN(authorId)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        const note = await prisma.notes.findFirst({
            where: {
                id: noteId,
                authorId: authorId,
            },
        });

        if (!note) {
            return NextResponse.json({ error: "Note not found" }, { status: 404 });
        }

        return NextResponse.json(note);
    } catch (error) {
        console.error("Get note error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { id } = await params;

        const noteId = parseInt(id);
        const authorId = parseInt(session.user.id);
        
        if (isNaN(noteId) || isNaN(authorId)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        // Verify note exists and belongs to user
        const existingNote = await prisma.notes.findFirst({
            where: {
                id: noteId,
                authorId: authorId,
            },
        });

        if (!existingNote) {
            return NextResponse.json({ error: "Note not found" }, { status: 404 });
        }

        // Prepare update data (only allow updating title, content, folderId)
        const updateData: any = {};
        if (body.title !== undefined) updateData.title = body.title;
        if (body.content !== undefined) updateData.content = body.content;
        if (body.folderId !== undefined) {
            const folderId = parseInt(body.folderId);
            if (!isNaN(folderId)) {
                // Verify folder exists and belongs to user
                const folder = await prisma.folder.findFirst({
                    where: {
                        id: folderId,
                        authorId: authorId,
                    },
                });
                if (!folder) {
                    return NextResponse.json({ error: "Folder not found" }, { status: 404 });
                }
                updateData.folderId = folderId;
            }
        }

        const note = await prisma.notes.update({
            where: { id: noteId },
            data: updateData,
        });

        return NextResponse.json(note);
    } catch (error) {
        console.error("Update note error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const noteId = parseInt(id);
        const authorId = parseInt(session.user.id);
        
        if (isNaN(noteId) || isNaN(authorId)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        // Verify note exists and belongs to user
        const note = await prisma.notes.findFirst({
            where: {
                id: noteId,
                authorId: authorId,
            },
        });

        if (!note) {
            return NextResponse.json({ error: "Note not found" }, { status: 404 });
        }

        await prisma.notes.delete({
            where: { id: noteId },
        });

        return NextResponse.json({ message: "Note deleted" });
    } catch (error) {
        console.error("Delete note error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
