"use client";

import { useEffect, useState } from "react";
import { CalendarDaysIcon, SparklesIcon } from "@heroicons/react/24/outline";
import type { LeaveApprovalRow } from "./leaveApprovalTypes";
import { STATUS_LABELS } from "./leaveApprovalTypes";
import { useSummarize } from "@/lib/useSummarize";
import Modal, { ModalCancelButton, ModalPrimaryButton } from "@/components/common/Modal";

function date(value: string) {
  return value?.slice(0, 10).replaceAll("-", ".") || "-";
}
function dateTime(value: string | null) {
  if (!value) return "-";
  return value.slice(0, 16).replace("T", " ").replaceAll("-", ".");
}
function period(row: LeaveApprovalRow) {
  return row.startDate === row.endDate ? date(row.startDate) : `${date(row.startDate)} ~ ${date(row.endDate)}`;
}

interface Props {
  mode: "detail" | "approve" | "bulk" | "reject";
  row?: LeaveApprovalRow;
  selectedRows?: LeaveApprovalRow[];
  busy: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm?: (rejectionReason?: string) => void;
}

export default function LeaveRequestModal({ mode, row, selectedRows = [], busy, error, onClose, onConfirm }: Props) {
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionError, setRejectionError] = useState<string | null>(null);
  const { summary, loading: summarizing, error: summarizeError, summarize, reset: resetSummary } = useSummarize();

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [busy, onClose]);

  useEffect(() => {
    resetSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [row?.leaveRequestId]);

  const title = mode === "detail" ? "휴가 신청 상세" : mode === "approve" ? "휴가 승인 확인" : mode === "bulk" ? "선택 일괄 승인" : "휴가 반려";

  const handleConfirm = () => {
    if (mode === "reject") {
      if (!rejectionReason.trim()) {
        setRejectionError("반려 사유를 입력해주세요.");
        return;
      }
      setRejectionError(null);
      onConfirm?.(rejectionReason.trim());
      return;
    }
    onConfirm?.();
  };

  return (
    <Modal
      icon={CalendarDaysIcon}
      iconColor={mode === "reject" ? "rose" : "blue"}
      title={title}
      maxWidth="lg"
      onClose={onClose}
      footer={
        <>
          <ModalCancelButton onClick={onClose} disabled={busy}>닫기</ModalCancelButton>
          {mode !== "detail" && (
            <ModalPrimaryButton type="button" onClick={handleConfirm} disabled={busy} tone={mode === "reject" ? "rose" : "blue"}>
              {busy ? "처리 중..." : mode === "bulk" ? "선택 승인" : mode === "reject" ? "반려" : "승인"}
            </ModalPrimaryButton>
          )}
        </>
      }
    >
          {mode === "bulk" ? (
            <>
              <p className="text-sm text-gray-600">선택한 <strong className="text-gray-900">{selectedRows.length}건</strong>을 승인하시겠습니까?</p>
              <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
                {selectedRows.slice(0, 4).map((item) => item.employeeName).join(", ")}
                {selectedRows.length > 4 ? ` 외 ${selectedRows.length - 4}명` : ""}
              </div>
            </>
          ) : row && (
            <>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <Info label="직원" value={`${row.employeeName}${row.employeeNo ? ` (${row.employeeNo})` : ""}`} />
                <Info label="부서 / 직급" value={`${row.departmentName || "-"} / ${row.positionName || "-"}`} />
                <Info label="휴가 유형" value={row.leaveTypeName} />
                <Info label="휴가 기간" value={period(row)} />
                <Info label="사용 일수" value={`${row.leaveDays}일`} />
                <Info label="신청일" value={date(row.createdAt)} />
                <Info label="상태" value={STATUS_LABELS[row.status]} />
                <Info label="승인자" value={row.approverName || "-"} />
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="text-xs font-medium text-gray-500">신청 사유</p>
                  {row.reason && (
                    <button
                      type="button"
                      onClick={() => summarize(row.reason ?? "")}
                      disabled={summarizing}
                      className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-600 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <SparklesIcon className="h-3 w-3" />
                      {summarizing ? "요약 중..." : "AI 요약"}
                    </button>
                  )}
                </div>
                {(summary || summarizeError) && (
                  <p className={`mb-2 rounded-lg p-3 text-sm ${summarizeError ? "bg-rose-50 text-rose-600" : "bg-indigo-50 text-indigo-700"}`}>
                    {summarizeError || summary}
                  </p>
                )}
                <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700">{row.reason || "-"}</p>
              </div>
              {mode === "detail" && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <Info label="이메일" value={row.email || "-"} />
                  <Info label="처리일" value={dateTime(row.processedAt)} />
                  <Info label="반려 사유" value={row.rejectionReason || "-"} />
                </div>
              )}
              {mode === "approve" && <p className="text-sm font-medium text-gray-700">이 휴가 신청을 승인하시겠습니까?</p>}
              {mode === "reject" && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500" htmlFor="rejection-reason">반려 사유 *</label>
                  <textarea
                    id="rejection-reason"
                    value={rejectionReason}
                    onChange={(event) => setRejectionReason(event.target.value)}
                    rows={3}
                    maxLength={500}
                    placeholder="반려 사유를 입력하세요"
                    className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                  {rejectionError && <p className="mt-1 text-xs text-rose-600">{rejectionError}</p>}
                </div>
              )}
            </>
          )}
          {error && <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
    </Modal>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="mt-1 font-medium text-gray-900">{value}</p>
    </div>
  );
}
