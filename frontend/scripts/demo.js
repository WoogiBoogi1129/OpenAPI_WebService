// 데모 페이지에서도 동일한 컴포넌트를 사용합니다.
import { InputPanel } from "../components/InputPanel.js";
import { AirQualityCard } from "../components/AirQualityCard.js";
import { CarbonCard } from "../components/CarbonCard.js";
import { TotalScoreCard } from "../components/TotalScoreCard.js";

// 데모 화면을 그릴 루트 요소입니다.
const root = document.querySelector("#demo-root");

// 컴포넌트를 배치할 그리드 컨테이너입니다.
const grid = document.createElement("div");
grid.className = "grid";

// 결과 카드들을 세로로 쌓는 컨테이너입니다.
const resultsStack = document.createElement("div");
resultsStack.className = "stack";

// 데모에서 사용할 고정 데이터입니다.
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

// 입력 패널 컴포넌트를 만듭니다.
const inputPanel = InputPanel({
  title: "데모 입력",
  region: demoData.region,
  distance: demoData.distance,
  transport: demoData.transport,
  // 데모에서는 실제 계산 대신 콘솔에만 출력합니다.
  onSubmit: (values) => {
    console.log("데모 입력", values);
  },
});

// 데모용 대기질 카드입니다.
const airQualityCard = AirQualityCard({
  status: demoData.airQuality.status,
  description: demoData.airQuality.description,
  indexLabel: "대기질 지수",
});

// 데모용 탄소 배출 카드입니다.
const carbonCard = CarbonCard({
  emission: demoData.carbon.emission,
  description: demoData.carbon.description,
  title: "탄소 배출량",
});

// 데모용 통합 점수 카드입니다.
const totalScoreCard = TotalScoreCard({
  score: demoData.totalScore.score,
  message: demoData.totalScore.message,
  title: "통합 점수",
});

// 결과 카드들을 쌓고, 입력과 결과를 한 그리드에 배치합니다.
resultsStack.append(airQualityCard, carbonCard, totalScoreCard);
grid.append(inputPanel, resultsStack);
// 최종적으로 화면에 붙입니다.
root.append(grid);
