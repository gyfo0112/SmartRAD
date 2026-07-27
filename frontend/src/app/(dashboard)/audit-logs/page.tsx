"use client";

import { useEffect, useState } from "react";
import {
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardDocumentListIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8081/api";
const PAGE_SIZE = 15;

const ACTION_TYPE_LABELS: Record<string, string> = {
  EMPLOYEE_CREATE: "직원 등록",
  EMPLOYEE_BULK_CREATE: "직원 일괄등록",
  EMPLOYEE_UPDATE: "직원 정보 수정",
  EMPLOYEE_DELETE: "직원 삭제",
  DEPARTMENT_CREATE: "부서 생성",
  DEPARTMENT_UPDATE: "부서 수정",
  DEPARTMENT_DELETE: "부서 삭제",
  PAYROLL_BASE_SALARY_UPDATE: "연봉 정보 변경",
  PAYROLL_BULK_EMPLOYMENT_TYPE: "급여형태 일괄변경",
  PAYROLL_BULK_BASIC_REGISTER: "급여정보 일괄등록",
  APPOINTMENT_CREATE: "인사 발령 등록",
  APPOINTMENT_DELETE: "인사 발령 삭제",
  CERTIFICATE_CREATE: "증명서 신청 등록",
  CERTIFICATE_APPROVE: "증명서 승인",
  CERTIFICATE_REJECT: "증명서 반려",
  CERTIFICATE_ISSUE: "증명서 발급 완료",
  EVENT_SUPPORT_APPROVE: "경조비 승인",
  EVENT_SUPPORT_REJECT: "경조비 반려",
  EVENT_SUPPORT_PAY: "경조비 지급",
  LEAVE_REQUEST_CREATE: "휴가 신청 등록",
  LEAVE_REQUEST_APPROVE: "휴가 승인",
  LEAVE_REQUEST_REJECT: "휴가 반려",
  LEAVE_TYPE_CREATE: "휴가유형 등록",
  LEAVE_BALANCE_GRANT: "휴가 잔여일수 등록",
  LEAVE_POLICY_CREATE: "휴가정책 등록",
  LEAVE_POLICY_DELETE: "휴가정책 삭제",
  NOTICE_CREATE: "공지사항 등록",
  NOTICE_UPDATE: "공지사항 수정",
  NOTICE_DELETE: "공지사항 삭제",
  TEAM_LEAD_AUTHORITY_GRANT: "팀장 권한 부여",
  TEAM_LEAD_AUTHORITY_REVOKE: "팀장 권한 회수",
};

const ACTION_TYPE_STYLES: Record<string, string> = {
  EMPLOYEE_CREATE: "bg-emerald-50 text-emerald-700",
  EMPLOYEE_BULK_CREATE: "bg-emerald-50 text-emerald-700",
  EMPLOYEE_UPDATE: "bg-blue-50 text-blue-700",
  EMPLOYEE_DELETE: "bg-rose-50 text-rose-700",
  DEPARTMENT_CREATE: "bg-emerald-50 text-emerald-700",
  DEPARTMENT_UPDATE: "bg-blue-50 text-blue-700",
  DEPARTMENT_DELETE: "bg-rose-50 text-rose-700",
  PAYROLL_BASE_SALARY_UPDATE: "bg-amber-50 text-amber-700",
  PAYROLL_BULK_EMPLOYMENT_TYPE: "bg-amber-50 text-amber-700",
  PAYROLL_BULK_BASIC_REGISTER: "bg-amber-50 text-amber-700",
  APPOINTMENT_CREATE: "bg-emerald-50 text-emerald-700",
  APPOINTMENT_DELETE: "bg-rose-50 text-rose-700",
  CERTIFICATE_CREATE: "bg-emerald-50 text-emerald-700",
  CERTIFICATE_APPROVE: "bg-emerald-50 text-emerald-700",
  CERTIFICATE_REJECT: "bg-rose-50 text-rose-700",
  CERTIFICATE_ISSUE: "bg-blue-50 text-blue-700",
  EVENT_SUPPORT_APPROVE: "bg-emerald-50 text-emerald-700",
  EVENT_SUPPORT_REJECT: "bg-rose-50 text-rose-700",
  EVENT_SUPPORT_PAY: "bg-blue-50 text-blue-700",
  LEAVE_REQUEST_CREATE: "bg-emerald-50 text-emerald-700",
  LEAVE_REQUEST_APPROVE: "bg-emerald-50 text-emerald-700",
  LEAVE_REQUEST_REJECT: "bg-rose-50 text-rose-700",
  LEAVE_TYPE_CREATE: "bg-emerald-50 text-emerald-700",
  LEAVE_BALANCE_GRANT: "bg-amber-50 text-amber-700",
  LEAVE_POLICY_CREATE: "bg-emerald-50 text-emerald-700",
  LEAVE_POLICY_DELETE: "bg-rose-50 text-rose-700",
  NOTICE_CREATE: "bg-emerald-50 text-emerald-700",
  NOTICE_UPDATE: "bg-blue-50 text-blue-700",
  NOTICE_DELETE: "bg-rose-50 text-rose-700",
  TEAM_LEAD_AUTHORITY_GRANT: "bg-indigo-50 text-indigo-700",
  TEAM_LEAD_AUTHORITY_REVOKE: "bg-rose-50 text-rose-700",
};

function actionLabel(actionType: string) {
  return ACTION_TYPE_LABELS[actionType] ?? actionType;
}

function actionStyle(actionType: string) {
  return ACTION_TYPE_STYLES[actionType] ?? "bg-gray-100 text-gray-600";
}

interface AuditLogRow {
  auditLogId: number;
  actorId: number | null;
  actorName: string;
  actionType: string;
  targetDescription: string;
  detail: string | null;
  createdAt: string;
}

interface PageData {
  content: AuditLogRow[];
  totalElements: number;
  totalPages: number;
}

function authHeaders(): HeadersInit {
  const token = window.localStorage.getItem("accessToken") ?? window.sessionStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function formatDateTime(value: string) {
  const match = value.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);
  if (!match) return value;
  return `${match[1]} ${match[2]}`;
}

export default function AuditLogsPage() {
  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  const [draftActionType, setDraftActionType] = useState("");
  const [draftFrom, setDraftFrom] = useState("");
  const [draftTo, setDraftTo] = useState("");
  const [actionType, setActionType] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  async function fetchLogs() {
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/audit-logs?page=${page}&size=${PAGE_SIZE}&sort=createdAt,desc`;
      if (actionType) url += `&actionType=${actionType}`;
      if (from) url += `&from=${from}`;
      if (to) url += `&to=${to}`;
      const res = await fetch(url, { headers: authHeaders() });
      if (res.ok) {
        setData(await res.json());
      }
    } catch (error) {
      console.error("Failed to fetch audit logs", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, actionType, from, to]);

  const applyFilters = () => {
    setActionType(draftActionType);
    setFrom(draftFrom);
    setTo(draftTo);
    setPage(0);
  };

  const resetFilters = () => {
    setDraftActionType("");
    setDraftFrom("");
    setDraftTo("");
    setActionType("");
    setFrom("");
    setTo("");
    setPage(0);
  };

  return (
    <div className="mx-auto min-w-0 max-w-[1400px] space-y-4 overflow-x-clip p-4 sm:space-y-5 sm:p-6">
      <div className="min-w-0">
        <h1 className="flex min-w-0 items-center gap-2 text-xl font-bold text-gray-900 sm:text-2xl">
          <ClipboardDocumentListIcon className="h-6 w-6 shrink-0 text-gray-400 sm:h-7 sm:w-7" />
          관리자 활동 로그
        </h1>
        <p className="mt-1 break-words text-sm leading-6 text-gray-500">직원/부서/급여 등 주요 데이터를 누가, 언제, 무엇을 변경했는지 기록합니다.</p>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid min-w-0 grid-cols-2 gap-3 xl:grid-cols-[1.2fr_1fr_1fr_auto_auto]">
          <label className="col-span-2 min-w-0 space-y-1 text-sm font-semibold text-gray-700 sm:col-span-1">
            <span>액션 유형</span>
            <select
              value={draftActionType}
              onChange={(event) => setDraftActionType(event.target.value)}
              className="h-10 min-w-0 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 outline-none focus:border-blue-500"
            >
              <option value="">전체</option>
              {Object.entries(ACTION_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
          <label className="col-span-2 min-w-0 space-y-1 text-sm font-semibold text-gray-700 sm:col-span-1">
            <span>조회 시작일</span>
            <input
              type="date"
              value={draftFrom}
              onChange={(event) => setDraftFrom(event.target.value)}
              className="h-10 min-w-0 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm outline-none focus:border-blue-500"
            />
          </label>
          <label className="min-w-0 space-y-1 text-sm font-semibold text-gray-700 sm:col-span-2 xl:col-span-1">
            <span>조회 종료일</span>
            <input
              type="date"
              value={draftTo}
              onChange={(event) => setDraftTo(event.target.value)}
              className="h-10 min-w-0 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm outline-none focus:border-blue-500"
            />
          </label>
          <button
            type="button"
            onClick={resetFilters}
            className="h-10 min-w-0 self-end whitespace-nowrap rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 sm:px-4"
          >
            <ArrowPathIcon className="mr-1 inline h-4 w-4" />
            초기화
          </button>
          <button
            type="button"
            onClick={applyFilters}
            className="h-10 min-w-0 self-end whitespace-nowrap rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white hover:bg-blue-700 sm:px-5"
          >
            <MagnifyingGlassIcon className="mr-1 inline h-4 w-4" />
            조회
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex min-w-0 items-center justify-between gap-3 border-b border-gray-100 px-4 py-4 sm:px-5">
          <h2 className="shrink-0 text-base font-bold text-gray-900 sm:text-lg">활동 내역</h2>
          <span className="shrink-0 rounded-full bg-gray-100 px-2 py-1 text-[11px] font-bold text-gray-600 sm:px-2.5 sm:text-xs">
            총 {data?.totalElements ?? 0}건
          </span>
        </div>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[720px] table-fixed text-left text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500">
              <tr>
                <th className="w-40 px-4 py-3 font-semibold lg:px-5">시간</th>
                <th className="w-32 px-4 py-3 font-semibold lg:px-5">담당자</th>
                <th className="w-44 px-4 py-3 font-semibold lg:px-5">액션 유형</th>
                <th className="px-4 py-3 font-semibold lg:px-5">내용</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="py-16 text-center text-gray-500">활동 로그를 불러오는 중입니다.</td></tr>
              ) : !data || data.content.length === 0 ? (
                <tr><td colSpan={4} className="py-16 text-center text-gray-500">조건에 맞는 활동 로그가 없습니다.</td></tr>
              ) : (
                data.content.map((row) => (
                  <tr key={row.auditLogId} className="border-t border-gray-100">
                    <td className="whitespace-nowrap px-4 py-4 text-gray-500 lg:px-5">{formatDateTime(row.createdAt)}</td>
                    <td className="whitespace-nowrap px-4 py-4 font-semibold text-gray-900 lg:px-5">{row.actorName}</td>
                    <td className="whitespace-nowrap px-4 py-4 lg:px-5">
                      <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${actionStyle(row.actionType)}`}>
                        {actionLabel(row.actionType)}
                      </span>
                    </td>
                    <td className="break-words whitespace-normal px-4 py-4 text-gray-700 lg:px-5">{row.targetDescription}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="md:hidden">
          {loading ? (
            <div className="px-4 py-14 text-center text-sm text-gray-500">활동 로그를 불러오는 중입니다.</div>
          ) : !data || data.content.length === 0 ? (
            <div className="px-4 py-14 text-center text-sm text-gray-500">조건에 맞는 활동 로그가 없습니다.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {data.content.map((row) => (
                <article key={row.auditLogId} className="min-w-0 p-4">
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <span className={`inline-block min-w-0 break-words rounded-full px-2.5 py-1 text-xs font-semibold leading-5 ${actionStyle(row.actionType)}`}>
                      {actionLabel(row.actionType)}
                    </span>
                    <time className="shrink-0 whitespace-nowrap pt-1 text-xs text-gray-500">
                      {formatDateTime(row.createdAt)}
                    </time>
                  </div>
                  <dl className="mt-3 min-w-0 space-y-3">
                    <div className="flex min-w-0 items-start gap-3 text-sm">
                      <dt className="shrink-0 text-gray-500">담당자</dt>
                      <dd className="min-w-0 break-words font-semibold text-gray-900">{row.actorName}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs text-gray-500">변경 내용</dt>
                      <dd className="mt-1 min-w-0 break-words whitespace-normal text-sm leading-6 text-gray-700">
                        {row.targetDescription}
                      </dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          )}
        </div>
        {data && data.totalPages > 1 && (
          <div className="flex flex-col gap-3 border-t border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-gray-500">
              {page + 1} / {data.totalPages} 페이지
            </span>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-1">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => setPage((current) => current - 1)}
                aria-label="이전 페이지"
                className="flex h-10 min-w-0 items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 sm:h-8 sm:w-8"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={page >= data.totalPages - 1}
                onClick={() => setPage((current) => current + 1)}
                aria-label="다음 페이지"
                className="flex h-10 min-w-0 items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 sm:h-8 sm:w-8"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
