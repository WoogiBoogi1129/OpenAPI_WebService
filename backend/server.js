const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const cacheTtlMs = Number(process.env.AIR_CACHE_TTL_MS) || 300000;
const airCache = new Map();

app.use(cors());

app.get('/api/air', async (req, res) => {
  const region = req.query.region;
  if (!region) {
    return res.status(400).json({ error: 'region query parameter is required' });
  }

  const apiKey = process.env.AIR_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'AIR_API_KEY is not configured' });
  }

  const cached = airCache.get(region);
  if (cached && cached.expiresAt > Date.now()) {
    return res.json({
      region,
      source: 'openaq',
      cached: true,
      cachedAt: cached.cachedAt,
      data: cached.data
    });
  }

  try {
    const response = await axios.get('https://api.openaq.org/v2/latest', {
      params: {
        city: region,
        limit: 1
      },
      headers: {
        'X-API-Key': apiKey
      }
    });

    const payload = {
      region,
      source: 'openaq',
      cached: false,
      data: response.data
    };

    airCache.set(region, {
      cachedAt: new Date().toISOString(),
      expiresAt: Date.now() + cacheTtlMs,
      data: response.data
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
