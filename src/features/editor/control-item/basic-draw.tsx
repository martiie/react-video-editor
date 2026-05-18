import { ScrollArea } from "@/components/ui/scroll-area";
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
import { dispatch } from "@designcombo/events";
import { EDIT_OBJECT } from "@designcombo/state";
import { ITrackItem } from "@designcombo/types";
import { IDrawItem, IDrawPath } from "../player/items/draw";
import useDrawStore from "../store/use-draw-store";

const EASING_OPTIONS = [
  { label: "Linear", value: "linear" },
  { label: "Ease", value: "ease" },
  { label: "Ease In", value: "easeIn" },
  { label: "Ease Out", value: "easeOut" },
  { label: "Ease In-Out", value: "easeInOut" }
];

const BasicDraw = ({ trackItem }: { trackItem: IDrawItem }) => {
  const { settings, updateSettings } = useDrawStore();
  const paths: IDrawPath[] = trackItem.details?.paths ?? [];

  const handleAnimationMode = (v: "sequential" | "parallel") => {
    updateSettings({ animationMode: v });
    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem.id]: { details: { animationMode: v } }
      }
    });
  };

  const handleEasing = (v: string) => {
    updateSettings({ easing: v });
    const updatedPaths = paths.map((p) => ({ ...p, easing: v }));
    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem.id]: { details: { paths: updatedPaths } }
      }
    });
  };

  const handleOpacity = (v: number[]) => {
    const pct = v[0];
    updateSettings({ opacity: pct / 100 });
    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem.id]: { details: { opacity: pct } }
      }
    });
  };

  const handleUndoLast = () => {
    if (paths.length === 0) return;
    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem.id]: { details: { paths: paths.slice(0, -1) } }
      }
    });
  };

  const handleClearAll = () => {
    dispatch(EDIT_OBJECT, {
      payload: {
        [trackItem.id]: { details: { paths: [] } }
      }
    });
  };

  const opacity =
    typeof trackItem.details?.opacity === "number"
      ? trackItem.details.opacity
      : 100;

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-4 p-4">
        <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Drawing ({paths.length} stroke{paths.length !== 1 ? "s" : ""})
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-xs text-muted-foreground">Opacity</Label>
          <Slider
            min={0}
            max={100}
            step={1}
            value={[opacity]}
            onValueChange={handleOpacity}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-xs text-muted-foreground">
            Animation Mode
          </Label>
          <Select
            value={trackItem.details?.animationMode ?? settings.animationMode}
            onValueChange={handleAnimationMode}
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
            value={paths[0]?.easing ?? settings.easing}
            onValueChange={handleEasing}
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

        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs h-8"
            onClick={handleUndoLast}
            disabled={paths.length === 0}
          >
            Undo Last
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="flex-1 text-xs h-8"
            onClick={handleClearAll}
            disabled={paths.length === 0}
          >
            Clear All
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
};

export default BasicDraw;
