import { InputPanel } from "../components/InputPanel.js";
import { AirQualityCard } from "../components/AirQualityCard.js";
import { CarbonCard } from "../components/CarbonCard.js";
import { TotalScoreCard } from "../components/TotalScoreCard.js";

const root = document.querySelector("#app");

const grid = document.createElement("div");
grid.className = "grid";

const resultsStack = document.createElement("div");
resultsStack.className = "stack";

const API_BASE_URL = "http://localhost:4000";

const transportFactors = {
  walking: 0,
  bike: 0,
  public: 0.05,
  car: 0.21,
  ev: 0.07,
};

const airQualityCard = AirQualityCard({
  status: "대기중",
  description: "지역을 입력하고 결과를 확인하세요.",
  indexLabel: "대기질 지수",
});

const carbonCard = CarbonCard({
  emission: "-",
  description: "이동 거리와 수단을 입력해 주세요.",
  title: "탄소 배출량",
});

const totalScoreCard = TotalScoreCard({
  score: "-",
  message: "점수 계산을 위해 입력값이 필요합니다.",
  title: "통합 점수",
});

const formatNumber = (value, digits = 1) => {
  if (!Number.isFinite(value)) return null;
  return value.toFixed(digits);
};

const clampScore = (value) => Math.max(0, Math.min(100, value));

const buildAirQualitySummary = (payload) => {
  const pm25 = payload?.pm25;
  const unit = "µg/m³";

  if (!Number.isFinite(pm25)) {
    return {
      status: "데이터 없음",
      description: "대기질 정보를 불러오지 못했습니다.",
      score: null,
    };
  }

  let status = "좋음";
  if (pm25 > 75) status = "매우 나쁨";
  else if (pm25 > 35) status = "나쁨";
  else if (pm25 > 15) status = "보통";

  const airScore = clampScore(100 - pm25);
  return {
    status,
    description: `PM2.5 ${pm25} ${unit} 기준`,
    score: airScore,
  };
};

const buildCarbonSummary = ({ distance, transport }) => {
  const numericDistance = Number(distance);
  const factor = transportFactors[transport];
  if (!Number.isFinite(numericDistance) || numericDistance <= 0) {
    return {
      emissionLabel: "-",
      description: "이동 거리를 입력하면 배출량을 계산합니다.",
      score: null,
    };
  }

  const emission = numericDistance * (factor ?? 0.1);
  const emissionLabel = `${formatNumber(emission)} kg CO₂`;
  const carbonScore = clampScore(100 - emission * 10);
  const transportLabel =
    transport === "walking"
      ? "도보"
      : transport === "bike"
      ? "자전거"
      : transport === "public"
      ? "대중교통"
      : transport === "car"
      ? "자가용"
      : "전기차";

  return {
    emissionLabel,
    description: `${transportLabel} 기준 추정치입니다.`,
    score: carbonScore,
  };
};

const buildTotalScoreSummary = (airScore, carbonScore) => {
  if (!Number.isFinite(airScore) || !Number.isFinite(carbonScore)) {
    return {
      scoreLabel: "-",
      message: "통합 점수 계산을 위해 입력값과 대기질 데이터가 필요합니다.",
    };
  }

  const totalScore = Math.round(airScore * 0.6 + carbonScore * 0.4);
  const message =
    totalScore >= 85
      ? "친환경 이동 점수가 매우 높습니다."
      : totalScore >= 70
      ? "친환경 이동 점수가 높습니다."
      : totalScore >= 50
      ? "친환경 이동 점수가 보통입니다."
      : "친환경 이동 점수가 낮습니다.";

  return {
    scoreLabel: totalScore,
    message,
  };
};

const inputPanel = InputPanel({
  title: "모빌리티 입력",
  region: "서울",
  distance: 12,
  transport: "public",
  onSubmit: async (values) => {
    const trimmedRegion = values.region.trim();
    if (!trimmedRegion) {
      resultsStack.replaceChildren(
        AirQualityCard({
          status: "입력 필요",
          description: "지역명을 입력해 주세요.",
          indexLabel: "대기질 지수",
        }),
        CarbonCard({
          emission: "-",
          description: "이동 거리와 수단을 입력해 주세요.",
          title: "탄소 배출량",
        }),
        TotalScoreCard({
          score: "-",
          message: "지역 입력이 필요합니다.",
          title: "통합 점수",
        })
      );
      return;
    }

    resultsStack.replaceChildren(
      AirQualityCard({
        status: "조회 중",
        description: `${trimmedRegion} 대기질 데이터를 불러오는 중입니다.`,
        indexLabel: "대기질 지수",
      }),
      CarbonCard({
        emission: "-",
        description: "대기질 정보를 기다리는 중입니다.",
        title: "탄소 배출량",
      }),
      TotalScoreCard({
        score: "-",
        message: "통합 점수를 계산하는 중입니다.",
        title: "통합 점수",
      })
    );

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/air?region=${encodeURIComponent(trimmedRegion)}`
      );
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "대기질 데이터를 가져오지 못했습니다.");
      }

      const airSummary = buildAirQualitySummary(payload.data);
      const carbonSummary = buildCarbonSummary(values);
      const totalSummary = buildTotalScoreSummary(
        airSummary.score,
        carbonSummary.score
      );

      resultsStack.replaceChildren(
        AirQualityCard({
          status: airSummary.status,
          description: airSummary.description,
          indexLabel: "대기질 지수",
        }),
        CarbonCard({
          emission: carbonSummary.emissionLabel,
          description: carbonSummary.description,
          title: "탄소 배출량",
        }),
        TotalScoreCard({
          score: totalSummary.scoreLabel,
          message: totalSummary.message,
          title: "통합 점수",
        })
      );
    } catch (error) {
      resultsStack.replaceChildren(
        AirQualityCard({
          status: "오류",
          description: error.message,
          indexLabel: "대기질 지수",
        }),
        CarbonCard({
          emission: "-",
          description: "대기질 데이터를 불러오지 못했습니다.",
          title: "탄소 배출량",
        }),
        TotalScoreCard({
          score: "-",
          message: "통합 점수를 계산할 수 없습니다.",
          title: "통합 점수",
        })
      );
    }
  },
});

resultsStack.append(airQualityCard, carbonCard, totalScoreCard);
grid.append(inputPanel, resultsStack);
root.append(grid);
