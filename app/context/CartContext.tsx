"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
  useState,
} from "react";

export interface CartItem {
  id: string | number;
  title: string;
  description?: string;
  price: number;
  quantity: number;
  color?: string;
  colorHex?: string;
  image?: string;
  maxQuantity?: number;
  primary_thumbnail?: string;
  productImages?: string; // Store full product images JSON
}

export interface Offer {
  id: number;
  title?: string;
  name?: string;
  description?: string;
  discount_type?: string;
  discount_value?: number;
  discount?: number; // New field: discount amount/percentage
  price?: number; // New field: fixed price for offer items
  minimum_quantity?: number;
  minimum_value?: number;
  value?: string | number;
  quantity?: string | number;
  is_enabled?: boolean;
  [key: string]: any;
}

interface CartState {
  items: CartItem[]; // Kept for backward compatibility, will be computed from normalItems + offerItems
  normalItems: CartItem[]; // Regular cart items
  offerItems: CartItem[]; // Items under active offer
  totalItems: number; // Total quantity across all items
  itemCount: number; // Number of unique items
  totalPrice: number;
  selectedOffer?: Offer | null;
  offerSelectedProducts?: CartItem[]; // Kept for backward compatibility
}

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: { id: string | number; color?: string } }
  | {
      type: "UPDATE_QUANTITY";
      payload: { id: string | number; color?: string; quantity: number };
    }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; payload: CartState }
  | {
      type: "SET_OFFER";
      payload: { offer: Offer | null; selectedProducts: CartItem[] };
    };

const initialState: CartState = {
  items: [],
  normalItems: [],
  offerItems: [],
  totalItems: 0,
  itemCount: 0,
  totalPrice: 0,
  selectedOffer: null,
  offerSelectedProducts: [],
};

// Helper function to calculate offer price based on discount type
const calculateOfferPrice = (
  originalPrice: number,
  offer: Offer | null
): number => {
  if (!offer) return originalPrice;

  // Check if offer name/title suggests "free" (Buy X Get Y Free)
  const offerName = (offer.title || offer.name || "").toLowerCase();
  const isFreeOffer =
    offerName.includes("free") ||
    (offerName.includes("get") && offerName.includes("free"));

  // If offer has a fixed price, use that directly (including 0 for free items)
  if (offer.price !== undefined && offer.price !== null) {
    return Number(offer.price);
  }

  // If it's a "free" offer and no price/discount is set, make it free
  if (
    isFreeOffer &&
    (offer.discount === undefined || offer.discount === null) &&
    (offer.discount_value === undefined || offer.discount_value === null)
  ) {
    return 0;
  }

  // If offer has discount field, use that
  if (offer.discount !== undefined && offer.discount !== null) {
    const discountType = offer.discount_type;
    const discountValue = offer.discount;

    if (!discountType) {
      // If no discount type specified, assume percentage
      const percentageDiscount = (originalPrice * discountValue) / 100;
      return Math.max(0, originalPrice - percentageDiscount);
    }

    switch (discountType.toLowerCase()) {
      case "percentage":
      case "percent":
        // Percentage discount: reduce by X%
        const percentageDiscount = (originalPrice * discountValue) / 100;
        return Math.max(0, originalPrice - percentageDiscount);

      case "fixed":
      case "amount":
        // Fixed amount discount: reduce by fixed amount
        return Math.max(0, originalPrice - discountValue);

      case "free":
      case "zero":
        // Free item: price is 0
        return 0;

      default:
        // Unknown discount type, assume percentage
        const defaultPercentageDiscount = (originalPrice * discountValue) / 100;
        return Math.max(0, originalPrice - defaultPercentageDiscount);
    }
  }

  // Fallback to old discount_value field for backward compatibility
  const discountType = offer.discount_type;
  const discountValue = offer.discount_value;

  if (!discountType || discountValue === undefined || discountValue === null) {
    return originalPrice; // No discount, return original price
  }

  switch (discountType.toLowerCase()) {
    case "percentage":
    case "percent":
      // Percentage discount: reduce by X%
      const percentageDiscount = (originalPrice * discountValue) / 100;
      return Math.max(0, originalPrice - percentageDiscount);

    case "fixed":
    case "amount":
      // Fixed amount discount: reduce by fixed amount
      return Math.max(0, originalPrice - discountValue);

    case "free":
    case "zero":
      // Free item: price is 0
      return 0;

    default:
      // Unknown discount type, return original price
      return originalPrice;
  }
};

// Helper function to get total cart items count (normalItems + offerItems)
const getTotalCartItems = (
  normalItems: CartItem[],
  offerItems: CartItem[]
): number => {
  const normalTotal = normalItems.reduce((sum, item) => sum + item.quantity, 0);
  const offerTotal = offerItems.reduce((sum, item) => sum + item.quantity, 0);
  return normalTotal + offerTotal;
};

// Helper function to check if offer is active
const isOfferActive = (
  normalItems: CartItem[],
  offerItems: CartItem[],
  offer: Offer | null
): boolean => {
  if (!offer) return false;
  const offerValue =
    offer.value !== undefined && offer.value !== null ? Number(offer.value) : 0;
  if (offerValue === 0) return false;

  const totalItems = getTotalCartItems(normalItems, offerItems);
  return totalItems > offerValue;
};

// Helper function to get total offer items quantity
const getTotalOfferItemsQuantity = (offerItems: CartItem[]): number => {
  return offerItems.reduce((sum, item) => sum + item.quantity, 0);
};

// Helper function to merge items arrays (for backward compatibility)
const mergeItems = (
  normalItems: CartItem[],
  offerItems: CartItem[]
): CartItem[] => {
  const itemMap = new Map<string, CartItem>();

  // Add normal items
  normalItems.forEach((item) => {
    const key = `${item.id}-${item.color || ""}`;
    itemMap.set(key, { ...item });
  });

  // Merge offer items (combine quantities if same item exists in both)
  offerItems.forEach((item) => {
    const key = `${item.id}-${item.color || ""}`;
    const existing = itemMap.get(key);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      itemMap.set(key, { ...item });
    }
  });

  return Array.from(itemMap.values());
};

// Helper function to calculate total price with offer discounts applied
const calculateTotalPriceWithOffer = (
  normalItems: CartItem[],
  offerItems: CartItem[],
  offer: Offer | null
): number => {
  // Calculate normal items total (regular price)
  const normalTotal = normalItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Calculate offer items total (with offer discount)
  const offerTotal = offerItems.reduce((sum, item) => {
    const offerPrice = offer
      ? calculateOfferPrice(item.price, offer)
      : item.price;
    return sum + offerPrice * item.quantity;
  }, 0);

  return normalTotal + offerTotal;
};

// Helper function to add item to array handling duplicates
const addItemToArray = (array: CartItem[], item: CartItem) => {
  const existingIndex = array.findIndex(
    (i) => i.id === item.id && i.color === item.color
  );
  if (existingIndex >= 0) {
    array[existingIndex].quantity += item.quantity;
  } else {
    array.push({ ...item });
  }
};

// Helper function to reorganize cart items based on offer rules
const reorganizeCart = (
  normalItems: CartItem[],
  offerItems: CartItem[],
  offer: Offer | null
): { normalItems: CartItem[]; offerItems: CartItem[] } => {
  // Merge all items first to get a clean state
  const allItems = mergeItems(normalItems, offerItems);

  if (!offer) {
    return { normalItems: allItems, offerItems: [] };
  }

  const offerValue =
    offer.value !== undefined && offer.value !== null ? Number(offer.value) : 0;
  const offerQuantity =
    offer.quantity !== undefined && offer.quantity !== null
      ? Number(offer.quantity)
      : 0;
  
  const totalCartItems = allItems.reduce((sum, item) => sum + item.quantity, 0);

  // If offer is not active (threshold not met) or invalid, everything is normal
  // Note: condition is total > offerValue because we need to buy X first
  if (offerValue <= 0 || offerQuantity <= 0 || totalCartItems <= offerValue) {
    return { normalItems: allItems, offerItems: [] };
  }

  const newNormalItems: CartItem[] = [];
  const newOfferItems: CartItem[] = [];
  let currentNormalQty = 0;
  let currentOfferQty = 0;

  // Distribute items
  allItems.forEach((item) => {
    let remaining = item.quantity;

    // 1. Fill Buy Requirement (Normal)
    if (currentNormalQty < offerValue) {
      const needed = offerValue - currentNormalQty;
      const take = Math.min(remaining, needed);
      if (take > 0) {
        addItemToArray(newNormalItems, { ...item, quantity: take });
        currentNormalQty += take;
        remaining -= take;
      }
    }

    // 2. Fill Benefit (Offer)
    if (remaining > 0 && currentOfferQty < offerQuantity) {
      const space = offerQuantity - currentOfferQty;
      const take = Math.min(remaining, space);
      if (take > 0) {
        addItemToArray(newOfferItems, { ...item, quantity: take });
        currentOfferQty += take;
        remaining -= take;
      }
    }

    // 3. Overflow (Normal)
    if (remaining > 0) {
      addItemToArray(newNormalItems, { ...item, quantity: remaining });
      currentNormalQty += remaining;
    }
  });

  return { normalItems: newNormalItems, offerItems: newOfferItems };
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      // Add item to normal items first, then reorganize
      let newNormalItems = [...state.normalItems];
      let newOfferItems = [...state.offerItems];
      
      // Check if it exists in normal items
      const normalIndex = newNormalItems.findIndex(
        (item) => item.id === action.payload.id && item.color === action.payload.color
      );
      
      if (normalIndex >= 0) {
        newNormalItems[normalIndex] = {
          ...newNormalItems[normalIndex],
          quantity: newNormalItems[normalIndex].quantity + action.payload.quantity
        };
      } else {
        // Check if it exists in offer items (to merge correctly before reorganize)
        const offerIndex = newOfferItems.findIndex(
           (item) => item.id === action.payload.id && item.color === action.payload.color
        );
        if (offerIndex >= 0) {
             newOfferItems[offerIndex] = {
                 ...newOfferItems[offerIndex],
                 quantity: newOfferItems[offerIndex].quantity + action.payload.quantity
             };
        } else {
             newNormalItems.push(action.payload);
        }
      }

      // Reorganize based on offer
      const reorganized = reorganizeCart(newNormalItems, newOfferItems, state.selectedOffer || null);
      
      const mergedItems = mergeItems(reorganized.normalItems, reorganized.offerItems);
      const totalItems = getTotalCartItems(reorganized.normalItems, reorganized.offerItems);
      const totalPrice = calculateTotalPriceWithOffer(
        reorganized.normalItems,
        reorganized.offerItems,
        state.selectedOffer || null
      );

      return {
        ...state,
        items: mergedItems,
        normalItems: reorganized.normalItems,
        offerItems: reorganized.offerItems,
        totalItems,
        itemCount: mergedItems.length,
        totalPrice,
      };
    }

    case "REMOVE_ITEM": {
      let newNormalItems = [...state.normalItems];
      let newOfferItems = [...state.offerItems];

      // Remove from wherever it is
      const normalIndex = newNormalItems.findIndex(
        (item) => item.id === action.payload.id && item.color === action.payload.color
      );
      if (normalIndex >= 0) {
        newNormalItems = newNormalItems.filter((_, i) => i !== normalIndex);
      }
      
      const offerIndex = newOfferItems.findIndex(
        (item) => item.id === action.payload.id && item.color === action.payload.color
      );
      if (offerIndex >= 0) {
        newOfferItems = newOfferItems.filter((_, i) => i !== offerIndex);
      }

      // Reorganize
      const reorganized = reorganizeCart(newNormalItems, newOfferItems, state.selectedOffer || null);
      
      const mergedItems = mergeItems(reorganized.normalItems, reorganized.offerItems);
      const totalItems = getTotalCartItems(reorganized.normalItems, reorganized.offerItems);
      const totalPrice = calculateTotalPriceWithOffer(
        reorganized.normalItems,
        reorganized.offerItems,
        state.selectedOffer || null
      );

      return {
        ...state,
        items: mergedItems,
        normalItems: reorganized.normalItems,
        offerItems: reorganized.offerItems,
        totalItems,
        itemCount: mergedItems.length,
        totalPrice,
      };
    }

    case "UPDATE_QUANTITY": {
      let newNormalItems = [...state.normalItems];
      let newOfferItems = [...state.offerItems];
      const { id, color, quantity } = action.payload;
      const newQty = Math.max(1, quantity);

      // Find and update
      const normalIndex = newNormalItems.findIndex(
        (item) => item.id === id && item.color === color
      );
      
      if (normalIndex >= 0) {
          const item = newNormalItems[normalIndex];
          const finalQty = item.maxQuantity ? Math.min(newQty, item.maxQuantity) : newQty;
          newNormalItems[normalIndex] = { ...item, quantity: finalQty };
      } else {
          const offerIndex = newOfferItems.findIndex(
            (item) => item.id === id && item.color === color
          );
          if (offerIndex >= 0) {
              const item = newOfferItems[offerIndex];
              const finalQty = item.maxQuantity ? Math.min(newQty, item.maxQuantity) : newQty;
              newOfferItems[offerIndex] = { ...item, quantity: finalQty };
          }
      }

      // Reorganize
      const reorganized = reorganizeCart(newNormalItems, newOfferItems, state.selectedOffer || null);
      
      const mergedItems = mergeItems(reorganized.normalItems, reorganized.offerItems);
      const totalItems = getTotalCartItems(reorganized.normalItems, reorganized.offerItems);
      const totalPrice = calculateTotalPriceWithOffer(
        reorganized.normalItems,
        reorganized.offerItems,
        state.selectedOffer || null
      );

      return {
        ...state,
        items: mergedItems,
        normalItems: reorganized.normalItems,
        offerItems: reorganized.offerItems,
        totalItems,
        itemCount: mergedItems.length,
        totalPrice,
      };
    }

    case "CLEAR_CART":
      return {
        ...state,
        items: [],
        normalItems: [],
        offerItems: [],
        totalItems: 0,
        itemCount: 0,
        totalPrice: 0,
        selectedOffer: null,
        offerSelectedProducts: [],
      };

    case "LOAD_CART": {
      // Ensure backward compatibility - if payload doesn't have normalItems/offerItems, migrate from items
      const payload = action.payload;
      let normalItems = payload.normalItems || [];
      let offerItems = payload.offerItems || [];

      // If old format (only has items), split them based on offerSelectedProducts
      if (
        payload.items &&
        payload.items.length > 0 &&
        normalItems.length === 0 &&
        offerItems.length === 0
      ) {
        const offerProducts = payload.offerSelectedProducts || [];
        const offerProductMap = new Map<string, number>();
        offerProducts.forEach((offerProduct: CartItem) => {
          const key = `${offerProduct.id}-${offerProduct.color || ""}`;
          offerProductMap.set(key, offerProduct.quantity);
        });

        payload.items.forEach((item: CartItem) => {
          const key = `${item.id}-${item.color || ""}`;
          const offerQuantity = offerProductMap.get(key) || 0;

          if (offerQuantity > 0) {
            // Split item between normal and offer
            const normalQty = item.quantity - offerQuantity;
            if (normalQty > 0) {
              normalItems.push({ ...item, quantity: normalQty });
            }
            if (offerQuantity > 0) {
              offerItems.push({ ...item, quantity: offerQuantity });
            }
          } else {
            normalItems.push(item);
          }
        });
      }

      const mergedItems = mergeItems(normalItems, offerItems);
      const totalItems = getTotalCartItems(normalItems, offerItems);
      const totalPrice = calculateTotalPriceWithOffer(
        normalItems,
        offerItems,
        payload.selectedOffer || null
      );

      return {
        ...payload,
        items: mergedItems,
        normalItems,
        offerItems,
        totalItems,
        itemCount: mergedItems.length,
        totalPrice,
      };
    }

    case "SET_OFFER": {
      const offer = action.payload.offer;
      const offerProducts = action.payload.selectedProducts || [];
      
      // Use reorganizeCart to handle everything
      const reorganized = reorganizeCart(state.normalItems, state.offerItems, offer);
      
      const mergedItems = mergeItems(reorganized.normalItems, reorganized.offerItems);
      const totalItems = getTotalCartItems(reorganized.normalItems, reorganized.offerItems);
      const totalPrice = calculateTotalPriceWithOffer(
        reorganized.normalItems,
        reorganized.offerItems,
        offer || null
      );

      return {
        ...state,
        items: mergedItems,
        normalItems: reorganized.normalItems,
        offerItems: reorganized.offerItems,
        selectedOffer: offer,
        offerSelectedProducts: offerProducts,
        totalItems,
        itemCount: mergedItems.length,
        totalPrice,
      };
    }

    default:
      return state;
  }
};

interface CartContextType {
  state: CartState;
  addItem: (item: CartItem) => void;
  removeItem: (id: string | number, color?: string) => void;
  updateQuantity: (
    id: string | number,
    quantity: number,
    color?: string
  ) => void;
  clearCart: () => void;
  validateCart: () => void;
  setOffer: (offer: Offer | null, selectedProducts: CartItem[]) => void;
  onOfferCartCleared?: () => void; // Callback when cart is cleared due to offer
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load cart from localStorage on mount (client-side only)
  useEffect(() => {
    if (!isClient) return;

    try {
      const savedCart = localStorage.getItem("dreamy-eyes-cart");

      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);

        // Load cart - check for items, normalItems, or offerItems
        const hasItems = parsedCart.items && parsedCart.items.length > 0;
        const hasNormalItems =
          parsedCart.normalItems && parsedCart.normalItems.length > 0;
        const hasOfferItems =
          parsedCart.offerItems && parsedCart.offerItems.length > 0;

        if (hasItems || hasNormalItems || hasOfferItems) {
          // Validate quantities against maxQuantity limits
          const validateItems = (items: CartItem[]) => {
            return items.map((item: CartItem) => {
              if (
                item.maxQuantity !== undefined &&
                item.quantity > item.maxQuantity
              ) {
                return { ...item, quantity: item.maxQuantity };
              }
              return item;
            });
          };

          // If we have normalItems/offerItems, use them; otherwise migrate from items
          let normalItems = parsedCart.normalItems
            ? validateItems(parsedCart.normalItems)
            : [];
          let offerItems = parsedCart.offerItems
            ? validateItems(parsedCart.offerItems)
            : [];

          // If old format (only has items), migrate to new format
          if (hasItems && normalItems.length === 0 && offerItems.length === 0) {
            const validatedItems = validateItems(parsedCart.items);
            // For old format, put all items in normalItems
            normalItems = validatedItems;
            offerItems = [];
          }

          // Merge items for backward compatibility
          const mergedItems = mergeItems(normalItems, offerItems);

          // Recalculate totals
          const totalItems = getTotalCartItems(normalItems, offerItems);
          const totalPrice = calculateTotalPriceWithOffer(
            normalItems,
            offerItems,
            parsedCart.selectedOffer || null
          );

          const validatedCart = {
            ...parsedCart,
            items: mergedItems,
            normalItems,
            offerItems,
            totalItems,
            itemCount: mergedItems.length,
            totalPrice,
          };

          dispatch({ type: "LOAD_CART", payload: validatedCart });
        }
      }
      setIsInitialized(true);
    } catch (error) {
      setIsInitialized(true);
    }
  }, [isClient]);

  // Sync offer from Zustand store to CartContext after hydration and on changes
  useEffect(() => {
    if (!isInitialized || !isClient) return;

    let unsubscribe: (() => void) | null = null;

    const syncOffer = () => {
      import("../store/offerStore").then(({ useOfferStore }) => {
        const store = useOfferStore.getState();
        const {
          _hasHydrated,
          selectedOffer,
          offerSelectedProducts,
          isOfferApplied,
        } = store;

        // Wait for offer store to hydrate
        if (!_hasHydrated) {
          // Retry after a short delay if not hydrated yet
          setTimeout(syncOffer, 100);
          return;
        }

        // Sync offer from Zustand to CartContext if offer is applied
        if (isOfferApplied && selectedOffer) {
          // Always sync offer from Zustand to ensure it's applied
          // The offerSelectedProducts might be empty initially, but we still need to set the offer
          setOffer(selectedOffer as any, offerSelectedProducts || []);
        } else if (!isOfferApplied && state.selectedOffer) {
          // Only clear offer in CartContext if it's cleared in Zustand AND cart is empty
          // Don't clear if cart has items - let the user keep their cart
          if (state.items.length === 0) {
            setOffer(null, []);
          }
        }

        // Subscribe to Zustand store changes to sync immediately
        unsubscribe = useOfferStore.subscribe((store) => {
          const {
            _hasHydrated: hydrated,
            selectedOffer: offer,
            offerSelectedProducts: products,
            isOfferApplied: applied,
          } = store;

          if (!hydrated) return;

          if (applied && offer && products && products.length > 0) {
            if (
              state.selectedOffer?.id !== offer.id ||
              JSON.stringify(state.offerSelectedProducts || []) !==
                JSON.stringify(products)
            ) {
              setOffer(offer as any, products);
            }
          } else if (!applied && state.selectedOffer) {
            setOffer(null, []);
          }
        });
      });
    };

    syncOffer();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [isInitialized, isClient]);

  // Clear offer from Zustand store when cart is cleared or becomes empty
  useEffect(() => {
    if (!isInitialized || !isClient) return;

    // Wait for offer store to hydrate before clearing
    import("../store/offerStore").then(({ useOfferStore }) => {
      const { _hasHydrated, clearOffer } = useOfferStore.getState();

      // Only clear if offer store has hydrated and cart is empty
      if (_hasHydrated && state.items.length === 0) {
        clearOffer(); // Always clear when cart is empty
      }
    });
  }, [state.items.length, isInitialized, isClient]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!isInitialized || !isClient) return; // Don't save until after initial load and on client

    try {
      // Save if cart has items (either in items, normalItems, or offerItems)
      const hasItems = state.items && state.items.length > 0;
      const hasNormalItems = state.normalItems && state.normalItems.length > 0;
      const hasOfferItems = state.offerItems && state.offerItems.length > 0;

      if (hasItems || hasNormalItems || hasOfferItems) {
        // Save complete state including normalItems and offerItems
        localStorage.setItem(
          "dreamy-eyes-cart",
          JSON.stringify({
            ...state,
            items: state.items, // Keep for backward compatibility
            normalItems: state.normalItems,
            offerItems: state.offerItems,
            selectedOffer: state.selectedOffer,
            offerSelectedProducts: state.offerSelectedProducts,
            totalItems: state.totalItems,
            itemCount: state.itemCount,
            totalPrice: state.totalPrice,
          })
        );
      } else {
        localStorage.removeItem("dreamy-eyes-cart");
      }
    } catch (error) {
      // Error saving cart
      console.error("Error saving cart to localStorage:", error);
    }
  }, [state, isInitialized, isClient]);

  // Auto-validate cart whenever items change to ensure maxQuantity limits
  useEffect(() => {
    if (!isInitialized || !isClient) return;

    const hasInvalidQuantities = state.items.some(
      (item) =>
        item.maxQuantity !== undefined && item.quantity > item.maxQuantity
    );

    if (hasInvalidQuantities) {
      validateCart();
    }
  }, [state.items, isInitialized, isClient]);

  const addItem = (item: CartItem) => {
    dispatch({ type: "ADD_ITEM", payload: item });
  };

  const removeItem = (id: string | number, color?: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: { id, color } });
  };

  const updateQuantity = (
    id: string | number,
    quantity: number,
    color?: string
  ) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, color, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  const validateCart = () => {
    const updatedItems = state.items.map((item) => {
      if (item.maxQuantity !== undefined && item.quantity > item.maxQuantity) {
        return { ...item, quantity: item.maxQuantity };
      }
      return item;
    });

    const totalItems = updatedItems.reduce(
      (sum: number, item: CartItem) => sum + item.quantity,
      0
    );
    const totalPrice = updatedItems.reduce(
      (sum: number, item: CartItem) => sum + item.price * item.quantity,
      0
    );

    const validatedState = {
      ...state,
      items: updatedItems,
      totalItems,
      itemCount: updatedItems.length,
      totalPrice,
    };

    dispatch({
      type: "LOAD_CART",
      payload: validatedState,
    });
  };

  const setOffer = (offer: Offer | null, selectedProducts: CartItem[]) => {
    dispatch({
      type: "SET_OFFER",
      payload: { offer, selectedProducts },
    });
  };

  return (
    <CartContext.Provider
      value={{
        state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        validateCart,
        setOffer,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
