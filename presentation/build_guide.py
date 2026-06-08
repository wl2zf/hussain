#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Build a personal study / presenter guide (PDF) for the Tashfeer project.

It explains every algorithm and its code line-by-line in Arabic, with
talking points and likely Q&A — so the student can learn it and present it.

Output: Tashfeer_Study_Guide.pdf
Run:    /tmp/pdfv/bin/python build_guide.py
"""
import base64
import html
import re
import pathlib

from weasyprint import HTML

FONTS = pathlib.Path("fonts")


def b64(p):
    return base64.b64encode((FONTS / p).read_bytes()).decode()


TAJ_R = b64("Tajawal-Regular.ttf")
TAJ_B = b64("Tajawal-Bold.ttf")
JBM_R = b64("JetBrainsMono-Regular.ttf")
JBM_B = b64("JetBrainsMono-Bold.ttf")

# --------------------------------------------------------------------------- #
# Minimal Python syntax highlighter -> HTML spans
# --------------------------------------------------------------------------- #
KEYWORDS = {
    "from", "import", "def", "return", "None", "True", "False", "for", "in",
    "if", "else", "elif", "with", "as", "class", "and", "or", "not", "lambda",
    "try", "except", "raise", "while",
}
TOKEN_RE = re.compile(
    r"(?P<comment>\#[^\n]*)"
    r"|(?P<string>'[^'\n]*'|\"[^\"\n]*\")"
    r"|(?P<number>\b\d[\d_]*\b)"
    r"|(?P<name>[A-Za-z_]\w*)"
    r"|(?P<other>.)",
    re.S,
)


def highlight(code: str) -> str:
    out = []
    for m in TOKEN_RE.finditer(code):
        kind, val = m.lastgroup, m.group()
        esc = html.escape(val)
        if kind == "comment":
            out.append(f'<span class="c">{esc}</span>')
        elif kind == "string":
            out.append(f'<span class="s">{esc}</span>')
        elif kind == "number":
            out.append(f'<span class="n">{esc}</span>')
        elif kind == "name" and val in KEYWORDS:
            out.append(f'<span class="k">{esc}</span>')
        else:
            out.append(esc)
    return "".join(out)


# --------------------------------------------------------------------------- #
# Small HTML helpers
# --------------------------------------------------------------------------- #
def code_block(code: str, caption: str = "") -> str:
    cap = f'<div class="code-cap">{caption}</div>' if caption else ""
    return f'{cap}<pre class="code">{highlight(code)}</pre>'


def steps(items) -> str:
    lis = "".join(f"<li>{t}</li>" for t in items)
    return f'<ol class="steps">{lis}</ol>'


def bullets(items) -> str:
    lis = "".join(f"<li>{t}</li>" for t in items)
    return f'<ul class="bul">{lis}</ul>'


def box(kind, title, body) -> str:
    icon = {"concept": "💡", "warn": "⚠️", "tip": "🎤", "note": "📌"}[kind]
    return (f'<div class="box {kind}"><div class="box-t">{icon} {title}</div>'
            f'<div class="box-b">{body}</div></div>')


def qa(pairs) -> str:
    rows = ""
    for q, a in pairs:
        rows += (f'<div class="qa"><div class="q">س: {q}</div>'
                 f'<div class="a">ج: {a}</div></div>')
    return rows


# --------------------------------------------------------------------------- #
# CSS
# --------------------------------------------------------------------------- #
CSS = f"""
@font-face {{ font-family:'Taj'; font-weight:400; src:url(data:font/ttf;base64,{TAJ_R}); }}
@font-face {{ font-family:'Taj'; font-weight:700; src:url(data:font/ttf;base64,{TAJ_B}); }}
@font-face {{ font-family:'JBM'; font-weight:400; src:url(data:font/ttf;base64,{JBM_R}); }}
@font-face {{ font-family:'JBM'; font-weight:700; src:url(data:font/ttf;base64,{JBM_B}); }}

@page {{
  size: A4; margin: 17mm 15mm 18mm 15mm;
  @bottom-center {{ content: counter(page);
    font-family:'JBM'; font-size:8.5pt; color:#9a9ab0; }}
  @top-left {{ content: "تشفير · Tashfeer"; font-family:'Taj'; font-size:8pt; color:#b9b9c8; }}
  @top-right {{ content: "حسين حامد الكوافي · 642"; font-family:'Taj'; font-size:8pt; color:#b9b9c8; }}
}}
@page cover {{ margin:0; @bottom-center{{content:none}} @top-left{{content:none}} @top-right{{content:none}} }}

* {{ box-sizing:border-box; }}
body {{ font-family:'Taj'; direction:rtl; color:#1b1b2b; font-size:11.2pt; line-height:1.75; }}

h2 {{ font-size:17pt; color:#5b4ddb; margin:0 0 8px; padding-bottom:6px;
      border-bottom:2px solid #ece9ff; }}
h2 .num {{ display:inline-block; background:#7c6aff; color:#fff; font-family:'JBM';
      font-size:11pt; border-radius:6px; padding:1px 9px; margin-left:8px; }}
h3 {{ font-size:13.5pt; color:#15152a; margin:16px 0 6px; }}
h3 .en {{ font-family:'JBM'; font-size:9.5pt; color:#8a8aa0; font-weight:400; }}
p {{ margin:6px 0; }}
.lead {{ color:#3a3a52; }}
.section {{ break-before:page; }}

/* callout boxes (RTL -> border on the right) */
.box {{ border-radius:10px; padding:10px 14px 10px 14px; margin:12px 0;
        border-right:4px solid #ccc; background:#f7f7fb; }}
.box-t {{ font-weight:700; margin-bottom:3px; font-size:11.5pt; }}
.box-b {{ font-size:10.8pt; color:#2b2b40; }}
.box.concept {{ background:#eef9f4; border-right-color:#00c896; }}
.box.concept .box-t {{ color:#048a64; }}
.box.warn {{ background:#fdeeee; border-right-color:#ff6b6b; }}
.box.warn .box-t {{ color:#cc3a3a; }}
.box.tip {{ background:#f0edff; border-right-color:#7c6aff; }}
.box.tip .box-t {{ color:#5b4ddb; }}
.box.note {{ background:#f3f4f7; border-right-color:#9a9ab0; }}
.box.note .box-t {{ color:#55556a; }}

/* code */
.code-cap {{ font-family:'JBM'; font-size:8.5pt; color:#00a87e; direction:ltr;
   text-align:left; background:#0f0f17; border-radius:8px 8px 0 0; padding:5px 12px;
   border:1px solid #2a2a3a; border-bottom:none; }}
pre.code {{ direction:ltr; text-align:left; background:#13131f; color:#e8e8f2;
   font-family:'JBM'; font-size:9pt; line-height:1.55; padding:11px 13px;
   border-radius:8px; border:1px solid #2a2a3a; margin:0 0 10px; white-space:pre-wrap;
   word-break:break-word; }}
.code-cap + pre.code {{ border-radius:0 0 8px 8px; }}
pre.code .c {{ color:#5fd2a8; }}     /* comments */
pre.code .s {{ color:#e5b567; }}     /* strings  */
pre.code .n {{ color:#7fdbca; }}     /* numbers  */
pre.code .k {{ color:#b3a7ff; font-weight:700; }} /* keywords */

ol.steps {{ margin:6px 22px 12px 0; padding:0; }}
ol.steps li {{ margin:5px 0; padding-right:4px; }}
ol.steps li::marker {{ color:#7c6aff; font-weight:700; font-family:'JBM'; }}
ul.bul {{ margin:6px 22px 12px 0; padding:0; }}
ul.bul li {{ margin:4px 0; }}
ul.bul li::marker {{ color:#00c896; }}

/* tables */
table {{ width:100%; border-collapse:collapse; margin:10px 0; font-size:10.2pt; }}
th {{ background:#7c6aff; color:#fff; font-weight:700; padding:7px 9px; }}
td {{ border:1px solid #e3e3ee; padding:6px 9px; }}
tr:nth-child(even) td {{ background:#f7f7fb; }}
.mono {{ font-family:'JBM'; font-size:9.4pt; direction:ltr; unicode-bidi:embed; }}
.green {{ color:#048a64; font-weight:700; }}
.red {{ color:#cc3a3a; font-weight:700; }}

/* Q&A */
.qa {{ margin:8px 0; padding:8px 12px; background:#f7f7fb; border-radius:8px; }}
.qa .q {{ font-weight:700; color:#5b4ddb; }}
.qa .a {{ color:#2b2b40; margin-top:2px; }}

/* cover */
.cover {{ page:cover; background:#0d0d14; color:#dddde8; height:297mm;
   padding:70mm 14mm 0; position:relative; }}
.cover .wrap {{ text-align:center; }}
.cover .lock {{ font-size:46pt; }}
.cover .ar {{ font-size:54pt; font-weight:700; color:#7c6aff; margin:4px 0; }}
.cover .en {{ font-family:'JBM'; font-size:15pt; color:#00c896; letter-spacing:7px; }}
.cover .sub {{ font-size:14pt; color:#9a9ab0; margin-top:14px; }}
.cover .card {{ margin:24mm auto 0; width:150mm; background:#13131f;
   border:1px solid #2a2a3a; border-radius:14px; padding:16px 22px; }}
.cover .card .row {{ font-size:13pt; margin:5px 0; }}
.cover .card .lbl {{ color:#8a8aa0; }}
.cover .card .val {{ color:#dddde8; font-weight:700; }}
.cover .card .id {{ font-family:'JBM'; color:#00c896; font-weight:700; }}
.cover .foot {{ position:absolute; bottom:22mm; left:0; right:0; text-align:center;
   font-family:'JBM'; font-size:9.5pt; color:#55556a; }}
.toc li {{ margin:6px 0; }}
.toc .mono {{ color:#7c6aff; }}
"""

# --------------------------------------------------------------------------- #
# Content
# --------------------------------------------------------------------------- #
cover = """
<div class="cover">
  <div class="wrap">
    <div class="lock">🔐</div>
    <div class="ar">تشفير</div>
    <div class="en">T A S H F E E R</div>
    <div class="sub">دليل المذاكرة والشرح — كيف تفهم الكود وتشرحه</div>
    <div class="card">
      <div class="row"><span class="lbl">الطالب: </span><span class="val">حسين حامد الكوافي</span></div>
      <div class="row"><span class="lbl">الرقم الدراسي: </span><span class="id">642</span></div>
      <div class="row"><span class="lbl">المقرر: </span><span class="val">Cybersecurity — Encryption Algorithms</span></div>
    </div>
  </div>
  <div class="foot">مستند شخصي للتحضير · يشرح الكود سطراً بسطر + نقاط الإلقاء + أسئلة متوقعة</div>
</div>
"""

# ---- Section 0: TOC + overview ----
overview = f"""
<div>
  <h2><span class="num">0</span> نظرة عامة وكيف تستخدم هذا الدليل</h2>
  <p class="lead">هذا المستند مُعدّ لك أنت لتذاكر منه قبل العرض. لكل خوارزمية: شرح
  مبسّط للفكرة، ثم الكود مع تفسير كل سطر، ثم «ماذا تقول للحضور»، ثم سؤال متوقع وإجابته.
  احفظ الأفكار لا الكلمات — لو فهمت <b>لماذا</b> كل سطر موجود، تقدر تشرحه بثقة.</p>

  {box("note", "بنية المشروع باختصار",
       "التطبيق يتكوّن من ملف خادم واحد <span class='mono'>app.py</span> مبني بـ Flask "
       "يقوم بكل عمليات التشفير، وواجهة واحدة <span class='mono'>templates/index.html</span> "
       "(HTML+CSS+JS). المستخدم يفتح <span class='mono'>localhost:5000</span>، يختار خوارزمية، "
       "يُدخل نصاً أو ملفاً، يُدخل كلمة مرور (أو مفاتيح RSA)، فيحصل على ناتج مشفّر يقدر يفكّه لاحقاً.")}

  <h3>مسار البيانات داخل التطبيق <span class="en">data flow</span></h3>
  {code_block('المتصفح (واجهة) → POST /encrypt → دالة التشفير في app.py → Base64 أو ملف → المتصفح', '')}
  <p>الواجهة لا تُشفّر شيئاً؛ كل التشفير يحدث في الخادم بلغة Python باستخدام مكتبة
  <span class="mono">cryptography</span> فقط.</p>

  {box("tip", "جملة افتتاحية تقولها للدكتور",
       "«بنيتُ أداة اسمها تشفير تدعم أربع خوارزميات تشفير حقيقية: AES و RSA و ChaCha20 و "
       "Triple-DES، مع واجهة ويب عربية. سأشرح فكرة كل خوارزمية ثم الكود الذي ينفّذها.»")}
</div>
"""

# ---- Section 1: core concepts ----
concepts = f"""
<div class="section">
  <h2><span class="num">1</span> مفاهيم لازم تتقنها قبل الشرح</h2>
  <p class="lead">لو فهمت هذه الكلمات الست، تقدر تشرح أي خوارزمية. كلها تتكرر في الكود.</p>

  <h3>متماثل مقابل غير متماثل <span class="en">symmetric vs asymmetric</span></h3>
  {bullets([
    "<b>متماثل (Symmetric):</b> مفتاح واحد يُستخدم للتشفير وفك التشفير. سريع. مثل: AES, ChaCha20, 3DES.",
    "<b>غير متماثل (Asymmetric):</b> مفتاحان مرتبطان — عام (يُشارَك، يُشفّر) وخاص (سرّي، يفكّ). أبطأ. مثل: RSA.",
  ])}

  <h3>اشتقاق المفتاح <span class="en">PBKDF2</span></h3>
  {box("concept", "الفكرة ببساطة",
       "كلمة المرور التي يكتبها المستخدم (مثل <span class='mono'>p@ss</span>) ضعيفة وقصيرة. "
       "<b>PBKDF2</b> يحوّلها إلى مفتاح قوي بطول ثابت عبر تكرار دالة التجزئة SHA-256 مئة ألف مرة. "
       "التكرار الكثيف يجعل تخمين كلمة المرور بطيئاً جداً على المهاجم.")}

  <h3>الملح والـ Nonce ووسم التحقق <span class="en">salt · nonce/iv · tag</span></h3>
  {bullets([
    "<b>Salt (ملح):</b> 16 بايت عشوائية تدخل في اشتقاق المفتاح. تضمن أن نفس كلمة المرور تُنتج مفتاحاً مختلفاً كل مرة، وتُبطل جداول القرصنة الجاهزة (rainbow tables).",
    "<b>Nonce / IV:</b> قيمة عشوائية تُستخدم مرة واحدة لكل عملية تشفير. تضمن أن نفس النص لا يُنتج نفس الشيفرة مرتين. (في 3DES نسمّيها IV).",
    "<b>Tag (وسم تحقق):</b> بصمة تُنتجها أوضاع GCM و Poly1305 تكشف أي تلاعب بالشيفرة؛ لو تغيّر بايت واحد يفشل فك التشفير.",
  ])}

  <h3>Base64 والتشفير الهجين</h3>
  {bullets([
    "<b>Base64:</b> ليست تشفيراً، بل تحويل بايتات إلى نص قابل للنسخ واللصق (أحرف وأرقام). نستخدمها لإظهار الناتج المشفّر كنص.",
    "<b>Hybrid (هجين):</b> RSA لا يشفّر بيانات كبيرة، فنولّد مفتاح AES عشوائياً، نشفّر البيانات بـ AES، ونشفّر مفتاح AES فقط بـ RSA. وهكذا يعمل RSA مع أي حجم.",
  ])}

  {box("tip", "سؤال ذكي قد يسأله الدكتور",
       "«لماذا الملح والـ nonce؟» جوابك: «لمنع التكرار — بدونهما، تشفير نفس الرسالة بنفس "
       "المفتاح يُنتج دائماً نفس الشيفرة، وهذا تسريب معلومات يستغلّه المهاجم.»")}
</div>
"""


def algo_section(num, title_ar, title_en, idea_html, code, caption, lines, talk, qapairs, extra=""):
    line_items = "".join(
        f'<tr><td class="mono" style="text-align:center;width:42px">{i+1}</td><td>{t}</td></tr>'
        for i, t in enumerate(lines)
    )
    return f"""
<div class="section">
  <h2><span class="num">{num}</span> {title_ar} <span class="en">{title_en}</span></h2>
  {idea_html}
  <h3>الكود <span class="en">the code</span></h3>
  {code_block(code, caption)}
  <h3>شرح كل سطر <span class="en">line by line</span></h3>
  <table><tr><th style="width:42px">#</th><th>ماذا يفعل</th></tr>{line_items}</table>
  {extra}
  {box("tip", "ماذا تقول للحضور", talk)}
  <h3>أسئلة متوقعة <span class="en">likely questions</span></h3>
  {qa(qapairs)}
</div>
"""


aes = algo_section(
    2, "AES-256-GCM", "symmetric · authenticated",
    box("concept", "الفكرة",
        "أقوى وأشهر تشفير متماثل. «256» يعني طول المفتاح بالبت. وضع «GCM» مميّز لأنه "
        "يجمع بين <b>السرية</b> (إخفاء المحتوى) و<b>السلامة</b> (كشف التلاعب) في خطوة واحدة عبر وسم التحقق."),
    """salt  = os.urandom(16)
key   = PBKDF2HMAC(SHA256(), 32, salt, 100_000).derive(password)
nonce = os.urandom(12)
ct    = AESGCM(key).encrypt(nonce, data, None)
return base64.b64encode(salt + nonce + ct)""",
    "AES-256-GCM · encrypt",
    [
        "نولّد ملحاً عشوائياً 16 بايت لهذه العملية تحديداً.",
        "نشتق مفتاحاً طوله 32 بايت (256 بت) من كلمة المرور عبر PBKDF2 بـ100,000 تكرار باستخدام الملح.",
        "نولّد nonce عشوائياً 12 بايت — يُستخدم مرة واحدة فقط مع هذا المفتاح.",
        "AESGCM يشفّر البيانات وفي نفس الخطوة يُلحق وسم التحقق (tag) بالشيفرة تلقائياً.",
        "نجمع الأجزاء (ملح + nonce + شيفرة) ونحوّلها Base64 لتصبح نصاً واحداً قابلاً للنقل.",
    ],
    "«AES هو المعيار الذهبي. ألاحظ أنني لا أخزّن المفتاح؛ أشتقّه من كلمة المرور وقت الحاجة. "
    "ولأن الملح والـ nonce عشوائيان، تشفير نفس النص مرتين يُعطي نتيجتين مختلفتين — وهذا مطلوب أمنياً.»",
    [
        ("لماذا 100,000 تكرار؟", "لإبطاء أي محاولة تخمين لكلمة المرور؛ كل تكرار يضيف تكلفة حسابية على المهاجم لكنه غير ملحوظ للمستخدم."),
        ("ماذا لو أدخل المستخدم كلمة مرور خاطئة عند الفك؟", "يفشل التحقق من الـ tag فترمي المكتبة استثناء InvalidTag، ونحن نلتقطه ونُرجع رسالة خطأ واضحة بدل أن ينهار البرنامج."),
        ("كيف يعرف برنامج الفك أين ينتهي الملح ويبدأ الـ nonce؟", "بالأطوال الثابتة: أول 16 بايت ملح، التالية 12 nonce، والباقي شيفرة."),
    ],
    extra=box("note", "عند فك التشفير",
              "نعكس العملية: نفصل الأجزاء بنفس الأطوال، نعيد اشتقاق المفتاح بنفس الملح، "
              "ثم <span class='mono'>AESGCM(key).decrypt(nonce, ct, None)</span> يتحقق من الوسم ويُعيد النص الأصلي."),
)

rsa = algo_section(
    3, "RSA-2048", "asymmetric · two keys",
    box("concept", "الفكرة",
        "تشفير بمفتاحين: المفتاح <b>العام</b> يُشارَك مع الجميع ويُستخدم للتشفير فقط، والمفتاح "
        "<b>الخاص</b> سرّي ويُستخدم لفك التشفير. يحلّ مشكلة «كيف أرسل لك سرّاً دون أن نتفق على كلمة مرور مسبقاً»."),
    """priv = rsa.generate_private_key(public_exponent=65537, key_size=2048)
pub  = priv.public_key()
# Hybrid: نشفّر البيانات بـ AES ونشفّر مفتاح AES بـ RSA
aes_key = os.urandom(32)
ct      = AESGCM(aes_key).encrypt(nonce, data, None)
enc_key = pub.encrypt(aes_key, OAEP(MGF1(SHA256()), SHA256()))
return base64.b64encode(len(enc_key) + enc_key + nonce + ct)""",
    "RSA-2048 + Hybrid · encrypt",
    [
        "نولّد المفتاح الخاص (2048 بت) بأسّ عام قياسي 65537.",
        "نشتق المفتاح العام من الخاص — العام يُشتق من الخاص وليس العكس.",
        "التشفير الهجين: نولّد مفتاح AES عشوائياً 32 بايت لتشفير البيانات الفعلية.",
        "نشفّر البيانات بـ AES-GCM السريع (لأن RSA بطيء ومحدود الحجم).",
        "نشفّر مفتاح AES الصغير فقط باستخدام RSA-OAEP (حشو آمن مبني على SHA-256).",
        "نجمع: [طول المفتاح المشفّر] + المفتاح المشفّر + nonce + الشيفرة، ثم Base64.",
    ],
    "«RSA يستخدم مفتاحين. لأنه بطيء ولا يشفّر إلا بيانات صغيرة، طبّقت التشفير الهجين: "
    "البيانات تُشفّر بـ AES، ومفتاح AES وحده يُشفّر بـ RSA. هكذا يعمل النظام مع أي حجم نص أو ملف.»",
    [
        ("لماذا لم تشفّر الملف مباشرة بـ RSA؟", "لأن RSA-2048 لا يشفّر إلا ~190 بايت كحد أقصى وهو بطيء جداً؛ الحل القياسي عالمياً هو التشفير الهجين."),
        ("ما OAEP؟", "نظام حشو (padding) آمن يضيف عشوائية قبل تشفير RSA، فيمنع هجمات معروفة على RSA الخام."),
        ("أيهما تنشر وأيهما تخفي؟", "تنشر العام (Public) ليشفّر لك الناس، وتخفي الخاص (Private) لأنه وحده يفكّ. مشاركة الخاص تعني انكشاف كل شيء."),
    ],
)

chacha = algo_section(
    4, "ChaCha20-Poly1305", "stream cipher · fast",
    box("concept", "الفكرة",
        "تشفير انسيابي حديث سريع جداً بالبرمجيات، مع Poly1305 للتحقق من السلامة. "
        "تختاره تطبيقات الجوال وبروتوكول TLS عندما لا يوجد تسريع عتادي لـ AES في المعالج."),
    """salt  = os.urandom(16)
key   = PBKDF2HMAC(SHA256(), 32, salt, 100_000).derive(password)
nonce = os.urandom(12)
ct    = ChaCha20Poly1305(key).encrypt(nonce, data, None)
return base64.b64encode(salt + nonce + ct)""",
    "ChaCha20-Poly1305 · encrypt",
    [
        "ملح عشوائي 16 بايت كالمعتاد لاشتقاق المفتاح.",
        "نشتق مفتاح 32 بايت من كلمة المرور بـ PBKDF2 (نفس نمط AES تماماً).",
        "nonce عشوائي 12 بايت يُستخدم مرة واحدة.",
        "ChaCha20Poly1305 يشفّر ويُلحق وسم Poly1305 للتحقق — تماماً مثل GCM لكن بخوارزمية مختلفة.",
        "نجمع الأجزاء ونحوّلها Base64.",
    ],
    "«لاحظوا أن الكود شبه مطابق لـ AES — نفس فكرة الملح والـ nonce والوسم. الفرق أن ChaCha20 "
    "أسرع من AES على المعالجات التي لا تملك تسريعاً عتادياً، ولهذا يُستخدم في الجوّالات.»",
    [
        ("ما الفرق الجوهري عن AES؟", "AES تشفير كتلي (blocks) وغالباً مُسرّع عتادياً، بينما ChaCha20 انسيابي (stream) ومُحسّن للبرمجيات؛ كلاهما آمن وموصى به."),
        ("هل أقل أماناً لأنه أسرع؟", "لا، السرعة من تصميمه الرياضي لا من إضعاف الأمان؛ تعتمده Google و Cloudflare في الإنتاج."),
    ],
)

tdes = algo_section(
    5, "Triple-DES (3DES)", "legacy · educational",
    box("concept", "الفكرة",
        "يطبّق خوارزمية DES القديمة ثلاث مرات بمفتاح 24 بايت لزيادة قوّتها. موجود في المشروع "
        "<b>للتعليم فقط</b> ولفهم تطوّر التشفير — وليس للاستخدام الحقيقي."),
    """salt = os.urandom(16)
key  = PBKDF2HMAC(SHA256(), 24, salt, 100_000).derive(password)  # 24 bytes
iv   = os.urandom(8)
padded = PKCS7(64).padder().update(data) + finalize()
ct = Cipher(TripleDES(key), CBC(iv)).encryptor().update(padded)
return base64.b64encode(salt + iv + ct)""",
    "Triple-DES (CBC) · encrypt",
    [
        "ملح عشوائي 16 بايت.",
        "نشتق مفتاحاً طوله <b>24 بايت بالضبط</b> (هذا ما يتطلبه 3DES) عبر PBKDF2.",
        "IV عشوائي 8 بايت (حجم كتلة 3DES هو 64 بت = 8 بايت).",
        "نضيف حشو PKCS7 ليصبح طول البيانات مضاعفاً لحجم الكتلة (شرط أوضاع الكتل مثل CBC).",
        "نشفّر بوضع CBC حيث تُربط كل كتلة بالتي قبلها لإخفاء الأنماط.",
        "نجمع الملح + IV + الشيفرة ونحوّلها Base64.",
    ],
    "«أضفته لأغراض تعليمية. لاحظوا الاختلافات: المفتاح 24 بايت، وحجم الكتلة 8 بايت فيحتاج "
    "حشو PKCS7 ووضع CBC. لكنني أنبّه أنه قديم وبطيء وأُهمل رسمياً — الاستخدام الحقيقي يكون بـ AES.»",
    [
        ("لماذا يحتاج حشو (padding) وAES-GCM لا يحتاج؟", "لأن CBC وضع كتلي يتطلب طولاً مضاعفاً لحجم الكتلة، بينما GCM يعمل كتدفّق فلا يحتاج حشو."),
        ("لماذا 24 بايت تحديداً؟", "لأن 3DES يطبّق DES ثلاث مرات وكل مفتاح DES 8 بايت، 3×8=24."),
        ("هل آمن اليوم؟", "لا يُنصح به؛ NIST أهمله. نعرضه للمقارنة والفهم فقط."),
    ],
)

# ---- Section 6: how the app ties together ----
app_flow = f"""
<div class="section">
  <h2><span class="num">6</span> كيف يربط التطبيق كل شيء</h2>

  <h3>المسارات <span class="en">routes</span></h3>
  <table>
    <tr><th>المسار</th><th>الوظيفة</th></tr>
    <tr><td class="mono">GET /</td><td>يعرض الواجهة (index.html)</td></tr>
    <tr><td class="mono">POST /encrypt</td><td>يشفّر نصاً (يُرجع Base64) أو ملفاً (يُرجع تنزيلاً)</td></tr>
    <tr><td class="mono">POST /decrypt</td><td>يفكّ التشفير، نص أو ملف</td></tr>
    <tr><td class="mono">POST /generate-rsa-keys</td><td>يولّد زوج مفاتيح RSA ويُرجعهما</td></tr>
  </table>

  <h3>نص أم ملف؟ <span class="en">text vs file</span></h3>
  {bullets([
    "<b>نص:</b> النتيجة تُرجع كـ JSON يحوي سلسلة Base64 تظهر في الواجهة مع زر نسخ.",
    "<b>ملف:</b> يُحفظ الناتج باسم <span class='mono'>الاسم.tashfeer</span> ويُرسَل كتنزيل. عند الفك نُزيل اللاحقة لاستعادة الاسم الأصلي.",
    "الصور والصوت تُعامَل كملفات عادية، لكن الواجهة تعرض معاينة للصورة ومشغّلاً للصوت قبل التشفير.",
  ])}

  {box("note", "معالجة الأخطاء",
       "كل مسار محاط بـ <span class='mono'>try / except</span> ويُرجع دائماً JSON واضحاً أو ملفاً — "
       "لا يترك المستخدم أمام صفحة فارغة ولا ينهار الخادم. كلمة مرور خاطئة → رسالة خطأ مهذّبة.")}

  {box("tip", "كيف تختم الشرح التقني",
       "«كل الخوارزميات تتبع نفس النمط: اشتقاق مفتاح بـ PBKDF2 + قيمة عشوائية (salt/nonce) + "
       "تشفير + تجميع + Base64. لذلك الكود متناسق وسهل القراءة.»")}
</div>
"""

# ---- Section 7: live demo script ----
demo = f"""
<div class="section">
  <h2><span class="num">7</span> سيناريو العرض الحي — خطوة بخطوة</h2>
  <p class="lead">نفّذ هذه الخطوات أمام الحضور بالترتيب. كل خطوة مكتوب فيها ماذا تفعل وماذا تقول.</p>
  {steps([
    "<b>شغّل الخادم:</b> في الطرفية اكتب <span class='mono'>python app.py</span>. قل: «التطبيق يثبّت متطلباته تلقائياً أول مرة ثم يفتح المتصفح.»",
    "<b>افتح</b> <span class='mono'>localhost:5000</span> — اعرض الواجهة العربية وبدّل اللغة لإثبات دعم العربية والإنجليزية.",
    "<b>AES نص:</b> اختر AES، اكتب «رسالة سرية»، أدخل كلمة مرور، اضغط تشفير. اعرض الناتج Base64.",
    "<b>الفك:</b> انتقل لتبويب فك التشفير، الصق الناتج ونفس كلمة المرور → تظهر الرسالة الأصلية. قل: «نفس المفتاح يفك ويشفّر — هذا التماثل.»",
    "<b>كلمة مرور خاطئة:</b> جرّب فكّاً بكلمة مرور غلط → تظهر رسالة خطأ مهذّبة. قل: «وسم التحقق كشف التلاعب.»",
    "<b>RSA:</b> اختر RSA، اضغط «توليد مفاتيح»، اعرض المفتاحين، شفّر بالعام وافكّ بالخاص. قل: «مفتاحان مختلفان.»",
    "<b>صورة:</b> بتبويب الصور ارفع صورة (تظهر معاينة)، شفّرها ونزّل ملف <span class='mono'>.tashfeer</span> ثم افكّه واعرض الصورة سليمة.",
  ])}
  {box("warn", "احتياط قبل العرض",
       "جرّب كل خطوة مرة في غرفتك قبل العرض. جهّز كلمة مرور تتذكّرها، وافتح الطرفية والمتصفح مسبقاً لتوفير الوقت.")}
</div>
"""

# ---- Section 8: Q&A bank + glossary ----
final = f"""
<div class="section">
  <h2><span class="num">8</span> بنك الأسئلة المتوقعة من الدكتور</h2>
  {qa([
    ("ما الفرق بين التشفير والتجزئة (hashing)؟", "التشفير قابل للعكس باستخدام مفتاح، أما التجزئة (مثل SHA-256) فباتجاه واحد لا يُعكس. نستخدم SHA-256 هنا داخل PBKDF2 لاشتقاق المفتاح لا للتشفير."),
    ("لماذا استخدمت مكتبة cryptography ولم تكتب الخوارزميات بنفسك؟", "القاعدة الذهبية في الأمن: لا تبتكر تشفيرك. المكتبات المُدقّقة تتجنّب أخطاء دقيقة وخطيرة في التنفيذ."),
    ("أيّ خوارزمية تنصح بها للاستخدام الحقيقي؟", "AES-256-GCM أو ChaCha20-Poly1305 للتشفير المتماثل، و RSA لتبادل المفاتيح. تجنّب 3DES."),
    ("أين تُخزَّن كلمة المرور؟", "لا تُخزَّن أبداً. يُشتق منها المفتاح وقت العملية فقط ثم يُنسى. لهذا لا يمكن استرجاع البيانات لو نُسيت كلمة المرور."),
    ("ماذا يضمن أن الملف لم يُعبَث به؟", "وسم التحقق (GCM/Poly1305)؛ أي تعديل بايت واحد يجعل الفك يفشل."),
  ])}

  <h2 style="margin-top:18px"><span class="num">9</span> مسرد سريع <span class="en">glossary</span></h2>
  <table>
    <tr><th>المصطلح</th><th>المعنى المختصر</th></tr>
    <tr><td class="mono">AEAD</td><td>تشفير يوفّر السرية + التحقق معاً (GCM, Poly1305)</td></tr>
    <tr><td class="mono">PBKDF2</td><td>اشتقاق مفتاح قوي من كلمة مرور بالتكرار</td></tr>
    <tr><td class="mono">Salt</td><td>قيمة عشوائية تُفرّد اشتقاق المفتاح</td></tr>
    <tr><td class="mono">Nonce / IV</td><td>قيمة تُستخدم مرة واحدة لكل عملية تشفير</td></tr>
    <tr><td class="mono">Tag</td><td>بصمة تحقق تكشف التلاعب</td></tr>
    <tr><td class="mono">OAEP</td><td>حشو آمن لتشفير RSA</td></tr>
    <tr><td class="mono">Hybrid</td><td>RSA يغلّف مفتاح AES لتشفير أي حجم</td></tr>
    <tr><td class="mono">Base64</td><td>تمثيل البايتات كنص (ليس تشفيراً)</td></tr>
  </table>

  {box("tip", "جملة ختامية",
       "«شكراً لكم. الفكرة المحورية: مفتاح قوي مشتقّ من كلمة المرور + عشوائية لكل عملية + "
       "تحقق من السلامة = تشفير عملي وآمن. مستعدّ لأسئلتكم.»")}
</div>
"""

doc = f"<!doctype html><html lang='ar' dir='rtl'><head><meta charset='utf-8'><style>{CSS}</style></head><body>"
doc += cover + overview + concepts + aes + rsa + chacha + tdes + app_flow + demo + final
doc += "</body></html>"

HTML(string=doc).write_pdf("Tashfeer_Study_Guide.pdf")
print("✓ Created: Tashfeer_Study_Guide.pdf")
