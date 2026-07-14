package erp.system.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "이메일 또는 사번은 필수입니다.") String email,
        @NotBlank(message = "비밀번호는 필수입니다.") String password
) {
}
