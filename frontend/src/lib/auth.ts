export function clearAuthStorage() {
  for (const storage of [window.localStorage, window.sessionStorage]) {
    storage.removeItem("accessToken");
    storage.removeItem("employeeId");
    storage.removeItem("employeeName");
    storage.removeItem("employeeEmail");
  }
}
