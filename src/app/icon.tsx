import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

// Image generation — Khabar 24 Times favicon
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#CC0000", // brand red
          borderRadius: "6px",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Main K24 text */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "center",
            lineHeight: 1,
          }}
        >
          <span
            style={{
              fontSize: 18,
              fontWeight: 900,
              color: "#FFFFFF",
              fontFamily: "serif",
              letterSpacing: "-1px",
            }}
          >
            K
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: "#FFD700",
              fontFamily: "sans-serif",
              letterSpacing: "0px",
              marginLeft: "1px",
            }}
          >
            24
          </span>
        </div>
        {/* Bottom accent bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "#FFD700",
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
