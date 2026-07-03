import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";

async function testUpload() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const folder = "news-portal";

  if (!cloudName || !apiKey || !apiSecret) {
    console.error("Missing Cloudinary config");
    return;
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  const timestamp = Math.round(new Date().getTime() / 1000);
  const paramsToSign = { timestamp, folder };
  const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

  console.log({ timestamp, folder, signature, cloudName, apiKey });

  // Now let's try to upload a dummy 1x1 transparent pixel using fetch
  const formData = new FormData();
  // 1x1 transparent GIF base64
  const dummyFile = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
  
  formData.append("file", dummyFile);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp.toString());
  formData.append("signature", signature);
  formData.append("folder", folder);

  const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData as any
  });

  const result = await uploadResponse.json();
  console.log("Upload result:", result);
}

testUpload().catch(console.error);
