"use client";

import { useEffect, useState } from "react";
import { MagnifyingGlassIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import {
  EVENT_STATUS_OPTIONS,
  EVENT_TYPE_OPTIONS,
  eventTypeLabel,
  eventStatusBadge,
  formatAmount,
  getPolicyAmount,
  type EventSupportPage,
  type EventSupportResponse,
} from "./types";
import { resolveFileUrl } from "@/lib/fileUrl";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8081/api";
const PAGE_SIZE = 10;

function authHeaders(): HeadersInit {
  const token = window.localStorage.getItem("accessToken") ?? window.sessionStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function csvCell(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

export default function EventSupportList({ refreshKey, onActionComplete }: { refreshKey?: number; onActionComplete?: () => void }) {
  const [data, setData] = useState<EventSupportPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [eventType, setEventType] = useState("");
  const [status, setStatus] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [internalRefresh, setInternalRefresh] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        let url = `${API_BASE_URL}/event-supports/search?page=${page}&size=${PAGE_SIZE}&sort=createdAt,desc`;
        if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;
        if (eventType) url += `&eventType=${eventType}`;
        if (status) url += `&status=${status}`;
        const res = await fetch(url, { headers: authHeaders() });
        if (res.ok) {
          const json = (await res.json()) as EventSupportPage;
          if (!cancelled) setData(json);
        } else if (!cancelled) {
          setData(null);
        }
      } catch {
        if (!cancelled) setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [page, keyword, eventType, status, refreshKey, internalRefresh]);

  const runSearch = () => {
    setPage(0);
    setKeyword(searchInput.trim());
  };

  const runAction = async (id: number, action: "approve" | "reject" | "pay") => {
    setActionError(null);
    try {
      const url = `${API_BASE_URL}/event-supports/${id}/${action}`;
      let body: string | undefined;
      let headers: HeadersInit = authHeaders();
      if (action === "reject") {
        const rejectionReason = window.prompt("반려 사유를 입력하세요");
        if (!rejectionReason) return;
        body = JSON.stringify({ rejectionReason });
        headers = { "Content-Type": "application/json", ...headers };
      }
      const res = await fetch(url, { method: "PATCH", headers, body });
      if (!res.ok) throw new Error("처리에 실패했습니다.");
      setInternalRefresh((key) => key + 1);
      onActionComplete?.();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "처리에 실패했습니다.");
    }
  };

  const exportCsv = async () => {
    try {
      let url = `${API_BASE_URL}/event-supports/search?page=0&size=1000&sort=createdAt,desc`;
      if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;
      if (eventType) url += `&eventType=${eventType}`;
      if (status) url += `&status=${status}`;
      const res = await fetch(url, { headers: authHeaders() });
      if (!res.ok) throw new Error();
      const json = (await res.json()) as EventSupportPage;
      const headers = ["신청자", "부서", "경조사 유형", "경조사 일자", "사유", "지원 금액", "상태"];
      const lines = json.content.map((row) => [
        row.employeeName,
        row.departmentName || "-",
        eventTypeLabel(row.eventType),
        row.eventDate,
        row.reason || "-",
        getPolicyAmount(row.eventType).toLocaleString(),
        eventStatusBadge(row.status).label,
      ]);
      const csv = `﻿${[headers, ...lines].map((line) => line.map(csvCell).join(",")).join("\r\n")}`;
      const blobUrl = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
      const anchor = document.createElement("a");
      anchor.href = blobUrl;
      anchor.download = `event-supports-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(blobUrl);
    } catch {
      setActionError("일괄 다운로드에 실패했습니다.");
    }
  };

  useEffect(() => {
    const handleExportEvent = () => exportCsv();
    window.addEventListener("event-support:export", handleExportEvent);
    return () => window.removeEventListener("event-support:export", handleExportEvent);
  }, [keyword, eventType, status]);

  const rows = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="bg-white rounded-xl border border-gray-200 flex flex-col min-h-0 flex-1">
      <div className="p-5 border-b border-gray-200">
        <div className="flex flex-col items-stretch justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-gray-900">경조비 신청 내역</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
              {totalElements}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="relative sm:col-span-2 lg:col-span-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") runSearch(); }}
                placeholder="신청자명 검색..."
                className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 lg:w-64"
              />
            </div>
            <select
              value={eventType}
              onChange={(e) => { setEventType(e.target.value); setPage(0); }}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">경조사 유형</option>
              {EVENT_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(0); }}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">처리 상태</option>
              {EVENT_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
        {actionError && <p className="mt-2 text-sm font-medium text-rose-500">{actionError}</p>}
      </div>

      <div className="hidden flex-1 overflow-auto lg:block">
        <table className="w-full min-w-[1200px] border-collapse text-left">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              {["신청일", "신청자", "부서", "경조사 유형", "경조사 일자", "사유", "지원 금액", "상태", "첨부", "관리"].map((title) => (
                <th key={title} className="py-3 px-4 text-sm font-medium text-gray-500 border-b border-gray-200 whitespace-nowrap">{title}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={10} className="py-16 text-center text-gray-500">로딩 중...</td></tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-16 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <p className="text-base font-medium text-gray-900 mb-1">데이터가 없습니다</p>
                    <p className="text-sm">해당하는 경조비 신청 내역이 없습니다.</p>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row: EventSupportResponse) => {
                const badge = eventStatusBadge(row.status);
                return (
                  <tr key={row.eventSupportId} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">{row.createdAt.substring(0, 10)}</td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900 whitespace-nowrap">{row.employeeName}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">{row.departmentName || "-"}</td>
                    <td className="py-3 px-4 text-sm text-center text-gray-600 whitespace-nowrap">{eventTypeLabel(row.eventType)}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">{row.eventDate}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate" title={row.reason || ""}>{row.reason || "-"}</td>
                    <td className="py-3 px-4 text-sm text-right font-semibold text-gray-900 whitespace-nowrap">{formatAmount(getPolicyAmount(row.eventType))}</td>
                    <td className="py-3 px-4 text-sm whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${badge.className}`}>{badge.label}</span>
                    </td>
                    <td className="py-3 px-4 text-sm whitespace-nowrap">
                      {row.attachmentUrl ? (
                        <a href={resolveFileUrl(row.attachmentUrl)} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs font-medium">파일보기</a>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm whitespace-nowrap">
                      {row.status === "PENDING" && (
                        <div className="flex gap-1.5">
                          <button type="button" onClick={() => runAction(row.eventSupportId, "approve")} className="px-2.5 py-1 rounded-md bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700">승인</button>
                          <button type="button" onClick={() => runAction(row.eventSupportId, "reject")} className="px-2.5 py-1 rounded-md border border-rose-200 text-rose-600 text-xs font-semibold hover:bg-rose-50">반려</button>
                        </div>
                      )}
                      {row.status === "APPROVED" && (
                        <button type="button" onClick={() => runAction(row.eventSupportId, "pay")} className="px-2.5 py-1 rounded-md bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700">지급 처리</button>
                      )}
                      {(row.status === "REJECTED" || row.status === "PAID") && (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-gray-200 lg:hidden">
        {loading ? (
          <p className="px-4 py-12 text-center text-sm text-gray-500">로딩 중...</p>
        ) : rows.length === 0 ? (
          <div className="px-4 py-12 text-center text-gray-500">
            <p className="font-medium text-gray-900">데이터가 없습니다</p>
            <p className="mt-1 text-sm">해당하는 경조비 신청 내역이 없습니다.</p>
          </div>
        ) : (
          rows.map((row: EventSupportResponse) => {
            const badge = eventStatusBadge(row.status);
            return (
              <article key={row.eventSupportId} className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-gray-900">{row.employeeName}</p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {row.departmentName || "-"} · 신청 {row.createdAt.substring(0, 10)}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${badge.className}`}>
                    {badge.label}
                  </span>
                </div>

                <dl className="grid grid-cols-2 gap-3 rounded-lg bg-gray-50 p-3 text-xs">
                  <div>
                    <dt className="text-gray-400">경조사 유형</dt>
                    <dd className="mt-1 font-semibold text-gray-700">{eventTypeLabel(row.eventType)}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-400">경조사 일자</dt>
                    <dd className="mt-1 font-semibold text-gray-700">{row.eventDate}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-gray-400">사유</dt>
                    <dd className="mt-1 break-words font-medium text-gray-700">{row.reason || "-"}</dd>
                  </div>
                  <div className="col-span-2 flex items-center justify-between border-t border-gray-200 pt-2">
                    <dt className="font-semibold text-gray-500">지원 금액</dt>
                    <dd className="font-bold text-gray-900">{formatAmount(getPolicyAmount(row.eventType))}</dd>
                  </div>
                </dl>

                <div className="flex items-center justify-between gap-3">
                  {row.attachmentUrl ? (
                    <a
                      href={resolveFileUrl(row.attachmentUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-medium text-blue-600 hover:underline"
                    >
                      첨부파일 보기
                    </a>
                  ) : (
                    <span className="text-xs text-gray-400">첨부파일 없음</span>
                  )}
                  {row.status === "PENDING" && (
                    <div className="flex gap-1.5">
                      <button type="button" onClick={() => runAction(row.eventSupportId, "approve")} className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700">승인</button>
                      <button type="button" onClick={() => runAction(row.eventSupportId, "reject")} className="rounded-md border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50">반려</button>
                    </div>
                  )}
                  {row.status === "APPROVED" && (
                    <button type="button" onClick={() => runAction(row.eventSupportId, "pay")} className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700">지급 처리</button>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>

      <div className="flex flex-col items-stretch gap-3 border-t border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500">
          총 {totalElements}건 중 {rows.length ? page * PAGE_SIZE + 1 : 0}-{page * PAGE_SIZE + rows.length} 표시
        </p>
        <div className="flex justify-center gap-1 sm:mr-20">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="p-2 border border-gray-200 rounded-md text-gray-500 hover:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>
          <button className="px-3 py-1.5 border border-gray-200 rounded-md bg-blue-600 text-white text-sm">{page + 1}</button>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            className="p-2 border border-gray-200 rounded-md text-gray-500 hover:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
