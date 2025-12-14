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

        const { name } = await req.json();

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        const authorId = parseInt(session.user.id);
        if (isNaN(authorId)) {
            return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
        }

        const folder = await prisma.folder.create({
            data: {
                authorId,
                name,
            },
        });

        return NextResponse.json(folder, { status: 201 });
    } catch (error) {
        console.error("Create folder error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const authorId = parseInt(session.user.id);
        if (isNaN(authorId)) {
            return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
        }

        const folders = await prisma.folder.findMany({
            where: { authorId },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(folders);
    } catch (error) {
        console.error("Get folders error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
