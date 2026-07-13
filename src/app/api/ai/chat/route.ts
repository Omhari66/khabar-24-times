import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized: Admin only" }, { status: 401 });
    }

    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages are required" }, { status: 400 });
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return NextResponse.json({ error: "AI service is not configured" }, { status: 500 });
    }

    const systemMessage = {
      role: "system",
      content: `आप एक सहायक AI हैं जो Khabar 24 Times समाचार एजेंसी के Admin की मदद करते हैं। 
आप हिंदी और अंग्रेजी दोनों में उत्तर दे सकते हैं — उस भाषा में जिसमें प्रश्न पूछा गया हो।
आप समाचार लेखन, संपादन, SEO, हेडलाइन सुझाव, ट्रेंडिंग टॉपिक, और सामान्य पत्रकारिता सलाह में विशेषज्ञ हैं।
आप किसी भी सामान्य प्रश्न का भी उत्तर दे सकते हैं।`
    };

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [systemMessage, ...messages],
        temperature: 0.7,
        max_tokens: 2048
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error("Groq Chat Error:", errData);
      return NextResponse.json({ error: "AI chat service failed" }, { status: 502 });
    }

    const data = await response.json();
    const reply = data.choices[0]?.message?.content || "";

    return NextResponse.json({ reply }, { status: 200 });

  } catch (error) {
    console.error("AI Chat Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
