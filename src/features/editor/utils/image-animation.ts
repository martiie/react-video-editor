import { Easing } from "remotion";

export const EASING_OPTIONS = [
  { label: "Linear", value: "linear" },
  { label: "Ease", value: "ease" },
  { label: "Ease In", value: "easeIn" },
  { label: "Ease Out", value: "easeOut" },
  { label: "Ease In-Out", value: "easeInOut" },
  { label: "Bounce", value: "bounce" },
  { label: "Elastic", value: "elastic" }
] as const;

export type EasingOption = (typeof EASING_OPTIONS)[number]["value"];

export interface MotionProperty {
  enabled: boolean;
  from: number;
  to: number;
}

export interface ImageMotionConfig {
  moveX: MotionProperty;
  moveY: MotionProperty;
  zoom: MotionProperty;
  rotate: MotionProperty;
  fade: MotionProperty;
  easing: EasingOption;
}

export const DEFAULT_IMAGE_MOTION: ImageMotionConfig = {
  moveX: { enabled: false, from: 0, to: 0 },
  moveY: { enabled: false, from: 0, to: 0 },
  zoom: { enabled: false, from: 1, to: 1 },
  rotate: { enabled: false, from: 0, to: 0 },
  fade: { enabled: false, from: 1, to: 1 },
  easing: "ease"
};

const PROPERTY_MAP: Record<keyof Omit<ImageMotionConfig, "easing">, string> = {
  moveX: "translateX",
  moveY: "translateY",
  zoom: "scale",
  rotate: "rotate",
  fade: "opacity"
};

export function buildImageMotionComposition(
  config: ImageMotionConfig,
  durationInFrames: number
) {
  const { easing } = config;
  const composition: {
    property: string;
    from: number;
    to: number;
    durationInFrames: number;
    easing: string;
  }[] = [];

  for (const key of Object.keys(PROPERTY_MAP) as Array<
    keyof typeof PROPERTY_MAP
  >) {
    const prop = config[key];
    if (prop.enabled) {
      composition.push({
        property: PROPERTY_MAP[key],
        from: prop.from,
        to: prop.to,
        durationInFrames,
        easing
      });
    }
  }

  return composition;
}

// Called by getAnimations to resolve stored easing name to an Easing function.
export function resolveEasingFn(name: string): (t: number) => number {
  const map: Partial<Record<string, (t: number) => number>> = {
    easeIn: Easing.in(Easing.quad),
    easeOut: Easing.out(Easing.quad),
    easeInOut: Easing.inOut(Easing.quad),
    elastic: Easing.elastic(1)
  };
  if (map[name]) return map[name]!;
  const direct = Easing[name as keyof typeof Easing];
  if (typeof direct === "function") return direct as (t: number) => number;
  return Easing.ease;
}
