'use strict';

const session = require('express-session');

const PASSCODE    = process.env.PASSCODE || '122012';
const SESSION_TTL = 1000 * 60 * 60 * 24 * 30;

function setup(app) {
  app.use(session({
    secret:            process.env.SESSION_SECRET || 'brooklyn-secret-key',
    resave:            false,
    saveUninitialized: false,
    cookie: {
      maxAge:   SESSION_TTL,
      httpOnly: true,
      sameSite: 'lax',
    }
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
