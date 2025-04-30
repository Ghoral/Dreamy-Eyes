export const getColorFileNameMap = (
  colorImageMap: Record<string, { path: string; relativePath: string }[]>
) => {
  const result: Record<string, string[]> = {};

  for (const [color, files] of Object.entries(colorImageMap)) {
    result[color] = files.map((file) => {
      const parts = file.path.split("/");
      return parts[parts.length - 1];
    });
  }

  return result;
};
