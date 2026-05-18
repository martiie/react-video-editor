import { IVideoTemplate } from "../types/template";

// Placeholder URLs — users replace these via the Customize panel
const SAMPLE_VIDEO =
  "https://storage.googleapis.com/combo_ai/UPLOADS/dXuhoJTCGSzpaYfe9csrr.mp4";
const SAMPLE_IMAGE =
  "https://images.pexels.com/photos/1547813/pexels-photo-1547813.jpeg?auto=compress&cs=tinysrgb&w=1080";

// ─── Template 1: Fade Slide ────────────────────────────────────────────────
// Full-screen video, fades in and slides out at the end.
const fadeSlideTpl: IVideoTemplate = {
  id: "builtin_fade_slide",
  name: "Fade Slide",
  preview: "https://cdn.designcombo.dev/animations/FadeIn.webp",
  description: "Full-screen video with smooth fade-in and slide-out.",
  tags: ["minimal", "video", "fade"],
  duration: 6000,
  transitionIds: [],
  transitionsMap: {},
  trackItemIds: ["fs_v1"],
  tracks: [
    {
      id: "fs_track1",
      type: "video" as any,
      items: ["fs_v1"],
      accepts: ["video", "image", "audio", "text", "caption", "template"],
      magnetic: false,
      static: false,
      muted: false
    }
  ],
  slots: [
    { id: "fs_slot_v", trackItemId: "fs_v1", type: "video", label: "Background Video" }
  ],
  trackItemsMap: {
    fs_v1: {
      id: "fs_v1",
      name: "Video",
      type: "video",
      display: { from: 0, to: 6000 },
      trim: { from: 0, to: 6000 },
      duration: 6000,
      playbackRate: 1,
      isMain: false,
      metadata: {},
      animations: {
        in: {
          name: "fadeIn",
          composition: [
            { property: "opacity", from: 0, to: 1, durationInFrames: 20, easing: "ease", delay: 0 }
          ]
        },
        out: {
          name: "slideOutBottom",
          composition: [
            { property: "translateY", from: 0, to: -80, durationInFrames: 20, easing: "ease", delay: 0 }
          ]
        }
      },
      details: {
        src: SAMPLE_VIDEO,
        width: 1080,
        height: 1920,
        top: "0px",
        left: "0px",
        transform: "scale(1)",
        opacity: 100,
        volume: 100,
        blur: 0,
        brightness: 100,
        flipX: false,
        flipY: false,
        rotate: "0deg",
        visibility: "visible",
        borderRadius: 0,
        borderWidth: 0,
        borderColor: "#000000",
        boxShadow: { color: "#000000", x: 0, y: 0, blur: 0 }
      }
    } as any
  }
};

// ─── Template 2: Text Hero ─────────────────────────────────────────────────
// Video background + a centred headline that slides in from below.
const textHeroTpl: IVideoTemplate = {
  id: "builtin_text_hero",
  name: "Text Hero",
  preview: "https://cdn.designcombo.dev/animations/SlideInBottom.webp",
  description: "Video background with an animated text headline.",
  tags: ["text", "video", "hero"],
  duration: 6000,
  transitionIds: [],
  transitionsMap: {},
  trackItemIds: ["th_v1", "th_t1"],
  tracks: [
    {
      id: "th_track_v",
      type: "video" as any,
      items: ["th_v1"],
      accepts: ["video", "image", "audio", "text", "caption", "template"],
      magnetic: false,
      static: false,
      muted: false
    },
    {
      id: "th_track_t",
      type: "text" as any,
      items: ["th_t1"],
      accepts: ["text", "caption"],
      magnetic: false,
      static: false,
      muted: false
    }
  ],
  slots: [
    { id: "th_slot_v", trackItemId: "th_v1", type: "video", label: "Background Video" },
    { id: "th_slot_t", trackItemId: "th_t1", type: "text", label: "Headline" }
  ],
  trackItemsMap: {
    th_v1: {
      id: "th_v1",
      name: "Video",
      type: "video",
      display: { from: 0, to: 6000 },
      trim: { from: 0, to: 6000 },
      duration: 6000,
      playbackRate: 1,
      isMain: false,
      metadata: {},
      animations: {
        in: {
          name: "fadeIn",
          composition: [
            { property: "opacity", from: 0, to: 1, durationInFrames: 15, easing: "ease", delay: 0 }
          ]
        },
        out: {
          name: "fadeOut",
          composition: [
            { property: "opacity", from: 1, to: 0, durationInFrames: 15, easing: "ease", delay: 0 }
          ]
        }
      },
      details: {
        src: SAMPLE_VIDEO,
        width: 1080,
        height: 1920,
        top: "0px",
        left: "0px",
        transform: "scale(1)",
        opacity: 100,
        volume: 100,
        blur: 0,
        brightness: 80,
        flipX: false,
        flipY: false,
        rotate: "0deg",
        visibility: "visible",
        borderRadius: 0,
        borderWidth: 0,
        borderColor: "#000000",
        boxShadow: { color: "#000000", x: 0, y: 0, blur: 0 }
      }
    } as any,
    th_t1: {
      id: "th_t1",
      name: "Headline",
      type: "text",
      display: { from: 500, to: 6000 },
      isMain: false,
      metadata: {},
      animations: {
        in: {
          name: "slideInBottom",
          composition: [
            { property: "translateY", from: 120, to: 0, durationInFrames: 20, easing: "ease", delay: 0 }
          ]
        },
        out: {
          name: "fadeOut",
          composition: [
            { property: "opacity", from: 1, to: 0, durationInFrames: 15, easing: "ease", delay: 0 }
          ]
        }
      },
      details: {
        text: "Your Headline Here",
        fontSize: 72,
        fontFamily: "Roboto",
        fontUrl:
          "https://fonts.gstatic.com/s/roboto/v29/KFOlCnqEu92Fr1MmWUlvAx05IsDqlA.ttf",
        fontWeight: 700,
        fontStyle: "normal",
        color: "#FFFFFF",
        lineHeight: "normal",
        letterSpacing: "normal",
        textDecoration: "none",
        textAlign: "center",
        textTransform: "none",
        wordSpacing: "normal",
        textShadow: "2px 2px 8px rgba(0,0,0,0.8)",
        WebkitTextStrokeColor: "#000000",
        WebkitTextStrokeWidth: "0px",
        width: 900,
        height: 120,
        top: "820px",
        left: "90px",
        backgroundColor: "transparent",
        opacity: 100,
        border: "none",
        borderRadius: 0,
        borderColor: "#000000",
        borderWidth: 0,
        boxShadow: { color: "transparent", x: 0, y: 0, blur: 0 },
        wordWrap: "normal",
        wordBreak: "normal"
      }
    } as any
  }
};

// ─── Template 3: Image Ken Burns ───────────────────────────────────────────
// Still image with Ken Burns zoom motion + subtitle text.
const kenBurnsTpl: IVideoTemplate = {
  id: "builtin_ken_burns",
  name: "Ken Burns",
  preview: "https://cdn.designcombo.dev/animations/ScaleIn.webp",
  description: "Image slowly zooms in with a subtitle overlay.",
  tags: ["image", "text", "cinematic", "zoom"],
  duration: 7000,
  transitionIds: [],
  transitionsMap: {},
  trackItemIds: ["kb_i1", "kb_t1"],
  tracks: [
    {
      id: "kb_track_i",
      type: "video" as any,
      items: ["kb_i1"],
      accepts: ["video", "image", "audio", "text", "caption", "template"],
      magnetic: false,
      static: false,
      muted: false
    },
    {
      id: "kb_track_t",
      type: "text" as any,
      items: ["kb_t1"],
      accepts: ["text", "caption"],
      magnetic: false,
      static: false,
      muted: false
    }
  ],
  slots: [
    { id: "kb_slot_i", trackItemId: "kb_i1", type: "image", label: "Photo" },
    { id: "kb_slot_t", trackItemId: "kb_t1", type: "text", label: "Subtitle" }
  ],
  trackItemsMap: {
    kb_i1: {
      id: "kb_i1",
      name: "Image",
      type: "image",
      display: { from: 0, to: 7000 },
      isMain: false,
      metadata: {},
      animations: {
        in: {
          name: "fadeIn",
          composition: [
            { property: "opacity", from: 0, to: 1, durationInFrames: 20, easing: "ease", delay: 0 }
          ]
        },
        out: {
          name: "fadeOut",
          composition: [
            { property: "opacity", from: 1, to: 0, durationInFrames: 20, easing: "ease", delay: 0 }
          ]
        },
        // Ken Burns slow zoom via timed animation
        timed: {
          name: "imageMotion",
          composition: [
            { property: "scale", from: 1, to: 1.15, durationInFrames: 210, easing: "linear", delay: 0 }
          ]
        }
      },
      details: {
        src: SAMPLE_IMAGE,
        width: 1080,
        height: 1920,
        top: "0px",
        left: "0px",
        transform: "scale(1)",
        opacity: 100,
        blur: 0,
        brightness: 100,
        flipX: false,
        flipY: false,
        rotate: "0deg",
        visibility: "visible",
        borderRadius: 0,
        borderWidth: 0,
        borderColor: "#000000",
        boxShadow: { color: "#000000", x: 0, y: 0, blur: 0 },
        transformOrigin: "center center",
        background: "transparent",
        crop: { x: 0, y: 0, width: 1080, height: 1920 }
      }
    } as any,
    kb_t1: {
      id: "kb_t1",
      name: "Subtitle",
      type: "text",
      display: { from: 1000, to: 7000 },
      isMain: false,
      metadata: {},
      animations: {
        in: {
          name: "fadeIn",
          composition: [
            { property: "opacity", from: 0, to: 1, durationInFrames: 20, easing: "ease", delay: 0 }
          ]
        },
        out: {
          name: "fadeOut",
          composition: [
            { property: "opacity", from: 1, to: 0, durationInFrames: 20, easing: "ease", delay: 0 }
          ]
        }
      },
      details: {
        text: "Your subtitle text",
        fontSize: 52,
        fontFamily: "Roboto",
        fontUrl:
          "https://fonts.gstatic.com/s/roboto/v29/KFOlCnqEu92Fr1MmWUlvAx05IsDqlA.ttf",
        fontWeight: 400,
        fontStyle: "normal",
        color: "#FFFFFF",
        lineHeight: "normal",
        letterSpacing: "normal",
        textDecoration: "none",
        textAlign: "center",
        textTransform: "none",
        wordSpacing: "normal",
        textShadow: "1px 1px 6px rgba(0,0,0,0.9)",
        WebkitTextStrokeColor: "#000000",
        WebkitTextStrokeWidth: "0px",
        width: 900,
        height: 80,
        top: "1680px",
        left: "90px",
        backgroundColor: "transparent",
        opacity: 100,
        border: "none",
        borderRadius: 0,
        borderColor: "#000000",
        borderWidth: 0,
        boxShadow: { color: "transparent", x: 0, y: 0, blur: 0 },
        wordWrap: "normal",
        wordBreak: "normal"
      }
    } as any
  }
};

export const BUILT_IN_TEMPLATES: IVideoTemplate[] = [
  fadeSlideTpl,
  textHeroTpl,
  kenBurnsTpl
];
