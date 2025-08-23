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
  totalItems: number;
  totalPrice: number;
}

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: string | number }
  | {
      type: "UPDATE_QUANTITY";
      payload: { id: string | number; quantity: number };
    }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; payload: CartState };

const initialState: CartState = {
  items: [],
  totalItems: 0,
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
          totalPrice,
        };
      }
    }

    case "REMOVE_ITEM": {
      const filteredItems = state.items.filter(
        (item) => item.id !== action.payload
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
        totalPrice,
      };
    }

    case "UPDATE_QUANTITY": {
      const item = state.items.find((item) => item.id === action.payload.id);
      if (!item) return state;

      let newQuantity = Math.max(0, action.payload.quantity);

      // If there's a maxQuantity limit, respect it
      if (item.maxQuantity !== undefined) {
        newQuantity = Math.min(newQuantity, item.maxQuantity);
      }

      if (newQuantity <= 0) {
        // Remove item if quantity is 0 or less
        return {
          ...state,
          items: state.items.filter((item) => item.id !== action.payload.id),
          totalItems: state.items.reduce(
            (sum, item) =>
              sum + (item.id === action.payload.id ? 0 : item.quantity),
            0
          ),
          totalPrice: state.items.reduce(
            (sum, item) =>
              sum +
              (item.id === action.payload.id ? 0 : item.price * item.quantity),
            0
          ),
        };
      }

      const updatedItems = state.items.map((item) =>
        item.id === action.payload.id
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
        totalPrice,
      };
    }

    case "CLEAR_CART":
      return {
        ...state,
        items: [],
        totalItems: 0,
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
  removeItem: (id: string | number) => void;
  updateQuantity: (id: string | number, quantity: number) => void;
  clearCart: () => void;
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
          dispatch({ type: "LOAD_CART", payload: parsedCart });
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

  const addItem = (item: CartItem) => {
    console.log("Adding item to cart:", item);
    dispatch({ type: "ADD_ITEM", payload: item });
  };

  const removeItem = (id: string | number) => {
    console.log("Removing item from cart:", id);
    dispatch({ type: "REMOVE_ITEM", payload: id });
  };

  const updateQuantity = (id: string | number, quantity: number) => {
    console.log("Updating quantity for item:", id, "to:", quantity);
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
  };

  const clearCart = () => {
    console.log("Clearing cart");
    dispatch({ type: "CLEAR_CART" });
  };

  // Debug: Log current cart state
  useEffect(() => {
    if (isClient) {
      console.log("Current cart state:", state);
    }
  }, [state, isClient]);

  return (
    <CartContext.Provider
      value={{ state, addItem, removeItem, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};
