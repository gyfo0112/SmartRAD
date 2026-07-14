package erp.system.auth.dto;

import erp.system.employee.entity.Employee;

public record LoginResponse(
        String accessToken,
        String tokenType,
        Long employeeId,
        String employeeNo,
        String name
) {
    public static LoginResponse of(String accessToken, Employee employee) {
        return new LoginResponse(
                accessToken,
                "Bearer",
                employee.getEmployeeId(),
                employee.getEmployeeNo(),
                employee.getName()
        );
    }
}
