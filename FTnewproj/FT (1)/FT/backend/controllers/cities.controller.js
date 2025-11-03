const db = require('../db');
exports.getAll = (req, reply) => {
  db.query('SELECT * FROM tbl_citys', (err, results) => {
    if (err) return reply.status(500).send(err);
    reply.send(results);
  });
};

exports.getCountries = (req, reply) => {
  // Return a comprehensive list of popular travel destinations
  const countries = [
    'Argentina', 'Australia', 'Austria', 'Belgium', 'Brazil', 'Canada', 'Chile', 'China',
    'Croatia', 'Denmark', 'Egypt', 'Finland', 'France', 'Germany', 'Greece', 'Hungary',
    'Iceland', 'India', 'Indonesia', 'Italy', 'Japan', 'Kenya', 'Malaysia', 'Maldives',
    'Malta', 'Mexico', 'Morocco', 'Netherlands', 'New Zealand', 'Norway', 'Pakistan',
    'Philippines', 'Poland', 'Portugal', 'Russia', 'Singapore', 'South Africa', 'South Korea',
    'Spain', 'Sweden', 'Switzerland', 'Taiwan', 'Tanzania', 'Thailand', 'Turkey',
    'United Kingdom', 'United States', 'Vietnam'
  ];
  
  reply.send(countries);
};
exports.getById = (req, reply) => {
  db.query('SELECT * FROM tbl_citys WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return reply.status(500).send(err);
    if (!results.length) return reply.status(404).send({ message: 'Not found' });
    reply.send(results[0]);
  });
};
exports.create = (req, reply) => {
  db.query('INSERT INTO tbl_citys SET ?', req.body, (err, results) => {
    if (err) return reply.status(500).send(err);
    reply.send({ id: results.insertId, ...req.body });
  });
};
exports.update = (req, reply) => {
  db.query('UPDATE tbl_citys SET ? WHERE id = ?', [req.body, req.params.id], (err) => {
    if (err) return reply.status(500).send(err);
    reply.send({ message: 'Updated' });
  });
};
exports.remove = (req, reply) => {
  db.query('DELETE FROM tbl_citys WHERE id = ?', [req.params.id], (err) => {
    if (err) return reply.status(500).send(err);
    reply.send({ message: 'Deleted' });
  });
};
