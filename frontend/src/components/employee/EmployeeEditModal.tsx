"use client";

import { useEffect, useState } from "react";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import Modal, { ModalCancelButton, ModalPrimaryButton } from "@/components/common/Modal";
import { EMPLOYEE_DOCUMENT_TYPE_OPTIONS } from "@/components/employee/documentTypes";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8081/api";
const FILE_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

function authHeaders(): HeadersInit {
  const token = window.localStorage.getItem("accessToken") ?? window.sessionStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

type EmployeeDocument = {
  employeeDocumentId: number;
  documentType: string;
  attachmentUrl: string;
  attachmentName: string;
  createdAt: string;
};

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "재직", selectedClasses: "border-emerald-500 bg-emerald-50 text-emerald-600" },
  { value: "LEAVE", label: "휴직", selectedClasses: "border-orange-500 bg-orange-50 text-orange-600" },
  { value: "RESIGNED", label: "퇴사", selectedClasses: "border-rose-500 bg-rose-50 text-rose-600" },
];

const inputClasses = "w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
const labelClasses = "block text-sm font-medium text-gray-700 mb-1";

export default function EmployeeEditModal({ employee, onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    ...employee,
    name: employee.name || "",
    email: employee.email || "",
    phone: employee.phone || "",
    address: employee.address || "",
    employeeStatusCode: employee.employeeStatusCode || "ACTIVE",
    employmentTypeId: employee.employmentTypeId || 1,
  });

  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [uploadingType, setUploadingType] = useState<string | null>(null);

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/employees/${employee.employeeId}/documents`, { headers: authHeaders() });
      if (res.ok) {
        setDocuments(await res.json());
      }
    } catch (error) {
      console.error("Failed to fetch employee documents", error);
    }
  };

  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employee.employeeId]);

  const handleDocumentUpload = async (documentType: string, file: File) => {
    setUploadingType(documentType);
    try {
      const formData = new FormData();
      formData.append("documentType", documentType);
      formData.append("file", file);
      const res = await fetch(`${API_BASE_URL}/employees/${employee.employeeId}/documents`, {
        method: "POST",
        headers: authHeaders(),
        body: formData,
      });
      if (res.ok) {
        await fetchDocuments();
      } else {
        alert("서류 업로드에 실패했습니다.");
      }
    } catch (error) {
      console.error(error);
      alert("서류 업로드 중 오류가 발생했습니다.");
    } finally {
      setUploadingType(null);
    }
  };

  const handleDocumentDelete = async (documentId: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/employees/${employee.employeeId}/documents/${documentId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (res.ok) {
        setDocuments((current) => current.filter((document) => document.employeeDocumentId !== documentId));
      } else {
        alert("서류 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error(error);
      alert("서류 삭제 중 오류가 발생했습니다.");
    }
  };

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfileImageChange = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev: any) => ({ ...prev, profileImage: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/employees/${employee.employeeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        onSave();
      } else {
        alert("수정 실패");
      }
    } catch (error) {
      console.error(error);
      alert("오류 발생");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      icon={PencilSquareIcon}
      title="직원 정보 수정"
      onClose={onClose}
      maxWidth="lg"
      as="form"
      onSubmit={handleSubmit}
      bodyClassName="max-h-[65vh] space-y-5 overflow-y-auto p-6"
      footer={
        <>
          <ModalCancelButton onClick={onClose} />
          <ModalPrimaryButton type="submit" disabled={loading}>
            {loading ? "저장 중..." : "저장"}
          </ModalPrimaryButton>
        </>
      }
    >
            <div className="border border-gray-100 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">프로필 사진</h3>
              </div>
              <div className="p-4 flex items-center gap-4">
                {formData.profileImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={formData.profileImage} alt="프로필 사진" className="w-16 h-16 rounded-full object-cover shadow-sm border border-gray-100" />
                ) : (
                  <div className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-sm">
                    {formData.name ? formData.name.charAt(0) : "?"}
                  </div>
                )}
                <label className="cursor-pointer px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                  사진 변경
                  <input type="file" accept="image/*" className="hidden" onChange={handleProfileImageChange} />
                </label>
                {formData.profileImage && (
                  <button
                    type="button"
                    onClick={() => setFormData((prev: any) => ({ ...prev, profileImage: null }))}
                    className="px-3 py-1.5 text-sm font-medium text-rose-600 bg-white border border-rose-200 rounded-md hover:bg-rose-50"
                  >
                    사진 삭제
                  </button>
                )}
              </div>
            </div>

            <div className="border border-gray-100 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">기본 정보</h3>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className={labelClasses}>이름</label>
                  <input name="name" value={formData.name} onChange={handleChange} required className={inputClasses} />
                </div>
                <div>
                  <label className={labelClasses}>이메일</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required className={inputClasses} />
                </div>
                <div>
                  <label className={labelClasses}>연락처</label>
                  <input name="phone" value={formData.phone} onChange={handleChange} className={inputClasses} />
                </div>
                <div>
                  <label className={labelClasses}>주소</label>
                  <input name="address" value={formData.address} onChange={handleChange} placeholder="주소를 입력하세요" className={inputClasses} />
                </div>
              </div>
            </div>

            <div className="border border-gray-100 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">첨부 서류</h3>
              </div>
              <div className="p-4 space-y-2">
                {EMPLOYEE_DOCUMENT_TYPE_OPTIONS.map((docType) => {
                  const document = documents.find((doc) => doc.documentType === docType.value);
                  const uploading = uploadingType === docType.value;
                  return (
                    <div key={docType.value} className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 p-3">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-700">
                          {docType.label} {docType.required ? <b className="text-rose-500">*</b> : null}
                        </p>
                        {document ? (
                          <a
                            href={`${FILE_ORIGIN}${document.attachmentUrl}`}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 block truncate text-xs font-semibold text-blue-600 hover:underline"
                          >
                            {document.attachmentName}
                          </a>
                        ) : (
                          <p className="mt-1 text-xs text-gray-400">미제출</p>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <label className="cursor-pointer rounded-md border border-gray-300 px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-50">
                          {uploading ? "업로드 중..." : document ? "재업로드" : "파일 선택"}
                          <input
                            type="file"
                            disabled={uploading}
                            className="hidden"
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              event.target.value = "";
                              if (file) void handleDocumentUpload(docType.value, file);
                            }}
                          />
                        </label>
                        {document ? (
                          <button
                            type="button"
                            onClick={() => handleDocumentDelete(document.employeeDocumentId)}
                            className="text-rose-400 hover:text-rose-600"
                            aria-label={`${docType.label} 삭제`}
                          >
                            ×
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border border-gray-100 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">재직 상태</h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-3 gap-2">
                  {STATUS_OPTIONS.map((option) => {
                    const selected = formData.employeeStatusCode === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => setFormData({ ...formData, employeeStatusCode: option.value })}
                        className={`h-10 rounded-lg border text-sm font-bold transition-colors ${
                          selected ? option.selectedClasses : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
    </Modal>
  );
}
