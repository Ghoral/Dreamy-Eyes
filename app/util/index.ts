export const getFirstImageUrl = (images: string): string | null => {
  try {
    const parsed = JSON.parse(images);
    const firstKey = Object.keys(parsed)[0];
    const firstImage = parsed[firstKey]?.[0];

    if (firstImage) {
      return `/product-image/${firstImage}`;
    }
    return null;
  } catch (err) {
    console.error("Invalid image format", err);
    return null;
  }
};
