package erp.system.leave.dto;

import erp.system.leave.entity.LeaveRequest;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record LeaveRequestResponse(
        Long leaveRequestId,
        Long employeeId,
        String employeeName,
        String employeeNo,
        Long departmentId,
        String departmentName,
        String positionName,
        String email,
        Long leaveTypeId,
        String leaveTypeName,
        LocalDate startDate,
        LocalDate endDate,
        BigDecimal leaveDays,
        String reason,
        String status,
        Long approverId,
        String approverName,
        String rejectionReason,
        LocalDateTime processedAt,
        LocalDateTime createdAt
) {
    public static LeaveRequestResponse from(LeaveRequest leaveRequest) {
        var employee = leaveRequest.getEmployee();
        return new LeaveRequestResponse(
                leaveRequest.getLeaveRequestId(),
                employee.getEmployeeId(),
                employee.getName(),
                employee.getEmployeeNo(),
                employee.getDepartment() != null ? employee.getDepartment().getDepartmentId() : null,
                employee.getDepartment() != null ? employee.getDepartment().getDepartmentName() : null,
                employee.getPosition() != null ? employee.getPosition().getPositionName() : null,
                employee.getEmail(),
                leaveRequest.getLeaveType().getLeaveTypeId(),
                leaveRequest.getLeaveType().getLeaveTypeName(),
                leaveRequest.getStartDate(),
                leaveRequest.getEndDate(),
                leaveRequest.getLeaveDays(),
                leaveRequest.getReason(),
                leaveRequest.getStatus(),
                leaveRequest.getApprover() != null ? leaveRequest.getApprover().getEmployeeId() : null,
                leaveRequest.getApprover() != null ? leaveRequest.getApprover().getName() : null,
                leaveRequest.getRejectionReason(),
                leaveRequest.getProcessedAt(),
                leaveRequest.getCreatedAt()
        );
    }
}
