package erp.system.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record KakaoLinkRequest(
        @NotBlank(message = "카카오 액세스 토큰은 필수입니다.") String kakaoAccessToken,
        @NotBlank(message = "사번은 필수입니다.") String employeeNo
) {
}
