import { useEffect, useRef, useState } from "react";
import monkeyImg from "@/assets/monkey-namaste.png";

// Dust particle config (seeded for consistency)
const DUST = Array.from({ length: 22 }, (_, i) => {
  const seed = i * 137.508;
  return {
    id: i,
    x: 5 + ((seed * 0.618) % 90),
    y: 5 + ((seed * 0.382) % 90),
    size: 1.5 + (i % 5) * 0.7,
    dx: ((i % 7) - 3) * 35,
    dy: -(20 + (i % 6) * 18),
    duration: 3 + (i % 5),
    delay: 1.8 + (i % 8) * 0.4,
  };
});


export default function ManuscriptScroll() {
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [fadingOut, setFadingOut] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
  // Fade out the scroll after 3s from when it finishes opening (~2.8s) = 5.8s total
  const fadeTimer = setTimeout(() => setFadingOut(true), 5800);
  const hideTimer = setTimeout(() => setHidden(true), 7200);

  return () => {
    clearTimeout(fadeTimer);
    clearTimeout(hideTimer);
  };
}, []);

  if (hidden) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-background"
      style={{
        transition: "opacity 1.4s ease-out",
        opacity: fadingOut ? 0 : 1,
      }}
    >
      {/* Deep atmospheric background */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 55% at 50% 50%, hsl(28,18%,14%) 0%, hsl(var(--background)) 100%)",
        }}
      />

      {/* SVG Defs */}
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <linearGradient id="rodGradTop" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(25,58%,48%)" />
            <stop offset="30%" stopColor="hsl(22,62%,32%)" />
            <stop offset="70%" stopColor="hsl(20,65%,20%)" />
            <stop offset="100%" stopColor="hsl(22,55%,28%)" />
          </linearGradient>
          <linearGradient id="endCapGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(25,55%,50%)" />
            <stop offset="50%" stopColor="hsl(22,60%,30%)" />
            <stop offset="100%" stopColor="hsl(20,65%,18%)" />
          </linearGradient>
          <filter id="rodWood">
            <feTurbulence type="turbulence" baseFrequency="0.02 0.85" numOctaves="4" seed="3" result="wt" />
            <feDisplacementMap in="SourceGraphic" in2="wt" scale="4" />
          </filter>
          <filter id="rodShadow">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="hsl(20,50%,8%)" floodOpacity="0.7" />
          </filter>
        </defs>
      </svg>

      {/* Scroll wrapper */}
      <div
        className="relative z-10 flex flex-col items-center"
        style={{ width: "min(90vw, 700px)", height: "auto" }}

      >
        {/* ── TOP ROD ── */}
        <div
          className="rod-top absolute z-30"
          style={{ top: "50%", marginTop: -14, width: "100%" }}
        >
          <svg width="100%" height="28" viewBox="0 0 700 28" preserveAspectRatio="xMidYMid meet">

            <rect x="28" y="4" width="644" height="20" rx="10" fill="url(#rodGradTop)" filter="url(#rodWood)" />
            <rect x="30" y="5" width="640" height="5" rx="4" fill="hsl(30,52%,58%)" opacity="0.38" />
            <ellipse cx="28" cy="14" rx="22" ry="14" fill="url(#endCapGrad)" />
            <ellipse cx="28" cy="14" rx="15" ry="9" fill="hsl(25,45%,38%)" opacity="0.55" />
            <ellipse cx="25" cy="11" rx="7" ry="4" fill="hsl(32,52%,60%)" opacity="0.28" />
            <ellipse cx="672" cy="14" rx="22" ry="14" fill="url(#endCapGrad)" />
            <ellipse cx="672" cy="14" rx="15" ry="9" fill="hsl(25,45%,38%)" opacity="0.55" />
            <ellipse cx="669" cy="11" rx="7" ry="4" fill="hsl(32,52%,60%)" opacity="0.28" />
          </svg>
        </div>

        {/* ── PARCHMENT ── */}
        <div
          className="scroll-parchment absolute z-20 overflow-hidden"
          style={{
            top: "50%",
            marginTop: -215,
            left: 18,
            right: 18,
            height: 430,
            borderRadius: 3,
          }}
        >
          <svg
            width="100%"
            height="430"
            viewBox="0 0 664 430"
            xmlns="http://www.w3.org/2000/svg"
            style={{ display: "block" }}
          >
            <defs>
              <radialGradient id="parchBg" cx="50%" cy="42%" r="62%">
                <stop offset="0%" stopColor="hsl(40,62%,94%)" />
                <stop offset="35%" stopColor="hsl(37,52%,84%)" />
                <stop offset="68%" stopColor="hsl(34,46%,72%)" />
                <stop offset="100%" stopColor="hsl(30,40%,58%)" />
              </radialGradient>

              <filter id="stain" x="-5%" y="-5%" width="110%" height="110%">
                <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="5" seed="17" result="noise" />
                <feColorMatrix
                  type="matrix"
                  values="0   0   0   0   0.55
                          0   0   0   0   0.32
                          0   0   0   0   0.10
                          0   0   0  -1.8 2.8"
                  in="noise"
                  result="sc"
                />
                <feComposite in="sc" in2="SourceGraphic" operator="in" result="masked" />
                <feBlend in="SourceGraphic" in2="masked" mode="multiply" />
              </filter>

              <filter id="grain">
                <feTurbulence type="fractalNoise" baseFrequency="0.68" numOctaves="4" seed="22" result="g" />
                <feColorMatrix type="saturate" values="0" in="g" result="gg" />
                <feBlend in="SourceGraphic" in2="gg" mode="soft-light" />
              </filter>

              <filter id="inkBlur">
                <feGaussianBlur stdDeviation="0.6" />
              </filter>

              {/* Edge tear filter */}
              <filter id="tearEdge" x="-5%" y="-5%" width="110%" height="110%">
                <feTurbulence type="turbulence" baseFrequency="0.04 0.06" numOctaves="6" seed="9" result="tear" />
                <feDisplacementMap in="SourceGraphic" in2="tear" scale="14" xChannelSelector="R" yChannelSelector="G" />
              </filter>

              <linearGradient id="topCurlShad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(28,38%,35%)" stopOpacity="0.7" />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="botCurlShad" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="hsl(28,38%,35%)" stopOpacity="0.7" />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </linearGradient>

              {/* Vignette gradient for depth */}
              <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
                <stop offset="55%" stopColor="transparent" stopOpacity="0" />
                <stop offset="100%" stopColor="hsl(25,30%,20%)" stopOpacity="0.45" />
              </radialGradient>
            </defs>

            {/* Parchment base */}
            <rect x="0" y="0" width="664" height="430" fill="url(#parchBg)" />
            {/* Aging stain */}
            <rect x="0" y="0" width="664" height="430" fill="hsl(35,45%,80%)" filter="url(#stain)" opacity="0.9" />
            {/* Grain noise */}
            <rect x="0" y="0" width="664" height="430" fill="hsl(38,40%,88%)" opacity="0.35" filter="url(#grain)" />

            {/* Curl shadows */}
            <rect x="0" y="0" width="664" height="60" fill="url(#topCurlShad)" />
            <rect x="0" y="370" width="664" height="60" fill="url(#botCurlShad)" />

            {/* Vignette */}
            <rect x="0" y="0" width="664" height="430" fill="url(#vignette)" />

            {/* ── Torn top edge (very ragged) ── */}
            <path
              d="M0,28 Q6,14 14,22 Q22,30 30,16 Q36,6 44,18 Q52,28 62,10 Q70,0 80,14 Q88,26 98,8 Q106,0 116,12 Q126,24 136,6 Q144,0 154,14 Q162,26 172,10 Q180,2 192,16 Q200,28 212,8 Q222,0 232,14 Q240,26 250,8 Q260,0 272,16 Q282,28 292,10 Q300,0 312,14 Q322,26 332,8 Q342,0 352,16 Q360,28 370,10 Q378,2 390,16 Q400,28 410,8 Q420,0 430,14 Q440,26 450,6 Q458,0 468,14 Q476,26 488,10 Q498,2 508,16 Q518,28 528,10 Q538,0 548,14 Q558,26 568,8 Q578,0 588,14 Q598,26 608,8 Q616,0 626,14 Q634,26 642,10 Q650,2 658,16 Q662,22 664,18 L664,0 L0,0 Z"
              fill="hsl(30,44%,52%)"
              opacity="0.65"
              filter="url(#tearEdge)"
            />
            {/* Torn shadow below top edge */}
            <path
              d="M0,30 Q8,20 18,28 Q28,36 40,18 Q50,6 62,20 Q72,30 84,14 Q94,4 106,18 Q116,30 130,12 Q140,2 154,18 Q164,30 178,12 Q188,2 202,18 Q212,30 226,10 Q238,0 252,16 Q264,28 278,10 Q290,0 304,16 Q316,28 330,10 Q342,0 356,16 Q366,28 380,10 Q392,0 406,16 Q418,28 432,8 Q444,0 456,16 Q466,28 480,10 Q490,2 504,16 Q516,28 528,10 Q540,0 552,16 Q562,28 576,10 Q586,0 598,14 Q608,26 620,8 Q630,0 642,16 Q652,26 664,14 L664,36 L0,36 Z"
              fill="hsl(28,35%,38%)"
              opacity="0.18"
            />

            {/* ── Torn bottom edge ── */}
            <path
              d="M0,402 Q6,416 14,408 Q22,400 30,414 Q36,424 44,412 Q52,402 62,420 Q70,430 80,416 Q88,404 98,422 Q106,430 116,418 Q126,406 136,424 Q144,430 154,416 Q162,404 172,420 Q180,428 192,414 Q200,402 212,422 Q222,430 232,416 Q240,404 250,422 Q260,430 272,414 Q282,402 292,420 Q300,430 312,416 Q322,404 332,422 Q342,430 352,414 Q360,402 370,420 Q378,428 390,414 Q400,402 410,422 Q420,430 430,416 Q440,404 450,424 Q458,430 468,416 Q476,404 488,420 Q498,428 508,414 Q518,402 528,420 Q538,430 548,416 Q558,404 568,422 Q578,430 588,416 Q598,404 608,422 Q616,430 626,416 Q634,404 642,420 Q650,428 658,414 Q662,408 664,412 L664,430 L0,430 Z"
              fill="hsl(30,44%,52%)"
              opacity="0.65"
              filter="url(#tearEdge)"
            />
            {/* Torn shadow above bottom edge */}
            <path
              d="M0,400 Q10,412 22,402 Q34,392 44,410 Q54,424 66,408 Q76,396 88,412 Q100,424 112,408 Q124,396 138,412 Q150,424 162,406 Q174,394 188,410 Q200,424 214,406 Q226,394 240,410 Q252,422 266,406 Q278,394 292,410 Q304,424 318,406 Q330,392 344,410 Q356,424 370,406 Q382,394 396,410 Q408,422 422,406 Q434,394 448,410 Q460,422 474,406 Q486,394 500,410 Q512,424 526,406 Q538,394 552,410 Q564,422 578,406 Q590,394 602,410 Q614,424 626,406 Q638,394 652,410 Q658,416 664,408 L664,430 L0,430 Z"
              fill="hsl(28,35%,38%)"
              opacity="0.18"
            />

            {/* ── Simple ink border (no corners, no dots) ── */}
            <rect x="24" y="24" width="616" height="382" rx="2"
              fill="none" stroke="hsl(28,52%,20%)" strokeWidth="2" opacity="0.5" />

            {/* ── Monkey image — slides in from top ── */}
            <image
              href={monkeyImg}
              x="207"
              y="30"
              width="250"
              height="220"
              preserveAspectRatio="xMidYMid meet"
              className="monkey-slide-in"
              style={{ opacity: 0 }}
            />

            {/* ── WELCOME text — centered vertically ── */}
            {/* Shadow/depth layer */}
            
            <text
            x="335"
            y="270"
            textAnchor="middle"
            fontFamily="'Cinzel Decorative', serif"
            fontWeight="900"
            fontSize="52"
            fill="hsl(28,38%,38%)"
            opacity="0"
            className="content-reveal"
            >
            <tspan x="335" dy="0">Welcome to Your</tspan>
            <tspan x="335" dy="60">Digital Gurukul</tspan>
            </text>
           <text
            x="332"
            y="266"
            textAnchor="middle"
            fontFamily="'Cinzel Decorative', serif"
            fontWeight="900"
            fontSize="52"
            fill="hsl(28,65%,14%)"
            opacity="0"
            className="content-reveal"
            filter="url(#inkBlur)"
            >
            <tspan x="332" dy="0">Welcome to Your</tspan>
            <tspan x="332" dy="60">Digital Gurukul</tspan>
            </text>


            {/* ── Ink underline ── */}
            <rect
              x="82"
              y="350"
              width="500"
              height="3"
              rx="2"
              fill="hsl(28,60%,16%)"
              className="ink-underline"
            />
          </svg>
        </div>

        {/* ── BOTTOM ROD ── */}
        <div
          className="rod-bottom absolute z-30"
          style={{ top: "50%", marginTop: -14, width: "100%" }}
        >
          <svg width="700" height="28" viewBox="0 0 700 28" filter="url(#rodShadow)">
            <rect x="28" y="4" width="644" height="20" rx="10" fill="url(#rodGradTop)" filter="url(#rodWood)" />
            <rect x="30" y="5" width="640" height="5" rx="4" fill="hsl(30,52%,58%)" opacity="0.38" />
            <ellipse cx="28" cy="14" rx="22" ry="14" fill="url(#endCapGrad)" />
            <ellipse cx="28" cy="14" rx="15" ry="9" fill="hsl(25,45%,38%)" opacity="0.55" />
            <ellipse cx="25" cy="11" rx="7" ry="4" fill="hsl(32,52%,60%)" opacity="0.28" />
            <ellipse cx="672" cy="14" rx="22" ry="14" fill="url(#endCapGrad)" />
            <ellipse cx="672" cy="14" rx="15" ry="9" fill="hsl(25,45%,38%)" opacity="0.55" />
            <ellipse cx="669" cy="11" rx="7" ry="4" fill="hsl(32,52%,60%)" opacity="0.28" />
          </svg>
        </div>

        {/* ── DUST PARTICLES ── */}
        {DUST.map((d) => (
          <div
            key={d.id}
            className="dust-particle pointer-events-none absolute rounded-full z-40"
            style={
              {
                left: `${d.x}%`,
                top: `${d.y}%`,
                width: d.size,
                height: d.size,
                background: `hsl(38,55%,82%)`,
                "--dx": `${d.dx}px`,
                "--dy": `${d.dy}px`,
                "--duration": `${d.duration}s`,
                "--delay": `${d.delay}s`,
                opacity: 0,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    </div>
  );
}