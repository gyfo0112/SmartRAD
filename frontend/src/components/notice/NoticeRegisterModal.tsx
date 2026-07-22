"use client";

import { useEffect, useState } from "react";
import { MegaphoneIcon } from "@heroicons/react/24/outline";
import type { NoticeDetail } from "./types";
import Modal, { ModalCancelButton, ModalPrimaryButton } from "@/components/common/Modal";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8081/api";

const inputClasses = "w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
const labelClasses = "block text-sm font-medium text-gray-700 mb-1";

function authHeaders(): HeadersInit {
  const token = window.localStorage.getItem("accessToken") ?? window.sessionStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

interface Props {
  notice?: NoticeDetail | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function NoticeRegisterModal({ notice, onClose, onSaved }: Props) {
  const [title, setTitle] = useState(notice?.title ?? "");
  const [content, setContent] = useState(notice?.content ?? "");
  const [pinned, setPinned] = useState(notice?.pinned ?? false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitle(notice?.title ?? "");
    setContent(notice?.content ?? "");
    setPinned(notice?.pinned ?? false);
  }, [notice]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("제목과 내용을 입력해주세요.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const url = notice ? `${API_BASE_URL}/notices/${notice.noticeId}` : `${API_BASE_URL}/notices`;
      const res = await fetch(url, {
        method: notice ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ title: title.trim(), content: content.trim(), pinned }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message || "저장에 실패했습니다.");
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      icon={MegaphoneIcon}
      title={notice ? "공지사항 수정" : "공지사항 등록"}
      onClose={onClose}
      maxWidth="lg"
      as="form"
      onSubmit={handleSubmit}
      footer={
        <>
          <ModalCancelButton onClick={onClose} />
          <ModalPrimaryButton type="submit" disabled={loading}>
            {loading ? "저장 중..." : "저장"}
          </ModalPrimaryButton>
        </>
      }
    >
            <div>
              <label className={labelClasses}>제목 *</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} className={inputClasses} placeholder="공지 제목을 입력하세요" />
            </div>

            <div>
              <label className={labelClasses}>내용 *</label>
              <textarea value={content} onChange={(e) => setContent(e.target.value)} required rows={8} className={inputClasses} placeholder="공지 내용을 입력하세요" />
            </div>

            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              상단 고정
            </label>

            {error && <p className="text-sm font-medium text-rose-500">{error}</p>}
    </Modal>
  );
}
