export const getColorFileNameMap = (
  colorImageMap: Record<
    string,
    ({ path: string; relativePath: string; name?: string } | string)[]
  >
) => {
  try {
    const result: Record<string, string[]> = {};

    for (const [color, files] of Object.entries(colorImageMap)) {
      result[color] = files
        .map((file) => {
          if (typeof file === "string") {
            // skip if it's a URL
            if (file.startsWith("http")) return "";
            return file;
          }
          if (file?.name) {
            return file.name;
          }
          if (file?.path) {
            return file.path;
          }
          return "";
        })
        .filter(Boolean); // remove empty entries
    }

    return result;
  } catch (error: any) {
    throw new Error(error.message || "Error in getColorFileNameMap");
  }
};

export const formatSpecifications = (obj: Record<string, string>) => {
  return {
    specifications: Object.entries(obj).map(([key, value]) => ({
      label: key,
      value: value,
    })),
  };
};

export function toCamelCase(str: string) {
  if (!str) return "-";
  return str
    .toString()
    .split("_") // split by underscores
    .filter(Boolean) // remove empty strings
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // capitalize each word
    .join(" ");
}
