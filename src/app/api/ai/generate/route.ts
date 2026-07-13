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
    let systemPrompt = `आप एक पेशेवर, निष्पक्ष हिंदी समाचार पत्रकार हैं जो एक प्रतिष्ठित प्रकाशन के लिए लिखते हैं। आपका काम कच्चे तथ्यों को एक परिष्कृत, संक्षिप्त समाचार लेख में बदलना है।

अनिवार्य निर्देश:
- उत्तर केवल शुद्ध हिंदी में दें। अंग्रेजी का उपयोग केवल उचित नाम, ब्रांड और तकनीकी शब्दों के लिए करें।
- केवल HTML आउटपुट करें। Markdown code blocks (जैसे \`\`\`html) शामिल न करें।
- उचित HTML टैग जैसे <h2>, <p>, <strong>, <em>, और <ul>/<li> का उपयोग करें।
- <html>, <head>, या <body> टैग शामिल न करें। केवल रॉ HTML कंटेंट।
- टोन पूरी तरह से वस्तुनिष्ठ, औपचारिक और पत्रकारिता मानकों के अनुसार हो।
- केवल दिए गए डेटा का उपयोग करें। तथ्यों का आविष्कार न करें।
- आम तौर पर 2-4 पैराग्राफ रखें।`;

    switch (template) {
      case "sports":
        systemPrompt += `\n\nटेम्पलेट शैली: खेल रिपोर्ट। अंतिम स्कोर, प्रमुख खिलाड़ियों और मैच के परिणामों पर ध्यान दें। ऊर्जावान लेकिन पेशेवर खेल पत्रकारिता शब्दावली का उपयोग करें।`;
        break;
      case "weather":
        systemPrompt += `\n\nटेम्पलेट शैली: मौसम अपडेट। वर्तमान परिस्थितियों, आगामी पूर्वानुमानों और किसी भी मौसम चेतावनी पर ध्यान दें। आवश्यकता पर सार्वजनिक सुरक्षा पर जोर दें।`;
        break;
      case "earnings":
        systemPrompt += `\n\nटेम्पलेट शैली: कॉर्पोरेट आय रिपोर्ट। राजस्व, प्रति शेयर आय, गाइडेंस और बाजार प्रतिक्रिया पर ध्यान दें। औपचारिक वित्तीय पत्रकारिता शब्दावली का उपयोग करें।`;
        break;
      case "seo":
        systemPrompt += `\n\nटेम्पलेट शैली: SEO ऑप्टिमाइज़ेशन। आपको एक पूरा हिंदी लेख दिया जाएगा। आपका काम है:\n1. मूल सामग्री और तथ्यों को बिल्कुल न बदलें\n2. हेडलाइन को और अधिक आकर्षक और कीवर्ड-समृद्ध बनाएं\n3. पहले पैराग्राफ में मुख्य कीवर्ड प्राकृतिक रूप से शामिल करें\n4. H2 सबहेडिंग जोड़ें जो स्पष्ट और खोज-योग्य हों\n5. बुलेट पॉइंट और सूचियाँ जहाँ उचित हो वहाँ जोड़ें\n6. अंत में एक संक्षिप्त "निष्कर्ष" या "मुख्य बिंदु" सेक्शन जोड़ें\nपूरा HTML आउटपुट दें।`;
        break;
      default:
        systemPrompt += `\n\nटेम्पलेट शैली: सामान्य समाचार रिपोर्ट। सबसे महत्वपूर्ण तथ्यों को पहले रखें (उल्टे पिरामिड शैली: कौन, क्या, कब, कहाँ, क्यों)।`;
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
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: template === "seo"
            ? `नीचे दिया गया लेख SEO ऑप्टिमाइज़ करें:\n\n${rawData}`
            : `कच्चा डेटा जिसे समाचार लेख में बदलना है:\n\n${rawData}`
          }
        ],
        temperature: 0.3,
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
