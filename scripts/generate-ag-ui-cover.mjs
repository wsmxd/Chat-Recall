import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const width = 1920;
const height = 1080;
const outDir = path.resolve("public");
const svgPath = path.join(outDir, "ag-ui-cover.svg");
const pngPath = path.join(outDir, "ag-ui-cover.png");

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#07111f"/>
      <stop offset="0.42" stop-color="#141033"/>
      <stop offset="0.78" stop-color="#061e2f"/>
      <stop offset="1" stop-color="#0f172a"/>
    </linearGradient>
    <radialGradient id="hot" cx="0.75" cy="0.42" r="0.62">
      <stop offset="0" stop-color="#ff4fd8" stop-opacity="0.76"/>
      <stop offset="0.38" stop-color="#6ee7ff" stop-opacity="0.26"/>
      <stop offset="1" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="cyan" cx="0.18" cy="0.22" r="0.48">
      <stop offset="0" stop-color="#2dfcff" stop-opacity="0.52"/>
      <stop offset="1" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="panel" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1ff8ff" stop-opacity="0.32"/>
      <stop offset="0.5" stop-color="#a855f7" stop-opacity="0.28"/>
      <stop offset="1" stop-color="#ff5ccc" stop-opacity="0.30"/>
    </linearGradient>
    <linearGradient id="hair" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#eff9ff"/>
      <stop offset="0.38" stop-color="#8ee8ff"/>
      <stop offset="0.72" stop-color="#d76cff"/>
      <stop offset="1" stop-color="#ff4eb8"/>
    </linearGradient>
    <linearGradient id="jacket" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1fe7ff"/>
      <stop offset="0.5" stop-color="#7057ff"/>
      <stop offset="1" stop-color="#ff4bc2"/>
    </linearGradient>
    <filter id="glow" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation="10" result="blur"/>
      <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0.4  0 0 0 0 0.95  0 0 0 0 1  0 0 0 0.9 0"/>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="pinkGlow" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation="12" result="blur"/>
      <feColorMatrix in="blur" type="matrix" values="0 0 0 0 1  0 0 0 0 0.22  0 0 0 0 0.75  0 0 0 0.9 0"/>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="shadow" x="-30%" y="-30%" width="160%" height="180%">
      <feDropShadow dx="0" dy="24" stdDeviation="28" flood-color="#000814" flood-opacity="0.55"/>
    </filter>
    <clipPath id="screenClip">
      <rect x="0" y="0" width="720" height="180" rx="24"/>
    </clipPath>
  </defs>

  <rect width="1920" height="1080" fill="url(#bg)"/>
  <rect width="1920" height="1080" fill="url(#hot)"/>
  <rect width="1920" height="1080" fill="url(#cyan)"/>

  <g opacity="0.28">
    <path d="M0 190 H1920 M0 350 H1920 M0 510 H1920 M0 670 H1920 M0 830 H1920" stroke="#6ee7ff" stroke-width="1"/>
    <path d="M180 0 V1080 M420 0 V1080 M660 0 V1080 M900 0 V1080 M1140 0 V1080 M1380 0 V1080 M1620 0 V1080" stroke="#ff5bd6" stroke-width="1"/>
  </g>
  <g opacity="0.36" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="M90 930 C340 790 430 610 655 610 S945 435 1175 455 S1450 355 1810 220" stroke="#18f3ff" stroke-width="4"/>
    <path d="M70 210 C330 330 525 258 735 360 S1020 630 1288 594 S1550 720 1850 620" stroke="#ff4fd8" stroke-width="3"/>
  </g>

  <g transform="translate(92 92)">
    <rect x="0" y="0" width="780" height="548" rx="34" fill="#071827" fill-opacity="0.64" stroke="url(#panel)" stroke-width="3"/>
    <rect x="30" y="34" width="175" height="44" rx="22" fill="#12efff" fill-opacity="0.16" stroke="#51f6ff" stroke-opacity="0.7"/>
    <text x="58" y="65" fill="#c9fbff" font-family="-apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif" font-size="24" font-weight="800">AG-UI 101</text>
    <text x="28" y="176" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif" font-size="92" font-weight="900">介绍 AG-UI</text>
    <text x="32" y="274" fill="#8ff7ff" font-family="-apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif" font-size="54" font-weight="800">Agent × UI 协议入门</text>
    <text x="34" y="346" fill="#f8d8ff" font-family="-apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif" font-size="34" font-weight="700">让 AI Agent 实时驱动你的前端界面</text>
    <g transform="translate(34 405)">
      <rect x="0" y="0" width="180" height="54" rx="14" fill="#ff4fcf" filter="url(#pinkGlow)"/>
      <text x="30" y="37" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif" font-size="28" font-weight="900">爆肝也能懂</text>
      <rect x="208" y="0" width="210" height="54" rx="14" fill="#10dffa" fill-opacity="0.22" stroke="#62f7ff"/>
      <text x="236" y="37" fill="#d9fdff" font-family="-apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif" font-size="28" font-weight="850">前端开发必看</text>
    </g>
  </g>

  <g transform="translate(122 710)" filter="url(#glow)">
    <rect x="0" y="0" width="720" height="180" rx="24" fill="#03111e" fill-opacity="0.88" stroke="#55efff" stroke-width="2"/>
    <g clip-path="url(#screenClip)" opacity="0.95">
      <path d="M42 64 H235 L280 30 H430 L476 82 H650" stroke="#1df7ff" stroke-width="5" fill="none"/>
      <path d="M42 126 H180 L220 92 H382 L420 132 H650" stroke="#ff55ca" stroke-width="5" fill="none"/>
      <circle cx="118" cy="64" r="12" fill="#1df7ff"/>
      <circle cx="280" cy="30" r="12" fill="#ffffff"/>
      <circle cx="476" cy="82" r="12" fill="#ff55ca"/>
      <circle cx="420" cy="132" r="12" fill="#ff55ca"/>
      <text x="44" y="154" fill="#eaffff" font-family="'SFMono-Regular', Consolas, monospace" font-size="24" font-weight="800">agent_state → ui_event → component_update</text>
    </g>
  </g>

  <g transform="translate(1030 84)" filter="url(#shadow)">
    <ellipse cx="408" cy="855" rx="312" ry="58" fill="#020617" opacity="0.55"/>
    <g opacity="0.72" fill="none" stroke-linecap="round">
      <path d="M78 662 C180 525 262 542 365 395 C500 204 712 240 816 86" stroke="#21f4ff" stroke-width="8" filter="url(#glow)"/>
      <path d="M66 738 C226 650 330 710 474 575 C602 455 718 522 846 395" stroke="#ff55ce" stroke-width="7" filter="url(#pinkGlow)"/>
    </g>

    <g transform="translate(230 52)">
      <path d="M238 172 C132 192 82 272 82 392 C82 516 157 602 118 736 C205 704 288 727 398 760 C514 794 640 752 705 650 C628 598 664 494 665 386 C667 258 555 156 430 151 C360 86 284 103 238 172Z" fill="#1a0b2e"/>
      <path d="M176 214 C64 338 77 552 132 686 C195 604 242 484 250 332 C255 260 230 226 176 214Z" fill="url(#hair)"/>
      <path d="M488 188 C640 258 710 442 666 645 C604 550 558 442 548 306 C542 236 542 204 488 188Z" fill="url(#hair)"/>
      <path d="M214 166 C286 70 464 74 540 184 C608 282 565 440 496 505 C421 576 300 562 234 488 C162 406 142 262 214 166Z" fill="url(#hair)"/>
      <path d="M245 204 C301 130 442 126 505 206 C548 262 556 382 511 455 C456 543 316 545 252 457 C198 382 196 268 245 204Z" fill="#ffd7df"/>
      <path d="M238 286 C282 286 326 264 368 223 C408 271 471 290 524 286 C522 244 506 204 474 178 C402 128 286 144 246 214 C233 236 229 262 238 286Z" fill="url(#hair)"/>
      <path d="M226 348 C200 340 180 357 184 391 C188 424 214 441 238 423" fill="#ffc9d6"/>
      <path d="M527 348 C553 340 573 357 569 391 C565 424 539 441 515 423" fill="#ffc9d6"/>
      <g>
        <ellipse cx="310" cy="356" rx="38" ry="48" fill="#ffffff"/>
        <ellipse cx="456" cy="356" rx="38" ry="48" fill="#ffffff"/>
        <ellipse cx="316" cy="360" rx="22" ry="31" fill="#18e7ff"/>
        <ellipse cx="462" cy="360" rx="22" ry="31" fill="#ff50d1"/>
        <circle cx="307" cy="346" r="8" fill="#ffffff"/>
        <circle cx="453" cy="346" r="8" fill="#ffffff"/>
        <path d="M270 314 C296 295 333 298 356 320" stroke="#23102b" stroke-width="12" stroke-linecap="round" fill="none"/>
        <path d="M420 320 C447 298 484 296 506 314" stroke="#23102b" stroke-width="12" stroke-linecap="round" fill="none"/>
      </g>
      <path d="M379 376 C368 404 363 426 394 427" stroke="#de8196" stroke-width="7" stroke-linecap="round" fill="none"/>
      <path d="M336 466 C376 494 424 492 457 464" stroke="#e54686" stroke-width="9" stroke-linecap="round" fill="none"/>
      <circle cx="264" cy="418" r="24" fill="#ff7ab6" opacity="0.38"/>
      <circle cx="507" cy="418" r="24" fill="#ff7ab6" opacity="0.38"/>

      <path d="M282 548 L496 548 C575 587 625 680 634 824 L144 824 C158 682 205 590 282 548Z" fill="#0c1628"/>
      <path d="M280 548 C304 622 350 670 388 688 C434 662 478 616 500 548 C454 576 327 576 280 548Z" fill="#ffd6df"/>
      <path d="M182 676 C226 590 278 548 328 548 L390 824 H144 C150 765 162 714 182 676Z" fill="url(#jacket)"/>
      <path d="M590 676 C546 590 494 548 444 548 L382 824 H636 C630 765 610 714 590 676Z" fill="url(#jacket)"/>
      <path d="M308 584 L386 824 L462 584 C432 612 340 613 308 584Z" fill="#07111f"/>
      <path d="M346 594 L388 650 L430 594 L392 824Z" fill="#18f5ff" opacity="0.72"/>

      <g filter="url(#glow)">
        <rect x="124" y="22" width="178" height="88" rx="44" fill="#071827" stroke="#5af7ff" stroke-width="6"/>
        <rect x="468" y="22" width="178" height="88" rx="44" fill="#071827" stroke="#ff55cf" stroke-width="6"/>
        <path d="M302 66 H468" stroke="#b2fbff" stroke-width="7" stroke-linecap="round"/>
        <circle cx="214" cy="66" r="24" fill="#2bf3ff"/>
        <circle cx="558" cy="66" r="24" fill="#ff56cf"/>
      </g>

      <g opacity="0.94">
        <rect x="44" y="706" width="210" height="72" rx="22" fill="#061827" stroke="#46f5ff" stroke-width="3"/>
        <text x="76" y="754" fill="#dffcff" font-family="'SFMono-Regular', Consolas, monospace" font-size="30" font-weight="900">RUN UI()</text>
        <rect x="524" y="694" width="198" height="84" rx="24" fill="#160b24" stroke="#ff55cf" stroke-width="3"/>
        <text x="556" y="748" fill="#ffe5fb" font-family="'SFMono-Regular', Consolas, monospace" font-size="30" font-weight="900">AGENT</text>
      </g>
    </g>
  </g>

  <g filter="url(#glow)" opacity="0.9">
    <text x="104" y="1006" fill="#aefbff" font-family="'SFMono-Regular', Consolas, monospace" font-size="30" font-weight="700">Subscribe for AI frontend engineering</text>
    <path d="M105 1024 H750" stroke="#2af7ff" stroke-width="3"/>
  </g>
</svg>`;

await fs.mkdir(outDir, { recursive: true });
await fs.writeFile(svgPath, svg, "utf8");
await sharp(Buffer.from(svg)).png().toFile(pngPath);

console.log(`Wrote ${svgPath}`);
console.log(`Wrote ${pngPath}`);
