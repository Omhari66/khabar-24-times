import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    // 1. Verify Authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized: Admin only" }, { status: 401 });
    }

    // 2. Parse Request
    const body = await req.json();
    const { template, rawData } = body;

    if (!rawData) {
      return NextResponse.json({ error: "Raw data is required" }, { status: 400 });
    }

    // 3. Construct System Prompt based on Template
    let systemPrompt = `You are a professional, objective news reporter writing for a respected publication. Your task is to take raw facts and turn them into a polished, concise news article.

CRITICAL INSTRUCTIONS:
- ONLY output HTML. Do NOT include markdown code blocks (e.g. \`\`\`html).
- Use proper HTML tags like <h2>, <p>, <strong>, <em>, and <ul>/<li>.
- Do NOT include <html>, <head>, or <body> tags. Just the raw HTML content suitable for inserting into a rich-text editor.
- Keep the tone highly objective, formal, and strictly journalistic.
- Do NOT hallucinate facts. Only use the data provided. If data is missing, write around it smoothly.
- Keep it concise, typically 2-4 paragraphs unless there is a lot of data.`;

    switch (template) {
      case "sports":
        systemPrompt += `\n\nTEMPLATE STYLE: Sports Report. Focus on the final score, key players, and the implications of the match. Use energetic but professional sports journalism terminology.`;
        break;
      case "weather":
        systemPrompt += `\n\nTEMPLATE STYLE: Weather Update. Focus on current conditions, upcoming forecasts, and any severe weather warnings. Be clear and emphasize public safety if necessary.`;
        break;
      case "earnings":
        systemPrompt += `\n\nTEMPLATE STYLE: Corporate Earnings Report. Focus on revenue, EPS (Earnings Per Share), guidance, and market reaction. Use formal financial journalism terminology.`;
        break;
      default:
        systemPrompt += `\n\nTEMPLATE STYLE: General News Report. Focus on the most important facts first (inverted pyramid style: Who, what, when, where, why).`;
    }

    // 4. Call Groq API
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return NextResponse.json({ error: "AI service is not configured" }, { status: 500 });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile", // Current supported model
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Raw Data to turn into a news story:\n\n${rawData}` }
        ],
        temperature: 0.3, // Low temperature for factual reporting
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API Error:", errorText);
      return NextResponse.json({ error: "Failed to generate story with AI" }, { status: 502 });
    }

    const data = await response.json();
    const generatedHtml = data.choices[0]?.message?.content || "";

    // 5. Clean up any markdown code blocks the AI might have accidentally added
    const cleanHtml = generatedHtml.replace(/^```html\n?/i, "").replace(/```$/i, "").trim();

    return NextResponse.json({ html: cleanHtml }, { status: 200 });

  } catch (error) {
    console.error("AI Generation Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
