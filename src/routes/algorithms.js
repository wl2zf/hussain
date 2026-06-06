'use strict';

const express = require('express');
const { ALGORITHMS } = require('../utils/constants');

const router = express.Router();

// قائمة الخوارزميات المتاحة وأوصافها (تستهلكها الواجهة لبناء القائمة).
router.get('/', (req, res) => {
  res.json({ ok: true, algorithms: ALGORITHMS });
});

module.exports = router;
