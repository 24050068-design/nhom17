const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const db = require('../config/db');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

// ─── Hàm tìm hoặc tạo user từ OAuth ───────────────────────────────────────────
function findOrCreateUser({ email, name, provider, providerId }, done) {
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, rows) => {
    if (err) return done(err);

    if (rows.length > 0) {
      // User đã tồn tại → trả về luôn
      return done(null, rows[0]);
    }

    // Chưa có → tạo mới
    const username = name || email.split('@')[0];
    db.query(
      'INSERT INTO users (username, email, password, role_id) VALUES (?, ?, ?, 2)',
      [username, email, `${provider}_oauth_no_password`],
      (err2, result) => {
        if (err2) return done(err2);
        db.query('SELECT * FROM users WHERE id = ?', [result.insertId], (err3, newRows) => {
          if (err3) return done(err3);
          return done(null, newRows[0]);
        });
      }
    );
  });
}

// ─── Google Strategy ───────────────────────────────────────────────────────────
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy(
    {
      clientID:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:  `${BACKEND_URL}/auth/google/callback`,
    },
    (accessToken, refreshToken, profile, done) => {
      const email = profile.emails?.[0]?.value;
      const name  = profile.displayName;
      if (!email) return done(new Error('Không lấy được email từ Google'));
      findOrCreateUser({ email, name, provider: 'google', providerId: profile.id }, done);
    }
  ));
}

// ─── Facebook Strategy ────────────────────────────────────────────────────────
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(new FacebookStrategy(
    {
      clientID:     process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL:  `${BACKEND_URL}/auth/facebook/callback`,
      profileFields: ['id', 'displayName', 'emails'],
    },
    (accessToken, refreshToken, profile, done) => {
      const email = profile.emails?.[0]?.value || `fb_${profile.id}@facebook.local`;
      const name  = profile.displayName;
      findOrCreateUser({ email, name, provider: 'facebook', providerId: profile.id }, done);
    }
  ));
}

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  db.query('SELECT * FROM users WHERE id = ?', [id], (err, rows) => {
    done(err, rows[0] || null);
  });
});

module.exports = passport;
