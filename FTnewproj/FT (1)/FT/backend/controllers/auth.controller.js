const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const SALT_ROUNDS = 10;

exports.signup = (req, reply) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return reply.status(400).send({ error: 'name, email and password are required' });
  }

  // Check if user already exists
  db.query('SELECT id FROM tbl_users WHERE email = ?', [email], async (err, results) => {
    if (err) {
      return reply.status(500).send({ error: 'Database error' });
    }
    
    if (results.length > 0) {
      return reply.status(409).send({ error: 'Email already registered' });
    }

    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      
      // Insert user
      const user = { name, email, password: hashedPassword };
      db.query('INSERT INTO tbl_users SET ?', user, (err, result) => {
        if (err) {
          return reply.status(500).send({ error: 'Failed to create user' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: result.insertId, email }, JWT_SECRET, { expiresIn: '7d' });
        
        reply.status(201).send({
          token,
          user: { id: result.insertId, name, email }
        });
      });
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });
};

exports.login = (req, reply) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return reply.status(400).send({ error: 'email and password are required' });
  }

  db.query('SELECT * FROM tbl_users WHERE email = ?', [email], async (err, results) => {
    if (err) {
      return reply.status(500).send({ error: 'Database error' });
    }
    
    if (results.length === 0) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    const user = results[0];
    
    try {
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        return reply.status(401).send({ error: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      
      reply.send({
        token,
        user: { id: user.id, name: user.name, email: user.email }
      });
    } catch (error) {
      reply.status(500).send({ error: 'Authentication failed' });
    }
  });
};
