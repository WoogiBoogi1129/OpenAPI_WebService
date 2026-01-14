const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const cacheTtlMs = Number(process.env.AIR_CACHE_TTL_MS) || 300000;
const airApiBaseUrl =
  process.env.AIR_API_BASE_URL ||
  'https://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getCtprvnRltmMesureDnsty';
const airCache = new Map();

app.use(cors());

const buildMockAirQuality = (region) => {
  const seed = [...region].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const base = (seed % 20) + 10;
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

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

app.get('/api/air', async (req, res) => {
  const region = req.query.region;
  if (!region) {
    return res.status(400).json({ error: 'region query parameter is required' });
  }

  const apiKey = process.env.AIR_API_KEY;
  if (!apiKey) {
    return res.json({
      region,
      source: 'mock',
      cached: false,
      data: buildMockAirQuality(region)
    });
  }

  const cached = airCache.get(region);
  if (cached && cached.expiresAt > Date.now()) {
    return res.json({
      region,
      source: 'data.go.kr',
      cached: true,
      cachedAt: cached.cachedAt,
      data: cached.data
    });
  }

  try {
    const response = await axios.get(airApiBaseUrl, {
      params: {
        serviceKey: apiKey,
        returnType: 'json',
        numOfRows: 1,
        pageNo: 1,
        sidoName: region,
        ver: '1.0'
      }
    });

    const result = response.data?.response?.header;
    if (result?.resultCode && result.resultCode !== '00') {
      return res.status(502).json({
        error: result.resultMsg || 'Failed to fetch air quality data'
      });
    }

    const item = response.data?.response?.body?.items?.[0];
    if (!item) {
      return res.status(404).json({ error: 'No air quality data found' });
    }

    const parseValue = (value) => {
      const numeric = Number(value);
      return Number.isFinite(numeric) ? numeric : null;
    };

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

    const payload = {
      region,
      source: 'data.go.kr',
      cached: false,
      data: normalized
    };

    airCache.set(region, {
      cachedAt: new Date().toISOString(),
      expiresAt: Date.now() + cacheTtlMs,
      data: normalized
    });

    return res.json(payload);
  } catch (error) {
    const status = error.response?.status || 500;
    const message = error.response?.data || 'Failed to fetch air quality data';
    return res.status(status).json({ error: message });
  }
});

app.listen(port, () => {
  console.log(`Backend server listening on http://localhost:${port}`);
});
