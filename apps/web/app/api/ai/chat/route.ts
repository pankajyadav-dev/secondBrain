import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { GoogleGenerativeAI, Content } from "@google/generative-ai"; // Import Content type
import { authOptions } from "../../../../lib/auth";

// --- Configuration ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const MODEL_NAME = "gemini-1.5-flash";

// --- Retry Helper (Kept for robustness) ---
async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries = 3,
    baseDelay = 1000
): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error: any) {
            lastError = error;

            // Check if it's a rate limit error (429)
            // Note: Error structure can vary, including both 'status' and 'message' checks
            const isRateLimit = error?.status === 429 ||
                error?.message?.includes('429') ||
                error?.message?.includes('RATE_LIMIT_EXCEEDED') ||
                error?.message?.includes('Quota exceeded');

            // Only retry on rate limit errors and if we have retries left
            if (isRateLimit && attempt < maxRetries) {
                const delay = baseDelay * Math.pow(2, attempt);
                console.log(`Rate limit hit, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }

            // If it's not a rate limit error or we're out of retries, throw
            throw error;
        }
    }

    throw lastError!;
}

// --- Main POST Handler ---
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if API key is configured
        if (!process.env.GEMINI_API_KEY) {
            console.error("GEMINI_API_KEY is not configured");
            return NextResponse.json(
                { error: "AI service is not configured. Please contact support." },
                { status: 500 }
            );
        }

        const { message, contextWindow, chatHistory } = await req.json();

        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        // 1. **System Instruction**: Define the model's persona/constraints
        const systemInstruction = `You may ONLY use the contextWindow and chatHistory to answer. 
If information is missing, say:
'I can only answer using the content you provided. Please attach notes or selected text as context.'
Do not hallucinate facts not found in the context.`;

        // 2. **Format History**: Transform the user's flat chatHistory into the structured Content array expected by the Gemini API.
        const structuredHistory: Content[] = chatHistory?.map((msg: any) => ({
            role: msg.role === 'user' ? 'user' : 'model', // Gemini API uses 'model' for the assistant
            parts: [{ text: msg.content }],
        })) || [];

        // 3. **Construct the Full Prompt**: Add the contextWindow, then the new user message.
        // The structuredHistory is passed separately to maintain turn structure.
        const contextContent = contextWindow || "No context provided.";

        // This is the core content that contains the context and the *new* user message.
        // It's structured as a single content object in the 'user' role for the final call.
        const userMessageWithContext: Content = {
            role: "user",
            parts: [{
                text: `
CONTEXT:
${contextContent}

USER:
${message}
`
            }]
        };

        // 4. **Combine History and Current Message**: The prompt sequence for generateContent
        const contents: Content[] = [...structuredHistory, userMessageWithContext];

        // 5. **Model Initialization and API Call**
        const model = genAI.getGenerativeModel({
            model: MODEL_NAME,
            systemInstruction: systemInstruction,
        });

        // Use retry logic for API calls
        const result = await retryWithBackoff(async () => {
            // Pass the entire contents array (history + new message)
            return await model.generateContent({ contents });
        });

        const response = result.response;
        const text = response.text(); // .text() is a method, not a property

        return NextResponse.json({ reply: text });
    } catch (error: any) {
        // --- Error Handling (Kept as is) ---
        console.error("AI Chat error:", error);

        const isRateLimit = error?.status === 429 ||
            error?.message?.includes('429') ||
            error?.message?.includes('RATE_LIMIT_EXCEEDED') ||
            error?.message?.includes('Quota exceeded');

        if (isRateLimit) {
            return NextResponse.json(
                {
                    error: "Rate limit exceeded. Please wait a moment and try again. If this persists, your API quota may need to be increased.",
                    code: "RATE_LIMIT_EXCEEDED"
                },
                { status: 429 }
            );
        }

        if (error?.message?.includes('quota_limit_value":"0"')) {
            return NextResponse.json(
                {
                    error: "API quota not configured. Please check your Google Cloud API key settings and ensure quotas are enabled.",
                    code: "QUOTA_NOT_CONFIGURED"
                },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                error: error?.message || "Internal Server Error",
                code: "INTERNAL_ERROR"
            },
            { status: 500 }
        );
    }
}