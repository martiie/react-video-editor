import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { dispatch } from "@designcombo/events";
import { EDIT_OBJECT } from "@designcombo/state";
import { IImage, ITrackItem } from "@designcombo/types";
import { useCallback, useEffect, useState } from "react";
import {
  buildImageMotionComposition,
  DEFAULT_IMAGE_MOTION,
  EASING_OPTIONS,
  EasingOption,
  ImageMotionConfig,
  MotionProperty
} from "../../utils/image-animation";

const FPS = 30;

interface PropertyRowProps {
  label: string;
  prop: MotionProperty;
  step?: number;
  onChange: (next: MotionProperty) => void;
}

const PropertyRow = ({ label, prop, step = 1, onChange }: PropertyRowProps) => {
  const set = (patch: Partial<MotionProperty>) =>
    onChange({ ...prop, ...patch });

  return (
    <div className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={prop.enabled}
        onChange={(e) => set({ enabled: e.target.checked })}
        className="h-3.5 w-3.5 accent-primary cursor-pointer"
      />
      <span className="w-14 shrink-0 text-muted-foreground">{label}</span>
      <input
        type="number"
        disabled={!prop.enabled}
        value={prop.from}
        step={step}
        onChange={(e) => set({ from: parseFloat(e.target.value) || 0 })}
        className="w-16 rounded border border-input bg-transparent px-2 py-0.5 text-center text-xs disabled:opacity-40"
      />
      <span className="text-muted-foreground">→</span>
      <input
        type="number"
        disabled={!prop.enabled}
        value={prop.to}
        step={step}
        onChange={(e) => set({ to: parseFloat(e.target.value) || 0 })}
        className="w-16 rounded border border-input bg-transparent px-2 py-0.5 text-center text-xs disabled:opacity-40"
      />
    </div>
  );
};

const ImageMotion = ({
  trackItem
}: {
  trackItem: ITrackItem & IImage;
}) => {
  const [config, setConfig] = useState<ImageMotionConfig>(DEFAULT_IMAGE_MOTION);

  useEffect(() => {
    const timed = trackItem.animations?.timed;
    if (!timed?.composition?.length) {
      setConfig(DEFAULT_IMAGE_MOTION);
      return;
    }

    const next = { ...DEFAULT_IMAGE_MOTION, easing: DEFAULT_IMAGE_MOTION.easing };
    for (const comp of timed.composition) {
      const easing = comp.easing as EasingOption;
      next.easing = easing;
      if (comp.property === "translateX")
        next.moveX = { enabled: true, from: comp.from, to: comp.to };
      else if (comp.property === "translateY")
        next.moveY = { enabled: true, from: comp.from, to: comp.to };
      else if (comp.property === "scale")
        next.zoom = { enabled: true, from: comp.from, to: comp.to };
      else if (comp.property === "rotate")
        next.rotate = { enabled: true, from: comp.from, to: comp.to };
      else if (comp.property === "opacity")
        next.fade = { enabled: true, from: comp.from, to: comp.to };
    }
    setConfig(next);
  }, [trackItem]);

  const dispatchMotion = useCallback(
    (next: ImageMotionConfig) => {
      const durationInFrames = Math.round(
        ((trackItem.display.to - trackItem.display.from) / 1000) * FPS
      );
      const composition = buildImageMotionComposition(next, durationInFrames);
      dispatch(EDIT_OBJECT, {
        payload: {
          [trackItem.id]: {
            animations: {
              timed:
                composition.length > 0
                  ? { name: "imageMotion", composition }
                  : undefined
            }
          }
        }
      });
    },
    [trackItem]
  );

  const updateConfig = useCallback(
    (patch: Partial<ImageMotionConfig>) => {
      setConfig((prev) => {
        const next = { ...prev, ...patch };
        dispatchMotion(next);
        return next;
      });
    },
    [dispatchMotion]
  );

  const updateProp = useCallback(
    (key: keyof Omit<ImageMotionConfig, "easing">, value: MotionProperty) => {
      updateConfig({ [key]: value });
    },
    [updateConfig]
  );

  return (
    <div className="flex flex-col gap-3 py-4">
      <Label className="font-sans text-xs font-semibold">Motion</Label>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="w-[1.125rem]" />
          <span className="w-14 shrink-0" />
          <span className="w-16 text-center">From</span>
          <span className="w-4" />
          <span className="w-16 text-center">To</span>
        </div>

        <PropertyRow
          label="Move X"
          prop={config.moveX}
          onChange={(v) => updateProp("moveX", v)}
        />
        <PropertyRow
          label="Move Y"
          prop={config.moveY}
          onChange={(v) => updateProp("moveY", v)}
        />
        <PropertyRow
          label="Zoom"
          prop={config.zoom}
          step={0.01}
          onChange={(v) => updateProp("zoom", v)}
        />
        <PropertyRow
          label="Rotate"
          prop={config.rotate}
          onChange={(v) => updateProp("rotate", v)}
        />
        <PropertyRow
          label="Fade"
          prop={config.fade}
          step={0.01}
          onChange={(v) => updateProp("fade", v)}
        />
      </div>

      <div className="flex items-center gap-2 text-sm">
        <span className="w-[5.5rem] shrink-0 text-muted-foreground">Easing</span>
        <Select
          value={config.easing}
          onValueChange={(v) => updateConfig({ easing: v as EasingOption })}
        >
          <SelectTrigger className="h-7 flex-1 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="z-[200]">
            {EASING_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-xs">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ImageMotion;
