/**
 * TotalScoreCard component.
 *
 * Props:
 * - score: number|string (ex: 82)
 * - message: string (supporting message)
 * - title: string (card title)
 *
 * Example:
 * ```js
 * import { TotalScoreCard } from "./components/TotalScoreCard.js";
 * const card = TotalScoreCard({
 *   score: 82,
 *   message: "친환경 이동이 우수합니다!",
 *   title: "통합 점수",
 * });
 * document.querySelector("#app").append(card);
 * ```
 */
export function TotalScoreCard({
  score = 0,
  message = "점수 계산 전입니다.",
  title = "통합 점수",
} = {}) {
  const section = document.createElement("section");
  section.className = "card highlight";

  const heading = document.createElement("h2");
  heading.className = "card-title";
  heading.textContent = title;

  const value = document.createElement("div");
  value.className = "score";
  value.textContent = `${score}점`;

  const hint = document.createElement("p");
  hint.className = "hint";
  hint.textContent = message;

  section.append(heading, value, hint);
  return section;
}
