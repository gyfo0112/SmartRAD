package erp.system.department.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DepartmentUpdateRequest(
        @NotBlank(message = "부서명은 필수입니다.")
        @Size(max = 100, message = "부서명은 100자를 초과할 수 없습니다.")
        String departmentName,

        Long parentDepartmentId,
        
        Long departmentHeadId
) {
}
