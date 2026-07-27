const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8081/api";
const GUEST_EMAIL = "admin123@test.com";
const GUEST_PASSWORD = "test1234";

// 포트폴리오용 "무료체험하기" - 관리자 데모 계정으로 자동 로그인시켜 실제 대시보드를 보여준다.
export async function startFreeTrial(): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: GUEST_EMAIL, password: GUEST_PASSWORD }),
  });
  if (!res.ok) {
    throw new Error("체험 로그인에 실패했습니다.");
  }

  const data = await res.json();
  window.sessionStorage.setItem("accessToken", data.accessToken);
  window.sessionStorage.setItem("employeeId", String(data.employeeId));
  window.sessionStorage.setItem("employeeName", data.name);
  window.sessionStorage.setItem("employeeEmail", data.email);
  window.sessionStorage.setItem("role", data.role);
  window.sessionStorage.setItem("delegated", String(data.delegated));
  window.sessionStorage.setItem(
    "departmentId",
    data.departmentId != null ? String(data.departmentId) : ""
  );
  window.location.href = "/dashboard";
}
