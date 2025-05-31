// // app/layout.tsx
// import type { Metadata } from "next"
// import { Geist, Geist_Mono } from "next/font/google"
// import "./globals.css"
// import Navbar from "./components/Navbar"

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// })

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// })

// export const metadata: Metadata = {
//   title: "PLX Site",
//   description: "Home / Media / Event",
// }

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode
// }>) {
//   return (
//     <html lang="en">
//       <body
//         className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900`}
//       >
//         {/* Navbar at the top of every page */}
//         <Navbar />

//         {/* Main content wrapper */}
//         <main className="max-w-screen-xl mx-auto px-4 py-6">
//           {children}
//         </main>
//       </body>
//     </html>
//   )
// }
// app/layout.tsx
import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google"; // Font imports commented out
import "./globals.css";
import Navbar from "./components/Navbar";

// Font instances commented out
// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "PLX Site",
  description: "Home / Media / Event",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Font variables removed from className */}
      <body
        className={`antialiased bg-gray-50 text-gray-900`}
      >
        {/* Navbar at the top of every page */}
        <Navbar />

        {/* Main content wrapper */}
        <main className="max-w-screen-xl mx-auto px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
