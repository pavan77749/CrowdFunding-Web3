import "./globals.css";
import Header from "../components/Layout/Header"
import { ThemeProvider } from "next-themes";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Header />
        {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
