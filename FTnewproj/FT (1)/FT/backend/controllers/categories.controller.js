const db = require('../db');
exports.getAll = (req, reply) => {
  db.query('SELECT * FROM tbl_categories', (err, results) => {
    if (err) return reply.status(500).send(err);
    reply.send(results);
  });
};
exports.getById = (req, reply) => {
  db.query('SELECT * FROM tbl_categories WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return reply.status(500).send(err);
    if (!results.length) return reply.status(404).send({ message: 'Not found' });
    reply.send(results[0]);
  });
};
exports.create = (req, reply) => {
  db.query('INSERT INTO tbl_categories SET ?', req.body, (err, results) => {
    if (err) return reply.status(500).send(err);
    reply.send({ id: results.insertId, ...req.body });
  });
};
exports.update = (req, reply) => {
  db.query('UPDATE tbl_categories SET ? WHERE id = ?', [req.body, req.params.id], (err) => {
    if (err) return reply.status(500).send(err);
    reply.send({ message: 'Updated' });
  });
};
exports.remove = (req, reply) => {
  db.query('DELETE FROM tbl_categories WHERE id = ?', [req.params.id], (err) => {
    if (err) return reply.status(500).send(err);
    reply.send({ message: 'Deleted' });
  });
};