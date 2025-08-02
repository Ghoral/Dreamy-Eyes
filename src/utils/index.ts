export const getColorFileNameMap = (
  colorImageMap: Record<string, { path: string; relativePath: string }[]>
) => {
  try {
    const result: Record<string, string[]> = {};

    for (const [color, files] of Object.entries(colorImageMap)) {
      result[color] = files.map((file: any) => {
        return file.name;
      });
    }

    return result;
  } catch (error: any) {
    throw new Error(error);
  }
};
