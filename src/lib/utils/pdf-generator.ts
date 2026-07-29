import { PDFDocument, PDFFont, rgb, StandardFonts } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { generateQrCodeDataUrl } from "./qr-generator";

interface PdfGeneratorInput {
  reporterId: string;
  fullName: string;
  photo: string;
  email: string;
  phone: string;
  bloodGroup?: string | null;
  designation: string;
  department: string;
  state: string;
  district: string;
  officeAddress: string;
  joiningDate: Date;
  validTill: Date;
  dateOfBirth?: Date | string | null;
  emergencyContact?: string | null;
  emergencyPhone?: string | null;
  qrToken: string;
}

/**
 * Loads a font from the public/fonts directory.
 */
async function loadFont(fontPath: string, siteUrl: string): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(`${siteUrl}${fontPath}`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

/**
 * Downloads an image from a URL and returns it as a PNG ArrayBuffer.
 */
async function fetchImageBuffer(url: string, siteUrl: string): Promise<ArrayBuffer | null> {
  try {
    if (url.startsWith("data:")) {
      const parts = url.split(",");
      if (parts.length < 2) return null;
      const binaryString = atob(parts[1]);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
      return bytes.buffer;
    }

    const absoluteUrl = url.startsWith("/") ? `${siteUrl}${url}` : url;
    const response = await fetch(absoluteUrl, {
      method: "GET",
      mode: "cors",
      headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
    });
    if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    try {
      const img = new Image();
      img.src = blobUrl;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));
      });
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || 200;
      canvas.height = img.naturalHeight || 250;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const pngBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob((b) => resolve(b), "image/png"));
        if (pngBlob) {
          URL.revokeObjectURL(blobUrl);
          return await pngBlob.arrayBuffer();
        }
      }
    } catch { /* fall through */ }
    URL.revokeObjectURL(blobUrl);
    return await blob.arrayBuffer();
  } catch (error) {
    console.error("Failed to fetch image for PDF:", error);
    return null;
  }
}

function isPng(buf: ArrayBuffer): boolean {
  const a = new Uint8Array(buf);
  return a[0] === 0x89 && a[1] === 0x50 && a[2] === 0x4e && a[3] === 0x47;
}

async function embedImage(pdfDoc: PDFDocument, buf: ArrayBuffer) {
  return isPng(buf) ? pdfDoc.embedPng(buf) : pdfDoc.embedJpg(buf);
}

/**
 * Generates a CR80-sized PDF (243 x 153 pts) with front and back reporter ID card.
 */
export async function generateReporterCardPdf(
  data: PdfGeneratorInput,
  siteUrl: string
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  // ── Load Unicode fonts ──────────────────────────────────────────────────
  const [latinBuf, devBuf] = await Promise.all([
    loadFont("/fonts/NotoSans-Regular.ttf", siteUrl),
    loadFont("/fonts/NotoSansDevanagari-Regular.ttf", siteUrl),
  ]);

  let fontR: PDFFont;
  let fontB: PDFFont;

  try {
    // Prefer Devanagari (supports Hindi) then Latin, then fallback to built-in
    const buf = devBuf ?? latinBuf;
    if (buf) {
      fontR = await pdfDoc.embedFont(buf);
      fontB = fontR; // same file — bold variant not needed for layout
    } else {
      fontR = await pdfDoc.embedFont(StandardFonts.Helvetica);
      fontB = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    }
  } catch {
    fontR = await pdfDoc.embedFont(StandardFonts.Helvetica);
    fontB = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  }

  // Safe text: strip chars that break WinAnsi if we fell back to Helvetica
  function t(text: string | null | undefined): string {
    if (!text) return "";
    if (devBuf || latinBuf) return text; // Unicode font → pass through
    return text.replace(/[^\x20-\x7E]/g, ""); // Helvetica fallback → ASCII only
  }

  // ── Card dimensions ─────────────────────────────────────────────────────
  const W = 243;
  const H = 153;

  // ── Colours ─────────────────────────────────────────────────────────────
  const cNavy   = rgb(13 / 255,  27 / 255,  65 / 255);
  const cGold   = rgb(218 / 255, 165 / 255, 32 / 255);
  const cRed    = rgb(180 / 255,  20 / 255, 30 / 255);
  const cWhite  = rgb(1, 1, 1);
  const cGray   = rgb(200 / 255, 210 / 255, 225 / 255);
  const cGreen  = rgb(40 / 255,  200 / 255, 80 / 255);
  const cTeal   = rgb(0 / 255,   128 / 255, 128 / 255);
  const cDark   = rgb(15 / 255,  25 / 255,  60 / 255);
  const cLight  = rgb(248 / 255, 250 / 255, 254 / 255);
  const cSlate  = rgb(60 / 255,  70 / 255,  95 / 255);
  const cMuted  = rgb(90 / 255, 100 / 255, 120 / 255);
  const cGold2  = rgb(140 / 255, 100 / 255,  0 / 255);

  // ═══════════════════════════════════════════════════════════════════════
  // PAGE 1 — FRONT
  // ═══════════════════════════════════════════════════════════════════════
  const front = pdfDoc.addPage([W, H]);

  // Background
  front.drawRectangle({ x: 0, y: 0, width: W, height: H, color: cNavy });

  // Gold top bar
  front.drawRectangle({ x: 0, y: H - 3, width: W, height: 3, color: cGold });

  // ── Logo circle ──
  front.drawCircle({ x: 20, y: H - 16, size: 10, color: cWhite });
  front.drawCircle({ x: 20, y: H - 16, size: 9,  color: cRed  });
  front.drawText("K", { x: 16.5, y: H - 19.5, size: 8, font: fontB, color: cWhite });

  // ── Org name ──
  front.drawText(t("KHABAR24TIMES"), { x: 34, y: H - 12, size: 6.5, font: fontB, color: cWhite });
  front.drawText(t("Sehar Ki Har Badi Khabar App Tak"), { x: 34, y: H - 19, size: 3.5, font: fontR, color: cGray });

  // ── Title section ──
  front.drawText("OFFICIAL MEDIA IDENTITY", { x: 12, y: H - 30, size: 4, font: fontB, color: cGold });
  front.drawText("PRESS CARD", { x: 12, y: H - 43, size: 13, font: fontB, color: cWhite });
  front.drawRectangle({ x: 12, y: H - 46, width: 85, height: 1, color: cGold });

  // ── INDIA badge ──
  front.drawRectangle({ x: W - 38, y: H - 20, width: 26, height: 10,
    color: rgb(30/255, 50/255, 100/255), borderColor: cGold, borderWidth: 0.5 });
  front.drawText("INDIA", { x: W - 32, y: H - 16, size: 5, font: fontB, color: cGold });

  // ── Photo ──
  const pX = 14, pY = 28, pW = 56, pH = 70;
  front.drawRectangle({ x: pX - 2, y: pY - 2, width: pW + 4, height: pH + 4, color: cWhite });

  if (data.photo) {
    const buf = await fetchImageBuffer(data.photo, siteUrl);
    if (buf) {
      try {
        const img = await embedImage(pdfDoc, buf);
        front.drawImage(img, { x: pX, y: pY, width: pW, height: pH });
      } catch { /* ignore embed errors */ }
    }
  } else {
    front.drawRectangle({ x: pX, y: pY, width: pW, height: pH, color: rgb(40/255, 60/255, 100/255) });
    front.drawText(t((data.fullName || "?").split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()),
      { x: pX + 18, y: pY + 28, size: 16, font: fontB, color: cWhite });
  }

  // ── Stamp overlay ──
  const stampBuf = await fetchImageBuffer("/stamp.png", siteUrl);
  if (stampBuf) {
    try {
      const stampImg = await embedImage(pdfDoc, stampBuf);
      front.drawImage(stampImg, { x: pX + pW - 22, y: pY - 6, width: 32, height: 32, opacity: 0.85 });
    } catch { /* ignore */ }
  }

  // ── Info column ──
  let iy = H - 52;
  const iX = 80;

  // Name
  front.drawText(t((data.fullName || "").toUpperCase()), { x: iX, y: iy, size: 9, font: fontB, color: cWhite, maxWidth: W - iX - 14 });
  iy -= 12;

  // Designation pill (simple rectangle, no rounded)
  const desigText = t(data.designation || "REPORTER");
  const pillW = Math.min(fontB.widthOfTextAtSize(desigText, 5.5) + 12, W - iX - 14);
  front.drawRectangle({ x: iX, y: iy - 2, width: pillW, height: 9, color: cRed });
  front.drawText(desigText, { x: iX + 6, y: iy + 1, size: 5.5, font: fontB, color: cWhite, maxWidth: pillW - 10 });
  iy -= 14;

  // Press ID
  front.drawText("PRESS ID:", { x: iX, y: iy, size: 4.5, font: fontB, color: cGold });
  front.drawText(t(data.reporterId), { x: iX + fontB.widthOfTextAtSize("PRESS ID: ", 4.5), y: iy, size: 4.5, font: fontB, color: cGold });
  iy -= 8;

  // Location
  front.drawText(t(`${data.district}, ${data.state}`), { x: iX, y: iy, size: 4.5, font: fontR, color: cGray });
  iy -= 10;

  // Date of birth
  if (data.dateOfBirth) {
    const dob = new Date(data.dateOfBirth);
    const dobStr = dob.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
    front.drawText("DATE OF BIRTH", { x: iX, y: iy, size: 3.5, font: fontB, color: cGold });
    iy -= 5.5;
    front.drawText(t(dobStr), { x: iX, y: iy, size: 5, font: fontB, color: cWhite });
    iy -= 10;
  }

  // Issued on / Validity (two columns)
  const issuedStr = data.joiningDate.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  const tillStr   = data.validTill.toLocaleDateString("en-IN",   { day: "2-digit", month: "long", year: "numeric" });
  front.drawText("ISSUED ON", { x: iX,      y: iy, size: 3.5, font: fontB, color: cGold });
  front.drawText("CARD VALIDITY", { x: iX + 55, y: iy, size: 3.5, font: fontB, color: cGold });
  iy -= 5.5;
  front.drawText(t(issuedStr), { x: iX, y: iy, size: 4.5, font: fontB, color: cWhite });
  front.drawText(t(`${issuedStr} — ${tillStr}`), { x: iX + 55, y: iy, size: 3.5, font: fontB, color: cWhite, maxWidth: W - iX - 60 });
  iy -= 12;

  // Active badge
  front.drawCircle({ x: iX + 4, y: iy + 3, size: 3, color: cGreen });
  front.drawText("ACTIVE", { x: iX + 10, y: iy, size: 6, font: fontB, color: cGreen });

  // ── Signature ──
  const sigBuf = await fetchImageBuffer("/signature.png", siteUrl);
  if (sigBuf) {
    try {
      const sigImg = await embedImage(pdfDoc, sigBuf);
      front.drawImage(sigImg, { x: W - 68, y: 22, width: 55, height: 20 });
    } catch { /* ignore */ }
  }
  front.drawText("EDITOR-IN-CHIEF", { x: W - 68, y: 17, size: 4,   font: fontB, color: cGray });
  front.drawText("Khabar24Times",   { x: W - 65, y: 13, size: 3.5, font: fontR, color: cMuted });

  // ── Footer ──
  front.drawRectangle({ x: 0, y: 0, width: W, height: 11, color: cDark });
  front.drawText("info@khabar24times.in", { x: 8, y: 4, size: 3.5, font: fontR, color: cGray });
  front.drawText("www.khabar24times.in", {
    x: W - fontR.widthOfTextAtSize("www.khabar24times.in", 3.5) - 8,
    y: 4, size: 3.5, font: fontB, color: cGold,
  });

  // ═══════════════════════════════════════════════════════════════════════
  // PAGE 2 — BACK
  // ═══════════════════════════════════════════════════════════════════════
  const back = pdfDoc.addPage([W, H]);

  back.drawRectangle({ x: 0, y: 0, width: W, height: H, color: cLight });
  back.drawRectangle({ x: 0, y: H - 3, width: W, height: 3, color: cTeal });

  // ── QR code ──
  const verifyUrl = `${siteUrl}/verify/${data.qrToken}`;
  const qrDataUrl = await generateQrCodeDataUrl(verifyUrl);
  const qrBuffer  = Buffer.from(qrDataUrl.split(",")[1], "base64");
  const qrImage   = await pdfDoc.embedPng(qrBuffer);
  const qrSize = 45;

  back.drawRectangle({ x: W - qrSize - 10, y: H - qrSize - 14, width: qrSize + 4, height: qrSize + 4,
    color: cWhite, borderColor: rgb(200/255, 220/255, 220/255), borderWidth: 0.5 });
  back.drawImage(qrImage, { x: W - qrSize - 8, y: H - qrSize - 12, width: qrSize, height: qrSize });
  back.drawText("SCAN TO VERIFY", {
    x: W - qrSize - 8 + (qrSize - fontB.widthOfTextAtSize("SCAN TO VERIFY", 3.5)) / 2,
    y: H - qrSize - 16, size: 3.5, font: fontB, color: cTeal,
  });

  // ── Identity Verification heading ──
  back.drawText("IDENTITY VERIFICATION", { x: 10, y: H - 10, size: 4, font: fontB, color: cTeal });
  back.drawText("Terms & Conditions",    { x: 10, y: H - 19, size: 8, font: fontB, color: cDark });
  back.drawText("Scan the secure QR code to verify this card from the official website.", {
    x: 10, y: H - 28, size: 4, font: fontR, color: cMuted, maxWidth: W - qrSize - 22,
  });

  // ── Verification status box ──
  const sbY = H - 50;
  back.drawRectangle({ x: 10, y: sbY, width: W - 20, height: 14,
    color: rgb(240/255, 255/255, 245/255), borderColor: cGreen, borderWidth: 0.6 });
  back.drawText("CARD VERIFICATION PASSED",  { x: 15, y: sbY + 8, size: 5,   font: fontB, color: rgb(20/255, 150/255, 60/255) });
  back.drawText("Active press identity credential", { x: 15, y: sbY + 3, size: 3.5, font: fontR, color: rgb(70/255, 140/255, 90/255) });
  back.drawRectangle({ x: W - 40, y: sbY + 3, width: 28, height: 8, color: cGreen });
  back.drawText("ACTIVE", { x: W - 36, y: sbY + 5.5, size: 4.5, font: fontB, color: cWhite });

  // ── Usage Guidelines ──
  let ly = sbY - 8;
  back.drawText("USAGE GUIDELINES", { x: 10, y: ly, size: 4.5, font: fontB, color: cSlate });
  ly -= 7;
  const guidelines = [
    "This identity card remains the property of Khabar24Times.",
    "The card holder must carry it during authorised reporting or official media duty.",
    "Unauthorised use, copying, alteration or transfer of this card is prohibited.",
    "If found, please return it to the issuing organisation or contact its official office.",
  ];
  for (const line of guidelines) {
    back.drawRectangle({ x: 12, y: ly + 1.5, width: 2, height: 2, color: cTeal });
    back.drawText(t(line), { x: 17, y: ly, size: 3.5, font: fontR, color: cSlate, maxWidth: W - 25 });
    ly -= 6;
  }

  // ── Card Information table ──
  ly -= 4;
  back.drawText("CARD INFORMATION", { x: 10, y: ly, size: 4.5, font: fontB, color: cSlate });
  ly -= 6;

  const rows: [string, string][] = [
    ["CARD NUMBER", t(data.reporterId)],
    ["VALID FROM",  t(data.joiningDate.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }))],
    ["VALID UNTIL", t(data.validTill.toLocaleDateString("en-IN",   { day: "2-digit", month: "long", year: "numeric" }))],
    ["REPORTER",    t(data.fullName)],
    ["MOBILE",      t(data.phone ? `+91 ${data.phone}` : "—")],
  ];
  for (const [label, value] of rows) {
    back.drawText(label, { x: 12, y: ly, size: 3.5, font: fontB, color: rgb(120/255, 130/255, 150/255) });
    back.drawText(value, { x: 65, y: ly, size: 3.8, font: fontB, color: cDark, maxWidth: W - 75 });
    ly -= 5.5;
  }

  // ── Important Notice ──
  ly -= 3;
  back.drawRectangle({ x: 10, y: ly - 4, width: W - 20, height: 14,
    color: rgb(255/255, 252/255, 235/255), borderColor: cGold, borderWidth: 0.5 });
  back.drawText("IMPORTANT NOTICE", { x: 14, y: ly + 5, size: 4, font: fontB, color: cGold2 });
  back.drawText("A premier news publishing agency committed to delivering verified news.", {
    x: 14, y: ly, size: 3.3, font: fontR, color: rgb(100/255, 80/255, 20/255), maxWidth: W - 25,
  });

  // ── Footer ──
  back.drawRectangle({ x: 0, y: 0, width: W, height: 10, color: cDark });
  back.drawText("info@khabar24times.in", { x: 8, y: 3.5, size: 3, font: fontR, color: cGray });
  back.drawText("www.khabar24times.in", {
    x: W - fontR.widthOfTextAtSize("www.khabar24times.in", 3) - 8,
    y: 3.5, size: 3, font: fontB, color: cGold,
  });

  return pdfDoc.save();
}
