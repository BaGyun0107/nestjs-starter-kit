# codi-gtn-back

## nestjs의 실행 순서

1. 미들웨어
2. 가드
3. 인터셉터 (요청 시작)
4. 파이프
5. 컨트롤러/리졸버
6. 인터셉터 (응답 처리)
7. 예외 필터 (예외 발생 시)

## 명령어

- `npm start`: `localhost` 개발환경 시작
- `npm run lint`: `eslint` 적용
- `npm run prisma`: `prisma` 를 활용한 데이터베이스 연결

- `nest g module features/[feauture-name]`: [feauture-name] 디렉토리 및 module 생성
- `nest g co features/[feauture-name]/controller/[name] --flat --no-spec` : [name] controller 생성 `--no-spec` 은 Opt
- `nest g s features/[feauture-name]/service/[name] --flat --no-spec` : [name] service 생성 `--no-spec` 은 Opt

## 개발환경

- `node.js v24.12.0`
- `nest.js v11.1.11`
- `typescript v5.9.3`

## 개발 컨벤션

- `npm run prisma` 명령어를 통해 `prisma` ORM 을 사용하기 위한 파일 생성 및 데이터베이스를 연결한다.
  - 가능한 데이터베이스에서 테이블 및 컬럼 생성 후, 테이블 및 컬럼을 가져오는 방식을 활용한다.
- 파일, 디렉토리 명은 소문자 명사와 하이픈을 사용한다. (ex. `popup-manage/`, `admin-auth.middleware.ts`)
- 변수 및 함수 명은 카멜 케이스를 사용한다. (ex. `adminAuthMiddleware`, `adminAuthMiddlewareSpec`)

## 깃허브 컨벤션

- **타입(Type)**: 커밋의 목적을 명시합니다.
- **옵션 범위(Scope)**: (선택사항) 변경이 영향을 주는 영역을 괄호 안에 명시합니다. 예: `(api)`, `(ui)`
- **설명(Description)**: 변경 사항에 대한 간단한 설명을 작성합니다.

### 커밋 타입

- **feat**: 새로운 기능 추가
- **fix**: 버그 수정
- **docs**: 문서 관련 변경
- **style**: 코드 포맷, 공백, 세미콜론 누락 등 코드의 동작에는 영향 없는 수정
- **refactor**: 코드 리팩토링 (기능 추가나 버그 수정 없이 구조 개선)
- **perf**: 성능 개선
- **test**: 테스트 코드 추가 또는 수정
- **build**: 빌드 관련 파일 수정 (예: 빌드 스크립트, 의존성 변경)
- **ci**: CI 설정 파일 수정
- **chore**: 기타 사소한 변경사항 (예: 코드 생성 도구 업데이트)
- **revert**: 이전 커밋을 되돌릴 때 사용

### 커밋 메시지 작성 시 권장사항

- **짧고 명확하게 작성**: 헤더는 50자 이내로 간결하게 작성하고, 본문에는 상세한 설명을 추가합니다.
- **일관된 문체 사용**: 현재 시제를 사용하며, 팀 내에서 한글 또는 영어 중 일관된 언어를 선택하여 사용합니다.
- **단일 책임 원칙**: 한 커밋에는 하나의 변경 사항만 포함시켜 추적과 롤백이 용이하도록 합니다.
- **관련 이슈 링크**: 변경과 관련된 이슈 번호를 포함시켜, 추적성을 높입니다.
- **커밋 메시지 검토**: 코드 리뷰 과정에서 커밋 메시지의 명확성과 일관성을 함께 검토합니다.

### 커밋 메시지 구성

#### 1. 헤더 (Header)

커밋 메시지의 첫 줄은 헤더로, 타입과 간단한 설명을 포함합니다.  
예시: feat(api): 새로운 엔드포인트 추가

#### 2. 본문 (Body)

필요한 경우, 본문에 변경의 이유나 세부 사항을 설명합니다.

- 변경의 배경, 문제 해결 방법, 주의사항 등을 작성합니다.
- 여러 줄로 상세히 설명할 수 있습니다.

#### 3. 바닥글 (Footer)

특정 이슈 트래커와 연계하거나 Breaking Change 등 메타 정보를 제공할 때 사용합니다.

- 예시: `Closes #123` 또는 `BREAKING CHANGE: API 변경으로 인한 호환성 문제 발생`

### 예제

```markdown
feat(auth): 사용자 로그인 기능 추가

사용자가 이메일과 비밀번호로 로그인할 수 있도록 기능을 추가하였습니다.
이 변경은 보안 강화를 위한 첫 단계입니다.

Closes #42
```

## 폴더 구조

### src/ (소스 코드)

#### features/ (기능별 모듈)

- **log/**: 로깅 시스템
  - `service/`: 커스텀 로거 서비스 (구조화된 로깅, 레벨별 로그 관리)

#### common/ (공통 컴포넌트)

- **decorators/**: 커스텀 데코레이터 (배열 타입, 옵셔널 DTO, 불린 파싱, 필수 DTO, 문자열 패턴)
- **filters/**: 전역 예외 처리 필터 (HTTP 예외 처리)
- **guards/**: 인증 및 인가 가드 (토큰 검증, 권한 확인)
- **interceptors/**: 요청/응답 인터셉터 (로깅 인터셉터)
- **utils/**: 공통 유틸리티 함수 (Axios, Bcrypt, 날짜, IP 추출, 비밀번호, 토큰 검증)
- **types/**: TypeScript 타입 정의 (Express 확장)

#### config/ (설정)

- `configuration.ts`: 환경별 설정 관리 (데이터베이스, CORS, 로깅 등)

#### database/ (데이터베이스)

- `prisma.service.ts`: Prisma 클라이언트 서비스 (연결 생명주기 관리)
- `prisma.module.ts`: Prisma 모듈 정의

#### scripts/ (스크립트)

- `loadPrismaEnv.ts`: Prisma 환경변수 로드 및 DATABASE_URL 생성

### prisma/ (데이터베이스 스키마)

- `schema.prisma`: Prisma 스키마 정의 (MySQL 데이터베이스)

### 설정 파일들

- `.env.*`: 환경별 환경변수 파일 (local, development, production)
- `nest-cli.json`: NestJS CLI 설정
- `eslint.config.js`: ESLint 린팅 규칙
- `.prettierrc`: Prettier 코드 포맷팅 규칙
- `tsconfig.json`: TypeScript 컴파일러 설정
- `ecosystem.config.js`: PM2 프로세스 관리 설정
- `Jenkinsfile`: CI/CD 파이프라인 설정
