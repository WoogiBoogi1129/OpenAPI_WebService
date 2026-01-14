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
  const section = document.createElement("section");
  section.className = "card";

  const heading = document.createElement("h2");
  heading.className = "card-title";
  heading.textContent = title;

  const value = document.createElement("div");
  value.className = "score";
  value.textContent = emission;

  const hint = document.createElement("p");
  hint.className = "hint";
  hint.textContent = description;

  section.append(heading, value, hint);
  return section;
}
