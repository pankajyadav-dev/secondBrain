import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "@repo/database";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const { name } = body;

        if (!name || typeof name !== 'string' || !name.trim()) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        const folderId = parseInt(id);
        const authorId = parseInt(session.user.id);
        
        if (isNaN(folderId) || isNaN(authorId)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        const folder = await prisma.folder.updateMany({
            where: {
                id: folderId,
                authorId: authorId,
            },
            data: {
                name: name.trim(),
            },
        });

        if (folder.count === 0) {
            return NextResponse.json({ error: "Folder not found" }, { status: 404 });
        }

        const updatedFolder = await prisma.folder.findUnique({
            where: { id: folderId },
        });

        return NextResponse.json(updatedFolder);
    } catch (error) {
        console.error("Update folder error:", error);
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

        const folderId = parseInt(id);
        const authorId = parseInt(session.user.id);
        
        if (isNaN(folderId) || isNaN(authorId)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        // First check if folder exists and belongs to user
        const folder = await prisma.folder.findFirst({
            where: {
                id: folderId,
                authorId: authorId,
            },
        });

        if (!folder) {
            return NextResponse.json({ error: "Folder not found" }, { status: 404 });
        }

        // Prisma will cascade delete notes due to onDelete: Cascade in schema
        // Delete folder (cascade will handle notes)
        await prisma.folder.delete({
            where: { id: folderId },
        });

        return NextResponse.json({ message: "Folder deleted" });
    } catch (error) {
        console.error("Delete folder error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
