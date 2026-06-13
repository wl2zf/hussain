/*
 * Tashfeer — Presentation builder (PptxGenJS)
 * Student: حسين حامد الكوافي  |  ID: 642
 * Course:  Cybersecurity — Encryption Algorithms
 *
 * Output: Tashfeer_Presentation.pptx
 * Run:    npm install pptxgenjs && node build.js
 *
 * 15 slides covering all 7 algorithms + PBKDF2 + Hashing contrast.
 */

const PptxGenJS = require("pptxgenjs");
const pptx = new PptxGenJS();

pptx.defineLayout({ name: "WIDE", width: 13.33, height: 7.5 });
pptx.layout = "WIDE";
pptx.author = "Hussain Hamed Al-Kawafi (642)";
pptx.company = "Cybersecurity — Encryption Algorithms";
pptx.title = "Tashfeer";

// ---------------------------------------------------------------- palette
const C = {
  bg: "0D0D14", card: "13131F", surface: "13131F", border: "2A2A3A",
  violet: "7C6AFF", violetSoft: "9A8CFF", green: "00C896", warn: "FF6B6B",
  text: "E8E8F0", muted: "8A8AA0", white: "FFFFFF",
};
const FCODE = "Consolas";   // titles + code
const FBODY = "Calibri";    // body
const W = 13.33;

// Fresh shadow object on every call (never reuse a shadow instance).
const makeShadow = () => ({ type: "outer", color: "000000", blur: 9, offset: 4, angle: 90, opacity: 0.45 });

// ---------------------------------------------------------------- helpers
function newSlide() { const s = pptx.addSlide(); s.background = { color: C.bg }; return s; }

function addTitle(s, ar, en) {
  s.addText(ar, { x: 0.5, y: 0.34, w: 12.33, h: 0.7, fontFace: FCODE, fontSize: 27,
    bold: true, color: C.violet, align: "right", rtlMode: true });
  if (en) s.addText(en, { x: 0.5, y: 1.0, w: 12.33, h: 0.38, fontFace: FCODE, fontSize: 13,
    color: C.muted, align: "right", rtlMode: true, charSpacing: 2 });
}

function addFooter(s, n) {
  s.addText([
    { text: "حسين حامد الكوافي", options: { fontFace: FBODY, color: C.muted, fontSize: 9, rtlMode: true } },
    { text: "   ·   642   ·   Tashfeer", options: { fontFace: FCODE, color: C.border, fontSize: 9 } },
  ], { x: 0.5, y: 7.04, w: 10, h: 0.3, align: "left" });
  s.addText(String(n).padStart(2, "0"), { x: 12.3, y: 7.0, w: 0.6, h: 0.35,
    fontFace: FCODE, fontSize: 11, color: C.violet, align: "right" });
}

function card(s, x, y, w, h, opts = {}) {
  s.addShape(pptx.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.1,
    fill: { color: opts.fill || C.card }, line: { color: opts.line || C.border, width: 1 },
    shadow: makeShadow() });
}

function code(s, x, y, w, h, body, cap) {
  s.addShape(pptx.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.06,
    fill: { color: C.surface }, line: { color: C.border, width: 1 }, shadow: makeShadow() });
  if (cap) s.addText(cap, { x: x + 0.15, y: y + 0.07, w: w - 0.3, h: 0.3,
    fontFace: FCODE, fontSize: 10.5, color: C.green, align: "left" });
  s.addText(body, { x: x + 0.2, y: y + (cap ? 0.42 : 0.16), w: w - 0.4, h: h - (cap ? 0.56 : 0.32),
    fontFace: FCODE, fontSize: 10.5, color: C.white, align: "left", valign: "top", lineSpacingMultiple: 1.05 });
}

function badge(s, x, y, w, text, color) {
  s.addShape(pptx.ShapeType.roundRect, { x, y, w, h: 0.4, rectRadius: 0.2,
    fill: { color: C.surface }, line: { color, width: 1.25 } });
  s.addText(text, { x, y, w, h: 0.4, fontFace: FCODE, fontSize: 12, bold: true, color, align: "center", valign: "middle" });
}

function arText(s, t, x, y, w, h, o = {}) {
  s.addText(t, { x, y, w, h, fontFace: o.code ? FCODE : FBODY, fontSize: o.size || 14,
    bold: o.bold || false, color: o.color || C.text, align: o.align || "right",
    rtlMode: o.rtl !== false, valign: o.valign || "top", lineSpacingMultiple: o.ls || 1.2 });
}

// Concept block (right side) used on algorithm slides.
function concept(s, title, lines) {
  card(s, 6.7, 1.65, 6.0, 2.5, { line: C.green });
  arText(s, title, 6.9, 1.78, 5.6, 0.4, { bold: true, color: C.green, size: 15 });
  arText(s, lines, 6.9, 2.25, 5.6, 1.8, { size: 13.5, color: C.text, ls: 1.3 });
}

// Reusable algorithm slide: concept (right) + code (below-left)
function algoSlide(num, titleAr, titleEn, conceptTitle, conceptLines, codeBody, codeCap, extra) {
  const s = newSlide();
  addTitle(s, titleAr, titleEn);
  concept(s, conceptTitle, conceptLines);
  code(s, 0.6, 1.65, 5.9, 4.95, codeBody, codeCap);
  if (extra) extra(s);
  addFooter(s, num);
  return s;
}

// ====================================================================== //
// 1 — Cover
// ====================================================================== //
(function () {
  const s = newSlide();
  s.addShape(pptx.ShapeType.roundRect, { x: -1.5, y: -1.5, w: 6, h: 6, rectRadius: 3, fill: { color: "15122E" }, line: { type: "none" } });
  s.addShape(pptx.ShapeType.roundRect, { x: 9, y: 4, w: 6, h: 6, rectRadius: 3, fill: { color: "0E2421" }, line: { type: "none" } });
  s.addText("🔐", { x: 0, y: 1.05, w: W, h: 1.1, fontSize: 50, align: "center" });
  s.addText("تشفير", { x: 0, y: 2.1, w: W, h: 1.2, fontFace: FCODE, fontSize: 62, bold: true, color: C.violet, align: "center", rtlMode: true });
  s.addText("T A S H F E E R", { x: 0, y: 3.35, w: W, h: 0.6, fontFace: FCODE, fontSize: 19, color: C.green, align: "center", charSpacing: 6 });
  s.addText("سبع خوارزميات تشفير في أداة واحدة", { x: 0, y: 3.95, w: W, h: 0.5, fontFace: FBODY, fontSize: 16, color: C.muted, align: "center", rtlMode: true });
  card(s, 3.66, 4.95, 6, 1.5);
  s.addText([{ text: "الطالب:  ", options: { color: C.muted, fontSize: 14, rtlMode: true, fontFace: FBODY } },
    { text: "حسين حامد الكوافي", options: { color: C.text, fontSize: 16, bold: true, rtlMode: true, fontFace: FBODY } }],
    { x: 3.86, y: 5.15, w: 5.6, h: 0.45, align: "right" });
  s.addText([{ text: "الرقم الدراسي:  ", options: { color: C.muted, fontSize: 14, rtlMode: true, fontFace: FBODY } },
    { text: "642", options: { color: C.green, fontSize: 16, bold: true, fontFace: FCODE } }],
    { x: 3.86, y: 5.6, w: 5.6, h: 0.45, align: "right" });
  s.addText("Cybersecurity — Encryption Algorithms", { x: 3.86, y: 6.03, w: 5.6, h: 0.35, color: C.muted, fontSize: 11, fontFace: FCODE, align: "right" });
  s.addNotes("مقدمة المشروع: أداة تشفير تدعم سبع خوارزميات. أعرّف بنفسي وبعنوان العرض.");
})();

// ====================================================================== //
// 2 — Agenda
// ====================================================================== //
(function () {
  const s = newSlide();
  addTitle(s, "المحتويات", "AGENDA");
  const items = [
    ["01", "ما هو التشفير؟", "Concept & flow"],
    ["02", "مقارنة الخوارزميات السبع", "Comparison table"],
    ["03", "PBKDF2 — اشتقاق المفتاح", "Password → key"],
    ["04", "الخوارزميات السبع بالتفصيل", "AES · RSA · ChaCha20 ..."],
    ["05", "التشفير مقابل البصمة (Hashing)", "Encryption vs hashing"],
    ["06", "العرض الحي + الأسئلة", "Live demo + Q&A"],
  ];
  const cw = 5.9, rh = 1.12, gx = 0.4, gy = 0.22, sx = 0.6, sy = 1.65;
  items.forEach((it, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = sx + col * (cw + gx), y = sy + row * (rh + gy);
    card(s, x, y, cw, rh);
    s.addText(it[0], { x: x + cw - 1.2, y: y + 0.1, w: 1.0, h: rh - 0.2, fontFace: FCODE, fontSize: 28, bold: true, color: C.violet, align: "center", valign: "middle" });
    arText(s, it[1], x + 0.3, y + 0.16, cw - 1.4, 0.5, { bold: true, size: 16.5, valign: "middle" });
    s.addText(it[2], { x: x + 0.3, y: y + 0.6, w: cw - 1.4, h: 0.4, fontFace: FCODE, fontSize: 11, color: C.muted, align: "right" });
  });
  addFooter(s, 2);
  s.addNotes("أستعرض خريطة العرض. نبدأ بالمفهوم ثم المقارنة ثم كل خوارزمية، وننتهي بالعرض الحي.");
})();

// ====================================================================== //
// 3 — What is Encryption (flow)
// ====================================================================== //
(function () {
  const s = newSlide();
  addTitle(s, "ما هو التشفير؟", "WHAT IS ENCRYPTION");
  arText(s, "تحويل البيانات المقروءة إلى صيغة غير مفهومة، لا يفكّها إلا من يملك المفتاح الصحيح.", 0.6, 1.5, 12.1, 0.6, { size: 16 });
  const by = 2.95, bh = 1.8, bw = 3.3, x1 = 0.9, x2 = 5.0, x3 = 9.1;
  card(s, x1, by, bw, bh, { line: C.green });
  s.addText("🔓", { x: x1, y: by + 0.2, w: bw, h: 0.7, fontSize: 30, align: "center" });
  arText(s, "النص الأصلي", x1, by + 0.95, bw, 0.4, { bold: true, size: 16, align: "center" });
  s.addText("Plaintext", { x: x1, y: by + 1.32, w: bw, h: 0.3, fontFace: FCODE, fontSize: 11, color: C.muted, align: "center" });
  card(s, x2, by, bw, bh, { line: C.violet, fill: "1B1733" });
  s.addText("⚙️", { x: x2, y: by + 0.2, w: bw, h: 0.7, fontSize: 30, align: "center" });
  arText(s, "الخوارزمية + المفتاح", x2, by + 0.95, bw, 0.4, { bold: true, size: 16, color: C.violetSoft, align: "center" });
  s.addText("Algorithm + Key", { x: x2, y: by + 1.32, w: bw, h: 0.3, fontFace: FCODE, fontSize: 11, color: C.muted, align: "center" });
  card(s, x3, by, bw, bh, { line: C.warn });
  s.addText("🔒", { x: x3, y: by + 0.2, w: bw, h: 0.7, fontSize: 30, align: "center" });
  arText(s, "النص المشفّر", x3, by + 0.95, bw, 0.4, { bold: true, size: 16, align: "center" });
  s.addText("Ciphertext", { x: x3, y: by + 1.32, w: bw, h: 0.3, fontFace: FCODE, fontSize: 11, color: C.muted, align: "center" });
  s.addShape(pptx.ShapeType.rightArrow, { x: x1 + bw + 0.12, y: by + 0.7, w: 0.65, h: 0.4, fill: { color: C.violet }, line: { type: "none" } });
  s.addShape(pptx.ShapeType.rightArrow, { x: x2 + bw + 0.12, y: by + 0.7, w: 0.65, h: 0.4, fill: { color: C.violet }, line: { type: "none" } });
  code(s, 0.9, 5.2, 11.5, 1.35, 'Hello  →  AESGCM(key, nonce)  →  k3Jh8x2P9vQ1mZ...==', "مثال · Example");
  addFooter(s, 3);
  s.addNotes("الفكرة الأساسية: مدخل واضح يمر عبر خوارزمية ومفتاح فينتج نص مشفّر. بدون المفتاح لا يُسترجع الأصل.");
})();

// ====================================================================== //
// 4 — Comparison table (7 algorithms)
// ====================================================================== //
(function () {
  const s = newSlide();
  addTitle(s, "مقارنة الخوارزميات السبع", "COMPARISON");
  const H = (t) => ({ text: t, options: { fill: { color: C.violet }, color: C.white, bold: true, fontFace: FCODE, fontSize: 12, align: "center", valign: "middle" } });
  const A = (t) => ({ text: t, options: { fill: { color: C.surface }, color: C.text, fontFace: FBODY, fontSize: 12, align: "center", valign: "middle", rtlMode: true } });
  const M = (t, c) => ({ text: t, options: { fill: { color: C.surface }, color: c || C.text, fontFace: FCODE, fontSize: 11.5, align: "center", valign: "middle" } });
  const rows = [
    [H("Algorithm"), H("Type"), H("Key Size"), H("Speed"), H("Use Case"), H("Status")],
    [M("AES-256-GCM", C.violetSoft), A("متماثل"), M("32 byte"), M("⚡⚡⚡", C.green), A("WhatsApp, Gmail"), M("✅", C.green)],
    [M("RSA-2048", C.violetSoft), A("غير متماثل"), M("2048 bit"), M("🐢", C.warn), A("HTTPS, SSH"), M("✅", C.green)],
    [M("ChaCha20", C.violetSoft), A("متماثل"), M("32 byte"), M("⚡⚡⚡⚡", C.green), A("Signal, VPN"), M("✅", C.green)],
    [M("Triple-DES", C.violetSoft), A("متماثل"), M("24 byte"), M("⚡", C.warn), A("أنظمة قديمة"), M("⚠️", C.warn)],
    [M("Camellia-256", C.violetSoft), A("متماثل"), M("32 byte"), M("⚡⚡⚡", C.green), A("ISO/IEC، اليابان"), M("✅", C.green)],
    [M("AES-CBC+HMAC", C.violetSoft), A("متماثل"), M("32 byte"), M("⚡⚡⚡", C.green), A("تعليمي"), M("✅", C.green)],
    [M("Fernet", C.violetSoft), A("متماثل"), M("32 byte"), M("⚡⚡⚡", C.green), A("تطبيقات Python"), M("✅", C.green)],
  ];
  s.addTable(rows, { x: 0.55, y: 1.6, w: 12.2, colW: [2.5, 1.7, 1.7, 1.7, 2.9, 1.7],
    rowH: [0.5, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6], border: { type: "solid", color: C.border, pt: 1 },
    align: "center", valign: "middle" });
  arText(s, "الأخضر ✅ موصى به · ⚠️ قديم · المتماثل = مفتاح واحد، غير المتماثل = مفتاحان.", 0.6, 6.55, 12.1, 0.4, { size: 12.5, color: C.muted });
  addFooter(s, 4);
  s.addNotes("مقارنة سريعة بين السبع خوارزميات حسب النوع والسرعة والاستخدام. ست منها موصى بها وواحدة قديمة.");
})();

// ====================================================================== //
// 5 — PBKDF2 (key derivation) — strong slide
// ====================================================================== //
(function () {
  const s = newSlide();
  addTitle(s, "كيف نحوّل كلمة مرور قصيرة إلى مفتاح قوي؟", "PBKDF2 — KEY DERIVATION");
  // the question banner
  s.addShape(pptx.ShapeType.roundRect, { x: 0.6, y: 1.55, w: 12.1, h: 0.85, rectRadius: 0.08, fill: { color: "2A1518" }, line: { color: C.warn, width: 1.25 }, shadow: makeShadow() });
  s.addText([
    { text: 'المستخدم يكتب: ', options: { color: C.text, rtlMode: true } },
    { text: '"123"', options: { color: C.green, bold: true, fontFace: FCODE } },
    { text: '  ←  لكن AES-256 يحتاج مفتاح ', options: { color: C.text, rtlMode: true } },
    { text: '32 بايت بالضبط!', options: { color: C.warn, bold: true, rtlMode: true } },
  ], { x: 0.8, y: 1.6, w: 11.7, h: 0.75, fontFace: FBODY, fontSize: 16, align: "center", valign: "middle" });

  // answer flow
  const fy = 2.75, fh = 1.25;
  const b1 = 0.9, b2 = 5.0, b3 = 9.1, bw = 3.3;
  card(s, b1, fy, bw, fh, { line: C.muted });
  arText(s, 'كلمة المرور', b1, fy + 0.2, bw, 0.4, { align: "center", size: 14, bold: true });
  s.addText('"123"', { x: b1, y: fy + 0.62, w: bw, h: 0.45, fontFace: FCODE, fontSize: 17, bold: true, color: C.green, align: "center" });
  card(s, b2, fy, bw, fh, { line: C.violet, fill: "1B1733" });
  arText(s, 'PBKDF2 + Salt', b2, fy + 0.18, bw, 0.4, { align: "center", size: 14, bold: true, color: C.violetSoft });
  arText(s, '+ 100,000 تكرار', b2, fy + 0.6, bw, 0.4, { align: "center", size: 13, color: C.text });
  card(s, b3, fy, bw, fh, { line: C.green });
  arText(s, 'مفتاح', b3, fy + 0.2, bw, 0.4, { align: "center", size: 14, bold: true });
  s.addText("32 byte", { x: b3, y: fy + 0.62, w: bw, h: 0.45, fontFace: FCODE, fontSize: 17, bold: true, color: C.green, align: "center" });
  s.addShape(pptx.ShapeType.rightArrow, { x: b1 + bw + 0.12, y: fy + 0.45, w: 0.65, h: 0.36, fill: { color: C.violet }, line: { type: "none" } });
  s.addShape(pptx.ShapeType.rightArrow, { x: b2 + bw + 0.12, y: fy + 0.45, w: 0.65, h: 0.36, fill: { color: C.violet }, line: { type: "none" } });

  // 4 key-point cards
  const pts = [
    ["📏", "أي طول → الطول المطلوب", "PBKDF2 يمدّد أي كلمة مرور إلى الطول الذي تحتاجه كل خوارزمية بالضبط."],
    ["🧂", "Salt عشوائي", "يمنع هجمات القواميس والجداول الجاهزة (Rainbow Tables)."],
    ["🔁", "100,000 تكرار", "يبطّئ هجمات التخمين بشكل كبير على المهاجم."],
    ["🔑", "نفس الكلمة، أطوال مختلفة", '"123" تعطي 32 بايت لـ AES و24 بايت لـ Triple-DES.'],
  ];
  const cw = 2.95, ch = 2.0, gx = 0.18, x0 = 0.6, y0 = 4.35;
  pts.forEach((p, i) => {
    const x = x0 + i * (cw + gx);
    card(s, x, y0, cw, ch);
    s.addText(p[0], { x: x, y: y0 + 0.18, w: cw, h: 0.5, fontSize: 22, align: "center" });
    arText(s, p[1], x + 0.18, y0 + 0.7, cw - 0.36, 0.55, { align: "center", bold: true, size: 13, color: C.violetSoft });
    arText(s, p[2], x + 0.18, y0 + 1.2, cw - 0.36, 0.75, { align: "center", size: 11.5, color: C.muted, ls: 1.15 });
  });
  addFooter(s, 5);
  s.addNotes('إذا سأل الدكتور: كيف تكتب كلمة مرور 3 أرقام لخوارزمية تحتاج 32 بايت؟ الجواب: PBKDF2 يشتق المفتاح بالطول الصحيح من أي كلمة مرور، فلا يهم طول كلمة المرور الأصلية.');
})();

// ====================================================================== //
// 6 — AES-256-GCM
// ====================================================================== //
algoSlide(6, "AES-256-GCM", "SYMMETRIC · AUTHENTICATED",
  "الفكرة",
  "أقوى وأشهر تشفير متماثل. وضع GCM يجمع السرية مع وسم تحقق (tag) يكشف أي تلاعب. المفتاح يُشتق من كلمة المرور عبر PBKDF2.",
`from cryptography.hazmat.primitives \\
   .ciphers.aead import AESGCM

salt  = os.urandom(16)
key   = PBKDF2HMAC(SHA256(), 32,
          salt, 100_000).derive(pwd)
nonce = os.urandom(12)

ct = AESGCM(key).encrypt(nonce, data, None)
# salt + nonce + ciphertext + tag
token = b64encode(salt + nonce + ct)`, "Python · cryptography",
  (s) => {
    card(s, 6.7, 4.35, 6.0, 2.25, { fill: C.surface });
    s.addText("مثال · Example", { x: 6.9, y: 4.46, w: 5.6, h: 0.35, fontFace: FCODE, fontSize: 11, color: C.green, align: "right" });
    s.addText([
      { text: 'input:    ', options: { color: C.muted } }, { text: '"Secret"\n', options: { color: C.white } },
      { text: 'password: ', options: { color: C.muted } }, { text: '"123"\n', options: { color: C.white } },
      { text: 'output:   ', options: { color: C.muted } }, { text: 'b1c9..salt+nonce+ct+tag', options: { color: C.violetSoft } },
    ], { x: 6.9, y: 4.85, w: 5.6, h: 1.6, fontFace: FCODE, fontSize: 12, align: "left", valign: "top", lineSpacingMultiple: 1.3 });
  }
).addNotes("AES-GCM هو المعيار الذهبي: يجمع السرية والتحقق في خطوة واحدة. تستخدمه واتساب وجيميل.");

// ====================================================================== //
// 7 — RSA-2048
// ====================================================================== //
algoSlide(7, "RSA-2048", "ASYMMETRIC · TWO KEYS",
  "الفكرة",
  "مفتاحان: العام يُشارَك ويُشفّر فقط، والخاص سرّي ويفكّ. يحلّ مشكلة تبادل السرّ دون اتفاق مسبق على كلمة مرور.",
`priv = rsa.generate_private_key(
          65537, key_size=2048)
pub  = priv.public_key()

# Hybrid: RSA يغلّف مفتاح AES
aes_key = os.urandom(32)
ct      = AESGCM(aes_key).encrypt(n, data)
enc_key = pub.encrypt(aes_key,
   padding.OAEP(MGF1(SHA256()), SHA256()))`, "Python · RSA + Hybrid",
  (s) => {
    s.addShape(pptx.ShapeType.roundRect, { x: 6.7, y: 4.35, w: 6.0, h: 2.25, rectRadius: 0.08, fill: { color: "1B1733" }, line: { color: C.violet, width: 1.25 }, shadow: makeShadow() });
    arText(s, "💡 التشفير الهجين (Hybrid)", 6.9, 4.46, 5.6, 0.4, { bold: true, color: C.violetSoft, size: 14 });
    arText(s, "RSA بطيء ومحدود الحجم، فنشفّر البيانات بـ AES ونشفّر مفتاح AES فقط بـ RSA — فيعمل مع أي حجم نص أو ملف.", 6.9, 4.9, 5.6, 1.6, { size: 12.5, ls: 1.3 });
  }
).addNotes("RSA يحل تبادل المفاتيح بمفتاحين. للملفات نستخدم التشفير الهجين مع AES لأن RSA بطيء ومحدود.");

// ====================================================================== //
// 8 — ChaCha20-Poly1305
// ====================================================================== //
algoSlide(8, "ChaCha20-Poly1305", "STREAM CIPHER · MOBILE",
  "الفكرة",
  "تشفير انسيابي سريع جداً بالبرمجيات مع Poly1305 للتحقق. مثالي للجوال حيث لا يوجد تسريع عتادي لـ AES.",
`from cryptography.hazmat.primitives \\
   .ciphers.aead import ChaCha20Poly1305

key = PBKDF2HMAC(SHA256(), 32,
        salt, 100_000).derive(pwd)
nonce = os.urandom(12)

ct = ChaCha20Poly1305(key) \\
        .encrypt(nonce, data, None)`, "Python · ChaCha20",
  (s) => {
    s.addText("السرعة (برمجياً) · Speed", { x: 6.7, y: 4.3, w: 6.0, h: 0.4, fontFace: FCODE, fontSize: 12, color: C.muted, align: "right" });
    s.addText("AES", { x: 6.7, y: 4.8, w: 1.0, h: 0.4, fontFace: FCODE, fontSize: 13, color: C.text, align: "left", valign: "middle" });
    s.addShape(pptx.ShapeType.roundRect, { x: 7.7, y: 4.85, w: 1.7, h: 0.32, rectRadius: 0.05, fill: { color: C.border }, line: { type: "none" } });
    s.addText("1x", { x: 9.5, y: 4.8, w: 0.8, h: 0.4, fontFace: FCODE, fontSize: 12, color: C.muted, align: "left", valign: "middle" });
    s.addText("ChaCha", { x: 6.7, y: 5.4, w: 1.0, h: 0.4, fontFace: FCODE, fontSize: 13, color: C.green, align: "left", valign: "middle" });
    s.addShape(pptx.ShapeType.roundRect, { x: 7.7, y: 5.45, w: 4.6, h: 0.32, rectRadius: 0.05, fill: { color: C.green }, line: { type: "none" } });
    s.addText("~3x", { x: 12.0, y: 5.4, w: 0.7, h: 0.4, fontFace: FCODE, fontSize: 12, color: C.green, align: "left", valign: "middle" });
  }
).addNotes("ChaCha20 أسرع من AES عند غياب التسريع العتادي، ولهذا تعتمده Signal وتطبيقات VPN.");

// ====================================================================== //
// 9 — Triple-DES
// ====================================================================== //
algoSlide(9, "Triple-DES (3DES)", "LEGACY · EDUCATIONAL",
  "الفكرة",
  "يطبّق DES ثلاث مرات بمفتاح 24 بايت. وضع CBC بحجم كتلة 8 بايت يحتاج حشو PKCS7. قديم وبطيء — للتعليم فقط.",
`from cryptography.hazmat.primitives \\
   .ciphers import Cipher, modes
from ...decrepit.ciphers.algorithms \\
   import TripleDES

key = PBKDF2HMAC(SHA256(), 24,   # 24 B
        salt, 100_000).derive(pwd)
iv  = os.urandom(8)
ct = Cipher(TripleDES(key), modes.CBC(iv)) \\
       .encryptor().update(pad(data))`, "Python · Triple-DES",
  (s) => {
    s.addShape(pptx.ShapeType.roundRect, { x: 6.7, y: 4.7, w: 6.0, h: 1.9, rectRadius: 0.08, fill: { color: "2A1518" }, line: { color: C.warn, width: 1.5 }, shadow: makeShadow() });
    arText(s, "⚠️ تحذير", 6.9, 4.8, 5.6, 0.4, { bold: true, color: C.warn, size: 15 });
    arText(s, "أُهمل رسمياً (NIST) ولا يُستخدم في الأنظمة الحديثة. استخدم AES أو ChaCha20 بدلاً منه.", 6.9, 5.22, 5.6, 1.2, { size: 13, ls: 1.3 });
  }
).addNotes("نعرض 3DES لفهم تطوّر التشفير. مفتاحه 24 بايت لكنه قديم وبطيء ولا يُنصح به في الإنتاج.");

// ====================================================================== //
// 10 — Camellia-256
// ====================================================================== //
algoSlide(10, "Camellia-256", "BLOCK CIPHER · ISO/IEC",
  "الفكرة",
  "تشفير كتلي ياباني بقوة AES، حجم كتلة 16 بايت ووضع CBC مع PKCS7. بديل معتمد دولياً عن AES.",
`from ...decrepit.ciphers.algorithms \\
   import Camellia
from cryptography.hazmat.primitives \\
   .ciphers import Cipher, modes

key = PBKDF2HMAC(SHA256(), 32,
        salt, 100_000).derive(pwd)
iv  = os.urandom(16)
ct = Cipher(Camellia(key), modes.CBC(iv)) \\
       .encryptor().update(pad(data))`, "Python · Camellia",
  (s) => {
    s.addShape(pptx.ShapeType.roundRect, { x: 6.7, y: 4.7, w: 6.0, h: 1.9, rectRadius: 0.08, fill: { color: "12241F" }, line: { color: C.green, width: 1.25 }, shadow: makeShadow() });
    arText(s, "🌸 بديل AES الياباني", 6.9, 4.8, 5.6, 0.4, { bold: true, color: C.green, size: 14 });
    arText(s, "طوّرته NTT و Mitsubishi، ومعتمد من ISO/IEC والاتحاد الأوروبي (NESSIE) بمستوى أمان مماثل لـ AES.", 6.9, 5.22, 5.6, 1.2, { size: 12.5, ls: 1.3 });
  }
).addNotes("Camellia بديل معتمد دولياً عن AES بنفس مستوى الأمان، شائع في اليابان ومعايير ISO/IEC.");

// ====================================================================== //
// 11 — AES-256-CBC + HMAC
// ====================================================================== //
algoSlide(11, "AES-256-CBC + HMAC", "ENCRYPT-THEN-MAC",
  "الفكرة",
  "نشفّر بـ AES-CBC ثم نوقّع الناتج بـ HMAC-SHA256. عند الفك نتحقق من HMAC أولاً، فأي تلاعب أو كلمة خاطئة يُكتشف فوراً.",
`keys = PBKDF2HMAC(SHA256(), 64,
         salt, 100_000).derive(pwd)
enc_key, mac_key = keys[:32], keys[32:]

iv = os.urandom(16)
ct = AES_CBC(enc_key, iv).encrypt(pad(data))

tag = HMAC(mac_key, SHA256, iv + ct)  # MAC
out = salt + iv + tag + ct`, "Python · Encrypt-then-MAC",
  (s) => {
    s.addShape(pptx.ShapeType.roundRect, { x: 6.7, y: 4.7, w: 6.0, h: 1.9, rectRadius: 0.08, fill: { color: "1B1733" }, line: { color: C.violet, width: 1.25 }, shadow: makeShadow() });
    arText(s, "🔏 لماذا HMAC؟", 6.9, 4.8, 5.6, 0.4, { bold: true, color: C.violetSoft, size: 14 });
    arText(s, "CBC وحده لا يكشف التلاعب. نضيف HMAC ونتحقق منه قبل فك التشفير = تشفير ثم توثيق (Encrypt-then-MAC).", 6.9, 5.22, 5.6, 1.2, { size: 12.5, ls: 1.3 });
  }
).addNotes("نمط تعليمي مهم: التشفير ثم التوثيق. التحقق من HMAC قبل الفك يضمن السلامة ويكشف أي تعديل.");

// ====================================================================== //
// 12 — Fernet
// ====================================================================== //
algoSlide(12, "Fernet", "READY-MADE · HIGH-LEVEL",
  "الفكرة",
  "نظام جاهز وآمن يجمع AES-128-CBC + HMAC داخلياً ويدير كل التفاصيل. تكتب سطرين فقط وتحصل على تشفير موثّق.",
`from cryptography.fernet import Fernet

key = base64.urlsafe_b64encode(
        PBKDF2HMAC(SHA256(), 32,
          salt, 100_000).derive(pwd))

token = Fernet(key).encrypt(data)   # جاهز!
data  = Fernet(key).decrypt(token)`, "Python · Fernet",
  (s) => {
    s.addShape(pptx.ShapeType.roundRect, { x: 6.7, y: 4.7, w: 6.0, h: 1.9, rectRadius: 0.08, fill: { color: "12241F" }, line: { color: C.green, width: 1.25 }, shadow: makeShadow() });
    arText(s, "🧰 جاهز مقابل يدوي", 6.9, 4.8, 5.6, 0.4, { bold: true, color: C.green, size: 14 });
    arText(s, "بدل بناء AES + HMAC + nonce يدوياً (سطور وأخطاء محتملة)، Fernet يقدّمها معلّبة وآمنة افتراضياً.", 6.9, 5.22, 5.6, 1.2, { size: 12.5, ls: 1.3 });
  }
).addNotes("Fernet هو الخيار عالي المستوى: يجمع التشفير والتوثيق جاهزاً، فيقلّل أخطاء التنفيذ اليدوي.");

// ====================================================================== //
// 13 — Hashing vs Encryption
// ====================================================================== //
(function () {
  const s = newSlide();
  addTitle(s, "التشفير مقابل البصمة (Hashing)", "ENCRYPTION vs HASHING");
  arText(s, "البصمة (Hashing) ليست تشفيراً: دالة باتجاه واحد تنتج بصمة ثابتة لا يمكن عكسها.", 0.6, 1.5, 12.1, 0.5, { size: 15 });

  // two columns
  card(s, 0.6, 2.2, 5.95, 3.4, { line: C.violet });
  arText(s, "🔐 التشفير (Encryption)", 0.8, 2.35, 5.55, 0.45, { bold: true, color: C.violetSoft, size: 16, align: "center" });
  arText(s, "• قابل للعكس (بالمفتاح)\n• الهدف: السرية\n• مثال: AES, RSA", 0.8, 2.95, 5.55, 2.4, { size: 15, ls: 1.5 });

  card(s, 6.78, 2.2, 5.95, 3.4, { line: C.green });
  arText(s, "🔎 البصمة (Hashing)", 6.98, 2.35, 5.55, 0.45, { bold: true, color: C.green, size: 16, align: "center" });
  arText(s, "• غير قابل للعكس أبداً\n• الهدف: التحقق من السلامة\n• مثال: SHA-256, SHA-3", 6.98, 2.95, 5.55, 2.4, { size: 15, ls: 1.5 });

  s.addShape(pptx.ShapeType.roundRect, { x: 0.6, y: 5.8, w: 12.13, h: 0.85, rectRadius: 0.08, fill: { color: "2A1518" }, line: { color: C.warn, width: 1.25 }, shadow: makeShadow() });
  arText(s, "الخطأ الشائع: الناس تخلط بين التشفير والـ Hashing — الـ Hash لا يُفك، بل يُقارَن فقط.", 0.8, 5.92, 11.7, 0.6, { size: 14, bold: true, align: "center", valign: "middle" });
  addFooter(s, 13);
  s.addNotes("فرق جوهري: التشفير يُعكس بالمفتاح، أما الـ Hash فباتجاه واحد للتحقق فقط. الخلط بينهما خطأ شائع.");
})();

// ====================================================================== //
// 14 — Demo
// ====================================================================== //
(function () {
  const s = newSlide();
  addTitle(s, "العرض الحي — تطبيق تشفير", "LIVE DEMO");
  s.addShape(pptx.ShapeType.roundRect, { x: 0.6, y: 1.75, w: 7.0, h: 4.7, rectRadius: 0.1, fill: { color: C.surface }, line: { color: C.border, width: 1 }, shadow: makeShadow() });
  s.addShape(pptx.ShapeType.roundRect, { x: 0.6, y: 1.75, w: 7.0, h: 0.55, rectRadius: 0.1, fill: { color: C.card }, line: { color: C.border, width: 1 } });
  ["FF6B6B", "F5C451", "00C896"].forEach((col, i) => s.addShape(pptx.ShapeType.ellipse, { x: 0.85 + i * 0.3, y: 1.92, w: 0.2, h: 0.2, fill: { color: col }, line: { type: "none" } }));
  s.addText("localhost:5000", { x: 2.0, y: 1.8, w: 5.0, h: 0.45, fontFace: FCODE, fontSize: 12, color: C.muted, align: "left", valign: "middle" });
  // two main mode tabs
  badge(s, 1.0, 2.55, 2.9, "🔐 تشفير", C.violet);
  badge(s, 4.1, 2.55, 2.9, "🔓 فك التشفير", C.green);
  s.addText("تشفير · TASHFEER", { x: 0.6, y: 3.2, w: 7.0, h: 0.5, fontFace: FCODE, fontSize: 20, bold: true, color: C.violet, align: "center" });
  ["AES", "RSA", "ChaCha", "3DES", "Camellia", "CBC+HMAC", "Fernet"].forEach((t, i) => {
    const col = i % 4, row = Math.floor(i / 4);
    badge(s, 0.95 + col * 1.62, 3.85 + row * 0.55, 1.5, t, i === 0 ? C.violet : C.border);
  });
  s.addText("[ نص · ملفات · صور · صوت ]", { x: 0.6, y: 5.05, w: 7.0, h: 0.4, fontFace: FCODE, fontSize: 12, color: C.muted, align: "center" });
  badge(s, 2.3, 5.6, 3.6, "Base64 / .tashfeer", C.green);

  // steps
  card(s, 7.9, 1.75, 4.8, 4.7, { fill: C.surface });
  arText(s, "خطوات العرض", 8.1, 1.9, 4.4, 0.45, { bold: true, color: C.green, size: 16 });
  const steps = [
    "شغّل:  python app.py",
    "افتح:  localhost:5000",
    "تبويب «تشفير»: اكتب نصاً",
    "كلمة مرور «123» → شفّر",
    "انسخ الناتج Base64",
    "تبويب «فك التشفير»: الصقه",
    "جرّب RSA: ولّد مفاتيح",
  ];
  steps.forEach((t, i) => {
    const yy = 2.45 + i * 0.55;
    s.addShape(pptx.ShapeType.ellipse, { x: 12.15, y: yy + 0.02, w: 0.32, h: 0.32, fill: { color: C.violet }, line: { type: "none" } });
    s.addText(String(i + 1), { x: 12.15, y: yy + 0.02, w: 0.32, h: 0.32, fontFace: FCODE, fontSize: 12, bold: true, color: C.white, align: "center", valign: "middle" });
    s.addText(t, { x: 8.1, y: yy, w: 3.9, h: 0.4, fontFace: FCODE, fontSize: 12, color: C.text, align: "right", valign: "middle" });
  });
  addFooter(s, 14);
  s.addNotes("أشغّل التطبيق وأبيّن التبويبين المنفصلين: تبويب للتشفير وتبويب لفك التشفير. أشفّر نصاً ثم أفكّه أمام الجميع.");
})();

// ====================================================================== //
// 15 — Closing
// ====================================================================== //
(function () {
  const s = newSlide();
  s.addShape(pptx.ShapeType.roundRect, { x: 8.5, y: -1.5, w: 6, h: 6, rectRadius: 3, fill: { color: "15122E" }, line: { type: "none" } });
  s.addShape(pptx.ShapeType.roundRect, { x: -1.5, y: 4, w: 6, h: 6, rectRadius: 3, fill: { color: "0E2421" }, line: { type: "none" } });
  s.addText("🔐", { x: 0, y: 1.3, w: W, h: 1.0, fontSize: 46, align: "center" });
  s.addText("شكراً لكم", { x: 0, y: 2.3, w: W, h: 1.0, fontFace: FCODE, fontSize: 50, bold: true, color: C.violet, align: "center", rtlMode: true });
  s.addText("أسئلتكم ومناقشتكم", { x: 0, y: 3.5, w: W, h: 0.6, fontFace: FBODY, fontSize: 20, color: C.green, align: "center", rtlMode: true });
  s.addText("Questions & Answers", { x: 0, y: 4.15, w: W, h: 0.5, fontFace: FCODE, fontSize: 14, color: C.muted, align: "center", charSpacing: 3 });
  card(s, 4.16, 5.0, 5.0, 1.4);
  s.addText("حسين حامد الكوافي", { x: 4.36, y: 5.2, w: 4.6, h: 0.5, fontFace: FBODY, fontSize: 18, bold: true, color: C.text, align: "center", rtlMode: true });
  s.addText("ID 642  ·  Cybersecurity", { x: 4.36, y: 5.75, w: 4.6, h: 0.4, fontFace: FCODE, fontSize: 13, color: C.muted, align: "center" });
  s.addNotes("أشكر الدكتور والطلبة وأفتح باب الأسئلة. مستعدّ لشرح أي خوارزمية أو تشغيل التطبيق مرة أخرى.");
})();

// ---------------------------------------------------------------- write
pptx.writeFile({ fileName: "Tashfeer_Presentation.pptx" }).then((f) => console.log("✓ Created:", f));
