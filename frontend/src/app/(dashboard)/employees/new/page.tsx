"use client";

import { type ChangeEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { EMPLOYEE_DOCUMENT_TYPE_OPTIONS, employeeDocumentTypeLabel } from "@/components/employee/documentTypes";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8081/api";

function authHeaders(): HeadersInit {
  const token = window.localStorage.getItem("accessToken") ?? window.sessionStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

type Option = {
  label: string;
  value: string;
};

type InputProps = {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  muted?: boolean;
  suffix?: string;
  placeholder?: string;
  type?: string;
};

const Input = ({ label, name, value, onChange, required, muted, suffix, placeholder, type = "text" }: InputProps) => (
  <label className="block" htmlFor={name}>
    <span className="mb-2 block text-xs font-bold text-slate-700">
      {label} {required ? <b className="text-rose-500">*</b> : null}
    </span>
    <div
      className={`flex h-10 items-center rounded-lg border px-3 text-sm ${
        muted ? "border-slate-200 bg-slate-50 text-slate-300" : "border-slate-200 bg-white text-slate-900 focus-within:border-indigo-500"
      }`}
    >
      <input
        id={name}
        name={name}
        className="w-full bg-transparent outline-none placeholder:text-slate-300"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        readOnly={muted}
        disabled={muted}
        placeholder={placeholder}
        type={type}
      />
      {suffix ? <span className="text-xs text-slate-400">{suffix}</span> : null}
    </div>
  </label>
);

const Select = ({ label, name, value, onChange, options, placeholder, required }: { label: string; name: string; value: string; onChange: (value: string) => void; options: Option[]; placeholder: string; required?: boolean }) => (
  <label className="block" htmlFor={name}>
    <span className="mb-2 block text-xs font-bold text-slate-700">
      {label} {required ? <b className="text-rose-500">*</b> : null}
    </span>
    <select
      id={name}
      name={name}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={`h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-500 ${value ? "text-slate-900" : "text-slate-300"}`}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </label>
);

const Card = ({ title, badge, children }: { title: string; badge?: string; children: React.ReactNode }) => (
  <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
    <div className="flex h-14 items-center justify-between border-b border-slate-200 px-6">
      <h2 className="text-base font-extrabold text-slate-950">{title}</h2>
      {badge ? <span className="rounded-full bg-slate-50 px-3 py-1 text-[11px] text-slate-400">{badge}</span> : null}
    </div>
    <div className="p-6">{children}</div>
  </section>
);

const emptyEmployee = {
  name: "",
  birthDate: "",
  phone: "",
  email: "",
  address: "",
  gender: "",
  department: "",
  position: "",
  manager: "",
  hireDate: "",
};

export default function NewEmployeePage() {
  const router = useRouter();
  const [employee, setEmployee] = useState(emptyEmployee);
  const [departments, setDepartments] = useState<Option[]>([]);
  const [positions, setPositions] = useState<Option[]>([]);
  const [managers, setManagers] = useState<Option[]>([]);
  const [profileImage, setProfileImage] = useState<{ name: string; preview: string } | null>(null);
  const [documentFiles, setDocumentFiles] = useState<Record<string, File>>({});
  const [fileInputKey, setFileInputKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const token = window.localStorage.getItem("accessToken") ?? window.sessionStorage.getItem("accessToken");
        const authHeaders: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
        const [departmentsRes, positionsRes, employeesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/departments`),
          fetch(`${API_BASE_URL}/positions`, { headers: authHeaders }),
          fetch(`${API_BASE_URL}/employees?page=0&size=1000`),
        ]);
        if (departmentsRes.ok) {
          const data = await departmentsRes.json();
          setDepartments(data.map((d: { departmentId: number; departmentName: string }) => ({ label: d.departmentName, value: String(d.departmentId) })));
        }
        if (positionsRes.ok) {
          const data = await positionsRes.json();
          setPositions(data.map((p: { positionId: number; positionName: string }) => ({ label: p.positionName, value: String(p.positionId) })));
        }
        if (employeesRes.ok) {
          const data = await employeesRes.json();
          setManagers(
            data.content.map((e: { employeeId: number; name: string; departmentName: string | null; positionName: string | null }) => ({
              label: `${e.name}${e.departmentName ? ` (${e.departmentName}${e.positionName ? ` ${e.positionName}` : ""})` : ""}`,
              value: String(e.employeeId),
            }))
          );
        }
      } catch (err) {
        console.error("Failed to fetch department/position options", err);
      }
    };

    fetchOptions();
  }, []);

  const updateEmployee = (field: keyof typeof emptyEmployee) => (value: string) => {
    setEmployee((currentEmployee) => ({ ...currentEmployee, [field]: value }));
  };

  const handleSave = async () => {
    if (!employee.name || !employee.birthDate || !employee.gender || !employee.phone || !employee.email || !employee.address || !employee.department || !employee.position) {
      setError("필수 항목을 모두 입력해주세요.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/employees`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          departmentId: Number(employee.department),
          positionId: Number(employee.position),
          managerId: employee.manager ? Number(employee.manager) : null,
          name: employee.name,
          birthDate: employee.birthDate,
          phone: employee.phone,
          email: employee.email,
          address: employee.address || null,
          hireDate: employee.hireDate || null,
          password: employee.birthDate.replaceAll("-", ""),
          profileImage: profileImage?.preview ?? null,
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.message || "등록에 실패했습니다.");
      }

      const created = await res.json();
      const failedDocumentLabels: string[] = [];

      for (const [documentType, file] of Object.entries(documentFiles)) {
        const formData = new FormData();
        formData.append("documentType", documentType);
        formData.append("file", file);
        try {
          const documentRes = await fetch(`${API_BASE_URL}/employees/${created.employeeId}/documents`, {
            method: "POST",
            headers: authHeaders(),
            body: formData,
          });
          if (!documentRes.ok) {
            failedDocumentLabels.push(employeeDocumentTypeLabel(documentType));
          }
        } catch {
          failedDocumentLabels.push(employeeDocumentTypeLabel(documentType));
        }
      }

      alert(
        failedDocumentLabels.length > 0
          ? `직원이 등록되었습니다.\n초기 비밀번호는 생년월일 8자리입니다.\n다음 서류는 업로드에 실패했습니다: ${failedDocumentLabels.join(", ")}`
          : "직원이 등록되었습니다.\n초기 비밀번호는 생년월일 8자리입니다."
      );
      router.push("/employees");
    } catch (err) {
      setError(err instanceof Error ? err.message : "등록 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setEmployee(emptyEmployee);
    setProfileImage(null);
    setDocumentFiles({});
    setFileInputKey((currentKey) => currentKey + 1);
  };

  const handleProfileImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setProfileImage({ name: file.name, preview: reader.result });
      }
    };

    reader.readAsDataURL(file);
  };

  const handleDocumentFileChange = (documentType: string) => (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setDocumentFiles((current) => ({ ...current, [documentType]: file }));
  };

  const removeDocumentFile = (documentType: string) => {
    setDocumentFiles((current) => {
      const next = { ...current };
      delete next[documentType];
      return next;
    });
  };

  return (
    <div className="max-w-[1600px] mx-auto pb-8">
      <div className="space-y-6">
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-indigo-200 bg-indigo-50 px-6 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-200 text-indigo-700">♧</div>
          <div>
            <p className="text-sm font-extrabold">신규 직원 등록</p>
            <p className="text-xs text-indigo-500">필수 항목을 모두 입력한 뒤 저장하기를 눌러 등록을 완료하세요.</p>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
          <div className="space-y-4">
            <Card title="①  기본 정보" badge="* 표시 항목은 필수입니다">
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="이름" name="name" value={employee.name} onChange={updateEmployee("name")} required placeholder="이름을 입력하세요" />
                <Input label="직원 번호" name="employeeNumber" value="" onChange={() => undefined} muted placeholder="저장 시 자동 생성됩니다" />
                <Input label="생년월일" name="birthDate" value={employee.birthDate} onChange={updateEmployee("birthDate")} required placeholder="YYYY-MM-DD" type="date" />
                <div>
                  <span className="mb-2 block text-xs font-bold text-slate-700">
                    성별 <b className="text-rose-500">*</b>
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "남성", value: "male" },
                      { label: "여성", value: "female" },
                    ].map((gender) => {
                      const selected = employee.gender === gender.value;
                      return (
                        <button
                          key={gender.value}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => updateEmployee("gender")(gender.value)}
                          className={`h-10 rounded-lg border text-sm font-bold transition ${
                            selected ? "border-indigo-500 bg-indigo-50 text-indigo-600" : "border-slate-200 bg-white text-slate-500 hover:border-indigo-200 hover:text-indigo-500"
                          }`}
                        >
                          {gender.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <Input label="연락처" name="phone" value={employee.phone} onChange={updateEmployee("phone")} required placeholder="010-0000-0000" type="tel" />
                <Input label="이메일" name="email" value={employee.email} onChange={updateEmployee("email")} required placeholder="email@example.com" type="email" />
                <div className="md:col-span-2">
                  <Input label="주소" name="address" value={employee.address} onChange={updateEmployee("address")} required placeholder="주소를 입력하세요" />
                </div>
              </div>
            </Card>

            <Card title="②  소속 및 고용 정보">
              <div className="grid gap-4 md:grid-cols-2">
                <Select label="부서" name="department" value={employee.department} onChange={updateEmployee("department")} options={departments} placeholder="부서를 선택하세요" required />
                <Select label="직급" name="position" value={employee.position} onChange={updateEmployee("position")} options={positions} placeholder="직급을 선택하세요" required />
                <Select label="직속 관리자" name="manager" value={employee.manager} onChange={updateEmployee("manager")} options={managers} placeholder="DB 등록 직원을 선택하세요" />
                <Input label="입사일" name="hireDate" value={employee.hireDate} onChange={updateEmployee("hireDate")} placeholder="YYYY-MM-DD" type="date" />
              </div>
            </Card>
          </div>

          <aside className="space-y-4">
            <Card title="프로필 사진">
              <div className="text-center">
                {profileImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profileImage.preview} alt={`${profileImage.name} 미리보기`} className="mx-auto h-20 w-20 rounded-2xl object-cover" />
                ) : (
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100 text-3xl font-bold text-slate-300">?</div>
                )}
                <p className="mt-4 text-sm font-bold">사진을 업로드하세요</p>
                <p className="text-xs text-slate-400">JPG, PNG 최대 2MB</p>
                {profileImage ? <p className="mt-2 truncate text-xs font-semibold text-indigo-600">{profileImage.name}</p> : null}
                <label className="mt-4 flex h-9 w-full cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-sm hover:border-indigo-300 hover:text-indigo-600">
                  ⇧ 파일 선택
                  <input key={`profile-${fileInputKey}`} type="file" accept="image/png,image/jpeg" onChange={handleProfileImageChange} className="sr-only" />
                </label>
              </div>
            </Card>
            <Card title="서류 첨부" badge="종류별 첨부">
              <div className="space-y-2">
                {EMPLOYEE_DOCUMENT_TYPE_OPTIONS.map((docType) => {
                  const file = documentFiles[docType.value];
                  return (
                    <div key={docType.value} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-700">
                          {docType.label} {docType.required ? <b className="text-rose-500">*</b> : null}
                        </p>
                        {file ? (
                          <p className="mt-1 truncate text-xs font-semibold text-indigo-600">{file.name}</p>
                        ) : (
                          <p className="mt-1 text-xs text-slate-400">선택된 파일 없음</p>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <label className="cursor-pointer rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:border-indigo-300 hover:text-indigo-600">
                          {file ? "재선택" : "파일 선택"}
                          <input
                            key={`document-${docType.value}-${fileInputKey}`}
                            type="file"
                            onChange={handleDocumentFileChange(docType.value)}
                            className="sr-only"
                          />
                        </label>
                        {file ? (
                          <button
                            type="button"
                            onClick={() => removeDocumentFile(docType.value)}
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
            </Card>
          </aside>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-6 py-4">
          <p className="text-xs text-slate-400">
            {error ? <span className="font-bold text-rose-500">{error}</span> : "ⓘ * 표시 항목은 모두 입력해야 저장이 가능합니다."}
          </p>
          <div className="flex gap-3">
            <button type="button" onClick={() => router.push("/employees")} className="h-10 rounded-lg border border-slate-200 px-5 text-sm">취소</button>
            <button type="button" onClick={resetForm} className="h-10 rounded-lg border border-orange-200 bg-orange-50 px-5 text-sm font-bold text-orange-500">
              초기화
            </button>
            <button type="button" onClick={handleSave} disabled={isSubmitting} className="h-10 rounded-lg bg-indigo-600 px-7 text-sm font-bold text-white disabled:opacity-50">
              {isSubmitting ? "저장 중..." : "✓ 저장하기"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}