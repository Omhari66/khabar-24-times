import { NextResponse } from "next/server";
import { withApiHandler } from "@/lib/api/handler";
// Unused import removed
import { UploadSignatureService } from "@/lib/services";
import { requirePermission } from "@/lib/permissions/guard";

const uploadSignatureService = new UploadSignatureService();

export const POST = withApiHandler({ scope: "api/upload-signature" }, async () => {
  await requirePermission("upload.signature.generate");

  const payload = await uploadSignatureService.generateUploadSignature();
  return NextResponse.json(payload);
});
