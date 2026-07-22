"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { clearAuthStorage } from "@/lib/auth";
import Modal, { ModalPrimaryButton } from "@/components/common/Modal";

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
    <Modal
      icon={ExclamationTriangleIcon}
      iconColor="amber"
      title="세션이 만료되었습니다"
      subtitle="보안을 위해 자동으로 로그아웃되었습니다. 다시 로그인해 주세요."
      onClose={handleConfirm}
      maxWidth="sm"
      bodyClassName="hidden"
      footer={<ModalPrimaryButton onClick={handleConfirm}>확인</ModalPrimaryButton>}
    >
      {null}
    </Modal>
  );
}
