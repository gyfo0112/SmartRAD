package erp.system.auth.kakao;

import erp.system.common.exception.BusinessException;
import erp.system.common.exception.ErrorCode;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Component
public class KakaoApiClient {

    private final RestClient restClient = RestClient.create("https://kapi.kakao.com");

    public KakaoUserInfo getUserInfo(String kakaoAccessToken) {
        try {
            KakaoUserInfo userInfo = restClient.get()
                    .uri("/v2/user/me")
                    .header("Authorization", "Bearer " + kakaoAccessToken)
                    .retrieve()
                    .body(KakaoUserInfo.class);

            if (userInfo == null || userInfo.id() == null) {
                throw new BusinessException(ErrorCode.KAKAO_AUTH_FAILED);
            }
            return userInfo;
        } catch (RestClientException e) {
            throw new BusinessException(ErrorCode.KAKAO_AUTH_FAILED);
        }
    }
}
