'use strict';

const path    = require('path');
const multer  = require('multer');
const { requireAuth } = require('./auth');

let memoryNotes = [];

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads')),
  filename:    (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

function setup(app, db) {
  app.get('/api/notes', requireAuth, async (req, res) => {
    try {
      if (db.useMemory || !db.Note) {
        return res.json(memoryNotes.slice().reverse());
      }
      const notes = await db.Note.find().sort({ createdAt: -1 });
      res.json(notes);
    } catch {
      res.json(memoryNotes.slice().reverse());
    }
  });

  app.post('/api/notes', requireAuth, upload.single('image'), async (req, res) => {
    const { title, body } = req.body;
    const imageFile = req.file ? req.file.filename : null;

    if (!title || !body) {
      return res.status(400).json({ error: 'Title and note are required.' });
    }

    const noteData = {
      title:     title.slice(0, 50),
      body,
      image:     imageFile,
      createdAt: new Date()
    };

    try {
      if (db.useMemory || !db.Note) {
        const mem = { ...noteData, _id: Date.now().toString() };
        memoryNotes.push(mem);
        return res.json(mem);
      }
      const saved = await new db.Note(noteData).save();
      res.json(saved);
    } catch {
      const mem = { ...noteData, _id: Date.now().toString() };
      memoryNotes.push(mem);
      res.json(mem);
    }
  });
}

module.exports = { setup };
