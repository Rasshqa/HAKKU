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
  "Ingat: simpan bukti tangkapan layar percakapan dan mutasi bank ya!",
  "Sengketa sewa? Cek pasal 1365 KUHPerdata tentang ganti rugi.",
  "Ada intimidasi pinjol? Laporkan ke Satgas PASTI OJK!",
  "PHK sepihak wajib didahului perundingan bipartit menurut UU 2/2004.",
  "Kuitansi dan invoice adalah alat bukti surat kuat (Pasal 1868 KUHPerdata).",
  "Semua data Anda terlindungi UU PDP dan hanya tersimpan di perangkat Anda!",
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
  const [isBlinking, setIsBlinking] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const lastPointerMoveRef = useRef<number>(0);
  const [isIdle, setIsIdle] = useState(false);

  const rawId = useId();
  const idPrefix = rawId.replace(/[^a-zA-Z0-9]/g, "");
  const furGradId = `${idPrefix}-fur`;
  const creamGradId = `${idPrefix}-cream`;
  const earGradId = `${idPrefix}-ear`;
  const tieGradId = `${idPrefix}-tie`;
  const goldGradId = `${idPrefix}-gold`;

  const getMilestoneMessage = useCallback(() => {
    if (customMessage) return customMessage;
    if (isTyping) return "Hakki lagi mencatat kronologimu...";
    if (characterCount === 0) {
      if (currentTipIndex > 0) {
        return HAKKI_CLICK_TIPS[(currentTipIndex - 1) % HAKKI_CLICK_TIPS.length];
      }
      if (mood === "welcoming") {
        return "Halo! Saya Hakki si Kancil. Ceritakan masalahmu, kita urai bersama!";
      }
      if (mood === "listening") {
        return "Saya menyimak dengan seksama. Tuliskan apa saja yang Anda alami.";
      }
      if (mood === "analyzing") {
        return "Sedang menelaah pasal undang-undang yang relevan dengan kasusmu...";
      }
      if (mood === "celebrating" || mood === "encouraging") {
        return "Hebat! Posisi dan berkas langkah hukummu sudah terangkum dengan baik!";
      }
      if (mood === "empathetic") {
        return "Kamu tidak sendirian. Hakki siap mendampingi membedah hak dan keadilanmu.";
      }
      return "Ceritakan masalahmu di sini. Hakki siap mendengarkan!";
    }
    if (characterCount < 15) {
      return `Bagus! Tuliskan sedikit lagi ya (${characterCount}/15 karakter).`;
    }
    if (characterCount < 80) {
      return "Kronologi awal sudah mulai terlihat. Sebutkan tanggal atau nama pihak kalau ingat!";
    }
    return "Kronologi kamu sudah lengkap dan siap dianalisis!";
  }, [characterCount, currentTipIndex, customMessage, isTyping, mood]);

  // Pointer tracking (smooth Duolingo eye tracking)
  useEffect(() => {
    lastPointerMoveRef.current = Date.now();

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      lastPointerMoveRef.current = Date.now();
      setIsIdle(false);

      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height * 0.4;

      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      const dx = clientX - cx;
      const dy = clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist === 0) return;

      const maxOff = 3.6;
      const factor = Math.min(dist / 220, 1) * maxOff;
      setEyeOffset({ x: (dx / dist) * factor, y: (dy / dist) * factor });
    };

    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("touchmove", handlePointerMove);
    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("touchmove", handlePointerMove);
    };
  }, []);

  // Autonomous Natural Blinking (2.5s-4.5s random timer)
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const blink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 130);
      timeout = setTimeout(blink, 2500 + Math.random() * 2000);
    };
    timeout = setTimeout(blink, 2200);
    return () => clearTimeout(timeout);
  }, []);

  // Idle Detection (>2.5s without mouse movement)
  useEffect(() => {
    const idleChecker = setInterval(() => {
      if (lastPointerMoveRef.current > 0 && Date.now() - lastPointerMoveRef.current > 2500) {
        setIsIdle(true);
      }
    }, 1000);

    return () => clearInterval(idleChecker);
  }, []);

  // Dynamic Idle Gaze Behavior (Curious looking around / Document scanning)
  useEffect(() => {
    if (!isIdle) return;

    let step = 0;
    const gazeCycle = [
      { x: -2.4, y: -0.6 }, // looks curiously to the left
      { x: 0, y: 0 },       // looks forward
      { x: 2.4, y: -0.6 },  // looks to the right
      { x: 0, y: -1.6 },    // looks up thoughtfully
      { x: 0, y: 0 },       // back to center
    ];

    const gazeInterval = setInterval(() => {
      if (mood === "analyzing") {
        // Horizontal clause scanning motion in analyzing mode
        setEyeOffset((prev) => (prev.x <= 0 ? { x: 2.8, y: 0.6 } : { x: -2.8, y: 0.6 }));
      } else {
        step = (step + 1) % gazeCycle.length;
        setEyeOffset(gazeCycle[step]);
      }
    }, 2200);

    return () => clearInterval(gazeInterval);
  }, [isIdle, mood]);

  // Click handler with squash-and-stretch jump and legal tip cycle
  const handleMascotClick = () => {
    setIsBouncing(true);
    setCurrentTipIndex((prev) => prev + 1);
    setTimeout(() => setIsBouncing(false), 500);
  };

  const sizeMap = { sm: 100, md: 160, lg: 220 };
  const svgSize = sizeMap[size];
  const containerClass = {
    sm: "w-[100px] h-[100px]",
    md: "w-[160px] h-[160px]",
    lg: "w-[220px] h-[220px]",
  }[size];

  return (
    <div ref={containerRef} className={`relative flex flex-col items-center select-none ${className}`}>
      {/* Speech Bubble */}
      {showSpeechBubble && (
        <div className="mb-3 relative max-w-xs sm:max-w-sm px-4 py-3 rounded-2xl bg-white border border-brand-border shadow-xs animate-speech-pop">
          <div className="flex items-start gap-2.5">
            <div
              className={`p-1.5 rounded-full shrink-0 mt-0.5 transition-colors ${
                characterCount >= 15 ? "bg-emerald-50 text-brand-success" : "bg-blue-50 text-brand-primary"
              }`}
            >
              {characterCount >= 15 ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <MessageSquare className="w-3.5 h-3.5" />
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-primary">
                <span>Hakki si Kancil</span>
                <span className="w-1 h-1 rounded-full bg-brand-primary/40" />
                <span className="text-brand-muted font-normal lowercase">
                  {isTyping ? "sedang menyimak..." : mood === "analyzing" ? "menelaah hukum..." : "sahabat hukum"}
                </span>
              </div>
              <p className="text-xs text-brand-text leading-relaxed font-medium">
                {getMilestoneMessage()}
              </p>
            </div>
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white border-b border-r border-brand-border rotate-45" />
        </div>
      )}

      {/* 2D Duolingo-style Cartoon Kancil Mascot (Fluid Animations, No Jarring Scale Zoom) */}
      <div className="relative">
        <div
          onClick={handleMascotClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleMascotClick();
            }
          }}
          aria-label="Hakki si Kancil — sentuh untuk tip hukum interaktif"
          className={`relative group cursor-pointer transition-all duration-300 ${containerClass} ${
            isBouncing ? "animate-hakki-jump" : "hover:-translate-y-1 hover:rotate-1"
          }`}
        >
          <svg
            viewBox="0 0 100 100"
            width={svgSize}
            height={svgSize}
            className="drop-shadow-sm transition-opacity"
          >
            <defs>
              <style>{`
                /* Rhythmic Idle Breathing Animation */
                .hakki-breathe-group {
                  animation: hakki-breathe-anim 3.2s ease-in-out infinite;
                  transform-origin: 50px 92px;
                }
                .hakki-shadow-group {
                  animation: hakki-shadow-anim 3.2s ease-in-out infinite;
                  transform-origin: 50px 95.5px;
                }
                @keyframes hakki-breathe-anim {
                  0%, 100% {
                    transform: translateY(0px) scale(1, 1);
                  }
                  50% {
                    transform: translateY(-2px) scale(1.012, 0.99);
                  }
                }
                @keyframes hakki-shadow-anim {
                  0%, 100% {
                    transform: scale(1);
                    opacity: 0.12;
                  }
                  50% {
                    transform: scale(0.92);
                    opacity: 0.08;
                  }
                }

                /* Independent Ear Twitches */
                .hakki-ear-l-group {
                  animation: hakki-ear-l-anim 4.8s ease-in-out infinite;
                  transform-box: fill-box;
                  transform-origin: bottom right;
                }
                .hakki-ear-r-group {
                  animation: hakki-ear-r-anim 5.4s ease-in-out infinite;
                  transform-box: fill-box;
                  transform-origin: bottom left;
                }
                @keyframes hakki-ear-l-anim {
                  0%, 86%, 100% { transform: rotate(0deg); }
                  89% { transform: rotate(-12deg); }
                  92% { transform: rotate(5deg); }
                  95% { transform: rotate(0deg); }
                }
                @keyframes hakki-ear-r-anim {
                  0%, 80%, 100% { transform: rotate(0deg); }
                  83% { transform: rotate(14deg); }
                  86% { transform: rotate(-4deg); }
                  89% { transform: rotate(0deg); }
                }

                /* Mousedeer Tail Wag */
                .hakki-tail-group {
                  animation: hakki-tail-anim 2.4s ease-in-out infinite;
                  transform-box: fill-box;
                  transform-origin: right center;
                }
                @keyframes hakki-tail-anim {
                  0%, 100% { transform: rotate(0deg); }
                  25% { transform: rotate(-18deg); }
                  75% { transform: rotate(14deg); }
                }

                /* Welcoming Wave */
                .hakki-wave-group {
                  animation: hakki-wave-anim 1.4s ease-in-out infinite;
                  transform-box: fill-box;
                  transform-origin: bottom left;
                }
                @keyframes hakki-wave-anim {
                  0%, 100% { transform: rotate(0deg); }
                  20% { transform: rotate(-18deg); }
                  40% { transform: rotate(12deg); }
                  60% { transform: rotate(-12deg); }
                  80% { transform: rotate(6deg); }
                }

                /* Scales of Justice Balance Sway */
                .hakki-scales-group {
                  animation: hakki-scales-sway-anim 3.6s ease-in-out infinite;
                  transform-box: fill-box;
                  transform-origin: top center;
                }
                .hakki-pan-l-group {
                  animation: hakki-pan-l-anim 3.6s ease-in-out infinite;
                }
                .hakki-pan-r-group {
                  animation: hakki-pan-r-anim 3.6s ease-in-out infinite;
                }
                @keyframes hakki-scales-sway-anim {
                  0%, 100% { transform: rotate(0deg); }
                  50% { transform: rotate(4.5deg); }
                }
                @keyframes hakki-pan-l-anim {
                  0%, 100% { transform: translateY(0px); }
                  50% { transform: translateY(-1.8px); }
                }
                @keyframes hakki-pan-r-anim {
                  0%, 100% { transform: translateY(0px); }
                  50% { transform: translateY(1.8px); }
                }

                /* Listening Nod */
                .hakki-listen-head-group {
                  animation: hakki-nod-anim 2.2s ease-in-out infinite;
                  transform-box: fill-box;
                  transform-origin: bottom center;
                }
                @keyframes hakki-nod-anim {
                  0%, 100% { transform: translateY(0px) rotate(0deg); }
                  35% { transform: translateY(1.8px) rotate(1.4deg); }
                  65% { transform: translateY(0.2px) rotate(-0.8deg); }
                }

                /* Celebrating Cheer */
                .hakki-cheer-l-group {
                  animation: hakki-cheer-l-anim 0.8s ease-in-out infinite;
                  transform-box: fill-box;
                  transform-origin: bottom right;
                }
                .hakki-cheer-r-group {
                  animation: hakki-cheer-r-anim 0.8s ease-in-out infinite;
                  transform-box: fill-box;
                  transform-origin: bottom left;
                }
                @keyframes hakki-cheer-l-anim {
                  0%, 100% { transform: translateY(0px) rotate(0deg); }
                  50% { transform: translateY(-4px) rotate(-16deg); }
                }
                @keyframes hakki-cheer-r-anim {
                  0%, 100% { transform: translateY(0px) rotate(0deg); }
                  50% { transform: translateY(-4px) rotate(16deg); }
                }

                /* Analyzing Thought Pulse */
                .hakki-thought-pulse {
                  animation: hakki-pulse-anim 1.6s ease-in-out infinite;
                  transform-box: fill-box;
                  transform-origin: center center;
                }
                @keyframes hakki-pulse-anim {
                  0%, 100% { transform: scale(0.9); opacity: 0.6; }
                  50% { transform: scale(1.18); opacity: 1; }
                }

                @media (prefers-reduced-motion: reduce) {
                  .hakki-breathe-group,
                  .hakki-shadow-group,
                  .hakki-ear-l-group,
                  .hakki-ear-r-group,
                  .hakki-tail-group,
                  .hakki-wave-group,
                  .hakki-scales-group,
                  .hakki-pan-l-group,
                  .hakki-pan-r-group,
                  .hakki-listen-head-group,
                  .hakki-cheer-l-group,
                  .hakki-cheer-r-group,
                  .hakki-thought-pulse {
                    animation: none !important;
                    transform: none !important;
                  }
                }
              `}</style>

              {/* Warm Caramel Fur Gradient */}
              <linearGradient id={furGradId} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#DE8938" />
                <stop offset="100%" stopColor="#BA621C" />
              </linearGradient>

              {/* Soft Cream Belly & Muzzle Gradient */}
              <linearGradient id={creamGradId} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFBEB" />
                <stop offset="100%" stopColor="#FEE685" />
              </linearGradient>

              {/* Cute Inner Ear Gradient */}
              <linearGradient id={earGradId} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FDA4AF" />
                <stop offset="100%" stopColor="#F472B6" />
              </linearGradient>

              {/* Paralegal Bow Tie Gradient */}
              <linearGradient id={tieGradId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2563EB" />
                <stop offset="100%" stopColor="#1D4ED8" />
              </linearGradient>

              {/* Gold Scale & Horn Accent Gradient */}
              <linearGradient id={goldGradId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FBBF24" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>
            </defs>

            {/* Ground Shadow with Gentle Breathe Pulse */}
            <ellipse
              cx="50"
              cy="95.5"
              rx="25"
              ry="3.5"
              fill="#0f172a"
              className="hakki-shadow-group"
            />

            {/* Entire Character Group with Living Breathing Motion */}
            <g className="hakki-breathe-group">
              {/* Cute Mousedeer White-Tipped Tail (Wags happily behind hip) */}
              <g className="hakki-tail-group">
                <path
                  d="M 33,83 C 25,81 20,84 18,88 C 19,90 22,90 26,87 C 29,85 31,86 33,84 Z"
                  fill={`url(#${furGradId})`}
                  stroke="#A15312"
                  strokeWidth="0.6"
                />
                <path
                  d="M 18,88 C 19,90 22,90 24,88 C 22,87 19,87 18,88 Z"
                  fill="#FFFFFF"
                />
              </g>

              {/* Little Stylized Golden Horn Buds (Kancil cartoon crown accent) */}
              <g>
                {/* Left Horn */}
                <path
                  d="M 37,23 C 34,16 28,11 25,8 C 23.5,6.5 21.5,8 22.5,10 C 24.5,13 28.5,17 31.5,22 C 32.5,24 35,25 37,23 Z"
                  fill={`url(#${goldGradId})`}
                />
                <path
                  d="M 27,13.5 C 22.5,13.5 20,15.5 21,17.5 C 22,18.5 24.5,17.5 28,15.5 Z"
                  fill={`url(#${goldGradId})`}
                />
                {/* Right Horn */}
                <path
                  d="M 63,23 C 66,16 72,11 75,8 C 76.5,6.5 78.5,8 77.5,10 C 75.5,13 71.5,17 68.5,22 C 67.5,24 65,25 63,23 Z"
                  fill={`url(#${goldGradId})`}
                />
                <path
                  d="M 73,13.5 C 77.5,13.5 80,15.5 79,17.5 C 78,18.5 75.5,17.5 72,15.5 Z"
                  fill={`url(#${goldGradId})`}
                />
              </g>

              {/* Deer Ears (Independently Animated Twitches) */}
              <g>
                {/* Left Ear */}
                <g className="hakki-ear-l-group">
                  <path
                    d="M 31,31 C 23,28 12,20 12,12 C 19,13 28,21 34,27 Z"
                    fill={`url(#${furGradId})`}
                    stroke="#A15312"
                    strokeWidth="0.8"
                  />
                  <path
                    d="M 29,29 C 23,26 16,20 16,14 C 20,15 26,21 31,26 Z"
                    fill={`url(#${earGradId})`}
                  />
                </g>

                {/* Right Ear */}
                <g className="hakki-ear-r-group">
                  <path
                    d="M 69,31 C 77,28 88,20 88,12 C 81,13 72,21 66,27 Z"
                    fill={`url(#${furGradId})`}
                    stroke="#A15312"
                    strokeWidth="0.8"
                  />
                  <path
                    d="M 71,29 C 77,26 84,20 84,14 C 80,15 74,21 69,26 Z"
                    fill={`url(#${earGradId})`}
                  />
                </g>
              </g>

              {/* Head & Facial Group (Nods attentively in listening mood) */}
              <g className={mood === "listening" ? "hakki-listen-head-group" : ""}>
                {/* Head (Plush Duolingo-style Rounded Deer Face) */}
                <path
                  d="M 30,42 C 29,26 71,26 70,42 C 73,50 71,59 64,62 C 57,65 43,65 36,62 C 29,59 27,50 30,42 Z"
                  fill={`url(#${furGradId})`}
                />

                {/* Cute Forehead Hair Tuft */}
                <path
                  d="M 47,24 C 47,19 50,17 50,17 C 50,17 53,19 53,24 Z"
                  fill={`url(#${goldGradId})`}
                />

                {/* Thinking Sparkle in Analyzing Mood */}
                {mood === "analyzing" && (
                  <g className="hakki-thought-pulse">
                    <path
                      d="M 50,4 L 51.5,9.5 L 57,11 L 51.5,12.5 L 50,18 L 48.5,12.5 L 43,11 L 48.5,9.5 Z"
                      fill="#F59E0B"
                    />
                    <circle cx="50" cy="11" r="1.5" fill="#FFFBEB" />
                  </g>
                )}

                {/* Muzzle (Lighter Snout Patch) */}
                <path
                  d="M 37,49 C 37,44 63,44 63,49 C 64,57 60,63 50,63 C 40,63 36,57 37,49 Z"
                  fill={`url(#${creamGradId})`}
                />

                {/* Eyebrows (Empathetic / Curious / Standard) */}
                {mood === "empathetic" ? (
                  <g>
                    <path
                      d="M 35,34 Q 40,31 45,34"
                      stroke="#7C2D12"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d="M 55,34 Q 60,31 65,34"
                      stroke="#7C2D12"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </g>
                ) : (
                  <g>
                    <path
                      d="M 35,32 Q 40,29 45,32"
                      stroke="#7C2D12"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d="M 55,32 Q 60,29 65,32"
                      stroke="#7C2D12"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </g>
                )}

                {/* Eyes */}
                {isBlinking ? (
                  <g>
                    <path
                      d="M 34,42 Q 40,46 46,42"
                      stroke="#1E130B"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d="M 54,42 Q 60,46 66,42"
                      stroke="#1E130B"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </g>
                ) : (
                  <g>
                    {/* Left Eye White */}
                    <ellipse
                      cx="40"
                      cy="40.5"
                      rx="6"
                      ry="7"
                      fill="#FFFFFF"
                      stroke="#382110"
                      strokeWidth="0.75"
                    />
                    {/* Right Eye White */}
                    <ellipse
                      cx="60"
                      cy="40.5"
                      rx="6"
                      ry="7"
                      fill="#FFFFFF"
                      stroke="#382110"
                      strokeWidth="0.75"
                    />

                    {/* Left Pupil (Follows Pointer / Idle Gaze with Smooth Transition) */}
                    <circle
                      cx={40 + eyeOffset.x}
                      cy={40.5 + eyeOffset.y}
                      r="3.6"
                      fill="#1E130B"
                      style={{ transition: "cx 0.16s ease-out, cy 0.16s ease-out" }}
                    />
                    {/* Right Pupil (Follows Pointer / Idle Gaze with Smooth Transition) */}
                    <circle
                      cx={60 + eyeOffset.x}
                      cy={40.5 + eyeOffset.y}
                      r="3.6"
                      fill="#1E130B"
                      style={{ transition: "cx 0.16s ease-out, cy 0.16s ease-out" }}
                    />

                    {/* Primary High-Gloss Shines */}
                    <circle
                      cx={41.5 + eyeOffset.x * 0.4}
                      cy={38.8 + eyeOffset.y * 0.4}
                      r="1.4"
                      fill="#FFFFFF"
                      style={{ transition: "cx 0.16s ease-out, cy 0.16s ease-out" }}
                    />
                    <circle
                      cx={61.5 + eyeOffset.x * 0.4}
                      cy={38.8 + eyeOffset.y * 0.4}
                      r="1.4"
                      fill="#FFFFFF"
                      style={{ transition: "cx 0.16s ease-out, cy 0.16s ease-out" }}
                    />

                    {/* Secondary Cute Anime Shines */}
                    <circle
                      cx={38.5 + eyeOffset.x * 0.4}
                      cy={42.2 + eyeOffset.y * 0.4}
                      r="0.8"
                      fill="#FFFFFF"
                      opacity="0.85"
                      style={{ transition: "cx 0.16s ease-out, cy 0.16s ease-out" }}
                    />
                    <circle
                      cx={58.5 + eyeOffset.x * 0.4}
                      cy={42.2 + eyeOffset.y * 0.4}
                      r="0.8"
                      fill="#FFFFFF"
                      opacity="0.85"
                      style={{ transition: "cx 0.16s ease-out, cy 0.16s ease-out" }}
                    />
                  </g>
                )}

                {/* Scholarly Wire-Rim Round Glasses in Analyzing Mood */}
                {mood === "analyzing" && (
                  <g className="hakki-glasses">
                    <circle cx="40" cy="40.5" r="7.2" fill="none" stroke="#D97706" strokeWidth="1.2" opacity="0.9" />
                    <circle cx="60" cy="40.5" r="7.2" fill="none" stroke="#D97706" strokeWidth="1.2" opacity="0.9" />
                    <path d="M 47.2,40.5 Q 50,39 52.8,40.5" fill="none" stroke="#D97706" strokeWidth="1.2" />
                    <line x1="32.8" y1="40.5" x2="28" y2="39.5" stroke="#D97706" strokeWidth="1" strokeLinecap="round" />
                    <line x1="67.2" y1="40.5" x2="72" y2="39.5" stroke="#D97706" strokeWidth="1" strokeLinecap="round" />
                  </g>
                )}

                {/* Nose */}
                <path
                  d="M 47,49 C 47,47.5 53,47.5 53,49 C 53,51 51,52.5 50,52.5 C 49,52.5 47,51 47,49 Z"
                  fill="#1E130B"
                />
                <ellipse cx="49" cy="48.5" rx="1" ry="0.6" fill="#6B4D36" opacity="0.6" />

                {/* Mouth */}
                {mood === "celebrating" ? (
                  <g>
                    <path d="M 45,54 Q 50,61 55,54 Z" fill="#881337" />
                    <path d="M 47,57 Q 50,61 53,57 Z" fill="#FB7185" />
                  </g>
                ) : isTyping ? (
                  <ellipse cx="50" cy="56" rx="2" ry="1.6" fill="#1E130B" />
                ) : mood === "empathetic" ? (
                  <path
                    d="M 46,55 Q 50,57.5 54,55"
                    stroke="#1E130B"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    fill="none"
                  />
                ) : (
                  <path
                    d="M 45,54 Q 47.5,56.5 50,54 Q 52.5,56.5 55,54"
                    stroke="#1E130B"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    fill="none"
                  />
                )}

                {/* Rosy Cheeks */}
                <ellipse cx="32" cy="48" rx="3.8" ry="2.2" fill="#FB7185" opacity="0.4" />
                <ellipse cx="68" cy="48" rx="3.8" ry="2.2" fill="#FB7185" opacity="0.4" />
              </g>

              {/* Torso & Belly */}
              <ellipse cx="50" cy="77" rx="18" ry="16" fill={`url(#${furGradId})`} />
              <ellipse cx="50" cy="80" rx="12" ry="11" fill={`url(#${creamGradId})`} />

              {/* Cute Mousedeer Chibi Fawn Spots */}
              <circle cx="34" cy="73" r="1.3" fill="#FFFFFF" opacity="0.65" />
              <circle cx="31" cy="77" r="1.1" fill="#FFFFFF" opacity="0.65" />
              <circle cx="66" cy="73" r="1.3" fill="#FFFFFF" opacity="0.65" />
              <circle cx="69" cy="77" r="1.1" fill="#FFFFFF" opacity="0.65" />

              {/* Iconic Indonesian Mousedeer (Kancil) White Throat Chevron Markings */}
              <g>
                <path
                  d="M 46,67 L 50,70 L 54,67"
                  stroke="#FFFFFF"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                <path
                  d="M 45,71.5 L 50,74.5 L 55,71.5"
                  stroke="#FFFFFF"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                <path
                  d="M 46,76 L 50,79 L 54,76"
                  stroke="#FFFFFF"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </g>

              {/* Paralegal Bow Tie with Golden Scales Pin */}
              <g>
                <path d="M 50,63 L 44,60.5 L 44,65.5 Z" fill={`url(#${tieGradId})`} />
                <path d="M 50,63 L 56,60.5 L 56,65.5 Z" fill={`url(#${tieGradId})`} />
                <circle cx="50" cy="63" r="2" fill="#1D4ED8" />
                <circle cx="50" cy="63" r="1.1" fill={`url(#${goldGradId})`} />
              </g>

              {/* Arms / Paws & Accessories */}
              {mood === "empathetic" ? (
                <g>
                  {/* Left Arm to Heart */}
                  <path
                    d="M 33,72 Q 41,75 45,71"
                    stroke="#BA621C"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <circle cx="45" cy="71" r="2.8" fill="#5A3512" />
                  {/* Right Arm to Heart */}
                  <path
                    d="M 67,72 Q 59,75 55,71"
                    stroke="#BA621C"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <circle cx="55" cy="71" r="2.8" fill="#5A3512" />
                </g>
              ) : mood === "celebrating" ? (
                <g>
                  {/* Left Arm Celebrating */}
                  <g className="hakki-cheer-l-group">
                    <path
                      d="M 33,69 Q 22,58 17,50"
                      stroke="#BA621C"
                      strokeWidth="4.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <circle cx="17" cy="50" r="2.8" fill="#5A3512" />
                  </g>
                  {/* Right Arm Celebrating */}
                  <g className="hakki-cheer-r-group">
                    <path
                      d="M 67,69 Q 78,58 83,50"
                      stroke="#BA621C"
                      strokeWidth="4.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <circle cx="83" cy="50" r="2.8" fill="#5A3512" />
                  </g>
                </g>
              ) : mood === "welcoming" ? (
                <g>
                  {/* Right Arm Waving in Continuous Greeting */}
                  <g className="hakki-wave-group">
                    <path
                      d="M 67,70 Q 77,65 80,56"
                      stroke="#BA621C"
                      strokeWidth="4.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <circle cx="80" cy="56" r="2.8" fill="#5A3512" />
                  </g>

                  {/* Left Arm Holding Golden Scales of Justice */}
                  <path
                    d="M 33,72 Q 25,74 22,78"
                    stroke="#BA621C"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <circle cx="22" cy="78" r="2.8" fill="#5A3512" />

                  {/* Golden Scales of Justice with Gentle Swaying Pans */}
                  <g className="hakki-scales-group">
                    <line
                      x1="16"
                      y1="62"
                      x2="16"
                      y2="78"
                      stroke="#D97706"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                    <ellipse cx="16" cy="78" rx="3.5" ry="1.2" fill="#B45309" />
                    <line
                      x1="9"
                      y1="65"
                      x2="23"
                      y2="65"
                      stroke="#D97706"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />

                    {/* Left Pan */}
                    <g className="hakki-pan-l-group">
                      <line x1="10" y1="65" x2="7.5" y2="71" stroke="#F59E0B" strokeWidth="0.8" />
                      <line x1="10" y1="65" x2="12.5" y2="71" stroke="#F59E0B" strokeWidth="0.8" />
                      <path d="M 6.5,71 Q 10,73.5 13.5,71 Z" fill={`url(#${goldGradId})`} />
                    </g>

                    {/* Right Pan */}
                    <g className="hakki-pan-r-group">
                      <line x1="22" y1="65" x2="19.5" y2="71" stroke="#F59E0B" strokeWidth="0.8" />
                      <line x1="22" y1="65" x2="24.5" y2="71" stroke="#F59E0B" strokeWidth="0.8" />
                      <path d="M 18.5,71 Q 22,73.5 25.5,71 Z" fill={`url(#${goldGradId})`} />
                    </g>
                    <circle cx="16" cy="65" r="1.3" fill="#B45309" />
                  </g>
                </g>
              ) : (
                <g>
                  {/* Resting Paws */}
                  <path
                    d="M 33,73 Q 26,76 33,81"
                    stroke="#BA621C"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <circle cx="33" cy="81" r="2.8" fill="#5A3512" />
                  <path
                    d="M 67,73 Q 74,76 67,81"
                    stroke="#BA621C"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <circle cx="67" cy="81" r="2.8" fill="#5A3512" />
                </g>
              )}

              {/* Hooves / Feet (Grounded firmly on the shadow) */}
              <g>
                <ellipse cx="42" cy="92" rx="5.5" ry="3" fill="#BA621C" />
                <ellipse cx="42" cy="93" rx="4.5" ry="1.6" fill="#3D2314" />
                <ellipse cx="58" cy="92" rx="5.5" ry="3" fill="#BA621C" />
                <ellipse cx="58" cy="93" rx="4.5" ry="1.6" fill="#3D2314" />
              </g>
            </g>
          </svg>
        </div>

        {/* Status Badge */}
        <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-brand-border shadow-xs text-[11px] font-bold text-brand-text whitespace-nowrap z-20 transition-colors">
          {mood === "empathetic" ? (
            <>
              <Heart className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
              <span className="text-rose-700">Mendengar dengan Empati</span>
            </>
          ) : isTyping ? (
            <>
              <BookOpen className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
              <span className="text-amber-800">Mencatat...</span>
            </>
          ) : characterCount >= 15 ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-success" />
              <span className="text-brand-success">Kronologi Siap!</span>
            </>
          ) : (
            <>
              <Scale className="w-3.5 h-3.5 text-brand-primary" />
              <span>Sahabat Hukum Warga</span>
            </>
          )}
        </div>
      </div>

      <span className="mt-3.5 text-[10px] text-brand-muted font-medium">
        Sentuh Hakki untuk tip hukum interaktif!
      </span>
    </div>
  );
}
