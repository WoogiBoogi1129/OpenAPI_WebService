# OpenAPI WebService

대기질 API 프록시와 이동 방식 기반 점수 UI를 제공하는 기본 구조입니다.

## 1. 프로젝트 개요

### 보고서 주제 요약

공공 대기질 API와 사용자 이동 입력(거리, 이동수단)을 결합해 친환경 이동 수준을 시각화하는 웹 서비스의 최소 기능 버전(Lite MVP)입니다.

### 시스템 범위 (Lite MVP)

- 공공 대기질 API 프록시(`/api/air`) 제공
- 이동 입력 UI와 결과 카드 UI(대기질/탄소배출/통합점수) 표시
- 통합 지표 산출식과 가중치 시나리오를 문서로 정의 (UI 연동은 추후 확장)

## 프로젝트 구조

```
backend/   # Express 기반 API 프록시
frontend/  # 정적 HTML UI
```

## 2. 실행 방법

### 1) 환경변수 설정

프로젝트 루트에서 `.env.example`을 복사해 `.env` 파일을 만든 뒤 API 키를 입력합니다.

```bash
cp .env.example .env
```

`.env` 예시:

```
AIR_API_KEY=your_api_key_here
PORT=4000
AIR_CACHE_TTL_MS=300000
```

### 2) 백엔드 실행 (Express)

```bash
cd backend
npm install
npm start
```

- 기본 포트는 `4000`입니다.
- `/api/air?region=서울` 형태로 요청하면 외부 대기질 API를 프록시합니다.

### 3) 프론트엔드 실행 (정적 HTML)

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

## 3. 데이터 흐름 요약

```
사용자 입력(UI) → /api/air 요청 → 공공 API 호출(OpenAQ)
                              ↘ 캐싱(메모리 TTL)
응답 정규화(JSON) → 프론트 카드 렌더링(대기질/탄소/통합점수)
```

- 백엔드는 동일 지역 요청에 대해 메모리 캐시를 사용해 외부 호출을 줄입니다.
- 프론트는 응답 JSON을 받아 카드 컴포넌트에 렌더링합니다.

## 4. 통합지표 계산식 및 가중치 민감도

### 4-1) 통합지표 산출식 (기본안)

통합 점수는 대기질 점수와 탄소배출 점수를 0~100 범위로 정규화한 뒤 가중 합산합니다.

```
통합점수 = (w_air × AQ_score) + (w_carbon × Carbon_score)
```

기본 가중치:

- `w_air = 0.6`
- `w_carbon = 0.4` (w_air + w_carbon = 1)

> AQ_score, Carbon_score는 정책 기준에 맞춰 선형/구간형 정규화를 적용하는 것을 전제로 합니다.

### 4-2) 가중치 민감도 실험 (설명)

가중치 변화에 따른 통합 점수 변동을 비교해 정책 목적에 맞는 가중치를 선택합니다.

- **시나리오 A (대기질 우선)**: w_air 0.7 / w_carbon 0.3
- **시나리오 B (균형)**: w_air 0.5 / w_carbon 0.5
- **시나리오 C (탄소 우선)**: w_air 0.4 / w_carbon 0.6

예: 동일 입력에서 AQ_score가 높고 Carbon_score가 낮다면,
대기질 우선 시나리오에서 통합 점수가 상대적으로 높게 산출됩니다.
