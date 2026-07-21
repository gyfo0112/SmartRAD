# SmartRAD

인사관리 ERP 시스템 (tp-hr-project-2026)

Spring Boot + Next.js 기반 사내 인사관리 시스템입니다.

## 실행 방법

Docker만 설치되어 있으면 별도 설정 없이 바로 실행됩니다.

```bash
docker compose up -d --build
```

- 프론트엔드: http://localhost:3000
- 백엔드 API: http://localhost:8081
- MySQL: localhost:3307 (컨테이너 간에는 3306)

첫 기동 시 `backend/src/main/resources/data.sql`이 자동으로 실행되어 테스트용 부서/직급/직원 데이터가 채워집니다.

## 테스트 계정

모든 시드 계정의 비밀번호는 `test1234` 입니다.

| 구분 | 이메일 | 비고 |
|---|---|---|
| 관리자 | admin123@test.com | 사번 ADMIN001, role: ADMIN |
| 일반 사원 | user003@example.com | 사번 E2026003 (서지호), role: EMPLOYEE |

그 외 `user004@example.com` ~ `user050@example.com` 형태로 사원 계정이 다수 시드되어 있습니다(전부 동일 비밀번호).

## AI 비서 기능 (선택)

우측 하단 채팅 위젯에서 본인의 연차/급여/근태를 자연어로 물어볼 수 있는 기능입니다. Anthropic API 키가 없으면 자동으로 "AI 비서 기능이 아직 설정되지 않았습니다" 안내만 뜨고 나머지 기능엔 영향이 없습니다.

사용하려면:
1. [console.anthropic.com](https://console.anthropic.com)에서 가입 후 API Keys 메뉴에서 키 발급 (결제수단 등록 필요할 수 있음)
2. 프로젝트 루트에 `.env` 파일 생성 (git에 안 올라감):
   ```
   ANTHROPIC_API_KEY=sk-ant-여기에-발급받은-키
   ```
3. `docker compose up -d --build backend`로 재기동

## 개발 시 참고

- 백엔드 코드를 수정하면 `docker compose build backend && docker compose up -d backend`로 재빌드해야 반영됩니다.
- 프론트엔드도 동일하게 `docker compose build frontend && docker compose up -d frontend`.
- DB 데이터를 완전히 초기화하려면 `docker compose down -v`로 볼륨까지 삭제한 뒤 다시 `up`하면 됩니다.
