import { useState, useEffect } from "react";
import Button from "./Button";
import { supabaseClient } from "../../service/supabase";

interface MultiColorSelectorProps {
  values: string[];
  disabled: boolean;
  onChange: (colors: string[]) => void;
  label?: string;
  setSelectedColor: any;
  selectedColor?: string | null;
}

const MultiColorSelector = ({
  selectedColor,
  values = [],
  onChange,
  setSelectedColor,
  label = "Colors",
}: MultiColorSelectorProps) => {
  const [currentColor, setCurrentColor] = useState<string>("#2563eb");
  const [dbColors, setDbColors] = useState<
    { id: string; name: string; value: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchColors();
  }, []);

  const fetchColors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabaseClient
        .from("colors")
        .select("id, name, value")
        .order("name");

      if (error) throw error;
      setDbColors(data || []);
    } catch (error) {
      console.error("Error fetching colors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddColor = (colorValue?: string) => {
    const colorToAdd = colorValue || currentColor;
    // Don't add duplicate colors
    if (!values.includes(colorToAdd)) {
      const newColors = [...values, colorToAdd];
      onChange(newColors);
    }
  };

  const handleRemoveColor = (indexToRemove: number) => {
    const newColors = values.filter((_, index) => index !== indexToRemove);
    onChange(newColors);
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium mb-2 dark:text-white">
        {label}
      </label>

      <div className="flex flex-col gap-4">
        {/* Color input with add button */}
        <div className="flex items-center gap-3">
          <input
            type="color"
            className="p-1 h-10 w-14 block bg-white border border-gray-200 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700"
            value={currentColor}
            title="Choose a color"
            onChange={(e) => setCurrentColor(e.target.value)}
          />
          <Button onClick={() => handleAddColor()} />
        </div>

        {loading ? (
          <div className="flex items-center gap-3">
            <div className="p-1 h-10 w-14 block bg-white border border-gray-200 rounded-lg dark:bg-neutral-900 dark:border-neutral-700 animate-pulse" />
            <div className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          </div>
        ) : (
          <>
            {/* Database colors selector */}
            <div className="flex flex-wrap gap-2">
              {dbColors.map((color) => {
                const isSelected = selectedColor === color.value;
                const isAlreadySelected = values.includes(color.value);

                return (
                  <div
                    key={color.id}
                    className={`relative inline-block rounded-full p-[2px] ${
                      isSelected ? "ring-2 ring-blue-500" : ""
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 cursor-pointer"
                      style={{ backgroundColor: color.value }}
                      title={`${color.name} (${color.value})`}
                      onClick={() => {
                        if (!isAlreadySelected) {
                          handleAddColor(color.value);
                        }
                        setSelectedColor(color.value);
                      }}
                    />
                    {isAlreadySelected && (
                      <button
                        type="button"
                        onClick={() => {
                          const newColors = values.filter(
                            (c: string) => c !== color.value
                          );
                          onChange(newColors);
                          // If we're removing the selected color, select the first one or reset
                          if (selectedColor === color.value) {
                            setSelectedColor(
                              newColors.length > 0 ? newColors[0] : ""
                            );
                          }
                        }}
                        className="absolute -top-1 -right-1 bg-white dark:bg-gray-800 rounded-full w-4 h-4 flex items-center justify-center shadow-sm hover:bg-red-100 transition-colors"
                        aria-label={`Remove ${color.name} color`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3 text-gray-500 hover:text-red-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Selected colors display */}
            {values.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {values.map((color, index) => {
                  const isSelected = selectedColor === color;

                  return (
                    <div
                      key={`${color}-${index}`}
                      className={`relative inline-block rounded-full p-[2px] ${
                        isSelected ? "ring-2 ring-blue-500" : ""
                      }`}
                      onClick={() => setSelectedColor(color)}
                    >
                      <div
                        className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveColor(index);
                        }}
                        className="absolute -top-1 -right-1 bg-white dark:bg-gray-800 rounded-full w-4 h-4 flex items-center justify-center shadow-sm hover:bg-red-100 transition-colors"
                        aria-label="Remove color"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3 text-gray-500 hover:text-red-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
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
