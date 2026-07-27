package erp.system.notice.service;

import erp.system.auditlog.entity.AuditLog;
import erp.system.auditlog.service.AuditLogService;
import erp.system.common.exception.BusinessException;
import erp.system.common.exception.ErrorCode;
import erp.system.department.entity.Department;
import erp.system.department.repository.DepartmentRepository;
import erp.system.employee.entity.Employee;
import erp.system.employee.repository.EmployeeRepository;
import erp.system.notice.dto.NoticeCreateRequest;
import erp.system.notice.dto.NoticeResponse;
import erp.system.notice.dto.NoticeSummaryResponse;
import erp.system.notice.dto.NoticeUpdateRequest;
import erp.system.notice.entity.Notice;
import erp.system.notice.entity.NoticeView;
import erp.system.notice.repository.NoticeRepository;
import erp.system.notice.repository.NoticeViewRepository;
import erp.system.notification.entity.Notification;
import erp.system.notification.service.NotificationService;
import erp.system.teamlead.service.TeamLeadAuthorityService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NoticeService {

    private final NoticeRepository noticeRepository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final NoticeViewRepository noticeViewRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;
    private final TeamLeadAuthorityService teamLeadAuthorityService;

    public Page<NoticeSummaryResponse> getList(Long requesterId, String keyword, Pageable pageable) {
        String normalizedKeyword = StringUtils.hasText(keyword) ? keyword : null;
        Employee requester = findEmployee(requesterId);
        Long viewerDepartmentId = requester.getDepartment() != null ? requester.getDepartment().getDepartmentId() : null;
        return noticeRepository.search(normalizedKeyword, requester.isAdmin(), viewerDepartmentId, pageable)
                .map(NoticeSummaryResponse::from);
    }

    @Transactional
    public NoticeResponse getById(Long noticeId, Long viewerId) {
        Notice notice = findActive(noticeId);
        Employee viewer = viewerId != null ? findEmployee(viewerId) : null;
        if (viewer != null) {
            checkViewable(notice, viewer);
        }
        if (viewer != null && !noticeViewRepository.existsByNotice_NoticeIdAndEmployee_EmployeeId(noticeId, viewerId)) {
            noticeViewRepository.save(NoticeView.builder().notice(notice).employee(viewer).build());
            notice.increaseViewCount();
        }
        return NoticeResponse.from(notice);
    }

    @Transactional
    public NoticeResponse create(Long writerId, NoticeCreateRequest request) {
        Employee writer = findEmployee(writerId);
        Department scopeDepartment = resolveScopeDepartment(writer, request.departmentId());

        Notice notice = Notice.builder()
                .writer(writer)
                .title(request.title())
                .content(request.content())
                .pinned(request.pinned())
                .scopeDepartment(scopeDepartment)
                .build();

        Notice saved = noticeRepository.save(notice);

        notificationService.notifyAllExceptSelf(
                writerId,
                Notification.TYPE_NOTICE_CREATED,
                "새 공지사항",
                "\"" + request.title() + "\" 공지사항이 등록되었습니다.",
                "/notices/view",
                "/notices"
        );

        auditLogService.log(writerId, AuditLog.ACTION_NOTICE_CREATE, "공지사항 등록: " + request.title(), null);

        return NoticeResponse.from(saved);
    }

    @Transactional
    public NoticeResponse update(Long noticeId, NoticeUpdateRequest request, Long actorId) {
        Notice notice = findActive(noticeId);
        Employee actor = findEmployee(actorId);
        boolean isWriter = notice.getWriter() != null && actorId.equals(notice.getWriter().getEmployeeId());
        if (!actor.isAdmin() && !isWriter) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }
        Department scopeDepartment = resolveScopeDepartment(actor, request.departmentId());
        notice.update(request.title(), request.content(), request.pinned(), scopeDepartment);
        auditLogService.log(actorId, AuditLog.ACTION_NOTICE_UPDATE, "공지사항 수정: " + request.title(), null);
        return NoticeResponse.from(notice);
    }

    @Transactional
    public void delete(Long noticeId, Long actorId) {
        Employee actor = findEmployee(actorId);
        if (!actor.isAdmin()) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }
        Notice notice = findActive(noticeId);
        String title = notice.getTitle();
        notice.markDeleted();
        auditLogService.log(actorId, AuditLog.ACTION_NOTICE_DELETE, "공지사항 삭제: " + title, null);
    }

    /**
     * admin이면 요청한 부서(또는 전사공개 null)를 그대로 사용. 팀장 위임자면 항상 본인 관리 부서로 강제 고정
     * (요청에 다른 값/null이 와도 무시). 둘 다 아니면 애초에 이 메서드까지 도달하지 못하도록 상위에서 막혀야 한다.
     */
    private Department resolveScopeDepartment(Employee actor, Long requestedDepartmentId) {
        if (actor.isAdmin()) {
            if (requestedDepartmentId == null) {
                return null;
            }
            return departmentRepository.findById(requestedDepartmentId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.DEPARTMENT_NOT_FOUND));
        }

        Long managedDepartmentId = teamLeadAuthorityService.getManagedDepartmentId(actor.getEmployeeId());
        if (managedDepartmentId == null) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }
        return departmentRepository.findById(managedDepartmentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.DEPARTMENT_NOT_FOUND));
    }

    private void checkViewable(Notice notice, Employee viewer) {
        if (notice.getScopeDepartment() == null || viewer.isAdmin()) {
            return;
        }
        Long viewerDepartmentId = viewer.getDepartment() != null ? viewer.getDepartment().getDepartmentId() : null;
        if (!notice.getScopeDepartment().getDepartmentId().equals(viewerDepartmentId)) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }
    }

    private Employee findEmployee(Long employeeId) {
        return employeeRepository.findById(employeeId)
                .orElseThrow(() -> new BusinessException(ErrorCode.EMPLOYEE_NOT_FOUND));
    }

    private Notice findActive(Long noticeId) {
        return noticeRepository.findById(noticeId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOTICE_NOT_FOUND));
    }
}
