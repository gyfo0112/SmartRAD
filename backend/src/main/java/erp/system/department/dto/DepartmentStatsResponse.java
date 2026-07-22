package erp.system.department.dto;

import java.math.BigDecimal;

public record DepartmentStatsResponse(
        Long departmentId,
        long employeeCount,
        Double averageTenureYears,
        BigDecimal monthlyPayrollTotal,
        BigDecimal monthlyPayrollAverage,
        Double attendanceIssueRate
) {
}
