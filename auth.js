'use strict';

const session     = require('express-session');
const MemoryStore = require('memorystore')(session);

const PASSCODE    = process.env.PASSCODE;
const SESSION_TTL = parseInt(process.env.SESSION_TTL_MS, 10) || 1000 * 60 * 60 * 24 * 30;

if (!PASSCODE) {
  throw new Error('Missing required env var: PASSCODE');
}

function setup(app) {
  const store = new MemoryStore({
    checkPeriod: 1000 * 60 * 60 * 24,
  });

  app.use(session({
    secret:            process.env.SESSION_SECRET,
    resave:            false,
    saveUninitialized: false,
    store,
    cookie: {
      maxAge:   SESSION_TTL,
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      secure:   process.env.NODE_ENV === 'production',
    },
  }));

  app.post('/auth/login', (req, res) => {
    const { passcode } = req.body;

    if (passcode === PASSCODE) {
      req.session.authenticated = true;
      req.session.cookie.maxAge = SESSION_TTL;
      return res.json({ success: true });
    }

    res.status(401).json({ success: false, message: 'Wrong passcode.' });
  });

  app.get('/auth/check', (req, res) => {
    res.json({ authenticated: !!(req.session && req.session.authenticated) });
  });

  app.post('/auth/logout', (req, res) => {
    req.session.destroy(() => res.json({ success: true }));
  });
}

function requireAuth(req, res, next) {
  if (req.session && req.session.authenticated) return next();
  res.status(401).json({ error: 'Unauthorized' });
}

module.exports = { setup, requireAuth };
