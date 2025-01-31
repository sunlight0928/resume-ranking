import { Roboto_Mono } from "next/font/google";
import React from "react";
import "react-toastify/dist/ReactToastify.css";
import { ContextProvider } from "./context/ContextProvider";
import "./globals.css";
import ReactQueryWrapper from "./react-query/ReactQueryWrapper";
import { ThemeProvider } from "./components/theme/ThemeProvider";

const roboto_mono = Roboto_Mono({
  variable: "--font-roboto-mono",
  display: "swap",
  subsets: ["latin"],
});

export const metadata = {
  title: "ResumeGenie - Resume Matching",
  description: "ResumeGenie - Resume Matching",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${roboto_mono.variable}`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        ></link>
      </head>
      <body>
        <ThemeProvider defaultTheme="light">
          <ReactQueryWrapper>
            <ContextProvider>{children}</ContextProvider>
          </ReactQueryWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
