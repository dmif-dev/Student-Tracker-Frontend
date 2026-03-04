"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

// ─── Injected CSS ─────────────────────────────────────────────────────────────

const HERO_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

  :root {
    --or:  #FF6B00; --or2: #FF8C38;
    --or3: #FFF3E8; --or4: #FFD9B3;
    --dk:  #0F0A04; --mid: #6B5240; --sm: #9A7C65;
    --bd:  rgba(255,107,0,.13);
  }

  @keyframes heroSlideUp   { from{ opacity:0; transform:translateY(30px) } to{ opacity:1; transform:translateY(0) } }
  @keyframes heroScaleIn   { from{ opacity:0; transform:scale(.94) }        to{ opacity:1; transform:scale(1) }    }
  
  .tw-a1 { animation: heroSlideUp .6s ease both }
  .tw-a2 { animation: heroSlideUp .6s .12s ease both }
  .tw-a3 { animation: heroSlideUp .6s .22s ease both }
  .tw-a4 { animation: heroSlideUp .6s .32s ease both }
  .tw-a5 { animation: heroSlideUp .6s .42s ease both }
  .tw-ac { animation: heroScaleIn .7s .1s ease both }

  .tw-wavy { display:inline-block; position:relative }
  .tw-wavy::after {
    content:''; position:absolute; left:0; bottom:-5px;
    width:100%; height:5px;
    background: url("data:image/svg+xml,%3Csvg width='200' height='8' viewBox='0 0 200 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M2 6C40 2 80 1 100 4.5C120 8 160 6 198 2' stroke='%23FF6B00' stroke-width='3' stroke-linecap='round'/%3E%3C/svg%3E")
    center / 100% 100% no-repeat;
  }

  .tw-btn-ghost {
    padding:9px 20px; border-radius:50px; background:transparent;
    border:1.5px solid var(--bd); font-size:.85rem; font-weight:500;
    color:var(--dk); cursor:pointer;
    font-family:'Plus Jakarta Sans',sans-serif; transition:all .22s;
  }
  .tw-btn-ghost:hover { border-color:var(--or); color:var(--or) }

  .tw-btn-or {
    padding:10px 22px; border-radius:50px; background:var(--or);
    font-size:.85rem; font-weight:600; color:#fff; border:none; cursor:pointer;
    font-family:'Plus Jakarta Sans',sans-serif;
    box-shadow:0 4px 18px rgba(255,107,0,.36); transition:all .22s;
  }
  .tw-btn-or:hover { background:#e55e00; transform:translateY(-1px) }
`;

// ─── Hero Section ─────────────────────────────────────────────────────────────

export default function HeroSection() {
    const [stuck, setStuck] = useState<boolean>(false);
    const router = useRouter();

    useEffect(() => {
        const handler = () => setStuck(window.scrollY > 10);
        window.addEventListener("scroll", handler);
        return () => window.removeEventListener("scroll", handler);
    }, []);

    return (
        <>
            <style>{HERO_CSS}</style>

            {/* ── Nav ── */}
            <nav style={{
                position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
                height: 66, display: "flex", alignItems: "center",
                justifyContent: "space-between", padding: "0 5%", transition: "all .3s",
                ...(stuck ? {
                    background: "rgba(255,255,255,.95)",
                    backdropFilter: "blur(18px)",
                    borderBottom: "1px solid var(--bd)",
                    boxShadow: "0 2px 24px rgba(255,107,0,.07)",
                } : {}),
            }}>
                {/* Logo */}
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: "var(--or)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(255,107,0,.38)" }}>
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="white">
                            <path d="M9 1.5L1.5 6v6l7.5 4.5L16.5 12V6L9 1.5z" fillOpacity=".95" />
                            <path d="M9 6v4.5l3.5 2" stroke="rgba(255,255,255,.6)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                        </svg>
                    </div>
                    <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "1.2rem", color: "var(--dk)" }}>Student Tracker</span>
                </div>

                {/* Links */}
                <ul style={{ display: "flex", gap: 34, listStyle: "none" }} className="hidden md:flex">
                    {[
                        { name: "Dashboard", href: "/dashboard" },
                        { name: "Progress", href: "/progress/new" },
                        { name: "Students", href: "/students" },
                        { name: "Reports", href: "/reports" },
                        { name: "Admin", href: "/admin" },
                        { name: "Settings", href: "/settings" }
                    ].map((link) => (
                        <li key={link.name}>
                            <Link href={link.href}
                                style={{ fontSize: ".875rem", fontWeight: 500, color: "var(--mid)", textDecoration: "none", transition: "color .2s" }}
                                onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => ((e.currentTarget as HTMLElement).style.color = "var(--or)")}
                                onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => ((e.currentTarget as HTMLElement).style.color = "var(--mid)")}
                            >{link.name}</Link>
                        </li>
                    ))}
                </ul>

                {/* Actions */}
                <div style={{ display: "flex", gap: 10 }}>
                    <Link href="/dashboard" className="tw-btn-ghost text-decoration-none">
                        Log in
                    </Link>
                    <button className="tw-btn-or" onClick={() => router.push('/dashboard')}>Get Started →</button>
                </div>
            </nav>

            {/* ── Hero ── */}
            <header style={{
                minHeight: "100vh", padding: "100px 5% 70px",
                display: "grid", gridTemplateColumns: "1fr 1fr",
                gap: 52, alignItems: "center",
                position: "relative", overflow: "hidden", background: "#fff",
            }} className="grid-cols-1 md:grid-cols-2">
                {/* Glow blobs */}
                <div style={{ position: "absolute", top: -220, right: -220, width: 760, height: 760, background: "radial-gradient(circle,rgba(255,107,0,.13) 0%,transparent 68%)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", bottom: -160, left: -120, width: 500, height: 500, background: "radial-gradient(circle,rgba(255,140,56,.07) 0%,transparent 70%)", pointerEvents: "none" }} />
                {/* Subtle grid lines */}
                <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,107,0,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,107,0,.04) 1px,transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />

                {/* ── Left ── */}
                <div style={{ position: "relative", zIndex: 2 }}>

                    {/* Eyebrow */}
                    <div className="tw-a1" style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        padding: "5px 14px 5px 6px", borderRadius: 50,
                        background: "var(--or3)", border: "1px solid var(--or4)",
                        fontSize: ".75rem", fontWeight: 700, color: "var(--or)", marginBottom: 20,
                    }}>
                        <span style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--or)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg width="8" height="8" viewBox="0 0 10 10" fill="white"><polygon points="3,1.5 8.5,5 3,8.5" /></svg>
                        </span>
                        Built for serious learners & educators
                    </div>

                    {/* Headline */}
                    <h1 className="tw-a2" style={{
                        fontFamily: "'Syne',sans-serif", fontWeight: 800,
                        fontSize: "clamp(2.8rem,5vw,4.4rem)",
                        lineHeight: 1.06, letterSpacing: "-.02em",
                        color: "var(--dk)", marginBottom: 20,
                    }}>
                        Track Every<br />
                        <span className="tw-wavy">Learning</span><br />
                        <span style={{ color: "var(--or)" }}>Breakthrough.</span>
                    </h1>

                    {/* Subtext */}
                    <p className="tw-a3" style={{ fontSize: "1.02rem", lineHeight: 1.75, color: "var(--mid)", maxWidth: 460, marginBottom: 34 }}>
                        Log daily progress, auto-generate weekly reports, and stay consistent — across web and mobile with one unified platform.
                    </p>

                    {/* CTA buttons */}
                    <div className="tw-a4" style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 44 }}>
                        <button style={{
                            padding: "14px 30px", borderRadius: 50, background: "var(--or)",
                            fontSize: ".97rem", fontWeight: 700, color: "#fff", border: "none",
                            cursor: "pointer", boxShadow: "0 6px 26px rgba(255,107,0,.42)",
                            display: "flex", alignItems: "center", gap: 8,
                            fontFamily: "'Plus Jakarta Sans',sans-serif", transition: "all .25s",
                        }} onClick={() => router.push('/dashboard')}>
                            Start Tracking
                            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                                <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                        <button style={{
                            padding: "14px 26px", borderRadius: 50, background: "transparent",
                            fontSize: ".97rem", fontWeight: 600, color: "var(--dk)",
                            border: "1.5px solid rgba(15,10,4,.14)", cursor: "pointer",
                            fontFamily: "'Plus Jakarta Sans',sans-serif", transition: "all .25s",
                        }} onClick={() => router.push('/about')}>
                            Learn more →
                        </button>
                    </div>

                    {/* Stats strip */}
                    <div className="tw-a5" style={{
                        display: "flex", border: "1px solid var(--bd)", borderRadius: 20,
                        overflow: "hidden", background: "#fff",
                        boxShadow: "0 4px 24px rgba(255,107,0,.07)",
                    }}>
                        {(
                            [
                                ["4.2k", "Active Students", "↑ 12%"],
                                ["98%", "Report Rate", null],
                                ["14K", "Entries Logged", "↑ 8%"],
                            ] as [string, string, string | null][]
                        ).map(([num, label, badge], i) => (
                            <div key={label} style={{ flex: 1, padding: "18px 22px", borderRight: i < 2 ? "1px solid var(--bd)" : "none", position: "relative" }}>
                                <span style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.65rem", fontWeight: 800, color: "var(--dk)", display: "block" }}>{num}</span>
                                <span style={{ fontSize: ".73rem", fontWeight: 600, color: "var(--sm)", textTransform: "uppercase", letterSpacing: ".06em" }}>{label}</span>
                                {badge && (
                                    <span style={{ position: "absolute", top: 14, right: 14, background: "rgba(34,197,94,.12)", color: "#16a34a", fontSize: ".65rem", fontWeight: 700, padding: "2px 7px", borderRadius: 50 }}>
                                        {badge}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Right: Image ── */}
                <div className="tw-ac hidden md:block" style={{ height: "100%", maxHeight: "80vh", position: "relative" }}>
                    <div style={{
                        position: "relative",
                        width: "100%",
                        height: "100%",
                        borderRadius: "32px",
                        overflow: "hidden",
                        boxShadow: "0 20px 40px rgba(0,0,0,0.08)"
                    }}>
                        {/* 
                Please add your image file to 'packages/web/public/hero-image.png' 
                or update the src below to your image URL.
             */}
                        <Image
                            src="/hero-image.png"
                            alt="Student Tracker Hero"
                            fill
                            style={{ objectFit: "contain" }}
                            priority
                            unoptimized
                        />
                    </div>
                </div>
            </header>
        </>
    );
}
