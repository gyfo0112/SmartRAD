"use client";

import { useMemo, useState } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import type { DepartmentRate, EmployeeMonthlyRow } from "./monthlyAttendanceTypes";
import { warningEmployees } from "./monthlyAttendanceUtils";

function rateColor(rate: number) {
  return rate >= 90 ? "bg-emerald-500" : rate >= 80 ? "bg-indigo-500" : rate >= 70 ? "bg-amber-500" : "bg-rose-500";
}

export function DepartmentAttendanceRates({ data }: { data: DepartmentRate[] }) {
  return (
    <section className="min-w-0 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-bold text-gray-900">부서별 출근율</h2>
      {data.length === 0 ? (
        <p className="py-12 text-center text-sm text-gray-500">집계 가능한 부서 데이터가 없습니다.</p>
      ) : (
        <div className="space-y-4">
          {data.map((item) => (
            <div key={item.name} className="min-w-0">
              <div className="mb-1.5 flex min-w-0 items-center justify-between gap-3 text-sm">
                <span className="min-w-0 truncate font-medium text-gray-700" title={item.name}>{item.name}</span>
                <span className="shrink-0 whitespace-nowrap font-semibold text-gray-900">{item.rate}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                <div className={`h-full rounded-full ${rateColor(item.rate)}`} style={{ width: `${item.rate}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function EmployeeMonthlySummary({ rows, departments }: { rows: EmployeeMonthlyRow[]; departments: DepartmentRate[] }) {
  const [department, setDepartment] = useState("");
  const [keyword, setKeyword] = useState("");
  const [sortOption, setSortOption] = useState("name");

  const filteredAndSorted = useMemo(() => {
    let result = rows;
    if (department) result = result.filter((row) => row.departmentName === department);
    if (keyword) result = result.filter((row) => row.employeeName.includes(keyword));

    return result.sort((a, b) => {
      if (sortOption === "name") return a.employeeName.localeCompare(b.employeeName, "ko");
      if (sortOption === "attendance") return (a.attendanceRate ?? 0) - (b.attendanceRate ?? 0);
      if (sortOption === "late") return b.lateCount - a.lateCount;
      if (sortOption === "absent") return b.absentCount - a.absentCount;
      return 0;
    });
  }, [rows, department, keyword, sortOption]);

  return (
    <section className="flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="space-y-3 border-b border-gray-100 p-4">
        <h2 className="text-lg font-bold text-gray-900">직원별 월간 요약</h2>
        <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:items-center">
          <select value={department} onChange={(event) => setDepartment(event.target.value)} className="h-9 min-w-0 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-blue-500/20 lg:w-auto">
            <option value="">전체 부서</option>
            {departments.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}
          </select>
          <select value={sortOption} onChange={(event) => setSortOption(event.target.value)} className="h-9 min-w-0 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-blue-500/20 lg:w-auto">
            <option value="name">이름순</option><option value="attendance">출근율 낮은 순</option><option value="late">지각 많은 순</option><option value="absent">결근 많은 순</option>
          </select>
          <input type="text" placeholder="직원명 검색..." value={keyword} onChange={(event) => setKeyword(event.target.value)} className="h-9 min-w-0 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 sm:col-span-2 lg:flex-1" />
        </div>
      </div>

      <div className="hidden max-h-[340px] flex-1 overflow-auto md:block">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="sticky top-0 bg-gray-50 text-xs text-gray-500 shadow-[0_1px_0_0_#f3f4f6]">
            <tr>{["직원", "출근일", "지각", "결근", "초과근무", "출근율"].map((label) => <th key={label} className="whitespace-nowrap px-4 py-3 font-semibold">{label}</th>)}</tr>
          </thead>
          <tbody>
            {filteredAndSorted.length === 0 ? (
              <tr><td colSpan={6} className="py-12 text-center text-gray-500">데이터가 없습니다.</td></tr>
            ) : filteredAndSorted.map((row) => (
              <tr key={row.employeeId} className="border-b border-gray-50 last:border-0">
                <td className="min-w-48 px-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">{row.employeeName.charAt(0)}</div>
                    <div className="min-w-0"><p className="truncate font-semibold text-gray-900" title={row.employeeName}>{row.employeeName}</p><p className="truncate text-xs text-gray-400" title={row.departmentName}>{row.departmentName}</p></div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-600">{row.normalDays}일</td>
                <td className="whitespace-nowrap px-4 py-3 font-semibold text-amber-600">{row.lateCount}회</td>
                <td className="whitespace-nowrap px-4 py-3 font-semibold text-rose-600">{row.absentCount}회</td>
                <td className="whitespace-nowrap px-4 py-3 text-indigo-600">{row.overtimeMinutes === null ? "-" : `${(row.overtimeMinutes / 60).toFixed(1)}h`}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <div className="h-1.5 w-16 shrink-0 rounded-full bg-gray-100"><div className={`h-full rounded-full ${rateColor(row.attendanceRate ?? 0)}`} style={{ width: `${row.attendanceRate ?? 0}%` }} /></div>
                    <span className="shrink-0 whitespace-nowrap text-xs font-semibold tabular-nums text-gray-700">{row.attendanceRate === null ? "-" : `${row.attendanceRate}%`}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="max-h-[420px] divide-y divide-gray-100 overflow-y-auto md:hidden">
        {filteredAndSorted.length === 0 ? (
          <p className="p-8 text-center text-sm text-gray-500">데이터가 없습니다.</p>
        ) : filteredAndSorted.map((row) => (
          <article key={row.employeeId} className="space-y-3 p-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">{row.employeeName.charAt(0)}</div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-gray-900" title={row.employeeName}>{row.employeeName}</p>
                <p className="truncate text-xs text-gray-400" title={row.departmentName}>{row.departmentName}</p>
              </div>
              <span className="shrink-0 whitespace-nowrap text-sm font-semibold text-gray-800">{row.attendanceRate === null ? "-" : `${row.attendanceRate}%`}</span>
            </div>
            <dl className="grid grid-cols-2 gap-2 rounded-lg bg-gray-50 p-3 text-sm">
              <div><dt className="text-xs text-gray-400">출근일</dt><dd className="mt-1 whitespace-nowrap font-semibold text-gray-700">{row.normalDays}일</dd></div>
              <div><dt className="text-xs text-gray-400">초과근무</dt><dd className="mt-1 whitespace-nowrap font-semibold text-indigo-600">{row.overtimeMinutes === null ? "-" : `${(row.overtimeMinutes / 60).toFixed(1)}h`}</dd></div>
              <div><dt className="text-xs text-gray-400">지각</dt><dd className="mt-1 whitespace-nowrap font-semibold text-amber-600">{row.lateCount}회</dd></div>
              <div><dt className="text-xs text-gray-400">결근</dt><dd className="mt-1 whitespace-nowrap font-semibold text-rose-600">{row.absentCount}회</dd></div>
            </dl>
            <div>
              <div className="mb-1.5 flex items-center justify-between gap-3 text-xs"><span className="text-gray-500">출근율</span><span className="shrink-0 whitespace-nowrap font-semibold text-gray-700">{row.attendanceRate === null ? "-" : `${row.attendanceRate}%`}</span></div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100"><div className={`h-full rounded-full ${rateColor(row.attendanceRate ?? 0)}`} style={{ width: `${row.attendanceRate ?? 0}%` }} /></div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function AttendanceWarningEmployees({ rows }: { rows: EmployeeMonthlyRow[] }) {
  const warnings = warningEmployees(rows);
  return (
    <section className="min-w-0 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex min-w-0 items-center justify-between gap-3"><h2 className="flex min-w-0 items-center gap-2 text-lg font-bold text-gray-900"><ExclamationTriangleIcon className="h-5 w-5 shrink-0 text-amber-500" />주의 직원</h2><span className="shrink-0 whitespace-nowrap rounded-full bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700">{warnings.length}명</span></div>
      {warnings.length === 0 ? <p className="py-10 text-center text-sm text-gray-500">주의 기준에 해당하는 직원이 없습니다.</p> : (
        <div className="space-y-3">{warnings.map((row) => <div key={row.employeeId} className="rounded-lg bg-amber-50/70 p-3"><div className="flex min-w-0 items-start gap-3"><div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">{row.employeeName.charAt(0)}</div><div className="min-w-0 flex-1"><p className="truncate font-semibold text-gray-900" title={row.employeeName}>{row.employeeName}</p><p className="mt-1 truncate text-xs text-gray-600" title={row.departmentName}>{row.departmentName}</p><p className="mt-1 whitespace-nowrap text-xs text-gray-600">지각 {row.lateCount}회 / 결근 {row.absentCount}회</p></div><span className="shrink-0 whitespace-nowrap text-xs font-bold text-rose-600">{row.absentCount > 0 ? "경고" : "주의"}</span></div></div>)}</div>
      )}
    </section>
  );
}
