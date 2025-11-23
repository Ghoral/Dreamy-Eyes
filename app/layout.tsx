import type { Metadata } from "next";
import { Raleway, Cinzel } from "next/font/google";
import "./globals.css";
import Header from "./components/landing/Header";
import { GlobalSupabaseListenerWrapper } from "./hooks/GlobalSupabaseListener";
import { AddressGuard } from "./hooks/AddressGuard";
import { CartProvider } from "./context/CartContext";

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-raleway",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal"],
  variable: "--font-cinzel",
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
      <body className={`${raleway.variable} ${cinzel.variable} font-sans antialiased`}>
        <CartProvider>
          <GlobalSupabaseListenerWrapper />
          <AddressGuard />
          <Header />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
