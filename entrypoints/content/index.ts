import { ContentScriptContext } from "wxt/client";
import {
  EXT_PARAM_KEY,
  OpenMessage,
  CloseMessage,
  MessageActions,
} from "@/utils/const";

export default defineContentScript({
  matches: ["*://*/*"],
  main(ctx: ContentScriptContext) {
    const url = new URL(location.href);
    const params = new URLSearchParams(url.search);

    // peek preview window
    if (params.has(EXT_PARAM_KEY)) {
      // escape to close
      ctx.addEventListener(
        window,
        "keydown",
        async function close(event: KeyboardEvent) {
          if (event.key === "Escape") {
            await browser.runtime.sendMessage<CloseMessage>({
              action: MessageActions.CLOSE,
            });
          }
        }
      );
    } else {
      // open links with shift key
      ctx.addEventListener(
        document,
        "click",
        async (event) => {
          if (!event.shiftKey) return;
          if (!(event.target instanceof HTMLAnchorElement)) return;

          if (event.target.href.startsWith("http")) {
            // only open http links
            event.preventDefault();
            event.stopPropagation();
            await browser.runtime.sendMessage<OpenMessage>({
              action: MessageActions.OPEN,
              url: event.target.href,
            });
          }
        },
        { capture: true }
      );
    }
  },
});
