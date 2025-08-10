import "./globals.css";
import { Montserrat } from "next/font/google";
import { ThemeProvider } from "@dainabase/ui";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400","500","600","700"]
});

export const metadata = {
  title: "Unified Dashboard Demo",
  description: "Design System Apple-style demo"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={montserrat.variable} suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}