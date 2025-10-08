import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Theme } from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { QueryProvider } from '../providers/QueryProvider';
import DynamicThemeWrapper from '../components/DynamicThemeWrapper';
import AuthThemeBridge from '../components/AuthThemeBridge';
import NotificationWrapper from '../components/NotificationWrapper';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "PetPal - Pet Management System",
  description: "A comprehensive pet management system for pet owners and veterinarians",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <QueryProvider>
          <AuthProvider>
            <ThemeProvider>
              <AuthThemeBridge>
                <DynamicThemeWrapper>
                  <NotificationWrapper>
                    {children}
                  </NotificationWrapper>
                </DynamicThemeWrapper>
              </AuthThemeBridge>
            </ThemeProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}