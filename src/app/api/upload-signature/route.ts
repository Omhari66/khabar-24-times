import { v2 as cloudinary } from "cloudinary";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    // Validate all three env vars are present and non-placeholder
    if (!cloudName || cloudName === "mock-cloud-name") {
      return NextResponse.json(
        { error: "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not configured" },
        { status: 500 }
      );
    }
    if (!apiKey || apiKey === "mock-api-key") {
      return NextResponse.json(
        { error: "CLOUDINARY_API_KEY is not configured" },
        { status: 500 }
      );
    }
    if (!apiSecret || apiSecret === "mock-api-secret") {
      return NextResponse.json(
        { error: "CLOUDINARY_API_SECRET is not configured" },
        { status: 500 }
      );
    }

    // Log the cloud name being used to help diagnose mismatches
    console.log("[upload-signature] Using cloud name:", cloudName);

    cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });

    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = "news-portal";

    const paramsToSign = { timestamp, folder };
    const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

    return NextResponse.json({ signature, timestamp, cloudName, apiKey, folder });
  } catch (error) {
    console.error("Error generating Cloudinary signature:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
