const router = require('express').Router();
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const https = require('https');
const querystring = require('querystring');
const db = require('../config/db');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const BACKEND_URL  = process.env.BACKEND_URL  || 'http://localhost:3000';

// ─── Helper: tạo JWT và redirect về frontend ──────────────────────────────────
function sendTokenToFrontend(req, res, user) {
  if (!user) return res.redirect(`${FRONTEND_URL}/login?error=auth_failed`);

  const token = jwt.sign(
    { id: user.id, role_id: user.role_id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.redirect(
    `${FRONTEND_URL}/oauth-callback?token=${token}` +
    `&name=${encodeURIComponent(user.username)}&role=${user.role_id}`
  );
}

// ─── Helper dùng cho passport callback ───────────────────────────────────────
function handlePassportCallback(req, res) {
  sendTokenToFrontend(req, res, req.user);
}

// ══════════════════════════════════════════════════════════════════════
// GOOGLE
// ══════════════════════════════════════════════════════════════════════
if (process.env.GOOGLE_CLIENT_ID) {
  router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );
  router.get('/google/callback',
    passport.authenticate('google', {
      session: false,
      failureRedirect: `${FRONTEND_URL}/login?error=google_failed`,
    }),
    handlePassportCallback
  );
} else {
  router.get('/google', (_req, res) => {
    res.redirect(`${FRONTEND_URL}/login?error=google_not_configured`);
  });
}

// ══════════════════════════════════════════════════════════════════════
// FACEBOOK
// ══════════════════════════════════════════════════════════════════════
if (process.env.FACEBOOK_APP_ID) {
  router.get('/facebook',
    passport.authenticate('facebook', { scope: ['email'] })
  );
  router.get('/facebook/callback',
    passport.authenticate('facebook', {
      session: false,
      failureRedirect: `${FRONTEND_URL}/login?error=fb_failed`,
    }),
    handlePassportCallback
  );
} else {
  router.get('/facebook', (_req, res) => {
    res.redirect(`${FRONTEND_URL}/login?error=facebook_not_configured`);
  });
}

// ══════════════════════════════════════════════════════════════════════
// ZALO  (Manual OAuth 2.0 + PKCE — Zalo không có passport strategy)
// ══════════════════════════════════════════════════════════════════════
// Lưu code_verifier tạm trong memory (production nên dùng Redis/session)
const zaloStateStore = new Map();

router.get('/zalo', (req, res) => {
  if (!process.env.ZALO_APP_ID) {
    return res.redirect(`${FRONTEND_URL}/login?error=zalo_not_configured`);
  }

  // Tạo PKCE code_verifier & code_challenge
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');

  // State để chống CSRF
  const state = crypto.randomBytes(16).toString('hex');
  zaloStateStore.set(state, { codeVerifier, createdAt: Date.now() });

  // Xoá state cũ hơn 10 phút
  for (const [k, v] of zaloStateStore.entries()) {
    if (Date.now() - v.createdAt > 10 * 60 * 1000) zaloStateStore.delete(k);
  }

  const redirectUri = encodeURIComponent(`${BACKEND_URL}/auth/zalo/callback`);
  const zaloAuthUrl =
    `https://oauth.zaloapp.com/v4/permission` +
    `?app_id=${process.env.ZALO_APP_ID}` +
    `&redirect_uri=${redirectUri}` +
    `&code_challenge=${codeChallenge}` +
    `&state=${state}`;

  res.redirect(zaloAuthUrl);
});

router.get('/zalo/callback', async (req, res) => {
  const { code, state, error } = req.query;

  if (error || !code) {
    return res.redirect(`${FRONTEND_URL}/login?error=zalo_failed`);
  }

  // Lấy code_verifier từ state
  const storedData = zaloStateStore.get(state);
  if (!storedData) {
    return res.redirect(`${FRONTEND_URL}/login?error=zalo_state_invalid`);
  }
  zaloStateStore.delete(state);
  const { codeVerifier } = storedData;

  try {
    // Đổi code → access_token
    const tokenData = await zaloExchangeCode(code, codeVerifier);
    if (!tokenData?.access_token) {
      return res.redirect(`${FRONTEND_URL}/login?error=zalo_token_failed`);
    }

    // Lấy thông tin user
    const profile = await zaloGetProfile(tokenData.access_token);
    if (!profile?.id) {
      return res.redirect(`${FRONTEND_URL}/login?error=zalo_profile_failed`);
    }

    const email = `zalo_${profile.id}@zalo.local`;
    const name  = profile.name || `Zalo User ${profile.id}`;

    // Tìm hoặc tạo user trong DB
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, rows) => {
      if (err) return res.redirect(`${FRONTEND_URL}/login?error=db_error`);

      if (rows.length > 0) {
        return sendTokenToFrontend(req, res, rows[0]);
      }

      db.query(
        'INSERT INTO users (username, email, password, role_id) VALUES (?, ?, ?, 2)',
        [name, email, 'zalo_oauth_no_password'],
        (err2, result) => {
          if (err2) return res.redirect(`${FRONTEND_URL}/login?error=db_error`);
          db.query('SELECT * FROM users WHERE id = ?', [result.insertId], (err3, newRows) => {
            if (err3) return res.redirect(`${FRONTEND_URL}/login?error=db_error`);
            sendTokenToFrontend(req, res, newRows[0]);
          });
        }
      );
    });

  } catch (e) {
    console.error('[Zalo OAuth error]', e.message);
    res.redirect(`${FRONTEND_URL}/login?error=zalo_failed`);
  }
});

// ─── Zalo: đổi code → access_token ───────────────────────────────────────────
function zaloExchangeCode(code, codeVerifier) {
  return new Promise((resolve, reject) => {
    const body = querystring.stringify({
      app_id:        process.env.ZALO_APP_ID,
      app_secret:    process.env.ZALO_APP_SECRET,
      code,
      code_verifier: codeVerifier,
    });

    const options = {
      hostname: 'oauth.zaloapp.com',
      path:     '/v4/access_token',
      method:   'POST',
      headers: {
        'Content-Type':   'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
        'secret_key':     process.env.ZALO_APP_SECRET,
      },
    };

    const request = https.request(options, (resp) => {
      let data = '';
      resp.on('data', chunk => (data += chunk));
      resp.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { reject(new Error('Zalo token parse error')); }
      });
    });
    request.on('error', reject);
    request.write(body);
    request.end();
  });
}

// ─── Zalo: lấy thông tin profile ──────────────────────────────────────────────
function zaloGetProfile(accessToken) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'graph.zalo.me',
      path:     '/v2.0/me?fields=id,name,picture',
      method:   'GET',
      headers: {
        'access_token': accessToken,
      },
    };

    const request = https.request(options, (resp) => {
      let data = '';
      resp.on('data', chunk => (data += chunk));
      resp.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { reject(new Error('Zalo profile parse error')); }
      });
    });
    request.on('error', reject);
    request.end();
  });
}

module.exports = router;
