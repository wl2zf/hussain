/*
 * Tashfeer — Presentation builder (PptxGenJS)
 * Student: حسين حامد الكوافي  |  ID: 642
 * Course:  Cybersecurity — Encryption Algorithms
 *
 * Output: Tashfeer_Presentation.pptx
 * Run:    npm install pptxgenjs && node build.js
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
  bg: "0D0D14",
  surface: "13131F",
  card: "1A1A28",
  border: "2A2A3A",
  violet: "7C6AFF",
  violetSoft: "9A8CFF",
  green: "00C896",
  warn: "FF6B6B",
  text: "DDDDE8",
  muted: "8A8AA0",
  white: "FFFFFF",
};
const FONT_CODE = "Consolas";
const FONT_BODY = "Calibri";
const W = 13.33;
const H = 7.5;

// Fresh shadow object every call (never reuse a shadow instance).
const makeShadow = () => ({ type: "outer", color: "000000", blur: 9, offset: 4, angle: 90, opacity: 0.45 });

// ---------------------------------------------------------------- helpers
function newSlide() {
  const s = pptx.addSlide();
  s.background = { color: C.bg };
  return s;
}

// Top title (Arabic RTL) + optional English subtitle. No underline lines.
function addTitle(s, ar, en) {
  s.addText(ar, {
    x: 0.5, y: 0.35, w: 12.33, h: 0.7,
    fontFace: FONT_CODE, fontSize: 30, bold: true, color: C.violet,
    align: "right", rtlMode: true,
  });
  if (en) {
    s.addText(en, {
      x: 0.5, y: 1.02, w: 12.33, h: 0.4,
      fontFace: FONT_CODE, fontSize: 14, color: C.muted,
      align: "right", rtlMode: true, charSpacing: 2,
    });
  }
}

// Small footer with student + slide number on content slides.
function addFooter(s, n) {
  s.addText(
    [
      { text: "حسين حامد الكوافي", options: { fontFace: FONT_BODY, color: C.muted, fontSize: 9, rtlMode: true } },
      { text: "   ·   642   ·   Tashfeer", options: { fontFace: FONT_CODE, color: C.border, fontSize: 9 } },
    ],
    { x: 0.5, y: 7.05, w: 10, h: 0.3, align: "left" }
  );
  s.addText(String(n).padStart(2, "0"), {
    x: 12.3, y: 7.0, w: 0.6, h: 0.35,
    fontFace: FONT_CODE, fontSize: 11, color: C.violet, align: "right",
  });
}

// Rounded card with optional title + body lines (Arabic RTL).
function addCard(s, x, y, w, h, opts = {}) {
  s.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.1,
    fill: { color: opts.fill || C.surface },
    line: { color: opts.line || C.border, width: 1 },
    shadow: makeShadow(),
  });
}

// White-on-dark code block (Consolas). Code is LTR, left aligned.
function addCode(s, x, y, w, h, code, title) {
  s.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.06,
    fill: { color: C.surface }, line: { color: C.border, width: 1 },
    shadow: makeShadow(),
  });
  if (title) {
    s.addText(title, {
      x: x + 0.15, y: y + 0.08, w: w - 0.3, h: 0.3,
      fontFace: FONT_CODE, fontSize: 11, color: C.green, align: "left",
    });
  }
  s.addText(code, {
    x: x + 0.2, y: y + (title ? 0.45 : 0.18), w: w - 0.4, h: h - (title ? 0.6 : 0.36),
    fontFace: FONT_CODE, fontSize: 11.5, color: C.white, align: "left",
    valign: "top", lineSpacingMultiple: 1.05,
  });
}

// Pill / badge.
function addBadge(s, x, y, w, text, color) {
  s.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h: 0.4, rectRadius: 0.2,
    fill: { color: C.surface }, line: { color, width: 1.25 },
  });
  s.addText(text, {
    x, y, w, h: 0.4, fontFace: FONT_CODE, fontSize: 12, bold: true,
    color, align: "center", valign: "middle",
  });
}

// ====================================================================== //
// SLIDE 1 — Cover
// ====================================================================== //
(function cover() {
  const s = newSlide();
  // backdrop glow shapes
  s.addShape(pptx.ShapeType.roundRect, { x: -1.5, y: -1.5, w: 6, h: 6, rectRadius: 3, fill: { color: "15122E" }, line: { type: "none" } });
  s.addShape(pptx.ShapeType.roundRect, { x: 9, y: 4, w: 6, h: 6, rectRadius: 3, fill: { color: "0E2421" }, line: { type: "none" } });

  s.addText("🔐", { x: 0, y: 1.2, w: W, h: 1.2, fontSize: 54, align: "center" });
  s.addText("تشفير", {
    x: 0, y: 2.3, w: W, h: 1.2, fontFace: FONT_CODE, fontSize: 66, bold: true,
    color: C.violet, align: "center", rtlMode: true,
  });
  s.addText("T A S H F E E R", {
    x: 0, y: 3.6, w: W, h: 0.6, fontFace: FONT_CODE, fontSize: 20, color: C.green,
    align: "center", charSpacing: 6,
  });
  s.addText("أداة تشفير تعليمية — أربع خوارزميات", {
    x: 0, y: 4.25, w: W, h: 0.5, fontFace: FONT_BODY, fontSize: 16, color: C.muted,
    align: "center", rtlMode: true,
  });

  // student card
  addCard(s, 3.66, 5.15, 6, 1.45, { fill: C.surface });
  s.addText(
    [
      { text: "الطالب:  ", options: { color: C.muted, fontSize: 14, rtlMode: true, fontFace: FONT_BODY } },
      { text: "حسين حامد الكوافي", options: { color: C.text, fontSize: 16, bold: true, rtlMode: true, fontFace: FONT_BODY } },
    ],
    { x: 3.86, y: 5.35, w: 5.6, h: 0.5, align: "right" }
  );
  s.addText(
    [
      { text: "الرقم الدراسي:  ", options: { color: C.muted, fontSize: 14, rtlMode: true, fontFace: FONT_BODY } },
      { text: "642", options: { color: C.green, fontSize: 16, bold: true, fontFace: FONT_CODE } },
    ],
    { x: 3.86, y: 5.8, w: 5.6, h: 0.5, align: "right" }
  );
  s.addText("Cybersecurity — Encryption Algorithms", {
    x: 3.86, y: 6.2, w: 5.6, h: 0.35, color: C.muted, fontSize: 11, fontFace: FONT_CODE, align: "right",
  });

  s.addNotes("هذه مقدمة المشروع: أداة تشفير اسمها تشفير. أعرّف بنفسي وبعنوان العرض.");
})();

// ====================================================================== //
// SLIDE 2 — Agenda
// ====================================================================== //
(function agenda() {
  const s = newSlide();
  addTitle(s, "المحتويات", "AGENDA");
  const items = [
    ["01", "ما هو التشفير؟", "How encryption works"],
    ["02", "مقارنة الخوارزميات الأربع", "Algorithm comparison"],
    ["03", "AES-256-GCM", "Symmetric · authenticated"],
    ["04", "RSA-2048 + Hybrid", "Asymmetric keys"],
    ["05", "ChaCha20 و Triple-DES", "Speed & legacy"],
    ["06", "إدارة المفاتيح والعرض الحي", "Keys, Salt, Nonce + Demo"],
  ];
  const colW = 5.9, rowH = 1.15, gapX = 0.4, gapY = 0.25;
  const startX = 0.6, startY = 1.7;
  items.forEach((it, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = startX + col * (colW + gapX);
    const y = startY + row * (rowH + gapY);
    addCard(s, x, y, colW, rowH);
    s.addText(it[0], { x: x + colW - 1.2, y: y + 0.1, w: 1.0, h: rowH - 0.2, fontFace: FONT_CODE, fontSize: 30, bold: true, color: C.violet, align: "center", valign: "middle" });
    s.addText(it[1], { x: x + 0.3, y: y + 0.18, w: colW - 1.4, h: 0.55, fontFace: FONT_BODY, fontSize: 17, bold: true, color: C.text, align: "right", rtlMode: true, valign: "middle" });
    s.addText(it[2], { x: x + 0.3, y: y + 0.62, w: colW - 1.4, h: 0.4, fontFace: FONT_CODE, fontSize: 11, color: C.muted, align: "right" });
  });
  addFooter(s, 2);
  s.addNotes("أستعرض النقاط الرئيسية للعرض. نبدأ بالمفهوم ثم نغوص في كل خوارزمية.");
})();

// ====================================================================== //
// SLIDE 3 — What is Encryption (flow diagram)
// ====================================================================== //
(function whatIs() {
  const s = newSlide();
  addTitle(s, "ما هو التشفير؟", "WHAT IS ENCRYPTION");

  s.addText("تحويل البيانات المقروءة إلى صيغة غير مفهومة، بحيث لا يفكّها إلا من يملك المفتاح الصحيح.", {
    x: 0.6, y: 1.55, w: 12.1, h: 0.6, fontFace: FONT_BODY, fontSize: 16, color: C.text, align: "right", rtlMode: true,
  });

  const boxY = 3.0, boxH = 1.7, boxW = 3.3;
  const x1 = 0.9, x2 = 5.0, x3 = 9.1;

  // plaintext
  addCard(s, x1, boxY, boxW, boxH, { line: C.green });
  s.addText("🔓", { x: x1, y: boxY + 0.2, w: boxW, h: 0.7, fontSize: 30, align: "center" });
  s.addText("النص الأصلي", { x: x1, y: boxY + 0.95, w: boxW, h: 0.4, fontFace: FONT_BODY, fontSize: 16, bold: true, color: C.text, align: "center", rtlMode: true });
  s.addText("Plaintext", { x: x1, y: boxY + 1.3, w: boxW, h: 0.3, fontFace: FONT_CODE, fontSize: 11, color: C.muted, align: "center" });

  // algorithm
  addCard(s, x2, boxY, boxW, boxH, { line: C.violet, fill: "1B1733" });
  s.addText("⚙️", { x: x2, y: boxY + 0.2, w: boxW, h: 0.7, fontSize: 30, align: "center" });
  s.addText("الخوارزمية + المفتاح", { x: x2, y: boxY + 0.95, w: boxW, h: 0.4, fontFace: FONT_BODY, fontSize: 16, bold: true, color: C.violetSoft, align: "center", rtlMode: true });
  s.addText("Algorithm + Key", { x: x2, y: boxY + 1.3, w: boxW, h: 0.3, fontFace: FONT_CODE, fontSize: 11, color: C.muted, align: "center" });

  // ciphertext
  addCard(s, x3, boxY, boxW, boxH, { line: C.warn });
  s.addText("🔒", { x: x3, y: boxY + 0.2, w: boxW, h: 0.7, fontSize: 30, align: "center" });
  s.addText("النص المشفّر", { x: x3, y: boxY + 0.95, w: boxW, h: 0.4, fontFace: FONT_BODY, fontSize: 16, bold: true, color: C.text, align: "center", rtlMode: true });
  s.addText("Ciphertext", { x: x3, y: boxY + 1.3, w: boxW, h: 0.3, fontFace: FONT_CODE, fontSize: 11, color: C.muted, align: "center" });

  // arrows between boxes
  s.addShape(pptx.ShapeType.rightArrow, { x: x1 + boxW + 0.12, y: boxY + 0.65, w: 0.65, h: 0.4, fill: { color: C.violet }, line: { type: "none" } });
  s.addShape(pptx.ShapeType.rightArrow, { x: x2 + boxW + 0.12, y: boxY + 0.65, w: 0.65, h: 0.4, fill: { color: C.violet }, line: { type: "none" } });

  // example strip
  addCode(s, 0.9, 5.2, 11.5, 1.35,
    'Hello  →  AESGCM(key, nonce)  →  k3Jh8x2P9vQ1mZ...==', "مثال · Example");

  addFooter(s, 3);
  s.addNotes("أشرح الفكرة الأساسية: مدخل واضح يمر عبر خوارزمية ومفتاح فينتج نص مشفّر. بدون المفتاح لا يمكن استرجاع الأصل.");
})();

// ====================================================================== //
// SLIDE 4 — Algorithm Comparison (table)
// ====================================================================== //
(function comparison() {
  const s = newSlide();
  addTitle(s, "مقارنة الخوارزميات", "ALGORITHM COMPARISON");

  const head = (t) => ({ text: t, options: { fill: { color: C.violet }, color: C.white, bold: true, fontFace: FONT_CODE, fontSize: 13, align: "center", valign: "middle" } });
  const cell = (t, color) => ({ text: t, options: { fill: { color: C.surface }, color: color || C.text, fontFace: FONT_BODY, fontSize: 12.5, align: "center", valign: "middle" } });
  const code = (t, color) => ({ text: t, options: { fill: { color: C.surface }, color: color || C.text, fontFace: FONT_CODE, fontSize: 12, align: "center", valign: "middle" } });

  const rows = [
    [head("Algorithm"), head("Type"), head("Speed"), head("Use case"), head("Status")],
    [code("AES-256-GCM", C.violetSoft), cell("Symmetric"), cell("Fast", C.green), cell("Standard / general"), cell("✓ Recommended", C.green)],
    [code("RSA-2048", C.violetSoft), cell("Asymmetric"), cell("Slow", C.warn), cell("Key exchange"), cell("✓ Recommended", C.green)],
    [code("ChaCha20", C.violetSoft), cell("Symmetric"), cell("Very fast", C.green), cell("Mobile / no-AES-HW"), cell("✓ Recommended", C.green)],
    [code("Triple-DES", C.violetSoft), cell("Symmetric"), cell("Slow", C.warn), cell("Legacy systems"), cell("✗ Deprecated", C.warn)],
  ];

  s.addTable(rows, {
    x: 0.6, y: 1.8, w: 12.1, colW: [2.7, 2.2, 2.0, 3.0, 2.2],
    rowH: [0.55, 0.78, 0.78, 0.78, 0.78],
    border: { type: "solid", color: C.border, pt: 1 },
    align: "center", valign: "middle",
  });

  s.addText("AES و ChaCha20 متماثلان (مفتاح واحد)، أما RSA غير متماثل (مفتاحان). Triple-DES يُستخدم للتعليم فقط.", {
    x: 0.6, y: 6.4, w: 12.1, h: 0.5, fontFace: FONT_BODY, fontSize: 13, color: C.muted, align: "right", rtlMode: true,
  });

  addFooter(s, 4);
  s.addNotes("جدول مقارنة سريع بين الأربع خوارزميات. الأخضر يعني موصى به، والأحمر يعني قديم وغير آمن.");
})();

// ====================================================================== //
// SLIDE 5 — AES-256-GCM
// ====================================================================== //
(function aes() {
  const s = newSlide();
  addTitle(s, "التشفير المتماثل — AES-256-GCM", "SYMMETRIC · AUTHENTICATED");

  addCard(s, 0.6, 1.7, 5.7, 2.3);
  s.addText("الفكرة", { x: 0.8, y: 1.85, w: 5.3, h: 0.4, fontFace: FONT_BODY, fontSize: 15, bold: true, color: C.green, align: "right", rtlMode: true });
  s.addText(
    [
      { text: "• مفتاح واحد للتشفير وفك التشفير (256-bit).\n", options: {} },
      { text: "• GCM يضيف وسم تحقق (Tag) يكشف أي تلاعب.\n", options: {} },
      { text: "• المفتاح يُشتق من كلمة المرور عبر PBKDF2.", options: {} },
    ],
    { x: 0.8, y: 2.3, w: 5.3, h: 1.6, fontFace: FONT_BODY, fontSize: 14, color: C.text, align: "right", rtlMode: true, lineSpacingMultiple: 1.25 }
  );

  // real example
  addCard(s, 0.6, 4.2, 5.7, 2.35, { fill: C.surface });
  s.addText("مثال حقيقي · Example", { x: 0.8, y: 4.32, w: 5.3, h: 0.35, fontFace: FONT_CODE, fontSize: 12, color: C.green, align: "right" });
  s.addText(
    [
      { text: 'input:    ', options: { color: C.muted } },
      { text: '"Secret"\n', options: { color: C.white } },
      { text: 'password: ', options: { color: C.muted } },
      { text: '"p@ss123"\n', options: { color: C.white } },
      { text: 'output:   ', options: { color: C.muted } },
      { text: 'b1c9..salt+nonce+ct+tag', options: { color: C.violetSoft } },
    ],
    { x: 0.8, y: 4.75, w: 5.3, h: 1.7, fontFace: FONT_CODE, fontSize: 12.5, align: "left", valign: "top", lineSpacingMultiple: 1.3 }
  );

  // code
  addCode(s, 6.6, 1.7, 6.1, 4.85,
`from cryptography.hazmat.primitives \\
     .ciphers.aead import AESGCM

salt  = os.urandom(16)
key   = PBKDF2HMAC(SHA256(), 32,
          salt, 100_000).derive(pwd)
nonce = os.urandom(12)

ct = AESGCM(key).encrypt(nonce, data, None)

# output = salt + nonce + ct + tag
token  = b64encode(salt + nonce + ct)`, "Python · cryptography");

  addFooter(s, 5);
  s.addNotes("AES هو المعيار الذهبي للتشفير المتماثل. وضع GCM يجمع بين السرية والتحقق من السلامة في خطوة واحدة.");
})();

// ====================================================================== //
// SLIDE 6 — RSA-2048 + Hybrid
// ====================================================================== //
(function rsa() {
  const s = newSlide();
  addTitle(s, "التشفير غير المتماثل — RSA-2048", "ASYMMETRIC · TWO KEYS");

  // key diagram
  addCard(s, 0.6, 1.7, 5.7, 2.0, { line: C.green });
  s.addText("🔑 المفتاح العام", { x: 0.8, y: 1.85, w: 5.3, h: 0.4, fontFace: FONT_BODY, fontSize: 15, bold: true, color: C.green, align: "right", rtlMode: true });
  s.addText("يُشارَك مع الجميع · يُشفّر فقط", { x: 0.8, y: 2.25, w: 5.3, h: 0.4, fontFace: FONT_BODY, fontSize: 13, color: C.text, align: "right", rtlMode: true });
  s.addText("Public key  →  encrypt", { x: 0.8, y: 2.95, w: 5.3, h: 0.5, fontFace: FONT_CODE, fontSize: 13, color: C.muted, align: "right" });

  addCard(s, 0.6, 3.85, 5.7, 2.0, { line: C.warn });
  s.addText("🔐 المفتاح الخاص", { x: 0.8, y: 4.0, w: 5.3, h: 0.4, fontFace: FONT_BODY, fontSize: 15, bold: true, color: C.warn, align: "right", rtlMode: true });
  s.addText("سرّي تماماً · يفكّ التشفير", { x: 0.8, y: 4.4, w: 5.3, h: 0.4, fontFace: FONT_BODY, fontSize: 13, color: C.text, align: "right", rtlMode: true });
  s.addText("Private key  →  decrypt", { x: 0.8, y: 5.1, w: 5.3, h: 0.5, fontFace: FONT_CODE, fontSize: 13, color: C.muted, align: "right" });

  // code
  addCode(s, 6.6, 1.7, 6.1, 3.55,
`priv = rsa.generate_private_key(
          public_exponent=65537,
          key_size=2048)
pub  = priv.public_key()

# Hybrid: RSA wraps a random AES key
aes_key = os.urandom(32)
enc_key = pub.encrypt(aes_key, OAEP(...))
ct      = AESGCM(aes_key).encrypt(n, data)`, "Python · RSA + Hybrid");

  // hybrid note banner
  s.addShape(pptx.ShapeType.roundRect, { x: 6.6, y: 5.45, w: 6.1, h: 1.1, rectRadius: 0.08, fill: { color: "1B1733" }, line: { color: C.violet, width: 1.25 }, shadow: makeShadow() });
  s.addText("💡 التشفير الهجين (Hybrid)", { x: 6.8, y: 5.55, w: 5.7, h: 0.4, fontFace: FONT_BODY, fontSize: 14, bold: true, color: C.violetSoft, align: "right", rtlMode: true });
  s.addText("RSA بطيء ومحدود الحجم، فنشفّر البيانات بـ AES ونشفّر مفتاح AES بـ RSA — فيعمل مع أي حجم.", {
    x: 6.8, y: 5.95, w: 5.7, h: 0.55, fontFace: FONT_BODY, fontSize: 12, color: C.text, align: "right", rtlMode: true,
  });

  addFooter(s, 6);
  s.addNotes("RSA يحل مشكلة تبادل المفاتيح بمفتاحين منفصلين. للملفات الكبيرة نستخدم التشفير الهجين مع AES.");
})();

// ====================================================================== //
// SLIDE 7 — ChaCha20
// ====================================================================== //
(function chacha() {
  const s = newSlide();
  addTitle(s, "السرعة — ChaCha20-Poly1305", "STREAM CIPHER · MOBILE");

  addCard(s, 0.6, 1.7, 5.7, 2.0);
  s.addText("الفكرة", { x: 0.8, y: 1.85, w: 5.3, h: 0.4, fontFace: FONT_BODY, fontSize: 15, bold: true, color: C.green, align: "right", rtlMode: true });
  s.addText(
    [
      { text: "• تشفير انسيابي سريع جداً بالبرمجيات.\n", options: {} },
      { text: "• Poly1305 يوفّر التحقق من السلامة.\n", options: {} },
      { text: "• مثالي للجوال حيث لا يوجد تسريع AES.", options: {} },
    ],
    { x: 0.8, y: 2.25, w: 5.3, h: 1.4, fontFace: FONT_BODY, fontSize: 14, color: C.text, align: "right", rtlMode: true, lineSpacingMultiple: 1.25 }
  );

  // speed comparison bars
  s.addText("مقارنة السرعة على الجوال · Speed (software)", { x: 0.6, y: 3.95, w: 5.7, h: 0.4, fontFace: FONT_CODE, fontSize: 12, color: C.muted, align: "right" });
  // AES bar
  s.addText("AES", { x: 0.6, y: 4.45, w: 1.0, h: 0.4, fontFace: FONT_CODE, fontSize: 13, color: C.text, align: "left", valign: "middle" });
  s.addShape(pptx.ShapeType.roundRect, { x: 1.6, y: 4.5, w: 2.4, h: 0.32, rectRadius: 0.05, fill: { color: C.border }, line: { type: "none" } });
  s.addText("1x", { x: 4.1, y: 4.45, w: 0.8, h: 0.4, fontFace: FONT_CODE, fontSize: 12, color: C.muted, align: "left", valign: "middle" });
  // ChaCha bar
  s.addText("ChaCha", { x: 0.6, y: 5.05, w: 1.0, h: 0.4, fontFace: FONT_CODE, fontSize: 13, color: C.green, align: "left", valign: "middle" });
  s.addShape(pptx.ShapeType.roundRect, { x: 1.6, y: 5.1, w: 4.2, h: 0.32, rectRadius: 0.05, fill: { color: C.green }, line: { type: "none" } });
  s.addText("~3x", { x: 5.9, y: 5.05, w: 0.8, h: 0.4, fontFace: FONT_CODE, fontSize: 12, color: C.green, align: "left", valign: "middle" });

  // code
  addCode(s, 6.6, 1.7, 6.1, 4.85,
`from cryptography.hazmat.primitives \\
     .ciphers.aead import \\
     ChaCha20Poly1305

key   = PBKDF2HMAC(SHA256(), 32,
          salt, 100_000).derive(pwd)
nonce = os.urandom(12)

ct = ChaCha20Poly1305(key) \\
        .encrypt(nonce, data, None)

token = b64encode(salt + nonce + ct)`, "Python · ChaCha20");

  addFooter(s, 7);
  s.addNotes("ChaCha20 أسرع من AES عند غياب التسريع العتادي، ولذلك تعتمده تطبيقات الجوال وبروتوكول TLS الحديث.");
})();

// ====================================================================== //
// SLIDE 8 — Triple-DES
// ====================================================================== //
(function tdes() {
  const s = newSlide();
  addTitle(s, "القديم — Triple-DES (3DES)", "LEGACY · EDUCATIONAL");

  addCard(s, 0.6, 1.7, 5.7, 2.6);
  s.addText("الفكرة", { x: 0.8, y: 1.85, w: 5.3, h: 0.4, fontFace: FONT_BODY, fontSize: 15, bold: true, color: C.green, align: "right", rtlMode: true });
  s.addText(
    [
      { text: "• يطبّق DES ثلاث مرات بمفتاح 24-byte.\n", options: {} },
      { text: "• وضع CBC مع حشو PKCS7 و IV عشوائي.\n", options: {} },
      { text: "• كتلة 64-bit، أبطأ وأضعف من AES.\n", options: {} },
      { text: "• موجود هنا للأغراض التعليمية فقط.", options: {} },
    ],
    { x: 0.8, y: 2.25, w: 5.3, h: 2.0, fontFace: FONT_BODY, fontSize: 14, color: C.text, align: "right", rtlMode: true, lineSpacingMultiple: 1.25 }
  );

  // warning banner
  s.addShape(pptx.ShapeType.roundRect, { x: 0.6, y: 4.55, w: 5.7, h: 1.2, rectRadius: 0.08, fill: { color: "2A1518" }, line: { color: C.warn, width: 1.5 }, shadow: makeShadow() });
  s.addText("⚠️ تحذير", { x: 0.8, y: 4.65, w: 5.3, h: 0.4, fontFace: FONT_BODY, fontSize: 15, bold: true, color: C.warn, align: "right", rtlMode: true });
  s.addText("أُهمل رسمياً (NIST) ولا يُستخدم في الأنظمة الحديثة — استخدم AES أو ChaCha20.", {
    x: 0.8, y: 5.05, w: 5.3, h: 0.6, fontFace: FONT_BODY, fontSize: 12.5, color: C.text, align: "right", rtlMode: true,
  });

  addCode(s, 6.6, 1.7, 6.1, 4.85,
`from cryptography.hazmat.primitives \\
     .ciphers import Cipher, \\
     algorithms, modes

key = PBKDF2HMAC(SHA256(), 24,   # 24 B
        salt, 100_000).derive(pwd)
iv  = os.urandom(8)

padded = PKCS7(64).padder() \\
           .update(data) + ...
enc = Cipher(TripleDES(key),
        CBC(iv)).encryptor()
ct  = enc.update(padded) + \\
      enc.finalize()`, "Python · Triple-DES");

  addFooter(s, 8);
  s.addNotes("نعرض 3DES لفهم تطور التشفير. مفتاحه 24 بايت لكنه قديم وأبطأ، ولا يُنصح به في الإنتاج.");
})();

// ====================================================================== //
// SLIDE 9 — Key Management (PBKDF2 / Salt / Nonce)
// ====================================================================== //
(function keys() {
  const s = newSlide();
  addTitle(s, "إدارة المفاتيح", "KEY MANAGEMENT");

  const cards = [
    ["PBKDF2", "اشتقاق المفتاح", "يحوّل كلمة المرور إلى مفتاح قوي عبر 100,000 تكرار + SHA-256، فيصعّب التخمين.", C.violet],
    ["SALT", "ملح عشوائي", "16 بايت عشوائية تُضاف لكل عملية، فتمنع جداول القرصنة الجاهزة (Rainbow tables).", C.green],
    ["NONCE / IV", "رقم يُستخدم مرة", "قيمة فريدة لكل تشفير تضمن أن نفس النص لا ينتج نفس الشيفرة مرتين.", C.warn],
  ];
  const cw = 3.95, gap = 0.3, x0 = 0.6, y0 = 1.85, ch = 4.3;
  cards.forEach((c, i) => {
    const x = x0 + i * (cw + gap);
    addCard(s, x, y0, cw, ch, { line: c[3] });
    s.addShape(pptx.ShapeType.roundRect, { x: x + 0.3, y: y0 + 0.3, w: 1.0, h: 0.6, rectRadius: 0.1, fill: { color: C.surface }, line: { color: c[3], width: 1.25 } });
    s.addText(["🔑", "🧂", "🎲"][i], { x: x + 0.3, y: y0 + 0.3, w: 1.0, h: 0.6, fontSize: 22, align: "center", valign: "middle" });
    s.addText(c[0], { x: x + 0.3, y: y0 + 1.1, w: cw - 0.6, h: 0.5, fontFace: FONT_CODE, fontSize: 20, bold: true, color: c[3], align: "right" });
    s.addText(c[1], { x: x + 0.3, y: y0 + 1.65, w: cw - 0.6, h: 0.5, fontFace: FONT_BODY, fontSize: 15, bold: true, color: C.text, align: "right", rtlMode: true });
    s.addText(c[2], { x: x + 0.3, y: y0 + 2.25, w: cw - 0.6, h: 1.8, fontFace: FONT_BODY, fontSize: 13, color: C.muted, align: "right", rtlMode: true, lineSpacingMultiple: 1.25, valign: "top" });
  });

  s.addText("الناتج النهائي  =  salt + nonce + ciphertext + tag", {
    x: 0.6, y: 6.35, w: 12.1, h: 0.45, fontFace: FONT_CODE, fontSize: 14, color: C.violetSoft, align: "center",
  });

  addFooter(s, 9);
  s.addNotes("هذه المفاهيم الثلاثة هي أساس الأمان العملي. الملح والـ nonce يضمنان أن كل عملية تشفير فريدة.");
})();

// ====================================================================== //
// SLIDE 10 — Demo
// ====================================================================== //
(function demo() {
  const s = newSlide();
  addTitle(s, "العرض الحي — تطبيق تشفير", "LIVE DEMO");

  // browser mock
  s.addShape(pptx.ShapeType.roundRect, { x: 0.6, y: 1.8, w: 7.0, h: 4.6, rectRadius: 0.1, fill: { color: C.surface }, line: { color: C.border, width: 1 }, shadow: makeShadow() });
  s.addShape(pptx.ShapeType.roundRect, { x: 0.6, y: 1.8, w: 7.0, h: 0.55, rectRadius: 0.1, fill: { color: C.card }, line: { color: C.border, width: 1 } });
  ["FF6B6B", "F5C451", "00C896"].forEach((col, i) =>
    s.addShape(pptx.ShapeType.ellipse, { x: 0.85 + i * 0.3, y: 1.97, w: 0.2, h: 0.2, fill: { color: col }, line: { type: "none" } })
  );
  s.addText("localhost:5000", { x: 2.0, y: 1.85, w: 5.0, h: 0.45, fontFace: FONT_CODE, fontSize: 12, color: C.muted, align: "left", valign: "middle" });
  s.addText("🔐", { x: 0.6, y: 2.7, w: 7.0, h: 0.9, fontSize: 40, align: "center" });
  s.addText("تشفير · TASHFEER", { x: 0.6, y: 3.6, w: 7.0, h: 0.5, fontFace: FONT_CODE, fontSize: 22, bold: true, color: C.violet, align: "center" });
  ["AES", "RSA", "ChaCha20", "3DES"].forEach((t, i) =>
    addBadge(s, 1.0 + i * 1.6, 4.4, 1.45, t, i === 0 ? C.violet : C.border)
  );
  s.addText("[ نص · ملفات · صور · صوت ]", { x: 0.6, y: 5.1, w: 7.0, h: 0.4, fontFace: FONT_CODE, fontSize: 13, color: C.muted, align: "center" });
  addBadge(s, 2.8, 5.6, 3.0, "🔐 تشفير / 🔓 فك", C.green);

  // steps
  addCard(s, 7.9, 1.8, 4.8, 4.6, { fill: C.surface });
  s.addText("خطوات العرض", { x: 8.1, y: 1.95, w: 4.4, h: 0.45, fontFace: FONT_BODY, fontSize: 16, bold: true, color: C.green, align: "right", rtlMode: true });
  const steps = [
    "شغّل:  python app.py",
    "افتح:  localhost:5000",
    "اختر AES + اكتب نصاً",
    "أدخل كلمة المرور → تشفير",
    "انسخ الناتج → فك التشفير",
    "جرّب RSA: ولّد مفاتيح",
    "ارفع صورة وشفّرها",
  ];
  steps.forEach((t, i) => {
    const yy = 2.5 + i * 0.55;
    s.addShape(pptx.ShapeType.ellipse, { x: 12.15, y: yy + 0.02, w: 0.32, h: 0.32, fill: { color: C.violet }, line: { type: "none" } });
    s.addText(String(i + 1), { x: 12.15, y: yy + 0.02, w: 0.32, h: 0.32, fontFace: FONT_CODE, fontSize: 12, bold: true, color: C.white, align: "center", valign: "middle" });
    s.addText(t, { x: 8.1, y: yy, w: 3.9, h: 0.4, fontFace: FONT_CODE, fontSize: 12.5, color: C.text, align: "right", valign: "middle" });
  });

  addFooter(s, 10);
  s.addNotes("أنتقل الآن للتطبيق الحقيقي وأشغّله أمام الجميع. أشفّر نصاً ثم أفكّه لأثبت أنه يعمل فعلياً.");
})();

// ====================================================================== //
// SLIDE 11 — When to use which
// ====================================================================== //
(function whenToUse() {
  const s = newSlide();
  addTitle(s, "متى أستخدم كل خوارزمية؟", "WHICH ALGORITHM WHEN");

  const cards = [
    ["AES-256-GCM", "🛡️", "الخيار الافتراضي لأي تشفير عام: ملفات، قواعد بيانات، اتصالات.", C.violet],
    ["RSA-2048", "🔑", "لتبادل المفاتيح والتواقيع الرقمية بين طرفين لا يتشاركان سرّاً.", C.green],
    ["ChaCha20", "⚡", "للأجهزة المحمولة والأنظمة بدون تسريع AES العتادي.", C.violetSoft],
    ["Triple-DES", "📚", "للتوافق مع أنظمة قديمة جداً وللتعليم — تجنّبه في الجديد.", C.warn],
  ];
  const cw = 5.9, ch = 2.0, gx = 0.4, gy = 0.35, x0 = 0.6, y0 = 1.8;
  cards.forEach((c, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = x0 + col * (cw + gx), y = y0 + row * (ch + gy);
    addCard(s, x, y, cw, ch, { line: c[3] });
    s.addShape(pptx.ShapeType.roundRect, { x: x + cw - 1.15, y: y + 0.3, w: 0.85, h: 0.85, rectRadius: 0.12, fill: { color: C.surface }, line: { color: c[3], width: 1.25 } });
    s.addText(c[1], { x: x + cw - 1.15, y: y + 0.3, w: 0.85, h: 0.85, fontSize: 26, align: "center", valign: "middle" });
    s.addText(c[0], { x: x + 0.3, y: y + 0.35, w: cw - 1.4, h: 0.5, fontFace: FONT_CODE, fontSize: 19, bold: true, color: c[3], align: "right" });
    s.addText(c[2], { x: x + 0.3, y: y + 0.95, w: cw - 1.4, h: 0.95, fontFace: FONT_BODY, fontSize: 14, color: C.text, align: "right", rtlMode: true, valign: "top", lineSpacingMultiple: 1.2 });
  });

  addFooter(s, 11);
  s.addNotes("خلاصة عملية تساعد على اختيار الخوارزمية المناسبة. القاعدة: AES أو ChaCha20 للتشفير، RSA لتبادل المفاتيح.");
})();

// ====================================================================== //
// SLIDE 12 — Closing
// ====================================================================== //
(function closing() {
  const s = newSlide();
  s.addShape(pptx.ShapeType.roundRect, { x: 8.5, y: -1.5, w: 6, h: 6, rectRadius: 3, fill: { color: "15122E" }, line: { type: "none" } });
  s.addShape(pptx.ShapeType.roundRect, { x: -1.5, y: 4, w: 6, h: 6, rectRadius: 3, fill: { color: "0E2421" }, line: { type: "none" } });

  s.addText("🔐", { x: 0, y: 1.3, w: W, h: 1.0, fontSize: 46, align: "center" });
  s.addText("شكراً لكم", { x: 0, y: 2.3, w: W, h: 1.0, fontFace: FONT_CODE, fontSize: 52, bold: true, color: C.violet, align: "center", rtlMode: true });
  s.addText("أسئلتكم ومناقشتكم", { x: 0, y: 3.5, w: W, h: 0.6, fontFace: FONT_BODY, fontSize: 20, color: C.green, align: "center", rtlMode: true });
  s.addText("Questions & Answers", { x: 0, y: 4.15, w: W, h: 0.5, fontFace: FONT_CODE, fontSize: 14, color: C.muted, align: "center", charSpacing: 3 });

  addCard(s, 4.16, 5.0, 5.0, 1.4);
  s.addText("حسين حامد الكوافي", { x: 4.36, y: 5.2, w: 4.6, h: 0.5, fontFace: FONT_BODY, fontSize: 18, bold: true, color: C.text, align: "center", rtlMode: true });
  s.addText("ID 642  ·  Cybersecurity", { x: 4.36, y: 5.75, w: 4.6, h: 0.4, fontFace: FONT_CODE, fontSize: 13, color: C.muted, align: "center" });

  s.addNotes("أشكر الدكتور والطلبة وأفتح باب الأسئلة. مستعد لشرح أي خوارزمية أو تشغيل التطبيق مرة أخرى.");
})();

// ---------------------------------------------------------------- write
pptx.writeFile({ fileName: "Tashfeer_Presentation.pptx" }).then((f) => {
  console.log("✓ Created:", f);
});
