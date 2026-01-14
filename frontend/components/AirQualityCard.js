/**
 * AirQualityCard component.
 *
 * Props:
 * - status: string (ex: "좋음")
 * - description: string (context line under the status)
 * - indexLabel: string (label shown in the header)
 * - sourceLabel: string (badge label for data source)
 * - isMock: boolean (true when mock data)
 *
 * Example:
 * ```js
 * import { AirQualityCard } from "./components/AirQualityCard.js";
 * const card = AirQualityCard({
 *   status: "좋음",
 *   description: "PM2.5 기준",
 *   indexLabel: "대기질 지수",
 * });
 * document.querySelector("#app").append(card);
 * ```
 */
export function AirQualityCard({
  status = "좋음",
  description = "현재 대기질이 안정적입니다.",
  indexLabel = "대기질 지수",
  sourceLabel = "",
  isMock = false,
} = {}) {
  // 카드 영역을 감싸는 섹션을 만듭니다.
  const section = document.createElement("section");
  section.className = "card";

  // 카드 상단 헤더 영역을 만듭니다.
  const header = document.createElement("div");
  header.className = "card-header";

  // 카드 상단에 표시될 제목을 만듭니다.
  const title = document.createElement("h2");
  title.className = "card-title";
  title.textContent = indexLabel;

  if (sourceLabel) {
    const badge = document.createElement("span");
    badge.className = isMock ? "source-badge mock" : "source-badge live";
    badge.textContent = sourceLabel;
    header.append(title, badge);
  } else {
    header.append(title);
  }

  // 대기질 상태(좋음/나쁨 등)를 보여주는 강조 텍스트입니다.
  const value = document.createElement("div");
  value.className = "score";
  value.textContent = status;

  // 보조 설명 문구를 넣는 영역입니다.
  const hint = document.createElement("p");
  hint.className = "hint";
  hint.textContent = description;

  // 제목, 값, 설명 순서로 카드에 붙입니다.
  section.append(header, value, hint);
  return section;
}
