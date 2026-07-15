import QRCode from "qrcode";

/**
 * Generates a high-quality QR code data URL for a given text (verification URL).
 * @param text The text/URL to encode.
 * @returns A promise that resolves to a base64 data URL.
 */
export async function generateQrCodeDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      margin: 2,
      width: 400,
      color: {
        dark: "#0f172a", // Slate 900
        light: "#ffffff",
      },
      errorCorrectionLevel: "H", // High error correction for reliable scanning
    });
  } catch (error) {
    console.error("Failed to generate QR code data URL", error);
    throw new Error("QR code generation failed");
  }
}
