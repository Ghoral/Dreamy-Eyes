import React, { useState, useCallback, useMemo } from "react";

const INITIAL_CART_ITEMS = [
  {
    id: 1,
    title: "Secrets of the Alchemist",
    description: "High quality in good price.",
    price: 870,
    quantity: 1,
  },
  {
    id: 2,
    title: "Quest for the Lost City",
    description: "Professional Quest for the Lost City.",
    price: 600,
    quantity: 1,
  },
];

const ModalCart = ({
  isOpen = false,
  onClose,
  onViewCart,
  onCheckout,
}: {
  isOpen: boolean;
  onClose: () => void;
  onViewCart: () => void;
  onCheckout: () => void;
}) => {
  const [cartItems, setCartItems] = useState(INITIAL_CART_ITEMS);

  const cartSummary = useMemo(() => {
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    return { totalItems, totalPrice };
  }, [cartItems]);

  const removeItem = useCallback((itemId: any) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  const updateQuantity = useCallback(
    (itemId: any, newQuantity: any) => {
      if (newQuantity <= 0) {
        removeItem(itemId);
        return;
      }
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    },
    [removeItem]
  );

  const handleBackdropClick = useCallback(
    (e: any) => {
      if (e.target === e.currentTarget) {
        onClose?.();
      }
    },
    [onClose]
  );

  const handleKeyDown = useCallback(
    (e: any) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    },
    [onClose]
  );

  const handleViewCart = useCallback(() => {
    onViewCart?.();
    onClose?.();
  }, [onViewCart, onClose]);

  const handleCheckout = useCallback(() => {
    onCheckout?.();
    onClose?.();
  }, [onCheckout, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="modal-backdrop fade show"
        onClick={handleBackdropClick}
        style={{ zIndex: 1040 }}
      />

      <div
        className="modal fade show d-block"
        tabIndex={-1}
        role="dialog"
        aria-labelledby="cartModalTitle"
        aria-hidden={!isOpen}
        onKeyDown={handleKeyDown}
        style={{ zIndex: 1050 }}
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            {/* Modal Header */}
            <div className="modal-header border-0 pb-0">
              <h4
                id="cartModalTitle"
                className="modal-title d-flex justify-content-between align-items-center mb-0 w-100"
              >
                <span className="text-primary">Your Cart</span>
                <span className="badge bg-primary rounded-pill">
                  {cartSummary.totalItems}
                </span>
              </h4>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close cart"
              />
            </div>

            <div className="modal-body">
              {cartItems.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted mb-3">Your cart is empty</p>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      onClose?.();
                    }}
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <>
                  <ul className="list-group mb-3">
                    {cartItems.map((item) => (
                      <li
                        key={item.id}
                        className="list-group-item bg-transparent d-flex justify-content-between align-items-start border-bottom"
                      >
                        <div className="flex-grow-1 me-3">
                          <h6 className="mb-1">
                            <a
                              href={`/product/${item.id}`}
                              className="text-decoration-none text-dark"
                            >
                              {item.title}
                            </a>
                          </h6>
                          <small className="text-muted">
                            {item.description}
                          </small>

                          {/* Quantity Controls */}
                          <div className="d-flex align-items-center mt-2">
                            <label
                              htmlFor={`quantity-${item.id}`}
                              className="visually-hidden"
                            >
                              Quantity for {item.title}
                            </label>
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              aria-label={`Decrease quantity of ${item.title}`}
                            >
                              -
                            </button>
                            <input
                              id={`quantity-${item.id}`}
                              type="number"
                              className="form-control form-control-sm mx-2 text-center"
                              style={{ width: "60px" }}
                              value={item.quantity}
                              onChange={(e) =>
                                updateQuantity(
                                  item.id,
                                  parseInt(e.target.value) || 0
                                )
                              }
                              min="0"
                            />
                            <button
                              className="btn btn-sm btn-outline-secondary me-2"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              aria-label={`Increase quantity of ${item.title}`}
                            >
                              +
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => removeItem(item.id)}
                              aria-label={`Remove ${item.title} from cart`}
                            >
                              Remove
                            </button>
                          </div>
                        </div>

                        <div className="text-end">
                          <span className="fw-bold">
                            ${item.price * item.quantity}
                          </span>
                          {item.quantity > 1 && (
                            <small className="d-block text-muted">
                              ${item.price} each
                            </small>
                          )}
                        </div>
                      </li>
                    ))}

                    <li className="list-group-item bg-transparent d-flex justify-content-between border-0 pt-3">
                      <span className="text-capitalize">
                        <strong>Total (USD)</strong>
                      </span>
                      <strong className="text-primary fs-5">
                        ${cartSummary.totalPrice}
                      </strong>
                    </li>
                  </ul>
                </>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="modal-footer border-0 pt-0">
                <div className="d-flex gap-2 w-100">
                  <button
                    className="btn btn-outline-dark flex-fill"
                    onClick={handleViewCart}
                  >
                    View Cart
                  </button>
                  <button
                    className="btn btn-primary flex-fill"
                    onClick={handleCheckout}
                  >
                    Checkout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ModalCart;
