import React, { useCallback } from "react";
import { useCart } from "../../context/CartContext";
import { useRouter } from "next/navigation";

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
  const { state: cartItems, removeItem, updateQuantity } = useCart();
  const router = useRouter();

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
    onClose?.();
    router.push("/checkout");
  }, [onClose, router]);

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
                  {cartItems.totalItems}
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
              {cartItems.items.length === 0 ? (
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
                    {cartItems.items.map((item) => (
                      <li
                        key={`${item.id}-${item.color || "default"}`}
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
                          {item.color && (
                            <small className="d-block text-muted">
                              Color:{" "}
                              {item.color.charAt(0).toUpperCase() +
                                item.color.slice(1)}
                            </small>
                          )}

                          {/* Quantity Controls */}
                          <div className="d-flex align-items-center mt-2">
                            <label
                              htmlFor={`quantity-${item.id}-${
                                item.color || "default"
                              }`}
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
                              disabled={item.quantity <= 1}
                            >
                              -
                            </button>
                            <input
                              id={`quantity-${item.id}-${
                                item.color || "default"
                              }`}
                              type="number"
                              className="form-control form-control-sm mx-2 text-center"
                              style={{ width: "60px" }}
                              value={item.quantity}
                              onChange={(e) => {
                                const newQuantity =
                                  parseInt(e.target.value) || 0;
                                updateQuantity(item.id, newQuantity);
                              }}
                              min="1"
                              max={item.maxQuantity || 99}
                            />
                            <button
                              className="btn btn-sm btn-outline-secondary me-2"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              aria-label={`Increase quantity of ${item.title}`}
                              disabled={
                                item.maxQuantity
                                  ? item.quantity >= item.maxQuantity
                                  : false
                              }
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

                          {/* Show quantity limit info */}
                          {item.maxQuantity && (
                            <small className="text-muted d-block mt-1">
                              Max: {item.maxQuantity} available
                            </small>
                          )}
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
                        ${cartItems.totalPrice}
                      </strong>
                    </li>
                  </ul>
                </>
              )}
            </div>

            {cartItems.items.length > 0 && (
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
