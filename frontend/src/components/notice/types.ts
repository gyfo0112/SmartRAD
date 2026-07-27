export interface NoticeSummary {
  noticeId: number;
  writerName: string;
  title: string;
  pinned: boolean;
  viewCount: number;
  createdAt: string;
  scopeDepartmentId: number | null;
  scopeDepartmentName: string | null;
}

export interface NoticePage {
  content: NoticeSummary[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface NoticeDetail {
  noticeId: number;
  writerId: number;
  writerName: string;
  title: string;
  content: string;
  pinned: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  scopeDepartmentId: number | null;
  scopeDepartmentName: string | null;
}
