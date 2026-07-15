"use client";

import { useEffect, useState } from "react";
import { UsersIcon, UserPlusIcon, UserMinusIcon, CalendarIcon } from "@heroicons/react/24/outline";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8081/api";

interface EmployeeSummary {
  employeeStatusCode: string;
  hireDate: string | null;
  resignationDate: string | null;
}

interface Stats {
  total: number;
  hiredThisMonth: number;
  resignedThisMonth: number;
  absentToday: number;
}

function getAuthToken() {
  return (
    window.localStorage.getItem("accessToken") ??
    window.sessionStorage.getItem("accessToken")
  );
}

function currentYearMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function todayString() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export default function EmployeeStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const token = getAuthToken();
      const authHeaders: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
      const yearMonth = currentYearMonth();

      try {
        const [employeesRes, attendanceRes] = await Promise.all([
          fetch(`${API_BASE_URL}/employees?page=0&size=1000`),
          fetch(`${API_BASE_URL}/attendances?date=${todayString()}`, { headers: authHeaders }),
        ]);

        const employeesPage = employeesRes.ok
          ? await employeesRes.json()
          : { content: [], totalElements: 0 };
        const attendance = attendanceRes.ok ? await attendanceRes.json() : [];

        const employees: EmployeeSummary[] = employeesPage.content ?? [];
        const activeCount = employees.filter((e) => e.employeeStatusCode === "ACTIVE").length;
        const hiredThisMonth = employees.filter((e) => e.hireDate?.startsWith(yearMonth)).length;
        const resignedThisMonth = employees.filter((e) => e.resignationDate?.startsWith(yearMonth)).length;
        const checkedInToday = Array.isArray(attendance) ? attendance.length : 0;

        setStats({
          total: employeesPage.totalElements ?? employees.length,
          hiredThisMonth,
          resignedThisMonth,
          absentToday: Math.max(activeCount - checkedInToday, 0),
        });
      } catch (error) {
        console.error("Failed to fetch employee stats", error);
      }
    };

    fetchStats();
  }, []);

  const cards = [
    {
      label: "전체 직원",
      value: stats ? `${stats.total}명` : "-",
      icon: UsersIcon,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      label: "이번달 입사",
      value: stats ? `${stats.hiredThisMonth}명` : "-",
      icon: UserPlusIcon,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      label: "이번달 퇴사",
      value: stats ? `${stats.resignedThisMonth}명` : "-",
      icon: UserMinusIcon,
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
    {
      label: "금일 결근",
      value: stats ? `${stats.absentToday}명` : "-",
      icon: CalendarIcon,
      color: "text-rose-500",
      bg: "bg-rose-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-full ${stat.bg} ${stat.color} flex items-center justify-center`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
            </div>
          </div>
        );
      })}
    </div>
  );
}
