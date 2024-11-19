import { useState } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { OpenMode, OPEN_MODE_STORAGE_KEY } from "@/utils/const";

function App() {
  const [openMode, setOpenMode] = useState(OpenMode.BOTH);

  useEffect(() => {
    storage.getItem<number>(OPEN_MODE_STORAGE_KEY).then((mode) => {
      if (mode) setOpenMode(mode);
    });
  });

  async function handleChangeOpenMode(value: string) {
    const v = parseInt(value);
    await storage.setItem<number>(OPEN_MODE_STORAGE_KEY, v);
    setOpenMode(v);
  }

  return (
    <>
      <div className="w-64 p-2">
        <div className="space-y-3">
          <Label>Peek Preview Method</Label>
          <RadioGroup
            value={openMode.toString()}
            onValueChange={handleChangeOpenMode}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value={OpenMode.SHIFT_CLICK.toString()}
                id="open-shift-click"
              />
              <Label htmlFor="open-shift-click">Shift⇧ Click</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value={OpenMode.DRAG_LINK.toString()}
                id="open-drag-link"
              />
              <Label htmlFor="open-drag-link">Drag Link</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={OpenMode.BOTH.toString()} id="open-both" />
              <Label htmlFor="open-both">Both</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </>
  );
}

export default App;
