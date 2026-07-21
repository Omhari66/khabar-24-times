import { NextResponse } from "next/server";
import { reporterCardService } from "@/lib/services/reporter-card-service";

function parseUserAgent(ua: string) {
  let browser = "Other";
  let os = "Other";
  let device = "Desktop";

  if (!ua) return { browser, os, device };

  // Parse OS
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Macintosh") || ua.includes("Mac OS X")) os = "macOS";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
  else if (ua.includes("Linux")) os = "Linux";

  // Parse Browser
  if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Chrome") && !ua.includes("Edg")) browser = "Chrome";
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
  else if (ua.includes("Edg")) browser = "Edge";

  // Parse Device
  if (ua.includes("Mobi") || ua.includes("Android") || ua.includes("iPhone")) {
    device = "Mobile";
  } else if (ua.includes("iPad") || ua.includes("Tablet")) {
    device = "Tablet";
  }

  return { browser, os, device };
}

export async function GET(req: Request, { params }: { params: { token: string } }) {
  try {
    const token = params.token;

    // Rate Limiting could be added here; for now, retrieve client metadata
    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "127.0.0.1";
    const country = req.headers.get("cf-ipcountry") || req.headers.get("x-vercel-ip-country") || "India";
    const city = req.headers.get("cf-ipcity") || req.headers.get("x-vercel-ip-city") || "New Delhi";
    const uaString = req.headers.get("user-agent") || "";
    const { browser, os, device } = parseUserAgent(uaString);

    const result = await reporterCardService.verifyCardByToken(token, {
      ipAddress,
      country,
      city,
      browser,
      os,
      device,
    });

    return NextResponse.json({
      verified: result.status === "ACTIVE",
      status: result.status,
      reporter: {
        fullName: result.reporter.fullName,
        photo: result.reporter.photo,
        designation: result.reporter.designation,
        department: result.reporter.department,
        reporterId: result.reporter.reporterId,
        joiningDate: result.reporter.joiningDate,
        validTill: result.reporter.validTill,
        officeAddress: result.reporter.officeAddress,
        phone: result.reporter.phone,
        email: result.reporter.email,
        bloodGroup: result.reporter.bloodGroup,
        emergencyContact: result.reporter.emergencyContact,
        emergencyPhone: result.reporter.emergencyPhone,
        state: result.reporter.state,
        district: result.reporter.district,
        createdAt: result.reporter.createdAt,
        updatedAt: result.reporter.updatedAt,
      },
    });
  } catch (error) {
    const err = error as { statusCode?: number };
    if (err.statusCode === 404) {
      return NextResponse.json({ error: "Reporter not found", verified: false, status: "NOT_FOUND" }, { status: 404 });
    }
    console.error("Verification error:", error);
    return NextResponse.json({ error: "Internal Server Error", verified: false }, { status: 500 });
  }
}
