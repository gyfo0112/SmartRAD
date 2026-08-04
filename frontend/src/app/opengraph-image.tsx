import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "SmartHR - 직원 정보부터 급여 정산까지, 하나로 연결하는 인사관리 ERP";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  const [bold, medium] = await Promise.all([
    readFile(join(process.cwd(), "assets/fonts/Pretendard-Bold.otf")),
    readFile(join(process.cwd(), "assets/fonts/Pretendard-Medium.otf")),
  ]);

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
          background: "#ffffff",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 112,
            height: 112,
            borderRadius: 26,
            background: "#2868f6",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 36,
          }}
        >
          <svg
            width="60"
            height="60"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <path d="M8.6 10.6 15.4 6.4M8.6 13.4 15.4 17.6" />
          </svg>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 72,
            fontFamily: "Pretendard-Bold",
            color: "#102a50",
            letterSpacing: -1.5,
            marginBottom: 18,
          }}
        >
          SmartHR
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 30,
            fontFamily: "Pretendard-Medium",
            color: "#435b80",
            marginBottom: 48,
          }}
        >
          직원 정보부터 급여 정산까지, 하나로 연결하는 인사관리 ERP
        </div>
        <div
          style={{
            display: "flex",
            width: 156,
            height: 8,
            borderRadius: 999,
            background: "linear-gradient(90deg, #2868f6, #32c9a5)",
          }}
        />
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Pretendard-Bold", data: bold, style: "normal", weight: 700 },
        { name: "Pretendard-Medium", data: medium, style: "normal", weight: 500 },
      ],
    }
  );
}
