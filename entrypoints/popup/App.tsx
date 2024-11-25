import { useState } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { OpenMode, OPEN_MODE_STORAGE_KEY, CloseMode } from "@/utils/const";
import logo from "/icon/48.png";
import GitHubLogo from "/github.svg";

function App() {
  const [openMode, setOpenMode] = useState(OpenMode.BOTH);
  const [closeMode, setCloseMode] = useState(CloseMode.BOTH);
  const [percent, setPercent] = useState(DEFAULT_PERCENTAGE);

  const t = browser.i18n.getMessage;

  useEffect(() => {
    storage.getItem<number>(OPEN_MODE_STORAGE_KEY).then((mode) => {
      if (mode) setOpenMode(mode);
    });
    storage.getItem<number>(CLOSE_MODE_STORAGE_KEY).then((mode) => {
      if (mode) setCloseMode(mode);
    });
    storage.getItem<number>(PERCENTAGE_STORAGE_KEY).then((value) => {
      if (value) setPercent(value);
    });
  });

  async function handleChangeOpenMode(value: string) {
    const v = parseInt(value);
    await storage.setItem<number>(OPEN_MODE_STORAGE_KEY, v);
    setOpenMode(v);
  }

  async function handleChangeCloseMode(value: string) {
    const v = parseInt(value);
    await storage.setItem<number>(CLOSE_MODE_STORAGE_KEY, v);
    setCloseMode(v);
  }

  return (
    <div className="w-64">
      <nav className="w-full flex flex-row items-center gap-1 p-2 border-b-2 border-orange-500">
        <img src={logo} alt={t("popupTitle")} className="w-6 h-6" />
        <h1 className="text-base">{t("popupTitle")}</h1>
        <div className="flex-1"></div>
        <a href="https://github.com/tomowang/peek-preview" target="_blank">
          <img src={GitHubLogo} alt="GitHub" className="w-6 h-6" />
        </a>
      </nav>
      <div className="p-2 flex flex-col space-y-3">
        <div className="space-y-3">
          <div>
            <Label>{t("openModeTitle")}</Label>
            <p className="text-sm text-gray-500">{t("openModeDesc")}</p>
          </div>
          <RadioGroup
            value={openMode.toString()}
            onValueChange={handleChangeOpenMode}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value={OpenMode.SHIFT_CLICK.toString()}
                id="open-shift-click"
              />
              <Label htmlFor="open-shift-click">
                {t("openModeShiftClick")}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value={OpenMode.DRAG_LINK.toString()}
                id="open-drag-link"
              />
              <Label htmlFor="open-drag-link">{t("openModeDragLink")}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={OpenMode.BOTH.toString()} id="open-both" />
              <Label htmlFor="open-both">{t("openModeBoth")}</Label>
            </div>
          </RadioGroup>
        </div>
        <div className="space-y-3">
          <Label>{t("closeModeTitle")}</Label>
          <RadioGroup
            value={closeMode.toString()}
            onValueChange={handleChangeCloseMode}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value={CloseMode.ESCAPE.toString()}
                id="close-escape"
              />
              <Label htmlFor="close-escape">{t("closeModeEsc")}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value={CloseMode.BLUR.toString()}
                id="close-blur"
              />
              <Label htmlFor="close-blur">{t("closeModeBlur")}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value={CloseMode.BOTH.toString()}
                id="close-both"
              />
              <Label htmlFor="close-both">{t("closeModeBoth")}</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <Label>{t("popupSizeTitle")}</Label>
          <div className="flex flex-row items-center space-x-2">
            <div>{percent}%</div>
            <Slider
              value={[percent]}
              min={50}
              max={100}
              step={1}
              onValueChange={async (value) => {
                await storage.setItem<number>(PERCENTAGE_STORAGE_KEY, value[0]);
                setPercent(value[0]);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
