"use client";

import { useState, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Image as ImageIcon,
  Video,
  Type,
  Music,
  ChevronLeft,
  Trash2,
  Check,
  Pencil
} from "lucide-react";
import { BUILT_IN_TEMPLATES } from "../data/templates";
import { IVideoTemplate, ITemplateSlot, SlotIdMap } from "../types/template";
import {
  applyTemplate,
  captureTemplate,
  loadUserTemplates,
  deleteUserTemplate,
  replaceSlotMedia,
  replaceSlotText
} from "../utils/template-engine";
import useStore from "../store/use-store";

// ─── Slot icon helper ──────────────────────────────────────────────────────

const SlotIcon = ({ type }: { type: ITemplateSlot["type"] }) => {
  const cls = "h-4 w-4 shrink-0 text-muted-foreground";
  if (type === "video") return <Video className={cls} />;
  if (type === "image") return <ImageIcon className={cls} />;
  if (type === "audio") return <Music className={cls} />;
  return <Type className={cls} />;
};

// ─── Template card ─────────────────────────────────────────────────────────

const TemplateCard = ({
  template,
  onApply,
  onDelete
}: {
  template: IVideoTemplate;
  onApply: (t: IVideoTemplate) => void;
  onDelete?: (id: string) => void;
}) => (
  <div className="flex flex-col gap-1 group">
    <div
      className="relative aspect-[9/16] w-full cursor-pointer overflow-hidden rounded-md border border-border bg-muted"
      onClick={() => onApply(template)}
    >
      {template.preview ? (
        <img
          src={template.preview}
          alt={template.name}
          draggable={false}
          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
          <Video className="h-8 w-8 opacity-40" />
        </div>
      )}
      <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
        <span className="text-xs font-semibold text-white">Apply</span>
      </div>
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(template.id);
          }}
          className="absolute right-1 top-1 hidden rounded p-1 text-white/70 hover:text-white group-hover:flex"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      )}
    </div>
    <p className="truncate text-center text-xs text-muted-foreground">{template.name}</p>
  </div>
);

// ─── Slot row ──────────────────────────────────────────────────────────────

const SlotRow = ({
  slot,
  itemId,
  onReplace
}: {
  slot: ITemplateSlot;
  itemId: string;
  onReplace: (slot: ITemplateSlot, itemId: string, value: string) => void;
}) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const placeholder =
    slot.type === "text" ? "Enter new text…" : "Paste media URL…";

  const commit = () => {
    if (value.trim()) {
      onReplace(slot, itemId, value.trim());
      setValue("");
    }
    setEditing(false);
  };

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border bg-background p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <SlotIcon type={slot.type} />
          <span className="truncate text-sm">{slot.label}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 shrink-0 gap-1 px-2 text-xs"
          onClick={() => setEditing((v) => !v)}
        >
          <Pencil className="h-3 w-3" />
          Replace
        </Button>
      </div>

      {editing && (
        <div className="flex gap-2 pt-1">
          <Input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className="h-7 text-xs"
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") setEditing(false);
            }}
          />
          <Button
            variant="default"
            size="sm"
            className="h-7 w-7 shrink-0 p-0"
            onClick={commit}
            disabled={!value.trim()}
          >
            <Check className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
};

// ─── Gallery view ──────────────────────────────────────────────────────────

const GalleryView = ({
  onApply,
  onSave
}: {
  onApply: (template: IVideoTemplate, slotMap: SlotIdMap) => void;
  onSave: () => void;
}) => {
  const [search, setSearch] = useState("");
  const [userTemplates, setUserTemplates] = useState<IVideoTemplate[]>([]);

  useEffect(() => {
    setUserTemplates(loadUserTemplates());
  }, []);

  const filterFn = (t: IVideoTemplate) =>
    !search ||
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    (t.tags ?? []).some((tag) => tag.includes(search.toLowerCase()));

  const builtIn = BUILT_IN_TEMPLATES.filter(filterFn);
  const user = userTemplates.filter(filterFn);

  const handleApply = (t: IVideoTemplate) => {
    const slotMap = applyTemplate(t);
    onApply(t, slotMap);
  };

  const handleDelete = (id: string) => {
    deleteUserTemplate(id);
    setUserTemplates(loadUserTemplates());
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="p-4">
        <Input
          placeholder="Search templates…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 text-sm"
        />
      </div>

      <ScrollArea className="flex-1 px-4">
        <div className="flex flex-col gap-6 pb-6">
          {/* Built-in */}
          {builtIn.length > 0 && (
            <section className="flex flex-col gap-3">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Built-in
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {builtIn.map((t) => (
                  <TemplateCard key={t.id} template={t} onApply={handleApply} />
                ))}
              </div>
            </section>
          )}

          {/* User templates */}
          <section className="flex flex-col gap-3">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              My Templates
            </Label>

            {user.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {user.map((t) => (
                  <TemplateCard
                    key={t.id}
                    template={t}
                    onApply={handleApply}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            ) : (
              <p className="text-center text-xs text-muted-foreground py-4">
                No saved templates yet.
              </p>
            )}

            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={onSave}
            >
              Save current project as template
            </Button>
          </section>
        </div>
      </ScrollArea>
    </div>
  );
};

// ─── Customize (slot replacement) view ────────────────────────────────────

const CustomizeView = ({
  template,
  slotMap,
  onBack
}: {
  template: IVideoTemplate;
  slotMap: SlotIdMap;
  onBack: () => void;
}) => {
  const handleReplace = (
    slot: ITemplateSlot,
    itemId: string,
    value: string
  ) => {
    if (slot.type === "text") {
      replaceSlotText(itemId, value);
    } else {
      replaceSlotMedia(itemId, value);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onBack}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{template.name}</p>
          <p className="text-xs text-muted-foreground">Replace content below</p>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="flex flex-col gap-3">
          {template.slots.map((slot) => {
            const itemId = slotMap[slot.id];
            if (!itemId) return null;
            return (
              <SlotRow
                key={slot.id}
                slot={slot}
                itemId={itemId}
                onReplace={handleReplace}
              />
            );
          })}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground px-2">
          All animations, effects, and transitions are preserved.
          Only the content is replaced.
        </p>
      </ScrollArea>
    </div>
  );
};

// ─── Save dialog ───────────────────────────────────────────────────────────

const SaveDialog = ({
  open,
  onClose,
  onSave
}: {
  open: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
}) => {
  const [name, setName] = useState("");

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
      setName("");
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Save as Template</DialogTitle>
        </DialogHeader>
        <div className="py-2">
          <Label htmlFor="tpl-name" className="text-sm">
            Template name
          </Label>
          <Input
            id="tpl-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Template"
            className="mt-1"
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── Root component ────────────────────────────────────────────────────────

export const Templates = () => {
  const { tracks, trackItemIds, trackItemsMap, transitionsMap, transitionIds, duration } =
    useStore();

  const [view, setView] = useState<"gallery" | "customize">("gallery");
  const [appliedTemplate, setAppliedTemplate] = useState<IVideoTemplate | null>(null);
  const [slotMap, setSlotMap] = useState<SlotIdMap>({});
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  const handleApply = (template: IVideoTemplate, map: SlotIdMap) => {
    setAppliedTemplate(template);
    setSlotMap(map);
    setView("customize");
  };

  const handleSave = (name: string) => {
    captureTemplate(
      { tracks, trackItemIds, trackItemsMap, transitionsMap, transitionIds, duration },
      name
    );
  };

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden">
      {view === "gallery" ? (
        <GalleryView
          onApply={handleApply}
          onSave={() => setSaveDialogOpen(true)}
        />
      ) : (
        <CustomizeView
          template={appliedTemplate!}
          slotMap={slotMap}
          onBack={() => setView("gallery")}
        />
      )}

      <SaveDialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
};
