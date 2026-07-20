package erp.system.auth.controller;

import erp.system.auth.dto.KakaoLinkRequest;
import erp.system.auth.dto.KakaoLoginRequest;
import erp.system.auth.dto.KakaoLoginResponse;
import erp.system.auth.dto.LoginRequest;
import erp.system.auth.dto.LoginResponse;
import erp.system.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/kakao")
    public KakaoLoginResponse kakaoLogin(@Valid @RequestBody KakaoLoginRequest request) {
        return authService.kakaoLogin(request);
    }

    @PostMapping("/kakao/link")
    public KakaoLoginResponse kakaoLink(@Valid @RequestBody KakaoLinkRequest request) {
        return authService.kakaoLink(request);
    }
}
