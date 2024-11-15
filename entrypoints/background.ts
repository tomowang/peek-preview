import {
  EXT_PARAM_KEY,
  Message,
  OpenMessage,
  MessageActions,
} from "@/utils/const";

export default defineBackground(() => {
  browser.runtime.onMessage.addListener((message: Message) => {
    console.log(message);
    if (message.action === MessageActions.OPEN) {
      const url = new URL((message as OpenMessage).url);
      url.searchParams.set(EXT_PARAM_KEY, "");
      browser.windows.create({
        url: url.toString(),
        type: "popup",
      });
    } else if (message.action === MessageActions.CLOSE) {
      browser.windows.getCurrent().then((window) => {
        if (!window.id) return;
        browser.windows.remove(window.id);
      });
    }
  });
});
