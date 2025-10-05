import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { AuthProvider } from "./context/auth-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <div className="flex flex-col min-h-screen bg-gray-50">
            <Navbar />
            {/* Banner */}
            {/* <VehicleLists></VehicleLists>
             */}
            {children}
            <Footer></Footer>
            {/* Go to Top Button (Client Component) */}
            {/* <TopButton /> */}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
