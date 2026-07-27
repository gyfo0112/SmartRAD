package erp.system.notice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record NoticeUpdateRequest(
        @NotBlank(message = "제목은 필수입니다.") @Size(max = 200) String title,
        @NotBlank(message = "내용은 필수입니다.") String content,
        boolean pinned,
        Long departmentId
) {
}
