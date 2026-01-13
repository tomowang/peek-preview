export enum MessageActions {
  OPEN,
  CLOSE,
  OPEN_IFRAME_POPUP,
  CLOSE_IFRAME_POPUP,
}

export type Message = {
  action: MessageActions;
};

export type OpenMessage = Message & {
  url: string;
};

export type CloseMessage = Message & {
  // windowId: number;
};

export type IFrameMessage = {
  action: MessageActions.OPEN_IFRAME_POPUP | MessageActions.CLOSE_IFRAME_POPUP;
  url: string;
};

export const MESSAGE_CHANNEL = "peek-preview";
export const EXT_PARAM_KEY = "_peek_preview";

export const WINDOW_MODE_STORAGE_KEY = "local:windowMode";

export enum WindowMode {
  IFRAME = 0b1,
  POPUP = 0b10,
}

export const TRIGGER_KEY_STORAGE_KEY = "local:triggerKey";

export enum TriggerKey {
  SHIFT = "shift",
  ALT = "alt",
  CTRL = "ctrl",
  META = "meta",
}

export const OPEN_MODE_STORAGE_KEY = "local:openMode";

export enum OpenMode {
  SHORTCUT_CLICK = 0b1,
  DRAG_LINK = 0b10,
  BOTH = SHORTCUT_CLICK | DRAG_LINK,
}

export const CLOSE_MODE_STORAGE_KEY = "local:closeMode";

export enum CloseMode {
  ESCAPE = 0b1,
  BLUR = 0b10,
  BOTH = ESCAPE | BLUR,
}

export const PERCENTAGE_STORAGE_KEY = "local:percentage";

export const DEFAULT_PERCENTAGE = 90;

export const STORE_URLS = {
  chrome:
    "https://chromewebstore.google.com/detail/peek-preview-arc-like-lin/jlllnhfjmihoiagiaallhmlcgdohdocb",
  edge: "https://microsoftedge.microsoft.com/addons/detail/peek-preview-arc-like-l/lmgfgcpcpmplbhgfbopiidfkamfckpgp",
  firefox: "https://addons.mozilla.org/addon/peek-preview-arc-like-preview/",
} as { [key: string]: string };
