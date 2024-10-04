import { mergeProps } from "solid-js";

export default function Slider(props: any) {
  const merged = mergeProps({ 
    min: 0,
    max: 100,
    step: 1,
    value: 50, 
    onInput: (e: InputEvent) => { console.log(e); }
  },props);

  return (
    <input
      type="range"
      min={merged.min}
      max={merged.max}
      step={merged.step}
      value={merged.value}
      onInput={merged.onInput}
    />
  );
}
