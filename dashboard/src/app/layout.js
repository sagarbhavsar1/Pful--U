"use client";
import "./globals.css";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const isExplorer = pathname.startsWith("/explorer");
  const isParties = pathname.startsWith("/parties");

  return (
    <html lang="en">
      <head>
        <title>Partiful U | Campus Event Discovery</title>
        <meta name="description" content="Discover events happening on your campus with Partiful U" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#6236FF" />
      </head>
      <body>
        {(isLanding || isParties) ? (
          <>{children}</>
        ) : (
          <>
            <header className="topbar">
              <div className="topbar-left">
                <Link href="/" aria-label="Back to home">
                  <div className="topbar-logo">
                    <img src="/images/pful.png" alt="Partiful" />
                  </div>
                </Link>
                <div>
                  <div className="topbar-title">Partiful U</div>
                  <div className="topbar-subtitle">
                    {isExplorer ? "Data Explorer" : "Campus Discovery"}
                  </div>
                </div>
              </div>
              <div className="topbar-right">
                {isExplorer ? (
                  <Link href="/parties" className="topbar-back">
                    ← Campus Feed
                  </Link>
                ) : null}
              </div>
            </header>
            {children}
          </>
        )}
      </body>
    </html>
  );
}
