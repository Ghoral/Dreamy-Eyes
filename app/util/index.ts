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

export const getThumbnailUrl = (product: { primary_thumbnail?: string | null; images?: string | null } | null | undefined): string | null => {
  // Check if product exists
  if (!product) return null;
  
  // First check if primary_thumbnail exists and is not null/empty
  if (product.primary_thumbnail) {
    return `/product-image/${product.primary_thumbnail}`;
  }
  
  // Fall back to the first image from images JSON if primary_thumbnail is not available
  if (product.images) {
    return getFirstImageUrl(product.images);
  }
  
  return null;
};

export const generateUniqueCode = () => {
  const now = Date.now();
  const random = Math.floor(Math.random() * 1000);

  // keep it as a number
  const uniqueNumber = Number(`${now}${random}`);

  // base36 string, max 7 chars
  return uniqueNumber.toString(36).slice(-7);
};
