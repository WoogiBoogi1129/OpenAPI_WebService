// Express는 Node.js에서 HTTP 서버를 쉽게 만들기 위한 라이브러리입니다.
const express = require('express');
// Axios는 다른 서버에 HTTP 요청을 보내는 클라이언트 라이브러리입니다.
const axios = require('axios');
// dotenv는 .env 파일에 있는 환경 변수들을 process.env로 불러옵니다.
const dotenv = require('dotenv');
// CORS는 브라우저에서 다른 출처로 요청할 때 발생하는 제한을 풀어줍니다.
const cors = require('cors');

// .env 파일을 읽어서 환경 변수로 등록합니다.
dotenv.config();

// Express 앱(서버)의 핵심 객체를 생성합니다.
const app = express();
// PORT 환경 변수가 없으면 4000번 포트를 사용합니다.
const port = process.env.PORT || 4000;
// 캐시 유지 시간(ms). 기본값은 5분입니다.
const cacheTtlMs = Number(process.env.AIR_CACHE_TTL_MS) || 300000;
// 외부 대기질 API의 기본 URL입니다. 환경 변수가 있으면 그것을 사용합니다.
const airApiBaseUrl =
  process.env.AIR_API_BASE_URL ||
  'https://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getCtprvnRltmMesureDnsty';
// 대기질 API에서 허용하는 시도 이름 목록입니다.
const allowedSidoNames = [
  '서울',
  '부산',
  '대구',
  '인천',
  '광주',
  '대전',
  '울산',
  '경기',
  '강원',
  '충북',
  '충남',
  '전북',
  '전남',
  '경북',
  '경남',
  '제주',
  '세종'
];
// 지역별 응답을 잠시 저장해두는 메모리 캐시(Map)입니다.
const airCache = new Map();

// 모든 요청에 대해 CORS 허용 헤더를 자동으로 붙입니다.
app.use(cors());

// API 키가 없을 때도 화면을 볼 수 있도록 임의(가짜) 대기질 데이터를 만듭니다.
const buildMockAirQuality = (region) => {
  // 문자열을 숫자 시드로 바꿔 지역마다 다른 값을 만들기 위한 계산입니다.
  const seed = [...region].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const base = (seed % 20) + 10;
  // 값이 너무 크거나 작아지지 않도록 범위를 제한하는 함수입니다.
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  // 반환되는 객체는 프론트엔드에서 사용하는 대기질 데이터 형식과 동일합니다.
  return {
    stationName: `${region} 관측소`,
    dataTime: new Date().toISOString(),
    pm10: clamp(base * 2, 10, 120),
    pm25: clamp(base, 5, 80),
    o3: clamp(base / 100, 0.01, 0.2),
    no2: clamp(base / 120, 0.01, 0.15),
    so2: clamp(base / 200, 0.01, 0.1),
    co: clamp(base / 10, 0.1, 1.5)
  };
};

// /api/air?region=서울 처럼 지역 정보를 받아 대기질 데이터를 내려주는 API입니다.
app.get('/api/air', async (req, res) => {
  // 쿼리 문자열에서 region을 꺼냅니다.
  const region = req.query.region;
  if (!region) {
    // region이 없으면 400(Bad Request)을 반환합니다.
    return res.status(400).json({ error: 'region query parameter is required' });
  }
  const trimmedRegion = String(region).trim();
  if (!trimmedRegion) {
    return res.status(400).json({ error: 'region query parameter is required' });
  }
  if (!allowedSidoNames.includes(trimmedRegion)) {
    return res.status(400).json({ error: '지원하지 않는 지역' });
  }

  // 실제 데이터 제공 API를 사용하려면 키가 필요합니다.
  const apiKey = process.env.AIR_API_KEY;
  if (!apiKey) {
    // 키가 없으면 mock 데이터를 사용해 정상 응답처럼 보여줍니다.
    return res.json({
      region: trimmedRegion,
      // source는 "mock" 또는 "data.go.kr" 문자열로 구분합니다.
      source: 'mock',
      cached: false,
      data: buildMockAirQuality(trimmedRegion)
    });
  }

  // 캐시에 값이 있으면 먼저 꺼내 봅니다.
  const cached = airCache.get(trimmedRegion);
  if (cached && cached.expiresAt > Date.now()) {
    // 캐시가 유효하면 API 호출 없이 바로 응답합니다.
    return res.json({
      region: trimmedRegion,
      source: 'data.go.kr',
      cached: true,
      cachedAt: cached.cachedAt,
      data: cached.data
    });
  }

  try {
    // 외부 API로 실제 대기질 데이터를 요청합니다.
    const response = await axios.get(airApiBaseUrl, {
      params: {
        serviceKey: apiKey,
        returnType: 'json',
        numOfRows: 1,
        pageNo: 1,
        sidoName: trimmedRegion,
        ver: '1.0'
      }
    });

    // 응답 구조가 복잡하므로 ?. 연산자로 안전하게 접근합니다.
    const result = response.data?.response?.header;
    if (result?.resultCode && result.resultCode !== '00') {
      // resultCode가 00이 아니면 실패로 판단합니다.
      return res.status(502).json({
        error: result.resultMsg || 'Failed to fetch air quality data'
      });
    }

    // 실제 대기질 값은 body.items 배열 첫 번째에 담겨 있습니다.
    const item = response.data?.response?.body?.items?.[0];
    if (!item) {
      return res.status(404).json({ error: 'No air quality data found' });
    }

    // 문자열로 들어온 숫자를 안전하게 숫자로 변환합니다.
    const parseValue = (value) => {
      const numeric = Number(value);
      return Number.isFinite(numeric) ? numeric : null;
    };

    // 프론트엔드가 이해할 수 있도록 필드 이름을 정리합니다.
    const normalized = {
      stationName: item.stationName,
      dataTime: item.dataTime,
      pm10: parseValue(item.pm10Value),
      pm25: parseValue(item.pm25Value),
      o3: parseValue(item.o3Value),
      no2: parseValue(item.no2Value),
      so2: parseValue(item.so2Value),
      co: parseValue(item.coValue)
    };

    // 응답에 포함될 기본 payload입니다.
    const payload = {
      region: trimmedRegion,
      // source는 "mock" 또는 "data.go.kr" 문자열로 구분합니다.
      source: 'data.go.kr',
      cached: false,
      data: normalized
    };

    // 캐시에 저장해 다음 요청을 더 빠르게 처리합니다.
    airCache.set(trimmedRegion, {
      cachedAt: new Date().toISOString(),
      expiresAt: Date.now() + cacheTtlMs,
      data: normalized
    });

    return res.json(payload);
  } catch (error) {
    // 외부 API 요청 중 에러가 나면 상태 코드와 메시지를 전달합니다.
    const status = error.response?.status || 500;
    const message = error.response?.data || 'Failed to fetch air quality data';
    return res.status(status).json({ error: message });
  }
});

// 지정된 포트에서 서버를 시작합니다.
app.listen(port, () => {
  console.log(`Backend server listening on http://localhost:${port}`);
});
