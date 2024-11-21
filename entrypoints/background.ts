import {
  EXT_PARAM_KEY,
  Message,
  OpenMessage,
  MessageActions,
  PERCENTAGE_STORAGE_KEY,
  DEFAULT_PERCENTAGE,
} from "@/utils/const";
import { log } from "@/utils/index";

export default defineBackground(() => {
  browser.runtime.onMessage.addListener(
    async (message: Message, sender: chrome.runtime.MessageSender) => {
      log("background received message & sender:", message, sender);
      if (message.action === MessageActions.OPEN) {
        const url = new URL((message as OpenMessage).url);
        url.searchParams.set(EXT_PARAM_KEY, "");

        const currentWindow = await browser.windows.getCurrent();
        const { width = 0, height = 0 } = currentWindow;
        const percentage = await storage.getItem<number>(
          PERCENTAGE_STORAGE_KEY,
          { fallback: DEFAULT_PERCENTAGE }
        );
        log("window size:", width, height, "percentage:", percentage);
        browser.windows.create({
          url: url.toString(),
          type: "popup",
          width: (width * (percentage / 100)) | 0,
          height: (height * (percentage / 100)) | 0,
        });
      } else if (message.action === MessageActions.CLOSE) {
        if (sender.tab) {
          browser.windows.remove(sender.tab.windowId);
        }
      }
    }
  );
});
