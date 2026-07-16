"use client";

import NoticeStats from "@/components/notice/NoticeStats";
import NoticeList from "@/components/notice/NoticeList";

export default function NoticesPage() {
  return (
    <div className="max-w-[1600px] mx-auto h-[calc(100vh-100px)] flex flex-col p-6">
      <NoticeStats />
      <NoticeList />
    </div>
  );
}
