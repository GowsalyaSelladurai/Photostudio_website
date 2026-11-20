
"use client";

import type {
  AlbumTextElement,
  AlbumTextFontFamily,
  AlbumTextWeight,
  AlbumTextAlignment,
} from "@/types/album";

type AlbumTextControlsProps = {
  texts: AlbumTextElement[];
  selectedTextId: string | null;
  onSelectText: (id: string | null) => void;
  onAddText: () => void;
  onUpdateText: (
    id: string,
    updates: Partial<AlbumTextElement>
  ) => void;
  onDeleteText: (id: string) => void;
};

const fontOptions: {
  label: string;
  value: AlbumTextFontFamily;
}[] = [
  { label: "Serif", value: "serif" },
  { label: "Sans Serif", value: "sans" },
  { label: "Elegant", value: "elegant" },
];

const colorOptions = [
  { label: "Charcoal", value: "#292522" },
  { label: "Black", value: "#171717" },
  { label: "White", value: "#FFFFFF" },
  { label: "Gold", value: "#B99B70" },
  { label: "Brown", value: "#795548" },
];

export function AlbumTextControls({
  texts,
  selectedTextId,
  onSelectText,
  onAddText,
  onUpdateText,
  onDeleteText,
}: AlbumTextControlsProps) {
  const selectedText =
    texts.find((item) => item.id === selectedTextId) ?? null;

  const updateSelected = (
    updates: Partial<AlbumTextElement>
  ) => {
    if (!selectedText) return;

    onUpdateText(selectedText.id, updates);
  };

  return (
    <section className="rounded-xl border border-[#e8dfd2] bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[#292522]">
            Text & Captions
          </h3>
          <p className="mt-1 text-xs text-[#8b8175]">
            Add headings and captions to your page.
          </p>
        </div>

        <button
          type="button"
          onClick={onAddText}
          className="rounded-lg bg-[#292522] px-3 py-2 text-xs font-medium text-white transition hover:bg-[#B99B70]"
        >
          + Add Text
        </button>
      </div>

      {texts.length > 0 && (
        <div className="mb-4 space-y-2">
          <p className="text-xs font-medium text-[#796f63]">
            Page Text Elements
          </p>

          {texts.map((item, index) => (
            <div
              key={item.id}
              className={`flex items-center gap-2 rounded-lg border p-2 ${
                selectedTextId === item.id
                  ? "border-[#B99B70] bg-[#faf7f1]"
                  : "border-[#eee8df]"
              }`}
            >
              <button
                type="button"
                onClick={() => onSelectText(item.id)}
                className="min-w-0 flex-1 truncate text-left text-sm text-[#292522]"
              >
                {item.text || `Text element ${index + 1}`}
              </button>

              <button
                type="button"
                onClick={() => onDeleteText(item.id)}
                aria-label="Delete text"
                className="rounded-md px-2 py-1 text-xs text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {!selectedText && (
        <p className="rounded-lg bg-[#faf8f4] p-3 text-xs leading-5 text-[#81776b]">
          Select a text element or add a new one to edit its appearance.
        </p>
      )}

      {selectedText && (
        <div className="space-y-4 border-t border-[#eee8df] pt-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#665d53]">
              Text Content
            </label>

            <textarea
              value={selectedText.text}
              onChange={(event) =>
                updateSelected({ text: event.target.value })
              }
              rows={3}
              placeholder="Enter your heading or caption..."
              className="w-full resize-y rounded-lg border border-[#e5ddd2] bg-white p-3 text-sm text-[#292522] outline-none focus:border-[#B99B70]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#665d53]">
              Font Family
            </label>

            <div className="grid grid-cols-3 gap-2">
              {fontOptions.map((font) => (
                <button
                  key={font.value}
                  type="button"
                  onClick={() =>
                    updateSelected({ fontFamily: font.value })
                  }
                  className={`rounded-lg border px-2 py-2 text-xs ${
                    (selectedText.fontFamily ?? "serif") === font.value
                      ? "border-[#B99B70] bg-[#faf5ed] text-[#292522]"
                      : "border-[#e8dfd2] text-[#796f63]"
                  }`}
                >
                  {font.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-medium text-[#665d53]">
                Font Size
              </label>

              <span className="text-xs text-[#8b8175]">
                {selectedText.fontSize}px
              </span>
            </div>

            <input
              type="range"
              min={10}
              max={72}
              step={1}
              value={selectedText.fontSize}
              onChange={(event) =>
                updateSelected({
                  fontSize: Number(event.target.value),
                })
              }
              className="w-full accent-[#B99B70]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#665d53]">
              Text Color
            </label>

            <div className="flex flex-wrap gap-3">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  title={color.label}
                  aria-label={color.label}
                  onClick={() =>
                    updateSelected({ color: color.value })
                  }
                  className={`h-8 w-8 rounded-full border-2 ${
                    (selectedText.color ?? "#292522") === color.value
                      ? "border-[#B99B70] ring-2 ring-[#B99B70]/30"
                      : "border-[#e5ddd2]"
                  }`}
                  style={{ backgroundColor: color.value }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#665d53]">
              Text Alignment
            </label>

            <div className="grid grid-cols-3 gap-2">
              {(
                ["left", "center", "right"] as AlbumTextAlignment[]
              ).map((alignment) => (
                <button
                  key={alignment}
                  type="button"
                  onClick={() =>
                    updateSelected({ textAlign: alignment })
                  }
                  className={`rounded-lg border px-2 py-2 text-xs capitalize ${
                    (selectedText.textAlign ?? "center") === alignment
                      ? "border-[#B99B70] bg-[#faf5ed]"
                      : "border-[#e8dfd2]"
                  }`}
                >
                  {alignment}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#665d53]">
                Font Weight
              </label>

              <select
                value={selectedText.fontWeight ?? "normal"}
                onChange={(event) =>
                  updateSelected({
                    fontWeight: event.target.value as AlbumTextWeight,
                  })
                }
                className="w-full rounded-lg border border-[#e5ddd2] bg-white p-2 text-xs outline-none focus:border-[#B99B70]"
              >
                <option value="normal">Regular</option>
                <option value="bold">Bold</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#665d53]">
                Italic
              </label>

              <button
                type="button"
                onClick={() =>
                  updateSelected({
                    italic: !selectedText.italic,
                  })
                }
                className={`w-full rounded-lg border p-2 text-xs italic ${
                  selectedText.italic
                    ? "border-[#B99B70] bg-[#faf5ed]"
                    : "border-[#e5ddd2]"
                }`}
              >
                {selectedText.italic ? "Enabled" : "Disabled"}
              </button>
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-medium text-[#665d53]">
                Rotation
              </label>

              <span className="text-xs text-[#8b8175]">
                {selectedText.rotation}°
              </span>
            </div>

            <input
              type="range"
              min={-30}
              max={30}
              step={1}
              value={selectedText.rotation}
              onChange={(event) =>
                updateSelected({
                  rotation: Number(event.target.value),
                })
              }
              className="w-full accent-[#B99B70]"
            />
          </div>
        </div>
      )}
    </section>
  );
}
