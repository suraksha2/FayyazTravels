// controllers/subscription.controller.js
const db = require('../db');

// POST /subscriptions – newsletter subscription
exports.create = (req, reply) => {
  const { email } = req.body;
  if (!email) return reply.status(400).send({ error: 'email is required' });
  db.query('INSERT INTO tbl_subscriptions (email, created_at) VALUES (?, ?)', [email, new Date()], (err, res) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') return reply.status(409).send({ error: 'Email already subscribed' });
      return reply.status(500).send(err);
    }
    reply.status(201).send({ id: res.insertId, email });
  });
};
