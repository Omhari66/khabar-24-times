import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { reporterCardService } from "@/lib/services/reporter-card-service";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== "ADMIN") {
      return new Response("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || undefined;
    const status = searchParams.get("status") || undefined;
    const department = searchParams.get("department") || undefined;
    const state = searchParams.get("state") || undefined;
    const district = searchParams.get("district") || undefined;

    const csvContent = await reporterCardService.exportReportersToCsv({
      query,
      status,
      department,
      state,
      district,
    });

    const filename = `reporters_export_${new Date().toISOString().split("T")[0]}.csv`;

    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error exporting reporters:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
