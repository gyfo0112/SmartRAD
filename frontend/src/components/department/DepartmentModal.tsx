"use client";

import { useState, useEffect } from "react";
import { BuildingOfficeIcon } from "@heroicons/react/24/outline";
import Modal, { ModalCancelButton, ModalPrimaryButton } from "@/components/common/Modal";

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

  return (
    <Modal
      icon={BuildingOfficeIcon}
      title={department ? "부서 수정" : "부서 추가"}
      subtitle={`부서 정보를 ${department ? "수정" : "입력"}해주세요.`}
      onClose={onClose}
      as="form"
      onSubmit={handleSubmit}
      footer={
        <>
          <ModalCancelButton onClick={onClose} disabled={saving} />
          <ModalPrimaryButton type="submit" disabled={saving || !departmentName.trim()}>
            {saving ? "저장 중..." : "저장"}
          </ModalPrimaryButton>
        </>
      }
    >
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
    </Modal>
  );
}
