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
  maxQuantity?: number; // Add maximum quantity limit
}

interface CartState {
  items: CartItem[];
  totalItems: number; // Total quantity across all items
  itemCount: number; // Number of unique items
  totalPrice: number;
}

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: { id: string | number; color?: string } }
  | {
      type: "UPDATE_QUANTITY";
      payload: { id: string | number; color?: string; quantity: number };
    }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; payload: CartState };

const initialState: CartState = {
  items: [],
  totalItems: 0,
  itemCount: 0,
  totalPrice: 0,
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
        const totalPrice = updatedItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
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
        const totalPrice = newItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
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
      const totalPrice = filteredItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
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
        // If the requested quantity exceeds max, log a warning
        if (action.payload.quantity > item.maxQuantity) {
          console.warn(
            `Requested quantity ${action.payload.quantity} exceeds max ${item.maxQuantity} for item ${item.id}`
          );
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
        const totalPrice = filteredItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
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

      const totalItems = updatedItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      const totalPrice = updatedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      return {
        ...state,
        items: updatedItems,
        totalItems,
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
      };

    case "LOAD_CART":
      return action.payload;

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
      console.log("Loading cart from localStorage:", savedCart);

      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        console.log("Parsed cart data:", parsedCart);

        // Only load if the parsed cart has items
        if (parsedCart.items && parsedCart.items.length > 0) {
          // Validate quantities against maxQuantity limits
          const validatedItems = parsedCart.items.map((item: CartItem) => {
            if (
              item.maxQuantity !== undefined &&
              item.quantity > item.maxQuantity
            ) {
              console.warn(
                `Item ${item.id} quantity ${item.quantity} exceeds max ${item.maxQuantity}, adjusting to max`
              );
              return { ...item, quantity: item.maxQuantity };
            }
            return item;
          });

          // Recalculate totals with validated quantities
          const totalItems = validatedItems.reduce(
            (sum: number, item: CartItem) => sum + item.quantity,
            0
          );
          const totalPrice = validatedItems.reduce(
            (sum: number, item: CartItem) => sum + item.price * item.quantity,
            0
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
      } else {
        console.log("No saved cart found in localStorage");
      }
      setIsInitialized(true);
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
      setIsInitialized(true);
    }
  }, [isClient]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!isInitialized || !isClient) return; // Don't save until after initial load and on client

    try {
      console.log("Saving cart to localStorage:", state);

      // Only save if cart has items, otherwise remove from localStorage
      if (state.items && state.items.length > 0) {
        localStorage.setItem("dreamy-eyes-cart", JSON.stringify(state));
      } else {
        localStorage.removeItem("dreamy-eyes-cart");
      }
    } catch (error) {
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
      console.log("Invalid quantities detected, auto-validating cart...");
      validateCart();
    }
  }, [state.items, isInitialized, isClient]);

  const addItem = (item: CartItem) => {
    console.log("Adding item to cart:", item);
    dispatch({ type: "ADD_ITEM", payload: item });
  };

  const removeItem = (id: string | number, color?: string) => {
    console.log("Removing item from cart:", id, color);
    dispatch({ type: "REMOVE_ITEM", payload: { id, color } });
  };

  const updateQuantity = (
    id: string | number,
    quantity: number,
    color?: string
  ) => {
    console.log("Updating quantity for item:", id, color, "to:", quantity);
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, color, quantity } });
  };

  const clearCart = () => {
    console.log("Clearing cart");
    dispatch({ type: "CLEAR_CART" });
  };

  const validateCart = () => {
    console.log("Validating cart...");
    const updatedItems = state.items.map((item) => {
      if (item.maxQuantity !== undefined && item.quantity > item.maxQuantity) {
        console.warn(
          `Item ${item.id} quantity ${item.quantity} exceeds max ${item.maxQuantity}, adjusting to max`
        );
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

    console.log("Cart validated. New state:", validatedState);
  };

  // Debug: Log current cart state
  useEffect(() => {
    if (isClient) {
      console.log("Current cart state:", state);
    }
  }, [state, isClient]);

  return (
    <CartContext.Provider
      value={{
        state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        validateCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
