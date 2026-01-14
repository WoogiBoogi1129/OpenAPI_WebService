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
  const section = document.createElement("section");
  section.className = "card";

  const heading = document.createElement("h2");
  heading.className = "card-title";
  heading.textContent = title;
  section.append(heading);

  const form = document.createElement("form");
  form.className = "form";

  const regionLabel = document.createElement("label");
  regionLabel.htmlFor = "region";
  regionLabel.textContent = "지역";

  const regionInput = document.createElement("input");
  regionInput.id = "region";
  regionInput.name = "region";
  regionInput.type = "text";
  regionInput.placeholder = "예: 서울";
  regionInput.value = region;

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

  const transportLabel = document.createElement("label");
  transportLabel.htmlFor = "transport";
  transportLabel.textContent = "이동 수단";

  const transportSelect = document.createElement("select");
  transportSelect.id = "transport";
  transportSelect.name = "transport";
  transports.forEach((option) => {
    const item = document.createElement("option");
    item.value = option.value;
    item.textContent = option.label;
    if (option.value === transport) {
      item.selected = true;
    }
    transportSelect.append(item);
  });

  const submitButton = document.createElement("button");
  submitButton.type = "submit";
  submitButton.textContent = "결과 보기";

  form.append(
    regionLabel,
    regionInput,
    distanceLabel,
    distanceInput,
    transportLabel,
    transportSelect,
    submitButton
  );

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (typeof onSubmit === "function") {
      onSubmit({
        region: regionInput.value,
        distance: distanceInput.value,
        transport: transportSelect.value,
      });
    }
  });

  section.append(form);
  return section;
}
