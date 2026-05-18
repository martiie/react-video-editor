"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { dispatch } from "@designcombo/events";
import { ADD_ITEMS, EDIT_OBJECT } from "@designcombo/state";
import { generateId } from "@designcombo/timeline";
import useStore from "../store/use-store";
import useDrawStore from "../store/use-draw-store";
import {
  Point,
  simplifyPoints,
  toSmoothPath,
  measureSvgPathLength
} from "../utils/path-utils";
import { IDrawPath } from "../player/items/draw";

// ─── DrawCanvas ────────────────────────────────────────────────────────────
// SVG overlay rendered inside the scene's scaled container.
// Mouse coordinates are in *screen* space; we divide by zoom to get canvas space.

const DrawCanvas = ({
  zoom,
  size
}: {
  zoom: number;
  size: { width: number; height: number };
}) => {
  const { isDrawing, settings, activeDrawItemId, setActiveDrawItemId } =
    useDrawStore();
  const { trackItemsMap, duration } = useStore();

  const svgRef = useRef<SVGSVGElement>(null);
  const isDown = useRef(false);
  const rawPoints = useRef<Point[]>([]);
  const [livePath, setLivePath] = useState<string>("");

  // Convert a screen-space mouse event to canvas-space coordinates
  const toCanvas = useCallback(
    (e: MouseEvent | React.MouseEvent): Point | null => {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return null;
      return {
        x: (e.clientX - rect.left) / zoom,
        y: (e.clientY - rect.top) / zoom
      };
    },
    [zoom]
  );

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!isDrawing) return;
      e.preventDefault();
      e.stopPropagation();
      isDown.current = true;
      const pt = toCanvas(e);
      if (!pt) return;
      rawPoints.current = [pt];
      setLivePath(`M ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`);
    },
    [isDrawing, toCanvas]
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDrawing || !isDown.current) return;
      const pt = toCanvas(e);
      if (!pt) return;
      rawPoints.current.push(pt);
      // Refresh preview every 4 points to avoid too many re-renders
      if (rawPoints.current.length % 4 === 0) {
        setLivePath(toSmoothPath(rawPoints.current));
      }
    },
    [isDrawing, toCanvas]
  );

  const commitStroke = useCallback(() => {
    if (!isDown.current) return;
    isDown.current = false;

    const pts = rawPoints.current;
    rawPoints.current = [];

    if (pts.length < 2) {
      setLivePath("");
      return;
    }

    const simplified = simplifyPoints(pts, 1.5);
    const pathD = toSmoothPath(simplified);
    const length = measureSvgPathLength(pathD);

    // Show the final simplified path before clearing, to avoid flicker
    setLivePath(pathD);

    const newPath: IDrawPath = {
      d: pathD,
      color: settings.color,
      strokeWidth: settings.strokeWidth,
      length,
      easing: settings.easing
    };

    // Determine whether to add to an existing draw item or create one
    const existingItem =
      activeDrawItemId ? trackItemsMap[activeDrawItemId] : null;

    if (existingItem && (existingItem.type as string) === "draw") {
      const prevPaths: IDrawPath[] = (existingItem.details as any).paths ?? [];
      dispatch(EDIT_OBJECT, {
        payload: {
          [activeDrawItemId!]: {
            details: { paths: [...prevPaths, newPath] }
          }
        }
      });
      setLivePath("");
    } else {
      // Create a new draw track item spanning the full project duration
      const id = generateId();
      const clipDuration = Math.max(duration, 3000);

      dispatch(ADD_ITEMS, {
        payload: {
          trackItems: [
            {
              id,
              name: "Drawing",
              type: "draw",
              display: { from: 0, to: clipDuration },
              isMain: false,
              metadata: {},
              details: {
                paths: [newPath],
                width: size.width,
                height: size.height,
                top: "0px",
                left: "0px",
                transform: "none",
                opacity: Math.round(settings.opacity * 100),
                animationMode: settings.animationMode,
                blur: 0,
                brightness: 100,
                borderWidth: 0,
                borderColor: "transparent",
                rotate: "0deg",
                transformOrigin: "center center"
              }
            }
          ]
        }
      });

      setActiveDrawItemId(id);
      setLivePath("");
    }
  }, [
    settings,
    activeDrawItemId,
    trackItemsMap,
    duration,
    size,
    setActiveDrawItemId
  ]);

  // Capture mouseup on window so releasing outside the SVG still commits
  useEffect(() => {
    const handler = () => commitStroke();
    window.addEventListener("mouseup", handler);
    return () => window.removeEventListener("mouseup", handler);
  }, [commitStroke]);

  // Reset active draw item when draw mode is toggled off
  useEffect(() => {
    if (!isDrawing) setActiveDrawItemId(null);
  }, [isDrawing, setActiveDrawItemId]);

  if (!isDrawing) return null;

  return (
    <svg
      ref={svgRef}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 150,
        cursor: "crosshair",
        pointerEvents: "auto",
        touchAction: "none"
      }}
      width={size.width}
      height={size.height}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
    >
      {livePath && (
        <path
          d={livePath}
          stroke={settings.color}
          strokeWidth={settings.strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={settings.opacity}
        />
      )}
    </svg>
  );
};

export default DrawCanvas;
