import { useState, useEffect } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/common/Button";
import { supabaseClient } from "../../service/supabase";
import {
  showCustomToastError,
  showCustomToastSuccess,
} from "../../utils/toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { TrashBinIcon } from "../../icons";

type Color = {
  id: string;
  name: string;
  value: string;
  created_at: string;
};

export default function ColorsForm() {
  const [colors, setColors] = useState<Color[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingColor, setAddingColor] = useState(false);
  const [deletingColorId, setDeletingColorId] = useState<string | null>(null);
  const [newColorValue, setNewColorValue] = useState<string>("#2563eb");
  const [newColorName, setNewColorName] = useState<string>("");

  useEffect(() => {
    fetchColors();
  }, []);

  const fetchColors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabaseClient
        .from("colors")
        .select("id, name, value, created_at")
        .order("name");

      if (error) throw error;
      setColors(data || []);
    } catch (error: any) {
      showCustomToastError(error?.message || error, "Failed to load colors");
    } finally {
      setLoading(false);
    }
  };

  const handleAddColor = async () => {
    if (!newColorName.trim()) {
      showCustomToastError("Color name is required", "Validation Error");
      return;
    }

    // Check if color value already exists
    const colorExists = colors.some(
      (c) => c.value.toLowerCase() === newColorValue.toLowerCase()
    );
    if (colorExists) {
      showCustomToastError("This color already exists", "Validation Error");
      return;
    }

    // Check if color name already exists
    const nameExists = colors.some(
      (c) => c.name.toLowerCase() === newColorName.trim().toLowerCase()
    );
    if (nameExists) {
      showCustomToastError("This color name already exists", "Validation Error");
      return;
    }

    try {
      setAddingColor(true);
      const { error } = await supabaseClient.from("colors").insert({
        name: newColorName.trim(),
        value: newColorValue,
      });

      if (error) throw error;

      showCustomToastSuccess("Color added successfully");
      setNewColorName("");
      setNewColorValue("#2563eb");
      await fetchColors(); // Refresh color list
    } catch (error: any) {
      showCustomToastError(
        error?.message || error,
        "Failed to add color"
      );
    } finally {
      setAddingColor(false);
    }
  };

  const handleDeleteColor = async (id: string) => {
    if (!confirm("Are you sure you want to delete this color?")) {
      return;
    }

    try {
      setDeletingColorId(id);
      const { error } = await supabaseClient.from("colors").delete().eq("id", id);

      if (error) throw error;

      showCustomToastSuccess("Color deleted successfully");
      await fetchColors(); // Refresh color list
    } catch (error: any) {
      showCustomToastError(
        error?.message || error,
        "Failed to delete color"
      );
    } finally {
      setDeletingColorId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add New Color Form */}
      <ComponentCard title="Add New Color" desc="Create a new color for products">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <Label htmlFor="new-color-name">Color Name</Label>
            <Input
              type="text"
              id="new-color-name"
              placeholder="e.g., Red, Blue, Green"
              value={newColorName}
              onChange={(e) => setNewColorName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleAddColor();
                }
              }}
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="new-color-value">Color Value</Label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                id="new-color-value"
                value={newColorValue}
                onChange={(e) => setNewColorValue(e.target.value)}
                className="h-11 w-20 rounded-lg border border-gray-300 dark:border-gray-700 cursor-pointer"
              />
              <Input
                type="text"
                value={newColorValue}
                onChange={(e) => setNewColorValue(e.target.value)}
                placeholder="#2563eb"
                className="flex-1"
              />
            </div>
          </div>
          <Button
            type="button"
            onClick={handleAddColor}
            loading={addingColor}
            disabled={addingColor || !newColorName.trim()}
          >
            Add Color
          </Button>
        </div>
      </ComponentCard>

      {/* Colors List */}
      <ComponentCard title="Colors" desc="Manage existing colors">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading colors...</p>
          </div>
        ) : colors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">No colors found. Add your first color above.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100 dark:border-white/[0.05] dark:from-gray-800/50 dark:to-gray-800/70">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-5 py-4 text-gray-700 font-semibold text-start text-sm dark:text-gray-300 uppercase tracking-wider"
                    >
                      Color
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-4 text-gray-700 font-semibold text-start text-sm dark:text-gray-300 uppercase tracking-wider"
                    >
                      Name
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-4 text-gray-700 font-semibold text-start text-sm dark:text-gray-300 uppercase tracking-wider"
                    >
                      Value
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-4 text-gray-700 font-semibold text-start text-sm dark:text-gray-300 uppercase tracking-wider"
                    >
                      Created At
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-4 text-gray-700 font-semibold text-start text-sm dark:text-gray-300 uppercase tracking-wider"
                    >
                      Action
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-white dark:bg-transparent">
                  {colors.map((color) => (
                    <TableRow
                      key={color.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-all duration-200"
                    >
                      <TableCell className="px-5 py-3 text-start">
                        <div
                          className="w-10 h-10 rounded-full border-2 border-gray-300 dark:border-gray-700"
                          style={{ backgroundColor: color.value }}
                        />
                      </TableCell>
                      <TableCell className="px-5 py-3 text-start">
                        <span className="font-medium text-gray-800 dark:text-gray-200">
                          {color.name}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-3 text-start">
                        <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                          {color.value}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-3 text-start">
                        <span className="text-gray-600 dark:text-gray-400 text-sm">
                          {new Date(color.created_at).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-3 text-start">
                        <button
                          type="button"
                          onClick={() => handleDeleteColor(color.id)}
                          disabled={deletingColorId === color.id}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors disabled:opacity-50"
                          aria-label="Delete color"
                        >
                          {deletingColorId === color.id ? (
                            <span className="inline-block h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <TrashBinIcon className="w-4 h-4" />
                          )}
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </ComponentCard>
    </div>
  );
}

