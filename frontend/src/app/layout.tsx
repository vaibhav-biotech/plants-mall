'use client';

import type { Metadata } from "next";
import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import RightDrawer from "../components/RightDrawer";
import { usePathname } from "next/navigation";

// Note: Metadata doesn't work with 'use client', moving to separate layout if needed
// export const metadata: Metadata = {
//   title: "Plants Mall - Garden Nursery & E-Commerce Store",
//   description: "Buy quality plants and gardening products online. Your one-stop shop for all garden needs.",
// };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');

  return (
    <html lang="en">
      <body className="bg-gray-50">
        {!isAdminPage && <Navbar />}
        <main className="min-h-screen">
          {children}
        </main>
        {!isAdminPage && <Footer />}
        {!isAdminPage && <RightDrawer />}
      </body>
    </html>
  );
}
