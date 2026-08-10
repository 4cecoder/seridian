import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #22d3ee, #0891b2)",
          borderRadius: 6,
        }}
      >
        <span style={{ fontSize: 20, fontWeight: 700, color: "#070b14" }}>S</span>
      </div>
    ),
    { ...size },
  );
}
