import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { authOptions } from "../../../../lib/auth";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { message, contextWindow, chatHistory } = await req.json();

        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        // Construct the prompt
        // We can use the chat capability of the SDK, but sticking to the prompt structure requested might be clearer 
        // or easier to enforce the "ONLY context" rule.
        // However, sending history as part of the prompt is fine.

        const systemInstruction = `You may ONLY use the contextWindow and chatHistory to answer. 
If information is missing, say:
'I can only answer using the content you provided. Please attach notes or selected text as context.'
Do not hallucinate facts not found in the context.`;

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: systemInstruction
        });

        // We can construct the full history for the model or just prompt it.
        // The requirement says: "Backend forms the final instruction... CONTEXT... CHAT HISTORY... USER".
        // This implies we are treating it as a single turn (or few-shot) prompt to the model, OR we can use startChat.
        // Given strict formatting request, I'll formulate a single prompt string.

        // Format chat history
        const historyText = chatHistory?.map((msg: any) => `${msg.role === 'user' ? 'USER' : 'ASSISTANT'}: ${msg.content}`).join('\n') || "None";

        const fullPrompt = `
CONTEXT:
${contextWindow || "No context provided."}

CHAT HISTORY:
${historyText}

USER:
${message}
`;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ reply: text });
    } catch (error) {
        console.error("AI Chat error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
