package erp.system.auth.service;

import erp.system.auth.dto.LoginRequest;
import erp.system.auth.dto.LoginResponse;
import erp.system.auth.jwt.JwtTokenProvider;
import erp.system.common.exception.BusinessException;
import erp.system.common.exception.ErrorCode;
import erp.system.employee.entity.Employee;
import erp.system.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public LoginResponse login(LoginRequest request) {
        Employee employee = employeeRepository.findByEmployeeNoOrEmail(request.email(), request.email())
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_CREDENTIALS));

        if (!passwordEncoder.matches(request.password(), employee.getPassword())) {
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS);
        }

        if (!employee.isLoginable()) {
            throw new BusinessException(ErrorCode.ACCOUNT_INACTIVE);
        }

        String accessToken = jwtTokenProvider.createToken(employee.getEmployeeId(), employee.getEmployeeNo());
        return LoginResponse.of(accessToken, employee);
    }
}
