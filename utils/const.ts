export enum MessageActions {
  OPEN,
  CLOSE,
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

export const MESSAGE_CHANNEL = "peek-preview";
export const EXT_PARAM_KEY = "_peek_preview";

export const WINDOW_MODE_STORAGE_KEY = "local:windowMode";

export enum WindowMode {
  IFRAME = 0b1,
  POPUP = 0b10,
}

export const OPEN_MODE_STORAGE_KEY = "local:openMode";

export enum OpenMode {
  SHIFT_CLICK = 0b1,
  DRAG_LINK = 0b10,
  BOTH = SHIFT_CLICK | DRAG_LINK,
}

export const CLOSE_MODE_STORAGE_KEY = "local:closeMode";

export enum CloseMode {
  ESCAPE = 0b1,
  BLUR = 0b10,
  BOTH = ESCAPE | BLUR,
}

export const PERCENTAGE_STORAGE_KEY = "local:percentage";

export const DEFAULT_PERCENTAGE = 90;
