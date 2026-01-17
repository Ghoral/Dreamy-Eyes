import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/landing/Header";
import OfferBanner from "./components/landing/OfferBanner";
import { GlobalSupabaseListenerWrapper } from "./hooks/GlobalSupabaseListener";
import { AddressGuard } from "./hooks/AddressGuard";
import { CartProvider } from "./context/CartContext";
import { UserMetadataLogger } from "./components/UserMetadataLogger";
import ExchangeRateLoader from "./components/ExchangeRateLoader";

export const metadata: Metadata = {
  title: "Dreamy Eyes",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="font-sans antialiased"
      >
        <CartProvider>
          <GlobalSupabaseListenerWrapper />
          <AddressGuard />
          <UserMetadataLogger />
          <ExchangeRateLoader />
          <Header />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
