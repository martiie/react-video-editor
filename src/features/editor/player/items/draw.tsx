import { ITrackItem, ITrackItemBase } from "@designcombo/types";
type IDrawItemBase = Omit<ITrackItemBase, "type">;
import { Easing, interpolate } from "remotion";
import { BaseSequence, SequenceItemOptions } from "../base-sequence";
import { calculateFrames } from "../../utils/frames";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface IDrawPath {
  d: string;
  color: string;
  strokeWidth: number;
  length: number; // pre-measured path length for dasharray animation
  easing: string;
}

export interface IDrawDetails {
  paths: IDrawPath[];
  width: number;
  height: number;
  top: string | number;
  left: string | number;
  transform: string;
  opacity: number; // 0–100
  animationMode: "sequential" | "parallel";
  blur: number;
  brightness: number;
  borderWidth: number;
  borderColor: string;
  rotate: string;
  transformOrigin: string;
  crop?: undefined;
}

export interface IDrawItem extends IDrawItemBase {
  type: "draw";
  details: IDrawDetails;
}

// ─── Easing map ────────────────────────────────────────────────────────────

const EASING_FN: Record<string, (t: number) => number> = {
  linear: Easing.linear,
  ease: Easing.ease,
  easeIn: Easing.in(Easing.quad),
  easeOut: Easing.out(Easing.quad),
  easeInOut: Easing.inOut(Easing.quad)
};

// ─── Animated path ─────────────────────────────────────────────────────────

const AnimatedPath = ({
  path,
  frame,
  startFrame,
  endFrame
}: {
  path: IDrawPath;
  frame: number;
  startFrame: number;
  endFrame: number;
}) => {
  const easeFn = EASING_FN[path.easing] ?? Easing.out(Easing.quad);
  const length = Math.max(path.length, 1);

  const progress = interpolate(frame, [startFrame, endFrame], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeFn
  });

  return (
    <path
      d={path.d}
      stroke={path.color}
      strokeWidth={path.strokeWidth}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={length}
      strokeDashoffset={length * (1 - progress)}
    />
  );
};

// ─── Draw item renderer ────────────────────────────────────────────────────

const DrawItem = ({
  item,
  options
}: {
  item: IDrawItem;
  options: SequenceItemOptions;
}) => {
  const { fps, frame: globalFrame = 0 } = options;
  const { details } = item;
  const { paths = [], animationMode = "sequential", width, height } = details;
  const { durationInFrames } = calculateFrames(item.display, fps);
  const frame = globalFrame - (item.display.from * fps) / 1000;
  const n = paths.length;

  return BaseSequence({
    item: item as unknown as ITrackItem,
    options,
    children: (
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ position: "absolute", inset: 0, overflow: "visible" }}
      >
        {paths.map((path, i) => {
          let startFrame: number;
          let endFrame: number;

          if (animationMode === "parallel" || n === 0) {
            startFrame = 0;
            endFrame = durationInFrames;
          } else {
            const slice = durationInFrames / n;
            startFrame = i * slice;
            endFrame = (i + 1) * slice;
          }

          return (
            <AnimatedPath
              key={i}
              path={path}
              frame={frame}
              startFrame={startFrame}
              endFrame={endFrame}
            />
          );
        })}
      </svg>
    )
  });
};

export default DrawItem;
