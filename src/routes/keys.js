'use strict';

const express = require('express');
const { rsaOaep } = require('../services');

const router = express.Router();

// توليد زوج مفاتيح RSA-2048 جديد (PEM).
router.post('/rsa', (req, res, next) => {
  try {
    const { publicKey, privateKey } = rsaOaep.generateKeyPair();
    res.json({ ok: true, publicKey, privateKey });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
