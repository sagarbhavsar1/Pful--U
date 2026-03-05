"use client";
import ExplorerSidebar from "@/components/ExplorerSidebar";

export default function ExplorerLayout({ children }) {
    return (
        <div className="explorer-layout">
            <ExplorerSidebar />
            <main className="explorer-main page-enter">
                {children}
            </main>
        </div>
    );
}
