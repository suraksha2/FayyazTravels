const db = require('../db');

// Get all posts ordered by date (latest first)
exports.getAllPosts = (req, reply) => {
  const { limit = 5 } = req.query;
  
  const query = `
    SELECT 
      p.*,
      c.cat_title as category_name
    FROM tbl_post p
    LEFT JOIN tbl_categories c ON p.post_cat = c.id
    ORDER BY p.id DESC
    LIMIT ?
  `;
  
  db.query(query, [parseInt(limit)], (err, results) => {
    if (err) {
      console.error('Error fetching posts:', err);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch posts',
        details: err.message
      });
    }
    
    reply.send({
      success: true,
      posts: results
    });
  });
};

// Get a single post by slug
exports.getPostBySlug = (req, reply) => {
  const { slug } = req.params;
  
  const query = `
    SELECT 
      p.*,
      c.cat_title as category_name
    FROM tbl_post p
    LEFT JOIN tbl_categories c ON p.post_cat = c.id
    WHERE p.post_url = ? AND p.post_status = 1
  `;
  
  db.query(query, [slug], (err, results) => {
    if (err) {
      console.error('Error fetching post:', err);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch post',
        details: err.message
      });
    }
    
    if (results.length === 0) {
      return reply.status(404).send({
        success: false,
        error: 'Post not found'
      });
    }
    
    reply.send({
      success: true,
      post: results[0]
    });
  });
};
