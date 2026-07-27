package erp.system.teamlead.dto;

import erp.system.common.util.SoftDeleteAware;
import erp.system.department.entity.Department;
import erp.system.employee.entity.Employee;
import erp.system.teamlead.entity.TeamLeadAuthority;

import java.time.LocalDateTime;

public record TeamLeadAuthorityResponse(
        Long employeeId,
        String employeeNo,
        String employeeName,
        Long departmentId,
        String departmentName,
        LocalDateTime grantedAt
) {
    public static TeamLeadAuthorityResponse from(TeamLeadAuthority authority) {
        Employee employee = authority.getEmployee();
        Department department = SoftDeleteAware.resolve(employee.getDepartment(), Department::getDepartmentName);
        return new TeamLeadAuthorityResponse(
                employee.getEmployeeId(),
                employee.getEmployeeNo(),
                employee.getName(),
                department != null ? department.getDepartmentId() : null,
                department != null ? department.getDepartmentName() : null,
                authority.getCreatedAt()
        );
    }
}
