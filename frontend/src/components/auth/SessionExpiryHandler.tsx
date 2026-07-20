"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearAuthStorage } from "@/lib/auth";

let fetchPatched = false;
let notifySessionExpired: (() => void) | null = null;

function hasAuthorizationHeader(init?: RequestInit) {
  const headers = init?.headers;
  if (!headers) return false;
  if (headers instanceof Headers) return headers.has("Authorization");
  if (Array.isArray(headers)) {
    return headers.some(([key]) => key.toLowerCase() === "authorization");
  }
  return Object.keys(headers).some((key) => key.toLowerCase() === "authorization");
}

function patchFetchOnce() {
  if (fetchPatched) return;
  fetchPatched = true;
  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const response = await originalFetch(input, init);
    if (response.status === 401 && hasAuthorizationHeader(init)) {
      notifySessionExpired?.();
    }
    return response;
  };
}

export default function SessionExpiryHandler() {
  const [expired, setExpired] = useState(false);
  const router = useRouter();

  useEffect(() => {
    patchFetchOnce();
    notifySessionExpired = () => setExpired(true);
    return () => {
      notifySessionExpired = null;
    };
  }, []);

  const handleConfirm = () => {
    clearAuthStorage();
    setExpired(false);
    router.push("/login");
  };

  if (!expired) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 px-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
        <h2 className="text-lg font-bold text-slate-900">세션이 만료되었습니다</h2>
        <p className="mt-2 text-sm text-slate-500">
          보안을 위해 자동으로 로그아웃되었습니다. 다시 로그인해 주세요.
        </p>
        <button
          type="button"
          onClick={handleConfirm}
          className="mt-5 w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          확인
        </button>
      </div>
    </div>
  );
}
