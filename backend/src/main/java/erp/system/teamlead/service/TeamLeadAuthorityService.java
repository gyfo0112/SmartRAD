package erp.system.teamlead.service;

import erp.system.auditlog.entity.AuditLog;
import erp.system.auditlog.service.AuditLogService;
import erp.system.common.exception.BusinessException;
import erp.system.common.exception.ErrorCode;
import erp.system.employee.entity.Employee;
import erp.system.employee.repository.EmployeeRepository;
import erp.system.teamlead.dto.TeamLeadAuthorityResponse;
import erp.system.teamlead.entity.TeamLeadAuthority;
import erp.system.teamlead.repository.TeamLeadAuthorityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * 관리자가 특정 직원에게 부여하는 "팀장 권한" — 부서장(Department.departmentHead, 조직도 표시용)과는
 * 별개의 개념이며, 부서는 위임 행에 저장하지 않고 매 요청마다 대상 직원의 현재 소속 부서로 동적으로 계산한다.
 * 인가 판단은 항상 이 서비스가 DB를 다시 조회해서 수행하며, JWT의 delegated 클레임(프런트 메뉴 표시용)은 신뢰하지 않는다.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TeamLeadAuthorityService {

    private final TeamLeadAuthorityRepository teamLeadAuthorityRepository;
    private final EmployeeRepository employeeRepository;
    private final AuditLogService auditLogService;

    @Transactional
    public void grant(Long employeeId, Long actorId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new BusinessException(ErrorCode.EMPLOYEE_NOT_FOUND));
        TeamLeadAuthority authority = teamLeadAuthorityRepository.findByEmployee_EmployeeId(employeeId)
                .orElseGet(() -> TeamLeadAuthority.builder().employee(employee).build());
        authority.setActive(true);
        teamLeadAuthorityRepository.save(authority);
        auditLogService.log(actorId, AuditLog.ACTION_TEAM_LEAD_AUTHORITY_GRANT,
                "팀장 권한 부여: " + employee.getName() + "(" + employee.getEmployeeNo() + ")", null);
    }

    @Transactional
    public void revoke(Long employeeId, Long actorId) {
        TeamLeadAuthority authority = teamLeadAuthorityRepository.findByEmployee_EmployeeId(employeeId)
                .orElseThrow(() -> new BusinessException(ErrorCode.TEAM_LEAD_AUTHORITY_NOT_FOUND));
        authority.setActive(false);
        Employee employee = authority.getEmployee();
        auditLogService.log(actorId, AuditLog.ACTION_TEAM_LEAD_AUTHORITY_REVOKE,
                "팀장 권한 회수: " + employee.getName() + "(" + employee.getEmployeeNo() + ")", null);
    }

    public boolean hasAuthority(Long employeeId) {
        if (employeeId == null) {
            return false;
        }
        return teamLeadAuthorityRepository.findByEmployee_EmployeeId(employeeId)
                .map(TeamLeadAuthority::isActive)
                .orElse(false);
    }

    /**
     * 위임이 없으면 null. 있으면 위임 행이 아니라 직원을 다시 조회해서 "현재" 소속 부서 id를 반환한다
     * (부서 이동 시 위임 범위가 자동으로 따라가도록).
     */
    public Long getManagedDepartmentId(Long employeeId) {
        if (!hasAuthority(employeeId)) {
            return null;
        }
        Employee employee = employeeRepository.findById(employeeId).orElse(null);
        if (employee == null || employee.getDepartment() == null) {
            return null;
        }
        return employee.getDepartment().getDepartmentId();
    }

    /**
     * admin이면 통과. 아니면 actor가 targetDepartmentId를 관리하는 팀장일 때만 통과, 그 외 ACCESS_DENIED.
     */
    public void authorizeManage(Long actorId, boolean actorIsAdmin, Long targetDepartmentId) {
        if (actorIsAdmin) {
            return;
        }
        Long managedDepartmentId = getManagedDepartmentId(actorId);
        if (managedDepartmentId == null || targetDepartmentId == null || !managedDepartmentId.equals(targetDepartmentId)) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }
    }

    public Set<Long> getActiveEmployeeIds() {
        return new HashSet<>(teamLeadAuthorityRepository.findActiveEmployeeIds());
    }

    public List<TeamLeadAuthorityResponse> listActive() {
        return teamLeadAuthorityRepository.findAllByActiveTrue().stream()
                .map(TeamLeadAuthorityResponse::from)
                .toList();
    }
}
