// طبقة الاتصال بالـ API
const API = (function () {
  async function handle(res) {
    let body;
    try {
      body = await res.json();
    } catch (e) {
      throw new Error('استجابة غير صالحة من الخادم');
    }
    if (!res.ok || body.ok === false) {
      throw new Error(body.error || 'حدث خطأ');
    }
    return body;
  }

  async function listAlgorithms() {
    const res = await fetch('/api/algorithms');
    const body = await handle(res);
    return body.algorithms;
  }

  async function generateRsaKeys() {
    const res = await fetch('/api/keys/rsa', { method: 'POST' });
    return handle(res);
  }

  // التشفير عبر multipart/form-data
  async function encrypt(type, formData) {
    const res = await fetch('/api/encrypt/' + type, {
      method: 'POST',
      body: formData,
    });
    return handle(res);
  }

  // فك التشفير عبر application/json
  async function decrypt(type, payloadObj) {
    const res = await fetch('/api/decrypt/' + type, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadObj),
    });
    return handle(res);
  }

  return { listAlgorithms, generateRsaKeys, encrypt, decrypt };
})();
