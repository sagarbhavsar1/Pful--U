"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
    { href: "/explorer", label: "Executive Overview", icon: "📊" },
    { href: "/explorer/campus", label: "Campus Comparison", icon: "🏫" },
    { href: "/explorer/seasonality", label: "Seasonality", icon: "📅" },
    { href: "/explorer/impact", label: "Campus Discovery", icon: "🎯" },
    { href: "/explorer/insights", label: "Insights", icon: "💡" },
];

export default function ExplorerSidebar() {
    const pathname = usePathname();

    return (
        <aside className="explorer-sidebar" role="navigation" aria-label="Data Explorer navigation">
            <div className="explorer-sidebar-section">
                <div className="explorer-sidebar-label">Data Explorer</div>
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`explorer-nav-link ${pathname === item.href ? "active" : ""}`}
                    >
                        <span className="nav-icon" aria-hidden="true">{item.icon}</span>
                        {item.label}
                    </Link>
                ))}
            </div>

            <div className="explorer-sidebar-footer">
                <p>
                    Synthetic data simulation evaluating a university segmentation
                    layer for Partiful.
                </p>
                <p style={{ marginTop: 8 }}>
                    250 campuses • 624K users • 132K events
                </p>
            </div>
        </aside>
    );
}
