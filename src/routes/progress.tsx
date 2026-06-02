import { createFileRoute } from "@tanstack/react-router";
import { Lock, Hourglass, Smartphone, CalendarDays, Zap } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { PageShell, SectionTitle } from "@/components/BottomNav";
import { useAppState, dayCount, longestCleanPeriod, activeAddiction } from "@/lib/store";
import { triggerPaywall } from "@/lib/paywall";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";

const GOLD = "#C9A84C";

const msContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};
const msItem = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

export const Route = createFileRoute("/progress")({
  component: ProgressScreen,
});

// ── Neural Green palette ──────────────────────────────────────────────────────
const NG = "#39d98a";
const NG_DIM = "#1a6640";
const NG_GLOW = "rgba(57,217,138,";

// ── Legendary Gold palette (90-day) ──────────────────────────────────────────
const LG = "#E8C87A";
const LG_DIM = "#6b4c10";
const LG_GLOW = "rgba(232,200,122,";

// ── Confetti / Gold-Dust Engine ───────────────────────────────────────────────
function Confetti({ active, mode = "celebration" }: { active: boolean; mode?: "celebration" | "goldDust" }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);

  const launch = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const isGold = mode === "goldDust";

    const CELEBRATION_COLORS = ["#E8C87A","#f5d98a","#fff0b0","#39d98a","#ffffff","#f06450","#7ec8e3"];
    const GOLD_COLORS = ["#E8C87A","#f5d98a","#fff0b0","#ffe066","#ffd700","#c9a84c","#ffffff"];

    const COLORS = isGold ? GOLD_COLORS : CELEBRATION_COLORS;
    const COUNT  = isGold ? 220 : 160;

    type Particle = {
      x: number; y: number; vx: number; vy: number;
      r: number; color: string; rot: number; rotV: number; alpha: number;
      alphaDecay: number;
      shape: "rect" | "circle" | "diamond";
    };

    const particles: Particle[] = Array.from({ length: COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * (isGold ? 300 : 120),
      vx: (Math.random() - 0.5) * (isGold ? 1.2 : 3.5),
      vy: isGold ? 0.6 + Math.random() * 1.4 : 2.5 + Math.random() * 4,
      r: isGold ? 2 + Math.random() * 5 : 4 + Math.random() * 6,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rot: Math.random() * Math.PI * 2,
      rotV: (Math.random() - 0.5) * (isGold ? 0.04 : 0.18),
      alpha: isGold ? 0.5 + Math.random() * 0.5 : 1,
      alphaDecay: isGold ? 0.0015 + Math.random() * 0.001 : 0,
      shape: isGold
        ? (["rect","circle","diamond"] as const)[Math.floor(Math.random() * 3)]
        : (Math.random() > 0.4 ? "rect" : "circle"),
    }));

    let alive = true;

    function tick() {
      if (!alive || !ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let any = false;
      for (const p of particles) {
        p.x   += p.vx + (isGold ? Math.sin(p.y * 0.015) * 0.4 : 0);
        p.y   += p.vy;
        p.vy  += isGold ? 0.01 : 0.07;
        p.rot += p.rotV;
        if (isGold) p.alpha = Math.max(0, p.alpha - p.alphaDecay);
        if (p.y < canvas.height + 40 && (!isGold || p.alpha > 0.02)) {
          any = true;
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = p.color;
          if (p.shape === "rect") {
            ctx.fillRect(-p.r / 2, -p.r * 1.6, p.r, p.r * 3.2);
          } else if (p.shape === "diamond") {
            ctx.beginPath();
            ctx.moveTo(0, -p.r * 1.4);
            ctx.lineTo(p.r * 0.7, 0);
            ctx.lineTo(0, p.r * 1.4);
            ctx.lineTo(-p.r * 0.7, 0);
            ctx.closePath();
            ctx.fill();
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, p.r * 0.6, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
      }
      if (any) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => { alive = false; cancelAnimationFrame(rafRef.current); };
  }, [mode]);

  useEffect(() => {
    if (!active) return;
    const cleanup = launch();
    return () => { cleanup?.(); cancelAnimationFrame(rafRef.current); };
  }, [active, launch]);

  if (!active) return null;
  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        pointerEvents: "none", width: "100%", height: "100%",
      }}
    />
  );
}

// ── 90-Day Celebration Modal ──────────────────────────────────────────────────
function Victory90Modal({ onDismiss, addiction }: { onDismiss: () => void; addiction?: string }) {
  const canShare = typeof navigator !== "undefined" && !!navigator.share;

  async function handleShare() {
    const text = `🏆 90 days clean${addiction ? ` from ${addiction}` : ""}. Full brain reset complete. The neural pathways of my old habit have been pruned. Sovereign status achieved. #Stopamine #Day90 #Recovery`;
    try {
      if (canShare) {
        await navigator.share({ title: "90-Day Sovereign — Stopamine", text });
      } else {
        await navigator.clipboard.writeText(text);
      }
    } catch {
      /* dismissed — no-op */
    }
  }

  return (
    <motion.div
      key="v90-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.40 }}
      style={{
        position: "fixed", inset: 0, zIndex: 9998,
        background: "radial-gradient(ellipse at 50% 30%, rgba(30,18,2,0.96) 0%, rgba(0,0,0,0.97) 100%)",
        backdropFilter: "blur(10px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "0 20px",
        overflowY: "auto",
      }}
      onClick={onDismiss}
    >
      {/* Gold-dust particles inside the modal layer */}
      <Confetti active mode="goldDust" />

      <style>{`
        @keyframes v90-swirl1  { 0%{transform:translate(0,0) rotate(0deg) scale(1)} 33%{transform:translate(24px,-18px) rotate(120deg) scale(1.12)} 66%{transform:translate(-16px,20px) rotate(240deg) scale(0.92)} 100%{transform:translate(0,0) rotate(360deg) scale(1)} }
        @keyframes v90-swirl2  { 0%{transform:translate(0,0) rotate(0deg)} 50%{transform:translate(-28px,14px) rotate(180deg) scale(1.08)} 100%{transform:translate(0,0) rotate(360deg)} }
        @keyframes v90-halo    { 0%,100%{opacity:0.50;transform:translateX(-50%) scale(0.90)} 50%{opacity:1;transform:translateX(-50%) scale(1.12)} }
        @keyframes v90-divine  { 0%,100%{opacity:0.30;transform:translateX(-50%) scale(0.80)} 50%{opacity:0.65;transform:translateX(-50%) scale(1.20)} }
        @keyframes v90-float   { 0%,100%{transform:translateY(0px) rotate(-1deg)} 50%{transform:translateY(-9px) rotate(1deg)} }
        @keyframes v90-shimmer { 0%{transform:translateX(-110%)} 100%{transform:translateX(210%)} }
        @keyframes v90-rune    { 0%,100%{opacity:0.18} 50%{opacity:0.38} }
        @keyframes v90-gem     { 0%,100%{opacity:0.80} 50%{opacity:1;filter:brightness(1.4)} }
        @keyframes v90-bevel   { 0%{box-shadow:0 6px 0 #7a5418, 0 0 40px rgba(232,200,122,0.45), inset 0 1px 0 rgba(255,240,180,0.60)} 50%{box-shadow:0 6px 0 #7a5418, 0 0 60px rgba(232,200,122,0.70), inset 0 1px 0 rgba(255,240,180,0.80)} 100%{box-shadow:0 6px 0 #7a5418, 0 0 40px rgba(232,200,122,0.45), inset 0 1px 0 rgba(255,240,180,0.60)} }
      `}</style>

      <motion.div
        initial={{ scale: 0.78, opacity: 0, y: 48 }}
        animate={{ scale: 1,    opacity: 1, y: 0  }}
        exit={{    scale: 0.88, opacity: 0, y: 24 }}
        transition={{ type: "spring", stiffness: 240, damping: 22, delay: 0.10 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 368,
          position: "relative",
          borderRadius: 28,
          padding: 3,                 /* border thickness */
          background: "linear-gradient(140deg, #fff0b0 0%, #C9A84C 28%, #6b3e0a 50%, #C9A84C 72%, #fff0b0 100%)",
          boxShadow: "0 0 0 1px rgba(232,200,122,0.20), 0 0 120px rgba(232,200,122,0.30), 0 32px 80px rgba(0,0,0,0.80)",
        }}
      >
        {/* Inner card */}
        <div style={{
          borderRadius: 26,
          background: "linear-gradient(170deg, rgba(22,13,2,0.99) 0%, rgba(10,6,1,1) 60%, rgba(18,11,3,0.99) 100%)",
          padding: "32px 24px 26px",
          position: "relative",
          overflow: "hidden",
        }}>

          {/* ── Swirling energy background ── */}
          <div aria-hidden style={{ position:"absolute", inset:0, borderRadius:26, pointerEvents:"none", overflow:"hidden" }}>
            <div style={{
              position:"absolute", top:"-30%", left:"-20%", width:"80%", height:"80%", borderRadius:"50%",
              background:"radial-gradient(circle, rgba(232,200,122,0.12) 0%, transparent 65%)",
              filter:"blur(40px)", animation:"v90-swirl1 12s ease-in-out infinite",
            }}/>
            <div style={{
              position:"absolute", bottom:"-20%", right:"-15%", width:"70%", height:"70%", borderRadius:"50%",
              background:"radial-gradient(circle, rgba(180,120,30,0.10) 0%, transparent 65%)",
              filter:"blur(36px)", animation:"v90-swirl2 16s ease-in-out infinite",
            }}/>
            {/* Stone-grain etchings */}
            <div style={{
              position:"absolute", inset:0,
              background:"repeating-linear-gradient(-18deg, transparent, transparent 11px, rgba(232,200,122,0.025) 11px, rgba(232,200,122,0.025) 12px)",
            }}/>
            <div style={{
              position:"absolute", inset:0,
              background:"repeating-linear-gradient(72deg, transparent, transparent 18px, rgba(255,255,255,0.008) 18px, rgba(255,255,255,0.008) 19px)",
            }}/>
          </div>

          {/* ── Corner rune etchings ── */}
          {([
            { style: { top:14, left:14 },  d:"M2 2 L2 18 M2 2 L18 2 M2 10 L8 10 M10 2 L10 8",       c:"M5 5 L5 14 M5 5 L14 5" },
            { style: { top:14, right:14 }, d:"M18 2 L18 18 M18 2 L2 2 M18 10 L12 10 M10 2 L10 8",    c:"M15 5 L15 14 M15 5 L6 5" },
            { style: { bottom:14, left:14 }, d:"M2 18 L2 2 M2 18 L18 18 M2 10 L8 10 M10 18 L10 12",  c:"M5 15 L5 6 M5 15 L14 15" },
            { style: { bottom:14, right:14 }, d:"M18 18 L18 2 M18 18 L2 18 M18 10 L12 10 M10 18 L10 12", c:"M15 15 L15 6 M15 15 L6 15" },
          ]).map((r, i) => (
            <svg key={i} aria-hidden width="20" height="20" viewBox="0 0 20 20" fill="none"
              style={{ position:"absolute", ...r.style, animation:"v90-rune 5s ease-in-out infinite", animationDelay:`${i*1.2}s`, pointerEvents:"none" }}>
              <path d={r.d} stroke="rgba(232,200,122,0.55)" strokeWidth="1" strokeLinecap="round"/>
              <path d={r.c} stroke="rgba(232,200,122,0.22)" strokeWidth="0.7" strokeLinecap="round"/>
            </svg>
          ))}

          {/* ── Divine light shaft behind crown ── */}
          <div aria-hidden style={{
            position:"absolute", top:0, left:"50%",
            width:260, height:200,
            background:"conic-gradient(from 270deg at 50% 0%, transparent 30%, rgba(232,200,122,0.14) 40%, rgba(255,240,160,0.22) 50%, rgba(232,200,122,0.14) 60%, transparent 70%)",
            filter:"blur(20px)",
            animation:"v90-divine 4s ease-in-out infinite",
          }}/>
          <div aria-hidden style={{
            position:"absolute", top:0, left:"50%",
            width:140, height:110, borderRadius:"0 0 50% 50%",
            background:"radial-gradient(ellipse at 50% 0%, rgba(255,248,200,0.35) 0%, transparent 70%)",
            filter:"blur(14px)",
            animation:"v90-halo 3s ease-in-out infinite",
          }}/>

          {/* ── Epic Crown ── */}
          <motion.div
            initial={{ y:-20, opacity:0, scale:0.6 }}
            animate={{ y:0, opacity:1, scale:1 }}
            transition={{ type:"spring", stiffness:200, damping:14, delay:0.22 }}
            style={{ position:"relative", zIndex:2, display:"flex", justifyContent:"center", marginBottom:22, animation:"v90-float 5s ease-in-out infinite" }}
          >
            <svg width="110" height="88" viewBox="0 0 110 88" fill="none" overflow="visible">
              <defs>
                <linearGradient id="m-crown-body" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%"   stopColor="#fff8d0"/>
                  <stop offset="20%"  stopColor="#f5d98a"/>
                  <stop offset="50%"  stopColor="#C9A84C"/>
                  <stop offset="80%"  stopColor="#8a6420"/>
                  <stop offset="100%" stopColor="#5a3e08"/>
                </linearGradient>
                <linearGradient id="m-crown-highlight" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%"   stopColor="rgba(255,255,220,0.55)"/>
                  <stop offset="100%" stopColor="rgba(255,255,220,0)"/>
                </linearGradient>
                <linearGradient id="m-crown-band" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%"   stopColor="#C9A84C"/>
                  <stop offset="40%"  stopColor="#8a6420"/>
                  <stop offset="100%" stopColor="#4a2e04"/>
                </linearGradient>
                <linearGradient id="m-ruby" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%"  stopColor="#ff9090"/>
                  <stop offset="50%" stopColor="#cc2233"/>
                  <stop offset="100%" stopColor="#7a0011"/>
                </linearGradient>
                <linearGradient id="m-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%"  stopColor="#80ffb0"/>
                  <stop offset="50%" stopColor="#1aaa55"/>
                  <stop offset="100%" stopColor="#0a5528"/>
                </linearGradient>
                <filter id="m-glow" x="-35%" y="-35%" width="170%" height="170%">
                  <feGaussianBlur stdDeviation="5" result="b"/>
                  <feFlood floodColor="#E8C87A" floodOpacity="0.75" result="c"/>
                  <feComposite in="c" in2="b" operator="in" result="g"/>
                  <feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
                <filter id="m-gem-glow" x="-80%" y="-80%" width="260%" height="260%">
                  <feGaussianBlur stdDeviation="3" result="b"/>
                  <feFlood floodColor="#ff4466" floodOpacity="0.80" result="c"/>
                  <feComposite in="c" in2="b" operator="in" result="g"/>
                  <feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
                <filter id="m-em-glow" x="-80%" y="-80%" width="260%" height="260%">
                  <feGaussianBlur stdDeviation="2.5" result="b"/>
                  <feFlood floodColor="#33ff88" floodOpacity="0.70" result="c"/>
                  <feComposite in="c" in2="b" operator="in" result="g"/>
                  <feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>

              {/* Drop shadow */}
              <ellipse cx="55" cy="85" rx="36" ry="4" fill="rgba(0,0,0,0.55)" filter="url(#m-glow)" opacity="0.5"/>

              {/* Crown body */}
              <path d="M8 74 L8 50 L26 22 L55 42 L84 22 L102 50 L102 74 Z"
                fill="url(#m-crown-body)" filter="url(#m-glow)"/>

              {/* Engraved vertical lines on body */}
              {[22, 36, 55, 74, 88].map((x, i) => (
                <line key={i} x1={x} y1="52" x2={x} y2="72"
                  stroke="rgba(90,60,8,0.35)" strokeWidth="0.8" strokeLinecap="round"/>
              ))}

              {/* Highlight facet on crown front */}
              <path d="M8 74 L8 50 L26 22 L55 42 L84 22 L102 50 L102 74 Z"
                fill="url(#m-crown-highlight)" opacity="0.35"/>

              {/* Base band */}
              <rect x="8" y="66" width="94" height="12" rx="3" fill="url(#m-crown-band)"/>
              {/* Band engraving */}
              <rect x="8" y="70" width="94" height="1" fill="rgba(255,240,160,0.20)"/>
              {/* Band rivet dots */}
              {[18, 36, 55, 74, 92].map((x) => (
                <circle key={x} cx={x} cy="72" r="2.2" fill="#C9A84C" stroke="rgba(255,240,140,0.50)" strokeWidth="0.8"/>
              ))}

              {/* Spike tip details */}
              {/* Top spike line details */}
              <line x1="55" y1="42" x2="55" y2="22" stroke="rgba(255,240,160,0.18)" strokeWidth="1.2"/>
              <line x1="26" y1="22" x2="8" y2="50" stroke="rgba(255,240,160,0.12)" strokeWidth="1"/>
              <line x1="84" y1="22" x2="102" y2="50" stroke="rgba(255,240,160,0.12)" strokeWidth="1"/>

              {/* ── Central Ruby — top spike ── */}
              <polygon points="55,12 61,22 55,28 49,22"
                fill="url(#m-ruby)" filter="url(#m-gem-glow)"
                style={{ animation:"v90-gem 3s ease-in-out infinite" }}/>
              {/* Ruby facet highlight */}
              <polygon points="55,13 59,20 55,16" fill="rgba(255,200,200,0.60)"/>
              <polygon points="55,13 51,20 55,16" fill="rgba(255,120,120,0.25)"/>

              {/* ── Left Emerald — left spike ── */}
              <polygon points="26,14 31,22 26,27 21,22"
                fill="url(#m-emerald)" filter="url(#m-em-glow)"
                style={{ animation:"v90-gem 3s ease-in-out infinite", animationDelay:"1s" }}/>
              <polygon points="26,15 29,21 26,18" fill="rgba(180,255,220,0.55)"/>

              {/* ── Right Emerald — right spike ── */}
              <polygon points="84,14 89,22 84,27 79,22"
                fill="url(#m-emerald)" filter="url(#m-em-glow)"
                style={{ animation:"v90-gem 3s ease-in-out infinite", animationDelay:"2s" }}/>
              <polygon points="84,15 87,21 84,18" fill="rgba(180,255,220,0.55)"/>

              {/* Band gem — small ruby center */}
              <circle cx="55" cy="72" r="4" fill="url(#m-ruby)" filter="url(#m-gem-glow)"/>
              <circle cx="55" cy="70" r="1.5" fill="rgba(255,200,200,0.70)"/>
            </svg>
          </motion.div>

          {/* ── Text ── */}
          <div style={{ position:"relative", zIndex:2, textAlign:"center" }}>
            <motion.p
              initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
              transition={{ delay:0.35, duration:0.4 }}
              style={{
                margin:"0 0 6px",
                fontSize:9, fontWeight:800, letterSpacing:"0.32em", textTransform:"uppercase",
                color:`${LG_GLOW}0.65)`, fontFamily:"DM Sans, sans-serif",
              }}
            >
              ✦ Day 90 · Sovereign ✦
            </motion.p>
            <motion.h1
              initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
              transition={{ delay:0.42, duration:0.5 }}
              style={{
                margin:"0 0 20px",
                fontFamily:"'Cormorant Garamond', Georgia, serif",
                fontSize:32, fontStyle:"italic", fontWeight:700,
                color:LG, lineHeight:1.18,
                textShadow:`0 0 40px ${LG_GLOW}0.70), 0 2px 0 rgba(0,0,0,0.80)`,
              }}
            >
              Full Brain Reset<br/>Complete
            </motion.h1>

            {/* Science bullets */}
            <motion.div
              initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
              transition={{ delay:0.52, duration:0.45 }}
              style={{
                background:"linear-gradient(135deg, rgba(232,200,122,0.06) 0%, rgba(232,200,122,0.03) 100%)",
                border:"1px solid rgba(232,200,122,0.20)",
                borderTop:"1px solid rgba(232,200,122,0.38)",
                borderRadius:16, padding:"14px 16px", marginBottom:22, textAlign:"left",
              }}
            >
              {[
                { icon:"🧠", text:"Your dopamine receptors have substantially regenerated. Cravings are no longer your default state." },
                { icon:"⚡", text:"Prefrontal cortex activity is measurably stronger. You are in full control." },
                { icon:"🔒", text:"The neural pathways of your old habit have begun to prune. What you built here is permanent." },
              ].map(({ icon, text }, i) => (
                <motion.div key={icon}
                  initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
                  transition={{ delay:0.58 + i * 0.10 }}
                  style={{ display:"flex", gap:12, marginBottom: i < 2 ? 10 : 0, alignItems:"flex-start" }}
                >
                  <span style={{ fontSize:15, flexShrink:0, lineHeight:1.55 }}>{icon}</span>
                  <p style={{ margin:0, fontSize:11.5, color:"rgba(255,255,255,0.58)", lineHeight:1.60, fontFamily:"DM Sans, sans-serif" }}>
                    {text}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            {/* ── Embossed gold bar CTA ── */}
            <motion.div
              initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
              transition={{ delay:0.72, type:"spring", stiffness:260, damping:22 }}
            >
              <motion.button
                whileHover={{ scale:1.025, y:-2 }}
                whileTap={{ scale:0.970, y:2 }}
                onClick={onDismiss}
                style={{
                  position:"relative", overflow:"hidden",
                  width:"100%", padding:"16px 0",
                  background:"linear-gradient(180deg, #fff0b0 0%, #E8C87A 18%, #C9A84C 50%, #9a7428 82%, #6b4c10 100%)",
                  border:"none",
                  borderRadius:14,
                  cursor:"pointer",
                  fontSize:14, fontWeight:900, letterSpacing:"0.10em",
                  color:"#1a0d00", fontFamily:"DM Sans, sans-serif",
                  boxShadow:"0 6px 0 #7a5418, 0 0 40px rgba(232,200,122,0.45), inset 0 1px 0 rgba(255,240,180,0.60)",
                  animation:"v90-bevel 3s ease-in-out infinite",
                  textShadow:"0 1px 0 rgba(255,255,200,0.50)",
                }}
              >
                {/* Shimmer sweep */}
                <span aria-hidden style={{
                  position:"absolute", inset:0, pointerEvents:"none",
                  background:"linear-gradient(108deg, transparent 25%, rgba(255,255,255,0.38) 42%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0.38) 58%, transparent 75%)",
                  animation:"v90-shimmer 2.6s ease-in-out infinite",
                  borderRadius:14,
                }}/>
                {/* Bevel top line */}
                <span aria-hidden style={{
                  position:"absolute", top:0, left:"8%", right:"8%", height:1,
                  background:"linear-gradient(90deg, transparent, rgba(255,255,255,0.60) 30%, rgba(255,255,255,0.60) 70%, transparent)",
                  borderRadius:1,
                }}/>
                <span style={{ position:"relative", zIndex:1 }}>
                  ✦ Claim Your Sovereignty ✦
                </span>
              </motion.button>
            </motion.div>

            {/* ── Share Your Path ── */}
            <motion.button
              initial={{ opacity:0 }} animate={{ opacity:1 }}
              transition={{ delay:0.85 }}
              whileHover={{ scale:1.03 }}
              whileTap={{ scale:0.96 }}
              onClick={handleShare}
              style={{
                marginTop:12, width:"100%", padding:"12px 0",
                background:"rgba(232,200,122,0.06)",
                border:"1px solid rgba(232,200,122,0.22)",
                borderRadius:13, cursor:"pointer",
                display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                fontSize:12, fontWeight:700, letterSpacing:"0.06em",
                color:`${LG_GLOW}0.80)`, fontFamily:"DM Sans, sans-serif",
              }}
            >
              {/* Share icon */}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="11" cy="2.5" r="1.8" stroke="currentColor" strokeWidth="1.2"/>
                <circle cx="2.5" cy="7"  r="1.8" stroke="currentColor" strokeWidth="1.2"/>
                <circle cx="11" cy="11.5" r="1.8" stroke="currentColor" strokeWidth="1.2"/>
                <line x1="4.2" y1="6.1"  x2="9.4" y2="3.4"  stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                <line x1="4.2" y1="7.9"  x2="9.4" y2="10.6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
              </svg>
              Share Your Path
            </motion.button>

            <p style={{ margin:"10px 0 0", fontSize:10, color:"rgba(255,255,255,0.18)", fontFamily:"DM Sans, sans-serif" }}>
              Tap backdrop to dismiss
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Neural Core ───────────────────────────────────────────────────────────────
function NeuralCore({ pct, day, legendary = false }: { pct: number; day: number; legendary?: boolean }) {
  // Switch palette based on legendary mode
  const P     = legendary ? LG      : NG;
  const P_DIM = legendary ? LG_DIM  : NG_DIM;
  const P_GLW = legendary ? LG_GLOW : NG_GLOW;

  const R = 76;
  const C = 2 * Math.PI * R;
  const offset = C * (1 - pct / 100);

  // Pulse speed: faster with longer streaks (1.6–4.5s)
  const pulseDur  = Math.max(1.6, 4.5 - day * 0.028);
  // Glow intensity: 0.20 → 0.70
  const glowAlpha = Math.min(0.70, 0.20 + day * 0.008);

  // 12 neural nodes at r=92
  const nodes = Array.from({ length: 12 }, (_, i) => {
    const a = (i * 30 - 90) * (Math.PI / 180);
    const active = i / 12 <= pct / 100;
    return { x: 98 + 92 * Math.cos(a), y: 98 + 92 * Math.sin(a), active };
  });

  return (
    <div className="relative flex items-center justify-center">
      <style>{`
        @keyframes nc-node    { 0%,100%{opacity:0.6} 50%{opacity:1} }
        @keyframes nc-nebula1 { 0%{transform:translate(0,0) scale(1)} 33%{transform:translate(18px,-12px) scale(1.08)} 66%{transform:translate(-10px,14px) scale(0.95)} 100%{transform:translate(0,0) scale(1)} }
        @keyframes nc-nebula2 { 0%{transform:translate(0,0) scale(1)} 40%{transform:translate(-20px,10px) scale(1.10)} 70%{transform:translate(14px,-8px) scale(0.94)} 100%{transform:translate(0,0) scale(1)} }
        @keyframes nc-nebula3 { 0%{transform:translate(0,0)} 50%{transform:translate(8px,16px) scale(1.06)} 100%{transform:translate(0,0)} }
      `}</style>

      {/* ── Nebula energy field — three slow-drifting blobs ── */}
      <div aria-hidden style={{ position:"absolute", inset:-60, pointerEvents:"none", overflow:"visible" }}>
        <div style={{
          position:"absolute", top:"10%", left:"5%", width:180, height:180, borderRadius:"50%",
          background:`radial-gradient(circle, ${P_GLW}${(glowAlpha*0.32).toFixed(2)}) 0%, transparent 70%)`,
          filter:"blur(36px)", animation:`nc-nebula1 ${pulseDur * 3.5}s ease-in-out infinite`,
        }}/>
        <div style={{
          position:"absolute", top:"30%", right:"8%", width:140, height:140, borderRadius:"50%",
          background:`radial-gradient(circle, ${P_GLW}${(glowAlpha*0.22).toFixed(2)}) 0%, transparent 65%)`,
          filter:"blur(28px)", animation:`nc-nebula2 ${pulseDur * 4.2}s ease-in-out infinite`,
        }}/>
        <div style={{
          position:"absolute", bottom:"5%", left:"20%", width:120, height:120, borderRadius:"50%",
          background:`radial-gradient(circle, ${P_GLW}${(glowAlpha*0.18).toFixed(2)}) 0%, transparent 70%)`,
          filter:"blur(24px)", animation:`nc-nebula3 ${pulseDur * 5}s ease-in-out infinite`,
        }}/>
      </div>

      {/* Primary pulse halo */}
      <motion.div aria-hidden
        animate={{ opacity:[glowAlpha*0.55, glowAlpha, glowAlpha*0.55], scale:[0.90,1.10,0.90] }}
        transition={{ repeat:Infinity, duration:pulseDur, ease:"easeInOut" }}
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{ background:`radial-gradient(circle, ${P_GLW}${glowAlpha}) 0%, transparent 62%)`, filter:"blur(32px)" }}
      />
      {/* Secondary halo — wider, offset */}
      <motion.div aria-hidden
        animate={{ opacity:[0.05,0.14,0.05], scale:[1,1.22,1] }}
        transition={{ repeat:Infinity, duration:pulseDur*1.6, ease:"easeInOut", delay:pulseDur*0.5 }}
        className="absolute rounded-full pointer-events-none"
        style={{ inset:-28, background:`radial-gradient(circle, ${P_GLW}0.12) 0%, transparent 55%)`, filter:"blur(22px)" }}
      />

      {/* Crown above ring — legendary mode only */}
      {legendary && (
        <motion.div aria-hidden
          initial={{ opacity:0, y:8, scale:0.7 }}
          animate={{ opacity:1, y:0, scale:1 }}
          transition={{ type:"spring", stiffness:240, damping:18, delay:0.3 }}
          style={{ position:"absolute", top:-42, left:"50%", transform:"translateX(-50%)", zIndex:2 }}
        >
          <svg width="36" height="28" viewBox="0 0 36 28" fill="none">
            <defs>
              <linearGradient id="nc-crown" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%"  stopColor="#fff0b0"/>
                <stop offset="60%" stopColor="#E8C87A"/>
                <stop offset="100%" stopColor="#a07830"/>
              </linearGradient>
              <filter id="nc-crown-glow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="2.5" result="b"/>
                <feFlood floodColor="#E8C87A" floodOpacity="0.80" result="c"/>
                <feComposite in="c" in2="b" operator="in" result="g"/>
                <feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>
            <path d="M2 26 L2 18 L9 7 L18 14 L27 7 L34 18 L34 26 Z"
              fill="url(#nc-crown)" filter="url(#nc-crown-glow)"/>
            <rect x="2" y="22" width="32" height="4" rx="1.5" fill="#a07830" opacity="0.65"/>
            <circle cx="18" cy="8"  r="2.2" fill="#fff" opacity="0.95" filter="url(#nc-crown-glow)"/>
            <circle cx="5"  cy="14" r="1.4" fill="#fff" opacity="0.75"/>
            <circle cx="31" cy="14" r="1.4" fill="#fff" opacity="0.75"/>
          </svg>
        </motion.div>
      )}

      <svg width="216" height="216" viewBox="0 0 196 196" overflow="visible">
        <defs>
          <linearGradient id="nc-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor={P_DIM}/>
            <stop offset="50%"  stopColor={P}/>
            <stop offset="100%" stopColor={legendary ? "#fff0b0" : "#6effc5"}/>
          </linearGradient>
          <filter id="nc-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.2" result="b"/>
            <feFlood floodColor={P} floodOpacity="0.60" result="c"/>
            <feComposite in="c" in2="b" operator="in" result="g"/>
            <feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="nc-node-glow" x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur stdDeviation="2.5" result="b"/>
            <feFlood floodColor={P} floodOpacity="0.90" result="c"/>
            <feComposite in="c" in2="b" operator="in" result="g"/>
            <feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Tick dial — 24 marks */}
        {Array.from({ length: 24 }, (_, i) => {
          const a = (i * 15 - 90) * (Math.PI / 180);
          const isMain = i % 6 === 0;
          return (
            <line key={i}
              x1={98 + 91 * Math.cos(a)} y1={98 + 91 * Math.sin(a)}
              x2={98 + (isMain ? 97 : 94) * Math.cos(a)} y2={98 + (isMain ? 97 : 94) * Math.sin(a)}
              stroke={`${P_GLW}${isMain ? 0.55 : 0.18})`}
              strokeWidth={isMain ? 1.4 : 0.7} strokeLinecap="round"
            />
          );
        })}

        {/* Track */}
        <circle cx="98" cy="98" r={R} fill="none" stroke={`${P_GLW}0.08)`} strokeWidth="12"/>

        {/* Broad spread glow behind arc */}
        <circle cx="98" cy="98" r={R} fill="none"
          stroke={P} strokeWidth="28"
          strokeDasharray={C} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 98 98)"
          opacity={glowAlpha * 0.15}
        />

        {/* Progress arc — rounded cap */}
        <circle cx="98" cy="98" r={R} fill="none"
          stroke="url(#nc-grad)" strokeWidth="11"
          strokeDasharray={C} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 98 98)"
          filter="url(#nc-glow)"
          style={{ transition:"stroke-dashoffset 1.4s cubic-bezier(0.22,1,0.36,1)" }}
        />

        {/* Neural nodes */}
        {nodes.map((n, i) => (
          <circle key={i} cx={n.x} cy={n.y}
            r={n.active ? 3.2 : 1.6}
            fill={n.active ? P : `${P_GLW}0.12)`}
            stroke={n.active ? P : `${P_GLW}0.20)`} strokeWidth="0.8"
            filter={n.active ? "url(#nc-node-glow)" : "none"}
            opacity={n.active ? 1 : 0.30}
            style={n.active ? { animation:`nc-node ${pulseDur}s ease-in-out ${i*0.13}s infinite` } : {}}
          />
        ))}

        {/* Connector lines: active nodes → center */}
        {nodes.filter(n => n.active).map((n, i) => (
          <line key={i} x1={n.x} y1={n.y} x2="98" y2="98"
            stroke={P} strokeWidth="0.5" opacity="0.07"/>
        ))}

        {/* Center — day count */}
        <text x="98" y="89" textAnchor="middle" fontSize="36" fontWeight="900"
          fill="#ffffff" fontFamily="'DM Sans', sans-serif" letterSpacing="-1.5"
          filter="url(#nc-glow)">
          {day}
        </text>
        <text x="98" y="107" textAnchor="middle" fontSize="10" fontWeight="700"
          fill="rgba(255,255,255,0.60)" fontFamily="'DM Sans', sans-serif" letterSpacing="0.14em">
          DAYS CLEAN
        </text>
        <text x="98" y="121" textAnchor="middle" fontSize="9"
          fill={`${P_GLW}0.60)`} fontFamily="'DM Sans', sans-serif" letterSpacing="0.08em">
          {legendary ? "SOVEREIGN" : `${pct}% TO 90d`}
        </text>
      </svg>

      {/* NEURAL CORE / SOVEREIGN label */}
      <div style={{
        position:"absolute", bottom:-4,
        fontSize:9, fontWeight:800, letterSpacing:"0.28em", textTransform:"uppercase",
        color:"#ffffff", fontFamily:"DM Sans, sans-serif",
        textShadow:`0 0 12px ${P_GLW}0.70)`,
      }}>
        {legendary ? "◆ SOVEREIGN ◆" : "◆ NEURAL CORE ◆"}
      </div>
    </div>
  );
}

// ── Premium Coin Card ─────────────────────────────────────────────────────────
function CoinCard({
  name, icon, earned, hint, index, t,
}: {
  name: string; icon: string; earned: boolean; hint: string; index: number; t: TFunction;
}) {
  const spinControls = useAnimation();

  const handleClick = async () => {
    if (!earned) return;
    await spinControls.start({
      rotateY: 360,
      transition: { duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] },
    });
    spinControls.set({ rotateY: 0 });
  };

  return (
    // Outer wrapper handles stagger entry
    <motion.div
      variants={earned ? undefined : msItem}
      initial={earned ? { scale: 0.82, opacity: 0 } : "hidden"}
      animate={earned ? { scale: [0.82, 1.08, 1], opacity: 1 } : "visible"}
      transition={
        earned
          ? { duration: 0.55, times: [0, 0.6, 1], delay: index * 0.1 }
          : { type: "spring", stiffness: 320, damping: 26 }
      }
    >
      {/* Inner wrapper handles interactivity + spin */}
      <motion.div
        animate={spinControls}
        whileHover={earned ? { scale: 1.05, y: -4, transition: { duration: 0.2, ease: "easeOut" } } : undefined}
        whileTap={earned ? { scale: 0.96 } : undefined}
        onClick={handleClick}
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 16,
          padding: 16,
          cursor: earned ? "pointer" : "default",
          background: earned
            ? "rgba(201,168,76,0.08)"
            : "#0f0c06",
          border: earned ? "1.5px solid rgba(201,168,76,0.4)" : "1px solid #2a2010",
          boxShadow: earned
            ? "0 0 20px rgba(201,168,76,0.08)"
            : "none",
          opacity: 1,
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        {/* ── Diagonal shimmer sweep — unlocked only ── */}
        {earned && (
          <motion.div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              borderRadius: 16,
              background:
                "linear-gradient(108deg, transparent 30%, rgba(255,220,120,0.06) 46%, rgba(201,168,76,0.20) 50%, rgba(255,220,120,0.06) 54%, transparent 70%)",
            }}
            animate={{ x: ["-110%", "210%"] }}
            transition={{
              duration: 2.0,
              repeat: Infinity,
              repeatDelay: 4,
              ease: "easeInOut",
            }}
          />
        )}

        {/* ── Icon circle ── */}
        <div
          style={{
            width: 50,
            height: 50,
            borderRadius: "50%",
            background: earned
              ? "radial-gradient(circle at 35% 30%, rgba(255,230,140,0.28), rgba(201,168,76,0.10))"
              : "rgba(255,255,255,0.03)",
            border: earned
              ? "1.5px solid rgba(201,168,76,0.45)"
              : "1px solid #2a2010",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            flexShrink: 0,
            filter: earned
              ? "drop-shadow(0 2px 10px rgba(201,168,76,0.5))"
              : "grayscale(1) opacity(0.5)",
            boxShadow: earned ? "0 0 18px rgba(201,168,76,0.30)" : "none",
          }}
        >
          {icon}
        </div>

        {/* ── Name ── */}
        <p
          style={{
            marginTop: 12,
            marginBottom: 0,
            fontSize: 14,
            fontWeight: earned ? 700 : 600,
            color: earned ? "#ffffff" : "rgba(255,255,255,0.5)",
            lineHeight: 1.3,
            fontFamily: "DM Sans, sans-serif",
          }}
        >
          {name}
        </p>

        {/* ── Status pill or progress hint ── */}
        {earned ? (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              marginTop: 8,
              background: "rgba(201,168,76,0.14)",
              border: "1px solid rgba(201,168,76,0.38)",
              borderRadius: 20,
              padding: "3px 10px",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.06em",
              color: GOLD,
            }}
          >
            ✓ {t("progress.achieved")}
          </div>
        ) : (
          <p
            style={{
              marginTop: 6,
              marginBottom: 0,
              fontSize: 11,
              color: "#3a3020",
              lineHeight: 1.45,
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            {hint}
          </p>
        )}

        {/* ── Lock badge — locked cards ── */}
        {!earned && (
          <div
            style={{
              position: "absolute",
              bottom: 12,
              right: 12,
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: "#0f0c06",
              border: "1px solid #2a2010",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Lock size={16} color="#2a2010" strokeWidth={2.5} />
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ── Legacy rank tiers — must stay sorted highest min first ───────────────────
const RANK_TIERS = [
  { min: 90, name: "Sovereign", roman: "V",   color: "#E8C87A",               glow: "rgba(232,200,122,0.38)", desc: "You have mastered the battle within." },
  { min: 60, name: "Sentinel",  roman: "IV",  color: "#7ec8e3",               glow: "rgba(126,200,227,0.28)", desc: "Two months of unbroken discipline." },
  { min: 30, name: "Forge",     roman: "III", color: "#c87ea8",               glow: "rgba(200,126,168,0.26)", desc: "A month of fire has hardened your will." },
  { min: 7,  name: "Guardian",  roman: "II",  color: "#a8c87c",               glow: "rgba(168,200,124,0.26)", desc: "You have survived the first test." },
  { min: 0,  name: "Initiate",  roman: "I",   color: "rgba(255,255,255,0.55)", glow: "rgba(255,255,255,0.08)", desc: "The path begins here. Keep going." },
] as const;

function getRank(totalDays: number) {
  return RANK_TIERS.find((r) => totalDays >= r.min) ?? RANK_TIERS[RANK_TIERS.length - 1];
}

// ── Sacred card shell (stone-textured) ───────────────────────────────────────
const STONE_CARD: React.CSSProperties = {
  background: "linear-gradient(160deg, rgba(22,16,7,0.97) 0%, rgba(12,9,3,0.99) 100%)",
  border: "1px solid rgba(201,168,76,0.16)",
  borderTop: "1px solid rgba(201,168,76,0.30)",
  borderRadius: 18,
  position: "relative",
  overflow: "hidden",
};

// ── Bio-scanner helpers ───────────────────────────────────────────────────────
const MONO = '"DM Mono", "JetBrains Mono", "Courier New", monospace';

function generatePruningData(day: number): number[] {
  const PTS = 34;
  return Array.from({ length: PTS }, (_, i) => {
    const isFuture = i / (PTS - 1) > Math.min(day / 90, 0.96);
    const rawSpike = Math.abs(Math.sin(i * 2.17) * 0.55 + Math.sin(i * 0.83 + 1.2) * 0.35 + 0.12);
    const pruned = isFuture ? 0.82 : Math.max(0.04, 1 - (day / 90) * 0.91);
    return Math.min(1, rawSpike * pruned);
  });
}

function toSvgPath(pts: { x: number; y: number }[]): string {
  return pts.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    const prev = pts[i - 1];
    const cx = ((prev.x + p.x) / 2).toFixed(1);
    return `${acc} C ${cx} ${prev.y.toFixed(1)}, ${cx} ${p.y.toFixed(1)}, ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  }, "");
}

// ── Circular dopamine gauge ───────────────────────────────────────────────────
function DopamineGauge({ pct, day }: { pct: number; day: number }) {
  const R = 66, CIRC = 2 * Math.PI * R;
  const targetOffset = CIRC * (1 - pct / 100);
  const isStabilizing = pct >= 50;

  return (
    <div style={{ ...STONE_CARD, padding: "18px 16px 16px", marginBottom: 10 }}>
      {/* grain overlay */}
      <div aria-hidden style={{
        position: "absolute", inset: 0, borderRadius: 18, pointerEvents: "none",
        background: "repeating-linear-gradient(-22deg,transparent,transparent 8px,rgba(57,217,138,0.013) 8px,rgba(57,217,138,0.013) 9px)",
      }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        {/* top label row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.17em", color: "rgba(57,217,138,0.65)", textTransform: "uppercase", fontFamily: MONO }}>
            DOPAMINE SENSITIVITY
          </span>
          <span style={{ fontSize: 9, color: "rgba(57,217,138,0.38)", fontFamily: MONO, letterSpacing: "0.10em" }}>
            BIOFEED_v2.1
          </span>
        </div>

        {/* gauge + readouts row */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {/* SVG gauge */}
          <div style={{ flexShrink: 0, position: "relative" }}>
            <svg width="148" height="148" viewBox="0 0 148 148" style={{ overflow: "visible" }}>
              <defs>
                <linearGradient id="dg-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%"   stopColor="#4A9ECC" />
                  <stop offset="100%" stopColor={NG} />
                </linearGradient>
                <filter id="dg-glow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="3" result="b" />
                  <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>
              {/* track */}
              <circle cx="74" cy="74" r={R} fill="none" stroke="rgba(255,255,255,0.055)" strokeWidth="9" />
              {/* pulse ring */}
              <motion.circle
                cx="74" cy="74" r={R} fill="none"
                stroke={`rgba(57,217,138,0.12)`} strokeWidth="18"
                animate={{ opacity: [0.12, 0, 0.12], scale: [1, 1.05, 1] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                style={{ transformOrigin: "74px 74px" }}
              />
              {/* sweep arc — initialises from 0 to target */}
              <motion.circle
                cx="74" cy="74" r={R}
                fill="none"
                stroke="url(#dg-grad)"
                strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray={CIRC}
                initial={{ strokeDashoffset: CIRC }}
                animate={{ strokeDashoffset: targetOffset }}
                transition={{ duration: 1.9, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
                transform="rotate(-90 74 74)"
                filter="url(#dg-glow)"
              />
              {/* center readout */}
              <text x="74" y="68" textAnchor="middle"
                fill={NG} fontSize="26" fontWeight="800" fontFamily={MONO}>
                {pct}%
              </text>
              <text x="74" y="86" textAnchor="middle"
                fill="rgba(255,255,255,0.28)" fontSize="7.5" fontFamily={MONO} letterSpacing="2">
                SENSITIVITY
              </text>
            </svg>
          </div>

          {/* right-side digital readouts */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
            {/* day counter */}
            <div style={{ padding: "9px 11px", borderRadius: 11, background: "rgba(57,217,138,0.055)", border: "1px solid rgba(57,217,138,0.16)" }}>
              <p style={{ fontSize: 8, color: "rgba(57,217,138,0.50)", letterSpacing: "0.14em", textTransform: "uppercase", margin: "0 0 4px", fontFamily: MONO }}>
                DAY_COUNT
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 24, fontWeight: 800, color: "#f5ede0", fontFamily: MONO, letterSpacing: "-0.01em" }}>
                  {String(day).padStart(3, "0")}
                </span>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                  <svg width="9" height="9" viewBox="0 0 9 9"><path d="M4.5 0 L9 9 L0 9 Z" fill={NG}/></svg>
                  <span style={{ fontSize: 6.5, color: NG, fontWeight: 800, letterSpacing: "0.10em", fontFamily: MONO }}>RISING</span>
                </div>
              </div>
            </div>

            {/* status rows */}
            {([
              { label: "DOPAMINE",  value: isStabilizing ? "STABILIZING" : "RECOVERING", color: isStabilizing ? NG : "#4A9ECC" },
              { label: "PRUNING",   value: day > 7 ? "ACTIVE" : "INITIATING",            color: NG },
              { label: "BASELINE",  value: day >= 30 ? "RESETTING" : "ADAPTING",         color: day >= 30 ? NG : "#4A9ECC" },
            ] as const).map((s) => (
              <div key={s.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 7.5, color: "rgba(255,255,255,0.28)", letterSpacing: "0.12em", fontFamily: MONO }}>{s.label}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <motion.span
                    animate={{ opacity: [1, 0.25, 1] }}
                    transition={{ duration: 1.7, repeat: Infinity, delay: Math.random() * 0.8 }}
                    style={{ width: 5, height: 5, borderRadius: "50%", background: s.color, display: "block", flexShrink: 0, boxShadow: `0 0 6px ${s.color}` }}
                  />
                  <span style={{ fontSize: 7.5, color: s.color, fontWeight: 700, letterSpacing: "0.10em", fontFamily: MONO }}>{s.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Neural pruning line chart ─────────────────────────────────────────────────
function NeuralPruningGraph({ day }: { day: number }) {
  const W = 300, H = 70;
  const data   = generatePruningData(day);
  const points = data.map((y, i) => ({ x: (i / (data.length - 1)) * W, y: H - y * H * 0.80 - 4 }));
  const path   = toSvgPath(points);
  const prunedPct = Math.min(100, Math.round((day / 90) * 100));
  const nowIdx = Math.min(points.length - 1, Math.floor((day / 90) * (points.length - 1)));
  const svgRef = useRef<SVGSVGElement>(null);
  const [probe, setProbe] = useState<{ idx: number; x: number; y: number } | null>(null);

  const handleSvgTouch = useCallback((e: React.TouchEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const relX = Math.max(0, Math.min(1, (e.touches[0].clientX - rect.left) / rect.width));
    const idx = Math.round(relX * (points.length - 1));
    setProbe({ idx, x: points[idx].x, y: points[idx].y });
  }, [points]);

  const clearProbe = useCallback(() => setProbe(null), []);

  return (
    <div style={{
      ...STONE_CARD, padding: "16px 16px 14px", marginTop: 10,
      border: "1px solid rgba(57,217,138,0.14)",
      boxShadow: "0 0 24px rgba(57,217,138,0.07), inset 0 0 32px rgba(57,217,138,0.03)",
    }}>
      {/* scanlines */}
      <div aria-hidden style={{
        position: "absolute", inset: 0, borderRadius: 18, pointerEvents: "none",
        background: "repeating-linear-gradient(-22deg,transparent,transparent 8px,rgba(57,217,138,0.018) 8px,rgba(57,217,138,0.018) 9px)",
      }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        {/* label row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <motion.span
            style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.17em", color: "rgba(57,217,138,0.95)", textTransform: "uppercase", fontFamily: MONO, textShadow: "0 0 10px rgba(57,217,138,0.85)" }}
            animate={{ opacity: [0.75, 1, 0.75] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            NEURAL PRUNING
          </motion.span>
          <motion.span
            style={{ fontSize: 9, fontWeight: 700, color: "rgba(57,217,138,0.80)", fontFamily: MONO, letterSpacing: "0.08em", textShadow: "0 0 8px rgba(57,217,138,0.65)" }}
            animate={{ opacity: [0.55, 1, 0.55] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.6 }}
          >
            {prunedPct}%_PRUNED
          </motion.span>
        </div>

        <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block", overflow: "visible", touchAction: "none" }}
          onTouchStart={handleSvgTouch} onTouchMove={handleSvgTouch} onTouchEnd={clearProbe}>
          <defs>
            {/* multi-layer glow for the line */}
            <filter id="np-glow" x="-30%" y="-120%" width="160%" height="340%">
              <feGaussianBlur stdDeviation="5" result="blur-wide" in="SourceGraphic"/>
              <feGaussianBlur stdDeviation="2.5" result="blur-tight" in="SourceGraphic"/>
              <feMerge>
                <feMergeNode in="blur-wide"/>
                <feMergeNode in="blur-tight"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            {/* extra-wide glow for the dot */}
            <filter id="np-dot-glow" x="-200%" y="-200%" width="500%" height="500%">
              <feGaussianBlur stdDeviation="5" result="b1" in="SourceGraphic"/>
              <feGaussianBlur stdDeviation="10" result="b2" in="SourceGraphic"/>
              <feMerge>
                <feMergeNode in="b2"/>
                <feMergeNode in="b1"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            {/* line gradient: ghost → bright green */}
            <linearGradient id="np-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"                              stopColor="rgba(255,255,255,0.05)" />
              <stop offset={`${Math.max(5,prunedPct-22)}%`} stopColor="rgba(57,217,138,0.18)" />
              <stop offset={`${Math.max(10,prunedPct-4)}%`} stopColor={NG} />
              <stop offset="100%"                            stopColor={NG} />
            </linearGradient>
            {/* area gradient */}
            <linearGradient id="np-area" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"             stopColor="rgba(57,217,138,0.00)" />
              <stop offset={`${prunedPct}%`} stopColor="rgba(57,217,138,0.14)" />
              <stop offset="100%"           stopColor="rgba(57,217,138,0.14)" />
            </linearGradient>
          </defs>

          {/* grid lines — slightly green tinted */}
          {[0.25, 0.5, 0.75].map((t) => (
            <line key={t} x1="0" y1={H*t} x2={W} y2={H*t}
              stroke="rgba(57,217,138,0.07)" strokeWidth="0.5"/>
          ))}

          {/* soft wide shadow behind main line for depth */}
          <motion.path
            d={path} fill="none"
            stroke="rgba(57,217,138,0.12)" strokeWidth="7"
            strokeLinecap="round" strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2.2, ease: "easeInOut", delay: 0.15 }}
          />

          {/* area fill — breathes */}
          <motion.path
            d={`${path} L ${W} ${H} L 0 ${H} Z`}
            fill="url(#np-area)"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0.55, 0.75] }}
            transition={{ duration: 1.2, delay: 0.6, times: [0, 0.4, 0.7, 1],
              repeat: Infinity, repeatType: "reverse", repeatDelay: 2 }}
          />

          {/* main glowing line */}
          <motion.path
            d={path} fill="none"
            stroke="url(#np-grad)" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
            filter="url(#np-glow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2.2, ease: "easeInOut", delay: 0.15 }}
          />

          {/* outer ring burst */}
          <motion.circle
            cx={points[nowIdx].x} cy={points[nowIdx].y}
            r="6" fill="none" stroke={NG} strokeWidth="0.8"
            animate={{ r: [6, 14, 6], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2.2, repeat: Infinity }}
          />
          {/* mid glow ring */}
          <motion.circle
            cx={points[nowIdx].x} cy={points[nowIdx].y}
            r="5" fill="rgba(57,217,138,0.12)"
            filter="url(#np-dot-glow)"
            animate={{ r: [5, 7, 5], opacity: [0.9, 0.4, 0.9] }}
            transition={{ duration: 2.2, repeat: Infinity, delay: 0.1 }}
          />
          {/* solid dot */}
          <motion.circle
            cx={points[nowIdx].x} cy={points[nowIdx].y}
            r="3.5" fill={NG}
            filter="url(#np-dot-glow)"
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ duration: 2.2, repeat: Infinity }}
          />
          {/* bright white core */}
          <circle cx={points[nowIdx].x} cy={points[nowIdx].y} r="1.2" fill="white" opacity={0.9} />

          {/* ── Touch probe — vertical line + bubble ── */}
          {probe && (
            <g>
              <line x1={probe.x} y1={0} x2={probe.x} y2={H}
                stroke="rgba(57,217,138,0.5)" strokeWidth="0.8" strokeDasharray="3 2"/>
              <circle cx={probe.x} cy={probe.y} r="4" fill={NG} opacity={0.9}/>
              <circle cx={probe.x} cy={probe.y} r="2" fill="white" opacity={0.95}/>
              <g transform={`translate(${probe.x > W * 0.65 ? probe.x - 72 : probe.x + 6}, ${Math.max(4, probe.y - 22)})`}>
                <rect x="0" y="0" width="66" height="20" rx="4"
                  fill="rgba(6,20,12,0.92)" stroke="rgba(57,217,138,0.45)" strokeWidth="0.7"/>
                <text x="8" y="8.5" fontSize="6.5" fontWeight="700" fill={NG} fontFamily="monospace">
                  {`DAY_${String(Math.round((probe.idx / (points.length - 1)) * 90)).padStart(2,"0")}`}
                </text>
                <text x="8" y="16" fontSize="6" fill="rgba(255,255,255,0.60)" fontFamily="monospace">
                  {`${Math.min(100, Math.round((probe.idx / (points.length - 1)) * 100))}% pruned`}
                </text>
              </g>
            </g>
          )}
          {/* transparent hit area for reliable touch */}
          <rect x="0" y="0" width={W} height={H} fill="transparent"/>
        </svg>

        {/* axis labels */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          <span style={{ fontSize: 7.5, color: "rgba(255,255,255,0.20)", fontFamily: MONO }}>DAY_01</span>
          <motion.span
            style={{ fontSize: 7.5, color: "rgba(57,217,138,0.75)", fontFamily: MONO, textShadow: "0 0 6px rgba(57,217,138,0.55)" }}
            animate={{ opacity: [0.55, 1, 0.55] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          >
            ▶ DAY_{String(Math.max(day, 1)).padStart(2, "0")}
          </motion.span>
          <span style={{ fontSize: 7.5, color: "rgba(255,255,255,0.20)", fontFamily: MONO }}>DAY_90</span>
        </div>
      </div>
    </div>
  );
}

// ── Pattern Detector — "Learn how it works" disclosure ───────────────────────
function PdLearnMore() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position:"relative", zIndex:1, width:"100%", maxWidth:280 }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display:"flex", alignItems:"center", justifyContent:"center", gap:6,
          width:"100%", padding:"8px 0", background:"none", border:"none", cursor:"pointer",
          color:"rgba(255,255,255,0.32)", fontSize:11, fontFamily:"DM Sans, sans-serif", fontWeight:600,
          letterSpacing:"0.04em",
        }}
      >
        {/* Info circle icon */}
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
          <path d="M6.5 5.8v3.5M6.5 4.2v.1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
        {open ? "Hide" : "Learn how it works"}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
          style={{ transform: open ? "rotate(180deg)" : "none", transition:"transform 0.2s ease" }}>
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }} exit={{ opacity:0, height:0 }}
            transition={{ duration:0.22, ease:"easeOut" }}
            style={{ overflow:"hidden" }}
          >
            <div style={{
              background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)",
              borderRadius:12, padding:"12px 14px", display:"flex", flexDirection:"column", gap:8,
            }}>
              {[
                { icon:"🧠", text:"Each relapse you log teaches the detector your personal trigger patterns." },
                { icon:"📅", text:"It identifies your riskiest days of the week and times of day." },
                { icon:"⚡", text:"Battle Reports give you actionable plans — not just data." },
              ].map(({ icon, text }) => (
                <div key={icon} style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                  <span style={{ fontSize:14, flexShrink:0, lineHeight:1.4 }}>{icon}</span>
                  <p style={{ margin:0, fontSize:11, color:"rgba(255,255,255,0.40)", lineHeight:1.55, fontFamily:"DM Sans, sans-serif" }}>
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
function ProgressScreen() {
  const { t } = useTranslation();
  const [state, update] = useAppState();
  const [progressView, setProgressView] = useState<"grid" | "bars" | "streak">("grid");
  const [showVictory, setShowVictory] = useState(false);
  const [barTip, setBarTip] = useState<number | null>(null);

  // ── Dev mode ──────────────────────────────────────────────────────────────
  const [devOpen, setDevOpen] = useState(false);
  const devTapCount = useRef(0);
  const devTapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Local dev overrides — don't write to real store unless intentional
  const [devDay, setDevDay] = useState<number | null>(null);
  const [devConfetti, setDevConfetti] = useState(false);

  function handleDevTap() {
    devTapCount.current += 1;
    if (devTapTimer.current) clearTimeout(devTapTimer.current);
    devTapTimer.current = setTimeout(() => { devTapCount.current = 0; }, 600);
    if (devTapCount.current >= 3) {
      devTapCount.current = 0;
      setDevOpen((v) => !v);
    }
  }

  function devSimulateDay(d: number) {
    const msSinceStart = (d - 1) * 86400000;
    const fakeStart = Date.now() - msSinceStart;
    if (state.addictions.length > 0) {
      const updated = state.addictions.map((a, i) =>
        i === 0 ? { ...a, startDate: fakeStart } : a
      );
      update({ addictions: updated, startDate: fakeStart });
    } else {
      update({ startDate: fakeStart });
    }
    setDevDay(d);
    if (d >= 90) {
      setDevConfetti(true);
      setTimeout(() => setDevConfetti(false), 4000);
      update({ hasCelebrated90: false }); // re-arm celebration
    }
  }

  const active = activeAddiction(state);

  const day = active ? dayCount(active.startDate) : 0;
  const recoveryPct = Math.min(100, Math.round((day / 90) * 100));
  const legendary = day >= 90;

  // 90-day celebration — trigger once, persist to localStorage via store
  useEffect(() => {
    if (day >= 90 && !state.hasCelebrated90) {
      // Small delay so the page renders before the modal fires
      const t = setTimeout(() => setShowVictory(true), 800);
      return () => clearTimeout(t);
    }
  }, [day, state.hasCelebrated90]);

  const handleDismissVictory = () => {
    setShowVictory(false);
    update({ hasCelebrated90: true });
  };

  if (!active) return null;

  const longest = longestCleanPeriod(state);
  const daysSinceStart = Math.floor((Date.now() - active.startDate) / 86400000);
  const totalLogins = state.loginHistory?.length ?? 0;

  // Real login heatmap — 84 days (12 weeks), 1 cell per day
  const loginDaySet = new Set(
    (state.loginHistory ?? []).map((ts) => new Date(ts).toISOString().slice(0, 10))
  );
  const cells = Array.from({ length: 84 }, (_, i) => {
    const d = new Date(Date.now() - (83 - i) * 86400000);
    return loginDaySet.has(d.toISOString().slice(0, 10)) ? 3 : 0;
  });

  // Weekly bar chart — last 8 weeks, count unique login days per week
  const weekBars = Array.from({ length: 8 }, (_, w) => {
    let count = 0;
    for (let d = 0; d < 7; d++) {
      const dayOffset = (7 - w) * 7 - d - 1;
      const dateStr = new Date(Date.now() - dayOffset * 86400000).toISOString().slice(0, 10);
      if (loginDaySet.has(dateStr)) count++;
    }
    return count; // 0–7
  });

  // ── Legacy rank — driven by live streak (day), not the legacy totalCleanDays counter ──
  const rank = getRank(day);
  const nextRankTier = RANK_TIERS.slice().reverse().find((r) => day < r.min && r.min > 0);
  const daysToNextRank = nextRankTier ? nextRankTier.min - day : 0;

  // ── Dopamine dashboard data ───────────────────────────────────────────────
  const relapses = state.relapses ?? [];
  const avgRelapseDays = relapses.length > 1
    ? Math.round((relapses[relapses.length - 1].ts - relapses[0].ts) / ((relapses.length - 1) * 86400000))
    : null;
  const DOW_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const DOW_FULL  = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const dowCounts = Array(7).fill(0);
  const hourCounts = Array(4).fill(0); // morning/afternoon/evening/night
  relapses.forEach((r) => {
    const d = new Date(r.ts);
    dowCounts[d.getDay()]++;
    const h = d.getHours();
    if (h < 6) hourCounts[3]++; else if (h < 12) hourCounts[0]++; else if (h < 18) hourCounts[1]++; else hourCounts[2]++;
  });
  const peakDow      = dowCounts.every((c) => c === 0) ? null : DOW_NAMES[dowCounts.indexOf(Math.max(...dowCounts))];
  const peakDowIndex = dowCounts.every((c) => c === 0) ? -1   : dowCounts.indexOf(Math.max(...dowCounts));
  const peakDowFull  = peakDowIndex >= 0 ? DOW_FULL[peakDowIndex] : null;
  const peakTimeName = ["morning","afternoon","evening","late night"][hourCounts.indexOf(Math.max(...hourCounts))];
  const recentRelapse = relapses.some((r) => Date.now() - r.ts < 48 * 3600_000);
  const hasDeepRoots = state.treeUnlocks?.includes("root-deep");

  const urgesSurvived = state.urgesSurvived ?? 0;
  const rem7 = Math.max(0, 7 - day);
  const milestones = [
    {
      name: t("progress.milestones.firstWeek"),
      icon: "🛡️",
      earned: day >= 7,
      hint: rem7 === 0 ? t("progress.milestones.done") : rem7 === 1 ? t("progress.milestones.firstWeek_remaining", { count: rem7 }) : t("progress.milestones.firstWeek_remaining_plural", { count: rem7 }),
    },
    {
      name: t("progress.milestones.thirtyDays"),
      icon: "🎖️",
      earned: day >= 30,
      hint: day >= 30 ? t("progress.milestones.done") : t("progress.milestones.thirtyDays_remaining", { count: Math.max(0, 30 - day) }),
    },
    {
      name: t("progress.milestones.tenUrges"),
      icon: "🔥",
      earned: urgesSurvived >= 10,
      hint: urgesSurvived >= 10 ? t("progress.milestones.done") : Math.max(0, 10 - urgesSurvived) === 1 ? t("progress.milestones.tenUrges_remaining", { count: 1 }) : t("progress.milestones.tenUrges_remaining_plural", { count: Math.max(0, 10 - urgesSurvived) }),
    },
    {
      name: t("progress.milestones.ninetyDays"),
      icon: "👑",
      earned: day >= 90,
      hint: day >= 90 ? t("progress.milestones.done") : t("progress.milestones.ninetyDays_remaining", { count: Math.max(0, 90 - day) }),
    },
  ];
  const unlockedCount = milestones.filter((m) => m.earned).length;

  return (
    <PageShell>
      {/* ── 90-day celebration overlays ─────────────────────── */}
      <Confetti active={showVictory || devConfetti} />
      <AnimatePresence>
        {showVictory && <Victory90Modal onDismiss={handleDismissVictory} addiction={active?.name} />}
      </AnimatePresence>

      {/* ── Header ──────────────────────────────────────────── */}
      <header className="px-6 pt-12 pb-2 fade-up">
        <div onClick={handleDevTap} style={{ cursor: "default", userSelect: "none", display: "inline-block" }}>
          <SectionTitle>{t("nav.progress")}</SectionTitle>
        </div>
        <p style={{ fontSize: 13, color: "#ffffff", opacity: 0.45, marginTop: 4, fontFamily: "DM Sans, sans-serif", fontWeight: 400 }}>
          {t("progress.header")}
        </p>
      </header>

      {/* ── Dev Panel (triple-tap "Progress" to toggle) ──────── */}
      {devOpen && (
        <div style={{
          margin: "8px 16px 0",
          padding: "14px 16px",
          borderRadius: 16,
          background: "rgba(20,20,20,0.92)",
          border: "1px solid rgba(255,80,80,0.35)",
          backdropFilter: "blur(16px)",
        }}>
          {/* Header row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", color: "#ff5555", textTransform: "uppercase" }}>
              🛠 Dev Mode
            </span>
            <button onClick={() => setDevOpen(false)} style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", background: "none", border: "none", cursor: "pointer", padding: "0 4px" }}>✕</button>
          </div>

          {/* ── SECTION 1: SIMULATE DAY ── */}
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 6, letterSpacing: "0.12em", textTransform: "uppercase" }}>Simulate Day</p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
            {([
              { label: "Day 1",   d: 1  },
              { label: "Day 7",   d: 7  },
              { label: "Day 30",  d: 30 },
              { label: "Day 60",  d: 60 },
              { label: "Day 90+", d: 90 },
            ] as const).map(({ label, d }) => {
              const isActive = devDay === d;
              const isGold = d >= 90;
              return (
                <button key={d} onClick={() => devSimulateDay(d)}
                  style={{
                    fontSize: 11, padding: "5px 11px", borderRadius: 8, cursor: "pointer",
                    background: isActive
                      ? (isGold ? "rgba(201,168,76,0.22)" : "rgba(201,168,76,0.14)")
                      : "rgba(255,255,255,0.06)",
                    border: isActive
                      ? "1px solid rgba(201,168,76,0.60)"
                      : "1px solid rgba(255,255,255,0.12)",
                    color: isActive ? "#C9A84C" : "rgba(255,255,255,0.70)",
                    fontWeight: isActive ? 700 : 400,
                  }}>
                  {label}
                </button>
              );
            })}
          </div>

          {/* Day 90+ celebration banner */}
          {devDay !== null && devDay >= 90 && (
            <div style={{
              marginBottom: 14, padding: "10px 14px", borderRadius: 10,
              background: "rgba(201,168,76,0.10)", border: "1px solid rgba(201,168,76,0.35)",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ fontSize: 16 }}>🎉</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#C9A84C", fontFamily: "DM Sans, sans-serif" }}>
                90 Day Reset Achieved!
              </span>
            </div>
          )}

          {/* ── SECTION 2: PRO / FREE ── */}
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 6, letterSpacing: "0.12em", textTransform: "uppercase" }}>Access</p>
          <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
            {(["FREE", "PRO"] as const).map((tier) => {
              const isActive = tier === "PRO" ? state.isPremium : !state.isPremium;
              return (
                <button key={tier} onClick={() => update({ isPremium: tier === "PRO" })}
                  style={{
                    fontSize: 11, padding: "5px 16px", borderRadius: 8, cursor: "pointer",
                    background: isActive ? "rgba(201,168,76,0.18)" : "rgba(255,255,255,0.06)",
                    border: isActive ? "1px solid rgba(201,168,76,0.55)" : "1px solid rgba(255,255,255,0.12)",
                    color: isActive ? "#C9A84C" : "rgba(255,255,255,0.55)",
                    fontWeight: isActive ? 700 : 400,
                  }}>
                  {tier}
                </button>
              );
            })}
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.30)", alignSelf: "center", marginLeft: 4 }}>
              {state.isPremium ? "All features unlocked" : "Premium locked"}
            </span>
          </div>

          {/* ── SECTION 3: STREAK SIMULATION ── */}
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 6, letterSpacing: "0.12em", textTransform: "uppercase" }}>Streak</p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
            {([
              { label: "0 days",  d: 1  },
              { label: "7 days",  d: 7  },
              { label: "30 days", d: 30 },
              { label: "90 days", d: 90 },
            ] as const).map(({ label, d }) => {
              const isActive = devDay === d;
              return (
                <button key={d} onClick={() => devSimulateDay(d)}
                  style={{
                    fontSize: 11, padding: "5px 11px", borderRadius: 8, cursor: "pointer",
                    background: isActive ? "rgba(201,168,76,0.14)" : "rgba(255,255,255,0.06)",
                    border: isActive ? "1px solid rgba(201,168,76,0.55)" : "1px solid rgba(255,255,255,0.12)",
                    color: isActive ? "#C9A84C" : "rgba(255,255,255,0.70)",
                    fontWeight: isActive ? 700 : 400,
                  }}>
                  {label}
                </button>
              );
            })}
          </div>

          {/* ── SECTION 4: RESET ── */}
          <button
            onClick={() => {
              const freshStart = Date.now() - 0; // Day 1
              const updated = state.addictions.map((a, i) =>
                i === 0 ? { ...a, startDate: freshStart } : a
              );
              update({
                addictions: updated.length ? updated : state.addictions,
                startDate: freshStart,
                isPremium: false,
                hasCelebrated90: false,
                relapses: [],
                totalCleanDays: 0,
                urgesSurvived: 0,
              });
              setDevDay(null);
            }}
            style={{
              width: "100%", padding: "8px 0", borderRadius: 10, cursor: "pointer",
              background: "rgba(255,80,80,0.08)", border: "1px solid rgba(255,80,80,0.28)",
              color: "#ff6666", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            Reset All → Day 1
          </button>
        </div>
      )}

      {/* ── Neural Core hero ──────────────────────────────── */}
      <section className="flex flex-col items-center pt-6 pb-4 px-6 fade-up-1">
        <NeuralCore pct={recoveryPct} day={day} legendary={legendary} />
        <p className="mt-6 text-sm text-muted-foreground text-center max-w-[220px]">
          {recoveryPct < 100
            ? t("progress.ring.daysRemaining", { count: 90 - day })
            : t("progress.ring.achieved")}
        </p>
      </section>

      {/* ── Inline key stats ────────────────────────────────── */}
      <div className="px-6 mt-2 flex divide-x fade-up-2" style={{ borderColor: "var(--border)" }}>
        <div className="flex-1 text-center py-4">
          <p className="text-[22px] font-bold tabular-nums" style={{ color: "var(--primary)" }}>{day}d</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{t("progress.stats.streak")}</p>
        </div>
        <div className="flex-1 text-center py-4">
          <p className="text-[22px] font-bold tabular-nums">{longest}d</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{t("progress.stats.best")}</p>
        </div>
        <div className="flex-1 text-center py-4">
          <p className="text-[22px] font-bold tabular-nums">{state.totalCleanDays}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{t("progress.stats.total")}</p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
           LEGACY RANK CARD
         ══════════════════════════════════════════════════════ */}
      <section className="px-6 mt-6 fade-up-2">
        <style>{`
          @keyframes rank-halo { 0%,100%{opacity:0.55;transform:scale(0.96)} 50%{opacity:1;transform:scale(1.06)} }
        `}</style>
        <div style={{
          ...STONE_CARD,
          padding: "20px 20px 18px",
          border: "1px solid rgba(255,255,255,0.05)",
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}>
          {/* Stone grain overlay */}
          <div aria-hidden style={{
            position: "absolute", inset: 0, borderRadius: 18, pointerEvents: "none",
            background: "repeating-linear-gradient(-22deg, transparent, transparent 8px, rgba(201,168,76,0.018) 8px, rgba(201,168,76,0.018) 9px)",
          }}/>

          <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 16 }}>
            {/* Rank badge circle */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div aria-hidden style={{
                position: "absolute", inset: -10, borderRadius: "50%",
                background: `radial-gradient(circle, ${rank.glow} 0%, transparent 70%)`,
                filter: "blur(10px)", animation: "rank-halo 3.5s ease-in-out infinite",
              }}/>
              <div style={{
                width: 62, height: 62, borderRadius: "50%",
                background: `radial-gradient(circle at 38% 35%, rgba(255,240,180,0.12) 0%, rgba(10,7,2,0.98) 60%)`,
                border: `1.5px solid ${rank.color}55`,
                boxShadow: `0 0 20px ${rank.glow}, inset 0 0 12px rgba(0,0,0,0.8)`,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1,
              }}>
                <span style={{ fontSize: 9, fontWeight: 900, color: rank.color, letterSpacing: "0.18em", fontFamily: "DM Sans, sans-serif" }}>
                  {rank.roman}
                </span>
                <div style={{ width: 20, height: 1, background: `${rank.color}55` }}/>
              </div>
            </div>

            {/* Text block */}
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 9, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: `${rank.color}99`, fontFamily: "DM Sans, sans-serif" }}>
                Legacy Rank
              </p>
              <h2 style={{
                margin: "3px 0 2px",
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 24, fontStyle: "italic", fontWeight: 600,
                color: rank.color, lineHeight: 1.1,
                textShadow: `0 0 24px ${rank.glow}`,
              }}>
                {rank.name}
              </h2>
              <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.35)", lineHeight: 1.45, fontFamily: "DM Sans, sans-serif" }}>
                {rank.desc}
              </p>
            </div>

            {/* Current streak */}
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <p style={{ margin: 0, fontSize: 28, fontWeight: 900, color: rank.color, lineHeight: 1, fontFamily: "DM Sans, sans-serif", letterSpacing: "-0.02em" }}>
                {day}
              </p>
              <p style={{ margin: 0, fontSize: 9, color: "rgba(255,255,255,0.30)", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "DM Sans, sans-serif" }}>
                days clean
              </p>
              {daysToNextRank > 0 && (
                <p style={{ margin: "4px 0 0", fontSize: 9, color: `${rank.color}80`, fontFamily: "DM Sans, sans-serif" }}>
                  +{daysToNextRank}d → {nextRankTier?.name}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
           DOPAMINE DASHBOARD — DATA TERMINAL
         ══════════════════════════════════════════════════════ */}
      <section className="px-6 mt-5 fade-up-3">

        {/* ── Standalone title ────────────────────────────────────────────────── */}
        <div style={{ marginBottom: 18 }}>
          <SectionTitle>Dopamine Dashboard</SectionTitle>
        </div>

        {/* ── Cyber-terminal data rows — no container, float on dark bg ─────────── */}
        {([
          {
            glowColor: NG,
            glyph: (
              <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
                <path d="M0 7 L3.5 7 L5.5 1.5 L8 12.5 L10 4 L12 10 L14 7 L20 7"
                  stroke={NG} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ),
            label: "Relapse Frequency",
            sublabel: "avg. days between relapses",
            value: avgRelapseDays !== null ? `every ${avgRelapseDays}d` : "Not enough data",
          },
          {
            glowColor: "#4A9ECC",
            glyph: (
              <svg width="18" height="13" viewBox="0 0 18 13" fill="none">
                <rect x="0" y="0"   width="18" height="2" rx="1" fill="#4A9ECC"/>
                <rect x="0" y="5.5" width="13" height="2" rx="1" fill="#4A9ECC" opacity="0.75"/>
                <rect x="0" y="11"  width="8"  height="2" rx="1" fill="#4A9ECC" opacity="0.45"/>
              </svg>
            ),
            label: "Total Sessions",
            sublabel: "days you opened the app",
            value: `${String(totalLogins).padStart(2, "0")} days`,
          },
          {
            glowColor: "#C9A84C",
            glyph: (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="5.5" stroke="#C9A84C" strokeWidth="1.2"/>
                <circle cx="8" cy="8" r="2"   fill="#C9A84C"/>
                <line x1="8"    y1="0"    x2="8"    y2="2.2"  stroke="#C9A84C" strokeWidth="1.2"/>
                <line x1="8"    y1="13.8" x2="8"    y2="16"   stroke="#C9A84C" strokeWidth="1.2"/>
                <line x1="0"    y1="8"    x2="2.2"  y2="8"    stroke="#C9A84C" strokeWidth="1.2"/>
                <line x1="13.8" y1="8"    x2="16"   y2="8"    stroke="#C9A84C" strokeWidth="1.2"/>
              </svg>
            ),
            label: "Peak Risk Day",
            sublabel: "highest relapse rate",
            value: peakDow ?? "No data yet",
          },
          {
            glowColor: "#00F0FF",
            glyph: (
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M7.5 1 L14 7.5 L7.5 14 L1 7.5 Z" stroke="#00F0FF" strokeWidth="1.3"/>
                <circle cx="7.5" cy="7.5" r="2.5" fill="#00F0FF"/>
              </svg>
            ),
            label: "XP Multiplier",
            sublabel: "bonus earned from streaks",
            value: hasDeepRoots ? "×1.1" : "×1.0",
          },
        ] as const).map((row, i, arr) => (
          <div key={i} style={{
            display: "flex", alignItems: "center",
            padding: "17px 0",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            ...(i === arr.length - 1 ? { borderBottom: "1px solid rgba(255,255,255,0.07)" } : {}),
          }}>
            {/* Icon — neon glow + breathing pulse */}
            <motion.div
              animate={{
                filter: [
                  `drop-shadow(0 0 4px ${row.glowColor}aa)`,
                  `drop-shadow(0 0 10px ${row.glowColor})`,
                  `drop-shadow(0 0 4px ${row.glowColor}aa)`,
                ],
                scale: [1, 1.07, 1],
              }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: i * 0.6 }}
              style={{
                width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                background: `${row.glowColor}10`,
                border: `1px solid ${row.glowColor}40`,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginRight: 16,
              }}
            >
              {row.glyph}
            </motion.div>

            {/* Label + sublabel */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
              <span style={{
                fontSize: 13, fontWeight: 600,
                letterSpacing: "0.01em",
                color: "#FFFFFF",
              }}>
                {row.label}
              </span>
              <span style={{
                fontSize: 10, fontWeight: 400,
                color: "rgba(255,255,255,0.35)",
                letterSpacing: "0.02em",
              }}>
                {row.sublabel}
              </span>
            </div>

            {/* Value */}
            <span style={{
              fontSize: 13, fontWeight: 600, fontFamily: MONO,
              color: row.glowColor, letterSpacing: "0.04em", flexShrink: 0,
              textShadow: `0 0 8px ${row.glowColor}66`,
            }}>
              {row.value}
            </span>
          </div>
        ))}

        {/* ── Neural Pruning graph ─────────────────────────────────────────────── */}
        <NeuralPruningGraph day={day} />
      </section>

      {/* ══════════════════════════════════════════════════════
           VERTICAL MILESTONE TIMELINE
         ══════════════════════════════════════════════════════ */}
      <section className="px-6 mt-6 fade-up-3">
        <style>{`
          @keyframes tl-pulse { 0%,100%{opacity:0.55;transform:scale(1)} 50%{opacity:1;transform:scale(1.18)} }
          @keyframes tl-flow  { 0%{background-position:0% 0%} 100%{background-position:0% 100%} }
        `}</style>
        <SectionTitle>Milestones</SectionTitle>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", margin: "4px 0 18px", fontFamily: "DM Sans, sans-serif" }}>
          Your journey, carved in stone
        </p>

        <div style={{ position: "relative", paddingLeft: 36 }}>
          {/* Glowing vertical energy path — Neural Green */}
          <div aria-hidden style={{
            position: "absolute", left: 18, top: 8, bottom: 8, width: 2,
            background: `linear-gradient(180deg, ${NG_GLOW}0.70) 0%, ${NG_GLOW}0.28) 60%, ${NG_GLOW}0.06) 100%)`,
            borderRadius: 2,
            boxShadow: `0 0 10px ${NG_GLOW}0.35)`,
            zIndex: 0,
          }}/>

          {([
            { label: "First step taken",    sub: "Day 1 — the hardest",            earned: true,                  icon: "🌱" },
            { label: "First Week",          sub: "7 days of resolve",              earned: day >= 7,              icon: "🛡️" },
            { label: "10 Urges Survived",   sub: `${urgesSurvived}/10 resisted`,   earned: urgesSurvived >= 10,   icon: "🔥" },
            { label: "One Month",           sub: "30 days of momentum",            earned: day >= 30,             icon: "🎖️" },
            { label: "Sovereign — 90 Days", sub: "The highest honour",             earned: day >= 90,             icon: "👑" },
          ]).map((m, i, arr) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, type: "spring", stiffness: 280, damping: 26 }}
              style={{
                position: "relative", display: "flex", alignItems: "center", gap: 14,
                marginBottom: i < arr.length - 1 ? 20 : 0,
              }}
            >
              {/* Node dot — Neural Green when earned */}
              <div style={{
                position: "absolute", left: -28,
                width: 22, height: 22, borderRadius: "50%",
                background: m.earned
                  ? `radial-gradient(circle at 38% 35%, ${NG_GLOW}0.30) 0%, rgba(8,5,1,1) 55%)`
                  : "rgba(8,5,1,1)",
                border: `1.5px solid ${m.earned ? `${NG_GLOW}0.65)` : "rgba(255,255,255,0.10)"}`,
                boxShadow: m.earned ? `0 0 14px ${NG_GLOW}0.50)` : "none",
                display: "grid", placeItems: "center",
                animation: m.earned ? "tl-pulse 3s ease-in-out infinite" : "none",
                zIndex: 2,
              }}>
                <span style={{ fontSize: 11 }}>{m.icon}</span>
              </div>

              {/* Card */}
              <div style={{
                flex: 1,
                ...STONE_CARD,
                padding: "12px 14px",
                opacity: m.earned ? 1 : 0.45,
                ...(m.earned ? {
                  borderTop: `1px solid ${NG_GLOW}0.30)`,
                  border: `1px solid ${NG_GLOW}0.14)`,
                } : {}),
              }}>
                <div aria-hidden style={{
                  position: "absolute", inset: 0, borderRadius: 18, pointerEvents: "none",
                  background: m.earned
                    ? `repeating-linear-gradient(-22deg, transparent, transparent 8px, ${NG_GLOW}0.014) 8px, ${NG_GLOW}0.014) 9px)`
                    : "repeating-linear-gradient(-22deg, transparent, transparent 8px, rgba(201,168,76,0.012) 8px, rgba(201,168,76,0.012) 9px)",
                }}/>
                <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: m.earned ? "#f5ede0" : "rgba(255,255,255,0.35)", fontFamily: "DM Sans, sans-serif" }}>
                      {m.label}
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: 10, color: "rgba(255,255,255,0.28)", fontFamily: "DM Sans, sans-serif" }}>
                      {m.sub}
                    </p>
                  </div>
                  {m.earned && (
                    <span style={{
                      fontSize: 9, fontWeight: 800, letterSpacing: "0.12em",
                      color: NG, background: `${NG_GLOW}0.10)`,
                      border: `1px solid ${NG_GLOW}0.30)`,
                      borderRadius: 999, padding: "3px 9px", flexShrink: 0,
                      fontFamily: "DM Sans, sans-serif",
                      textShadow: `0 0 8px ${NG_GLOW}0.60)`,
                    }}>
                      UNLOCKED
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Consistency ─────────────────────────────────────── */}
      <section className="px-6 mt-8 pt-7 fade-up-3" style={{ borderTop: "1px solid oklch(0.22 0.03 265 / 0.7)" }}>
        <div className="flex items-center justify-between mb-3">
          <SectionTitle>Consistency</SectionTitle>
          {!state.isPremium && (
            <span
              className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border"
              style={{ color: "var(--primary)", borderColor: "oklch(0.62 0.22 255 / 0.3)", background: "oklch(0.62 0.22 255 / 0.06)" }}
            >
              <Lock className="h-3 w-3" /> PRO
            </span>
          )}
        </div>

        {/* View toggle — segmented control */}
        <style>{`
          .cs-tab:hover { background: rgba(201,168,76,0.07) !important; color: rgba(201,168,76,0.70) !important; border-color: rgba(201,168,76,0.28) !important; }
          .cs-tab:hover svg { opacity: 0.85 !important; }
        `}</style>
        <div
          className="flex mb-4"
          style={{
            background: "rgba(255,255,255,0.035)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
            padding: 3,
            gap: 2,
          }}
        >
          {([
            {
              key: "grid", label: "Heatmap", desc: "Days you opened the app",
              icon: (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  {[0,1,2,3].map(col => [0,1,2].map(row => (
                    <rect key={`${col}-${row}`} x={col * 3.2} y={row * 3.2} width="2.4" height="2.4" rx="0.5"
                      fill="currentColor" opacity={col === 0 && row === 0 ? 0.3 : col === 3 || row === 2 ? 0.9 : 0.6} />
                  )))}
                </svg>
              ),
            },
            {
              key: "bars", label: "Weekly", desc: "Check-ins per week",
              icon: (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <rect x="0"   y="7"  width="2.2" height="5"   rx="0.6" fill="currentColor" opacity="0.45"/>
                  <rect x="3.2" y="4"  width="2.2" height="8"   rx="0.6" fill="currentColor" opacity="0.70"/>
                  <rect x="6.4" y="2"  width="2.2" height="10"  rx="0.6" fill="currentColor" opacity="0.90"/>
                  <rect x="9.6" y="5"  width="2.2" height="7"   rx="0.6" fill="currentColor" opacity="0.60"/>
                </svg>
              ),
            },
            {
              key: "streak", label: "Streak", desc: "Your clean day run",
              icon: (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M6.5 1 C6.5 1 9 4 8.5 6.5 C8 9 6 10.5 6 10.5 C6 10.5 7 8.5 5.5 7 C5.5 7 5.5 9 4 10 C4 10 2 8 3 6 C4 4 6.5 1 6.5 1Z"
                    fill="currentColor" opacity="0.9"/>
                </svg>
              ),
            },
          ] as const).map(({ key, label, desc, icon }) => {
            const active = progressView === key;
            return (
              <button
                key={key}
                className="cs-tab"
                onClick={() => setProgressView(key)}
                title={desc}
                style={{
                  flex: 1,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                  padding: "7px 4px",
                  borderRadius: 9,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.03em",
                  border: active
                    ? "1px solid rgba(201,168,76,0.45)"
                    : "1px solid rgba(255,215,0,0.12)",
                  background: active
                    ? "rgba(201,168,76,0.14)"
                    : "rgba(255,255,255,0.04)",
                  color: active ? "#C9A84C" : "rgba(255,255,255,0.50)",
                  cursor: "pointer",
                  transition: "all 0.18s ease",
                  boxShadow: active ? "0 0 12px rgba(201,168,76,0.18), inset 0 1px 0 rgba(255,215,0,0.10)" : "none",
                }}
              >
                <span style={{ display: "flex", color: active ? "#C9A84C" : "rgba(255,255,255,0.40)", transition: "all 0.18s ease" }}>
                  {icon}
                </span>
                {label}
              </button>
            );
          })}
        </div>

        {/* View content */}
        <div className="relative">
          <div className={state.isPremium ? "" : "blur-[5px] select-none pointer-events-none"}>

            {/* ── GRID view ── */}
            {progressView === "grid" && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.30)" }}>
                    Each square = one day · last 12 weeks
                  </p>
                  {peakDowFull && (
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.10em", color: "#f06450", background: "rgba(240,100,80,0.12)", border: "1px solid rgba(240,100,80,0.30)", borderRadius: 999, padding: "2px 8px" }}>
                      ⚠ {peakDowFull}s highlighted
                    </span>
                  )}
                </div>
                <div className="grid grid-flow-col grid-rows-7 gap-1">
                  {cells.map((v, i) => {
                    const dayOffset = 83 - i;
                    const cellDow = new Date(Date.now() - dayOffset * 86400000).getDay();
                    const isPeak = peakDowIndex >= 0 && cellDow === peakDowIndex;
                    let bg: string;
                    if (v > 0 && isPeak)  bg = "#e06040"; // logged + peak DOW → warning amber-red
                    else if (v > 0)       bg = "#3fb86a"; // logged clean day → green
                    else if (isPeak)      bg = "rgba(240,100,80,0.22)"; // empty peak DOW → subtle red tint
                    else                  bg = "rgba(255,255,255,0.06)"; // empty normal
                    return (
                      <div key={i} className="h-3 w-3 rounded-[3px]"
                        style={{ backgroundColor: bg, boxShadow: isPeak && v > 0 ? "0 0 4px rgba(224,96,64,0.60)" : "none" }}
                        title={isPeak ? `${peakDowFull} — watch this day` : undefined}
                      />
                    );
                  })}
                </div>
                <div className="mt-3 flex items-center gap-2 text-[10px] flex-wrap" style={{ color: "rgba(255,255,255,0.30)" }}>
                  <span className="flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-sm inline-block" style={{ background: "rgba(255,255,255,0.06)" }}/>
                    Empty
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-sm inline-block" style={{ background: "#3fb86a" }}/>
                    Clean day
                  </span>
                  {peakDowFull && (
                    <span className="flex items-center gap-1" style={{ color: "rgba(240,100,80,0.80)" }}>
                      <span className="h-2.5 w-2.5 rounded-sm inline-block" style={{ background: "#e06040" }}/>
                      Risk day ({peakDowFull})
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* ── BARS view ── */}
            {progressView === "bars" && (
              <div>
                <p className="text-[11px] mb-4" style={{ color: "rgba(255,255,255,0.30)" }}>
                  Days you checked in each week · last 8 weeks
                </p>
                <div className="flex items-end gap-2" style={{ height: 80 }}>
                  {weekBars.map((count, i) => {
                    const isLast = i === weekBars.length - 1;
                    const pct = count / 7;
                    const weeksAgo = weekBars.length - 1 - i;
                    const weekStart = new Date(Date.now() - (weeksAgo * 7 + 6) * 86400000);
                    const weekLabel = weekStart.toLocaleDateString("en", { month: "short", day: "numeric" });
                    const isSelected = barTip === i;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1" style={{ position: "relative" }}>
                        {isSelected && (
                          <div style={{
                            position: "absolute", bottom: "100%", left: "50%", transform: "translateX(-50%)",
                            marginBottom: 6, background: "rgba(6,20,12,0.95)", border: "1px solid rgba(57,217,138,0.4)",
                            borderRadius: 6, padding: "4px 8px", whiteSpace: "nowrap", zIndex: 10,
                          }}>
                            <p style={{ margin: 0, fontSize: 9, fontWeight: 700, color: NG, fontFamily: "monospace" }}>{count}/7 days</p>
                            <p style={{ margin: 0, fontSize: 8, color: "rgba(255,255,255,0.50)", fontFamily: "monospace" }}>wk of {weekLabel}</p>
                          </div>
                        )}
                        <div
                          onClick={() => setBarTip(isSelected ? null : i)}
                          style={{
                            width: "100%",
                            height: Math.max(4, pct * 68),
                            borderRadius: 6,
                            background: isLast
                              ? "linear-gradient(180deg, #C9A84C, #a07830)"
                              : pct > 0.5 ? "#3fb86a" : pct > 0 ? "#2d8a4e" : "rgba(255,255,255,0.06)",
                            boxShadow: isSelected ? "0 0 12px rgba(57,217,138,0.5)" : isLast ? "0 0 12px rgba(201,168,76,0.35)" : "none",
                            transition: "height 0.4s ease",
                            cursor: "pointer",
                          }}
                        />
                        <span style={{ fontSize: 9, color: isLast ? "#C9A84C" : "rgba(255,255,255,0.25)" }}>
                          {count}d
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-2 text-right text-[10px]" style={{ color: "rgba(255,255,255,0.20)" }}>← older · newer →</p>
              </div>
            )}

            {/* ── STREAK view ── */}
            {progressView === "streak" && (
              <div className="flex flex-col items-center py-2 gap-4">
                <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.30)" }}>
                  Your current clean run
                </p>
                <div className="flex flex-col items-center gap-1">
                  <span style={{ fontSize: 56, lineHeight: 1 }}>🔥</span>
                  <span style={{ fontSize: 48, fontWeight: 900, color: "#C9A84C", lineHeight: 1 }}>{day}</span>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.40)", letterSpacing: "0.08em" }}>DAYS CLEAN</span>
                </div>
                {/* Milestone markers */}
                <div className="flex gap-3 mt-1">
                  {[
                    { label: "7d", threshold: 7, icon: "🛡️" },
                    { label: "30d", threshold: 30, icon: "🎖️" },
                    { label: "90d", threshold: 90, icon: "👑" },
                  ].map(({ label, threshold, icon }) => {
                    const earned = day >= threshold;
                    return (
                      <div
                        key={label}
                        className="flex flex-col items-center gap-1"
                        style={{
                          padding: "8px 14px",
                          borderRadius: 12,
                          background: earned ? "rgba(201,168,76,0.10)" : "rgba(255,255,255,0.03)",
                          border: earned ? "1px solid rgba(201,168,76,0.35)" : "1px solid rgba(255,255,255,0.06)",
                          opacity: earned ? 1 : 0.4,
                        }}
                      >
                        <span style={{ fontSize: 20 }}>{icon}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: earned ? "#C9A84C" : "rgba(255,255,255,0.4)" }}>{label}</span>
                      </div>
                    );
                  })}
                </div>
                {day < 7 && (
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.30)", textAlign: "center" }}>
                    {7 - day} more day{7 - day !== 1 ? "s" : ""} until your first shield 🛡️
                  </p>
                )}
              </div>
            )}
          </div>

          {!state.isPremium && (
            <button onClick={() => triggerPaywall()} className="absolute inset-0 flex items-center justify-center">
              <span
                className="text-xs font-semibold border px-3 py-1.5 rounded-full"
                style={{
                  color: "var(--primary)",
                  background: "oklch(0.13 0.022 265 / 0.90)",
                  borderColor: "oklch(0.62 0.22 255 / 0.30)",
                }}
              >
                Unlock with PRO
              </span>
            </button>
          )}
        </div>
      </section>


      {/* ── Pattern Detector (PRO) ──────────────────────────── */}
      <section className="px-6 mt-8 pt-7 fade-up-5" style={{ borderTop: "1px solid oklch(0.22 0.03 265 / 0.7)" }}>
        <style>{`
          @keyframes pd-scan  { 0%{opacity:0.55} 50%{opacity:1} 100%{opacity:0.55} }
          @keyframes pd-glitch {
            0%,93%,100% { transform:none; textShadow:"none" }
            94%  { transform:translateX(-2px) skewX(-4deg); filter:hue-rotate(30deg) brightness(1.3); }
            95%  { transform:translateX(2px)  skewX(3deg);  filter:hue-rotate(-20deg); }
            96%  { transform:translateX(-1px); filter:none; }
            97%  { transform:translateX(1px)  skewX(-2deg); filter:hue-rotate(15deg); }
          }
          @keyframes pd-shimmer {
            0%   { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}</style>

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              {/* Radar pulse icon */}
              <div style={{ position:"relative", width:16, height:16, flexShrink:0 }}>
                <div style={{ position:"absolute", inset:0, borderRadius:"50%", border:"1.5px solid rgba(240,100,80,0.55)", animation:"pd-scan 2s ease-in-out infinite" }}/>
                <div style={{ position:"absolute", inset:3, borderRadius:"50%", background:"rgba(240,100,80,0.55)" }}/>
              </div>
              <p style={{
                fontSize:14, fontWeight:800, color:"#f5ede0", fontFamily:"DM Sans, sans-serif",
                letterSpacing:"-0.01em",
                animation: recentRelapse ? "pd-glitch 4s ease-in-out infinite" : "none",
                backgroundImage: recentRelapse
                  ? "linear-gradient(90deg, #f5ede0 0%, #f06450 40%, #E8C87A 60%, #f5ede0 100%)"
                  : "none",
                backgroundSize: recentRelapse ? "200% auto" : "auto",
                WebkitBackgroundClip: recentRelapse ? "text" : "unset",
                WebkitTextFillColor: recentRelapse ? "transparent" : "unset",
                backgroundClip: recentRelapse ? "text" : "unset",
                animation2: recentRelapse ? "pd-shimmer 2.5s linear infinite" : "none",
              } as React.CSSProperties}>
                Pattern Detector
              </p>
            </div>
            <p style={{ fontSize:11, color:"rgba(255,255,255,0.35)", marginTop:2, fontFamily:"DM Sans, sans-serif" }}>
              {relapses.length === 0 ? "No events logged yet" : `${relapses.length} event${relapses.length !== 1 ? "s" : ""} analysed`}
            </p>
          </div>
          {!state.isPremium && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border"
              style={{ color: "var(--primary)", borderColor: "oklch(0.62 0.22 255 / 0.3)", background: "oklch(0.62 0.22 255 / 0.06)" }}>
              <Lock className="h-3 w-3" /> PRO
            </span>
          )}
        </div>

        <div className="relative">
          <div className={state.isPremium ? "" : "blur-[6px] select-none pointer-events-none"}>
            <AnimatePresence mode="wait">
            {relapses.length === 0 ? (
              /* ── Empty state: no history yet ── */
              <motion.div key="pd-empty"
                initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-4 }}
                transition={{ duration:0.28, ease:"easeOut" }}
                style={{ ...STONE_CARD, padding:"28px 20px 22px", display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}
              >
                <div aria-hidden style={{ position:"absolute", inset:0, borderRadius:18, pointerEvents:"none",
                  background:"repeating-linear-gradient(-22deg, transparent, transparent 8px, rgba(255,255,255,0.012) 8px, rgba(255,255,255,0.012) 9px)" }}/>

                {/* Static radar icon — NOT spinning */}
                <div style={{ position:"relative", zIndex:1, width:48, height:48, display:"grid", placeItems:"center" }}>
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <circle cx="24" cy="24" r="20" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5"/>
                    <circle cx="24" cy="24" r="12" stroke="rgba(255,255,255,0.10)" strokeWidth="1.5"/>
                    <circle cx="24" cy="24" r="5" stroke="rgba(255,255,255,0.14)" strokeWidth="1.5" fill="none"/>
                    <circle cx="24" cy="24" r="2" fill="rgba(255,255,255,0.20)"/>
                    {/* Crosshairs */}
                    <line x1="24" y1="4" x2="24" y2="44" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
                    <line x1="4" y1="24" x2="44" y2="24" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
                  </svg>
                </div>

                {/* Copy */}
                <div style={{ position:"relative", zIndex:1, textAlign:"center" }}>
                  <p style={{ margin:0, fontSize:14, fontWeight:700, color:"rgba(255,255,255,0.70)", fontFamily:"DM Sans, sans-serif", lineHeight:1.4 }}>
                    No battle history yet
                  </p>
                  <p style={{ margin:"8px 0 0", fontSize:12, color:"rgba(255,255,255,0.32)", lineHeight:1.6, fontFamily:"DM Sans, sans-serif", maxWidth:240 }}>
                    Keep going. Your data will appear here once you log your first milestone or relapse.
                  </p>
                </div>

                {/* Learn how it works — expandable disclosure */}
                <PdLearnMore />
              </motion.div>
            ) : (
              /* ── Data state: battle reports ── */
              <motion.div key="pd-reports"
                initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-4 }}
                transition={{ duration:0.28, ease:"easeOut" }}
                style={{ display:"flex", flexDirection:"column", gap:8 }}
              >
                {[
                  peakDowFull && {
                    severity: "HIGH" as const,
                    icon: "⚠️",
                    title: `Danger zone: ${peakDowFull}s`,
                    body: `Your relapses spike on ${peakDowFull}s. Plan an override activity for this day.`,
                  },
                  {
                    severity: "MED" as const,
                    icon: "🕐",
                    title: `Peak window: ${peakTimeName}`,
                    body: `Most events happen in the ${peakTimeName}. Schedule a high-engagement task then.`,
                  },
                  avgRelapseDays !== null && relapses.length > 1 && {
                    severity: "INFO" as const,
                    icon: "📡",
                    title: `Cycle detected: ~${avgRelapseDays}d`,
                    body: `Relapses recur roughly every ${avgRelapseDays} days. Activate shield mode before this window.`,
                  },
                  recentRelapse && {
                    severity: "ALERT" as const,
                    icon: "🔴",
                    title: "Recent event logged",
                    body: "A relapse was recorded in the last 48h. Your neural pathways are rebuilding — stay close to the app.",
                  },
                ].filter(Boolean).map((report, i) => {
                  if (!report) return null;
                  const SEV = {
                    HIGH:  { border:"rgba(240,100,80,0.35)",  bg:"rgba(240,100,80,0.07)",  label:"HIGH RISK",  labelColor:"#f06450" },
                    MED:   { border:"rgba(201,168,76,0.30)",  bg:"rgba(201,168,76,0.06)",  label:"PATTERN",    labelColor:"#C9A84C" },
                    INFO:  { border:"rgba(126,200,227,0.25)", bg:"rgba(126,200,227,0.05)", label:"INSIGHT",    labelColor:"#7ec8e3" },
                    ALERT: { border:"rgba(240,100,80,0.50)",  bg:"rgba(240,100,80,0.10)",  label:"ALERT",      labelColor:"#f06450" },
                  }[report.severity];
                  return (
                    <motion.div key={i}
                      initial={{ opacity:0, y:8 }}
                      animate={{ opacity:1, y:0 }}
                      transition={{ delay:i*0.08, type:"spring", stiffness:300, damping:28 }}
                      style={{ ...STONE_CARD, padding:"14px 14px 12px", border:`1px solid ${SEV.border}`, borderTop:`1px solid ${SEV.border}`, background: SEV.bg }}
                    >
                      <div aria-hidden style={{ position:"absolute", inset:0, borderRadius:18, pointerEvents:"none",
                        background:"repeating-linear-gradient(-22deg, transparent, transparent 8px, rgba(201,168,76,0.010) 8px, rgba(201,168,76,0.010) 9px)" }}/>
                      <div style={{ position:"relative", zIndex:1 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
                          <span style={{ fontSize:14 }}>{report.icon}</span>
                          <span style={{ fontSize:9, fontWeight:800, letterSpacing:"0.18em", color:SEV.labelColor, fontFamily:"DM Sans, sans-serif" }}>
                            {SEV.label}
                          </span>
                          <div style={{ flex:1, height:1, background:`${SEV.border}` }}/>
                        </div>
                        <p style={{ margin:0, fontSize:13, fontWeight:700, color:"#f5ede0", fontFamily:"DM Sans, sans-serif", marginBottom:3 }}>
                          {report.title}
                        </p>
                        <p style={{ margin:0, fontSize:11, color:"rgba(255,255,255,0.42)", lineHeight:1.5, fontFamily:"DM Sans, sans-serif" }}>
                          {report.body}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
            </AnimatePresence>
          </div>
          {!state.isPremium && (
            <button onClick={() => triggerPaywall()} className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-semibold border px-3 py-1.5 rounded-full"
                style={{ color:"var(--primary)", background:"oklch(0.13 0.022 265 / 0.90)", borderColor:"oklch(0.62 0.22 255 / 0.30)" }}>
                {t("progress.insights.paywallCta")}
              </span>
            </button>
          )}
        </div>
      </section>

      <div className="pb-8" />
    </PageShell>
  );
}
