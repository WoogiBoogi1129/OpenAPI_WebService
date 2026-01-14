/**
 * InputPanel component.
 *
 * Props:
 * - title: string (panel title)
 * - region: string (default region value)
 * - distance: number|string (default distance in km)
 * - transport: string (default transport value)
 * - transports: Array<{ value: string, label: string }> (options list)
 * - onSubmit: (values: { region: string, distance: string, transport: string }) => void
 *
 * Example:
 * ```js
 * import { InputPanel } from "./components/InputPanel.js";
 * const panel = InputPanel({
 *   title: "입력",
 *   region: "서울",
 *   distance: 12,
 *   transport: "public",
 *   transports: [
 *     { value: "walking", label: "도보" },
 *     { value: "bike", label: "자전거" },
 *     { value: "public", label: "대중교통" }
 *   ],
 *   onSubmit: (values) => console.log(values),
 * });
 * document.querySelector("#app").append(panel);
 * ```
 */
export function InputPanel({
  title = "에코 모빌리티 입력",
  region = "",
  distance = "",
  transport = "walking",
  transports = [
    { value: "walking", label: "도보" },
    { value: "bike", label: "자전거" },
    { value: "public", label: "대중교통" },
    { value: "car", label: "자가용" },
    { value: "ev", label: "전기차" },
  ],
  onSubmit,
} = {}) {
  // 카드 전체를 감싸는 섹션 요소를 만듭니다.
  const section = document.createElement("section");
  section.className = "card";

  // 카드 제목 영역을 만듭니다.
  const heading = document.createElement("h2");
  heading.className = "card-title";
  heading.textContent = title;
  section.append(heading);

  // 입력 요소들을 묶는 form 태그를 만듭니다.
  const form = document.createElement("form");
  form.className = "form";

  // 지역 입력 라벨과 입력창을 만듭니다.
  const regionLabel = document.createElement("label");
  regionLabel.htmlFor = "region";
  regionLabel.textContent = "지역";

  const regionInput = document.createElement("input");
  regionInput.id = "region";
  regionInput.name = "region";
  regionInput.type = "text";
  regionInput.placeholder = "예: 서울";
  regionInput.value = region;

  // 거리 입력 라벨과 입력창을 만듭니다.
  const distanceLabel = document.createElement("label");
  distanceLabel.htmlFor = "distance";
  distanceLabel.textContent = "거리 (km)";

  const distanceInput = document.createElement("input");
  distanceInput.id = "distance";
  distanceInput.name = "distance";
  distanceInput.type = "number";
  distanceInput.min = "0";
  distanceInput.placeholder = "예: 12";
  distanceInput.value = distance;

  // 이동 수단 선택 라벨과 드롭다운을 만듭니다.
  const transportLabel = document.createElement("label");
  transportLabel.htmlFor = "transport";
  transportLabel.textContent = "이동 수단";

  const transportSelect = document.createElement("select");
  transportSelect.id = "transport";
  transportSelect.name = "transport";
  // 전달받은 이동 수단 목록을 <option>으로 추가합니다.
  transports.forEach((option) => {
    const item = document.createElement("option");
    item.value = option.value;
    item.textContent = option.label;
    if (option.value === transport) {
      item.selected = true;
    }
    transportSelect.append(item);
  });

  // 폼 제출 버튼을 만듭니다.
  const submitButton = document.createElement("button");
  submitButton.type = "submit";
  submitButton.textContent = "결과 보기";

  // 폼 안에 라벨/입력/버튼을 순서대로 배치합니다.
  form.append(
    regionLabel,
    regionInput,
    distanceLabel,
    distanceInput,
    transportLabel,
    transportSelect,
    submitButton
  );

  // 폼 제출 시 페이지 새로고침을 막고 입력값을 전달합니다.
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (typeof onSubmit === "function") {
      // 입력값을 객체로 묶어 콜백으로 전달합니다.
      onSubmit({
        region: regionInput.value,
        distance: distanceInput.value,
        transport: transportSelect.value,
      });
    }
  });

  // 완성된 폼을 카드 안에 넣어 반환합니다.
  section.append(form);
  return section;
}
