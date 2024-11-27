import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { TokenProvider } from "../app/hook/accessToken";
import { GroupProvider } from "./hook/acessGroup";
const InterRegular = localFont({
  src: "./assets/fonts/Inter_18pt-Regular.ttf",
  variable: "--font-inter-regular",
  weight: "400",
});

const InterBold = localFont({
  src: "./assets/fonts/Inter_18pt-Bold.ttf",
  variable: "--font-inter-bold",
  weight: "700",
});

export const metadata: Metadata = {
  title: "Portal Birigui",
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
        className={`${InterRegular.variable} ${InterBold.variable} antialiased`}
      >
        {
          <GroupProvider>
            <TokenProvider>
              <ToastContainer />
              {children}
            </TokenProvider>
          </GroupProvider>

        }
      </body>
    </html>
  );
}
