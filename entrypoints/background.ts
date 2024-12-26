import {
  EXT_PARAM_KEY,
  Message,
  OpenMessage,
  MessageActions,
  PERCENTAGE_STORAGE_KEY,
  DEFAULT_PERCENTAGE,
  IFrameMessage,
} from "@/utils/const";
import { log, stringHash } from "@/utils/index";

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

  browser.runtime.onMessage.addListener(async (message: IFrameMessage) => {
    log("background received message:", message);
    const url = new URL(message.url);
    const id = stringHash(`${url.host}${url.pathname}`);

    const rules = await browser.declarativeNetRequest.getSessionRules();
    log("current rules:", rules);
    if (message.action === MessageActions.OPEN_IFRAME_POPUP) {
      await browser.declarativeNetRequest.updateSessionRules({
        addRules: [
          {
            action: {
              type: browser.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
              responseHeaders: [
                {
                  header: "x-frame-options",
                  operation:
                    browser.declarativeNetRequest.HeaderOperation.REMOVE,
                },
                {
                  header: "content-security-policy",
                  operation:
                    browser.declarativeNetRequest.HeaderOperation.REMOVE,
                },
              ],
            },
            priority: 1,
            id,
            condition: {
              urlFilter: `||${url.host}${url.pathname}`,
              resourceTypes: [
                browser.declarativeNetRequest.ResourceType.MAIN_FRAME,
                browser.declarativeNetRequest.ResourceType.SUB_FRAME,
              ],
            },
          },
        ],
      });
    } else if (message.action === MessageActions.CLOSE_IFRAME_POPUP) {
      let ids = rules.filter((rule) => rule.id === id).map((rule) => rule.id);
      if (ids.length > 0) {
        await browser.declarativeNetRequest.updateSessionRules({
          removeRuleIds: ids,
        });
      }
    }
    log("update rules:", await browser.declarativeNetRequest.getSessionRules());
  });
});
