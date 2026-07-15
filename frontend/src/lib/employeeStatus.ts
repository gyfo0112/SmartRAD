export function getEmployeeStatusLabel(status: string): string {
  switch (status) {
    case "ACTIVE": return "재직중";
    case "LEAVE": return "휴직중";
    case "RESIGNED": return "퇴사";
    default: return status;
  }
}

export function getEmployeeStatusBadgeClasses(status: string): string {
  switch (status) {
    case "ACTIVE": return "border-emerald-200 text-emerald-600 before:bg-emerald-500";
    case "LEAVE": return "border-orange-200 text-orange-600 before:bg-orange-500";
    case "RESIGNED": return "border-rose-200 text-rose-600 before:bg-rose-500";
    default: return "border-gray-200 text-gray-600 before:bg-gray-400";
  }
}
