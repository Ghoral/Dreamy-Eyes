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

export const generateUniqueCode = () => {
  const now = Date.now();
  const random = Math.floor(Math.random() * 1000);

  // keep it as a number
  const uniqueNumber = Number(`${now}${random}`);

  // base36 string, max 7 chars
  return uniqueNumber.toString(36).slice(-7);
};
