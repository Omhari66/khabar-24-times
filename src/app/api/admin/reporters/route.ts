import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { reporterCardService } from "@/lib/services/reporter-card-service";
import { z } from "zod";
import { parseJsonBody, requiredTrimmedString } from "@/lib/api/validation";

const createReporterSchema = z.object({
  fullName: requiredTrimmedString("Full Name is required"),
  photo: requiredTrimmedString("Photo URL is required"),
  email: z.string().email("Invalid email address").toLowerCase(),
  phone: requiredTrimmedString("Phone number is required"),
  bloodGroup: requiredTrimmedString("Blood group is required"),
  designation: requiredTrimmedString("Designation is required"),
  department: requiredTrimmedString("Department is required"),
  state: requiredTrimmedString("State is required"),
  district: requiredTrimmedString("District is required"),
  officeAddress: requiredTrimmedString("Office address is required"),
  joiningDate: z.coerce.date(),
  validTill: z.coerce.date(),
  dateOfBirth: z.coerce.date(),
  aadhaarLast4: z
    .string()
    .length(4, "Aadhaar must be exactly the last 4 digits")
    .regex(/^\d+$/, "Aadhaar must contain only digits"),
  emergencyContact: requiredTrimmedString("Emergency contact name is required"),
  emergencyPhone: requiredTrimmedString("Emergency contact phone is required"),
});

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || undefined;
    const status = searchParams.get("status") || undefined;
    const department = searchParams.get("department") || undefined;
    const state = searchParams.get("state") || undefined;
    const district = searchParams.get("district") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const result = await reporterCardService.listReporters({
      query,
      status,
      department,
      state,
      district,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching reporters list:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await parseJsonBody(req, createReporterSchema);
    const reporter = await reporterCardService.createReporter(body, session.user.id);

    return NextResponse.json(reporter, { status: 201 });
  } catch (error: any) {
    if (error.statusCode) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error("Error creating reporter card:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
