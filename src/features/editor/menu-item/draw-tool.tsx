"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useDrawStore from "../store/use-draw-store";

const STROKE_WIDTHS = [2, 4, 6, 8, 12, 16, 24];

const EASING_OPTIONS = [
  { label: "Linear", value: "linear" },
  { label: "Ease", value: "ease" },
  { label: "Ease In", value: "easeIn" },
  { label: "Ease Out", value: "easeOut" },
  { label: "Ease In-Out", value: "easeInOut" }
];

export const DrawTool = () => {
  const { isDrawing, settings, setIsDrawing, updateSettings } = useDrawStore();

  return (
    <div className="flex flex-col gap-4 p-4 w-full">
      <div className="text-sm font-semibold">Draw Tool</div>

      <Button
        size="sm"
        variant={isDrawing ? "default" : "outline"}
        onClick={() => setIsDrawing(!isDrawing)}
        className="w-full"
      >
        {isDrawing ? "Stop Drawing" : "Start Drawing"}
      </Button>

      {isDrawing && (
        <p className="text-xs text-muted-foreground">
          Click and drag on the canvas to draw strokes.
        </p>
      )}

      <div className="flex flex-col gap-2">
        <Label className="text-xs text-muted-foreground">Color</Label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={settings.color}
            onChange={(e) => updateSettings({ color: e.target.value })}
            className="w-8 h-8 rounded cursor-pointer border border-border bg-transparent p-0"
          />
          <Input
            value={settings.color}
            onChange={(e) => updateSettings({ color: e.target.value })}
            className="h-8 text-xs font-mono"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-xs text-muted-foreground">
          Stroke Width — {settings.strokeWidth}px
        </Label>
        <div className="flex gap-1 flex-wrap">
          {STROKE_WIDTHS.map((w) => (
            <button
              key={w}
              onClick={() => updateSettings({ strokeWidth: w })}
              className={`flex items-center justify-center w-8 h-8 rounded text-xs border transition-colors ${
                settings.strokeWidth === w
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/50"
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-xs text-muted-foreground">
          Opacity — {Math.round(settings.opacity * 100)}%
        </Label>
        <Slider
          min={0}
          max={100}
          step={1}
          value={[Math.round(settings.opacity * 100)]}
          onValueChange={([v]) => updateSettings({ opacity: v / 100 })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-xs text-muted-foreground">Animation Mode</Label>
        <Select
          value={settings.animationMode}
          onValueChange={(v) =>
            updateSettings({ animationMode: v as "sequential" | "parallel" })
          }
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sequential">Sequential</SelectItem>
            <SelectItem value="parallel">Parallel</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-xs text-muted-foreground">Easing</Label>
        <Select
          value={settings.easing}
          onValueChange={(v) => updateSettings({ easing: v })}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EASING_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
