import { InputPanel } from "../components/InputPanel.js";
import { AirQualityCard } from "../components/AirQualityCard.js";
import { CarbonCard } from "../components/CarbonCard.js";
import { TotalScoreCard } from "../components/TotalScoreCard.js";

const root = document.querySelector("#demo-root");

const grid = document.createElement("div");
grid.className = "grid";

const resultsStack = document.createElement("div");
resultsStack.className = "stack";

const demoData = {
  region: "부산",
  distance: 18,
  transport: "bike",
  airQuality: {
    status: "보통",
    description: "해안 지역 미세먼지 기준",
  },
  carbon: {
    emission: "0.6 kg CO₂",
    description: "자전거 기준 추정치",
  },
  totalScore: {
    score: 92,
    message: "친환경 이동 점수가 매우 우수합니다.",
  },
};

const inputPanel = InputPanel({
  title: "데모 입력",
  region: demoData.region,
  distance: demoData.distance,
  transport: demoData.transport,
  onSubmit: (values) => {
    console.log("데모 입력", values);
  },
});

const airQualityCard = AirQualityCard({
  status: demoData.airQuality.status,
  description: demoData.airQuality.description,
  indexLabel: "대기질 지수",
});

const carbonCard = CarbonCard({
  emission: demoData.carbon.emission,
  description: demoData.carbon.description,
  title: "탄소 배출량",
});

const totalScoreCard = TotalScoreCard({
  score: demoData.totalScore.score,
  message: demoData.totalScore.message,
  title: "통합 점수",
});

resultsStack.append(airQualityCard, carbonCard, totalScoreCard);
grid.append(inputPanel, resultsStack);
root.append(grid);
