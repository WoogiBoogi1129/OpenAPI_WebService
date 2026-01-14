import { InputPanel } from "../components/InputPanel.js";
import { AirQualityCard } from "../components/AirQualityCard.js";
import { CarbonCard } from "../components/CarbonCard.js";
import { TotalScoreCard } from "../components/TotalScoreCard.js";

const root = document.querySelector("#app");

const grid = document.createElement("div");
grid.className = "grid";

const resultsStack = document.createElement("div");
resultsStack.className = "stack";

const airQualityCard = AirQualityCard({
  status: "좋음",
  description: "현재 대기질이 안정적입니다.",
  indexLabel: "대기질 지수",
});

const carbonCard = CarbonCard({
  emission: "2.4 kg CO₂",
  description: "대중교통 기준 추정치입니다.",
  title: "탄소 배출량",
});

const totalScoreCard = TotalScoreCard({
  score: 82,
  message: "친환경 이동 점수가 높습니다.",
  title: "통합 점수",
});

const inputPanel = InputPanel({
  title: "모빌리티 입력",
  region: "서울",
  distance: 12,
  transport: "public",
  onSubmit: (values) => {
    console.log("입력 값", values);
  },
});

resultsStack.append(airQualityCard, carbonCard, totalScoreCard);
grid.append(inputPanel, resultsStack);
root.append(grid);
