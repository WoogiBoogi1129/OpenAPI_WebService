// 각 UI 컴포넌트를 불러옵니다.
import { InputPanel } from "../components/InputPanel.js";
import { AirQualityCard } from "../components/AirQualityCard.js";
import { CarbonCard } from "../components/CarbonCard.js";
import { TotalScoreCard } from "../components/TotalScoreCard.js";

// 화면을 그릴 최상위 루트 요소를 찾습니다.
const root = document.querySelector("#app");

// 카드들을 배치할 그리드 컨테이너입니다.
const grid = document.createElement("div");
grid.className = "grid";

// 결과 카드들을 세로로 쌓을 컨테이너입니다.
const resultsStack = document.createElement("div");
resultsStack.className = "stack";

// 백엔드 서버의 기본 주소입니다.
const API_BASE_URL = "http://localhost:4000";

// 이동 수단별 탄소 배출 계수(거리 1km당 kg CO₂)입니다.
const transportFactors = {
  walking: 0,
  bike: 0,
  public: 0.05,
  car: 0.21,
  ev: 0.07,
};

// 초기 상태의 대기질 카드입니다.
const airQualityCard = AirQualityCard({
  status: "대기중",
  description: "지역을 입력하고 결과를 확인하세요.",
  indexLabel: "대기질 지수",
});

// 초기 상태의 탄소 배출 카드입니다.
const carbonCard = CarbonCard({
  emission: "-",
  description: "이동 거리와 수단을 입력해 주세요.",
  title: "탄소 배출량",
});

// 초기 상태의 통합 점수 카드입니다.
const totalScoreCard = TotalScoreCard({
  score: "-",
  message: "점수 계산을 위해 입력값이 필요합니다.",
  title: "통합 점수",
});

// 숫자를 보기 좋게 소수점 자리수로 표시하는 함수입니다.
const formatNumber = (value, digits = 1) => {
  if (!Number.isFinite(value)) return null;
  return value.toFixed(digits);
};

// 점수가 0~100 사이를 넘지 않도록 제한합니다.
const clampScore = (value) => Math.max(0, Math.min(100, value));

// 대기질 데이터를 사람이 읽기 쉬운 문구로 바꿉니다.
const buildAirQualitySummary = (payload) => {
  const pm25 = payload?.pm25;
  const unit = "µg/m³";

  // 값이 없으면 안내 문구로 대체합니다.
  if (!Number.isFinite(pm25)) {
    return {
      status: "데이터 없음",
      description: "대기질 정보를 불러오지 못했습니다.",
      score: null,
    };
  }

  // PM2.5 기준으로 상태 문구를 구합니다.
  let status = "좋음";
  if (pm25 > 75) status = "매우 나쁨";
  else if (pm25 > 35) status = "나쁨";
  else if (pm25 > 15) status = "보통";

  // 점수는 100에서 PM2.5 값을 뺀 단순 모델입니다.
  const airScore = clampScore(100 - pm25);
  return {
    status,
    description: `PM2.5 ${pm25} ${unit} 기준`,
    score: airScore,
  };
};

// 이동 거리와 수단을 바탕으로 탄소 배출 추정치를 계산합니다.
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

  // kg CO₂ = 거리(km) * 배출 계수(kg/km)
  const emission = numericDistance * (factor ?? 0.1);
  const emissionLabel = `${formatNumber(emission)} kg CO₂`;
  // 배출량이 높을수록 점수는 낮아지도록 계산합니다.
  const carbonScore = clampScore(100 - emission * 10);
  // 사용자에게 보여줄 이동 수단 이름을 한국어로 바꿉니다.
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

// 대기질 점수와 탄소 점수를 합쳐 최종 점수를 만듭니다.
const buildTotalScoreSummary = (airScore, carbonScore) => {
  if (!Number.isFinite(airScore) || !Number.isFinite(carbonScore)) {
    return {
      scoreLabel: "-",
      message: "통합 점수 계산을 위해 입력값과 대기질 데이터가 필요합니다.",
    };
  }

  // 대기질 60%, 탄소 40% 가중치를 적용합니다.
  const totalScore = Math.round(airScore * 0.6 + carbonScore * 0.4);
  // 점수 구간에 따라 메시지를 바꿉니다.
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

// 입력 폼을 만들어 화면에 붙입니다.
const inputPanel = InputPanel({
  title: "모빌리티 입력",
  region: "서울",
  distance: 12,
  transport: "public",
  // 폼 제출 시 실행되는 함수입니다.
  onSubmit: async (values) => {
    // 공백을 제거해 빈 문자열인지 확인합니다.
    const trimmedRegion = values.region.trim();
    if (!trimmedRegion) {
      // 지역 입력이 없으면 안내 카드로 교체합니다.
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

    // 데이터를 가져오는 동안 로딩 상태를 보여줍니다.
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
      // 백엔드 API로 대기질 데이터를 요청합니다.
      const response = await fetch(
        `${API_BASE_URL}/api/air?region=${encodeURIComponent(trimmedRegion)}`
      );
      const payload = await response.json();
      if (!response.ok) {
        // HTTP 응답이 200대가 아니면 에러 처리합니다.
        throw new Error(payload?.error || "대기질 데이터를 가져오지 못했습니다.");
      }

      const source = payload?.source;
      const isMock = source === "mock";
      const sourceLabel = isMock
        ? "모의 데이터"
        : source === "data.go.kr"
        ? "data.go.kr"
        : "";

      // 각 카드에 들어갈 요약 정보를 계산합니다.
      const airSummary = buildAirQualitySummary(payload.data);
      const airDescription = isMock
        ? `${airSummary.description} (모의 데이터)`
        : airSummary.description;
      const carbonSummary = buildCarbonSummary(values);
      const totalSummary = buildTotalScoreSummary(
        airSummary.score,
        carbonSummary.score
      );

      // 계산된 결과로 카드 내용을 교체합니다.
      resultsStack.replaceChildren(
        AirQualityCard({
          status: airSummary.status,
          description: airDescription,
          indexLabel: "대기질 지수",
          sourceLabel,
          isMock,
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
      // 에러가 발생하면 사용자에게 오류 상태를 보여줍니다.
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

// 초기 카드들을 결과 영역에 붙입니다.
resultsStack.append(airQualityCard, carbonCard, totalScoreCard);
// 입력 영역과 결과 영역을 그리드에 배치합니다.
grid.append(inputPanel, resultsStack);
// 최종적으로 화면에 렌더링합니다.
root.append(grid);
