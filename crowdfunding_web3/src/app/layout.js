import "./globals.css";
import Header from "../components/Layout/Header"
import { ThemeProvider } from "next-themes";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Header/>
        <ToastContainer  />
        {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
