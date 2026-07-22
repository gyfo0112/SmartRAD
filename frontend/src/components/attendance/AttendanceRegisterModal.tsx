"use client";

import { useState } from "react";
import { ClockIcon } from "@heroicons/react/24/outline";
import type { EmployeeSummary } from "./types";
import Modal, { ModalCancelButton, ModalPrimaryButton } from "@/components/common/Modal";

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
    <Modal
      icon={ClockIcon}
      title="수동 출근 등록"
      onClose={onClose}
      as="form"
      onSubmit={handleSubmit}
      footer={
        <>
          <ModalCancelButton onClick={onClose} />
          <ModalPrimaryButton type="submit" disabled={loading}>
            {loading ? "등록 중..." : "등록"}
          </ModalPrimaryButton>
        </>
      }
    >
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
    </Modal>
  );
}
