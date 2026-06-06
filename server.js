'use strict';

const path = require('path');
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const encryptionRoutes = require('./src/routes/encryption');
const keysRoutes = require('./src/routes/keys');
const algorithmsRoutes = require('./src/routes/algorithms');
const errorHandler = require('./src/middleware/errorHandler');

function createApp() {
  const app = express();

  // أمان الرؤوس مع سياسة محتوى تسمح بأصول الواجهة المحلية فقط
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'blob:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'", 'data:'],
        },
      },
    })
  );

  // البيانات تُرسل كـ base64 لذا نرفع حد JSON إلى 100mb
  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ extended: true, limit: '100mb' }));

  // تحديد معدّل الطلبات
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 دقيقة
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { ok: false, error: 'عدد كبير من الطلبات، حاول لاحقًا' },
  });
  app.use('/api/', limiter);

  // الواجهة الثابتة
  app.use(express.static(path.join(__dirname, 'public')));

  // الراوترات
  app.use('/api', encryptionRoutes);
  app.use('/api/keys', keysRoutes);
  app.use('/api/algorithms', algorithmsRoutes);

  // فحص صحة الخادم
  app.get('/api/health', (req, res) => res.json({ ok: true, status: 'up' }));

  // معالج الأخطاء (أخيرًا)
  app.use(errorHandler);

  return app;
}

// تشغيل الخادم؛ تُصدَّر لاستدعائها من Electron أيضًا.
function start(port = process.env.PORT || 3000) {
  return new Promise((resolve) => {
    const app = createApp();
    const server = app.listen(port, () => {
      const actualPort = server.address().port;
      console.log(`CipherForge يعمل على http://localhost:${actualPort}`);
      resolve(server);
    });
  });
}

// تشغيل مباشر عبر `node server.js`
if (require.main === module) {
  start();
}

module.exports = { createApp, start };
