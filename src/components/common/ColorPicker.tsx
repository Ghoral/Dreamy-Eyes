import { useState, useEffect } from "react";
import { supabaseClient } from "../../service/supabase";

interface MultiColorSelectorProps {
  dbColors: any[];
  isLoading: boolean;
  values: string[];
  disabled: boolean;
  onChange: (colors: string[]) => void;
  label?: string;
  setSelectedColor: any;
  selectedColor?: string | null;
  onColorSelectedLabel?: (name: string) => void;
}

const MultiColorSelector = ({
  dbColors = [],
  isLoading = true,
  selectedColor,
  values = [],
  onChange,
  setSelectedColor,
  label = "Colors",
  onColorSelectedLabel,
}: MultiColorSelectorProps) => {
  const [currentColor] = useState<string>("#2563eb");

  const handleAddColor = (colorValue?: string) => {
    const colorToAdd = colorValue || currentColor;
    // Don't add duplicate colors
    if (!values.includes(colorToAdd)) {
      const newColors = [...values, colorToAdd];
      onChange(newColors);
    }
  };

  return (
    <div className="my-6">
      <label className="block text-sm font-medium mb-2 dark:text-white">
        {label}
      </label>

      <div className="flex flex-col gap-2">
        {isLoading ? (
          <div className="flex items-center gap-3">
            <div className="p-1 h-10 w-14 block bg-white border border-gray-200 rounded-lg dark:bg-neutral-900 dark:border-neutral-700 animate-pulse" />
            <div className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          </div>
        ) : (
          <>
            {/* Database colors selector only */}
            <div className="flex flex-wrap gap-4 mt-1">
              {dbColors.map((color) => {
                const isSelected = selectedColor === color.value;
                const isAlreadySelected = values.includes(color.value);

                return (
                  <button
                    key={color.id}
                    type="button"
                    title={`${color.name} (${color.value})`}
                    className={`relative w-8 h-8 rounded-full border mt-1 ${
                      isSelected ? "ring-2 ring-blue-500" : ""
                    }`}
                    style={{
                      backgroundColor: color.value,
                      borderColor: "rgba(0,0,0,0.1)",
                    }}
                    onClick={() => {
                      if (!isAlreadySelected) {
                        handleAddColor(color.value);
                      }
                      // Always focus/select this color for quantity/images, without unselecting
                      setSelectedColor(color.value);
                      if (onColorSelectedLabel) {
                        onColorSelectedLabel(color.name);
                      }
                    }}
                  >
                    {isAlreadySelected && (
                      <button
                        type="button"
                        aria-label={`Unselect ${color.name}`}
                        className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-white text-gray-600 flex items-center justify-center shadow hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          const newColors = values.filter(
                            (c: string) => c !== color.value
                          );
                          onChange(newColors);
                          if (selectedColor === color.value) {
                            setSelectedColor(
                              newColors.length > 0 ? newColors[0] : ""
                            );
                          }
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-3 h-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2.5"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected color chips */}
            {values.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {values.map((color) => {
                  const chip = dbColors.find((c) => c.value === color);
                  const name = chip?.name || color;
                  return (
                    <span
                      key={color}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs dark:bg-white/10 dark:text-white/80"
                    >
                      {name}
                    </span>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MultiColorSelector;
