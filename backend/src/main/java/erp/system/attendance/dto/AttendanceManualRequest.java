package erp.system.attendance.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public record AttendanceManualRequest(
        @NotNull(message = "직원은 필수입니다.") Long employeeId,
        @NotNull(message = "근태일은 필수입니다.") LocalDate workDate,
        @NotNull(message = "근태 상태는 필수입니다.") String attendanceStatusCode,
        LocalTime checkInTime,
        LocalTime checkOutTime
) {
}
