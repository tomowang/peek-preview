import { ContentScriptContext, ShadowRootContentScriptUi } from "#imports";
import {
  EXT_PARAM_KEY,
  OpenMessage,
  CloseMessage,
  MessageActions,
  OPEN_MODE_STORAGE_KEY,
  CLOSE_MODE_STORAGE_KEY,
  OpenMode,
  CloseMode,
  MESSAGE_CHANNEL,
  WINDOW_MODE_STORAGE_KEY,
  WindowMode,
  TRIGGER_KEY_STORAGE_KEY,
  TriggerKey,
} from "@/utils/const";
import ReactDOM from "react-dom/client";
import PopupWindow from "@/components/PopupWindow";
import "~/assets/main.css";

export default defineContentScript({
  matches: ["*://*/*"],
  cssInjectionMode: "ui",
  async main(ctx: ContentScriptContext) {
    const url = new URL(location.href);
    const params = new URLSearchParams(url.search);

    let ui: null | ShadowRootContentScriptUi<{
      root: ReactDOM.Root;
      wrapper: HTMLDivElement;
    }> = null;

    // cleanup events
    let cleanup = () => {};

    async function mountEvents() {
      // remove old events
      cleanup();

      const unwatchList: Array<() => void> = [];
      cleanup = () => {
        unwatchList.forEach((u) => u());
      };

      const openMode = await storage.getItem<number>(OPEN_MODE_STORAGE_KEY, {
        fallback: OpenMode.BOTH,
      });
      const closeMode = await storage.getItem<number>(CLOSE_MODE_STORAGE_KEY, {
        fallback: CloseMode.BOTH,
      });
      const triggerKey = await storage.getItem<string>(
        TRIGGER_KEY_STORAGE_KEY,
        {
          fallback: TriggerKey.SHIFT,
        }
      );

      // peek preview window
      if (params.has(EXT_PARAM_KEY)) {
        // escape to close
        if (closeMode && closeMode & CloseMode.ESCAPE) {
          const close = async function (event: KeyboardEvent) {
            if (event.key === "Escape") {
              await browser.runtime.sendMessage<CloseMessage>({
                action: MessageActions.CLOSE,
              });
            }
          };
          window.addEventListener("keydown", close);
          unwatchList.push(() => window.removeEventListener("keydown", close));
        }

        // blur to close
        if (closeMode && closeMode & CloseMode.BLUR) {
          const close = async function () {
            await browser.runtime.sendMessage<CloseMessage>({
              action: MessageActions.CLOSE,
            });
          };
          window.addEventListener("blur", close);
          unwatchList.push(() => window.removeEventListener("blur", close));
        }
      } else {
        // open links with shortcut key
        if (openMode && openMode & OpenMode.SHORTCUT_CLICK) {
          const onClick = async (event: MouseEvent) => {
            let triggered = false;
            switch (triggerKey) {
              case TriggerKey.SHIFT:
                triggered = event.shiftKey;
                break;
              case TriggerKey.ALT:
                triggered = event.altKey;
                break;
              case TriggerKey.CTRL:
                triggered = event.ctrlKey;
                break;
              case TriggerKey.META:
                triggered = event.metaKey;
                break;
              default:
                triggered = event.shiftKey;
                break;
            }
            if (!triggered) return;
            ui = await openPopup(event, ctx);
          };
          document.addEventListener("click", onClick, { capture: true });
          unwatchList.push(() =>
            document.removeEventListener("click", onClick, { capture: true })
          );
        }
        // open links with drag
        if (openMode && openMode & OpenMode.DRAG_LINK) {
          const onDragEnd = async (event: DragEvent) => {
            ui = await openPopup(event, ctx);
          };
          document.addEventListener("dragend", onDragEnd, { capture: true });
          unwatchList.push(() =>
            document.removeEventListener("dragend", onDragEnd, {
              capture: true,
            })
          );
        }
      }
    }

    await mountEvents();

    storage.watch<any>(OPEN_MODE_STORAGE_KEY, async () => {
      await mountEvents();
    });
    storage.watch<any>(CLOSE_MODE_STORAGE_KEY, async () => {
      await mountEvents();
    });
    storage.watch<any>(TRIGGER_KEY_STORAGE_KEY, async () => {
      await mountEvents();
    });

    window.addEventListener("message", async (event: MessageEvent) => {
      log("message received: ", event.data);
      if (
        event.data.channel === MESSAGE_CHANNEL &&
        event.data.action === MessageActions.CLOSE_IFRAME_POPUP
      ) {
        await browser.runtime.sendMessage<IFrameMessage>({
          action: MessageActions.CLOSE_IFRAME_POPUP,
          url: event.data.url,
        });
        ui?.remove();
      }
    });
  },
});

async function openPopup(
  event: MouseEvent | DragEvent,
  ctx: ContentScriptContext
) {
  if (!(event.target instanceof HTMLAnchorElement)) return null;
  const href = event.target.href;
  // only open http links
  if (!href || !href.startsWith("http")) return null;

  // prevent default behavior
  event.preventDefault();
  event.stopPropagation();

  const windowMode = await storage.getItem<number>(WINDOW_MODE_STORAGE_KEY, {
    fallback: WindowMode.IFRAME,
  });

  if (windowMode === WindowMode.IFRAME) {
    // open in in-page iframe

    await browser.runtime.sendMessage<IFrameMessage>({
      action: MessageActions.OPEN_IFRAME_POPUP,
      url: href,
    });

    const percentage = await storage.getItem<number>(PERCENTAGE_STORAGE_KEY, {
      fallback: DEFAULT_PERCENTAGE,
    });
    const ui = await createShadowRootUi(ctx, {
      name: "peek-preview-ext",
      position: "modal",
      zIndex: 2147483647, // max z-index
      anchor: "body",
      onMount: (container) => {
        // Don't mount react app directly on <body>
        const wrapper = document.createElement("div");
        container.append(wrapper);

        const root = ReactDOM.createRoot(wrapper);
        root.render(<PopupWindow url={href} size={percentage} />);
        return { root, wrapper };
      },
      onRemove: (elements) => {
        elements?.root.unmount();
        elements?.wrapper.remove();
      },
    });
    ui.mount();
    return ui;
  } else {
    // open in popup window
    await browser.runtime.sendMessage<OpenMessage>({
      action: MessageActions.OPEN,
      url: href,
    });
    return null;
  }
}
