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

export const getThumbnailUrl = (
  product:
    | { primary_thumbnail?: string | null; images?: string | null }
    | null
    | undefined
): string | null => {
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

// Get user country from metadata (client-side only)
export const getUserCountry = async (): Promise<string | null> => {
  if (typeof window === "undefined") return null;

  try {
    const { createSupabaseClient } = await import(
      "../services/supabase/client/supabaseBrowserClient"
    );
    const supabase = createSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user?.user_metadata?.country) {
      return user.user_metadata.country.toLowerCase();
    }
    return null;
  } catch (error) {
    return null;
  }
};

// Get user country synchronously from session (for use in components)
export const getUserCountrySync = (): string | null => {
  if (typeof window === "undefined") return null;

  try {
    // Try to get from localStorage or sessionStorage if available
    const userStr = localStorage.getItem("sb-user");
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user?.user_metadata?.country) {
        return user.user_metadata.country.toLowerCase();
      }
    }
    return null;
  } catch (error) {
    return null;
  }
};

// Currency conversion rates cache
let exchangeRateCache: {
  rate: number;
  timestamp: number;
} | null = null;

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
const FALLBACK_RATE = 0.625; // Fallback rate if API fails (1 NPR = 0.625 INR)

// Fetch exchange rate from API
export const fetchExchangeRate = async (): Promise<number> => {
  try {
    // Check cache first
    if (
      exchangeRateCache &&
      Date.now() - exchangeRateCache.timestamp < CACHE_DURATION
    ) {
      console.log("Using cached exchange rate:", exchangeRateCache.rate);
      return exchangeRateCache.rate;
    }

    // Fetch from API
    const ExchangeRatesApi = await import("exchange-rates-api");
    console.log("Fetching exchange rate from API...");

    let rates;
    try {
      rates = await ExchangeRatesApi.default({
        baseCurrency: "NPR",
        currencies: ["INR"],
      });
      console.log("Exchange rate API response:", rates);
      console.log("Full response object:", JSON.stringify(rates, null, 2));
    } catch (apiError) {
      console.error("API call failed:", apiError);
      throw apiError; // Re-throw to be caught by outer catch
    }

    const rate = rates?.INR || FALLBACK_RATE;
    console.log("Extracted INR rate:", rate);

    if (!rates?.INR) {
      console.warn("INR rate not found in response, using fallback");
    }

    // Update cache
    exchangeRateCache = {
      rate,
      timestamp: Date.now(),
    };

    console.log("Cached exchange rate:", exchangeRateCache);
    return rate;
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
      fullError: error,
    });
    console.log("Using fallback rate:", FALLBACK_RATE);
    // If API fails, use fallback rate
    return FALLBACK_RATE;
  }
};

// Calculate price based on country
// If country is India, convert from NPR to INR using real-time exchange rate
// If country is Nepal or null, return NPR price
export const calculatePrice = async (
  nprPrice: number,
  country: string | null
): Promise<number> => {
  const countryLower = country?.toLowerCase() || "";

  if (!country || countryLower === "nepal") {
    return nprPrice; // Return NPR price as is
  }

  if (countryLower === "india") {
    const rate = await fetchExchangeRate();
    return nprPrice * rate; // Convert NPR to INR using real-time rate
  }

  // Default to NPR if country is unknown
  return nprPrice;
};

// Synchronous version that uses cached rate (for immediate calculations)
export const calculatePriceSync = (
  nprPrice: number,
  country: string | null
): number => {
  const countryLower = country?.toLowerCase() || "";

  if (!country || countryLower === "nepal") {
    return nprPrice; // Return NPR price as is
  }

  if (countryLower === "india") {
    const rate = exchangeRateCache?.rate || FALLBACK_RATE;
    return nprPrice * rate; // Convert NPR to INR using cached rate
  }

  // Default to NPR if country is unknown
  return nprPrice;
};

// Format price with currency symbol
export const formatPrice = (price: number, country: string | null): string => {
  const countryLower = country?.toLowerCase() || "";
  const currency = countryLower === "india" ? "INR" : "NPR";
  const symbol = currency === "INR" ? "₹" : "Rs";

  // Format with 2 decimal places
  return `${symbol} ${price.toFixed(2)}`;
};

// Format price with currency symbol (for display with calculated price from NPR)
// Uses synchronous calculation for immediate display
export const formatPriceWithCurrency = (
  nprPrice: number,
  country: string | null
): string => {
  const calculatedPrice = calculatePriceSync(nprPrice, country);
  return formatPrice(calculatedPrice, country);
};

// Calculate total price for checkout/modal (with offer support)
export const calculateTotalPrice = (
  items: Array<{ price: number; quantity: number }>,
  country: string | null,
  offer?: { price?: number; discount?: number; discount_value?: number } | null,
  offerProducts?: Array<{ price: number; quantity: number }> | null
): number => {
  let total = 0;

  // Calculate regular items total
  items.forEach((item) => {
    const itemPrice = calculatePrice(item.price, country);
    total += itemPrice * item.quantity;
  });

  // Calculate offer items total if offer exists
  if (offer && offerProducts && offerProducts.length > 0) {
    offerProducts.forEach((item) => {
      let offerPrice = item.price;

      // Apply offer discount
      if (offer.price !== undefined && offer.price !== null) {
        offerPrice = Number(offer.price);
      } else if (offer.discount !== undefined && offer.discount !== null) {
        offerPrice = item.price - Number(offer.discount);
      } else if (
        offer.discount_value !== undefined &&
        offer.discount_value !== null
      ) {
        offerPrice = item.price - Number(offer.discount_value);
      }

      const calculatedOfferPrice = calculatePrice(offerPrice, country);
      total += calculatedOfferPrice * item.quantity;
    });
  }

  return total;
};
