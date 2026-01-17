"use client";

import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import Toast from "../components/ui/Toast";
import { getThumbnailUrl, formatPriceWithCurrency } from "../util";
import { update_product_quantity } from "../api/quantity";
import ModalOffers from "../components/modals/ModalOffers";
import { useOfferStore } from "../store/offerStore";
import { useUserCountry } from "../hooks/useUserCountry";

const ProductDetail = ({
  product,
  isSale = false,
}: {
  product: any;
  isSale?: boolean;
}) => {
  // Early return if no product
  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-secondary-900">
        <h2 className="text-2xl font-black">PRODUCT NOT FOUND</h2>
      </div>
    );
  }

  // Helper functions (preserved)
  const getImagesForColor = (colorHex: string): string[] => {
    if (!product?.images) return [];
    try {
      const parsedImages = JSON.parse(product.images);
      return parsedImages[colorHex] || [];
    } catch (error) {
      return [];
    }
  };

  const hasValidImages = (): boolean => {
    if (!product?.images) return false;
    try {
      const parsedImages = JSON.parse(product.images);
      return Object.keys(parsedImages).length > 0 && Object.values(parsedImages).some((arr: any) => Array.isArray(arr) && arr.length > 0);
    } catch (error) {
      return false;
    }
  };

  const getProductImageUrl = (filename: string): string => {
    if (!filename) return "";
    if (filename.startsWith("http://") || filename.startsWith("https://")) return filename;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl) return `${supabaseUrl}/storage/v1/object/public/product-image/${filename}`;
    return `/product-image/${filename}`;
  };

  const getImageUrlForColor = (colorHex: string): string => {
    const images = getImagesForColor(colorHex);
    if (images.length > 0) return getProductImageUrl(images[0]);
    return getThumbnailUrl(product) || "/images/product-default.jpg";
  };

  const getAllProductImages = (): string[] => {
    if (!product?.images) return ["/images/product-default.jpg"];
    try {
      const parsedImages = JSON.parse(product.images);
      const allImages: string[] = [];
      Object.values(parsedImages).forEach((imageArray: any) => {
        if (Array.isArray(imageArray)) {
          imageArray.forEach((image: string) => {
            const imageUrl = getProductImageUrl(image);
            if (!allImages.includes(imageUrl)) allImages.push(imageUrl);
          });
        }
      });
      return allImages.length > 0 ? allImages : ["/images/product-default.jpg"];
    } catch (error) {
      return ["/images/product-default.jpg"];
    }
  };

  const availableImages = getAllProductImages();

  const parseSpecifications = () => {
    if (!product.specifications) return null;
    try {
      if (typeof product.specifications === "string") return JSON.parse(product.specifications);
      return product.specifications;
    } catch (e) {
      return product.specifications;
    }
  };

  const parsedSpecs = parseSpecifications();
  const isSpecsArray = Array.isArray(parsedSpecs);
  const hasSpecs = parsedSpecs && (isSpecsArray ? parsedSpecs.length > 0 : Object.keys(parsedSpecs).length > 0);

  const { country } = useUserCountry();
  const [selectedColor, setSelectedColor] = useState(product?.color_quantity?.[0] || null);
  const [mainImage, setMainImage] = useState<string>(() => {
    if (selectedColor) {
      const colorImage = getImageUrlForColor(selectedColor.color);
      if (colorImage !== "/images/product-default.jpg") return colorImage;
    }
    return availableImages[0] || "/images/product-default.jpg";
  });

  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [isCheckingQuantity, setIsCheckingQuantity] = useState(false);
  const [quantityError, setQuantityError] = useState<string | null>(null);
  const [isOffersModalOpen, setIsOffersModalOpen] = useState(false);

  const { addItem, state: cartState, removeItem, setOffer } = useCart();

  // Effects
  useEffect(() => {
    if (selectedColor) {
      const colorImage = getImageUrlForColor(selectedColor.color);
      setMainImage(colorImage);
    }
  }, [selectedColor]);

  const getCurrentCartQuantity = () => {
    if (!selectedColor) return 0;
    const existingItem = cartState.items.find(item => item.id === (product.id || product.title) && item.color === selectedColor.label);
    return existingItem ? existingItem.quantity : 0;
  };

  const getMaxQuantityForThisSession = () => {
    if (!selectedColor) return 0;
    const availableStock = parseInt(selectedColor.quantity);
    const currentCartQuantity = getCurrentCartQuantity();
    return Math.max(0, availableStock - currentCartQuantity);
  };

  const handleColorSelect = (colorOption: any) => {
    setSelectedColor(colorOption);
    setQuantity(1);
  };

  const handleQuantityChange = async (newQuantity: number) => {
    if (!selectedColor || !product.id) return;
    if (newQuantity < 1) {
      setQuantity(1);
      return;
    }
    setIsCheckingQuantity(true);
    setQuantityError(null);
    try {
      const result = await update_product_quantity(product.id, selectedColor.color, newQuantity);
      if (result.success) {
        setQuantity(result.validated_quantity || newQuantity);
      } else {
        setQuantityError(result.message || "Quantity not available");
        if (result.available_quantity > 0) setQuantity(result.available_quantity);
        else setQuantity(1);
      }
    } catch (error: any) {
      setQuantityError(error.message || "Failed to update quantity");
    } finally {
      setIsCheckingQuantity(false);
    }
  };

  const handleAddToCart = () => {
    if (!selectedColor) {
      setShowToast(true);
      return;
    }
    const cartItem = {
      id: product.id || product.title,
      title: product.title,
      description: product.description,
      price: product.price,
      quantity: quantity,
      color: selectedColor.label,
      colorHex: selectedColor.color,
      image: getImageUrlForColor(selectedColor.color),
      primary_thumbnail: product.primary_thumbnail || undefined,
      maxQuantity: parseInt(selectedColor.quantity),
      productImages: product.images || undefined,
      category: "product" as const,
    };
    addItem(cartItem);
    setShowToast(true);
    setQuantity(1);
  };

  const handleRemoveFromCart = () => {
    if (!selectedColor) return;
    const existingItem = cartState.items.find(item => item.id === (product.id || product.title) && item.color === selectedColor.label);
    if (existingItem) removeItem(existingItem.id, existingItem.color);
  };

  return (
    <div className="min-h-screen bg-white pt-32 pb-20 relative overflow-hidden">
      {/* Background Soft Decor */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-0 right-0 w-[40%] h-[60%] bg-primary-100 blur-[120px] rounded-full translate-x-1/2 translate-y-[-10%]" />
        <div className="absolute bottom-0 left-0 w-[40%] h-[60%] bg-accent-100 blur-[120px] rounded-full translate-x-[-1/2] translate-y-10" />
      </div>

      <div className="max-w-[1500px] mx-auto px-6 relative z-10">

        {/* The Boutique Product Section */}
        <div className="bg-white border border-secondary-100 rounded-[3rem] p-6 md:p-12 shadow-[0_20px_80px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">

            {/* Left Col: Master Gallery */}
            <div className="lg:col-span-7 flex flex-col gap-8">
              <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-secondary-50 border border-secondary-100 group">
                <img
                  src={mainImage}
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              </div>

              {/* Thumbnails Showcase */}
              {hasValidImages() && (
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  {selectedColor && getImagesForColor(selectedColor.color).length > 0
                    ? getImagesForColor(selectedColor.color).map((image, i) => {
                      const imageUrl = getProductImageUrl(image);
                      const isActive = mainImage === imageUrl;
                      return (
                        <button
                          key={i}
                          onClick={() => setMainImage(imageUrl)}
                          className={`w-20 md:w-28 aspect-square rounded-2xl overflow-hidden transition-all duration-500 border-2 ${isActive ? "border-primary-500 shadow-[0_0_20px_rgba(195,78,138,0.2)] scale-110" : "border-secondary-100 hover:border-secondary-300"
                            }`}
                        >
                          <img src={imageUrl} alt="thumbnail" className="w-full h-full object-cover" />
                        </button>
                      );
                    })
                    : availableImages.map((img, i) => {
                      const isActive = mainImage === img;
                      return (
                        <button
                          key={i}
                          onClick={() => setMainImage(img)}
                          className={`w-20 md:w-28 aspect-square rounded-2xl overflow-hidden transition-all duration-500 border-2 ${isActive ? "border-primary-500 shadow-[0_0_20px_rgba(195,78,138,0.2)] scale-110" : "border-secondary-100 hover:border-secondary-300"
                            }`}
                        >
                          <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                        </button>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Right Col: Elite Info Stack */}
            <div className="lg:col-span-5 flex flex-col gap-10">

              {/* Heading Section */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col">
                  <span className="text-primary-500 font-black tracking-[0.4em] uppercase text-[10px] mb-2 block">Premium Collection</span>
                  <h1 className="text-4xl md:text-7xl font-black text-secondary-900 tracking-tighter leading-none mb-2">
                    {product.title?.toUpperCase()}
                  </h1>
                </div>
                {product.sub_title && (
                  <p className="text-secondary-500 font-serif italic text-xl md:text-2xl">
                    {product.sub_title}
                  </p>
                )}

                <div className="flex items-center gap-6 mt-2">
                  <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">AUTHENTIC</span>
                </div>
              </div>

              {/* Perforated Divider */}
              <div className="w-full flex items-center gap-4">
                <div className="h-[1px] flex-1 bg-secondary-100" />
                <div className="w-2 h-2 rounded-full bg-primary-500 shadow-[0_0_10px_rgba(195,78,138,0.5)]" />
                <div className="h-[1px] flex-1 bg-secondary-100" />
              </div>

              {/* Pricing Stage */}
              <div className="flex items-end gap-3">
                <span className="text-5xl md:text-7xl font-black text-secondary-900 tracking-tighter font-price">
                  {formatPriceWithCurrency(product.price, country)}
                </span>
              </div>

              {/* Description Reveal */}
              <div className="bg-secondary-50 border border-secondary-100 rounded-3xl p-6">
                <h4 className="text-[10px] font-black tracking-[0.3em] uppercase text-primary-500 mb-3">The Gaze</h4>
                <div
                  className="text-sm md:text-base text-secondary-600 leading-relaxed font-medium line-clamp-4 hover:line-clamp-none transition-all duration-500 cursor-pointer"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>

              {/* Boutique Configuration */}
              <div className="flex flex-col gap-8">

                {/* Color Selection */}
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black tracking-[0.4em] uppercase text-secondary-400">Select Pigment</span>
                    {selectedColor && <span className="text-[11px] font-bold text-secondary-900 uppercase tracking-widest">{selectedColor.label}</span>}
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {product?.color_quantity.map((colorOption: any, index: number) => {
                      const isAvailable = parseInt(colorOption.quantity) > 0;
                      const isSelected = selectedColor?.label === colorOption.label;
                      if (!isAvailable) return null;
                      return (
                        <button
                          key={index}
                          onClick={() => handleColorSelect(colorOption)}
                          className={`relative group w-12 h-12 rounded-full transition-all duration-500 p-1 border-2 ${isSelected ? "border-primary-500 scale-110" : "border-secondary-100 hover:border-secondary-300"
                            }`}
                        >
                          <div
                            className="w-full h-full rounded-full shadow-inner"
                            style={{ backgroundColor: colorOption.color }}
                          />
                          {isSelected && <div className="absolute inset-0 rounded-full border border-primary-500 animate-ping opacity-20" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quantity Architecture */}
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black tracking-[0.4em] uppercase text-secondary-400">Quantity</span>
                    <span className="text-[9px] font-bold text-secondary-400 uppercase tracking-widest">{getMaxQuantityForThisSession()} available for you</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center bg-secondary-50 border border-secondary-100 rounded-2xl p-2 h-16">
                      <button
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={quantity <= 1}
                        className="w-12 h-full flex items-center justify-center text-secondary-400 hover:text-secondary-900 transition-colors"
                      >—</button>
                      <input
                        type="number"
                        className="w-16 bg-transparent border-none text-center font-black text-xl text-secondary-900 focus:ring-0"
                        value={quantity}
                        readOnly
                      />
                      <button
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={quantity >= getMaxQuantityForThisSession()}
                        className="w-12 h-full flex items-center justify-center text-secondary-400 hover:text-secondary-900 transition-colors"
                      >+</button>
                    </div>
                  </div>
                </div>

                {/* Master Actions */}
                <div className="flex flex-col gap-4 mt-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={!selectedColor || getMaxQuantityForThisSession() === 0}
                    className={`h-20 w-full rounded-3xl font-black text-lg uppercase tracking-widest transition-all duration-700 relative overflow-hidden group ${!selectedColor || getMaxQuantityForThisSession() === 0
                      ? "bg-secondary-100 text-secondary-400 cursor-not-allowed"
                      : "bg-primary-500 text-white shadow-[0_20px_40px_rgba(195,78,138,0.2)] hover:shadow-[0_25px_60px_rgba(195,78,138,0.4)] active:scale-[0.98]"
                      }`}
                  >
                    <div className="relative z-10 flex items-center justify-center gap-4">
                      {isCheckingQuantity ? (
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      ) : (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      )}
                      <span>{!selectedColor ? "SELECT PIGMENT" : "ADD TO COLLECTION"}</span>
                    </div>
                    {!(!selectedColor || getMaxQuantityForThisSession() === 0) && (
                      <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    )}
                  </button>

                  {getCurrentCartQuantity() > 0 && (
                    <button
                      onClick={handleRemoveFromCart}
                      className="text-[10px] font-black text-secondary-400 hover:text-red-500 uppercase tracking-[0.3em] transition-colors duration-500 py-2"
                    >
                      Release from Collection ({getCurrentCartQuantity()})
                    </button>
                  )}
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Technical Ledger (Specifications) */}
        {hasSpecs && (
          <div className="mt-24">
            <div className="flex flex-col items-center mb-12">
              <span className="text-primary-500 font-black tracking-[0.4em] uppercase text-[10px] mb-3">The Craft</span>
              <h3 className="text-3xl md:text-5xl font-black text-secondary-900 tracking-tighter">MASTER <span className="text-secondary-400 font-serif italic font-normal">DETAILS</span></h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isSpecsArray ? (
                parsedSpecs.map((item: any, idx: number) => (
                  <div key={idx} className="bg-white border border-secondary-100 rounded-3xl p-8 flex flex-col gap-2 hover:border-primary-200 hover:bg-secondary-50 transition-all group">
                    <span className="text-[10px] font-black text-secondary-400 uppercase tracking-widest transition-colors group-hover:text-primary-500">{item.label}</span>
                    <span className="text-xl font-black text-secondary-900 tracking-tight uppercase leading-none">{item.value}</span>
                  </div>
                ))
              ) : (
                Object.entries(parsedSpecs).map(([key, value]) => (
                  <div key={key} className="bg-white border border-secondary-100 rounded-3xl p-8 flex flex-col gap-2 hover:border-primary-200 hover:bg-secondary-50 transition-all group">
                    <span className="text-[10px] font-black text-secondary-400 uppercase tracking-widest transition-colors group-hover:text-primary-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="text-xl font-black text-secondary-900 tracking-tight uppercase leading-none">{String(value)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>

      {/* Boutique Feedback */}
      <Toast
        message={
          !selectedColor
            ? "Please define your pigment first."
            : getCurrentCartQuantity() > 0
              ? `Your collection has been expanded.`
              : `Vision added to collection.`
        }
        type={!selectedColor ? "error" : "success"}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />

      <ModalOffers
        isOpen={isOffersModalOpen}
        onClose={() => setIsOffersModalOpen(false)}
        onSelectOffer={(offer: any, prods: any[]) => setOffer(offer, prods)}
      />
    </div>
  );
};

export default ProductDetail;
