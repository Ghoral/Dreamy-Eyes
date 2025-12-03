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
  title: string;
  description?: string;
  discount_type?: string;
  discount_value?: number;
  discount?: number; // New field: discount amount/percentage
  price?: number; // New field: fixed price for offer items
  minimum_quantity?: number;
  minimum_value?: number;
  is_enabled: boolean;
  [key: string]: any;
}

interface CartState {
  items: CartItem[];
  totalItems: number; // Total quantity across all items
  itemCount: number; // Number of unique items
  totalPrice: number;
  selectedOffer?: Offer | null;
  offerSelectedProducts?: CartItem[];
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

// Helper function to calculate total price with offer discounts applied
const calculateTotalPriceWithOffer = (
  items: CartItem[],
  offer: Offer | null,
  offerProducts: CartItem[]
): number => {
  if (!offer || !offerProducts || offerProducts.length === 0) {
    // No offer, calculate regular total
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  // Create a map of offer product keys and quantities for quick lookup
  const offerProductMap = new Map<string, number>();
  offerProducts.forEach((offerProduct) => {
    const key = `${offerProduct.id}-${offerProduct.color || ""}`;
    const existing = offerProductMap.get(key) || 0;
    offerProductMap.set(key, existing + offerProduct.quantity);
  });

  // Calculate total price with offer discounts
  return items.reduce((sum, item) => {
    const key = `${item.id}-${item.color || ""}`;
    const offerQuantity = offerProductMap.get(key) || 0;
    const regularQuantity = item.quantity - offerQuantity;

    // Regular price items (not in offer)
    let itemTotal = 0;
    if (regularQuantity > 0) {
      itemTotal += item.price * regularQuantity;
    }

    // Offer price items (in offer) - these are always FREE (price = 0)
    if (offerQuantity > 0) {
      const offerPrice = 0; // Items in offerSelectedProducts are always free
      itemTotal += offerPrice * offerQuantity;
    }

    return sum + itemTotal;
  }, 0);
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItemIndex = state.items.findIndex(
        (item) =>
          item.id === action.payload.id && item.color === action.payload.color
      );

      if (existingItemIndex >= 0) {
        // Update existing item quantity
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity:
            updatedItems[existingItemIndex].quantity + action.payload.quantity,
        };

        const totalItems = updatedItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        // Calculate total price with offer discounts
        const totalPrice = calculateTotalPriceWithOffer(
          updatedItems,
          state.selectedOffer || null,
          state.offerSelectedProducts || []
        );

        return {
          ...state,
          items: updatedItems,
          totalItems,
          itemCount: updatedItems.length,
          totalPrice,
        };
      } else {
        // Add new item
        const newItems = [...state.items, action.payload];
        const totalItems = newItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        // Calculate total price with offer discounts
        const totalPrice = calculateTotalPriceWithOffer(
          newItems,
          state.selectedOffer || null,
          state.offerSelectedProducts || []
        );

        return {
          ...state,
          items: newItems,
          totalItems,
          itemCount: newItems.length,
          totalPrice,
        };
      }
    }

    case "REMOVE_ITEM": {
      const filteredItems = state.items.filter(
        (item) =>
          !(
            item.id === action.payload.id && item.color === action.payload.color
          )
      );
      const totalItems = filteredItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      // Calculate total price with offer discounts
      const totalPrice = calculateTotalPriceWithOffer(
        filteredItems,
        state.selectedOffer || null,
        state.offerSelectedProducts || []
      );

      return {
        ...state,
        items: filteredItems,
        totalItems,
        itemCount: filteredItems.length,
        totalPrice,
      };
    }

    case "UPDATE_QUANTITY": {
      const item = state.items.find(
        (item) =>
          item.id === action.payload.id && item.color === action.payload.color
      );
      if (!item) return state;

      let newQuantity = Math.max(1, action.payload.quantity); // Ensure minimum quantity is 1

      // If there's a maxQuantity limit, respect it strictly
      if (item.maxQuantity !== undefined) {
        newQuantity = Math.min(newQuantity, item.maxQuantity);
        // If the requested quantity exceeds max, adjust to max
        if (action.payload.quantity > item.maxQuantity) {
          // Quantity will be adjusted to maxQuantity
        }
      }

      if (newQuantity <= 0) {
        // Remove item if quantity is 0 or less
        const filteredItems = state.items.filter(
          (item) =>
            !(
              item.id === action.payload.id &&
              item.color === action.payload.color
            )
        );
        const totalItems = filteredItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        // Calculate total price with offer discounts
        const totalPrice = calculateTotalPriceWithOffer(
          filteredItems,
          state.selectedOffer || null,
          state.offerSelectedProducts || []
        );

        return {
          ...state,
          items: filteredItems,
          totalItems,
          itemCount: filteredItems.length,
          totalPrice,
        };
      }

      const updatedItems = state.items.map((item) =>
        item.id === action.payload.id && item.color === action.payload.color
          ? { ...item, quantity: newQuantity }
          : item
      );

      // Calculate total price with offer discounts
      const totalPrice = calculateTotalPriceWithOffer(
        updatedItems,
        state.selectedOffer || null,
        state.offerSelectedProducts || []
      );

      return {
        ...state,
        items: updatedItems,
        totalItems: updatedItems.length,
        itemCount: updatedItems.length,
        totalPrice,
      };
    }

    case "CLEAR_CART":
      return {
        ...state,
        items: [],
        totalItems: 0,
        itemCount: 0,
        totalPrice: 0,
        selectedOffer: null,
        offerSelectedProducts: [],
      };

    case "LOAD_CART":
      return action.payload;

    case "SET_OFFER": {
      // Recalculate total price with offer discounts applied
      const offer = action.payload.offer;
      const offerProducts = action.payload.selectedProducts || [];

      // Create a map of offer product keys for quick lookup
      const offerProductMap = new Map<string, number>();
      offerProducts.forEach((offerProduct) => {
        const key = `${offerProduct.id}-${offerProduct.color || ""}`;
        offerProductMap.set(key, offerProduct.quantity);
      });

      // Calculate total price with offer discounts
      const totalPrice = state.items.reduce((sum, item) => {
        const key = `${item.id}-${item.color || ""}`;
        const offerQuantity = offerProductMap.get(key) || 0;
        const regularQuantity = item.quantity - offerQuantity;

        // Calculate price for this item
        let itemTotal = 0;

        // Regular price items (not in offer)
        if (regularQuantity > 0) {
          itemTotal += item.price * regularQuantity;
        }

        // Offer price items (in offer)
        if (offerQuantity > 0 && offer) {
          const offerPrice = calculateOfferPrice(item.price, offer);
          itemTotal += offerPrice * offerQuantity;
        }

        return sum + itemTotal;
      }, 0);

      return {
        ...state,
        selectedOffer: offer,
        offerSelectedProducts: offerProducts,
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

        // Only load if the parsed cart has items
        if (parsedCart.items && parsedCart.items.length > 0) {
          // Validate quantities against maxQuantity limits
          const validatedItems = parsedCart.items.map((item: CartItem) => {
            if (
              item.maxQuantity !== undefined &&
              item.quantity > item.maxQuantity
            ) {
              return { ...item, quantity: item.maxQuantity };
            }
            return item;
          });

          // Recalculate totals with validated quantities
          const totalItems = validatedItems.reduce(
            (sum: number, item: CartItem) => sum + item.quantity,
            0
          );
          // Calculate total price with offer discounts if offer exists
          const totalPrice = calculateTotalPriceWithOffer(
            validatedItems,
            parsedCart.selectedOffer || null,
            parsedCart.offerSelectedProducts || []
          );

          const validatedCart = {
            ...parsedCart,
            items: validatedItems,
            totalItems,
            itemCount: validatedItems.length,
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

  // Clear offer from Zustand store when cart is cleared or becomes empty
  useEffect(() => {
    if (!isInitialized || !isClient) return;

    // If cart is empty, clear the offer from Zustand store
    if (state.items.length === 0) {
      // Dynamically import to avoid circular dependency
      import("../store/offerStore").then(({ useOfferStore }) => {
        const { isOfferApplied, clearOffer } = useOfferStore.getState();
        if (isOfferApplied) {
          clearOffer();
        }
      });
    }
  }, [state.items.length, isInitialized, isClient]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!isInitialized || !isClient) return; // Don't save until after initial load and on client

    try {
      // Only save if cart has items, otherwise remove from localStorage
      if (state.items && state.items.length > 0) {
        localStorage.setItem("dreamy-eyes-cart", JSON.stringify(state));
      } else {
        localStorage.removeItem("dreamy-eyes-cart");
      }
    } catch (error) {
      // Error saving cart
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
