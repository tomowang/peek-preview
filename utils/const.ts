export enum MessageActions {
  OPEN,
  CLOSE,
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

export const EXT_PARAM_KEY = "wxt-peek-preview";
