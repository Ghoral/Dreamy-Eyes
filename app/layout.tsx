import type { Metadata } from "next";
import { Quattrocento_Sans } from "next/font/google";
import "./globals.css";
import Header from "./components/landing/Header";
import OfferBanner from "./components/landing/OfferBanner";
import { GlobalSupabaseListenerWrapper } from "./hooks/GlobalSupabaseListener";
import { AddressGuard } from "./hooks/AddressGuard";
import { CartProvider } from "./context/CartContext";
import { UserMetadataLogger } from "./components/UserMetadataLogger";
import ExchangeRateLoader from "./components/ExchangeRateLoader";

const quattrocentoSans = Quattrocento_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-quattrocento-sans",
});
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
        className={`${quattrocentoSans.variable} font-sans antialiased`}
        style={{ fontFamily: 'var(--font-quattrocento-sans), sans-serif' }}
      >
        <CartProvider>
          <GlobalSupabaseListenerWrapper />
          <AddressGuard />
          <UserMetadataLogger />
          <ExchangeRateLoader />
          <Header />
          <OfferBanner />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
