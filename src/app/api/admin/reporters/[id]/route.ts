import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { reporterCardService } from "@/lib/services/reporter-card-service";
import { z } from "zod";
import { parseJsonBody, optionalTrimmedString } from "@/lib/api/validation";

const updateReporterSchema = z.object({
  fullName: optionalTrimmedString(),
  photo: optionalTrimmedString(),
  email: z.string().email("Invalid email address").toLowerCase().optional(),
  phone: optionalTrimmedString(),
  bloodGroup: optionalTrimmedString(),
  designation: optionalTrimmedString(),
  department: optionalTrimmedString(),
  state: optionalTrimmedString(),
  district: optionalTrimmedString(),
  officeAddress: optionalTrimmedString(),
  joiningDate: z.coerce.date().optional(),
  validTill: z.coerce.date().optional(),
  dateOfBirth: z.coerce.date().optional(),
  aadhaarLast4: z
    .string()
    .length(4)
    .regex(/^\d+$/)
    .optional(),
  emergencyContact: optionalTrimmedString(),
  emergencyPhone: optionalTrimmedString(),
});

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reporter = await reporterCardService.getReporter(params.id);
    return NextResponse.json(reporter);
  } catch (error: any) {
    if (error.statusCode) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error("Error fetching reporter card:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await parseJsonBody(req, updateReporterSchema);
    const updated = await reporterCardService.updateReporter(params.id, body, session.user.id);

    return NextResponse.json(updated);
  } catch (error: any) {
    if (error.statusCode) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error("Error updating reporter card:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await reporterCardService.deleteReporter(params.id, session.user.id);
    return NextResponse.json(result);
  } catch (error: any) {
    if (error.statusCode) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error("Error deleting reporter card:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
