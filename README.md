# OpenAPI WebService

대기질 API 프록시와 이동 방식 기반 점수 UI를 제공하는 기본 구조입니다.

## 프로젝트 구조

```
backend/   # Express 기반 API 프록시
frontend/  # 정적 HTML UI
```

## 로컬 실행 가이드

### 1) 환경변수 설정

프로젝트 루트에서 `.env.example`을 복사해 `.env` 파일을 만든 뒤 API 키를 입력합니다.

```bash
cp .env.example .env
```

`.env` 예시:

```
AIR_API_KEY=your_api_key_here
PORT=4000
```

### 2) 백엔드 실행

```bash
cd backend
npm install
npm start
```

- 기본 포트는 `4000`입니다.
- `/api/air?region=서울` 형태로 요청하면 외부 대기질 API를 프록시합니다.

### 3) 프론트엔드 실행

정적 파일이므로 간단한 HTTP 서버로 확인할 수 있습니다.

```bash
cd frontend
python -m http.server 5173
```

브라우저에서 `http://localhost:5173`에 접속합니다.

## API 엔드포인트

- `GET /api/air?region=...`
  - `region` 쿼리값을 기반으로 외부 대기질 데이터를 요청합니다.
  - API 키는 `AIR_API_KEY` 환경변수를 사용합니다.
