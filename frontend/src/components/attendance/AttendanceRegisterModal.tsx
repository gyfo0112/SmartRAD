"use client";

import { useState } from "react";
import { XMarkIcon, ClockIcon } from "@heroicons/react/24/outline";
import type { EmployeeSummary } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8081/api";

const STATUS_OPTIONS = [
  { value: "NORMAL", label: "정상출근", selectedClasses: "border-emerald-500 bg-emerald-50 text-emerald-600" },
  { value: "LATE", label: "지각", selectedClasses: "border-amber-500 bg-amber-50 text-amber-600" },
  { value: "ABSENT", label: "결근", selectedClasses: "border-rose-500 bg-rose-50 text-rose-600" },
  { value: "LEAVE", label: "휴가", selectedClasses: "border-sky-500 bg-sky-50 text-sky-600" },
];

const inputClasses = "w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
const labelClasses = "block text-sm font-medium text-gray-700 mb-1";

function authHeaders(): HeadersInit {
  const token = window.localStorage.getItem("accessToken") ?? window.sessionStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

interface Props {
  employees: EmployeeSummary[];
  defaultDate: string;
  onClose: () => void;
  onSaved: () => void;
}

export default function AttendanceRegisterModal({ employees, defaultDate, onClose, onSaved }: Props) {
  const [employeeId, setEmployeeId] = useState("");
  const [workDate, setWorkDate] = useState(defaultDate);
  const [status, setStatus] = useState("NORMAL");
  const [checkInTime, setCheckInTime] = useState("09:00");
  const [checkOutTime, setCheckOutTime] = useState("18:00");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const needsTimes = status === "NORMAL" || status === "LATE";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!employeeId || !workDate) {
      setError("직원과 근태일을 선택해주세요.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/attendances`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          employeeId: Number(employeeId),
          workDate,
          attendanceStatusCode: status,
          checkInTime: needsTimes ? checkInTime : null,
          checkOutTime: needsTimes ? checkOutTime : null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message || "근태 등록에 실패했습니다.");
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "근태 등록 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-blue-600" />
            수동 출근 등록
          </h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
            <div>
              <label className={labelClasses}>직원</label>
              <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} required className={inputClasses}>
                <option value="">직원을 선택하세요</option>
                {employees.map((employee) => (
                  <option key={employee.employeeId} value={employee.employeeId}>
                    {employee.name}
                    {employee.departmentName ? ` (${employee.departmentName}${employee.positionName ? ` ${employee.positionName}` : ""})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClasses}>근태일</label>
              <input type="date" value={workDate} onChange={(e) => setWorkDate(e.target.value)} required className={inputClasses} />
            </div>

            <div>
              <label className={labelClasses}>상태</label>
              <div className="grid grid-cols-4 gap-2">
                {STATUS_OPTIONS.map((option) => {
                  const selected = status === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setStatus(option.value)}
                      className={`h-10 rounded-lg border text-xs font-bold transition-colors ${
                        selected ? option.selectedClasses : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {needsTimes && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClasses}>출근 시간</label>
                  <input type="time" value={checkInTime} onChange={(e) => setCheckInTime(e.target.value)} className={inputClasses} />
                </div>
                <div>
                  <label className={labelClasses}>퇴근 시간</label>
                  <input type="time" value={checkOutTime} onChange={(e) => setCheckOutTime(e.target.value)} className={inputClasses} />
                </div>
              </div>
            )}

            {error && <p className="text-sm font-medium text-rose-500">{error}</p>}
          </div>

          <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-100 bg-gray-50">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">취소</button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50">
              {loading ? "등록 중..." : "등록"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
