"use client";

import React, { useState, useEffect, useRef, useCallback, useId } from "react";
import { Scale, BookOpen, CheckCircle2, MessageSquare, Heart } from "lucide-react";
import { HakkiMood } from "./HakkiKancil";

export interface HakkiDuoInteractiveProps {
  mood?: HakkiMood;
  size?: "sm" | "md" | "lg";
  characterCount?: number;
  isTyping?: boolean;
  customMessage?: string;
  className?: string;
  showSpeechBubble?: boolean;
}

const HAKKI_CLICK_TIPS = [
  "Hakki siap bantu hitung hak pesangon sesuai PP 35/2021!",
  "Simpan bukti tangkapan layar percakapan dan mutasi bank sebagai alat bukti sah UU ITE.",
  "Sengketa sewa atau deposit? Cek Pasal 1238 & 1365 KUHPerdata tentang wanprestasi dan ganti rugi.",
  "Ada intimidasi pinjol ilegal? Amankan bukti teror dan laporkan ke Satgas PASTI OJK.",
  "PHK sepihak wajib didahului perundingan bipartit tertulis menurut UU No. 2 Tahun 2004.",
  "Kuitansi, kontrak, dan bukti transfer adalah fondasi pembuktian perdata yang kuat.",
  "Semua data Anda terlindungi prinsip privasi UU PDP No. 27 Tahun 2022.",
];

export function HakkiDuoInteractive({
  mood = "welcoming",
  size = "md",
  characterCount = 0,
  isTyping = false,
  customMessage,
  className = "",
  showSpeechBubble = true,
}: HakkiDuoInteractiveProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [headOffset, setHeadOffset] = useState({ x: 0, y: 0, rotate: 0 });
  const [proximity, setProximity] = useState(0); // 0 (far) -> 1 (very close / hovered)
  const [isHovered, setIsHovered] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const lastPointerMoveRef = useRef<number>(0);
  const [isIdle, setIsIdle] = useState(false);

  const rawId = useId();
  const idPrefix = rawId.replace(/[^a-zA-Z0-9]/g, "");
  const furGradId = `${idPrefix}-fur`;
  const creamGradId = `${idPrefix}-cream`;
  const suitGradId = `${idPrefix}-suit`;
  const haloGradId = `${idPrefix}-halo`;

  const getMilestoneMessage = useCallback(() => {
    if (customMessage) return customMessage;
    if (isTyping) return "Hakki sedang memetakan kronologi dan entitas hukum Anda...";
    if (characterCount === 0) {
      if (currentTipIndex > 0) {
        return HAKKI_CLICK_TIPS[(currentTipIndex - 1) % HAKKI_CLICK_TIPS.length];
      }
      if (mood === "welcoming") {
        return "Halo! Saya Hakki, pendamping hukum pintar Anda. Ceritakan duduk perkaranya, kita bedah bersama.";
      }
      if (mood === "listening") {
        return "Saya menyimak dengan saksama. Tuliskan kronologi kejadian yang Anda alami.";
      }
      if (mood === "analyzing") {
        return "Sedang mencocokkan fakta perkara dengan pasal undang-undang yang relevan...";
      }
      if (mood === "celebrating" || mood === "encouraging") {
        return "Bagus sekali! Posisi hukum dan daftar langkah taktis Anda sudah siap.";
      }
      if (mood === "empathetic") {
        return "Anda tidak sendirian. Hakki siap mendampingi mengurai hak dan perlindungan hukum Anda.";
      }
      return "Ceritakan persoalan Anda di sini. Hakki siap menganalisis dasar hukumnya.";
    }
    if (characterCount < 15) {
      return `Teruskan! Tambahkan sedikit detail lagi (${characterCount}/15 karakter).`;
    }
    if (characterCount < 80) {
      return "Kronologi awal sudah terbaca. Sebutkan waktu kejadian atau pihak terkait bila ada.";
    }
    return "Kronologi lengkap dan siap dianalisis secara mendalam!";
  }, [characterCount, currentTipIndex, customMessage, isTyping, mood]);

  // Smooth eye tracking, parallax head tilt, and mouse proximity reactivity
  useEffect(() => {
    lastPointerMoveRef.current = Date.now();

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      lastPointerMoveRef.current = Date.now();
      setIsIdle(false);

      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height * 0.55;

      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      const dx = clientX - cx;
      const dy = clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Proximity radius: starts reacting within 280px of the mascot center
      const proximityRadius = 280;
      const prox = Math.max(0, Math.min(1, 1 - dist / proximityRadius));
      setProximity(prox);

      if (dist === 0) return;

      const maxEyeOff = 3.0;
      const eyeFactor = Math.min(dist / 200, 1) * maxEyeOff;
      const nx = dx / dist;
      const ny = dy / dist;

      setEyeOffset({
        x: nx * eyeFactor,
        y: ny * eyeFactor,
      });

      // Subtle head & ear parallax toward the cursor when nearby
      const headReach = Math.min(dist / 220, 1) * (0.6 + prox * 1.4);
      setHeadOffset({
        x: nx * headReach * 1.4,
        y: ny * headReach * 0.9,
        rotate: nx * headReach * 2.6,
      });
    };

    const handlePointerLeaveWindow = () => {
      setProximity(0);
      setHeadOffset({ x: 0, y: 0, rotate: 0 });
    };

    window.addEventListener("mousemove", handlePointerMove, { passive: true });
    window.addEventListener("touchmove", handlePointerMove, { passive: true });
    document.addEventListener("mouseleave", handlePointerLeaveWindow);
    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("touchmove", handlePointerMove);
      document.removeEventListener("mouseleave", handlePointerLeaveWindow);
    };
  }, []);

  // Gentle random natural blinking (with occasional natural double-blink)
  useEffect(() => {
    let outerTimeout: NodeJS.Timeout;
    let innerTimeout1: NodeJS.Timeout;
    let innerTimeout2: NodeJS.Timeout;
    let innerTimeout3: NodeJS.Timeout;

    const scheduleBlink = () => {
      const nextDelay = 2400 + Math.random() * 3000;
      outerTimeout = setTimeout(() => {
        setIsBlinking(true);
        const isDoubleBlink = Math.random() < 0.26;

        innerTimeout1 = setTimeout(() => {
          setIsBlinking(false);

          if (isDoubleBlink) {
            innerTimeout2 = setTimeout(() => {
              setIsBlinking(true);
              innerTimeout3 = setTimeout(() => {
                setIsBlinking(false);
                scheduleBlink();
              }, 115);
            }, 130);
          } else {
            scheduleBlink();
          }
        }, 125);
      }, nextDelay);
    };

    scheduleBlink();
    return () => {
      clearTimeout(outerTimeout);
      clearTimeout(innerTimeout1);
      clearTimeout(innerTimeout2);
      clearTimeout(innerTimeout3);
    };
  }, []);

  // Idle detection
  useEffect(() => {
    const idleChecker = setInterval(() => {
      if (lastPointerMoveRef.current > 0 && Date.now() - lastPointerMoveRef.current > 2600) {
        setIsIdle(true);
        setProximity(0);
      }
    }, 1000);
    return () => clearInterval(idleChecker);
  }, []);

  // Subtle idle gaze micro-movements
  useEffect(() => {
    if (!isIdle || isHovered) return;

    let step = 0;
    const gazeCycle = [
      { x: -1.6, y: -0.3, rot: -1.2 },
      { x: 0, y: 0, rot: 0 },
      { x: 1.6, y: -0.3, rot: 1.2 },
      { x: 0, y: -1.0, rot: 0.4 },
      { x: 0, y: 0, rot: 0 },
    ];

    const gazeInterval = setInterval(() => {
      if (mood === "analyzing") {
        setEyeOffset((prev) => (prev.x <= 0 ? { x: 2.1, y: 0.4 } : { x: -2.1, y: 0.4 }));
      } else {
        step = (step + 1) % gazeCycle.length;
        const target = gazeCycle[step];
        setEyeOffset({ x: target.x, y: target.y });
        setHeadOffset({ x: target.x * 0.5, y: target.y * 0.4, rotate: target.rot });
      }
    }, 2400);

    return () => clearInterval(gazeInterval);
  }, [isIdle, isHovered, mood]);

  const handleMascotClick = () => {
    setIsBouncing(true);
    setIsBlinking(true);
    setCurrentTipIndex((prev) => prev + 1);
    setTimeout(() => setIsBlinking(false), 130);
    setTimeout(() => setIsBouncing(false), 460);
  };

  const sizeMap = { sm: 108, md: 168, lg: 228 };
  const svgSize = sizeMap[size];
  const containerClass = {
    sm: "w-[108px] h-[108px]",
    md: "w-[168px] h-[168px]",
    lg: "w-[228px] h-[228px]",
  }[size];

  // Computed proximity & hover transforms for lively micro-interactions
  const activeEngage = isHovered ? 1 : proximity;
  const earPerkDeg = activeEngage * 5.5;
  const pupilScale = 1 + activeEngage * 0.08;
  const cheekOpacity = 0.38 + activeEngage * 0.28;

  return (
    <div ref={containerRef} className={`relative flex flex-col items-center select-none ${className}`}>
      {/* Architectural Speech Card */}
      {showSpeechBubble && (
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`mb-3.5 relative max-w-xs sm:max-w-sm px-4 py-3.5 rounded-xl border-2 border-black transition-all duration-200 animate-speech-pop ${
            isHovered
              ? "bg-[#1B365D] text-white shadow-[5px_5px_0px_#0F172A] -translate-y-0.5"
              : "bg-white text-black shadow-[4px_4px_0px_#1B365D]"
          }`}
        >
          <div className={`w-6 h-1 mb-2 transition-colors duration-200 ${isHovered ? "bg-[#93C5FD]" : "bg-[#1B365D]"}`} />
          <div className="flex items-start gap-2.5">
            <div
              className={`p-1.5 rounded-lg border shrink-0 mt-0.5 transition-colors duration-200 ${
                characterCount >= 15 || isHovered
                  ? "bg-[#13294B] text-[#93C5FD] border-white/25"
                  : "bg-[#1B365D] text-white border-black"
              }`}
            >
              {characterCount >= 15 ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <MessageSquare className="w-3.5 h-3.5" />
              )}
            </div>
            <div className="space-y-1">
              <div
                className={`flex items-center gap-2 text-[10px] font-mono font-semibold uppercase tracking-wider transition-colors duration-200 ${
                  isHovered ? "text-[#93C5FD]" : "text-black"
                }`}
              >
                <span>HAKKI KANCIL</span>
                <span className={isHovered ? "text-slate-300" : "text-brand-muted"}>·</span>
                <span className={isHovered ? "text-slate-200" : "text-brand-muted"}>
                  {isTyping
                    ? "MENYIMAK"
                    : mood === "analyzing"
                    ? "MENELAAH PASAL"
                    : isHovered
                    ? "SIAP MEMBANTU"
                    : "PENDAMPING AI"}
                </span>
              </div>
              <p
                className={`text-xs leading-relaxed font-medium transition-colors duration-200 ${
                  isHovered ? "text-white" : "text-black"
                }`}
              >
                {getMilestoneMessage()}
              </p>
            </div>
          </div>
          <div
            className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 border-b-2 border-r-2 border-black rotate-45 transition-colors duration-200 ${
              isHovered ? "bg-[#1B365D]" : "bg-white"
            }`}
          />
        </div>
      )}

      {/* Studio-Grade Hakki Kancil Mascot with Proximity & Micro-Animations */}
      <div className="relative">
        <div
          onClick={handleMascotClick}
          onMouseEnter={() => {
            setIsHovered(true);
            setProximity(1);
          }}
          onMouseLeave={() => {
            setIsHovered(false);
            setProximity(0);
            setHeadOffset({ x: 0, y: 0, rotate: 0 });
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleMascotClick();
            }
          }}
          aria-label="Hakki si Kancil — sentuh untuk tip hukum interaktif"
          style={{
            transform: !isBouncing
              ? `translate3d(${headOffset.x * 0.4}px, ${-activeEngage * 3}px, 0)`
              : undefined,
          }}
          className={`relative group cursor-pointer transition-transform duration-200 ease-out ${containerClass} ${
            isBouncing ? "animate-hakki-jump" : ""
          }`}
        >
          <svg
            viewBox="0 0 140 140"
            width={svgSize}
            height={svgSize}
            className="overflow-visible"
          >
            <defs>
              <style>{`
                .hakki-torso-breathe {
                  animation: hakki-torso-anim 3.4s cubic-bezier(0.45, 0, 0.55, 1) infinite;
                  transform-origin: 70px 104px;
                }
                .hakki-head-float {
                  animation: hakki-head-anim 3.4s cubic-bezier(0.45, 0, 0.55, 1) infinite;
                  transform-origin: 70px 66px;
                }
                .hakki-ear-left {
                  animation: hakki-ear-twitch-l 5.2s ease-in-out infinite;
                  transform-origin: 46px 42px;
                }
                .hakki-ear-right {
                  animation: hakki-ear-twitch-r 5.8s ease-in-out infinite;
                  transform-origin: 94px 42px;
                }
                .hakki-tuft-sway {
                  animation: hakki-tuft-anim 3.6s ease-in-out infinite;
                  transform-origin: 70px 28px;
                }
                .hakki-wave-paw {
                  animation: hakki-paw-idle 2.8s ease-in-out infinite;
                  transform-origin: 102px 92px;
                }
                .hakki-wave-paw-active {
                  animation: hakki-paw-greet 0.85s ease-in-out infinite;
                  transform-origin: 102px 92px;
                }
                .hakki-tie-pulse {
                  animation: hakki-tie-glow 3s ease-in-out infinite;
                }
                @keyframes hakki-torso-anim {
                  0%, 100% { transform: translateY(0px) scale(1, 1); }
                  50% { transform: translateY(-1.4px) scale(1.015, 0.99); }
                }
                @keyframes hakki-head-anim {
                  0%, 100% { transform: translateY(0px) rotate(0deg); }
                  50% { transform: translateY(-2.5px) rotate(0.7deg); }
                }
                @keyframes hakki-ear-twitch-l {
                  0%, 84%, 100% { transform: rotate(0deg); }
                  88% { transform: rotate(-6deg); }
                  92% { transform: rotate(2.5deg); }
                }
                @keyframes hakki-ear-twitch-r {
                  0%, 78%, 100% { transform: rotate(0deg); }
                  83% { transform: rotate(7deg); }
                  87% { transform: rotate(-2.5deg); }
                }
                @keyframes hakki-tuft-anim {
                  0%, 100% { transform: rotate(-2deg); }
                  50% { transform: rotate(4deg); }
                }
                @keyframes hakki-paw-idle {
                  0%, 100% { transform: translateY(0px) rotate(0deg); }
                  50% { transform: translateY(-2px) rotate(-6deg); }
                }
                @keyframes hakki-paw-greet {
                  0%, 100% { transform: translateY(-2px) rotate(0deg); }
                  25% { transform: translateY(-5px) rotate(-18deg); }
                  75% { transform: translateY(-3px) rotate(14deg); }
                }
                @keyframes hakki-tie-glow {
                  0%, 100% { opacity: 0.92; }
                  50% { opacity: 1; }
                }
                @media (prefers-reduced-motion: reduce) {
                  .hakki-torso-breathe,
                  .hakki-head-float,
                  .hakki-ear-left,
                  .hakki-ear-right,
                  .hakki-tuft-sway,
                  .hakki-wave-paw,
                  .hakki-wave-paw-active,
                  .hakki-tie-pulse {
                    animation: none !important;
                  }
                }
              `}</style>

              {/* Rich Sculpted Golden-Cinnamon Kancil Fur */}
              <linearGradient id={furGradId} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FBBF24" />
                <stop offset="48%" stopColor="#F59E0B" />
                <stop offset="85%" stopColor="#D97706" />
                <stop offset="100%" stopColor="#B45309" />
              </linearGradient>

              {/* Warm Ivory-Cream Kancil Facial Mask */}
              <linearGradient id={creamGradId} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFBEB" />
                <stop offset="65%" stopColor="#FEF3C7" />
                <stop offset="100%" stopColor="#FDE68A" />
              </linearGradient>

              {/* Tailored Deep Obsidian-Navy Advocate Suit */}
              <linearGradient id={suitGradId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1E293B" />
                <stop offset="55%" stopColor="#0F172A" />
                <stop offset="100%" stopColor="#020617" />
              </linearGradient>

              {/* Ambient Mascot Cyan Aura */}
              <radialGradient id={haloGradId} cx="50%" cy="48%" r="50%">
                <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.34" />
                <stop offset="65%" stopColor="#00F0FF" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#00F0FF" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Ambient Mascot Cyan Halo (Expands gently with mouse proximity) */}
            <circle
              cx="70"
              cy="70"
              r={58 + activeEngage * 5}
              fill={`url(#${haloGradId})`}
              style={{ transition: "r 0.25s cubic-bezier(0.16, 1, 0.3, 1)" }}
            />

            {/* Crisp Offset Medallion Base */}
            <circle
              cx={73 + activeEngage * 1.2}
              cy={74 + activeEngage * 1.2}
              r="51"
              fill={isHovered ? "#00F0FF" : "#0F172A"}
              style={{ transition: "fill 0.2s ease, cx 0.2s ease, cy 0.2s ease" }}
            />
            <circle
              cx="70"
              cy="70"
              r="51"
              fill="#FFFDF9"
              stroke="#0F172A"
              strokeWidth="2.8"
            />
            {/* Subtle Inner Studio Ring */}
            <circle
              cx="70"
              cy="70"
              r="46.5"
              fill="none"
              stroke="#E2E8F0"
              strokeWidth="1"
            />

            {/* Breathing Torso & Advocate Blazer Group */}
            <g className="hakki-torso-breathe">
              {/* Warm Neck & Kancil White Throat Stripe */}
              <path
                d="M 61,74 L 79,74 L 81,86 L 59,86 Z"
                fill="#D97706"
                stroke="#0F172A"
                strokeWidth="2"
              />
              <path d="M 66,75 L 74,75 L 75,85 L 65,85 Z" fill="#FFFBEB" />

              {/* Tailored Advocate Blazer & Shoulders */}
              <path
                d="M 35,114 C 36,90 48,81 70,81 C 92,81 104,90 105,114 C 88,122 52,122 35,114 Z"
                fill={`url(#${suitGradId})`}
                stroke="#0F172A"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />

              {/* Crisp White Dress Shirt & Spread Collar */}
              <path
                d="M 55,81 L 70,105 L 85,81 Z"
                fill="#FFFFFF"
                stroke="#0F172A"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                d="M 56,80 L 66,89 L 61,93 L 52,84 Z"
                fill="#F8FAFC"
                stroke="#0F172A"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <path
                d="M 84,80 L 74,89 L 79,93 L 88,84 Z"
                fill="#F8FAFC"
                stroke="#0F172A"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />

              {/* Vibrant Mascot Cyan Silk Tie + Gold Tie Bar */}
              <path
                d="M 66.5,86 L 73.5,86 L 75,103 L 70,109 L 65,103 Z"
                fill="#00F0FF"
                stroke="#0F172A"
                strokeWidth="1.8"
                strokeLinejoin="round"
                className="hakki-tie-pulse"
              />
              {/* Tie Knot */}
              <path
                d="M 65.5,82.5 L 74.5,82.5 L 73,87.5 L 67,87.5 Z"
                fill="#00D4E2"
                stroke="#0F172A"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
              {/* Gold Tie Clip */}
              <rect
                x="66"
                y="95"
                width="8"
                height="2.2"
                rx="1"
                fill="#FBBF24"
                stroke="#0F172A"
                strokeWidth="0.9"
              />

              {/* Notched Blazer Lapels */}
              <path
                d="M 53,82 L 46,96 L 54,98 L 51,103 L 66,108"
                fill="none"
                stroke="#334155"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M 87,82 L 94,96 L 86,98 L 89,103 L 74,108"
                fill="none"
                stroke="#334155"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Cyan Pocket Square & Gold Scales Lapel Pin */}
              <path
                d="M 82,99 L 87,95 L 91,99 Z"
                fill="#00F0FF"
                stroke="#0F172A"
                strokeWidth="1.3"
                strokeLinejoin="round"
              />
              <circle
                cx="54"
                cy="93"
                r={3.2 + activeEngage * 0.4}
                fill="#FBBF24"
                stroke="#0F172A"
                strokeWidth="1.3"
                style={{ transition: "r 0.2s ease" }}
              />
              <circle cx="54" cy="93" r="1.2" fill="#00F0FF" />
            </g>

            {/* Head & Ears Parallax Group (Reacts to mouse proximity & direction) */}
            <g
              style={{
                transform: `translate3d(${headOffset.x}px, ${headOffset.y}px, 0) rotate(${headOffset.rotate}deg)`,
                transformOrigin: "70px 64px",
                transition: "transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              <g className="hakki-head-float">
                {/* Left Leaf-Shaped Kancil Ear */}
                <g
                  style={{
                    transform: `rotate(${-earPerkDeg}deg)`,
                    transformOrigin: "46px 42px",
                    transition: "transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  <g className="hakki-ear-left">
                    <path
                      d="M 47,44 C 33,38 20,25 22,12 C 34,11 48,22 54,37 Z"
                      fill={`url(#${furGradId})`}
                      stroke="#0F172A"
                      strokeWidth="2.4"
                      strokeLinejoin="round"
                    />
                    {/* Dark Chestnut Ear Tip Accent */}
                    <path
                      d="M 22,12 C 26,12 31,14 34,17 C 29,18 25,19 23,22 C 21.5,18 21.5,15 22,12 Z"
                      fill="#78350F"
                    />
                    {/* Warm Rose Inner Ear */}
                    <path
                      d="M 46,40 C 36,35 28,25 28,17 C 36,18 44,26 49,36 Z"
                      fill="#FDA4AF"
                    />
                    {/* Inner Ear Cream Fluff */}
                    <path
                      d="M 43,39 C 39,35 37,32 39,29 C 42,31 45,34 47,38 Z"
                      fill="#FFFBEB"
                    />
                    {/* Cyan Tech Ear Stud */}
                    <circle
                      cx="26"
                      cy="22"
                      r="2.4"
                      fill="#00F0FF"
                      stroke="#0F172A"
                      strokeWidth="1.2"
                    />
                  </g>
                </g>

                {/* Right Leaf-Shaped Kancil Ear */}
                <g
                  style={{
                    transform: `rotate(${earPerkDeg}deg)`,
                    transformOrigin: "94px 42px",
                    transition: "transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  <g className="hakki-ear-right">
                    <path
                      d="M 93,44 C 107,38 120,25 118,12 C 106,11 92,22 86,37 Z"
                      fill={`url(#${furGradId})`}
                      stroke="#0F172A"
                      strokeWidth="2.4"
                      strokeLinejoin="round"
                    />
                    {/* Dark Chestnut Ear Tip Accent */}
                    <path
                      d="M 118,12 C 114,12 109,14 106,17 C 111,18 115,19 117,22 C 118.5,18 118.5,15 118,12 Z"
                      fill="#78350F"
                    />
                    {/* Warm Rose Inner Ear */}
                    <path
                      d="M 94,40 C 104,35 112,25 112,17 C 104,18 96,26 91,36 Z"
                      fill="#FDA4AF"
                    />
                    {/* Inner Ear Cream Fluff */}
                    <path
                      d="M 97,39 C 101,35 103,32 101,29 C 98,31 95,34 93,38 Z"
                      fill="#FFFBEB"
                    />
                  </g>
                </g>

                {/* Sculpted Kancil Head with Fluffy Cheek Tufts */}
                <path
                  d="M 40,51 C 41,29 99,29 100,51 C 105,56 106,63 101,67 C 103,70 99,75 94,76 C 87,82 79,84 70,84 C 61,84 53,82 46,76 C 41,75 37,70 39,67 C 34,63 35,56 40,51 Z"
                  fill={`url(#${furGradId})`}
                  stroke="#0F172A"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />

                {/* Kancil Crown Forehead Blaze & Cinnamon Stripe */}
                <path
                  d="M 65,33 Q 70,45 70,51 Q 70,45 75,33 Z"
                  fill="#B45309"
                  opacity="0.55"
                />
                <ellipse cx="70" cy="41" rx="3.8" ry="6.2" fill="#FFFBEB" opacity="0.9" />

                {/* Heart-Shaped Ivory Cream Kancil Facial Mask & Muzzle */}
                <path
                  d="M 43,60 C 43,49 58,47 70,53 C 82,47 97,49 97,60 C 98,73 86,83 70,83 C 54,83 42,73 43,60 Z"
                  fill={`url(#${creamGradId})`}
                />

                {/* Cute Crown Fur Tuft & Dapper Legal Beret/Crest */}
                <g className="hakki-tuft-sway">
                  <path
                    d="M 63,33 C 64,24 69,21 72,20 C 71,25 74,27 76,33"
                    fill={`url(#${furGradId})`}
                    stroke="#0F172A"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 68,32 C 70,25 74,23 77,23 C 75,27 76,30 77,33"
                    fill="#FBBF24"
                    stroke="#0F172A"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>

                {/* Soft Rosy Cheeks (Glow warmly on proximity/hover) */}
                <ellipse
                  cx="47"
                  cy="66"
                  rx={5.5 + activeEngage * 0.8}
                  ry={3.2 + activeEngage * 0.4}
                  fill="#FB7185"
                  opacity={cheekOpacity}
                  style={{ transition: "opacity 0.2s ease, rx 0.2s ease, ry 0.2s ease" }}
                />
                <ellipse
                  cx="93"
                  cy="66"
                  rx={5.5 + activeEngage * 0.8}
                  ry={3.2 + activeEngage * 0.4}
                  fill="#FB7185"
                  opacity={cheekOpacity}
                  style={{ transition: "opacity 0.2s ease, rx 0.2s ease, ry 0.2s ease" }}
                />

                {/* Expressive Kancil Brows (Lift gently when mouse approaches) */}
                <g
                  style={{
                    transform: `translateY(${-activeEngage * 1.6}px)`,
                    transition: "transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  {mood === "empathetic" ? (
                    <g stroke="#451A03" strokeWidth="2.5" strokeLinecap="round" fill="none">
                      <path d="M 46,45 Q 52,42.5 58,46" />
                      <path d="M 82,46 Q 88,42.5 94,45" />
                    </g>
                  ) : (
                    <g stroke="#451A03" strokeWidth="2.6" strokeLinecap="round" fill="none">
                      <path d="M 46,44 Q 52,40.5 58,44" />
                      <path d="M 82,44 Q 88,40.5 94,44" />
                    </g>
                  )}
                </g>

                {/* Soulful Layered Studio Eyes with Smooth Blink & Vibrant #00F0FF Crescent */}
                <g
                  style={{
                    transform: isBlinking ? "scaleY(0.07)" : "scaleY(1)",
                    transformOrigin: "70px 56px",
                    transition: "transform 0.09s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  {/* Left Eye Sclera & Upper Lash Line */}
                  <ellipse
                    cx="54"
                    cy="56"
                    rx="7.6"
                    ry="8.4"
                    fill="#FFFFFF"
                    stroke="#0F172A"
                    strokeWidth="2.2"
                  />
                  <path
                    d="M 45.8,53.5 C 48,47 59,47 61.8,53.5"
                    fill="none"
                    stroke="#0F172A"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                  />
                  <g
                    style={{
                      transform: `translate3d(${eyeOffset.x}px, ${eyeOffset.y}px, 0) scale(${pupilScale})`,
                      transformOrigin: "54px 56px",
                      transition: "transform 0.12s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                  >
                    <circle cx="54" cy="56" r="5.4" fill="#0F172A" />
                    {/* Mascot Signature #00F0FF Lower Iris Glow */}
                    <path
                      d="M 50.4,57.6 A 3.9,3.9 0 0,0 57.6,57.6"
                      fill="none"
                      stroke="#00F0FF"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <circle cx="56" cy="53.4" r="2.1" fill="#FFFFFF" />
                    <circle cx="51.8" cy="58.4" r="1.05" fill="#FFFFFF" />
                  </g>

                  {/* Right Eye Sclera & Upper Lash Line */}
                  <ellipse
                    cx="86"
                    cy="56"
                    rx="7.6"
                    ry="8.4"
                    fill="#FFFFFF"
                    stroke="#0F172A"
                    strokeWidth="2.2"
                  />
                  <path
                    d="M 78.2,53.5 C 81,47 92,47 94.2,53.5"
                    fill="none"
                    stroke="#0F172A"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                  />
                  <g
                    style={{
                      transform: `translate3d(${eyeOffset.x}px, ${eyeOffset.y}px, 0) scale(${pupilScale})`,
                      transformOrigin: "86px 56px",
                      transition: "transform 0.12s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                  >
                    <circle cx="86" cy="56" r="5.4" fill="#0F172A" />
                    {/* Mascot Signature #00F0FF Lower Iris Glow */}
                    <path
                      d="M 82.4,57.6 A 3.9,3.9 0 0,0 89.6,57.6"
                      fill="none"
                      stroke="#00F0FF"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <circle cx="88" cy="53.4" r="2.1" fill="#FFFFFF" />
                    <circle cx="83.8" cy="58.4" r="1.05" fill="#FFFFFF" />
                  </g>
                </g>

                {/* Closed Eyelid Line Overlay during Blink */}
                {isBlinking && (
                  <g stroke="#0F172A" strokeWidth="2.6" strokeLinecap="round" fill="none">
                    <path d="M 46.5,56.5 Q 54,60 61.5,56.5" />
                    <path d="M 78.5,56.5 Q 86,60 93.5,56.5" />
                  </g>
                )}

                {/* Sleek Cyan Legal Frames in Analyzing Mode */}
                {mood === "analyzing" && (
                  <g>
                    <rect
                      x="44"
                      y="47"
                      width="20"
                      height="17"
                      rx="6"
                      fill="#00F0FF"
                      fillOpacity="0.14"
                      stroke="#0F172A"
                      strokeWidth="2.2"
                    />
                    <rect
                      x="76"
                      y="47"
                      width="20"
                      height="17"
                      rx="6"
                      fill="#00F0FF"
                      fillOpacity="0.14"
                      stroke="#0F172A"
                      strokeWidth="2.2"
                    />
                    <line x1="64" y1="55" x2="76" y2="55" stroke="#00F0FF" strokeWidth="2.6" />
                    <line x1="64" y1="55" x2="76" y2="55" stroke="#0F172A" strokeWidth="1.1" />
                  </g>
                )}

                {/* Sculpted Kancil Snout Bridge, Velvet Nose & Friendly Smile */}
                <ellipse cx="70" cy="64" rx="7.5" ry="5.5" fill="#FFFBEB" />
                <path
                  d="M 65.5,62.5 C 65.5,60 74.5,60 74.5,62.5 C 74.5,65.2 71.8,67 70,67 C 68.2,67 65.5,65.2 65.5,62.5 Z"
                  fill="#271206"
                />
                <ellipse cx="68.6" cy="62" rx="1.6" ry="0.85" fill="#FFFFFF" opacity="0.75" />
                {/* Cute Philtrum */}
                <line
                  x1="70"
                  y1="67"
                  x2="70"
                  y2="70.2"
                  stroke="#451A03"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                />

                {mood === "celebrating" || isHovered ? (
                  <g>
                    <path
                      d="M 63,70 Q 70,78 77,70 Z"
                      fill="#9F1239"
                      stroke="#0F172A"
                      strokeWidth="1.9"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M 66,73.5 Q 70,71.5 74,73.5 A 4.2,3.5 0 0,1 66,73.5 Z"
                      fill="#FB7185"
                    />
                  </g>
                ) : isTyping ? (
                  <circle cx="70" cy="72" r="2.5" fill="#0F172A" />
                ) : (
                  <path
                    d="M 63.5,70.2 Q 66.8,73.8 70,70.5 Q 73.2,73.8 76.5,70.2"
                    fill="none"
                    stroke="#0F172A"
                    strokeWidth="2.1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
              </g>
            </g>

            {/* Left Paw Holding Embossed Legal Codex ("KUHAP / UU") with Cyan Bookmark */}
            <g>
              <rect
                x="25"
                y="84"
                width="17"
                height="22"
                rx="3"
                transform="rotate(-12 33 95)"
                fill="#1E293B"
                stroke="#0F172A"
                strokeWidth="2"
              />
              <rect
                x="28"
                y="86"
                width="12"
                height="18"
                rx="1.5"
                transform="rotate(-12 33 95)"
                fill="#00F0FF"
                fillOpacity="0.22"
                stroke="#00F0FF"
                strokeWidth="1"
              />
              {/* Bookmark Ribbon */}
              <path
                d="M 34,104 L 33,111 L 35.5,109.5 L 38,111 L 37,104 Z"
                fill="#00F0FF"
                stroke="#0F172A"
                strokeWidth="1"
              />
              <ellipse
                cx="37"
                cy="96"
                rx="6"
                ry="4.8"
                transform="rotate(18 37 96)"
                fill={`url(#${furGradId})`}
                stroke="#0F172A"
                strokeWidth="2.1"
              />
            </g>

            {/* Expressive Waving Right Paw (Waves warmly when hovered or mouse is nearby) */}
            <g className={activeEngage > 0.35 ? "hakki-wave-paw-active" : "hakki-wave-paw"}>
              <ellipse
                cx="104"
                cy="90"
                rx="6.4"
                ry="5.2"
                transform="rotate(-26 104 90)"
                fill={`url(#${furGradId})`}
                stroke="#0F172A"
                strokeWidth="2.2"
              />
              {/* Cute Kancil Paw Pad Detail */}
              <circle cx="105" cy="89.5" r="1.8" fill="#FEF3C7" opacity="0.9" />
            </g>
          </svg>
        </div>

        {/* Crisp Monospace Status Tag */}
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`absolute -bottom-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-3 py-1 rounded-md border border-black text-[10px] font-mono font-bold uppercase tracking-wider whitespace-nowrap z-20 transition-all duration-200 ${
            isHovered
              ? "bg-[#1B365D] text-white shadow-[3px_3px_0px_#0F172A] -translate-y-0.5"
              : "bg-[#0F172A] text-white shadow-[2px_2px_0px_#1B365D]"
          }`}
        >
          {mood === "empathetic" ? (
            <>
              <Heart className="w-3 h-3 text-[#93C5FD]" />
              <span>PENDAMPING EMPATI</span>
            </>
          ) : isTyping ? (
            <>
              <BookOpen className="w-3 h-3 text-[#93C5FD]" />
              <span>MENCATAT FAKTA...</span>
            </>
          ) : characterCount >= 15 ? (
            <>
              <CheckCircle2 className="w-3 h-3 text-[#93C5FD]" />
              <span>KRONOLOGI SIAP</span>
            </>
          ) : (
            <>
              <Scale className="w-3 h-3 text-[#93C5FD]" />
              <span>HAKKI · AI PARALEGAL</span>
            </>
          )}
        </div>
      </div>

      <span className="mt-4 text-[10px] font-mono text-brand-muted uppercase tracking-wider">
        Klik Hakki untuk tips hukum
      </span>
    </div>
  );
}
