import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { TokenProvider } from "../app/hook/accessToken";
import { GroupProvider } from "./hook/acessGroup";
import { SpeedInsights } from "@vercel/speed-insights/next"

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
  title: "Portal",
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
        className={`${InterRegular.variable} ${InterBold.variable} antialiased min-h-screen`}
        style={{
          backgroundImage: `linear-gradient(135deg, #1B405D, #D9D9D9, #B8D047)`,
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          backgroundSize: 'cover',
        }}
      >

        {
          <GroupProvider>
            <TokenProvider>
              <ToastContainer />
              {children}
            </TokenProvider>
          </GroupProvider>
        }
        <SpeedInsights />
      </body>
    </html>
  );
}
