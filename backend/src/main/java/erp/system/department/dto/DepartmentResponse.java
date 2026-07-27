package erp.system.department.dto;

import erp.system.common.util.SoftDeleteAware;
import erp.system.department.entity.Department;
import erp.system.teamlead.dto.TeamLeadAuthorityResponse;

public record DepartmentResponse(
        Long departmentId,
        String departmentName,
        Long parentDepartmentId,
        String parentDepartmentName,
        Long departmentHeadId,
        String departmentHeadName
) {
    private static final String VACANT_LABEL = "공석";

    /**
     * 부서의 "담당자"는 팀장 위임 정보를 기준으로 표시한다(위임이 없으면 "공석").
     * activeHead는 해당 부서에 현재 활성 상태로 위임된 팀장 정보(없으면 null).
     */
    public static DepartmentResponse from(Department department, TeamLeadAuthorityResponse activeHead) {
        Department parent = SoftDeleteAware.resolve(department.getParentDepartment(), Department::getDepartmentName);
        return new DepartmentResponse(
                department.getDepartmentId(),
                department.getDepartmentName(),
                SoftDeleteAware.identifierOf(parent, () -> parent.getDepartmentId()),
                parent != null ? parent.getDepartmentName() : null,
                activeHead != null ? activeHead.employeeId() : null,
                activeHead != null ? activeHead.employeeName() : VACANT_LABEL
        );
    }
}
