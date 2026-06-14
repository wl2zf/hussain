#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Build a beautiful, self-contained HTML summary for the Tashfeer presentation.

Fonts are embedded as base64 so the file works offline and prints cleanly.
Output: Tashfeer_Summary.html
"""
import base64
import pathlib

FONTS = pathlib.Path("fonts")
def b64(p): return base64.b64encode((FONTS / p).read_bytes()).decode()

TAJ_R, TAJ_B = b64("Tajawal-Regular.ttf"), b64("Tajawal-Bold.ttf")
JBM_R, JBM_B = b64("JetBrainsMono-Regular.ttf"), b64("JetBrainsMono-Bold.ttf")

CSS = f"""
@font-face {{ font-family:'Taj'; font-weight:400; src:url(data:font/ttf;base64,{TAJ_R}); }}
@font-face {{ font-family:'Taj'; font-weight:700; src:url(data:font/ttf;base64,{TAJ_B}); }}
@font-face {{ font-family:'JBM'; font-weight:400; src:url(data:font/ttf;base64,{JBM_R}); }}
@font-face {{ font-family:'JBM'; font-weight:700; src:url(data:font/ttf;base64,{JBM_B}); }}

:root {{
  --bg:#0D0D14; --bg2:#10101a; --card:#13131F; --card2:#171724; --border:#252535;
  --violet:#7C6AFF; --violet2:#9A8CFF; --green:#00C896; --red:#FF6B6B;
  --text:#E8E8F0; --muted:#8A8AA0;
}}
* {{ box-sizing:border-box; margin:0; padding:0; }}
html {{ -webkit-print-color-adjust:exact; print-color-adjust:exact; }}
body {{
  background:var(--bg); color:var(--text); direction:rtl;
  font-family:'Taj', sans-serif; line-height:1.85; font-size:16px;
  background-image:
    radial-gradient(circle at 12% 4%, rgba(124,106,255,.12), transparent 40%),
    radial-gradient(circle at 88% 96%, rgba(0,200,150,.07), transparent 42%);
}}
.wrap {{ max-width:1000px; margin:0 auto; padding:34px 22px 70px; }}
.mono {{ font-family:'JBM', monospace; direction:ltr; unicode-bidi:embed; }}

/* ---------- Hero ---------- */
.hero {{ text-align:center; padding:40px 18px 30px; border:1px solid var(--border);
  border-radius:24px; background:linear-gradient(180deg, #15122e55, var(--card));
  position:relative; overflow:hidden; }}
.hero .lock {{ font-size:46px; }}
.hero h1 {{ font-family:'JBM'; font-size:56px; font-weight:700; margin:2px 0; color:var(--violet2); }}
@supports ((background-clip:text) or (-webkit-background-clip:text)) {{
  .hero h1 {{ background:linear-gradient(135deg, var(--violet), var(--violet2));
    -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; color:transparent; }}
}}
.hero .en {{ font-family:'JBM'; letter-spacing:8px; color:var(--green); font-size:16px; }}
.hero .sub {{ color:var(--muted); margin-top:12px; font-size:17px; }}
.hero .chip {{ display:inline-flex; gap:10px; align-items:center; margin-top:18px;
  background:var(--card2); border:1px solid var(--border); border-radius:999px;
  padding:9px 20px; font-size:15px; }}
.hero .chip b {{ color:var(--text); }} .hero .chip .id {{ font-family:'JBM'; color:var(--green); font-weight:700; }}
.hero .chip .muted {{ color:var(--muted); }}

/* ---------- Sections ---------- */
section {{ margin-top:40px; }}
.sec-h {{ display:flex; align-items:center; gap:12px; margin-bottom:16px; }}
.sec-h .num {{ font-family:'JBM'; font-weight:700; font-size:15px; color:#fff;
  background:var(--violet); border-radius:9px; padding:4px 12px; }}
.sec-h h2 {{ font-size:24px; color:var(--text); }}
.sec-h .e {{ font-family:'JBM'; color:var(--muted); font-size:13px; letter-spacing:1px; margin-right:auto; }}

/* ---------- Cards ---------- */
.grid {{ display:flex; flex-wrap:wrap; gap:14px; }}
.card {{ background:var(--card); border:1px solid var(--border); border-radius:16px;
  padding:18px 20px; flex:1 1 280px; }}
.card h3 {{ font-size:18px; margin-bottom:6px; display:flex; gap:8px; align-items:center; }}
.card p {{ color:#cfcfe0; font-size:15px; }}
.card .tag {{ font-family:'JBM'; font-size:12px; color:var(--muted); }}

/* ---------- Callouts ---------- */
.box {{ border-radius:14px; padding:16px 20px; margin:14px 0; border-right:5px solid var(--border); background:var(--card); }}
.box .bt {{ font-weight:700; font-size:17px; margin-bottom:4px; }}
.box.tip {{ background:#16132e; border-right-color:var(--violet); }} .box.tip .bt {{ color:var(--violet2); }}
.box.warn {{ background:#2a1518; border-right-color:var(--red); }} .box.warn .bt {{ color:var(--red); }}
.box.ok {{ background:#0e2421; border-right-color:var(--green); }} .box.ok .bt {{ color:var(--green); }}

/* ---------- PBKDF2 flow ---------- */
.flow {{ display:flex; flex-wrap:wrap; align-items:center; justify-content:center; gap:10px; margin:8px 0 4px; }}
.flow .pill {{ background:var(--card2); border:1px solid var(--border); border-radius:14px;
  padding:14px 18px; text-align:center; min-width:170px; }}
.flow .pill .t {{ font-size:14px; color:var(--muted); }}
.flow .pill .v {{ font-family:'JBM'; font-weight:700; font-size:18px; margin-top:3px; }}
.flow .pill.k1 {{ border-color:var(--muted); }} .flow .pill.k1 .v {{ color:var(--green); }}
.flow .pill.k2 {{ border-color:var(--violet); background:#1b1733; }} .flow .pill.k2 .v {{ color:var(--violet2); }}
.flow .pill.k3 {{ border-color:var(--green); }} .flow .pill.k3 .v {{ color:var(--green); }}
.flow .arr {{ color:var(--violet); font-size:24px; font-weight:700; }}

/* ---------- Tables ---------- */
table {{ width:100%; border-collapse:collapse; margin:8px 0; font-size:15px; overflow:hidden; border-radius:12px; }}
th {{ background:var(--violet); color:#fff; font-weight:700; padding:11px 12px; }}
td {{ border:1px solid var(--border); padding:10px 12px; text-align:center; }}
tr:nth-child(even) td {{ background:var(--card); }}
td.algo {{ font-family:'JBM'; color:var(--violet2); font-weight:700; }}
.ok-c {{ color:var(--green); font-weight:700; }} .warn-c {{ color:var(--red); font-weight:700; }}

/* ---------- Two columns ---------- */
.two {{ display:flex; flex-wrap:wrap; gap:16px; }}
.two .col {{ flex:1 1 300px; border-radius:16px; padding:18px 22px; border:1px solid var(--border); background:var(--card); }}
.two .col.enc {{ border-color:var(--violet); }} .two .col.enc h3 {{ color:var(--violet2); }}
.two .col.hash {{ border-color:var(--green); }} .two .col.hash h3 {{ color:var(--green); }}
.two .col h3 {{ text-align:center; font-size:19px; margin-bottom:10px; }}
.two .col ul {{ list-style:none; }} .two .col li {{ padding:5px 0; color:#cfcfe0; }}
.two .col li::before {{ content:"◆"; color:var(--violet); margin-left:8px; font-size:11px; }}
.two .col.hash li::before {{ color:var(--green); }}

/* ---------- Algorithm cards ---------- */
.algos {{ display:flex; flex-wrap:wrap; gap:16px; }}
.algo {{ flex:1 1 440px; background:var(--card); border:1px solid var(--border);
  border-radius:16px; padding:18px 20px; border-top:3px solid var(--violet); }}
.algo .head {{ display:flex; align-items:center; gap:12px; margin-bottom:8px; }}
.algo .head .ic {{ font-size:26px; }}
.algo .head .nm {{ font-family:'JBM'; font-weight:700; font-size:18px; }}
.algo .head .ty {{ font-size:13px; color:var(--muted); margin-right:auto; }}
.algo .row {{ display:flex; gap:8px; margin:6px 0; font-size:14.5px; }}
.algo .row .lab {{ color:var(--violet2); font-weight:700; min-width:78px; }}
.algo .row .val {{ color:#cfcfe0; flex:1; }}
.algo.green {{ border-top-color:var(--green); }}
.algo.warn {{ border-top-color:var(--red); }}

.foot {{ text-align:center; margin-top:46px; color:var(--muted); font-family:'JBM'; font-size:13px; }}
.print-hint {{ text-align:center; color:var(--muted); font-size:13px; margin-top:10px; }}

@media print {{
  body {{ background:#0D0D14; }}
  .wrap {{ max-width:100%; padding:0; }}
  section {{ break-inside:avoid; }}
  .algo, .card, .box, .two .col {{ break-inside:avoid; }}
  .print-hint {{ display:none; }}
}}
@media (max-width:560px) {{ .hero h1 {{ font-size:42px; }} }}
"""

ALGOS = [
    ("🛡️", "AES-256-GCM", "متماثل · 32 بايت", "",
     "أقوى وأشهر تشفير متماثل. وضع GCM يجمع السرية + التحقق (tag يكشف التلاعب) في خطوة واحدة.",
     "اشتق المفتاح بـ PBKDF2 ← nonce عشوائي ← شفّر ← الناتج: salt + nonce + ciphertext + tag.",
     "الخيار الافتراضي لأي تشفير عام (واتساب، جيميل)."),
    ("🔑", "RSA-2048", "غير متماثل · مفتاحان", "",
     "مفتاح عام يشفّر ومفتاح خاص يفكّ. يحلّ تبادل السرّ دون كلمة مرور مشتركة.",
     "هجين: نشفّر البيانات بمفتاح AES عشوائي، ونشفّر مفتاح AES فقط بـ RSA-OAEP ← يعمل مع أي حجم.",
     "تبادل المفاتيح والتواقيع الرقمية (HTTPS، SSH)."),
    ("⚡", "ChaCha20-Poly1305", "متماثل · 32 بايت", "green",
     "تشفير انسيابي (stream) سريع جداً بالبرمجيات، مع Poly1305 للتحقق.",
     "نفس نمط AES (PBKDF2 + nonce) لكن بخوارزمية مختلفة محسّنة للبرمجيات.",
     "الجوّالات والأنظمة بلا تسريع AES عتادي (Signal، VPN)."),
    ("📚", "Triple-DES", "متماثل · 24 بايت", "warn",
     "يطبّق DES القديم ثلاث مرات بمفتاح 24 بايت. قديم وبطيء.",
     "وضع CBC بكتلة 8 بايت ← يحتاج حشو PKCS7 و IV عشوائي.",
     "⚠️ أُهمل رسمياً (NIST) — للتعليم فقط، استخدم AES بدلاً منه."),
    ("🌸", "Camellia-256", "متماثل · 32 بايت", "green",
     "تشفير كتلي ياباني بقوة AES، طوّرته NTT و Mitsubishi.",
     "مثل AES-CBC: كتلة 16 بايت، وضع CBC + حشو PKCS7.",
     "بديل AES معتمد دولياً (ISO/IEC و NESSIE الأوروبي)."),
    ("🔏", "AES-256-CBC + HMAC", "متماثل · 32 بايت", "",
     "CBC وحده لا يكشف التلاعب، فنضيف توقيع HMAC-SHA256 = تشفير ثم توثيق.",
     "شفّر بـ AES-CBC ← احسب HMAC على (IV+الشيفرة). عند الفك: تحقّق من HMAC أولاً.",
     "تعليمي — يوضّح لماذا AES-GCM يفعل هذا تلقائياً."),
    ("🧰", "Fernet", "متماثل · 32 بايت", "green",
     "نظام عالي المستوى يجمع AES-CBC + HMAC داخلياً ويدير كل التفاصيل.",
     "سطران فقط: <span class='mono'>Fernet(key).encrypt(data)</span> و <span class='mono'>.decrypt(token)</span>.",
     "الجاهز الآمن مقابل البناء اليدوي (تطبيقات Python)."),
]

def algo_card(ic, nm, ty, cls, idea, how, when):
    return f"""<div class="algo {cls}">
      <div class="head"><span class="ic">{ic}</span><span class="nm">{nm}</span><span class="ty">{ty}</span></div>
      <div class="row"><span class="lab">الفكرة</span><span class="val">{idea}</span></div>
      <div class="row"><span class="lab">طريقة العمل</span><span class="val">{how}</span></div>
      <div class="row"><span class="lab">متى</span><span class="val">{when}</span></div>
    </div>"""

algos_html = "".join(algo_card(*a) for a in ALGOS)

HTML = f"""<!doctype html><html lang="ar" dir="rtl"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>تشفير · ملخّص العرض</title><style>{CSS}</style></head>
<body><div class="wrap">

  <div class="hero">
    <div class="lock">🔐</div>
    <h1>تشفير</h1>
    <div class="en">T A S H F E E R</div>
    <div class="sub">ملخّص العرض التقديمي — أبرز النقاط والخوارزميات وطريقة شرحها</div>
    <div class="chip"><span class="muted">الطالب:</span> <b>حسين حامد الكوافي</b>
      <span class="muted">·</span> <span class="id">642</span>
      <span class="muted">· Cybersecurity</span></div>
  </div>
  <div class="print-hint">💡 لحفظها PDF: افتح الملف في المتصفح ثم اطبع (Ctrl/Cmd + P) واختر «Save as PDF».</div>

  <!-- 1: concepts -->
  <section>
    <div class="sec-h"><span class="num">١</span><h2>ما هو التشفير ونوعاه</h2><span class="e">CONCEPT</span></div>
    <div class="box ok"><div class="bt">💡 الفكرة</div>
      تحويل بيانات مقروءة (Plaintext) إلى صيغة غير مفهومة (Ciphertext) لا يفكّها إلا من يملك المفتاح الصحيح.
      المدخل يمرّ عبر <b>خوارزمية + مفتاح</b> فينتج نص مشفّر؛ بدون المفتاح لا يُسترجع الأصل.</div>
    <div class="grid">
      <div class="card"><h3>🔁 متماثل <span class="tag">Symmetric</span></h3>
        <p>مفتاح <b>واحد</b> للتشفير وفكّ التشفير → سريع. مثل: AES، ChaCha20، 3DES، Camellia، Fernet.</p></div>
      <div class="card"><h3>🔑 غير متماثل <span class="tag">Asymmetric</span></h3>
        <p>مفتاحان: <b>عام</b> (يُشارَك، يشفّر) و<b>خاص</b> (سرّي، يفكّ) → أبطأ لكنه يحلّ تبادل المفاتيح. مثل: RSA.</p></div>
    </div>
  </section>

  <!-- 2: PBKDF2 -->
  <section>
    <div class="sec-h"><span class="num">٢</span><h2>PBKDF2 — اشتقاق المفتاح (أهم نقطة)</h2><span class="e">KEY DERIVATION</span></div>
    <div class="box warn"><div class="bt">❓ السؤال المتوقّع من الدكتور</div>
      كيف تكتب كلمة مرور من 3 أرقام «<span class="mono">123</span>» لخوارزمية تحتاج مفتاح <b>32 بايت بالضبط</b>؟</div>
    <div class="flow">
      <div class="pill k1"><div class="t">كلمة المرور</div><div class="v">"123"</div></div>
      <span class="arr">←</span>
      <div class="pill k2"><div class="t">PBKDF2 + Salt</div><div class="v">100,000×</div></div>
      <span class="arr">←</span>
      <div class="pill k3"><div class="t">مفتاح</div><div class="v">32 byte</div></div>
    </div>
    <div class="grid" style="margin-top:14px">
      <div class="card"><h3>📏 أي طول → المطلوب</h3><p>يمدّد أي كلمة مرور إلى الطول الدقيق لكل خوارزمية.</p></div>
      <div class="card"><h3>🧂 Salt عشوائي</h3><p>يمنع جداول القرصنة الجاهزة (Rainbow Tables).</p></div>
      <div class="card"><h3>🔁 100,000 تكرار</h3><p>يبطّئ هجمات التخمين بشكل كبير.</p></div>
      <div class="card"><h3>🔑 نفس الكلمة</h3><p>«123» = 32 بايت لـ AES و24 بايت لـ Triple-DES.</p></div>
    </div>
    <div class="box tip"><div class="bt">🎤 الجواب الجاهز</div>
      «PBKDF2 يشتق المفتاح بالطول الصحيح من أي كلمة مرور، فلا يهمّ طول كلمة المرور الأصلية.»</div>
  </section>

  <!-- 3: recurring concepts -->
  <section>
    <div class="sec-h"><span class="num">٣</span><h2>مفاهيم تتكرّر في كل خوارزمية</h2><span class="e">BUILDING BLOCKS</span></div>
    <table>
      <tr><th>المصطلح</th><th>المعنى المختصر</th></tr>
      <tr><td class="algo">Salt</td><td>قيمة عشوائية (16 بايت) تُفرّد اشتقاق المفتاح</td></tr>
      <tr><td class="algo">Nonce / IV</td><td>قيمة تُستخدم مرة واحدة لكل تشفير، تمنع تكرار النتيجة</td></tr>
      <tr><td class="algo">Tag</td><td>وسم تحقّق يكشف أي تلاعب (في GCM و Poly1305)</td></tr>
      <tr><td class="algo">Base64</td><td>تمثيل البايتات كنص قابل للنسخ — ليست تشفيراً</td></tr>
      <tr><td class="algo">Hybrid</td><td>RSA يغلّف مفتاح AES لتشفير أي حجم</td></tr>
    </table>
  </section>

  <!-- 4: encryption vs hashing -->
  <section>
    <div class="sec-h"><span class="num">٤</span><h2>التشفير مقابل البصمة (Hashing)</h2><span class="e">vs HASHING</span></div>
    <div class="two">
      <div class="col enc"><h3>🔐 التشفير</h3><ul>
        <li>قابل للعكس (بالمفتاح)</li><li>الهدف: السرية</li><li>مثال: AES، RSA</li></ul></div>
      <div class="col hash"><h3>🔎 البصمة (Hashing)</h3><ul>
        <li>غير قابل للعكس أبداً</li><li>الهدف: التحقق من السلامة</li><li>مثال: SHA-256، SHA-3</li></ul></div>
    </div>
    <div class="box warn"><div class="bt">⚠️ الخطأ الشائع</div>
      الناس تخلط بين التشفير والـ Hashing — الـ Hash <b>لا يُفكّ</b>، بل <b>يُقارَن</b> فقط.</div>
  </section>

  <!-- 5: comparison -->
  <section>
    <div class="sec-h"><span class="num">٥</span><h2>مقارنة الخوارزميات السبع</h2><span class="e">COMPARISON</span></div>
    <table>
      <tr><th>الخوارزمية</th><th>النوع</th><th>حجم المفتاح</th><th>السرعة</th><th>الاستخدام</th><th>الحالة</th></tr>
      <tr><td class="algo">AES-256-GCM</td><td>متماثل</td><td>32 بايت</td><td class="ok-c">⚡⚡⚡</td><td>واتساب، جيميل</td><td class="ok-c">✅</td></tr>
      <tr><td class="algo">RSA-2048</td><td>غير متماثل</td><td>2048 بت</td><td class="warn-c">🐢</td><td>HTTPS، SSH</td><td class="ok-c">✅</td></tr>
      <tr><td class="algo">ChaCha20</td><td>متماثل</td><td>32 بايت</td><td class="ok-c">⚡⚡⚡⚡</td><td>Signal، VPN</td><td class="ok-c">✅</td></tr>
      <tr><td class="algo">Triple-DES</td><td>متماثل</td><td>24 بايت</td><td class="warn-c">⚡</td><td>أنظمة قديمة</td><td class="warn-c">⚠️</td></tr>
      <tr><td class="algo">Camellia-256</td><td>متماثل</td><td>32 بايت</td><td class="ok-c">⚡⚡⚡</td><td>ISO/IEC، اليابان</td><td class="ok-c">✅</td></tr>
      <tr><td class="algo">AES-CBC+HMAC</td><td>متماثل</td><td>32 بايت</td><td class="ok-c">⚡⚡⚡</td><td>تعليمي</td><td class="ok-c">✅</td></tr>
      <tr><td class="algo">Fernet</td><td>متماثل</td><td>32 بايت</td><td class="ok-c">⚡⚡⚡</td><td>تطبيقات Python</td><td class="ok-c">✅</td></tr>
    </table>
  </section>

  <!-- 6: algorithms detail -->
  <section>
    <div class="sec-h"><span class="num">٦</span><h2>الخوارزميات بالتفصيل — الفكرة وطريقة العمل</h2><span class="e">HOW THEY WORK</span></div>
    <div class="algos">{algos_html}</div>
  </section>

  <!-- 7: closing -->
  <section>
    <div class="sec-h"><span class="num">٧</span><h2>جُمَل ختامية تقولها للحضور</h2><span class="e">CLOSING</span></div>
    <div class="box tip"><div class="bt">🎤 1</div>
      الفكرة المحورية لكل الخوارزميات واحدة: <b>مفتاح قوي مشتق بـ PBKDF2</b> + <b>عشوائية لكل عملية (salt/nonce)</b> + <b>تحقّق من السلامة (tag/HMAC)</b>.</div>
    <div class="box tip"><div class="bt">🎤 2</div>
      المتماثل سريع للبيانات، وغير المتماثل (RSA) لتبادل المفاتيح — ولهذا نجمعهما في <b>التشفير الهجين</b>.</div>
    <div class="box tip"><div class="bt">🎤 3</div>
      الفرق الجوهري بين التشفير والـ Hashing: الأول يُعكس بالمفتاح، والثاني باتجاه واحد للتحقق فقط.</div>
  </section>

  <div class="foot">تشفير · Tashfeer — حسين حامد الكوافي · 642</div>
</div></body></html>"""

pathlib.Path("Tashfeer_Summary.html").write_text(HTML, encoding="utf-8")
print("✓ Created: Tashfeer_Summary.html  (", len(HTML.encode()), "bytes )")
