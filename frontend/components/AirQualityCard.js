/**
 * AirQualityCard component.
 *
 * Props:
 * - status: string (ex: "좋음")
 * - description: string (context line under the status)
 * - indexLabel: string (label shown in the header)
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
} = {}) {
  const section = document.createElement("section");
  section.className = "card";

  const title = document.createElement("h2");
  title.className = "card-title";
  title.textContent = indexLabel;

  const value = document.createElement("div");
  value.className = "score";
  value.textContent = status;

  const hint = document.createElement("p");
  hint.className = "hint";
  hint.textContent = description;

  section.append(title, value, hint);
  return section;
}
