import { ContentScriptContext } from "wxt/client";
import {
  EXT_PARAM_KEY,
  OpenMessage,
  CloseMessage,
  MessageActions,
  OPEN_MODE_STORAGE_KEY,
  CLOSE_MODE_STORAGE_KEY,
  OpenMode,
  CloseMode,
} from "@/utils/const";

export default defineContentScript({
  matches: ["*://*/*"],
  async main(ctx: ContentScriptContext) {
    const url = new URL(location.href);
    const params = new URLSearchParams(url.search);

    const openMode = await storage.getItem<number>(OPEN_MODE_STORAGE_KEY, {
      fallback: OpenMode.BOTH,
    });
    const closeMode = await storage.getItem<number>(CLOSE_MODE_STORAGE_KEY, {
      fallback: CloseMode.BOTH,
    });

    // peek preview window
    if (params.has(EXT_PARAM_KEY)) {
      // escape to close
      if (closeMode && closeMode & CloseMode.ESCAPE) {
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
      }

      // blur to close
      if (closeMode && closeMode & CloseMode.BLUR) {
        ctx.addEventListener(window, "blur", async function close() {
          await browser.runtime.sendMessage<CloseMessage>({
            action: MessageActions.CLOSE,
          });
        });
      }
    } else {
      // open links with shift key
      if (openMode && openMode & OpenMode.SHIFT_CLICK) {
        ctx.addEventListener(
          document,
          "click",
          async (event) => {
            if (!event.shiftKey) return;

            await openPopup(event);
          },
          { capture: true }
        );
      }
      // open links with drag
      if (openMode && openMode & OpenMode.DRAG_LINK) {
        ctx.addEventListener(
          document,
          "dragend",
          async (event) => {
            await openPopup(event);
          },
          { capture: true }
        );
      }
    }
  },
});

async function openPopup(event: MouseEvent) {
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
}
