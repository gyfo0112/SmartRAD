"use client";

import { useCallback, useState } from "react";
import EventSupportStats from "@/components/eventsupport/EventSupportStats";
import EventSupportList from "@/components/eventsupport/EventSupportList";

export default function EventSupportAdminPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleActionComplete = useCallback(() => {
    setRefreshKey((key) => key + 1);
  }, []);

  return (
     <div className="mx-auto flex min-h-[calc(100vh-100px)] max-w-[1600px] flex-col p-3 sm:p-5 lg:h-[calc(100vh-100px)] lg:p-6">
      <EventSupportStats refreshKey={refreshKey} />
      <EventSupportList refreshKey={refreshKey} onActionComplete={handleActionComplete} />
    </div>
  );
}
