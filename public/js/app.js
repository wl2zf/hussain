// منطق الواجهة الرئيسي
(function () {
  const el = (id) => document.getElementById(id);

  const algoList = el('algoList');
  const algoDesc = el('algoDesc');
  const textPane = el('textPane');
  const filePane = el('filePane');
  const passwordPane = el('passwordPane');
  const rsaPane = el('rsaPane');
  const textInput = el('textInput');
  const fileInput = el('fileInput');
  const passwordInput = el('passwordInput');
  const publicKey = el('publicKey');
  const privateKey = el('privateKey');
  const resultPane = el('resultPane');
  const resultOutput = el('resultOutput');
  const statusBox = el('status');

  let algorithms = [];
  let selected = null; // كائن الخوارزمية المختارة
  let mode = 'text'; // text | file
  let lastFileResult = null; // { base64, filename } لتحميل ملف مفكوك

  function setStatus(msg, kind) {
    statusBox.textContent = msg || '';
    statusBox.className = 'status' + (kind ? ' ' + kind : '');
  }

  function selectAlgorithm(algo) {
    selected = algo;
    [...algoList.children].forEach((c) =>
      c.classList.toggle('selected', c.dataset.id === algo.id)
    );
    algoDesc.textContent = algo.description;
    // إظهار حقول السرّ المناسبة
    const usesKeys = algo.auth === 'keys';
    rsaPane.classList.toggle('hidden', !usesKeys);
    passwordPane.classList.toggle('hidden', usesKeys);
  }

  function renderAlgorithms() {
    algoList.innerHTML = '';
    algorithms.forEach((algo) => {
      const card = document.createElement('div');
      card.className = 'algo-card';
      card.dataset.id = algo.id;
      card.textContent = algo.label;
      card.addEventListener('click', () => selectAlgorithm(algo));
      algoList.appendChild(card);
    });
    if (algorithms.length) selectAlgorithm(algorithms[0]);
  }

  function setMode(next) {
    mode = next;
    document
      .querySelectorAll('.tab')
      .forEach((t) => t.classList.toggle('active', t.dataset.mode === next));
    textPane.classList.toggle('hidden', next !== 'text');
    filePane.classList.toggle('hidden', next !== 'file');
  }

  function showTextResult(text) {
    lastFileResult = null;
    resultPane.classList.remove('hidden');
    resultOutput.value = text;
  }

  function showFileResult(base64, filename) {
    lastFileResult = { base64, filename };
    resultPane.classList.remove('hidden');
    resultOutput.value =
      'تم فكّ الملف بنجاح: ' + filename + '\nاضغطي «تحميل» لحفظه.';
  }

  function base64ToBlob(base64) {
    const bin = atob(base64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new Blob([bytes], { type: 'application/octet-stream' });
  }

  function download(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function getSecretFields() {
    if (selected.auth === 'keys') {
      return { publicKey: publicKey.value.trim(), privateKey: privateKey.value.trim() };
    }
    return { password: passwordInput.value };
  }

  // ===== التشفير =====
  async function doEncrypt() {
    try {
      if (!selected) return;
      setStatus('جارٍ التشفير...', 'busy');
      const fd = new FormData();
      fd.append('algorithm', selected.id);

      const secret = getSecretFields();
      if (selected.auth === 'keys') {
        if (!secret.publicKey) throw new Error('المفتاح العام مطلوب للتشفير');
        fd.append('publicKey', secret.publicKey);
      } else {
        if (!secret.password) throw new Error('كلمة المرور مطلوبة');
        fd.append('password', secret.password);
      }

      let type;
      if (mode === 'file') {
        if (!fileInput.files.length) throw new Error('اختاري ملفًا أولًا');
        fd.append('file', fileInput.files[0]);
        type = 'file';
      } else {
        if (!textInput.value) throw new Error('أدخلي نصًا أولًا');
        fd.append('text', textInput.value);
        type = 'text';
      }

      const body = await API.encrypt(type, fd);
      showTextResult(body.result);
      setStatus('تم التشفير بنجاح ✦', 'ok');
    } catch (e) {
      setStatus(e.message, 'err');
    }
  }

  // ===== فك التشفير =====
  async function doDecrypt() {
    try {
      if (!selected) return;
      setStatus('جارٍ فك التشفير...', 'busy');

      // المغلّف المشفّر يؤخذ دائمًا من خانة النص (الصق النص المشفّر)
      const payload = textInput.value.trim();
      if (!payload) throw new Error('الصقي النص المشفّر في خانة النص أولًا');

      const reqBody = { algorithm: selected.id, payload };
      const secret = getSecretFields();
      if (selected.auth === 'keys') {
        if (!secret.privateKey) throw new Error('المفتاح الخاص مطلوب لفك التشفير');
        reqBody.privateKey = secret.privateKey;
      } else {
        if (!secret.password) throw new Error('كلمة المرور مطلوبة');
        reqBody.password = secret.password;
      }

      const body = await API.decrypt('text', reqBody);
      if (body.kind === 'file') {
        showFileResult(body.result, body.filename);
      } else {
        showTextResult(body.result);
      }
      setStatus('تم فك التشفير بنجاح ✦', 'ok');
    } catch (e) {
      setStatus(e.message, 'err');
    }
  }

  // ===== توليد مفاتيح RSA =====
  async function genKeys() {
    try {
      setStatus('جارٍ توليد المفاتيح...', 'busy');
      const body = await API.generateRsaKeys();
      publicKey.value = body.publicKey;
      privateKey.value = body.privateKey;
      setStatus('تم توليد زوج مفاتيح RSA ✦', 'ok');
    } catch (e) {
      setStatus(e.message, 'err');
    }
  }

  // ===== أدوات النتيجة =====
  async function copyResult() {
    try {
      await navigator.clipboard.writeText(resultOutput.value);
      setStatus('تم النسخ 📋', 'ok');
    } catch (e) {
      setStatus('تعذّر النسخ', 'err');
    }
  }

  function downloadResult() {
    if (lastFileResult) {
      download(base64ToBlob(lastFileResult.base64), lastFileResult.filename);
    } else {
      const blob = new Blob([resultOutput.value], { type: 'text/plain' });
      download(blob, 'cipherforge-result.txt');
    }
  }

  // ===== الربط =====
  function bind() {
    document
      .querySelectorAll('.tab')
      .forEach((t) => t.addEventListener('click', () => setMode(t.dataset.mode)));
    el('encryptBtn').addEventListener('click', doEncrypt);
    el('decryptBtn').addEventListener('click', doDecrypt);
    el('genKeysBtn').addEventListener('click', genKeys);
    el('copyBtn').addEventListener('click', copyResult);
    el('downloadBtn').addEventListener('click', downloadResult);
  }

  async function init() {
    bind();
    try {
      algorithms = await API.listAlgorithms();
      renderAlgorithms();
    } catch (e) {
      setStatus('تعذّر تحميل قائمة الخوارزميات', 'err');
    }
  }

  init();
})();
