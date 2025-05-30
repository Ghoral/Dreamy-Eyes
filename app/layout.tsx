import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Navbar from "./components/landing/Navbar";
import Header from "./components/landing/Header";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-nunito",
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
      <body className={nunito.variable} style={{ margin: 0, padding: 0 }}>
        <Header />
        {children}
      </body>
    </html>
  );
}
