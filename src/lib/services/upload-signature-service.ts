import { v2 as cloudinary } from "cloudinary";
import { getCloudinaryConfig } from "@/lib/config";
import { ApplicationService } from "@/lib/services/base/application-service";
import { AuditRepository } from "@/lib/repositories/audit-repository";
import { AuditService } from "@/lib/services/audit-service";

export class UploadSignatureService extends ApplicationService {
  private readonly auditService = new AuditService(new AuditRepository());

  constructor() {
    super("service/upload-signature");
  }

  async generateUploadSignature() {
    const { cloudName, apiKey, apiSecret, folder } = getCloudinaryConfig();

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });

    const timestamp = Math.round(new Date().getTime() / 1000);
    const paramsToSign = { timestamp, folder };
    const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

    const payload = { signature, timestamp, cloudName, apiKey, folder };

    await this.auditService.log({
      action: "UPLOAD_SIGNATURE_GENERATE",
      entityType: "UploadSignature",
      newValue: { folder, timestamp },
      status: "SUCCESS",
    });

    return payload;
  }
}
