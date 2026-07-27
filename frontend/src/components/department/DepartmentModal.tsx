"use client";

import { useState } from "react";
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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!department;

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
        <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3">
          <p className="text-sm font-semibold text-gray-900 mb-1">현재 담당자(팀장)</p>
          <p className="text-sm text-gray-600">{department?.departmentHeadName ?? "공석"}</p>
          <p className="mt-1 text-xs text-gray-400">팀장 위임은 직원 상세 화면에서 부여/회수할 수 있습니다.</p>
        </div>
      )}
    </Modal>
  );
}
