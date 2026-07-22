"use client";

import { useState, useEffect } from "react";
import { XMarkIcon, BuildingOfficeIcon } from "@heroicons/react/24/outline";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8081/api";

function authHeaders(): HeadersInit {
  const token = window.localStorage.getItem("accessToken") ?? window.sessionStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
}

export interface Department {
  departmentId: number;
  departmentName: string;
  parentDepartmentId?: number | null;
  parentDepartmentName?: string | null;
  departmentHeadId?: number | null;
  departmentHeadName?: string | null;
}

interface DepartmentModalProps {
  department: Department | null;
  departments: Department[];
  initialParentId?: number | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function DepartmentModal({ department, departments, initialParentId, onClose, onSaved }: DepartmentModalProps) {
  const [departmentName, setDepartmentName] = useState(department?.departmentName || "");
  const [parentDepartmentId, setParentDepartmentId] = useState<number | "">(
    department?.parentDepartmentId || initialParentId || ""
  );
  const [departmentHeadId, setDepartmentHeadId] = useState<number | "">(
    department?.departmentHeadId || ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [departmentEmployees, setDepartmentEmployees] = useState<{employeeId: number, name: string}[]>([]);
  const isEditMode = !!department;

  useEffect(() => {
    if (isEditMode && department?.departmentId) {
      let cancelled = false;
      const fetchEmployees = async () => {
        try {
          const token = window.localStorage.getItem("accessToken") ?? window.sessionStorage.getItem("accessToken");
          const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
          
          const res = await fetch(`${API_BASE_URL}/employees?departmentId=${department.departmentId}&size=1000`, { headers });
          if (res.ok) {
            const data = await res.json();
            if (!cancelled) setDepartmentEmployees(data.content || []);
          }
        } catch (e) {
          console.error("Failed to fetch employees", e);
        }
      };
      fetchEmployees();
      return () => { cancelled = true; };
    }
  }, [isEditMode, department]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const isEdit = !!department;
    const url = isEdit ? `${API_BASE_URL}/departments/${department.departmentId}` : `${API_BASE_URL}/departments`;
    const method = isEdit ? "PUT" : "POST";

    const payload: any = {
      departmentName,
      parentDepartmentId: parentDepartmentId === "" ? null : Number(parentDepartmentId),
    };
    
    if (isEdit) {
      payload.departmentHeadId = departmentHeadId === "" ? null : Number(departmentHeadId);
    }

    try {
      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || "부서 저장에 실패했습니다.");
      }

      onSaved();
    } catch (err: any) {
      setError(err.message || "오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  // Filter out self and its children recursively to prevent circular reference
  // For simplicity, since it's 1-depth or small tree, we at least filter out the department itself from parent choices.
  const availableParents = departments.filter((d) => d.departmentId !== department?.departmentId);

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <BuildingOfficeIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {department ? "부서 수정" : "부서 추가"}
              </h2>
              <p className="text-sm text-gray-500">
                부서 정보를 {department ? "수정" : "입력"}해주세요.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">
              부서명 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={departmentName}
              onChange={(e) => setDepartmentName(e.target.value)}
              placeholder="예: 인사팀, 개발팀"
              required
              maxLength={100}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">
              상위 부서 <span className="text-gray-400 font-normal ml-1">(선택)</span>
            </label>
            <select
              id="parentDepartment"
              value={parentDepartmentId}
              onChange={(e) => setParentDepartmentId(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            >
              <option value="">(최상위 부서)</option>
              {departments
                .filter((d) => d.departmentId !== department?.departmentId)
                .map((d) => (
                  <option key={d.departmentId} value={d.departmentId}>
                    {d.departmentName}
                  </option>
                ))}
            </select>
          </div>

          {isEditMode && (
            <div>
              <label htmlFor="departmentHead" className="block text-sm font-semibold text-gray-900 mb-1.5">
                부서장 (담당자)
              </label>
              <select
                id="departmentHead"
                value={departmentHeadId}
                onChange={(e) => setDepartmentHeadId(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              >
                <option value="">(담당자 미지정)</option>
                {departmentEmployees.map((emp) => (
                  <option key={emp.employeeId} value={emp.employeeId}>
                    {emp.name}
                  </option>
                ))}
              </select>
              {departmentEmployees.length === 0 && (
                <p className="mt-1 text-xs text-gray-500">현재 이 부서에 소속된 직원이 없습니다.</p>
              )}
            </div>
          )}

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-medium rounded-xl transition-colors disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={saving || !departmentName.trim()}
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm shadow-blue-200 disabled:opacity-50"
            >
              {saving ? "저장 중..." : "저장"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
