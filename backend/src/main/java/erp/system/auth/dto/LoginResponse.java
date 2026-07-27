package erp.system.auth.dto;

import erp.system.employee.entity.Employee;

public record LoginResponse(
        String accessToken,
        String tokenType,
        Long employeeId,
        String employeeNo,
        String name,
        String email,
        String role,
        boolean delegated,
        Long departmentId
) {
    public static LoginResponse of(String accessToken, Employee employee, boolean delegated) {
        return new LoginResponse(
                accessToken,
                "Bearer",
                employee.getEmployeeId(),
                employee.getEmployeeNo(),
                employee.getName(),
                employee.getEmail(),
                employee.getRoleCode(),
                delegated,
                employee.getDepartment() != null ? employee.getDepartment().getDepartmentId() : null
        );
    }
}
