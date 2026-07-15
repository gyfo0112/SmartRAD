package erp.system.employee.dto;

import erp.system.employee.entity.Employee;

import java.time.LocalDate;

public record EmployeeSummaryResponse (
        Long employeeId,
        String employeeNo,
        String name,
        String departmentName,
        String positionName,
        String employeeStatusCode,
        String email,
        LocalDate hireDate,
        LocalDate resignationDate
){

    public static EmployeeSummaryResponse from(Employee employee) {
        return new EmployeeSummaryResponse(
                employee.getEmployeeId(),
                employee.getEmployeeNo(),
                employee.getName(),
                employee.getDepartment() != null ? employee.getDepartment().getDepartmentName() : null,
                employee.getPosition() != null ? employee.getPosition().getPositionName() : null,
                employee.getEmployeeStatusCode(),
                employee.getEmail(),
                employee.getHireDate(),
                employee.getResignationDate()
        );
    }
}
