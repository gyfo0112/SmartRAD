package erp.system.auth.dto;

import erp.system.employee.entity.Employee;

public record KakaoLoginResponse(
        boolean linked,
        String accessToken,
        String tokenType,
        Long employeeId,
        String employeeNo,
        String name,
        String email,
        String role
) {
    public static KakaoLoginResponse linked(String accessToken, Employee employee) {
        return new KakaoLoginResponse(
                true,
                accessToken,
                "Bearer",
                employee.getEmployeeId(),
                employee.getEmployeeNo(),
                employee.getName(),
                employee.getEmail(),
                employee.getRoleCode()
        );
    }

    public static KakaoLoginResponse notLinked() {
        return new KakaoLoginResponse(false, null, null, null, null, null, null, null);
    }
}
