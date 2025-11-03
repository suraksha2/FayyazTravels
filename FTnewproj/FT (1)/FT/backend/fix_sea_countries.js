// Helper function to format packages properly
const formatPackages = (results) => {
  return results.map(pkg => {
    const minPrice = pkg.min_price && pkg.min_price !== '' && pkg.min_price !== '0' ? parseInt(pkg.min_price) : null;
    const salePrice = pkg.sale_price && pkg.sale_price !== '' && pkg.sale_price !== '0' ? parseInt(pkg.sale_price) : null;
    
    let actualPrice, savings;
    if (minPrice) {
      actualPrice = minPrice;
      savings = salePrice && salePrice < minPrice ? minPrice - salePrice : Math.floor(minPrice * 0.1);
    } else {
      const dayMatch = pkg.day_night ? pkg.day_night.match(/(\d+)D/) : null;
      const days = dayMatch ? parseInt(dayMatch[1]) : 7;
      actualPrice = days * 300 + (pkg.id % 2000) + 2000;
      savings = Math.floor(actualPrice * 0.1);
    }
    
    return {
      id: pkg.id,
      title: pkg.p_name,
      slug: pkg.p_slug || pkg.p_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : '',
      image: pkg.feature_img,
      duration: pkg.day_night || 'Multiple Days',
      price: actualPrice,
      savings: savings,
      currency: pkg.package_currency || 'SGD',
      cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1,
      isHalalFriendly: pkg.display_type && pkg.display_type.includes('halal'),
      seatsLeft: (pkg.id % 15) + 5,
      isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'),
      hasPriceData: minPrice !== null
    };
  });
};

// Template for each country
exports.getCountryPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%CountryName%'
          OR p.p_name LIKE '%City1%'
          OR p.p_name LIKE '%City2%')
    AND p.status = 1 AND p.is_publish = 1
    GROUP BY p.id ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error fetching Country packages:', err);
      return reply.status(500).send({ error: 'Database error', details: err.message });
    }
    
    if (!results || results.length === 0) {
      return reply.send({ success: true, packages: [] });
    }
    
    const formattedPackages = formatPackages(results);
    reply.send({ success: true, packages: formattedPackages });
  });
};
