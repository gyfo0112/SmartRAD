const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8081/api";

function authHeaders(): HeadersInit {
  const token = window.localStorage.getItem("accessToken") ?? window.sessionStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function saveBlobAsFile(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** 화면에 이미 표시된 표 형태 데이터를 서버에서 실제 .xlsx로 생성해 다운로드한다. rows[0]은 헤더 행으로 취급된다. */
export async function downloadExcel(sheetName: string, fileName: string, rows: (string | number | null)[][]) {
  const res = await fetch(`${API_BASE_URL}/excel/export`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ sheetName, fileName, rows }),
  });
  if (!res.ok) throw new Error("엑셀 파일 생성에 실패했습니다.");
  saveBlobAsFile(await res.blob(), fileName);
}

export async function downloadExcelFromUrl(url: string, fileName: string) {
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) throw new Error("엑셀 파일을 내려받지 못했습니다.");
  saveBlobAsFile(await res.blob(), fileName);
}
