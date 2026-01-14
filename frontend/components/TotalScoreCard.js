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
  // 강조 표시가 들어간 카드 영역을 만듭니다.
  const section = document.createElement("section");
  section.className = "card highlight";

  // 카드 제목을 표시합니다.
  const heading = document.createElement("h2");
  heading.className = "card-title";
  heading.textContent = title;

  // 점수 숫자를 크게 보여주는 영역입니다.
  const value = document.createElement("div");
  value.className = "score";
  value.textContent = `${score}점`;

  // 점수에 대한 설명 또는 메시지를 보여줍니다.
  const hint = document.createElement("p");
  hint.className = "hint";
  hint.textContent = message;

  // 요소들을 카드에 붙입니다.
  section.append(heading, value, hint);
  return section;
}
