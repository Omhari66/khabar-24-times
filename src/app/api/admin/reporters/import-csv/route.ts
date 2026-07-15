import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { reporterCardService } from "@/lib/services/reporter-card-service";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let csvText = "";
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File;
      if (!file) {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
      }
      csvText = await file.text();
    } else {
      // Expect JSON with csvText
      const body = await req.json();
      csvText = body.csvText || "";
    }

    if (!csvText.trim()) {
      return NextResponse.json({ error: "Empty CSV content" }, { status: 400 });
    }

    const result = await reporterCardService.importReportersFromCsv(csvText, session.user.id);
    return NextResponse.json(result);
  } catch (error) {
    const err = error as { statusCode?: number; message?: string };
    if (err.statusCode) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode });
    }
    console.error("Error importing CSV:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
