export function clearAuthStorage() {
  for (const storage of [window.localStorage, window.sessionStorage]) {
    storage.removeItem("accessToken");
    storage.removeItem("employeeId");
    storage.removeItem("employeeName");
    storage.removeItem("employeeEmail");
    storage.removeItem("role");
    storage.removeItem("delegated");
    storage.removeItem("departmentId");
  }
}

export function getRole(): string | null {
  return window.localStorage.getItem("role") ?? window.sessionStorage.getItem("role");
}

export function isAdmin(): boolean {
  return getRole() === "ADMIN";
}

// 관리자가 위임한 "팀장 권한" 여부 - 메뉴/버튼 표시용. 실제 인가는 항상 서버가 DB로 재검증한다.
export function isDelegatedTeamLead(): boolean {
  return (window.localStorage.getItem("delegated") ?? window.sessionStorage.getItem("delegated")) === "true";
}

export function getDepartmentId(): number | null {
  const value = window.localStorage.getItem("departmentId") ?? window.sessionStorage.getItem("departmentId");
  if (!value) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}
