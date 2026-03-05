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
        <title>Partiful U — Campus Event Discovery</title>
        <meta name="description" content="Discover events happening on your campus with Partiful U" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0D0D0D" />
      </head>
      <body>
        {isLanding ? (
          /* Landing page — no chrome */
          <>{children}</>
        ) : (
          /* All other pages get the topbar */
          <>
            <header className="topbar">
              <div className="topbar-left">
                <Link href="/" aria-label="Back to home">
                  <div className="topbar-logo">P</div>
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
                ) : isParties ? (
                  <Link href="/explorer" className="btn-explorer">
                    📊 Data Explorer
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
