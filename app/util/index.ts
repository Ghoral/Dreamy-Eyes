// Helper function to get Supabase public bucket URL for product images
export const getProductImageUrl = (filename: string): string => {
  if (!filename) return "";
  
  // If it's already a full URL, return as is
  if (filename.startsWith("http://") || filename.startsWith("https://")) {
    return filename;
  }
  
  // Construct Supabase public bucket URL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl) {
    return `${supabaseUrl}/storage/v1/object/public/product-image/${filename}`;
  }
  
  // Fallback to NEXT_PUBLIC_IMAGE_URL if available (for backward compatibility)
  if (process.env.NEXT_PUBLIC_IMAGE_URL) {
    return `${process.env.NEXT_PUBLIC_IMAGE_URL}/product-image/${filename}`;
  }
  
  // Last resort fallback
  return `/product-image/${filename}`;
};

export const getFirstImageUrl = (images: string): string | null => {
  try {
    const parsed = JSON.parse(images);
    const firstKey = Object.keys(parsed)[0];
    const firstImage = parsed[firstKey]?.[0];

    if (firstImage) {
      return getProductImageUrl(firstImage);
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
    return getProductImageUrl(product.primary_thumbnail);
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
