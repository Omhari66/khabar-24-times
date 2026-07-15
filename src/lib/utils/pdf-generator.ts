import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { generateQrCodeDataUrl } from "./qr-generator";

interface PdfGeneratorInput {
  reporterId: string;
  fullName: string;
  photo: string;
  email: string;
  phone: string;
  bloodGroup: string;
  designation: string;
  department: string;
  state: string;
  district: string;
  officeAddress: string;
  joiningDate: Date;
  validTill: Date;
  emergencyContact: string;
  emergencyPhone: string;
  qrToken: string;
}

/**
 * Downloads an image from a URL and returns it as a standard PNG ArrayBuffer.
 * Fetches via direct HTTP GET (mode: cors, no-cache) and draws to canvas using Object URL to bypass browser CORS cache conflicts.
 */
async function fetchImageBuffer(url: string, siteUrl: string): Promise<ArrayBuffer | null> {
  try {
    // 1. Handle base64 Data URL directly
    if (url.startsWith("data:")) {
      const parts = url.split(",");
      if (parts.length < 2) return null;
      const base64Data = parts[1];
      const binaryString = atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes.buffer;
    }

    // 2. Resolve URL
    let absoluteUrl = url;
    if (url.startsWith("/")) {
      absoluteUrl = `${siteUrl}${url}`;
    }

    // 3. Fetch image bytes directly with CORS and no-cache
    // This avoids all browser image-tag cache CORS conflicts!
    const response = await fetch(absoluteUrl, {
      method: "GET",
      mode: "cors",
      headers: {
        "Cache-Control": "no-cache",
        "Pragma": "no-cache"
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();

    // 4. Decode via Canvas to ensure strict PNG format compatibility with pdf-lib
    const blobUrl = URL.createObjectURL(blob);
    try {
      const img = new Image();
      img.src = blobUrl;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error("Failed to load blob image"));
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || img.width || 200;
      canvas.height = img.naturalHeight || img.height || 250;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const pngBlob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob((b) => resolve(b), "image/png");
        });
        if (pngBlob) {
          const pngBuffer = await pngBlob.arrayBuffer();
          URL.revokeObjectURL(blobUrl);
          return pngBuffer;
        }
      }
    } catch (canvasErr) {
      console.warn("Canvas PNG transcoding failed, returning direct fetched buffer:", canvasErr);
    }

    URL.revokeObjectURL(blobUrl);
    return arrayBuffer;
  } catch (error) {
    console.error("Failed to fetch/decode image for PDF:", error);
    return null;
  }
}

/**
 * Generates a premium CR80-sized PDF containing the front and back of the reporter's ID card.
 * CR80 standard size: 3.375" x 2.125" (243 x 153 points at 72 dpi)
 */
export async function generateReporterCardPdf(data: PdfGeneratorInput, siteUrl: string): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  // Load fonts
  const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontHelveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Setup CR80 dimensions
  const cardWidth = 243;
  const cardHeight = 153;

  // 1. PAGE 1: CARD FRONT
  const pageFront = pdfDoc.addPage([cardWidth, cardHeight]);

  // Background - Deep Slate Navy
  pageFront.drawRectangle({
    x: 0,
    y: 0,
    width: cardWidth,
    height: cardHeight,
    color: rgb(15 / 255, 23 / 255, 42 / 255), // #0f172a
  });

  // Top header accent line (Gold)
  pageFront.drawRectangle({
    x: 0,
    y: cardHeight - 4,
    width: cardWidth,
    height: 4,
    color: rgb(226 / 255, 183 / 255, 20 / 255), // #e2b714
  });

  // Top header text
  pageFront.drawText("KHABAR24TIMES", {
    x: 12,
    y: cardHeight - 16,
    size: 9,
    font: fontHelveticaBold,
    color: rgb(1, 1, 1),
  });

  pageFront.drawText("PRESS IDENTITY CARD", {
    x: 12,
    y: cardHeight - 24,
    size: 5.5,
    font: fontHelveticaBold,
    color: rgb(226 / 255, 183 / 255, 20 / 255),
  });

  // Fetch and draw reporter photo
  let photoImage = null;
  if (data.photo) {
    const photoBuffer = await fetchImageBuffer(data.photo, siteUrl);
    if (photoBuffer) {
      try {
        const arr = new Uint8Array(photoBuffer);
        const isPng = arr[0] === 0x89 && arr[1] === 0x50 && arr[2] === 0x4e && arr[3] === 0x47;
        if (isPng) {
          photoImage = await pdfDoc.embedPng(photoBuffer);
        } else {
          photoImage = await pdfDoc.embedJpg(photoBuffer);
        }
      } catch (err) {
        console.error("Error embedding reporter photo:", err);
      }
    }
  }

  const photoX = 12;
  const photoY = 24;
  const photoW = 52;
  const photoH = 64;

  if (photoImage) {
    pageFront.drawImage(photoImage, {
      x: photoX,
      y: photoY,
      width: photoW,
      height: photoH,
    });
    // Draw thin white border around photo
    pageFront.drawRectangle({
      x: photoX,
      y: photoY,
      width: photoW,
      height: photoH,
      borderColor: rgb(255 / 255, 255 / 255, 255 / 255),
      borderWidth: 0.75,
    });
  } else {
    // Placeholder avatar rectangle
    pageFront.drawRectangle({
      x: photoX,
      y: photoY,
      width: photoW,
      height: photoH,
      color: rgb(51 / 255, 65 / 255, 85 / 255), // #334155
      borderColor: rgb(255 / 255, 255 / 255, 255 / 255),
      borderWidth: 0.75,
    });
    // Placeholder initials
    const initials = data.fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
    pageFront.drawText(initials, {
      x: photoX + 16,
      y: photoY + 26,
      size: 14,
      font: fontHelveticaBold,
      color: rgb(255 / 255, 255 / 255, 255 / 255),
    });
  }

  // Reporter ID Box (Gold theme banner)
  const idBoxY = 12;
  pageFront.drawRectangle({
    x: photoX,
    y: idBoxY,
    width: photoW,
    height: 9,
    color: rgb(226 / 255, 183 / 255, 20 / 255),
  });
  pageFront.drawText(data.reporterId, {
    x: photoX + (photoW - fontHelveticaBold.widthOfTextAtSize(data.reporterId, 5.5)) / 2,
    y: idBoxY + 2.5,
    size: 5.5,
    font: fontHelveticaBold,
    color: rgb(15 / 255, 23 / 255, 42 / 255),
  });

  // Reporter details text (Middle-Right section)
  const detailX = 72;
  const detailYStart = 90;

  // Name
  pageFront.drawText(data.fullName.toUpperCase(), {
    x: detailX,
    y: detailYStart,
    size: 8.5,
    font: fontHelveticaBold,
    color: rgb(1, 1, 1),
  });

  // Designation
  pageFront.drawText(data.designation, {
    x: detailX,
    y: detailYStart - 10,
    size: 6.5,
    font: fontHelveticaBold,
    color: rgb(148 / 255, 163 / 255, 184 / 255), // #94a3b8
  });

  // Department
  pageFront.drawText(`Dept: ${data.department}`, {
    x: detailX,
    y: detailYStart - 18,
    size: 5.5,
    font: fontHelvetica,
    color: rgb(203 / 255, 213 / 255, 225 / 255), // #cbd5e1
  });

  // Blood Group
  pageFront.drawText(`Blood Group: ${data.bloodGroup}`, {
    x: detailX,
    y: detailYStart - 26,
    size: 5.5,
    font: fontHelvetica,
    color: rgb(203 / 255, 213 / 255, 225 / 255),
  });

  // Valid Till
  const validTillStr = data.validTill.toLocaleDateString("en-IN", {
    month: "2-digit",
    year: "numeric",
  });
  pageFront.drawText(`Valid Till: ${validTillStr}`, {
    x: detailX,
    y: detailYStart - 34,
    size: 5.5,
    font: fontHelveticaBold,
    color: rgb(226 / 255, 183 / 255, 20 / 255),
  });

  // Location info (District, State)
  const locStr = `${data.district}, ${data.state}`;
  pageFront.drawText(`Location: ${locStr}`, {
    x: detailX,
    y: detailYStart - 42,
    size: 5,
    font: fontHelvetica,
    color: rgb(148 / 255, 163 / 255, 184 / 255),
  });

  // Generate QR Code PNG for front
  const verifyUrl = `${siteUrl}/verify/${data.qrToken}`;
  const qrDataUrl = await generateQrCodeDataUrl(verifyUrl);
  const qrBase64 = qrDataUrl.split(",")[1];
  const qrBuffer = Buffer.from(qrBase64, "base64");
  const qrImage = await pdfDoc.embedPng(qrBuffer);

  // Draw QR code on front
  const qrSize = 48;
  pageFront.drawImage(qrImage, {
    x: cardWidth - qrSize - 12,
    y: 12,
    width: qrSize,
    height: qrSize,
  });

  // Outline border around QR Code
  pageFront.drawRectangle({
    x: cardWidth - qrSize - 12,
    y: 12,
    width: qrSize,
    height: qrSize,
    borderColor: rgb(255 / 255, 255 / 255, 255 / 255),
    borderWidth: 0.5,
  });

  // QR Scanning Help Note
  pageFront.drawText("SCAN TO VERIFY", {
    x: cardWidth - qrSize - 12 + (qrSize - fontHelveticaBold.widthOfTextAtSize("SCAN TO VERIFY", 3.5)) / 2,
    y: 7,
    size: 3.5,
    font: fontHelveticaBold,
    color: rgb(226 / 255, 183 / 255, 20 / 255),
  });

  // 2. PAGE 2: CARD BACK
  const pageBack = pdfDoc.addPage([cardWidth, cardHeight]);

  // Background - Deep Slate Navy
  pageBack.drawRectangle({
    x: 0,
    y: 0,
    width: cardWidth,
    height: cardHeight,
    color: rgb(15 / 255, 23 / 255, 42 / 255),
  });

  // Header accent (Gold)
  pageBack.drawRectangle({
    x: 0,
    y: cardHeight - 4,
    width: cardWidth,
    height: 4,
    color: rgb(226 / 255, 183 / 255, 20 / 255),
  });

  // Section: Terms of Use
  pageBack.drawText("TERMS OF USE & INSTRUCTIONS", {
    x: 12,
    y: cardHeight - 16,
    size: 7,
    font: fontHelveticaBold,
    color: rgb(226 / 255, 183 / 255, 20 / 255),
  });

  const terms = [
    "1. This card remains the exclusive property of Khabar24Times.",
    "2. The holder is authorized to represent for news gathering.",
    "3. Any misuse of this card will result in immediate suspension.",
    "4. Scan the QR code on the front to verify active credentials.",
    "5. If found, please return to the office address listed below.",
  ];

  let termY = cardHeight - 26;
  terms.forEach((term) => {
    pageBack.drawText(term, {
      x: 12,
      y: termY,
      size: 4.8,
      font: fontHelvetica,
      color: rgb(241 / 255, 245 / 255, 249 / 255), // #f1f5f9
    });
    termY -= 8;
  });

  // Emergency Contact Section
  const emergY = termY - 4;
  pageBack.drawText("EMERGENCY CONTACT", {
    x: 12,
    y: emergY,
    size: 5.5,
    font: fontHelveticaBold,
    color: rgb(226 / 255, 183 / 255, 20 / 255),
  });

  const emergInfo = `${data.emergencyContact}: +91 ${data.emergencyPhone}`;
  pageBack.drawText(emergInfo, {
    x: 12,
    y: emergY - 7,
    size: 5,
    font: fontHelvetica,
    color: rgb(255 / 255, 255 / 255, 255 / 255),
  });

  // Address Section
  const addrY = emergY - 20;
  pageBack.drawText("OFFICE ADDRESS", {
    x: 12,
    y: addrY,
    size: 5.5,
    font: fontHelveticaBold,
    color: rgb(226 / 255, 183 / 255, 20 / 255),
  });

  // Office Address wrapping support
  const addressText = data.officeAddress || "Khabar24Times Headquarters, New Delhi, India";
  const addressWords = addressText.split(" ");
  let currentLine = "";
  let addrLineY = addrY - 7;
  
  addressWords.forEach((word) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = fontHelvetica.widthOfTextAtSize(testLine, 4.5);
    if (testWidth > 130) {
      pageBack.drawText(currentLine, {
        x: 12,
        y: addrLineY,
        size: 4.5,
        font: fontHelvetica,
        color: rgb(203 / 255, 213 / 255, 225 / 255),
      });
      currentLine = word;
      addrLineY -= 6;
    } else {
      currentLine = testLine;
    }
  });
  
  if (currentLine) {
    pageBack.drawText(currentLine, {
      x: 12,
      y: addrLineY,
      size: 4.5,
      font: fontHelvetica,
      color: rgb(203 / 255, 213 / 255, 225 / 255),
    });
  }

  // Draw Logo or details on the back right
  const backQrSize = 35;
  pageBack.drawImage(qrImage, {
    x: cardWidth - backQrSize - 12,
    y: 16,
    width: backQrSize,
    height: backQrSize,
  });

  // Website details
  pageBack.drawText("www.khabar24times.in", {
    x: cardWidth - fontHelveticaBold.widthOfTextAtSize("www.khabar24times.in", 5) - 12,
    y: 8,
    size: 5,
    font: fontHelveticaBold,
    color: rgb(226 / 255, 183 / 255, 20 / 255),
  });

  // Save and return
  return await pdfDoc.save();
}
