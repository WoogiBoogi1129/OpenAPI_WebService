/**
 * CarbonCard component.
 *
 * Props:
 * - emission: string (ex: "2.4 kg CO₂")
 * - description: string (context line under the emission)
 * - title: string (card title)
 *
 * Example:
 * ```js
 * import { CarbonCard } from "./components/CarbonCard.js";
 * const card = CarbonCard({
 *   emission: "2.4 kg CO₂",
 *   description: "대중교통 기준",
 *   title: "탄소 배출량",
 * });
 * document.querySelector("#app").append(card);
 * ```
 */
export function CarbonCard({
  emission = "0.0 kg CO₂",
  description = "기본 배출량 추정치입니다.",
  title = "탄소 배출량",
} = {}) {
  // 카드 전체 영역을 만듭니다.
  const section = document.createElement("section");
  section.className = "card";

  // 카드 제목을 표시합니다.
  const heading = document.createElement("h2");
  heading.className = "card-title";
  heading.textContent = title;

  // 탄소 배출량 숫자를 보여줄 영역입니다.
  const value = document.createElement("div");
  value.className = "score";
  value.textContent = emission;

  // 배출량 계산 기준 등 설명 문구입니다.
  const hint = document.createElement("p");
  hint.className = "hint";
  hint.textContent = description;

  // 요소들을 카드에 붙입니다.
  section.append(heading, value, hint);
  return section;
}
