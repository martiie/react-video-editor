import { ITrack, ITrackItem, ITransition } from "@designcombo/types";

export interface ITemplateSlot {
  id: string;
  trackItemId: string; // references an item ID within the template's trackItemsMap
  type: "image" | "video" | "text" | "audio";
  label: string;
}

export interface IVideoTemplate {
  id: string;
  name: string;
  preview: string; // thumbnail URL
  description?: string;
  tags?: string[];
  slots: ITemplateSlot[];
  tracks: ITrack[];
  trackItemIds: string[];
  trackItemsMap: Record<string, ITrackItem>;
  transitionsMap: Record<string, ITransition>;
  transitionIds: string[];
  duration: number;
}

// Maps slot.id → the newly created itemId after applyTemplate()
export type SlotIdMap = Record<string, string>;
