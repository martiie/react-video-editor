import { ITrack, ITrackItem, ITransition } from "@designcombo/types";
import { dispatch } from "@designcombo/events";
import { ADD_ITEMS, EDIT_OBJECT } from "@designcombo/state";
import { generateId } from "@designcombo/timeline";
import { IVideoTemplate, SlotIdMap } from "../types/template";

const USER_TEMPLATES_KEY = "video-editor-user-templates";

/**
 * Clone a template into the editor, remapping all IDs to avoid conflicts.
 * Returns a map of slot.id → the newly assigned item ID, so the caller
 * can immediately offer slot replacement.
 */
export function applyTemplate(template: IVideoTemplate): SlotIdMap {
  // Build old→new ID mapping for every track item
  const idMap: Record<string, string> = {};
  for (const oldId of template.trackItemIds) {
    idMap[oldId] = generateId();
  }

  // Build old→new ID mapping for transitions
  const transitionIdMap: Record<string, string> = {};
  for (const oldId of template.transitionIds) {
    transitionIdMap[oldId] = generateId();
  }

  // Clone items with new IDs, preserving every other field intact
  const trackItems: ITrackItem[] = template.trackItemIds.map((oldId) => ({
    ...template.trackItemsMap[oldId],
    id: idMap[oldId]
  }));

  // Clone tracks, remapping their item arrays
  const tracks: ITrack[] = template.tracks.map((track) => ({
    ...track,
    id: generateId(),
    items: track.items.map((itemId) => idMap[itemId] ?? itemId)
  }));

  // Clone transitions, remapping from/to references
  const transitionsMap: Record<string, ITransition> = {};
  for (const oldId of template.transitionIds) {
    const t = template.transitionsMap[oldId];
    const newId = transitionIdMap[oldId];
    transitionsMap[newId] = {
      ...t,
      id: newId,
      fromId: idMap[t.fromId] ?? t.fromId,
      toId: idMap[t.toId] ?? t.toId
    };
  }

  dispatch(ADD_ITEMS, {
    payload: {
      trackItems,
      tracks,
      ...(Object.keys(transitionsMap).length > 0 && { transitionsMap })
    }
  });

  // Build and return slot → new item ID map
  const slotMap: SlotIdMap = {};
  for (const slot of template.slots) {
    slotMap[slot.id] = idMap[slot.trackItemId];
  }
  return slotMap;
}

/**
 * Replace the media source of an applied slot item.
 * All animations, effects, position, and transform are preserved.
 */
export function replaceSlotMedia(itemId: string, newSrc: string): void {
  dispatch(EDIT_OBJECT, {
    payload: {
      [itemId]: {
        details: { src: newSrc }
      }
    }
  });
}

/**
 * Replace the text content of an applied slot item.
 * All animations, styling, and position are preserved.
 */
export function replaceSlotText(itemId: string, newText: string): void {
  dispatch(EDIT_OBJECT, {
    payload: {
      [itemId]: {
        details: { text: newText }
      }
    }
  });
}

/**
 * Snapshot the current editor state as a saveable template.
 * Auto-detects slots from item types (video, image, text, audio).
 * Caption items are excluded — they are auto-generated content.
 */
export function captureTemplate(
  state: {
    tracks: ITrack[];
    trackItemIds: string[];
    trackItemsMap: Record<string, ITrackItem>;
    transitionsMap: Record<string, ITransition>;
    transitionIds: string[];
    duration: number;
  },
  name: string
): IVideoTemplate {
  const slots = [];
  const typeCounts: Record<string, number> = {};

  for (const id of state.trackItemIds) {
    const item = state.trackItemsMap[id];
    if (!item) continue;
    const { type } = item;
    if (type !== "video" && type !== "image" && type !== "text" && type !== "audio") continue;

    typeCounts[type] = (typeCounts[type] ?? 0) + 1;
    const count = typeCounts[type];

    const labelMap: Record<string, string> = {
      video: count === 1 ? "Background Video" : `Video ${count}`,
      image: count === 1 ? "Image" : `Image ${count}`,
      text: count === 1 ? "Headline" : `Text ${count}`,
      audio: count === 1 ? "Music" : `Audio ${count}`
    };

    slots.push({
      id: generateId(),
      trackItemId: id,
      type: type as "video" | "image" | "text" | "audio",
      label: labelMap[type]
    });
  }

  const template: IVideoTemplate = {
    id: generateId(),
    name,
    preview: "",
    slots,
    tracks: JSON.parse(JSON.stringify(state.tracks)),
    trackItemIds: [...state.trackItemIds],
    trackItemsMap: JSON.parse(JSON.stringify(state.trackItemsMap)),
    transitionsMap: JSON.parse(JSON.stringify(state.transitionsMap)),
    transitionIds: [...state.transitionIds],
    duration: state.duration
  };

  saveUserTemplate(template);
  return template;
}

// ─── localStorage persistence ──────────────────────────────────────────────

export function saveUserTemplate(template: IVideoTemplate): void {
  try {
    const existing = loadUserTemplates();
    const updated = [template, ...existing.filter((t) => t.id !== template.id)];
    localStorage.setItem(USER_TEMPLATES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save template:", e);
  }
}

export function loadUserTemplates(): IVideoTemplate[] {
  try {
    const raw = localStorage.getItem(USER_TEMPLATES_KEY);
    return raw ? (JSON.parse(raw) as IVideoTemplate[]) : [];
  } catch {
    return [];
  }
}

export function deleteUserTemplate(id: string): void {
  try {
    const existing = loadUserTemplates();
    localStorage.setItem(
      USER_TEMPLATES_KEY,
      JSON.stringify(existing.filter((t) => t.id !== id))
    );
  } catch (e) {
    console.error("Failed to delete template:", e);
  }
}
