"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ShieldExclamationIcon } from "@heroicons/react/24/outline";
import { dashboardMenuGroups } from "@/lib/dashboardMenu";
import { isAdmin } from "@/lib/auth";
import Modal from "@/components/common/Modal";

const allMenuItems = dashboardMenuGroups.flatMap((group) => group.items);

function isAdminOnlyPath(pathname: string) {
  // Some employee routes are nested below an administrator-only route
  // (e.g. `/certificates/my` under `/certificates`), so prefix matches must
  // resolve to the most specific (longest href) menu item, not just the
  // first one encountered.
  const matches = allMenuItems.filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
  if (matches.length === 0) return false;
  const mostSpecific = matches.reduce((longest, item) => (item.href.length > longest.href.length ? item : longest));
  return mostSpecific.adminOnly;
}

export default function RoleGuard() {
  const pathname = usePathname();
  const router = useRouter();
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    if (isAdminOnlyPath(pathname) && !isAdmin()) {
      setBlocked(true);
      router.replace("/dashboard");
    } else {
      setBlocked(false);
    }
  }, [pathname, router]);

  if (!blocked) return null;

  return (
    <Modal
      icon={ShieldExclamationIcon}
      iconColor="rose"
      title="접근 권한이 없습니다"
      subtitle="관리자만 접근할 수 있는 페이지입니다."
      onClose={() => router.replace("/dashboard")}
      maxWidth="sm"
      bodyClassName="hidden"
    >
      {null}
    </Modal>
  );
}
