import { MESSAGE_CHANNEL, MessageActions } from "@/utils/const";
import { cn } from "@/utils/index";
import { CircleX } from "lucide-react";

export default function PopupWindow({
  url,
  size,
  className,
}: {
  url: string;
  size: number;
  className?: string;
}) {
  let overflow = ""; // to store the previous overflow value
  useEffect(() => {
    overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closePopup();
      }
    }

    window.addEventListener("keydown", handleKeydown);
    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  });
  function closePopup() {
    if (overflow) {
      document.body.style.overflow = overflow;
    } else {
      document.body.style.removeProperty("overflow");
    }
    window.postMessage(
      {
        action: MessageActions.CLOSE_IFRAME_POPUP,
        channel: MESSAGE_CHANNEL,
        url,
      },
      "*"
    );
  }
  return (
    <>
      <div
        className={cn(
          "fixed inset-0 w-screen h-screen bg-gray-900 bg-opacity-60 flex items-center justify-center overflow-hidden z-[2147483647]",
          className
        )}
      >
        <div
          className="relative"
          style={{ width: `${size}%`, height: `${size}%` }}
        >
          <div className="flex justify-end px-2 absolute top-0 right-[-3em]">
            <CircleX
              className="w-8 h-8 cursor-pointer text-white"
              onClick={closePopup}
            />
          </div>
          <iframe
            src={url}
            className="w-full h-full shadow-md rounded-md overflow-auto bg-white"
          />
        </div>
      </div>
    </>
  );
}
