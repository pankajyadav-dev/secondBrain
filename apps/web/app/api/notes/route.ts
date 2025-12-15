import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "@repo/database";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { title, content, folderId } = await req.json();

        const authorId = parseInt(session.user.id);
        if (isNaN(authorId)) {
            return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
        }

        let folderIdInt: number;

        if (folderId) {
            //convert the folderid from string to int for postgres query 
            folderIdInt = parseInt(folderId);
            if (isNaN(folderIdInt)) {
                return NextResponse.json({ error: "Invalid folder ID" }, { status: 400 });
            }
            // Verify folder exists and belongs to user
            const folder = await prisma.folder.findFirst({
                where: {
                    id: folderIdInt,
                    authorId: authorId,
                },
            });
            if (!folder) {
                return NextResponse.json({ error: "Folder not found" }, { status: 404 });
            }
        } else {
            // Find or create default "Unfiled" folder
            let defaultFolder = await prisma.folder.findFirst({
                where: {
                    authorId: authorId,
                    name: "Unfiled",
                },
            });

            if (!defaultFolder) {
                defaultFolder = await prisma.folder.create({
                    data: {
                        authorId,
                        name: "Unfiled",
                    },
                });
            }
            folderIdInt = defaultFolder.id;
        }

        const note = await prisma.notes.create({
            data: {
                authorId,
                folderId: folderIdInt,
                title: title || "Untitled",
                content: content || "",
            },
        });

        return NextResponse.json(note, { status: 201 });
    } catch (error) {
        console.error("Create note error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const folderId = searchParams.get("folderId");
        const search = searchParams.get("search");

        const authorId = parseInt(session.user.id);
        if (isNaN(authorId)) {
            return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
        }

        const where: any = {
            authorId: authorId,
        };

        if (folderId) {
            const folderIdInt = parseInt(folderId);
            if (!isNaN(folderIdInt)) {
                where.folderId = folderIdInt;
            }
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: "insensitive" } },
                { content: { contains: search, mode: "insensitive" } },
            ];
        }

        const notes = await prisma.notes.findMany({
            where,
            orderBy: { updatedAt: "desc" },
        });

        return NextResponse.json(notes);
    } catch (error) {
        console.error("Get notes error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
