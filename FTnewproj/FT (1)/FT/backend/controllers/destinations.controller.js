// controllers/destinations.controller.js
const db = require('../db');

// Helper function to add pricing data to packages
const addPricingToPackages = (packages, callback) => {
  if (!packages || packages.length === 0) {
    return callback(null, packages);
  }

  let processedCount = 0;
  const packagesWithPricing = [];

  packages.forEach((pkg, index) => {
    db.query(
      'SELECT MIN(price_t2) as min_price, MAX(price_t2) as max_price, MIN(price_t2_sale) as sale_price FROM tbl_price WHERE package_id = ?',
      [pkg.id],
      (priceErr, priceResults) => {
        // Helper function to parse price
        const parsePrice = (value) => {
          if (!value || value === '' || value === '0') return null;
          const parsed = parseInt(value);
          return isNaN(parsed) ? null : parsed;
        };

        // Parse price data
        const minPrice = priceResults && priceResults[0] ? parsePrice(priceResults[0].min_price) : null;
        const maxPrice = priceResults && priceResults[0] ? parsePrice(priceResults[0].max_price) : null;
        const salePrice = priceResults && priceResults[0] ? parsePrice(priceResults[0].sale_price) : null;

        // Calculate display price
        let displayPrice, savings;
        if (minPrice) {
          displayPrice = minPrice;
          savings = salePrice && salePrice < minPrice ? minPrice - salePrice : Math.floor(minPrice * 0.1);
        } else {
          // Fallback: calculate price based on days and package ID
          const dayMatch = pkg.day_night ? pkg.day_night.match(/(\d+)D/) : null;
          const days = dayMatch ? parseInt(dayMatch[1]) : 7;
          displayPrice = days * 300 + (pkg.id % 2000) + 2000;
          savings = Math.floor(displayPrice * 0.1);
        }

        // Add pricing to package
        packagesWithPricing[index] = {
          ...pkg,
          price: displayPrice,
          min_price: minPrice,
          max_price: maxPrice,
          sale_price: salePrice,
          savings: savings,
          slug: pkg.p_slug || `package-${pkg.id}`
        };

        processedCount++;
        if (processedCount === packages.length) {
          callback(null, packagesWithPricing);
        }
      }
    );
  });
};

exports.getAll = (req, reply) => {
  db.query('SELECT * FROM tbl_destinations WHERE status = 1', (err, results) => {
    if (err) return reply.status(500).send(err);
    reply.send(results);
  });
};

exports.getById = (req, reply) => {
  db.query('SELECT * FROM tbl_destinations WHERE id = ? AND status = 1', [req.params.id], (err, results) => {
    if (err) return reply.status(500).send(err);
    if (!results.length) return reply.status(404).send({ message: 'Destination not found' });
    reply.send(results[0]);
  });
};

exports.getBySlug = (req, reply) => {
  db.query('SELECT * FROM tbl_destinations WHERE d_slug = ? AND status = 1', [req.params.slug], (err, results) => {
    if (err) return reply.status(500).send(err);
    if (!results.length) return reply.status(404).send({ message: 'Destination not found' });
    reply.send(results[0]);
  });
};

// Get packages for a specific destination
exports.getPackagesByDestination = (req, reply) => {
  const { slug } = req.params;
  
  // First get the destination to find country_id or destination name
  db.query('SELECT * FROM tbl_destinations WHERE d_slug = ? AND status = 1', [slug], (err, destResults) => {
    if (err) return reply.status(500).send(err);
    if (!destResults.length) return reply.status(404).send({ message: 'Destination not found' });
    
    const destination = destResults[0];
    
    // Get packages for this destination
    // We'll search by destination name in the package content or by country_id
    const searchQuery = `
      SELECT * FROM tbl_packages 
      WHERE (p_content LIKE ? OR p_name LIKE ?) 
      AND status = 1 
      AND is_publish = 1
    `;
    
    const searchTerm = `%${destination.d_name}%`;
    
    db.query(searchQuery, [searchTerm, searchTerm], (err, packageResults) => {
      if (err) return reply.status(500).send(err);
      
      reply.send({
        destination: destination,
        packages: packageResults
      });
    });
  });
};

// Get multi-city destinations (like Australia-New Zealand)
exports.getMultiCityDestinations = (req, reply) => {
  // For multi-city, we'll look for packages that have multiple country_ids
  const query = `
    SELECT DISTINCT p.*, 
           GROUP_CONCAT(DISTINCT d.d_name) as destination_names,
           GROUP_CONCAT(DISTINCT d.d_slug) as destination_slugs
    FROM tbl_packages p
    LEFT JOIN tbl_destinations d ON FIND_IN_SET(d.id, REPLACE(p.country_id, ',', ','))
    WHERE p.country_id LIKE '%,%' 
    AND p.status = 1 
    AND p.is_publish = 1
    GROUP BY p.id
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send(err);
    reply.send(results);
  });
};

// Get Australia-New Zealand specific packages
exports.getAustraliaNewZealandPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Australia%' OR p.p_name LIKE '%New Zealand%')
    AND p.status = 1 AND p.is_publish = 1
    GROUP BY p.id ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error fetching AustraliaNewZealand packages:', err);
      return reply.status(500).send({ error: 'Database error', details: err.message });
    }
    if (!results || results.length === 0) {
      return reply.send([]);
    }
    const formattedPackages = results.map(pkg => {
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
        id: pkg.id, title: pkg.p_name, slug: pkg.p_slug || pkg.p_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : '',
        image: pkg.feature_img, duration: pkg.day_night || 'Multiple Days', price: actualPrice, savings: savings,
        currency: pkg.package_currency || 'S', cities: pkg.desti_list ? pkg.desti_list.split(',').length : 2,
        isHalalFriendly: pkg.display_type && pkg.display_type.includes('halal'), seatsLeft: (pkg.id % 15) + 5,
        isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'), hasPriceData: minPrice !== null,
        p_name: pkg.p_name, p_slug: pkg.p_slug, day_night: pkg.day_night, feature_img: pkg.feature_img, p_content: pkg.p_content, package_currency: pkg.package_currency, desti_list: pkg.desti_list
      };
    });
    reply.send(formattedPackages);
  });
};

// Get Austria-Switzerland specific packages
exports.getAustriaSwitzerlandPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Austria%' OR p.p_name LIKE '%Switzerland%')
    AND p.status = 1 AND p.is_publish = 1
    GROUP BY p.id ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error fetching AustriaSwitzerland packages:', err);
      return reply.status(500).send({ error: 'Database error', details: err.message });
    }
    if (!results || results.length === 0) {
      return reply.send([]);
    }
    const formattedPackages = results.map(pkg => {
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
        id: pkg.id, title: pkg.p_name, slug: pkg.p_slug || pkg.p_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : '',
        image: pkg.feature_img, duration: pkg.day_night || 'Multiple Days', price: actualPrice, savings: savings,
        currency: pkg.package_currency || 'S', cities: pkg.desti_list ? pkg.desti_list.split(',').length : 2,
        isHalalFriendly: pkg.display_type && pkg.display_type.includes('halal'), seatsLeft: (pkg.id % 15) + 5,
        isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'), hasPriceData: minPrice !== null,
        p_name: pkg.p_name, p_slug: pkg.p_slug, day_night: pkg.day_night, feature_img: pkg.feature_img, p_content: pkg.p_content, package_currency: pkg.package_currency, desti_list: pkg.desti_list
      };
    });
    reply.send(formattedPackages);
  });
};

// Get Bulgaria-Greece specific packages
exports.getBulgariaGreecePackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Bulgaria%' OR p.p_name LIKE '%Greece%')
    AND p.status = 1 AND p.is_publish = 1
    GROUP BY p.id ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error fetching BulgariaGreece packages:', err);
      return reply.status(500).send({ error: 'Database error', details: err.message });
    }
    if (!results || results.length === 0) {
      return reply.send([]);
    }
    const formattedPackages = results.map(pkg => {
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
        id: pkg.id, title: pkg.p_name, slug: pkg.p_slug || pkg.p_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : '',
        image: pkg.feature_img, duration: pkg.day_night || 'Multiple Days', price: actualPrice, savings: savings,
        currency: pkg.package_currency || 'S', cities: pkg.desti_list ? pkg.desti_list.split(',').length : 2,
        isHalalFriendly: pkg.display_type && pkg.display_type.includes('halal'), seatsLeft: (pkg.id % 15) + 5,
        isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'), hasPriceData: minPrice !== null,
        p_name: pkg.p_name, p_slug: pkg.p_slug, day_night: pkg.day_night, feature_img: pkg.feature_img, p_content: pkg.p_content, package_currency: pkg.package_currency, desti_list: pkg.desti_list
      };
    });
    reply.send(formattedPackages);
  });
};

// Get Panama-Costa Rica specific packages
exports.getPanamaCostaRicaPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Panama%' OR p.p_name LIKE '%Costa Rica%')
    AND p.status = 1 AND p.is_publish = 1
    GROUP BY p.id ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error fetching PanamaCostaRica packages:', err);
      return reply.status(500).send({ error: 'Database error', details: err.message });
    }
    if (!results || results.length === 0) {
      return reply.send([]);
    }
    const formattedPackages = results.map(pkg => {
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
        id: pkg.id, title: pkg.p_name, slug: pkg.p_slug || pkg.p_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : '',
        image: pkg.feature_img, duration: pkg.day_night || 'Multiple Days', price: actualPrice, savings: savings,
        currency: pkg.package_currency || 'S', cities: pkg.desti_list ? pkg.desti_list.split(',').length : 2,
        isHalalFriendly: pkg.display_type && pkg.display_type.includes('halal'), seatsLeft: (pkg.id % 15) + 5,
        isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'), hasPriceData: minPrice !== null,
        p_name: pkg.p_name, p_slug: pkg.p_slug, day_night: pkg.day_night, feature_img: pkg.feature_img, p_content: pkg.p_content, package_currency: pkg.package_currency, desti_list: pkg.desti_list
      };
    });
    reply.send(formattedPackages);
  });
};

// Get Paris-Switzerland specific packages
exports.getParisSwitzerlandPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Paris%' OR p.p_name LIKE '%Switzerland%')
    AND p.status = 1 AND p.is_publish = 1
    GROUP BY p.id ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error fetching ParisSwitzerland packages:', err);
      return reply.status(500).send({ error: 'Database error', details: err.message });
    }
    if (!results || results.length === 0) {
      return reply.send([]);
    }
    const formattedPackages = results.map(pkg => {
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
        id: pkg.id, title: pkg.p_name, slug: pkg.p_slug || pkg.p_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : '',
        image: pkg.feature_img, duration: pkg.day_night || 'Multiple Days', price: actualPrice, savings: savings,
        currency: pkg.package_currency || 'S', cities: pkg.desti_list ? pkg.desti_list.split(',').length : 2,
        isHalalFriendly: pkg.display_type && pkg.display_type.includes('halal'), seatsLeft: (pkg.id % 15) + 5,
        isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'), hasPriceData: minPrice !== null,
        p_name: pkg.p_name, p_slug: pkg.p_slug, day_night: pkg.day_night, feature_img: pkg.feature_img, p_content: pkg.p_content, package_currency: pkg.package_currency, desti_list: pkg.desti_list
      };
    });
    reply.send(formattedPackages);
  });
};

// Get Fixed Departures packages
exports.getFixedDeparturesPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Fixed Departure%' OR p.display_type LIKE '%fixed_departure%')
    AND p.status = 1 AND p.is_publish = 1
    GROUP BY p.id ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error fetching Fixed Departures packages:', err);
      return reply.status(500).send({ error: 'Database error', details: err.message });
    }
    if (!results || results.length === 0) {
      return reply.send([]);
    }
    const formattedPackages = results.map(pkg => {
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
        id: pkg.id, title: pkg.p_name, slug: pkg.p_slug || pkg.p_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : '',
        image: pkg.feature_img, duration: pkg.day_night || 'Multiple Days', price: actualPrice, savings: savings,
        currency: pkg.package_currency || 'S', cities: pkg.desti_list ? pkg.desti_list.split(',').length : 2,
        isHalalFriendly: pkg.display_type && pkg.display_type.includes('halal'), seatsLeft: (pkg.id % 15) + 5,
        isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'), hasPriceData: minPrice !== null,
        p_name: pkg.p_name, p_slug: pkg.p_slug, day_night: pkg.day_night, feature_img: pkg.feature_img, p_content: pkg.p_content, package_currency: pkg.package_currency, desti_list: pkg.desti_list
      };
    });
    reply.send(formattedPackages);
  });
};

// GROUP TOUR PACKAGES

// Get Kashmir Group Tour packages
exports.getKashmirGroupTourPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Kashmir%'
          OR p.p_name LIKE '%Srinagar%')
    AND p.status = 1 AND p.is_publish = 1
    GROUP BY p.id ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error fetching Kashmir packages:', err);
      return reply.status(500).send({ error: 'Database error', details: err.message });
    }
    if (!results || results.length === 0) {
      return reply.send({ success: true, packages: [] });
    }
    const formattedPackages = results.map(pkg => {
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
        id: pkg.id, title: pkg.p_name, slug: pkg.p_slug || pkg.p_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : '',
        image: pkg.feature_img, duration: pkg.day_night || 'Multiple Days', price: actualPrice, savings: savings,
        currency: pkg.package_currency || 'S', cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1,
        isHalalFriendly: pkg.display_type && pkg.display_type.includes('halal'), seatsLeft: (pkg.id % 15) + 5,
        isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'), hasPriceData: minPrice !== null
      };
    });
    reply.send(formattedPackages);
  });
};

// Get North India Tour packages
exports.getNorthIndiaGroupTourPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE p.p_name LIKE '%North India%'
    AND p.status = 1 AND p.is_publish = 1
    GROUP BY p.id ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error fetching NorthIndiaGroupTour packages:', err);
      return reply.status(500).send({ error: 'Database error', details: err.message });
    }
    if (!results || results.length === 0) {
      return reply.send([]);
    }
    const formattedPackages = results.map(pkg => {
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
        id: pkg.id, title: pkg.p_name, slug: pkg.p_slug || pkg.p_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : '',
        image: pkg.feature_img, duration: pkg.day_night || 'Multiple Days', price: actualPrice, savings: savings,
        currency: pkg.package_currency || 'S', cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1,
        isHalalFriendly: pkg.display_type && pkg.display_type.includes('halal'), seatsLeft: (pkg.id % 15) + 5,
        isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'), hasPriceData: minPrice !== null, p_name: pkg.p_name, p_slug: pkg.p_slug, day_night: pkg.day_night, feature_img: pkg.feature_img, p_content: pkg.p_content, package_currency: pkg.package_currency, desti_list: pkg.desti_list
      };
    });
    reply.send(formattedPackages);
  });
};

// Get Turkey-Georgia-Azerbaijan packages
exports.getTurkeyGeorgiaAzerbaijanPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE p.p_name LIKE '%Turkey%'
    AND p.status = 1 AND p.is_publish = 1
    GROUP BY p.id ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error fetching TurkeyGeorgiaAzerbaijan packages:', err);
      return reply.status(500).send({ error: 'Database error', details: err.message });
    }
    if (!results || results.length === 0) {
      return reply.send([]);
    }
    const formattedPackages = results.map(pkg => {
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
        id: pkg.id, title: pkg.p_name, slug: pkg.p_slug || pkg.p_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : '',
        image: pkg.feature_img, duration: pkg.day_night || 'Multiple Days', price: actualPrice, savings: savings,
        currency: pkg.package_currency || 'S', cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1,
        isHalalFriendly: pkg.display_type && pkg.display_type.includes('halal'), seatsLeft: (pkg.id % 15) + 5,
        isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'), hasPriceData: minPrice !== null, p_name: pkg.p_name, p_slug: pkg.p_slug, day_night: pkg.day_night, feature_img: pkg.feature_img, p_content: pkg.p_content, package_currency: pkg.package_currency, desti_list: pkg.desti_list
      };
    });
    reply.send(formattedPackages);
  });
};

// Get Uzbekistan Group Tour packages
exports.getUzbekistanGroupTourPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE p.p_name LIKE '%Uzbekistan%'
    AND p.status = 1 AND p.is_publish = 1
    GROUP BY p.id ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error fetching UzbekistanGroupTour packages:', err);
      return reply.status(500).send({ error: 'Database error', details: err.message });
    }
    if (!results || results.length === 0) {
      return reply.send([]);
    }
    const formattedPackages = results.map(pkg => {
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
        id: pkg.id, title: pkg.p_name, slug: pkg.p_slug || pkg.p_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : '',
        image: pkg.feature_img, duration: pkg.day_night || 'Multiple Days', price: actualPrice, savings: savings,
        currency: pkg.package_currency || 'S', cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1,
        isHalalFriendly: pkg.display_type && pkg.display_type.includes('halal'), seatsLeft: (pkg.id % 15) + 5,
        isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'), hasPriceData: minPrice !== null, p_name: pkg.p_name, p_slug: pkg.p_slug, day_night: pkg.day_night, feature_img: pkg.feature_img, p_content: pkg.p_content, package_currency: pkg.package_currency, desti_list: pkg.desti_list
      };
    });
    reply.send(formattedPackages);
  });
};

// Get General Group Tour packages
exports.getGeneralGroupTourPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE p.p_name LIKE '%Group Tour%'
    AND p.status = 1 AND p.is_publish = 1
    GROUP BY p.id ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error fetching GeneralGroupTour packages:', err);
      return reply.status(500).send({ error: 'Database error', details: err.message });
    }
    if (!results || results.length === 0) {
      return reply.send([]);
    }
    const formattedPackages = results.map(pkg => {
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
        id: pkg.id, title: pkg.p_name, slug: pkg.p_slug || pkg.p_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : '',
        image: pkg.feature_img, duration: pkg.day_night || 'Multiple Days', price: actualPrice, savings: savings,
        currency: pkg.package_currency || 'S', cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1,
        isHalalFriendly: pkg.display_type && pkg.display_type.includes('halal'), seatsLeft: (pkg.id % 15) + 5,
        isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'), hasPriceData: minPrice !== null, p_name: pkg.p_name, p_slug: pkg.p_slug, day_night: pkg.day_night, feature_img: pkg.feature_img, p_content: pkg.p_content, package_currency: pkg.package_currency, desti_list: pkg.desti_list
      };
    });
    reply.send(formattedPackages);
  });
};

// AFRICA DESTINATION PACKAGES

// Get Botswana packages
exports.getBotswanaPackages = (req, reply) => {
  const query = `
    SELECT * FROM tbl_packages 
    WHERE (p_name LIKE '%Botswana%' OR p_content LIKE '%Botswana%' 
          OR p_name LIKE '%Gaborone%' OR p_content LIKE '%Gaborone%'
          OR p_name LIKE '%Okavango%' OR p_content LIKE '%Okavango%')
    AND status = 1 
    AND is_publish = 1
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send(err);
    // Add slug generation for each package
    const packagesWithSlugs = results.map(pkg => ({
      ...pkg,
      slug: pkg.p_name ? pkg.p_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : `package-${pkg.id}`
    }));
    reply.send(packagesWithSlugs);
  });
};

// Get Egypt packages
exports.getEgyptPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Egypt%'
          OR p.p_slug LIKE '%egypt%')
    AND p.status = 1 AND p.is_publish = 1
    GROUP BY p.id ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error fetching Egypt packages:', err);
      return reply.status(500).send({ error: 'Database error', details: err.message });
    }
    if (!results || results.length === 0) {
      return reply.send({ success: true, packages: [] });
    }
    const formattedPackages = results.map(pkg => {
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
        id: pkg.id, title: pkg.p_name, slug: pkg.p_slug || pkg.p_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : '',
        image: pkg.feature_img, duration: pkg.day_night || 'Multiple Days', price: actualPrice, savings: savings,
        currency: pkg.package_currency || 'S', cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1,
        isHalalFriendly: pkg.display_type && pkg.display_type.includes('halal'), seatsLeft: (pkg.id % 15) + 5,
        isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'), hasPriceData: minPrice !== null
      };
    });
    reply.send(formattedPackages);
  });
};

// Get Kenya packages
exports.getKenyaPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Kenya%'
          OR p.p_slug LIKE '%kenya%')
    AND p.status = 1 AND p.is_publish = 1
    GROUP BY p.id ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error fetching Kenya packages:', err);
      return reply.status(500).send({ error: 'Database error', details: err.message });
    }
    if (!results || results.length === 0) {
      return reply.send({ success: true, packages: [] });
    }
    const formattedPackages = results.map(pkg => {
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
        id: pkg.id, title: pkg.p_name, slug: pkg.p_slug || pkg.p_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : '',
        image: pkg.feature_img, duration: pkg.day_night || 'Multiple Days', price: actualPrice, savings: savings,
        currency: pkg.package_currency || 'S', cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1,
        isHalalFriendly: pkg.display_type && pkg.display_type.includes('halal'), seatsLeft: (pkg.id % 15) + 5,
        isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'), hasPriceData: minPrice !== null
      };
    });
    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get Anguilla packages
exports.getAnguillaPackages = (req, reply) => {
  const query = `
    SELECT * FROM tbl_packages 
    WHERE ((p_name LIKE '%Anguilla%' OR p_content LIKE '%Anguilla%')
    OR (p_name LIKE '%The Valley%' OR p_content LIKE '%The Valley%')
    OR (p_name LIKE '%Shoal Bay%' OR p_content LIKE '%Shoal Bay%')
    OR (p_name LIKE '%Caribbean%' OR p_content LIKE '%Caribbean%')
    OR p_slug LIKE '%anguilla%')
    AND status = 1 
    AND is_publish = 1
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send(err);
    // Add slug generation for each package
    const packagesWithSlugs = results.map(pkg => ({
      ...pkg,
      slug: pkg.p_name ? pkg.p_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : `package-${pkg.id}`
    }));
    reply.send(packagesWithSlugs);
  });
};

// Get Antigua and Barbuda packages
exports.getAntiguaBarbudaPackages = (req, reply) => {
  const query = `
    SELECT * FROM tbl_packages 
    WHERE ((p_name LIKE '%Antigua%' OR p_content LIKE '%Antigua%')
    OR (p_name LIKE '%Barbuda%' OR p_content LIKE '%Barbuda%')
    OR (p_name LIKE '%St. John%' OR p_content LIKE '%St. John%')
    OR (p_name LIKE '%English Harbour%' OR p_content LIKE '%English Harbour%')
    OR (p_name LIKE '%Dickenson Bay%' OR p_content LIKE '%Dickenson Bay%')
    OR (p_name LIKE '%Caribbean%' OR p_content LIKE '%Caribbean%')
    OR p_slug LIKE '%antigua%' 
    OR p_slug LIKE '%barbuda%')
    AND status = 1 
    AND is_publish = 1
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send(err);
    // Add slug generation for each package
    const packagesWithSlugs = results.map(pkg => ({
      ...pkg,
      slug: pkg.p_name ? pkg.p_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : `package-${pkg.id}`
    }));
    reply.send(packagesWithSlugs);
  });
};

// Get Bahamas packages
exports.getBahamasPackages = (req, reply) => {
  const query = `
    SELECT * FROM tbl_packages 
    WHERE ((p_name LIKE '%Bahamas%' OR p_content LIKE '%Bahamas%')
    OR (p_name LIKE '%Nassau%' OR p_content LIKE '%Nassau%')
    OR (p_name LIKE '%Paradise Island%' OR p_content LIKE '%Paradise Island%')
    OR (p_name LIKE '%Grand Bahama%' OR p_content LIKE '%Grand Bahama%')
    OR (p_name LIKE '%Exuma%' OR p_content LIKE '%Exuma%')
    OR (p_name LIKE '%Caribbean%' OR p_content LIKE '%Caribbean%')
    OR p_slug LIKE '%bahamas%' 
    OR p_slug LIKE '%nassau%' 
    OR p_slug LIKE '%exuma%')
    AND status = 1 
    AND is_publish = 1
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send(err);
    // Add slug generation for each package
    const packagesWithSlugs = results.map(pkg => ({
      ...pkg,
      slug: pkg.p_name ? pkg.p_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : `package-${pkg.id}`
    }));
    reply.send(packagesWithSlugs);
  });
};

// Get Barbados packages
exports.getBarbadosPackages = (req, reply) => {
  const query = `
    SELECT * FROM tbl_packages 
    WHERE ((p_name LIKE '%Barbados%' OR p_content LIKE '%Barbados%')
    OR (p_name LIKE '%Bridgetown%' OR p_content LIKE '%Bridgetown%')
    OR (p_name LIKE '%Oistins%' OR p_content LIKE '%Oistins%')
    OR (p_name LIKE '%Holetown%' OR p_content LIKE '%Holetown%')
    OR (p_name LIKE '%St. Lawrence Gap%' OR p_content LIKE '%St. Lawrence Gap%')
    OR (p_name LIKE '%Caribbean%' OR p_content LIKE '%Caribbean%')
    OR p_slug LIKE '%barbados%' 
    OR p_slug LIKE '%bridgetown%' 
    OR p_slug LIKE '%oistins%')
    AND status = 1 
    AND is_publish = 1
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send(err);
    // Add slug generation for each package
    const packagesWithSlugs = results.map(pkg => ({
      ...pkg,
      slug: pkg.p_name ? pkg.p_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : `package-${pkg.id}`
    }));
    reply.send(packagesWithSlugs);
  });
};

// Get British Virgin Islands packages
exports.getBritishVirginIslandsPackages = (req, reply) => {
  const query = `
    SELECT * FROM tbl_packages 
    WHERE ((p_name LIKE '%British Virgin Islands%' OR p_content LIKE '%British Virgin Islands%')
    OR (p_name LIKE '%Tortola%' OR p_content LIKE '%Tortola%')
    OR (p_name LIKE '%Virgin Gorda%' OR p_content LIKE '%Virgin Gorda%')
    OR (p_name LIKE '%Anegada%' OR p_content LIKE '%Anegada%')
    OR (p_name LIKE '%Jost Van Dyke%' OR p_content LIKE '%Jost Van Dyke%')
    OR (p_name LIKE '%Caribbean%' OR p_content LIKE '%Caribbean%')
    OR p_slug LIKE '%bvi%' 
    OR p_slug LIKE '%british-virgin%' 
    OR p_slug LIKE '%tortola%')
    AND status = 1 
    AND is_publish = 1
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send(err);
    // Add slug generation for each package
    const packagesWithSlugs = results.map(pkg => ({
      ...pkg,
      slug: pkg.p_name ? pkg.p_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : `package-${pkg.id}`
    }));
    reply.send(packagesWithSlugs);
  });
};

// Get Cuba packages
exports.getCubaPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Cuba%'
          OR p.p_name LIKE '%Havana%'
          OR p.p_slug LIKE '%cuba%')
    AND p.status = 1 AND p.is_publish = 1
    GROUP BY p.id ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error fetching Cuba packages:', err);
      return reply.status(500).send({ error: 'Database error', details: err.message });
    }
    if (!results || results.length === 0) {
      return reply.send({ success: true, packages: [] });
    }
    const formattedPackages = results.map(pkg => {
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
        id: pkg.id, title: pkg.p_name, slug: pkg.p_slug || pkg.p_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : '',
        image: pkg.feature_img, duration: pkg.day_night || 'Multiple Days', price: actualPrice, savings: savings,
        currency: pkg.package_currency || 'S', cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1,
        isHalalFriendly: pkg.display_type && pkg.display_type.includes('halal'), seatsLeft: (pkg.id % 15) + 5,
        isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'), hasPriceData: minPrice !== null
      };
    });
    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get Madagascar packages
exports.getMadagascarPackages = (req, reply) => {
  const query = `
    SELECT * FROM tbl_packages 
    WHERE (p_name LIKE '%Madagascar%' OR p_content LIKE '%Madagascar%' 
          OR p_name LIKE '%Antananarivo%' OR p_content LIKE '%Antananarivo%')
    AND status = 1 
    AND is_publish = 1
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send(err);
    reply.send(results);
  });
};

// Get Malawi packages
exports.getMalawiPackages = (req, reply) => {
  const query = `
    SELECT * FROM tbl_packages 
    WHERE (p_name LIKE '%Malawi%' OR p_content LIKE '%Malawi%' 
          OR p_name LIKE '%Lilongwe%' OR p_content LIKE '%Lilongwe%')
    AND status = 1 
    AND is_publish = 1
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send(err);
    reply.send(results);
  });
};

// Get Mauritius packages
exports.getMauritiusPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Mauritius%'
          OR p.p_slug LIKE '%mauritius%')
    AND p.status = 1 AND p.is_publish = 1
    GROUP BY p.id ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error fetching Mauritius packages:', err);
      return reply.status(500).send({ error: 'Database error', details: err.message });
    }
    if (!results || results.length === 0) {
      return reply.send({ success: true, packages: [] });
    }
    const formattedPackages = results.map(pkg => {
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
        id: pkg.id, title: pkg.p_name, slug: pkg.p_slug || pkg.p_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : '',
        image: pkg.feature_img, duration: pkg.day_night || 'Multiple Days', price: actualPrice, savings: savings,
        currency: pkg.package_currency || 'S', cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1,
        isHalalFriendly: pkg.display_type && pkg.display_type.includes('halal'), seatsLeft: (pkg.id % 15) + 5,
        isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'), hasPriceData: minPrice !== null
      };
    });
    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get Morocco packages
exports.getMoroccoPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Morocco%'
          OR p.p_slug LIKE '%morocco%')
    AND p.status = 1 AND p.is_publish = 1
    GROUP BY p.id ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error fetching Morocco packages:', err);
      return reply.status(500).send({ error: 'Database error', details: err.message });
    }
    if (!results || results.length === 0) {
      return reply.send({ success: true, packages: [] });
    }
    const formattedPackages = results.map(pkg => {
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
        id: pkg.id, title: pkg.p_name, slug: pkg.p_slug || pkg.p_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : '',
        image: pkg.feature_img, duration: pkg.day_night || 'Multiple Days', price: actualPrice, savings: savings,
        currency: pkg.package_currency || 'S', cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1,
        isHalalFriendly: pkg.display_type && pkg.display_type.includes('halal'), seatsLeft: (pkg.id % 15) + 5,
        isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'), hasPriceData: minPrice !== null
      };
    });
    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get Mozambique packages
exports.getMozambiquePackages = (req, reply) => {
  const query = `
    SELECT * FROM tbl_packages 
    WHERE (p_name LIKE '%Mozambique%' OR p_content LIKE '%Mozambique%' 
          OR p_name LIKE '%Maputo%' OR p_content LIKE '%Maputo%')
    AND status = 1 
    AND is_publish = 1
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send(err);
    reply.send(results);
  });
};

// Get Namibia packages
exports.getNamibiaPackages = (req, reply) => {
  const query = `
    SELECT * FROM tbl_packages 
    WHERE (p_name LIKE '%Namibia%' OR p_content LIKE '%Namibia%' 
          OR p_name LIKE '%Windhoek%' OR p_content LIKE '%Windhoek%'
          OR p_name LIKE '%Sossusvlei%' OR p_content LIKE '%Sossusvlei%'
          OR p_name LIKE '%Etosha%' OR p_content LIKE '%Etosha%'
          OR p_name LIKE '%Skeleton Coast%' OR p_content LIKE '%Skeleton Coast%'
          OR p_name LIKE '%Namib Desert%' OR p_content LIKE '%Namib Desert%')
    AND status = 1 
    AND is_publish = 1
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send(err);
    // Add slug generation for each package
    const packagesWithSlugs = results.map(pkg => ({
      ...pkg,
      slug: pkg.p_name ? pkg.p_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : `package-${pkg.id}`
    }));
    reply.send(packagesWithSlugs);
  });
};

// Get Seychelles packages
exports.getSeychellesPackages = (req, reply) => {
  const query = `
    SELECT * FROM tbl_packages 
    WHERE (p_name LIKE '%Seychelles%' OR p_content LIKE '%Seychelles%' 
          OR p_name LIKE '%Victoria%' OR p_content LIKE '%Victoria%'
          OR p_name LIKE '%Praslin%' OR p_content LIKE '%Praslin%'
          OR p_name LIKE '%La Digue%' OR p_content LIKE '%La Digue%'
          OR p_name LIKE '%Mahe%' OR p_content LIKE '%Mahe%')
    AND status = 1 
    AND is_publish = 1
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send(err);
    // Add slug generation for each package
    const packagesWithSlugs = results.map(pkg => ({
      ...pkg,
      slug: pkg.p_name ? pkg.p_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : `package-${pkg.id}`
    }));
    reply.send(packagesWithSlugs);
  });
};

// Get South Africa packages
exports.getSouthAfricaPackages = (req, reply) => {
  const query = `
    SELECT * FROM tbl_packages 
    WHERE (p_name LIKE '%South Africa%' OR p_content LIKE '%South Africa%' 
          OR p_name LIKE '%Cape Town%' OR p_content LIKE '%Cape Town%'
          OR p_name LIKE '%Johannesburg%' OR p_content LIKE '%Johannesburg%'
          OR p_name LIKE '%Durban%' OR p_content LIKE '%Durban%'
          OR p_name LIKE '%Kruger National Park%' OR p_content LIKE '%Kruger National Park%'
          OR p_name LIKE '%Garden Route%' OR p_content LIKE '%Garden Route%'
          OR p_name LIKE '%Table Mountain%' OR p_content LIKE '%Table Mountain%'
          OR p_name LIKE '%Stellenbosch%' OR p_content LIKE '%Stellenbosch%')
    AND status = 1 
    AND is_publish = 1
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send(err);
    // Add slug generation for each package
    const packagesWithSlugs = results.map(pkg => ({
      ...pkg,
      slug: pkg.p_name ? pkg.p_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : `package-${pkg.id}`
    }));
    reply.send(packagesWithSlugs);
  });
};

// Get Tanzania packages
exports.getTanzaniaPackages = (req, reply) => {
  const query = `
    SELECT * FROM tbl_packages 
    WHERE (p_name LIKE '%Tanzania%' OR p_content LIKE '%Tanzania%' 
          OR p_name LIKE '%Dar es Salaam%' OR p_content LIKE '%Dar es Salaam%'
          OR p_name LIKE '%Dodoma%' OR p_content LIKE '%Dodoma%'
          OR p_name LIKE '%Arusha%' OR p_content LIKE '%Arusha%'
          OR p_name LIKE '%Serengeti%' OR p_content LIKE '%Serengeti%'
          OR p_name LIKE '%Kilimanjaro%' OR p_content LIKE '%Kilimanjaro%'
          OR p_name LIKE '%Ngorongoro%' OR p_content LIKE '%Ngorongoro%'
          OR p_name LIKE '%Zanzibar%' OR p_content LIKE '%Zanzibar%'
          OR p_name LIKE '%Stone Town%' OR p_content LIKE '%Stone Town%')
    AND status = 1 
    AND is_publish = 1
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send(err);
    // Add slug generation for each package
    const packagesWithSlugs = results.map(pkg => ({
      ...pkg,
      slug: pkg.p_name ? pkg.p_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : `package-${pkg.id}`
    }));
    reply.send(packagesWithSlugs);
  });
};

// Get Tunisia packages
exports.getTunisiaPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Tunisia%'
          OR p.p_name LIKE '%Tunis%'
          OR p.p_slug LIKE '%tunisia%')
    AND p.status = 1 AND p.is_publish = 1
    GROUP BY p.id ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error fetching Tunisia packages:', err);
      return reply.status(500).send({ error: 'Database error', details: err.message });
    }
    if (!results || results.length === 0) {
      return reply.send({ success: true, packages: [] });
    }
    const formattedPackages = results.map(pkg => {
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
        id: pkg.id, title: pkg.p_name, slug: pkg.p_slug || pkg.p_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : '',
        image: pkg.feature_img, duration: pkg.day_night || 'Multiple Days', price: actualPrice, savings: savings,
        currency: pkg.package_currency || 'SGD', cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1,
        isHalalFriendly: pkg.display_type && pkg.display_type.includes('halal'), seatsLeft: (pkg.id % 15) + 5,
        isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'), hasPriceData: minPrice !== null
      };
    });
    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get Uganda packages
exports.getUgandaPackages = (req, reply) => {
  const query = `
    SELECT * FROM tbl_packages 
    WHERE (p_name LIKE '%Uganda%' OR p_content LIKE '%Uganda%' 
          OR p_name LIKE '%Kampala%' OR p_content LIKE '%Kampala%'
          OR p_name LIKE '%Entebbe%' OR p_content LIKE '%Entebbe%'
          OR p_name LIKE '%Jinja%' OR p_content LIKE '%Jinja%'
          OR p_name LIKE '%Murchison Falls%' OR p_content LIKE '%Murchison Falls%'
          OR p_name LIKE '%Queen Elizabeth%' OR p_content LIKE '%Queen Elizabeth%'
          OR p_name LIKE '%Bwindi%' OR p_content LIKE '%Bwindi%'
          OR p_name LIKE '%Gorilla%' OR p_content LIKE '%Gorilla%'
          OR p_name LIKE '%Lake Victoria%' OR p_content LIKE '%Lake Victoria%')
    AND status = 1 
    AND is_publish = 1
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send(err);
    // Add slug generation for each package
    const packagesWithSlugs = results.map(pkg => ({
      ...pkg,
      slug: pkg.p_name ? pkg.p_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : `package-${pkg.id}`
    }));
    reply.send(packagesWithSlugs);
  });
};

// Get Zambia packages
exports.getZambiaPackages = (req, reply) => {
  const query = `
    SELECT * FROM tbl_packages 
    WHERE (p_name LIKE '%Zambia%' OR p_content LIKE '%Zambia%' 
          OR p_name LIKE '%Lusaka%' OR p_content LIKE '%Lusaka%'
          OR p_name LIKE '%Livingstone%' OR p_content LIKE '%Livingstone%'
          OR p_name LIKE '%Victoria Falls%' OR p_content LIKE '%Victoria Falls%'
          OR p_name LIKE '%South Luangwa%' OR p_content LIKE '%South Luangwa%'
          OR p_name LIKE '%Lower Zambezi%' OR p_content LIKE '%Lower Zambezi%'
          OR p_name LIKE '%Kafue%' OR p_content LIKE '%Kafue%'
          OR p_name LIKE '%Zambezi River%' OR p_content LIKE '%Zambezi River%')
    AND status = 1 
    AND is_publish = 1
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send(err);
    // Add slug generation for each package
    const packagesWithSlugs = results.map(pkg => ({
      ...pkg,
      slug: pkg.p_name ? pkg.p_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : `package-${pkg.id}`
    }));
    reply.send(packagesWithSlugs);
  });
};

// Get Zimbabwe packages
exports.getZimbabwePackages = (req, reply) => {
  const query = `
    SELECT * FROM tbl_packages 
    WHERE (p_name LIKE '%Zimbabwe%' OR p_content LIKE '%Zimbabwe%' 
          OR p_name LIKE '%Harare%' OR p_content LIKE '%Harare%'
          OR p_name LIKE '%Bulawayo%' OR p_content LIKE '%Bulawayo%'
          OR p_name LIKE '%Victoria Falls%' OR p_content LIKE '%Victoria Falls%'
          OR p_name LIKE '%Hwange%' OR p_content LIKE '%Hwange%'
          OR p_name LIKE '%Mana Pools%' OR p_content LIKE '%Mana Pools%'
          OR p_name LIKE '%Great Zimbabwe%' OR p_content LIKE '%Great Zimbabwe%'
          OR p_name LIKE '%Matobo%' OR p_content LIKE '%Matobo%'
          OR p_name LIKE '%Kariba%' OR p_content LIKE '%Kariba%')
    AND status = 1 
    AND is_publish = 1
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send(err);
    // Add slug generation for each package
    const packagesWithSlugs = results.map(pkg => ({
      ...pkg,
      slug: pkg.p_name ? pkg.p_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : `package-${pkg.id}`
    }));
    reply.send(packagesWithSlugs);
  });
};

// Get Dominican Republic packages
exports.getDominicanRepublicPackages = (req, reply) => {
  const query = `
    SELECT * FROM tbl_packages 
    WHERE (p_name LIKE '%Dominican Republic%' OR p_content LIKE '%Dominican Republic%' 
          OR p_name LIKE '%Punta Cana%' OR p_content LIKE '%Punta Cana%'
          OR p_name LIKE '%Santo Domingo%' OR p_content LIKE '%Santo Domingo%')
    AND status = 1 
    AND is_publish = 1
    ORDER BY p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send(err);
    reply.send(results);
  });
};

// Get Jamaica packages
exports.getJamaicaPackages = (req, reply) => {
  const query = `
    SELECT * FROM tbl_packages 
    WHERE (p_name LIKE '%Jamaica%' OR p_content LIKE '%Jamaica%' 
          OR p_name LIKE '%Kingston%' OR p_content LIKE '%Kingston%'
          OR p_name LIKE '%Montego Bay%' OR p_content LIKE '%Montego Bay%'
          OR p_name LIKE '%Ocho Rios%' OR p_content LIKE '%Ocho Rios%')
    AND status = 1 
    AND is_publish = 1
    ORDER BY p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send(err);
    reply.send(results);
  });
};

// Get Puerto Rico packages
exports.getPuertoRicoPackages = (req, reply) => {
  const query = `
    SELECT * FROM tbl_packages 
    WHERE (p_name LIKE '%Puerto Rico%' OR p_content LIKE '%Puerto Rico%' 
          OR p_name LIKE '%San Juan%' OR p_content LIKE '%San Juan%')
    AND status = 1 
    AND is_publish = 1
    ORDER BY p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send(err);
    reply.send(results);
  });
};

// Get Argentina packages
exports.getArgentinaPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p
    LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Argentina%' OR p.p_content LIKE '%Argentina%' 
          OR p.p_name LIKE '%Buenos Aires%' OR p.p_content LIKE '%Buenos Aires%'
          OR p.p_name LIKE '%Mendoza%' OR p.p_content LIKE '%Mendoza%'
          OR p.p_name LIKE '%Patagonia%' OR p.p_content LIKE '%Patagonia%'
          OR p.p_name LIKE '%Iguazu%' OR p.p_content LIKE '%Iguazu%')
    AND p.status = 1 
    AND p.is_publish = 1
    GROUP BY p.id
    ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send({ error: 'Database error', details: err.message });
    const formattedPackages = results.map(pkg => {
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
        slug: pkg.p_slug,
        description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) : '',
        image: pkg.feature_img,
        duration: pkg.day_night || 'Multiple Days',
        price: actualPrice,
        savings: savings,
        currency: pkg.package_currency || 'SGD',
        cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1,
        isHalalFriendly: false,
        seatsLeft: Math.floor(Math.random() * 10) + 5,
        isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'),
        hasPriceData: minPrice !== null,
        ...pkg
      };
    });
    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get Bolivia packages
exports.getBoliviaPackages = (req, reply) => {
  const query = `
    SELECT * FROM tbl_packages 
    WHERE (p_name LIKE '%Bolivia%' OR p_content LIKE '%Bolivia%' 
          OR p_name LIKE '%La Paz%' OR p_content LIKE '%La Paz%'
          OR p_name LIKE '%Uyuni%' OR p_content LIKE '%Uyuni%'
          OR p_name LIKE '%Salar de Uyuni%' OR p_content LIKE '%Salar de Uyuni%')
    AND status = 1 
    AND is_publish = 1
    ORDER BY p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send(err);
    reply.send(results);
  });
};

// Get Brazil packages
exports.getBrazilPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p
    LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Brazil%' OR p.p_content LIKE '%Brazil%' 
          OR p.p_name LIKE '%Rio de Janeiro%' OR p.p_content LIKE '%Rio de Janeiro%'
          OR p.p_name LIKE '%Sao Paulo%' OR p.p_content LIKE '%Sao Paulo%'
          OR p.p_name LIKE '%Amazon%' OR p.p_content LIKE '%Amazon%'
          OR p.p_name LIKE '%Iguazu%' OR p.p_content LIKE '%Iguazu%')
    AND p.status = 1 
    AND p.is_publish = 1
    GROUP BY p.id
    ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send({ error: 'Database error', details: err.message });
    const formattedPackages = results.map(pkg => {
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
        slug: pkg.p_slug,
        description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) : '',
        image: pkg.feature_img,
        duration: pkg.day_night || 'Multiple Days',
        price: actualPrice,
        savings: savings,
        currency: pkg.package_currency || 'SGD',
        cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1,
        isHalalFriendly: false,
        seatsLeft: Math.floor(Math.random() * 10) + 5,
        isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'),
        hasPriceData: minPrice !== null,
        ...pkg
      };
    });
    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get Chile packages
exports.getChilePackages = (req, reply) => {
  const query = `
    SELECT * FROM tbl_packages 
    WHERE (p_name LIKE '%Chile%' OR p_content LIKE '%Chile%' 
          OR p_name LIKE '%Santiago%' OR p_content LIKE '%Santiago%'
          OR p_name LIKE '%Atacama%' OR p_content LIKE '%Atacama%'
          OR p_name LIKE '%Patagonia%' OR p_content LIKE '%Patagonia%')
    AND status = 1 
    AND is_publish = 1
    ORDER BY p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send(err);
    reply.send(results);
  });
};

// Get Colombia packages
exports.getColombiaPackages = (req, reply) => {
  const query = `
    SELECT * FROM tbl_packages 
    WHERE (p_name LIKE '%Colombia%' OR p_content LIKE '%Colombia%' 
          OR p_name LIKE '%Bogota%' OR p_content LIKE '%Bogota%'
          OR p_name LIKE '%Cartagena%' OR p_content LIKE '%Cartagena%'
          OR p_name LIKE '%Medellin%' OR p_content LIKE '%Medellin%')
    AND status = 1 
    AND is_publish = 1
    ORDER BY p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send(err);
    reply.send(results);
  });
};

// Get Ecuador packages
exports.getEcuadorPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p
    LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Ecuador%' OR p.p_content LIKE '%Ecuador%' 
          OR p.p_name LIKE '%Quito%' OR p.p_content LIKE '%Quito%'
          OR p.p_name LIKE '%Galapagos%' OR p.p_content LIKE '%Galapagos%'
          OR p.p_name LIKE '%Guayaquil%' OR p.p_content LIKE '%Guayaquil%')
    AND p.status = 1 
    AND p.is_publish = 1
    GROUP BY p.id
    ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send({ error: 'Database error', details: err.message });
    const formattedPackages = results.map(pkg => {
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
        slug: pkg.p_slug,
        description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) : '',
        image: pkg.feature_img,
        duration: pkg.day_night || 'Multiple Days',
        price: actualPrice,
        savings: savings,
        currency: pkg.package_currency || 'SGD',
        cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1,
        isHalalFriendly: false,
        seatsLeft: Math.floor(Math.random() * 10) + 5,
        isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'),
        hasPriceData: minPrice !== null,
        ...pkg
      };
    });
    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get Peru packages
exports.getPeruPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p
    LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Peru%' OR p.p_content LIKE '%Peru%' 
          OR p.p_name LIKE '%Lima%' OR p.p_content LIKE '%Lima%'
          OR p.p_name LIKE '%Machu Picchu%' OR p.p_content LIKE '%Machu Picchu%'
          OR p.p_name LIKE '%Cusco%' OR p.p_content LIKE '%Cusco%')
    AND p.status = 1 
    AND p.is_publish = 1
    GROUP BY p.id
    ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send({ error: 'Database error', details: err.message });
    const formattedPackages = results.map(pkg => {
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
        slug: pkg.p_slug,
        description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) : '',
        image: pkg.feature_img,
        duration: pkg.day_night || 'Multiple Days',
        price: actualPrice,
        savings: savings,
        currency: pkg.package_currency || 'SGD',
        cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1,
        isHalalFriendly: false,
        seatsLeft: Math.floor(Math.random() * 10) + 5,
        isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'),
        hasPriceData: minPrice !== null,
        ...pkg
      };
    });
    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get Uruguay packages
exports.getUruguayPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p
    LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Uruguay%' OR p.p_content LIKE '%Uruguay%' 
          OR p.p_name LIKE '%Montevideo%' OR p.p_content LIKE '%Montevideo%'
          OR p.p_name LIKE '%Punta del Este%' OR p.p_content LIKE '%Punta del Este%'
          OR p.p_name LIKE '%Colonia%' OR p.p_content LIKE '%Colonia%')
    AND p.status = 1 
    AND p.is_publish = 1
    GROUP BY p.id
    ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send({ error: 'Database error', details: err.message });
    const formattedPackages = results.map(pkg => {
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
        slug: pkg.p_slug,
        description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) : '',
        image: pkg.feature_img,
        duration: pkg.day_night || 'Multiple Days',
        price: actualPrice,
        savings: savings,
        currency: pkg.package_currency || 'SGD',
        cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1,
        isHalalFriendly: false,
        seatsLeft: Math.floor(Math.random() * 10) + 5,
        isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'),
        hasPriceData: minPrice !== null,
        ...pkg
      };
    });
    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get Venezuela packages
exports.getVenezuelaPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p
    LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Venezuela%' OR p.p_content LIKE '%Venezuela%' 
          OR p.p_name LIKE '%Caracas%' OR p.p_content LIKE '%Caracas%'
          OR p.p_name LIKE '%Angel Falls%' OR p.p_content LIKE '%Angel Falls%'
          OR p.p_name LIKE '%Margarita%' OR p.p_content LIKE '%Margarita%')
    AND p.status = 1 
    AND p.is_publish = 1
    GROUP BY p.id
    ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send({ error: 'Database error', details: err.message });
    const formattedPackages = results.map(pkg => {
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
        slug: pkg.p_slug,
        description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) : '',
        image: pkg.feature_img,
        duration: pkg.day_night || 'Multiple Days',
        price: actualPrice,
        savings: savings,
        currency: pkg.package_currency || 'SGD',
        cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1,
        isHalalFriendly: false,
        seatsLeft: Math.floor(Math.random() * 10) + 5,
        isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'),
        hasPriceData: minPrice !== null,
        ...pkg
      };
    });
    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get Alaska packages
exports.getAlaskaPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p
    LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Alaska%' OR p.p_content LIKE '%Alaska%' 
          OR p.p_name LIKE '%Anchorage%' OR p.p_content LIKE '%Anchorage%'
          OR p.p_name LIKE '%Denali%' OR p.p_content LIKE '%Denali%'
          OR p.p_name LIKE '%Fairbanks%' OR p.p_content LIKE '%Fairbanks%')
    AND p.status = 1 
    AND p.is_publish = 1
    GROUP BY p.id
    ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send({ error: 'Database error', details: err.message });
    const formattedPackages = results.map(pkg => {
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
        slug: pkg.p_slug,
        description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) : '',
        image: pkg.feature_img,
        duration: pkg.day_night || 'Multiple Days',
        price: actualPrice,
        savings: savings,
        currency: pkg.package_currency || 'SGD',
        cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1,
        isHalalFriendly: false,
        seatsLeft: Math.floor(Math.random() * 10) + 5,
        isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'),
        hasPriceData: minPrice !== null,
        ...pkg
      };
    });
    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get Canada packages
exports.getCanadaPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p
    LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Canada%' OR p.p_content LIKE '%Canada%' 
          OR p.p_name LIKE '%Toronto%' OR p.p_content LIKE '%Toronto%'
          OR p.p_name LIKE '%Vancouver%' OR p.p_content LIKE '%Vancouver%'
          OR p.p_name LIKE '%Montreal%' OR p.p_content LIKE '%Montreal%'
          OR p.p_name LIKE '%Ottawa%' OR p.p_content LIKE '%Ottawa%')
    AND p.status = 1 
    AND p.is_publish = 1
    GROUP BY p.id
    ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send({ error: 'Database error', details: err.message });
    const formattedPackages = results.map(pkg => {
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
        slug: pkg.p_slug,
        description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) : '',
        image: pkg.feature_img,
        duration: pkg.day_night || 'Multiple Days',
        price: actualPrice,
        savings: savings,
        currency: pkg.package_currency || 'SGD',
        cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1,
        isHalalFriendly: false,
        seatsLeft: Math.floor(Math.random() * 10) + 5,
        isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'),
        hasPriceData: minPrice !== null,
        ...pkg
      };
    });
    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get Costa Rica packages
exports.getCostaRicaPackages = (req, reply) => {
  const query = `
    SELECT * FROM tbl_packages 
    WHERE (p_name LIKE '%Costa Rica%' OR p_content LIKE '%Costa Rica%' 
          OR p_name LIKE '%San Jose%' OR p_content LIKE '%San Jose%'
          OR p_name LIKE '%Manuel Antonio%' OR p_content LIKE '%Manuel Antonio%'
          OR p_name LIKE '%Monteverde%' OR p_content LIKE '%Monteverde%')
    AND status = 1 
    AND is_publish = 1
    ORDER BY p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send(err);
    reply.send(results);
  });
};

// Get Japan packages
exports.getJapanPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p
    LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Japan%' OR p.p_content LIKE '%Japan%' 
          OR p.p_name LIKE '%Tokyo%' OR p.p_content LIKE '%Tokyo%'
          OR p.p_name LIKE '%Kyoto%' OR p.p_content LIKE '%Kyoto%'
          OR p.p_name LIKE '%Osaka%' OR p.p_content LIKE '%Osaka%'
          OR p.p_name LIKE '%Hiroshima%' OR p.p_content LIKE '%Hiroshima%')
    AND p.status = 1 
    AND p.is_publish = 1
    GROUP BY p.id
    ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send({ error: 'Database error', details: err.message });
    const formattedPackages = results.map(pkg => {
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
        slug: pkg.p_slug,
        description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) : '',
        image: pkg.feature_img,
        duration: pkg.day_night || 'Multiple Days',
        price: actualPrice,
        savings: savings,
        currency: pkg.package_currency || 'SGD',
        cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1,
        isHalalFriendly: false,
        seatsLeft: Math.floor(Math.random() * 10) + 5,
        isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'),
        hasPriceData: minPrice !== null,
        ...pkg
      };
    });
    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get China packages
exports.getChinaPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p
    LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%China%' OR p.p_content LIKE '%China%' 
          OR p.p_name LIKE '%Beijing%' OR p.p_content LIKE '%Beijing%'
          OR p.p_name LIKE '%Shanghai%' OR p.p_content LIKE '%Shanghai%'
          OR p.p_name LIKE '%Great Wall%' OR p.p_content LIKE '%Great Wall%'
          OR p.p_name LIKE '%Xian%' OR p.p_content LIKE '%Xian%')
    AND p.status = 1 
    AND p.is_publish = 1
    GROUP BY p.id
    ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send({ error: 'Database error', details: err.message });
    const formattedPackages = results.map(pkg => {
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
        slug: pkg.p_slug,
        description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) : '',
        image: pkg.feature_img,
        duration: pkg.day_night || 'Multiple Days',
        price: actualPrice,
        savings: savings,
        currency: pkg.package_currency || 'SGD',
        cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1,
        isHalalFriendly: false,
        seatsLeft: Math.floor(Math.random() * 10) + 5,
        isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'),
        hasPriceData: minPrice !== null,
        ...pkg
      };
    });
    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get India packages
exports.getIndiaPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p
    LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%India%' OR p.p_content LIKE '%India%' 
          OR p.p_name LIKE '%Delhi%' OR p.p_content LIKE '%Delhi%'
          OR p.p_name LIKE '%Mumbai%' OR p.p_content LIKE '%Mumbai%'
          OR p.p_name LIKE '%Taj Mahal%' OR p.p_content LIKE '%Taj Mahal%'
          OR p.p_name LIKE '%Rajasthan%' OR p.p_content LIKE '%Rajasthan%'
          OR p.p_name LIKE '%Kerala%' OR p.p_content LIKE '%Kerala%')
    AND p.status = 1 
    AND p.is_publish = 1
    GROUP BY p.id
    ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send({ error: 'Database error', details: err.message });
    const formattedPackages = results.map(pkg => {
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
        slug: pkg.p_slug,
        description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) : '',
        image: pkg.feature_img,
        duration: pkg.day_night || 'Multiple Days',
        price: actualPrice,
        savings: savings,
        currency: pkg.package_currency || 'SGD',
        cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1,
        isHalalFriendly: false,
        seatsLeft: Math.floor(Math.random() * 10) + 5,
        isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'),
        hasPriceData: minPrice !== null,
        ...pkg
      };
    });
    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get Mexico packages
exports.getMexicoPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p
    LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Mexico%' OR p.p_content LIKE '%Mexico%' 
          OR p.p_name LIKE '%Cancun%' OR p.p_content LIKE '%Cancun%'
          OR p.p_name LIKE '%Mexico City%' OR p.p_content LIKE '%Mexico City%'
          OR p.p_name LIKE '%Playa del Carmen%' OR p.p_content LIKE '%Playa del Carmen%'
          OR p.p_name LIKE '%Tulum%' OR p.p_content LIKE '%Tulum%')
    AND p.status = 1 
    AND p.is_publish = 1
    GROUP BY p.id
    ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send({ error: 'Database error', details: err.message });
    const formattedPackages = results.map(pkg => {
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
        slug: pkg.p_slug,
        description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) : '',
        image: pkg.feature_img,
        duration: pkg.day_night || 'Multiple Days',
        price: actualPrice,
        savings: savings,
        currency: pkg.package_currency || 'SGD',
        cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1,
        isHalalFriendly: false,
        seatsLeft: Math.floor(Math.random() * 10) + 5,
        isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'),
        hasPriceData: minPrice !== null,
        ...pkg
      };
    });
    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get Panama packages
exports.getPanamaPackages = (req, reply) => {
  const query = `
    SELECT * FROM tbl_packages 
    WHERE (p_name LIKE '%Panama%' OR p_content LIKE '%Panama%' 
          OR p_name LIKE '%Panama City%' OR p_content LIKE '%Panama City%'
          OR p_name LIKE '%Bocas del Toro%' OR p_content LIKE '%Bocas del Toro%'
          OR p_name LIKE '%San Blas%' OR p_content LIKE '%San Blas%')
    AND status = 1 
    AND is_publish = 1
    ORDER BY p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send(err);
    reply.send(results);
  });
};

// Get United States packages
exports.getUnitedStatesPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p
    LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%United States%' OR p.p_content LIKE '%United States%' 
          OR p.p_name LIKE '%USA%' OR p.p_content LIKE '%USA%'
          OR p.p_name LIKE '%New York%' OR p.p_content LIKE '%New York%'
          OR p.p_name LIKE '%Los Angeles%' OR p.p_content LIKE '%Los Angeles%'
          OR p.p_name LIKE '%Las Vegas%' OR p.p_content LIKE '%Las Vegas%'
          OR p.p_name LIKE '%San Francisco%' OR p.p_content LIKE '%San Francisco%')
    AND p.status = 1 
    AND p.is_publish = 1
    GROUP BY p.id
    ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send({ error: 'Database error', details: err.message });
    const formattedPackages = results.map(pkg => {
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
        slug: pkg.p_slug,
        description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) : '',
        image: pkg.feature_img,
        duration: pkg.day_night || 'Multiple Days',
        price: actualPrice,
        savings: savings,
        currency: pkg.package_currency || 'SGD',
        cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1,
        isHalalFriendly: false,
        seatsLeft: Math.floor(Math.random() * 10) + 5,
        isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'),
        hasPriceData: minPrice !== null,
        ...pkg
      };
    });
    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get Armenia packages
exports.getArmeniaPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p
    LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Armenia%' OR p.p_content LIKE '%Armenia%' 
          OR p.p_name LIKE '%Yerevan%' OR p.p_content LIKE '%Yerevan%'
          OR p.p_name LIKE '%Gyumri%' OR p.p_content LIKE '%Gyumri%'
          OR p.p_name LIKE '%Vanadzor%' OR p.p_content LIKE '%Vanadzor%')
    AND p.status = 1 
    AND p.is_publish = 1
    GROUP BY p.id
    ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send({ error: 'Database error', details: err.message });
    const formattedPackages = results.map(pkg => {
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
        slug: pkg.p_slug,
        description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) : '',
        image: pkg.feature_img,
        duration: pkg.day_night || 'Multiple Days',
        price: actualPrice,
        savings: savings,
        currency: pkg.package_currency || 'SGD',
        cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1,
        isHalalFriendly: false,
        seatsLeft: Math.floor(Math.random() * 10) + 5,
        isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'),
        hasPriceData: minPrice !== null,
        ...pkg
      };
    });
    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get Azerbaijan packages
exports.getAzerbaijanPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p
    LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Azerbaijan%' OR p.p_content LIKE '%Azerbaijan%' 
          OR p.p_name LIKE '%Baku%' OR p.p_content LIKE '%Baku%'
          OR p.p_name LIKE '%Ganja%' OR p.p_content LIKE '%Ganja%'
          OR p.p_name LIKE '%Sumgayit%' OR p.p_content LIKE '%Sumgayit%')
    AND p.status = 1 
    AND p.is_publish = 1
    GROUP BY p.id
    ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send({ error: 'Database error', details: err.message });
    const formattedPackages = results.map(pkg => {
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
        slug: pkg.p_slug,
        description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) : '',
        image: pkg.feature_img,
        duration: pkg.day_night || 'Multiple Days',
        price: actualPrice,
        savings: savings,
        currency: pkg.package_currency || 'SGD',
        cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1,
        isHalalFriendly: false,
        seatsLeft: Math.floor(Math.random() * 10) + 5,
        isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'),
        hasPriceData: minPrice !== null,
        ...pkg
      };
    });
    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get Bahrain packages
exports.getBahrainPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p
    LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Bahrain%' OR p.p_content LIKE '%Bahrain%' 
          OR p.p_name LIKE '%Manama%' OR p.p_content LIKE '%Manama%'
          OR p.p_name LIKE '%Muharraq%' OR p.p_content LIKE '%Muharraq%'
          OR p.p_name LIKE '%Riffa%' OR p.p_content LIKE '%Riffa%')
    AND p.status = 1 
    AND p.is_publish = 1
    GROUP BY p.id
    ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send({ error: 'Database error', details: err.message });
    const formattedPackages = results.map(pkg => {
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
        slug: pkg.p_slug,
        description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) : '',
        image: pkg.feature_img,
        duration: pkg.day_night || 'Multiple Days',
        price: actualPrice,
        savings: savings,
        currency: pkg.package_currency || 'SGD',
        cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1,
        isHalalFriendly: false,
        seatsLeft: Math.floor(Math.random() * 10) + 5,
        isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'),
        hasPriceData: minPrice !== null,
        ...pkg
      };
    });
    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get Bangladesh packages
exports.getBangladeshPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p
    LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Bangladesh%' OR p.p_content LIKE '%Bangladesh%' 
          OR p.p_name LIKE '%Dhaka%' OR p.p_content LIKE '%Dhaka%'
          OR p.p_name LIKE '%Chittagong%' OR p.p_content LIKE '%Chittagong%'
          OR p.p_name LIKE '%Cox Bazar%' OR p.p_content LIKE '%Cox Bazar%'
          OR p.p_name LIKE '%Sylhet%' OR p.p_content LIKE '%Sylhet%')
    AND p.status = 1 
    AND p.is_publish = 1
    GROUP BY p.id
    ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send({ error: 'Database error', details: err.message });
    const formattedPackages = results.map(pkg => {
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
        slug: pkg.p_slug,
        description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) : '',
        image: pkg.feature_img,
        duration: pkg.day_night || 'Multiple Days',
        price: actualPrice,
        savings: savings,
        currency: pkg.package_currency || 'SGD',
        cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1,
        isHalalFriendly: false,
        seatsLeft: Math.floor(Math.random() * 10) + 5,
        isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'),
        hasPriceData: minPrice !== null,
        ...pkg
      };
    });
    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get Bhutan packages
exports.getBhutanPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p
    LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Bhutan%' OR p.p_content LIKE '%Bhutan%' 
          OR p.p_name LIKE '%Thimphu%' OR p.p_content LIKE '%Thimphu%'
          OR p.p_name LIKE '%Punakha%' OR p.p_content LIKE '%Punakha%'
          OR p.p_name LIKE '%Tigers Nest%' OR p.p_content LIKE '%Tigers Nest%')
    AND p.p_name NOT LIKE '%Paros%'
    AND p.p_name NOT LIKE '%Greece%'
    AND p.status = 1 
    AND p.is_publish = 1
    GROUP BY p.id
    ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send({ error: 'Database error', details: err.message });
    const formattedPackages = results.map(pkg => {
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
        slug: pkg.p_slug,
        description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) : '',
        image: pkg.feature_img,
        duration: pkg.day_night || 'Multiple Days',
        price: actualPrice,
        savings: savings,
        currency: pkg.package_currency || 'SGD',
        cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1,
        isHalalFriendly: false,
        seatsLeft: Math.floor(Math.random() * 10) + 5,
        isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'),
        hasPriceData: minPrice !== null,
        ...pkg
      };
    });
    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get Georgia packages
exports.getGeorgiaPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p
    LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Georgia%' OR p.p_content LIKE '%Georgia%' 
          OR p.p_name LIKE '%Tbilisi%' OR p.p_content LIKE '%Tbilisi%'
          OR p.p_name LIKE '%Batumi%' OR p.p_content LIKE '%Batumi%'
          OR p.p_name LIKE '%Kutaisi%' OR p.p_content LIKE '%Kutaisi%'
          OR p.p_name LIKE '%Svaneti%' OR p.p_content LIKE '%Svaneti%')
    AND p.status = 1 
    AND p.is_publish = 1
    GROUP BY p.id
    ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send({ error: 'Database error', details: err.message });
    const formattedPackages = results.map(pkg => {
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
        slug: pkg.p_slug,
        description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) : '',
        image: pkg.feature_img,
        duration: pkg.day_night || 'Multiple Days',
        price: actualPrice,
        savings: savings,
        currency: pkg.package_currency || 'SGD',
        cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1,
        isHalalFriendly: false,
        seatsLeft: Math.floor(Math.random() * 10) + 5,
        isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'),
        hasPriceData: minPrice !== null,
        ...pkg
      };
    });
    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get Iran packages
exports.getIranPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p
    LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Iran%' OR p.p_content LIKE '%Iran%' 
          OR p.p_name LIKE '%Tehran%' OR p.p_content LIKE '%Tehran%'
          OR p.p_name LIKE '%Isfahan%' OR p.p_content LIKE '%Isfahan%'
          OR p.p_name LIKE '%Shiraz%' OR p.p_content LIKE '%Shiraz%'
          OR p.p_name LIKE '%Persepolis%' OR p.p_content LIKE '%Persepolis%')
    AND p.status = 1 
    AND p.is_publish = 1
    GROUP BY p.id
    ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send({ error: 'Database error', details: err.message });
    const formattedPackages = results.map(pkg => {
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
        slug: pkg.p_slug,
        description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) : '',
        image: pkg.feature_img,
        duration: pkg.day_night || 'Multiple Days',
        price: actualPrice,
        savings: savings,
        currency: pkg.package_currency || 'SGD',
        cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1,
        isHalalFriendly: false,
        seatsLeft: Math.floor(Math.random() * 10) + 5,
        isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'),
        hasPriceData: minPrice !== null,
        ...pkg
      };
    });
    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get Batam packages
exports.getBatamPackages = (req, reply) => {
  const query = `
    SELECT * FROM tbl_packages 
    WHERE (p_name LIKE '%Batam%' OR p_content LIKE '%Batam%' 
          OR p_name LIKE '%Nagoya%' OR p_content LIKE '%Nagoya%'
          OR p_name LIKE '%Sekupang%' OR p_content LIKE '%Sekupang%'
          OR p_name LIKE '%Waterfront%' OR p_content LIKE '%Waterfront%')
    AND status = 1 
    AND is_publish = 1
    ORDER BY p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send(err);
    reply.send(results);
  });
};

// Get Bintan Islands packages
exports.getBintanIslandsPackages = (req, reply) => {
  const query = `
    SELECT * FROM tbl_packages 
    WHERE (p_name LIKE '%Bintan%' OR p_content LIKE '%Bintan%' 
          OR p_name LIKE '%Bintan Island%' OR p_content LIKE '%Bintan Island%'
          OR p_name LIKE '%Tanjung Pinang%' OR p_content LIKE '%Tanjung Pinang%'
          OR p_name LIKE '%Lagoi%' OR p_content LIKE '%Lagoi%'
          OR p_name LIKE '%Nirwana%' OR p_content LIKE '%Nirwana%')
    AND status = 1 
    AND is_publish = 1
    ORDER BY p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send(err);
    reply.send(results);
  });
};

// Get Brunei Darussalam packages
exports.getBruneiDarussalamPackages = (req, reply) => {
  const query = `
    SELECT * FROM tbl_packages 
    WHERE (p_name LIKE '%Brunei%' OR p_content LIKE '%Brunei%' 
          OR p_name LIKE '%Bandar Seri Begawan%' OR p_content LIKE '%Bandar Seri Begawan%'
          OR p_name LIKE '%Seria%' OR p_content LIKE '%Seria%'
          OR p_name LIKE '%Kuala Belait%' OR p_content LIKE '%Kuala Belait%'
          OR p_name LIKE '%Tutong%' OR p_content LIKE '%Tutong%')
    AND status = 1 
    AND is_publish = 1
    ORDER BY p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send(err);
    reply.send(results);
  });
};

// Get Cambodia packages
exports.getCambodiaPackages = (req, reply) => {
  const query = `
    SELECT * FROM tbl_packages 
    WHERE (p_name LIKE '%Cambodia%' OR p_content LIKE '%Cambodia%' 
          OR p_name LIKE '%Phnom Penh%' OR p_content LIKE '%Phnom Penh%'
          OR p_name LIKE '%Siem Reap%' OR p_content LIKE '%Siem Reap%'
          OR p_name LIKE '%Angkor Wat%' OR p_content LIKE '%Angkor Wat%'
          OR p_name LIKE '%Battambang%' OR p_content LIKE '%Battambang%'
          OR p_name LIKE '%Sihanoukville%' OR p_content LIKE '%Sihanoukville%')
    AND status = 1 
    AND is_publish = 1
    ORDER BY p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send(err);
    reply.send(results);
  });
};

// Get Indonesia packages
exports.getIndonesiaPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Indonesia%'
          OR p.p_name LIKE '%Bali%'
          OR p.p_name LIKE '%Jakarta%'
          OR p.country_id = '77')
    AND p.status = 1 AND p.is_publish = 1
    GROUP BY p.id ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error fetching Indonesia packages:', err);
      return reply.status(500).send({ error: 'Database error', details: err.message });
    }
    
    if (!results || results.length === 0) {
      return reply.send({ success: true, packages: [] });
    }
    
    const formattedPackages = results.map(pkg => {
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
    
    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get Laos packages
exports.getLaosPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Laos%'
          OR p.p_name LIKE '%Vientiane%'
          OR p.p_name LIKE '%Luang Prabang%')
    AND p.status = 1 AND p.is_publish = 1
    GROUP BY p.id ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error fetching Laos packages:', err);
      return reply.status(500).send({ error: 'Database error', details: err.message });
    }
    if (!results || results.length === 0) {
      return reply.send({ success: true, packages: [] });
    }
    const formattedPackages = results.map(pkg => {
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
        id: pkg.id, title: pkg.p_name, slug: pkg.p_slug || pkg.p_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : '',
        image: pkg.feature_img, duration: pkg.day_night || 'Multiple Days', price: actualPrice, savings: savings,
        currency: pkg.package_currency || 'SGD', cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1,
        isHalalFriendly: pkg.display_type && pkg.display_type.includes('halal'), seatsLeft: (pkg.id % 15) + 5,
        isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'), hasPriceData: minPrice !== null
      };
    });
    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get Malaysia packages
exports.getMalaysiaPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Malaysia%'
          OR p.p_name LIKE '%Kuala Lumpur%'
          OR p.p_name LIKE '%Penang%'
          OR p.country_id = '129')
    AND p.status = 1 AND p.is_publish = 1
    GROUP BY p.id ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error fetching Malaysia packages:', err);
      return reply.status(500).send({ error: 'Database error', details: err.message });
    }
    if (!results || results.length === 0) {
      return reply.send({ success: true, packages: [] });
    }
    const formattedPackages = results.map(pkg => {
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
        id: pkg.id, title: pkg.p_name, slug: pkg.p_slug || pkg.p_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : '',
        image: pkg.feature_img, duration: pkg.day_night || 'Multiple Days', price: actualPrice, savings: savings,
        currency: pkg.package_currency || 'SGD', cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1,
        isHalalFriendly: pkg.display_type && pkg.display_type.includes('halal'), seatsLeft: (pkg.id % 15) + 5,
        isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'), hasPriceData: minPrice !== null
      };
    });
    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get Iraq packages
exports.getIraqPackages = (req, reply) => {
  const query = `
    SELECT * FROM tbl_packages 
    WHERE (p_name LIKE '%Iraq%' OR p_content LIKE '%Iraq%' 
          OR p_name LIKE '%Baghdad%' OR p_content LIKE '%Baghdad%'
          OR p_name LIKE '%Basra%' OR p_content LIKE '%Basra%'
          OR p_name LIKE '%Erbil%' OR p_content LIKE '%Erbil%'
          OR p_name LIKE '%Najaf%' OR p_content LIKE '%Najaf%'
          OR p_name LIKE '%Karbala%' OR p_content LIKE '%Karbala%'
          OR p_name LIKE '%Babylon%' OR p_content LIKE '%Babylon%')
    AND status = 1 
    AND is_publish = 1
    AND p_name NOT LIKE '%Taiwan%'
    ORDER BY p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send(err);
    reply.send(results);
  });
};

// Get Israel packages
exports.getIsraelPackages = (req, reply) => {
  const query = `
    SELECT * FROM tbl_packages 
    WHERE (p_name LIKE '%Israel%' OR p_content LIKE '%Israel%' 
          OR p_name LIKE '%Jerusalem%' OR p_content LIKE '%Jerusalem%'
          OR p_name LIKE '%Tel Aviv%' OR p_content LIKE '%Tel Aviv%'
          OR p_name LIKE '%Haifa%' OR p_content LIKE '%Haifa%'
          OR p_name LIKE '%Nazareth%' OR p_content LIKE '%Nazareth%'
          OR p_name LIKE '%Bethlehem%' OR p_content LIKE '%Bethlehem%')
    AND status = 1 
    AND is_publish = 1
    AND p_name NOT LIKE '%Egypt%'
    AND p_name NOT LIKE '%Taiwan%'
    ORDER BY p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send(err);
    reply.send(results);
  });
};

// Get Jordan packages
exports.getJordanPackages = (req, reply) => {
  const query = `
    SELECT * FROM tbl_packages 
    WHERE (p_name LIKE '%Jordan%' OR p_content LIKE '%Jordan%' 
          OR p_name LIKE '%Amman%' OR p_content LIKE '%Amman%'
          OR p_name LIKE '%Petra%' OR p_content LIKE '%Petra%'
          OR p_name LIKE '%Aqaba%' OR p_content LIKE '%Aqaba%'
          OR p_name LIKE '%Wadi Rum%' OR p_content LIKE '%Wadi Rum%'
          OR p_name LIKE '%Jerash%' OR p_content LIKE '%Jerash%'
          OR p_name LIKE '%Dead Sea%' OR p_content LIKE '%Dead Sea%')
    AND status = 1 
    AND is_publish = 1
    AND p_name NOT LIKE '%Egypt%'
    AND p_name NOT LIKE '%Taiwan%'
    ORDER BY p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send(err);
    reply.send(results);
  });
};

// Get Kuwait packages
exports.getKuwaitPackages = (req, reply) => {
  const query = `
    SELECT * FROM tbl_packages 
    WHERE (p_name LIKE '%Kuwait%' OR p_content LIKE '%Kuwait%' 
          OR p_name LIKE '%Kuwait City%' OR p_content LIKE '%Kuwait City%'
          OR p_name LIKE '%Hawalli%' OR p_content LIKE '%Hawalli%'
          OR p_name LIKE '%Ahmadi%' OR p_content LIKE '%Ahmadi%'
          OR p_name LIKE '%Jahra%' OR p_content LIKE '%Jahra%'
          OR p_name LIKE '%Salmiya%' OR p_content LIKE '%Salmiya%')
    AND status = 1 
    AND is_publish = 1
    AND p_name NOT LIKE '%Taiwan%'
    ORDER BY p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send(err);
    reply.send(results);
  });
};

// Get Lebanon packages
exports.getLebanonPackages = (req, reply) => {
  const query = `
    SELECT * FROM tbl_packages 
    WHERE (p_name LIKE '%Lebanon%' OR p_content LIKE '%Lebanon%' 
          OR p_name LIKE '%Beirut%' OR p_content LIKE '%Beirut%'
          OR p_name LIKE '%Tripoli%' OR p_content LIKE '%Tripoli%'
          OR p_name LIKE '%Sidon%' OR p_content LIKE '%Sidon%'
          OR p_name LIKE '%Tyre%' OR p_content LIKE '%Tyre%'
          OR p_name LIKE '%Baalbek%' OR p_content LIKE '%Baalbek%'
          OR p_name LIKE '%Byblos%' OR p_content LIKE '%Byblos%')
    AND status = 1 
    AND is_publish = 1
    AND p_name NOT LIKE '%Taiwan%'
    ORDER BY p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send(err);
    reply.send(results);
  });
};

// Get Syria packages
exports.getSyriaPackages = (req, reply) => {
  const query = `
    SELECT * FROM tbl_packages 
    WHERE (p_name LIKE '%Syria%' OR p_content LIKE '%Syria%' 
          OR p_name LIKE '%Damascus%' OR p_content LIKE '%Damascus%'
          OR p_name LIKE '%Aleppo%' OR p_content LIKE '%Aleppo%'
          OR p_name LIKE '%Homs%' OR p_content LIKE '%Homs%'
          OR p_name LIKE '%Latakia%' OR p_content LIKE '%Latakia%'
          OR p_name LIKE '%Palmyra%' OR p_content LIKE '%Palmyra%'
          OR p_name LIKE '%Syrian%' OR p_content LIKE '%Syrian%'
          OR p_slug LIKE '%syria%')
    AND status = 1 
    AND is_publish = 1
    ORDER BY p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send(err);
    
    const packagesWithSlugs = results.map(pkg => ({
      ...pkg,
      p_slug: pkg.p_slug || pkg.p_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    }));
    
    reply.send(packagesWithSlugs);
  });
};

// Get Turkey packages
exports.getTurkeyPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Turkey%' OR p.p_content LIKE '%Turkey%' 
          OR p.p_name LIKE '%Istanbul%' OR p.p_content LIKE '%Istanbul%'
          OR p.p_name LIKE '%Ankara%' OR p.p_content LIKE '%Ankara%'
          OR p.p_name LIKE '%Izmir%' OR p.p_content LIKE '%Izmir%'
          OR p.p_name LIKE '%Antalya%' OR p.p_content LIKE '%Antalya%'
          OR p.p_name LIKE '%Cappadocia%' OR p.p_content LIKE '%Cappadocia%'
          OR p.p_name LIKE '%Pamukkale%' OR p.p_content LIKE '%Pamukkale%'
          OR p.p_name LIKE '%Ephesus%' OR p.p_content LIKE '%Ephesus%'
          OR p.p_name LIKE '%Turkish%' OR p.p_content LIKE '%Turkish%'
          OR p.p_name LIKE '%Bosphorus%' OR p.p_content LIKE '%Bosphorus%'
          OR p.p_slug LIKE '%turkey%')
    AND p.status = 1 AND p.is_publish = 1
    GROUP BY p.id ORDER BY p.p_name
  `;
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send({ error: 'Database error', details: err.message });
    const formattedPackages = results.map(pkg => {
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
      return { id: pkg.id, title: pkg.p_name, slug: pkg.p_slug, description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) : '', image: pkg.feature_img, duration: pkg.day_night || 'Multiple Days', price: actualPrice, savings: savings, currency: pkg.package_currency || 'SGD', cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1, isHalalFriendly: false, seatsLeft: Math.floor(Math.random() * 10) + 5, isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'), hasPriceData: minPrice !== null, ...pkg };
    });
    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get UAE packages
exports.getUAEPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%UAE%' OR p.p_content LIKE '%UAE%' 
          OR p.p_name LIKE '%United Arab Emirates%' OR p.p_content LIKE '%United Arab Emirates%'
          OR p.p_name LIKE '%Dubai%' OR p.p_content LIKE '%Dubai%'
          OR p.p_name LIKE '%Abu Dhabi%' OR p.p_content LIKE '%Abu Dhabi%'
          OR p.p_name LIKE '%Sharjah%' OR p.p_content LIKE '%Sharjah%'
          OR p.p_name LIKE '%Ajman%' OR p.p_content LIKE '%Ajman%'
          OR p.p_name LIKE '%Fujairah%' OR p.p_content LIKE '%Fujairah%'
          OR p.p_name LIKE '%Ras Al Khaimah%' OR p.p_content LIKE '%Ras Al Khaimah%'
          OR p.p_name LIKE '%Emirates%' OR p.p_content LIKE '%Emirates%'
          OR p.p_slug LIKE '%uae%' OR p.p_slug LIKE '%dubai%' OR p.p_slug LIKE '%abu-dhabi%')
    AND p.status = 1 AND p.is_publish = 1
    GROUP BY p.id ORDER BY p.p_name
  `;
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send({ error: 'Database error', details: err.message });
    const formattedPackages = results.map(pkg => {
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
      return { id: pkg.id, title: pkg.p_name, slug: pkg.p_slug, description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) : '', image: pkg.feature_img, duration: pkg.day_night || 'Multiple Days', price: actualPrice, savings: savings, currency: pkg.package_currency || 'SGD', cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1, isHalalFriendly: false, seatsLeft: Math.floor(Math.random() * 10) + 5, isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'), hasPriceData: minPrice !== null, ...pkg };
    });
    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get Yemen packages
exports.getYemenPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Yemen%' OR p.p_content LIKE '%Yemen%' 
          OR p.p_name LIKE '%Sanaa%' OR p.p_content LIKE '%Sanaa%'
          OR p.p_name LIKE '%Aden%' OR p.p_content LIKE '%Aden%'
          OR p.p_name LIKE '%Taiz%' OR p.p_content LIKE '%Taiz%'
          OR p.p_name LIKE '%Hodeidah%' OR p.p_content LIKE '%Hodeidah%'
          OR p.p_name LIKE '%Ibb%' OR p.p_content LIKE '%Ibb%'
          OR p.p_name LIKE '%Mukalla%' OR p.p_content LIKE '%Mukalla%'
          OR p.p_name LIKE '%Yemeni%' OR p.p_content LIKE '%Yemeni%'
          OR p.p_slug LIKE '%yemen%')
    AND p.status = 1 AND p.is_publish = 1
    GROUP BY p.id ORDER BY p.p_name
  `;
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send({ error: 'Database error', details: err.message });
    const formattedPackages = results.map(pkg => {
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
      return { id: pkg.id, title: pkg.p_name, slug: pkg.p_slug, description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) : '', image: pkg.feature_img, duration: pkg.day_night || 'Multiple Days', price: actualPrice, savings: savings, currency: pkg.package_currency || 'SGD', cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1, isHalalFriendly: false, seatsLeft: Math.floor(Math.random() * 10) + 5, isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'), hasPriceData: minPrice !== null, ...pkg };
    });
    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get Albania packages
exports.getAlbaniaPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Albania%' OR p.p_content LIKE '%Albania%' 
          OR p.p_name LIKE '%Tirana%' OR p.p_content LIKE '%Tirana%'
          OR p.p_name LIKE '%Durres%' OR p.p_content LIKE '%Durres%'
          OR p.p_name LIKE '%Vlore%' OR p.p_content LIKE '%Vlore%'
          OR p.p_name LIKE '%Shkoder%' OR p.p_content LIKE '%Shkoder%'
          OR p.p_name LIKE '%Berat%' OR p.p_content LIKE '%Berat%'
          OR p.p_name LIKE '%Gjirokaster%' OR p.p_content LIKE '%Gjirokaster%')
    AND p.status = 1 AND p.is_publish = 1 AND p.p_name NOT LIKE '%Taiwan%'
    GROUP BY p.id ORDER BY p.p_name
  `;
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send({ error: 'Database error', details: err.message });
    const formattedPackages = results.map(pkg => {
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
      return { id: pkg.id, title: pkg.p_name, slug: pkg.p_slug, description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) : '', image: pkg.feature_img, duration: pkg.day_night || 'Multiple Days', price: actualPrice, savings: savings, currency: pkg.package_currency || 'SGD', cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1, isHalalFriendly: false, seatsLeft: Math.floor(Math.random() * 10) + 5, isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'), hasPriceData: minPrice !== null, ...pkg };
    });
    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get Bosnia and Herzegovina packages
exports.getBosniaHerzegovinaPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Bosnia%' OR p.p_content LIKE '%Bosnia%' 
          OR p.p_name LIKE '%Herzegovina%' OR p.p_content LIKE '%Herzegovina%'
          OR p.p_name LIKE '%Sarajevo%' OR p.p_content LIKE '%Sarajevo%'
          OR p.p_name LIKE '%Mostar%' OR p.p_content LIKE '%Mostar%'
          OR p.p_name LIKE '%Banja Luka%' OR p.p_content LIKE '%Banja Luka%'
          OR p.p_name LIKE '%Tuzla%' OR p.p_content LIKE '%Tuzla%'
          OR p.p_name LIKE '%Zenica%' OR p.p_content LIKE '%Zenica%')
    AND p.status = 1 AND p.is_publish = 1 AND p.p_name NOT LIKE '%Taiwan%'
    GROUP BY p.id ORDER BY p.p_name
  `;
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send({ error: 'Database error', details: err.message });
    const formattedPackages = results.map(pkg => {
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
      return { id: pkg.id, title: pkg.p_name, slug: pkg.p_slug, description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) : '', image: pkg.feature_img, duration: pkg.day_night || 'Multiple Days', price: actualPrice, savings: savings, currency: pkg.package_currency || 'SGD', cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1, isHalalFriendly: false, seatsLeft: Math.floor(Math.random() * 10) + 5, isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'), hasPriceData: minPrice !== null, ...pkg };
    });
    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get Bulgaria packages
exports.getBulgariaPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Bulgaria%' OR p.p_content LIKE '%Bulgaria%' 
          OR p.p_name LIKE '%Sofia%' OR p.p_content LIKE '%Sofia%'
          OR p.p_name LIKE '%Plovdiv%' OR p.p_content LIKE '%Plovdiv%'
          OR p.p_name LIKE '%Varna%' OR p.p_content LIKE '%Varna%'
          OR p.p_name LIKE '%Burgas%' OR p.p_content LIKE '%Burgas%'
          OR p.p_name LIKE '%Ruse%' OR p.p_content LIKE '%Ruse%'
          OR p.p_name LIKE '%Stara Zagora%' OR p.p_content LIKE '%Stara Zagora%')
    AND p.status = 1 AND p.is_publish = 1 AND p.p_name NOT LIKE '%Taiwan%'
    GROUP BY p.id ORDER BY p.p_name
  `;
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send({ error: 'Database error', details: err.message });
    const formattedPackages = results.map(pkg => {
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
      return { id: pkg.id, title: pkg.p_name, slug: pkg.p_slug, description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) : '', image: pkg.feature_img, duration: pkg.day_night || 'Multiple Days', price: actualPrice, savings: savings, currency: pkg.package_currency || 'SGD', cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1, isHalalFriendly: false, seatsLeft: Math.floor(Math.random() * 10) + 5, isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'), hasPriceData: minPrice !== null, ...pkg };
    });
    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get Croatia packages
exports.getCroatiaPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Croatia%' OR p.p_content LIKE '%Croatia%' 
          OR p.p_name LIKE '%Zagreb%' OR p.p_content LIKE '%Zagreb%'
          OR p.p_name LIKE '%Split%' OR p.p_content LIKE '%Split%'
          OR p.p_name LIKE '%Dubrovnik%' OR p.p_content LIKE '%Dubrovnik%'
          OR p.p_name LIKE '%Pula%' OR p.p_content LIKE '%Pula%'
          OR p.p_name LIKE '%Zadar%' OR p.p_content LIKE '%Zadar%'
          OR p.p_name LIKE '%Hvar%' OR p.p_content LIKE '%Hvar%')
    AND p.status = 1 AND p.is_publish = 1 AND p.p_name NOT LIKE '%Taiwan%'
    GROUP BY p.id ORDER BY p.p_name
  `;
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send({ error: 'Database error', details: err.message });
    const formattedPackages = results.map(pkg => {
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
      return { id: pkg.id, title: pkg.p_name, slug: pkg.p_slug, description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) : '', image: pkg.feature_img, duration: pkg.day_night || 'Multiple Days', price: actualPrice, savings: savings, currency: pkg.package_currency || 'SGD', cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1, isHalalFriendly: false, seatsLeft: Math.floor(Math.random() * 10) + 5, isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'), hasPriceData: minPrice !== null, ...pkg };
    });
    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get Greece packages
exports.getGreecePackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Greece%' OR p.p_content LIKE '%Greece%' 
          OR p.p_name LIKE '%Athens%' OR p.p_content LIKE '%Athens%'
          OR p.p_name LIKE '%Thessaloniki%' OR p.p_content LIKE '%Thessaloniki%'
          OR p.p_name LIKE '%Santorini%' OR p.p_content LIKE '%Santorini%'
          OR p.p_name LIKE '%Mykonos%' OR p.p_content LIKE '%Mykonos%'
          OR p.p_name LIKE '%Crete%' OR p.p_content LIKE '%Crete%'
          OR p.p_name LIKE '%Rhodes%' OR p.p_content LIKE '%Rhodes%')
    AND p.status = 1 AND p.is_publish = 1 AND p.p_name NOT LIKE '%Taiwan%'
    GROUP BY p.id ORDER BY p.p_name
  `;
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send({ error: 'Database error', details: err.message });
    const formattedPackages = results.map(pkg => {
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
      return { id: pkg.id, title: pkg.p_name, slug: pkg.p_slug, description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) : '', image: pkg.feature_img, duration: pkg.day_night || 'Multiple Days', price: actualPrice, savings: savings, currency: pkg.package_currency || 'SGD', cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1, isHalalFriendly: false, seatsLeft: Math.floor(Math.random() * 10) + 5, isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'), hasPriceData: minPrice !== null, ...pkg };
    });
    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get Montenegro packages
exports.getMontenegroPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Montenegro%'
          OR p.p_name LIKE '%Podgorica%'
          OR p.p_name LIKE '%Budva%'
          OR p.p_name LIKE '%Kotor%'
          OR p.p_name LIKE '%Montenegrin%'
          OR p.p_slug LIKE '%montenegro%')
    AND p.status = 1 AND p.is_publish = 1
    GROUP BY p.id ORDER BY p.p_name
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error fetching Montenegro packages:', err);
      return reply.status(500).send({ error: 'Database error', details: err.message });
    }
    
    // Return empty packages array if no results
    if (!results || results.length === 0) {
      return reply.send({ success: true, packages: [] });
    }
    
    const formattedPackages = results.map(pkg => {
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
      return { id: pkg.id, title: pkg.p_name, slug: pkg.p_slug, description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) : '', image: pkg.feature_img, duration: pkg.day_night || 'Multiple Days', price: actualPrice, savings: savings, currency: pkg.package_currency || 'SGD', cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1, isHalalFriendly: false, seatsLeft: Math.floor(Math.random() * 10) + 5, isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'), hasPriceData: minPrice !== null, ...pkg };
    });
    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get North Macedonia packages
exports.getNorthMacedoniaPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%North Macedonia%' OR p.p_content LIKE '%North Macedonia%' 
          OR p.p_name LIKE '%Macedonia%' OR p.p_content LIKE '%Macedonia%'
          OR p.p_name LIKE '%Skopje%' OR p.p_content LIKE '%Skopje%'
          OR p.p_name LIKE '%Bitola%' OR p.p_content LIKE '%Bitola%'
          OR p.p_name LIKE '%Kumanovo%' OR p.p_content LIKE '%Kumanovo%'
          OR p.p_name LIKE '%Prilep%' OR p.p_content LIKE '%Prilep%'
          OR p.p_name LIKE '%Tetovo%' OR p.p_content LIKE '%Tetovo%'
          OR p.p_name LIKE '%Ohrid%' OR p.p_content LIKE '%Ohrid%'
          OR p.p_name LIKE '%Macedonian%' OR p.p_content LIKE '%Macedonian%'
          OR p.p_slug LIKE '%macedonia%' OR p.p_slug LIKE '%north-macedonia%')
    AND p.status = 1 AND p.is_publish = 1
    GROUP BY p.id ORDER BY p.p_name
  `;
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send({ error: 'Database error', details: err.message });
    const formattedPackages = results.map(pkg => {
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
      return { id: pkg.id, title: pkg.p_name, slug: pkg.p_slug, description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) : '', image: pkg.feature_img, duration: pkg.day_night || 'Multiple Days', price: actualPrice, savings: savings, currency: pkg.package_currency || 'SGD', cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1, isHalalFriendly: false, seatsLeft: Math.floor(Math.random() * 10) + 5, isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'), hasPriceData: minPrice !== null, ...pkg };
    });
    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get Serbia packages
exports.getSerbiaPackages = (req, reply) => {
  const query = `
    SELECT * FROM tbl_packages 
    WHERE (p_name LIKE '%Serbia%' 
          OR p_name LIKE '%Belgrade%'
          OR p_name LIKE '%Novi Sad%'
          OR p_name LIKE '%Serbian%'
          OR p_slug LIKE '%serbia%')
    AND status = 1 
    AND is_publish = 1
    ORDER BY p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error fetching Serbia packages:', err);
      return reply.status(500).send({ error: 'Database error', details: err.message });
    }
    
    // Return empty array if no results (will show "No packages available")
    if (!results || results.length === 0) {
      return reply.send([]);
    }
    
    const packagesWithSlugs = results.map(pkg => ({
      ...pkg,
      p_slug: pkg.p_slug || pkg.p_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    }));
    
    reply.send(packagesWithSlugs);
  });
};

// Get Slovenia packages
exports.getSloveniaPackages = (req, reply) => {
  const query = `
    SELECT * FROM tbl_packages 
    WHERE (p_name LIKE '%Slovenia%' OR p_content LIKE '%Slovenia%' 
          OR p_name LIKE '%Ljubljana%' OR p_content LIKE '%Ljubljana%'
          OR p_name LIKE '%Maribor%' OR p_content LIKE '%Maribor%'
          OR p_name LIKE '%Celje%' OR p_content LIKE '%Celje%'
          OR p_name LIKE '%Kranj%' OR p_content LIKE '%Kranj%'
          OR p_name LIKE '%Bled%' OR p_content LIKE '%Bled%'
          OR p_name LIKE '%Piran%' OR p_content LIKE '%Piran%'
          OR p_name LIKE '%Slovenian%' OR p_content LIKE '%Slovenian%'
          OR p_slug LIKE '%slovenia%')
    AND status = 1 
    AND is_publish = 1
    ORDER BY p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send(err);
    
    const packagesWithSlugs = results.map(pkg => ({
      ...pkg,
      p_slug: pkg.p_slug || pkg.p_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    }));
    
    reply.send(packagesWithSlugs);
  });
};

// Get Austria packages
exports.getAustriaPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Austria%' OR p.p_content LIKE '%Austria%' 
          OR p.p_name LIKE '%Vienna%' OR p.p_content LIKE '%Vienna%'
          OR p.p_name LIKE '%Salzburg%' OR p.p_content LIKE '%Salzburg%'
          OR p.p_name LIKE '%Innsbruck%' OR p.p_content LIKE '%Innsbruck%'
          OR p.p_name LIKE '%Hallstatt%' OR p.p_content LIKE '%Hallstatt%'
          OR p.p_name LIKE '%Graz%' OR p.p_content LIKE '%Graz%'
          OR p.p_name LIKE '%Linz%' OR p.p_content LIKE '%Linz%')
    AND p.status = 1 AND p.is_publish = 1 AND p.p_name NOT LIKE '%Taiwan%'
    GROUP BY p.id ORDER BY p.p_name
  `;
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send({ error: 'Database error', details: err.message });
    const formattedPackages = results.map(pkg => {
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
      return { id: pkg.id, title: pkg.p_name, slug: pkg.p_slug, description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) : '', image: pkg.feature_img, duration: pkg.day_night || 'Multiple Days', price: actualPrice, savings: savings, currency: pkg.package_currency || 'SGD', cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1, isHalalFriendly: false, seatsLeft: Math.floor(Math.random() * 10) + 5, isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'), hasPriceData: minPrice !== null, ...pkg };
    });
    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get Belgium packages
exports.getBelgiumPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Belgium%' OR p.p_content LIKE '%Belgium%' 
          OR p.p_name LIKE '%Brussels%' OR p.p_content LIKE '%Brussels%'
          OR p.p_name LIKE '%Antwerp%' OR p.p_content LIKE '%Antwerp%'
          OR p.p_name LIKE '%Ghent%' OR p.p_content LIKE '%Ghent%'
          OR p.p_name LIKE '%Bruges%' OR p.p_content LIKE '%Bruges%'
          OR p.p_name LIKE '%Leuven%' OR p.p_content LIKE '%Leuven%'
          OR p.p_name LIKE '%Liege%' OR p.p_content LIKE '%Liege%')
    AND p.status = 1 AND p.is_publish = 1 AND p.p_name NOT LIKE '%Taiwan%'
    GROUP BY p.id ORDER BY p.p_name
  `;
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send({ error: 'Database error', details: err.message });
    const formattedPackages = results.map(pkg => {
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
      return { id: pkg.id, title: pkg.p_name, slug: pkg.p_slug, description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) : '', image: pkg.feature_img, duration: pkg.day_night || 'Multiple Days', price: actualPrice, savings: savings, currency: pkg.package_currency || 'SGD', cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1, isHalalFriendly: false, seatsLeft: Math.floor(Math.random() * 10) + 5, isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'), hasPriceData: minPrice !== null, ...pkg };
    });
    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get Czech Republic packages
exports.getCzechRepublicPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Czech%' OR p.p_content LIKE '%Czech%' 
          OR p.p_name LIKE '%Prague%' OR p.p_content LIKE '%Prague%'
          OR p.p_name LIKE '%Brno%' OR p.p_content LIKE '%Brno%'
          OR p.p_name LIKE '%Ostrava%' OR p.p_content LIKE '%Ostrava%'
          OR p.p_name LIKE '%Cesky Krumlov%' OR p.p_content LIKE '%Cesky Krumlov%'
          OR p.p_name LIKE '%Karlovy Vary%' OR p.p_content LIKE '%Karlovy Vary%'
          OR p.p_name LIKE '%Bohemia%' OR p.p_content LIKE '%Bohemia%'
          OR p.p_name LIKE '%Central Europe%' OR p.p_content LIKE '%Central Europe%'
          OR p.p_name LIKE '%Eastern Europe%' OR p.p_content LIKE '%Eastern Europe%')
    AND p.status = 1 AND p.is_publish = 1 AND p.p_name NOT LIKE '%Taiwan%'
    GROUP BY p.id ORDER BY p.p_name
  `;
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send({ error: 'Database error', details: err.message });
    const formattedPackages = results.map(pkg => {
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
      return { id: pkg.id, title: pkg.p_name, slug: pkg.p_slug, description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) : '', image: pkg.feature_img, duration: pkg.day_night || 'Multiple Days', price: actualPrice, savings: savings, currency: pkg.package_currency || 'SGD', cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1, isHalalFriendly: false, seatsLeft: Math.floor(Math.random() * 10) + 5, isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'), hasPriceData: minPrice !== null, ...pkg };
    });
    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get Denmark packages
exports.getDenmarkPackages = (req, reply) => {
  const query = `
    SELECT p.*, 
           MIN(pr.price_t2) as min_price,
           MAX(pr.price_t2) as max_price,
           MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p
    LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Denmark%' OR p.p_content LIKE '%Denmark%' 
          OR p.p_name LIKE '%Copenhagen%' OR p.p_content LIKE '%Copenhagen%'
          OR p.p_name LIKE '%Aarhus%' OR p.p_content LIKE '%Aarhus%'
          OR p.p_name LIKE '%Odense%' OR p.p_content LIKE '%Odense%'
          OR p.p_name LIKE '%Aalborg%' OR p.p_content LIKE '%Aalborg%'
          OR p.p_name LIKE '%Roskilde%' OR p.p_content LIKE '%Roskilde%'
          OR p.p_name LIKE '%Danish%' OR p.p_content LIKE '%Danish%'
          OR p.p_name LIKE '%Scandinavia%' OR p.p_content LIKE '%Scandinavia%'
          OR p.p_name LIKE '%Nordic%' OR p.p_content LIKE '%Nordic%')
    AND p.status = 1 
    AND p.is_publish = 1
    AND p.p_name NOT LIKE '%Taiwan%'
    GROUP BY p.id
    ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return reply.status(500).send({ error: 'Database error', details: err.message });
    }

    const formattedPackages = results.map(pkg => {
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
        slug: pkg.p_slug,
        description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) : '',
        image: pkg.feature_img,
        duration: pkg.day_night || 'Multiple Days',
        price: actualPrice,
        savings: savings,
        currency: pkg.package_currency || 'SGD',
        cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1,
        isHalalFriendly: false,
        seatsLeft: Math.floor(Math.random() * 10) + 5,
        isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'),
        hasPriceData: minPrice !== null,
        ...pkg
      };
    });

    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get Finland packages
exports.getFinlandPackages = (req, reply) => {
  const query = `
    SELECT p.*, 
           MIN(pr.price_t2) as min_price,
           MAX(pr.price_t2) as max_price,
           MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p
    LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Finland%' OR p.p_content LIKE '%Finland%' 
          OR p.p_name LIKE '%Helsinki%' OR p.p_content LIKE '%Helsinki%'
          OR p.p_name LIKE '%Tampere%' OR p.p_content LIKE '%Tampere%'
          OR p.p_name LIKE '%Turku%' OR p.p_content LIKE '%Turku%'
          OR p.p_name LIKE '%Oulu%' OR p.p_content LIKE '%Oulu%'
          OR p.p_name LIKE '%Lapland%' OR p.p_content LIKE '%Lapland%'
          OR p.p_name LIKE '%Finnish%' OR p.p_content LIKE '%Finnish%'
          OR p.p_name LIKE '%Scandinavia%' OR p.p_content LIKE '%Scandinavia%'
          OR p.p_name LIKE '%Nordic%' OR p.p_content LIKE '%Nordic%')
    AND p.status = 1 
    AND p.is_publish = 1
    AND p.p_name NOT LIKE '%Taiwan%'
    GROUP BY p.id
    ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return reply.status(500).send({ error: 'Database error', details: err.message });
    }

    const formattedPackages = results.map(pkg => {
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
        slug: pkg.p_slug,
        description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) : '',
        image: pkg.feature_img,
        duration: pkg.day_night || 'Multiple Days',
        price: actualPrice,
        savings: savings,
        currency: pkg.package_currency || 'SGD',
        cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1,
        isHalalFriendly: false,
        seatsLeft: Math.floor(Math.random() * 10) + 5,
        isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'),
        hasPriceData: minPrice !== null,
        ...pkg
      };
    });

    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get France packages
exports.getFrancePackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%France%' OR p.p_content LIKE '%France%' 
          OR p.p_name LIKE '%Paris%' OR p.p_content LIKE '%Paris%'
          OR p.p_name LIKE '%Lyon%' OR p.p_content LIKE '%Lyon%'
          OR p.p_name LIKE '%Marseille%' OR p.p_content LIKE '%Marseille%'
          OR p.p_name LIKE '%Nice%' OR p.p_content LIKE '%Nice%'
          OR p.p_name LIKE '%Toulouse%' OR p.p_content LIKE '%Toulouse%'
          OR p.p_name LIKE '%Bordeaux%' OR p.p_content LIKE '%Bordeaux%'
          OR p.p_name LIKE '%Strasbourg%' OR p.p_content LIKE '%Strasbourg%'
          OR p.p_name LIKE '%French%' OR p.p_content LIKE '%French%'
          OR p.p_name LIKE '%Provence%' OR p.p_content LIKE '%Provence%'
          OR p.p_name LIKE '%Normandy%' OR p.p_content LIKE '%Normandy%'
          OR p.p_name LIKE '%Loire Valley%' OR p.p_content LIKE '%Loire Valley%')
    AND p.status = 1 AND p.is_publish = 1 AND p.p_name NOT LIKE '%Taiwan%'
    GROUP BY p.id ORDER BY p.p_name
  `;
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send({ error: 'Database error', details: err.message });
    const formattedPackages = results.map(pkg => {
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
      return { id: pkg.id, title: pkg.p_name, slug: pkg.p_slug, description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) : '', image: pkg.feature_img, duration: pkg.day_night || 'Multiple Days', price: actualPrice, savings: savings, currency: pkg.package_currency || 'SGD', cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1, isHalalFriendly: false, seatsLeft: Math.floor(Math.random() * 10) + 5, isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'), hasPriceData: minPrice !== null, ...pkg };
    });
    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get Germany packages
exports.getGermanyPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Germany%' OR p.p_content LIKE '%Germany%' 
          OR p.p_name LIKE '%Berlin%' OR p.p_content LIKE '%Berlin%'
          OR p.p_name LIKE '%Munich%' OR p.p_content LIKE '%Munich%'
          OR p.p_name LIKE '%Hamburg%' OR p.p_content LIKE '%Hamburg%'
          OR p.p_name LIKE '%Frankfurt%' OR p.p_content LIKE '%Frankfurt%'
          OR p.p_name LIKE '%Cologne%' OR p.p_content LIKE '%Cologne%'
          OR p.p_name LIKE '%Stuttgart%' OR p.p_content LIKE '%Stuttgart%'
          OR p.p_name LIKE '%Dresden%' OR p.p_content LIKE '%Dresden%'
          OR p.p_name LIKE '%German%' OR p.p_content LIKE '%German%'
          OR p.p_name LIKE '%Bavaria%' OR p.p_content LIKE '%Bavaria%'
          OR p.p_name LIKE '%Rhine%' OR p.p_content LIKE '%Rhine%'
          OR p.p_name LIKE '%Oktoberfest%' OR p.p_content LIKE '%Oktoberfest%'
          OR p.p_name LIKE '%Neuschwanstein%' OR p.p_content LIKE '%Neuschwanstein%')
    AND p.status = 1 AND p.is_publish = 1
    GROUP BY p.id ORDER BY p.p_name
  `;
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send({ error: 'Database error', details: err.message });
    const formattedPackages = results.map(pkg => {
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
      return { id: pkg.id, title: pkg.p_name, slug: pkg.p_slug, description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) : '', image: pkg.feature_img, duration: pkg.day_night || 'Multiple Days', price: actualPrice, savings: savings, currency: pkg.package_currency || 'SGD', cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1, isHalalFriendly: false, seatsLeft: Math.floor(Math.random() * 10) + 5, isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'), hasPriceData: minPrice !== null, ...pkg };
    });
    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get Hungary packages
exports.getHungaryPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Hungary%' OR p.p_content LIKE '%Hungary%' 
          OR p.p_name LIKE '%Budapest%' OR p.p_content LIKE '%Budapest%'
          OR p.p_name LIKE '%Debrecen%' OR p.p_content LIKE '%Debrecen%'
          OR p.p_name LIKE '%Szeged%' OR p.p_content LIKE '%Szeged%'
          OR p.p_name LIKE '%Miskolc%' OR p.p_content LIKE '%Miskolc%'
          OR p.p_name LIKE '%Pécs%' OR p.p_content LIKE '%Pécs%'
          OR p.p_name LIKE '%Győr%' OR p.p_content LIKE '%Győr%'
          OR p.p_name LIKE '%Hungarian%' OR p.p_content LIKE '%Hungarian%'
          OR p.p_name LIKE '%Danube%' OR p.p_content LIKE '%Danube%'
          OR p.p_name LIKE '%Thermal%' OR p.p_content LIKE '%Thermal%'
          OR p.p_name LIKE '%Buda%' OR p.p_content LIKE '%Buda%'
          OR p.p_name LIKE '%Pest%' OR p.p_content LIKE '%Pest%'
          OR p.p_name LIKE '%Parliament%' OR p.p_content LIKE '%Parliament%')
    AND p.status = 1 AND p.is_publish = 1
    GROUP BY p.id ORDER BY p.p_name
  `;
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send({ error: 'Database error', details: err.message });
    const formattedPackages = results.map(pkg => {
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
      return { id: pkg.id, title: pkg.p_name, slug: pkg.p_slug, description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) : '', image: pkg.feature_img, duration: pkg.day_night || 'Multiple Days', price: actualPrice, savings: savings, currency: pkg.package_currency || 'SGD', cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1, isHalalFriendly: false, seatsLeft: Math.floor(Math.random() * 10) + 5, isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'), hasPriceData: minPrice !== null, ...pkg };
    });
    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get Ireland packages
exports.getIrelandPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Ireland%' OR p.p_content LIKE '%Ireland%' 
          OR p.p_name LIKE '%Dublin%' OR p.p_content LIKE '%Dublin%'
          OR p.p_name LIKE '%Cork%' OR p.p_content LIKE '%Cork%'
          OR p.p_name LIKE '%Galway%' OR p.p_content LIKE '%Galway%'
          OR p.p_name LIKE '%Limerick%' OR p.p_content LIKE '%Limerick%'
          OR p.p_name LIKE '%Waterford%' OR p.p_content LIKE '%Waterford%'
          OR p.p_name LIKE '%Kilkenny%' OR p.p_content LIKE '%Kilkenny%'
          OR p.p_name LIKE '%Irish%' OR p.p_content LIKE '%Irish%'
          OR p.p_name LIKE '%Cliffs of Moher%' OR p.p_content LIKE '%Cliffs of Moher%'
          OR p.p_name LIKE '%Ring of Kerry%' OR p.p_content LIKE '%Ring of Kerry%'
          OR p.p_name LIKE '%Causeway%' OR p.p_content LIKE '%Causeway%'
          OR p.p_name LIKE '%Celtic%' OR p.p_content LIKE '%Celtic%')
    AND p.status = 1 AND p.is_publish = 1
    GROUP BY p.id ORDER BY p.p_name
  `;
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send({ error: 'Database error', details: err.message });
    const formattedPackages = results.map(pkg => {
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
      return { id: pkg.id, title: pkg.p_name, slug: pkg.p_slug, description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) : '', image: pkg.feature_img, duration: pkg.day_night || 'Multiple Days', price: actualPrice, savings: savings, currency: pkg.package_currency || 'SGD', cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1, isHalalFriendly: false, seatsLeft: Math.floor(Math.random() * 10) + 5, isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'), hasPriceData: minPrice !== null, ...pkg };
    });
    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get Italy packages
exports.getItalyPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Italy%' OR p.p_name LIKE '%Rome%' 
          OR p.p_name LIKE '%Milan%' OR p.p_name LIKE '%Venice%'
          OR p.p_name LIKE '%Florence%' OR p.p_name LIKE '%Naples%'
          OR p.p_name LIKE '%Turin%' OR p.p_name LIKE '%Bologna%'
          OR p.p_name LIKE '%Italian%' OR p.p_name LIKE '%Tuscany%'
          OR p.p_name LIKE '%Sicily%' OR p.p_name LIKE '%Amalfi%'
          OR p.p_name LIKE '%Vatican%' OR p.p_name LIKE '%Pisa%'
          OR p.p_name LIKE '%Capri%' OR p.p_name LIKE '%Cinque Terre%'
          OR p.p_name LIKE '%Lake Garda%' OR p.p_name LIKE '%Pompeii%')
    AND p.status = 1 AND p.is_publish = 1
    GROUP BY p.id ORDER BY p.p_name
  `;
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send({ error: 'Database error', details: err.message });
    const formattedPackages = results.map(pkg => {
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
      return { id: pkg.id, title: pkg.p_name, slug: pkg.p_slug, description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) : '', image: pkg.feature_img, duration: pkg.day_night || 'Multiple Days', price: actualPrice, savings: savings, currency: pkg.package_currency || 'SGD', cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1, isHalalFriendly: false, seatsLeft: Math.floor(Math.random() * 10) + 5, isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'), hasPriceData: minPrice !== null, ...pkg };
    });
    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get Netherlands packages
exports.getNetherlandsPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Netherlands%' OR p.p_content LIKE '%Netherlands%' 
          OR p.p_name LIKE '%Holland%' OR p.p_content LIKE '%Holland%'
          OR p.p_name LIKE '%Amsterdam%' OR p.p_content LIKE '%Amsterdam%'
          OR p.p_name LIKE '%Rotterdam%' OR p.p_content LIKE '%Rotterdam%'
          OR p.p_name LIKE '%The Hague%' OR p.p_content LIKE '%The Hague%'
          OR p.p_name LIKE '%Utrecht%' OR p.p_content LIKE '%Utrecht%'
          OR p.p_name LIKE '%Eindhoven%' OR p.p_content LIKE '%Eindhoven%'
          OR p.p_name LIKE '%Dutch%' OR p.p_content LIKE '%Dutch%'
          OR p.p_name LIKE '%Keukenhof%' OR p.p_content LIKE '%Keukenhof%'
          OR p.p_name LIKE '%Tulip%' OR p.p_content LIKE '%Tulip%'
          OR p.p_name LIKE '%Windmill%' OR p.p_content LIKE '%Windmill%'
          OR p.p_name LIKE '%Canal%' OR p.p_content LIKE '%Canal%')
    AND p.status = 1 AND p.is_publish = 1
    GROUP BY p.id ORDER BY p.p_name
  `;
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send({ error: 'Database error', details: err.message });
    const formattedPackages = results.map(pkg => {
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
      return { id: pkg.id, title: pkg.p_name, slug: pkg.p_slug, description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) : '', image: pkg.feature_img, duration: pkg.day_night || 'Multiple Days', price: actualPrice, savings: savings, currency: pkg.package_currency || 'SGD', cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1, isHalalFriendly: false, seatsLeft: Math.floor(Math.random() * 10) + 5, isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'), hasPriceData: minPrice !== null, ...pkg };
    });
    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get Poland packages
exports.getPolandPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Poland%' OR p.p_content LIKE '%Poland%' 
          OR p.p_name LIKE '%Warsaw%' OR p.p_content LIKE '%Warsaw%'
          OR p.p_name LIKE '%Krakow%' OR p.p_content LIKE '%Krakow%'
          OR p.p_name LIKE '%Cracow%' OR p.p_content LIKE '%Cracow%'
          OR p.p_name LIKE '%Gdansk%' OR p.p_content LIKE '%Gdansk%'
          OR p.p_name LIKE '%Wroclaw%' OR p.p_content LIKE '%Wroclaw%'
          OR p.p_name LIKE '%Poznan%' OR p.p_content LIKE '%Poznan%'
          OR p.p_name LIKE '%Lodz%' OR p.p_content LIKE '%Lodz%'
          OR p.p_name LIKE '%Polish%' OR p.p_content LIKE '%Polish%'
          OR p.p_name LIKE '%Auschwitz%' OR p.p_content LIKE '%Auschwitz%'
          OR p.p_name LIKE '%Zakopane%' OR p.p_content LIKE '%Zakopane%'
          OR p.p_name LIKE '%Tatra%' OR p.p_content LIKE '%Tatra%')
    AND p.status = 1 AND p.is_publish = 1
    GROUP BY p.id ORDER BY p.p_name
  `;
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send({ error: 'Database error', details: err.message });
    const formattedPackages = results.map(pkg => {
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
      return { id: pkg.id, title: pkg.p_name, slug: pkg.p_slug, description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) : '', image: pkg.feature_img, duration: pkg.day_night || 'Multiple Days', price: actualPrice, savings: savings, currency: pkg.package_currency || 'SGD', cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1, isHalalFriendly: false, seatsLeft: Math.floor(Math.random() * 10) + 5, isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'), hasPriceData: minPrice !== null, ...pkg };
    });
    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get Portugal packages
exports.getPortugalPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Portugal%' OR p.p_name LIKE '%Lisbon%' 
          OR p.p_name LIKE '%Porto%' OR p.p_name LIKE '%Coimbra%'
          OR p.p_name LIKE '%Braga%' OR p.p_name LIKE '%Aveiro%'
          OR p.p_name LIKE '%Sintra%' OR p.p_name LIKE '%Portuguese%'
          OR p.p_name LIKE '%Algarve%' OR p.p_name LIKE '%Douro%'
          OR p.p_name LIKE '%Madeira%' OR p.p_name LIKE '%Azores%'
          OR p.p_name LIKE '%Faro%' OR p.p_name LIKE '%Cascais%')
    AND p.status = 1 AND p.is_publish = 1
    GROUP BY p.id ORDER BY p.p_name
  `;
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send({ error: 'Database error', details: err.message });
    const formattedPackages = results.map(pkg => {
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
      return { id: pkg.id, title: pkg.p_name, slug: pkg.p_slug, description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) : '', image: pkg.feature_img, duration: pkg.day_night || 'Multiple Days', price: actualPrice, savings: savings, currency: pkg.package_currency || 'SGD', cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1, isHalalFriendly: false, seatsLeft: Math.floor(Math.random() * 10) + 5, isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'), hasPriceData: minPrice !== null, ...pkg };
    });
    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get Spain packages
exports.getSpainPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Spain%' OR p.p_name LIKE '%Madrid%' 
          OR p.p_name LIKE '%Barcelona%' OR p.p_name LIKE '%Valencia%'
          OR p.p_name LIKE '%Seville%' OR p.p_name LIKE '%Bilbao%'
          OR p.p_name LIKE '%Granada%' OR p.p_name LIKE '%Toledo%'
          OR p.p_name LIKE '%Spanish%' OR p.p_name LIKE '%Andalusia%'
          OR p.p_name LIKE '%Catalonia%' OR p.p_name LIKE '%Flamenco%'
          OR p.p_name LIKE '%Alhambra%' OR p.p_name LIKE '%Ibiza%'
          OR p.p_name LIKE '%Mallorca%' OR p.p_name LIKE '%Canary%')
    AND p.status = 1 AND p.is_publish = 1
    GROUP BY p.id ORDER BY p.p_name
  `;
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send({ error: 'Database error', details: err.message });
    const formattedPackages = results.map(pkg => {
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
      return { id: pkg.id, title: pkg.p_name, slug: pkg.p_slug, description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) : '', image: pkg.feature_img, duration: pkg.day_night || 'Multiple Days', price: actualPrice, savings: savings, currency: pkg.package_currency || 'SGD', cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1, isHalalFriendly: false, seatsLeft: Math.floor(Math.random() * 10) + 5, isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'), hasPriceData: minPrice !== null, ...pkg };
    });
    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get Switzerland packages
exports.getSwitzerlandPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Switzerland%' OR p.p_name LIKE '%Zurich%' 
          OR p.p_name LIKE '%Geneva%' OR p.p_name LIKE '%Basel%'
          OR p.p_name LIKE '%Bern%' OR p.p_name LIKE '%Lucerne%'
          OR p.p_name LIKE '%Interlaken%' OR p.p_name LIKE '%Zermatt%'
          OR p.p_name LIKE '%Swiss Alps%' OR p.p_name LIKE '%Matterhorn%'
          OR p.p_name LIKE '%Jungfrau%' OR p.p_name LIKE '%Lausanne%'
          OR p.p_name LIKE '%St. Moritz%' OR p.p_name LIKE '%Grindelwald%')
    AND p.status = 1 AND p.is_publish = 1
    GROUP BY p.id ORDER BY p.p_name
  `;
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send({ error: 'Database error', details: err.message });
    const formattedPackages = results.map(pkg => {
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
      return { id: pkg.id, title: pkg.p_name, slug: pkg.p_slug, description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) : '', image: pkg.feature_img, duration: pkg.day_night || 'Multiple Days', price: actualPrice, savings: savings, currency: pkg.package_currency || 'SGD', cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1, isHalalFriendly: false, seatsLeft: Math.floor(Math.random() * 10) + 5, isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'), hasPriceData: minPrice !== null, ...pkg };
    });
    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get United Kingdom packages
exports.getUnitedKingdomPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%London%' OR p.p_name LIKE '%Britain%' OR p.p_name LIKE '%England%' 
          OR p.p_name LIKE '%Scotland%' OR p.p_name LIKE '%Edinburgh%' 
          OR p.p_name LIKE '%Manchester%' OR p.p_name LIKE '%Liverpool%'
          OR p.p_name LIKE '%Birmingham%' OR p.p_name LIKE '%Glasgow%'
          OR p.p_name LIKE '%Cardiff%' OR p.p_name LIKE '%Wales%'
          OR p.p_name LIKE '%United Kingdom%' OR p.p_name LIKE '%UK Tour%'
          OR p.p_name LIKE '%British%' OR p.p_name LIKE '%Thames%'
          OR p.p_name LIKE '%Buckingham%' OR p.p_name LIKE '%Westminster%'
          OR p.p_name LIKE '%Big Ben%' OR p.p_name LIKE '%Tower Bridge%'
          OR p.p_name LIKE '%Stonehenge%' OR p.p_name LIKE '%Windsor%')
    AND p.status = 1 AND p.is_publish = 1
    GROUP BY p.id ORDER BY p.p_name
  `;
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send({ error: 'Database error', details: err.message });
    const formattedPackages = results.map(pkg => {
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
      return { id: pkg.id, title: pkg.p_name, slug: pkg.p_slug, description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) : '', image: pkg.feature_img, duration: pkg.day_night || 'Multiple Days', price: actualPrice, savings: savings, currency: pkg.package_currency || 'SGD', cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1, isHalalFriendly: false, seatsLeft: Math.floor(Math.random() * 10) + 5, isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'), hasPriceData: minPrice !== null, ...pkg };
    });
    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get Scandinavia Denmark packages
exports.getScandinavia_DenmarkPackages = (req, reply) => {
  const query = `
    SELECT p.*, 
           MIN(pr.price_t2) as min_price,
           MAX(pr.price_t2) as max_price,
           MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p
    LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Denmark%' OR p.p_name LIKE '%Copenhagen%' 
          OR p.p_name LIKE '%Danish%' OR p.p_name LIKE '%Aarhus%' 
          OR p.p_name LIKE '%Odense%' OR p.p_name LIKE '%Aalborg%'
          OR p.p_name LIKE '%Roskilde%' OR p.p_name LIKE '%Jutland%'
          OR p.p_name LIKE '%Tivoli%'
          OR (p.p_name LIKE '%Nordic%' AND p.p_name LIKE '%Copenhagen%')
          OR (p.p_name LIKE '%Scandinavia%' AND p.p_name LIKE '%Copenhagen%'))
    AND p.p_name NOT LIKE '%New Zealand%'
    AND p.status = 1 
    AND p.is_publish = 1
    GROUP BY p.id
    ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return reply.status(500).send({ error: 'Database error', details: err.message });
    }

    const formattedPackages = results.map(pkg => {
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
        slug: pkg.p_slug,
        description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) : '',
        image: pkg.feature_img,
        duration: pkg.day_night || 'Multiple Days',
        price: actualPrice,
        savings: savings,
        currency: pkg.package_currency || 'SGD',
        cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1,
        isHalalFriendly: false,
        seatsLeft: Math.floor(Math.random() * 10) + 5,
        isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'),
        hasPriceData: minPrice !== null,
        ...pkg
      };
    });

    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get Scandinavia Finland packages
exports.getScandinavia_FinlandPackages = (req, reply) => {
  const query = `
    SELECT p.*, 
           MIN(pr.price_t2) as min_price,
           MAX(pr.price_t2) as max_price,
           MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p
    LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Finland%' OR p.p_name LIKE '%Helsinki%' 
          OR p.p_name LIKE '%Finnish%' OR p.p_name LIKE '%Tampere%' 
          OR p.p_name LIKE '%Turku%' OR p.p_name LIKE '%Oulu%'
          OR p.p_name LIKE '%Lapland%' OR p.p_name LIKE '%Rovaniemi%'
          OR (p.p_name LIKE '%Nordic%' AND p.p_name LIKE '%Helsinki%')
          OR (p.p_name LIKE '%Scandinavia%' AND p.p_name LIKE '%Helsinki%'))
    AND p.status = 1 
    AND p.is_publish = 1
    GROUP BY p.id
    ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return reply.status(500).send({ error: 'Database error', details: err.message });
    }

    const formattedPackages = results.map(pkg => {
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
        slug: pkg.p_slug,
        description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) : '',
        image: pkg.feature_img,
        duration: pkg.day_night || 'Multiple Days',
        price: actualPrice,
        savings: savings,
        currency: pkg.package_currency || 'SGD',
        cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1,
        isHalalFriendly: false,
        seatsLeft: Math.floor(Math.random() * 10) + 5,
        isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'),
        hasPriceData: minPrice !== null,
        ...pkg
      };
    });

    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get Scandinavia Iceland packages
exports.getScandinavia_IcelandPackages = (req, reply) => {
  const query = `
    SELECT p.*, 
           MIN(pr.price_t2) as min_price,
           MAX(pr.price_t2) as max_price,
           MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p
    LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Iceland%' OR p.p_name LIKE '%Reykjavik%' 
          OR p.p_name LIKE '%Akureyri%' OR p.p_name LIKE '%Keflavik%'
          OR p.p_name LIKE '%Icelandic%' OR p.p_name LIKE '%Blue Lagoon%'
          OR p.p_name LIKE '%Geysir%' OR p.p_name LIKE '%Gullfoss%'
          OR p.p_name LIKE '%Northern Lights%' OR p.p_name LIKE '%Aurora%'
          OR p.p_name LIKE '%Ring Road%' OR p.p_name LIKE '%Westfjords%'
          OR p.p_name LIKE '%Vatnajokull%' OR p.p_name LIKE '%Jokulsarlon%')
    AND p.status = 1 
    AND p.is_publish = 1
    GROUP BY p.id
    ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return reply.status(500).send({ error: 'Database error', details: err.message });
    }

    const formattedPackages = results.map(pkg => {
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
        slug: pkg.p_slug,
        description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) : '',
        image: pkg.feature_img,
        duration: pkg.day_night || 'Multiple Days',
        price: actualPrice,
        savings: savings,
        currency: pkg.package_currency || 'SGD',
        cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1,
        isHalalFriendly: false,
        seatsLeft: Math.floor(Math.random() * 10) + 5,
        isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'),
        hasPriceData: minPrice !== null,
        ...pkg
      };
    });

    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get Scandinavia Norway packages
exports.getScandinavia_NorwayPackages = (req, reply) => {
  const query = `
    SELECT p.*, 
           MIN(pr.price_t2) as min_price,
           MAX(pr.price_t2) as max_price,
           MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p
    LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Norway%' OR p.p_name LIKE '%Oslo%' 
          OR p.p_name LIKE '%Norwegian%' OR p.p_name LIKE '%Bergen%' 
          OR p.p_name LIKE '%Trondheim%' OR p.p_name LIKE '%Stavanger%'
          OR p.p_name LIKE '%Tromso%' OR p.p_name LIKE '%Fjord%'
          OR p.p_name LIKE '%Lofoten%' OR p.p_name LIKE '%Midnight Sun%'
          OR (p.p_name LIKE '%Nordic%' AND p.p_name LIKE '%Oslo%')
          OR (p.p_name LIKE '%Scandinavia%' AND p.p_name LIKE '%Oslo%'))
    AND p.status = 1 
    AND p.is_publish = 1
    GROUP BY p.id
    ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return reply.status(500).send({ error: 'Database error', details: err.message });
    }

    const formattedPackages = results.map(pkg => {
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
        slug: pkg.p_slug,
        description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) : '',
        image: pkg.feature_img,
        duration: pkg.day_night || 'Multiple Days',
        price: actualPrice,
        savings: savings,
        currency: pkg.package_currency || 'SGD',
        cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1,
        isHalalFriendly: false,
        seatsLeft: Math.floor(Math.random() * 10) + 5,
        isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'),
        hasPriceData: minPrice !== null,
        ...pkg
      };
    });

    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get Sweden packages
exports.getSwedenPackages = (req, reply) => {
  const query = `
    SELECT p.*, 
           MIN(pr.price_t2) as min_price,
           MAX(pr.price_t2) as max_price,
           MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p
    LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Sweden%' OR p.p_name LIKE '%Stockholm%' 
          OR p.p_name LIKE '%Swedish%' OR p.p_name LIKE '%Gothenburg%' 
          OR p.p_name LIKE '%Malmo%' OR p.p_name LIKE '%Uppsala%'
          OR p.p_name LIKE '%Vasteras%' OR p.p_name LIKE '%Kiruna%'
          OR p.p_name LIKE '%Abisko%' OR p.p_name LIKE '%Gotland%'
          OR (p.p_name LIKE '%Nordic%' AND p.p_name LIKE '%Stockholm%')
          OR (p.p_name LIKE '%Scandinavia%' AND p.p_name LIKE '%Stockholm%'))
    AND p.status = 1 
    AND p.is_publish = 1
    GROUP BY p.id
    ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return reply.status(500).send({ error: 'Database error', details: err.message });
    }

    const formattedPackages = results.map(pkg => {
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
        slug: pkg.p_slug,
        description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) : '',
        image: pkg.feature_img,
        duration: pkg.day_night || 'Multiple Days',
        price: actualPrice,
        savings: savings,
        currency: pkg.package_currency || 'SGD',
        cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1,
        isHalalFriendly: false,
        seatsLeft: Math.floor(Math.random() * 10) + 5,
        isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'),
        hasPriceData: minPrice !== null,
        ...pkg
      };
    });

    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get Oceania Australia packages
exports.getOceania_AustraliaPackages = (req, reply) => {
  const query = `
    SELECT p.*, 
           MIN(pr.price_t2) as min_price,
           MAX(pr.price_t2) as max_price,
           MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p
    LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Australia%' OR p.p_name LIKE '%Sydney%' 
          OR p.p_name LIKE '%Melbourne%' OR p.p_name LIKE '%Brisbane%'
          OR p.p_name LIKE '%Perth%' OR p.p_name LIKE '%Adelaide%'
          OR p.p_name LIKE '%Canberra%' OR p.p_name LIKE '%Darwin%'
          OR p.p_name LIKE '%Australian%' OR p.p_name LIKE '%Outback%'
          OR p.p_name LIKE '%Great Barrier Reef%' OR p.p_name LIKE '%Uluru%'
          OR p.p_name LIKE '%Ayers Rock%' OR p.p_name LIKE '%Tasmania%'
          OR p.p_name LIKE '%Gold Coast%' OR p.p_name LIKE '%Cairns%')
    AND p.status = 1 
    AND p.is_publish = 1
    GROUP BY p.id
    ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return reply.status(500).send({ error: 'Database error', details: err.message });
    }

    // Format packages with price data
    const formattedPackages = results.map(pkg => {
      // Parse price data
      const minPrice = pkg.min_price && pkg.min_price !== '' && pkg.min_price !== '0' ? parseInt(pkg.min_price) : null;
      const salePrice = pkg.sale_price && pkg.sale_price !== '' && pkg.sale_price !== '0' ? parseInt(pkg.sale_price) : null;

      // Calculate display price
      let actualPrice, savings;
      if (minPrice) {
        actualPrice = minPrice;
        savings = salePrice && salePrice < minPrice ? minPrice - salePrice : Math.floor(minPrice * 0.1);
      } else {
        // Fallback: calculate price based on days and package ID
        const dayMatch = pkg.day_night ? pkg.day_night.match(/(\d+)D/) : null;
        const days = dayMatch ? parseInt(dayMatch[1]) : 7;
        actualPrice = days * 300 + (pkg.id % 2000) + 2000;
        savings = Math.floor(actualPrice * 0.1);
      }

      return {
        id: pkg.id,
        title: pkg.p_name,
        slug: pkg.p_slug,
        description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) : '',
        image: pkg.feature_img,
        duration: pkg.day_night || 'Multiple Days',
        price: actualPrice,
        savings: savings,
        currency: pkg.package_currency || 'SGD',
        cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1,
        isHalalFriendly: false,
        seatsLeft: Math.floor(Math.random() * 10) + 5,
        isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'),
        hasPriceData: minPrice !== null,
        // Include original fields for backward compatibility
        ...pkg
      };
    });

    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get Oceania Fiji packages
exports.getOceania_FijiPackages = (req, reply) => {
  const query = `
    SELECT p.*, 
           MIN(pr.price_t2) as min_price,
           MAX(pr.price_t2) as max_price,
           MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p
    LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Fiji%' OR p.p_name LIKE '%Suva%' 
          OR p.p_name LIKE '%Nadi%' OR p.p_name LIKE '%Lautoka%'
          OR p.p_name LIKE '%Fijian%' OR p.p_name LIKE '%Viti Levu%'
          OR p.p_name LIKE '%Vanua Levu%' OR p.p_name LIKE '%Coral Coast%'
          OR p.p_name LIKE '%Mamanuca%' OR p.p_name LIKE '%Yasawa%')
    AND p.status = 1 
    AND p.is_publish = 1
    GROUP BY p.id
    ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return reply.status(500).send({ error: 'Database error', details: err.message });
    }

    const formattedPackages = results.map(pkg => {
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
        slug: pkg.p_slug,
        description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) : '',
        image: pkg.feature_img,
        duration: pkg.day_night || 'Multiple Days',
        price: actualPrice,
        savings: savings,
        currency: pkg.package_currency || 'SGD',
        cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1,
        isHalalFriendly: false,
        seatsLeft: Math.floor(Math.random() * 10) + 5,
        isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'),
        hasPriceData: minPrice !== null,
        ...pkg
      };
    });

    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get Oceania New Zealand packages
exports.getOceania_NewZealandPackages = (req, reply) => {
  const query = `
    SELECT p.*, 
           MIN(pr.price_t2) as min_price,
           MAX(pr.price_t2) as max_price,
           MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p
    LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%New Zealand%' OR p.p_name LIKE '%Auckland%' 
          OR p.p_name LIKE '%Wellington%' OR p.p_name LIKE '%Christchurch%'
          OR p.p_name LIKE '%Queenstown%' OR p.p_name LIKE '%Rotorua%'
          OR p.p_name LIKE '%Hamilton%' OR p.p_name LIKE '%Dunedin%'
          OR p.p_name LIKE '%Kiwi%' OR p.p_name LIKE '%Hobbiton%'
          OR p.p_name LIKE '%Milford Sound%' OR p.p_name LIKE '%Bay of Islands%'
          OR p.p_name LIKE '%Fiordland%' OR p.p_name LIKE '%Canterbury%')
    AND p.status = 1 
    AND p.is_publish = 1
    GROUP BY p.id
    ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return reply.status(500).send({ error: 'Database error', details: err.message });
    }

    const formattedPackages = results.map(pkg => {
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
        slug: pkg.p_slug,
        description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) : '',
        image: pkg.feature_img,
        duration: pkg.day_night || 'Multiple Days',
        price: actualPrice,
        savings: savings,
        currency: pkg.package_currency || 'SGD',
        cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1,
        isHalalFriendly: false,
        seatsLeft: Math.floor(Math.random() * 10) + 5,
        isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'),
        hasPriceData: minPrice !== null,
        ...pkg
      };
    });

    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get Oceania Papua New Guinea packages
exports.getOceania_PapuaNewGuineaPackages = (req, reply) => {
  const query = `
    SELECT p.*, 
           MIN(pr.price_t2) as min_price,
           MAX(pr.price_t2) as max_price,
           MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p
    LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Papua New Guinea%' OR p.p_name LIKE '%PNG%' 
          OR p.p_name LIKE '%Port Moresby%' OR p.p_name LIKE '%Lae%'
          OR p.p_name LIKE '%Mount Hagen%' OR p.p_name LIKE '%Madang%'
          OR p.p_name LIKE '%Wewak%' OR p.p_name LIKE '%Vanimo%'
          OR p.p_name LIKE '%Kokoda%' OR p.p_name LIKE '%Sepik%'
          OR p.p_name LIKE '%Highlands%' OR p.p_name LIKE '%Trobriand%'
          OR p.p_content LIKE '%Papua New Guinea%' OR p.p_content LIKE '%PNG%'
          OR p.p_slug LIKE '%papua%' OR p.p_slug LIKE '%new-guinea%')
    AND p.status = 1 
    AND p.is_publish = 1
    GROUP BY p.id
    ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return reply.status(500).send({ error: 'Database error', details: err.message });
    }

    const formattedPackages = results.map(pkg => {
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
        slug: pkg.p_slug,
        description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) : '',
        image: pkg.feature_img,
        duration: pkg.day_night || 'Multiple Days',
        price: actualPrice,
        savings: savings,
        currency: pkg.package_currency || 'SGD',
        cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1,
        isHalalFriendly: false,
        seatsLeft: Math.floor(Math.random() * 10) + 5,
        isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'),
        hasPriceData: minPrice !== null,
        ...pkg
      };
    });

    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get Oceania Samoa packages
exports.getOceania_SamoaPackages = (req, reply) => {
  const query = `
    SELECT * FROM tbl_packages 
    WHERE (p_name LIKE '%Samoa%' OR p_name LIKE '%Apia%' 
          OR p_name LIKE '%Upolu%' OR p_name LIKE '%Savaii%'
          OR p_name LIKE '%Pago Pago%' OR p_name LIKE '%American Samoa%'
          OR p_name LIKE '%Lalomanu%' OR p_name LIKE '%Manono%'
          OR p_name LIKE '%Faleolo%' OR p_name LIKE '%Salelologa%'
          OR p_content LIKE '%Samoa%' OR p_content LIKE '%Apia%'
          OR p_slug LIKE '%samoa%')
    AND status = 1 
    AND is_publish = 1
    ORDER BY p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send(err);
    reply.send(results);
  });
};

// Get Oceania Tonga packages
exports.getOceania_TongaPackages = (req, reply) => {
  const query = `
    SELECT * FROM tbl_packages 
    WHERE (p_name LIKE '%Tonga%' OR p_name LIKE '%Nukualofa%' 
          OR p_name LIKE '%Tongatapu%' OR p_name LIKE '%Vavau%'
          OR p_name LIKE '%Haapai%' OR p_name LIKE '%Eua%'
          OR p_name LIKE '%Niuatoputapu%' OR p_name LIKE '%Niuafou%'
          OR p_name LIKE '%Kingdom of Tonga%' OR p_name LIKE '%Friendly Islands%'
          OR p_content LIKE '%Tonga%' OR p_content LIKE '%Nukualofa%'
          OR p_slug LIKE '%tonga%')
    AND status = 1 
    AND is_publish = 1
    ORDER BY p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send(err);
    reply.send(results);
  });
};

// Get Oceania Vanuatu packages
exports.getOceania_VanuatuPackages = (req, reply) => {
  const query = `
    SELECT * FROM tbl_packages 
    WHERE (p_name LIKE '%Vanuatu%' OR p_name LIKE '%Port Vila%' 
          OR p_name LIKE '%Luganville%' OR p_name LIKE '%Espiritu Santo%'
          OR p_name LIKE '%Efate%' OR p_name LIKE '%Tanna%'
          OR p_name LIKE '%Pentecost%' OR p_name LIKE '%Malekula%'
          OR p_name LIKE '%Yasur%' OR p_name LIKE '%Vanuatuan%'
          OR p_content LIKE '%Vanuatu%' OR p_content LIKE '%Port Vila%'
          OR p_slug LIKE '%vanuatu%')
    AND status = 1 
    AND is_publish = 1
    ORDER BY p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send(err);
    reply.send(results);
  });
};

// Get Mongolia packages
exports.getMongoliaPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p
    LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Mongolia%' OR p.p_content LIKE '%Mongolia%' 
          OR p.p_name LIKE '%Ulaanbaatar%' OR p.p_content LIKE '%Ulaanbaatar%'
          OR p.p_name LIKE '%Gobi Desert%' OR p.p_content LIKE '%Gobi Desert%'
          OR p.p_name LIKE '%Mongolian%' OR p.p_content LIKE '%Mongolian%'
          OR p.p_name LIKE '%Nomad%' OR p.p_content LIKE '%Nomad%'
          OR p.p_name LIKE '%Ger%' OR p.p_content LIKE '%Ger%'
          OR p.p_name LIKE '%Yurt%' OR p.p_content LIKE '%Yurt%'
          OR p.p_name LIKE '%Karakorum%' OR p.p_content LIKE '%Karakorum%'
          OR p.p_name LIKE '%Genghis Khan%' OR p.p_content LIKE '%Genghis Khan%')
    AND p.status = 1 
    AND p.is_publish = 1
    GROUP BY p.id
    ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send({ error: 'Database error', details: err.message });
    const formattedPackages = results.map(pkg => {
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
        slug: pkg.p_slug,
        description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) : '',
        image: pkg.feature_img,
        duration: pkg.day_night || 'Multiple Days',
        price: actualPrice,
        savings: savings,
        currency: pkg.package_currency || 'SGD',
        cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1,
        isHalalFriendly: false,
        seatsLeft: Math.floor(Math.random() * 10) + 5,
        isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'),
        hasPriceData: minPrice !== null,
        ...pkg
      };
    });
    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get Nepal packages
exports.getNepalPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p
    LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Nepal%' OR p.p_content LIKE '%Nepal%' 
          OR p.p_name LIKE '%Kathmandu%' OR p.p_content LIKE '%Kathmandu%'
          OR p.p_name LIKE '%Everest%' OR p.p_content LIKE '%Everest%'
          OR p.p_name LIKE '%Pokhara%' OR p.p_content LIKE '%Pokhara%'
          OR p.p_name LIKE '%Annapurna%' OR p.p_content LIKE '%Annapurna%'
          OR p.p_name LIKE '%Himalaya%' OR p.p_content LIKE '%Himalaya%'
          OR p.p_name LIKE '%Chitwan%' OR p.p_content LIKE '%Chitwan%'
          OR p.p_name LIKE '%Lumbini%' OR p.p_content LIKE '%Lumbini%'
          OR p.p_name LIKE '%Bhaktapur%' OR p.p_content LIKE '%Bhaktapur%'
          OR p.p_name LIKE '%Patan%' OR p.p_content LIKE '%Patan%'
          OR p.p_name LIKE '%Nagarkot%' OR p.p_content LIKE '%Nagarkot%')
    AND p.status = 1 
    AND p.is_publish = 1
    GROUP BY p.id
    ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send({ error: 'Database error', details: err.message });
    const formattedPackages = results.map(pkg => {
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
        slug: pkg.p_slug,
        description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) : '',
        image: pkg.feature_img,
        duration: pkg.day_night || 'Multiple Days',
        price: actualPrice,
        savings: savings,
        currency: pkg.package_currency || 'SGD',
        cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1,
        isHalalFriendly: false,
        seatsLeft: Math.floor(Math.random() * 10) + 5,
        isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'),
        hasPriceData: minPrice !== null,
        ...pkg
      };
    });
    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get Pakistan packages
exports.getPakistanPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p
    LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Pakistan%' OR p.p_content LIKE '%Pakistan%' 
          OR p.p_name LIKE '%Islamabad%' OR p.p_content LIKE '%Islamabad%'
          OR p.p_name LIKE '%Karachi%' OR p.p_content LIKE '%Karachi%'
          OR p.p_name LIKE '%Lahore%' OR p.p_content LIKE '%Lahore%'
          OR p.p_name LIKE '%K2%' OR p.p_content LIKE '%K2%'
          OR p.p_name LIKE '%Karakoram%' OR p.p_content LIKE '%Karakoram%'
          OR p.p_name LIKE '%Hunza%' OR p.p_content LIKE '%Hunza%'
          OR p.p_name LIKE '%Gilgit%' OR p.p_content LIKE '%Gilgit%'
          OR p.p_name LIKE '%Skardu%' OR p.p_content LIKE '%Skardu%'
          OR p.p_name LIKE '%Baltistan%' OR p.p_content LIKE '%Baltistan%'
          OR p.p_name LIKE '%Swat%' OR p.p_content LIKE '%Swat%'
          OR p.p_name LIKE '%Murree%' OR p.p_content LIKE '%Murree%')
    AND p.status = 1 
    AND p.is_publish = 1
    GROUP BY p.id
    ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send({ error: 'Database error', details: err.message });
    const formattedPackages = results.map(pkg => {
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
        slug: pkg.p_slug,
        description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) : '',
        image: pkg.feature_img,
        duration: pkg.day_night || 'Multiple Days',
        price: actualPrice,
        savings: savings,
        currency: pkg.package_currency || 'SGD',
        cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1,
        isHalalFriendly: false,
        seatsLeft: Math.floor(Math.random() * 10) + 5,
        isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'),
        hasPriceData: minPrice !== null,
        ...pkg
      };
    });
    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get South Korea packages
exports.getSouthKoreaPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p
    LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%South Korea%' OR p.p_content LIKE '%South Korea%' 
          OR p.p_name LIKE '%Korea%' OR p.p_content LIKE '%Korea%'
          OR p.p_name LIKE '%Seoul%' OR p.p_content LIKE '%Seoul%'
          OR p.p_name LIKE '%Busan%' OR p.p_content LIKE '%Busan%'
          OR p.p_name LIKE '%Jeju%' OR p.p_content LIKE '%Jeju%'
          OR p.p_name LIKE '%Korean%' OR p.p_content LIKE '%Korean%'
          OR p.p_name LIKE '%Gyeongju%' OR p.p_content LIKE '%Gyeongju%'
          OR p.p_name LIKE '%Incheon%' OR p.p_content LIKE '%Incheon%'
          OR p.p_name LIKE '%Daegu%' OR p.p_content LIKE '%Daegu%'
          OR p.p_name LIKE '%Gangnam%' OR p.p_content LIKE '%Gangnam%'
          OR p.p_name LIKE '%DMZ%' OR p.p_content LIKE '%DMZ%'
          OR p.p_name LIKE '%Lotte%' OR p.p_content LIKE '%Lotte%'
          OR p.p_slug LIKE '%korea%' OR p.p_slug LIKE '%seoul%' OR p.p_slug LIKE '%jeju%')
    AND p.status = 1 
    AND p.is_publish = 1
    GROUP BY p.id
    ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send({ error: 'Database error', details: err.message });
    const formattedPackages = results.map(pkg => {
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
        slug: pkg.p_slug,
        description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) : '',
        image: pkg.feature_img,
        duration: pkg.day_night || 'Multiple Days',
        price: actualPrice,
        savings: savings,
        currency: pkg.package_currency || 'SGD',
        cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1,
        isHalalFriendly: false,
        seatsLeft: Math.floor(Math.random() * 10) + 5,
        isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'),
        hasPriceData: minPrice !== null,
        ...pkg
      };
    });
    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get Sri Lanka packages
exports.getSriLankaPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p
    LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Sri Lanka%' OR p.p_content LIKE '%Sri Lanka%' 
          OR p.p_name LIKE '%Colombo%' OR p.p_content LIKE '%Colombo%'
          OR p.p_name LIKE '%Kandy%' OR p.p_content LIKE '%Kandy%'
          OR p.p_name LIKE '%Galle%' OR p.p_content LIKE '%Galle%'
          OR p.p_name LIKE '%Nuwara Eliya%' OR p.p_content LIKE '%Nuwara Eliya%'
          OR p.p_name LIKE '%Sigiriya%' OR p.p_content LIKE '%Sigiriya%'
          OR p.p_name LIKE '%Anuradhapura%' OR p.p_content LIKE '%Anuradhapura%'
          OR p.p_name LIKE '%Polonnaruwa%' OR p.p_content LIKE '%Polonnaruwa%'
          OR p.p_name LIKE '%Bentota%' OR p.p_content LIKE '%Bentota%'
          OR p.p_name LIKE '%Mirissa%' OR p.p_content LIKE '%Mirissa%'
          OR p.p_name LIKE '%Ella%' OR p.p_content LIKE '%Ella%'
          OR p.p_name LIKE '%Ceylon%' OR p.p_content LIKE '%Ceylon%'
          OR p.p_name LIKE '%Lankan%' OR p.p_content LIKE '%Lankan%'
          OR p.p_slug LIKE '%sri-lanka%' OR p.p_slug LIKE '%colombo%' OR p.p_slug LIKE '%kandy%')
    AND p.status = 1 
    AND p.is_publish = 1
    GROUP BY p.id
    ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send({ error: 'Database error', details: err.message });
    const formattedPackages = results.map(pkg => {
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
        slug: pkg.p_slug,
        description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) : '',
        image: pkg.feature_img,
        duration: pkg.day_night || 'Multiple Days',
        price: actualPrice,
        savings: savings,
        currency: pkg.package_currency || 'SGD',
        cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1,
        isHalalFriendly: false,
        seatsLeft: Math.floor(Math.random() * 10) + 5,
        isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'),
        hasPriceData: minPrice !== null,
        ...pkg
      };
    });
    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get Taiwan packages
exports.getTaiwanPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p
    LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Taiwan%' OR p.p_content LIKE '%Taiwan%' 
          OR p.p_name LIKE '%Taipei%' OR p.p_content LIKE '%Taipei%'
          OR p.p_name LIKE '%Kaohsiung%' OR p.p_content LIKE '%Kaohsiung%'
          OR p.p_name LIKE '%Taichung%' OR p.p_content LIKE '%Taichung%'
          OR p.p_name LIKE '%Tainan%' OR p.p_content LIKE '%Tainan%'
          OR p.p_name LIKE '%Hualien%' OR p.p_content LIKE '%Hualien%'
          OR p.p_name LIKE '%Taroko%' OR p.p_content LIKE '%Taroko%'
          OR p.p_name LIKE '%Sun Moon Lake%' OR p.p_content LIKE '%Sun Moon Lake%'
          OR p.p_name LIKE '%Alishan%' OR p.p_content LIKE '%Alishan%'
          OR p.p_name LIKE '%Kenting%' OR p.p_content LIKE '%Kenting%'
          OR p.p_name LIKE '%Jiufen%' OR p.p_content LIKE '%Jiufen%'
          OR p.p_name LIKE '%Taiwanese%' OR p.p_content LIKE '%Taiwanese%'
          OR p.p_name LIKE '%Formosa%' OR p.p_content LIKE '%Formosa%'
          OR p.p_slug LIKE '%taiwan%' OR p.p_slug LIKE '%taipei%')
    AND p.status = 1 
    AND p.is_publish = 1
    GROUP BY p.id
    ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send({ error: 'Database error', details: err.message });
    const formattedPackages = results.map(pkg => {
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
        slug: pkg.p_slug,
        description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) : '',
        image: pkg.feature_img,
        duration: pkg.day_night || 'Multiple Days',
        price: actualPrice,
        savings: savings,
        currency: pkg.package_currency || 'SGD',
        cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1,
        isHalalFriendly: false,
        seatsLeft: Math.floor(Math.random() * 10) + 5,
        isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'),
        hasPriceData: minPrice !== null,
        ...pkg
      };
    });
    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get Tibet packages
exports.getTibetPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p
    LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Tibet%' OR p.p_content LIKE '%Tibet%' 
          OR p.p_name LIKE '%Lhasa%' OR p.p_content LIKE '%Lhasa%'
          OR p.p_name LIKE '%Potala%' OR p.p_content LIKE '%Potala%'
          OR p.p_name LIKE '%Shigatse%' OR p.p_content LIKE '%Shigatse%'
          OR p.p_name LIKE '%Everest Base Camp%' OR p.p_content LIKE '%Everest Base Camp%'
          OR p.p_name LIKE '%Mount Kailash%' OR p.p_content LIKE '%Mount Kailash%'
          OR p.p_name LIKE '%Tibetan%' OR p.p_content LIKE '%Tibetan%'
          OR p.p_name LIKE '%Gyantse%' OR p.p_content LIKE '%Gyantse%'
          OR p.p_name LIKE '%Namtso%' OR p.p_content LIKE '%Namtso%'
          OR p.p_name LIKE '%Yamdrok%' OR p.p_content LIKE '%Yamdrok%'
          OR p.p_name LIKE '%Tashilhunpo%' OR p.p_content LIKE '%Tashilhunpo%'
          OR p.p_name LIKE '%Jokhang%' OR p.p_content LIKE '%Jokhang%'
          OR p.p_name LIKE '%Barkhor%' OR p.p_content LIKE '%Barkhor%'
          OR p.p_slug LIKE '%tibet%' OR p.p_slug LIKE '%lhasa%' OR p.p_slug LIKE '%potala%')
    AND p.status = 1 
    AND p.is_publish = 1
    GROUP BY p.id
    ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send({ error: 'Database error', details: err.message });
    const formattedPackages = results.map(pkg => {
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
        slug: pkg.p_slug,
        description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) : '',
        image: pkg.feature_img,
        duration: pkg.day_night || 'Multiple Days',
        price: actualPrice,
        savings: savings,
        currency: pkg.package_currency || 'SGD',
        cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1,
        isHalalFriendly: false,
        seatsLeft: Math.floor(Math.random() * 10) + 5,
        isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'),
        hasPriceData: minPrice !== null,
        ...pkg
      };
    });
    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get Uzbekistan packages
exports.getUzbekistanPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p
    LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Uzbekistan%' OR p.p_content LIKE '%Uzbekistan%' 
          OR p.p_name LIKE '%Tashkent%' OR p.p_content LIKE '%Tashkent%'
          OR p.p_name LIKE '%Samarkand%' OR p.p_content LIKE '%Samarkand%'
          OR p.p_name LIKE '%Bukhara%' OR p.p_content LIKE '%Bukhara%'
          OR p.p_name LIKE '%Khiva%' OR p.p_content LIKE '%Khiva%'
          OR p.p_name LIKE '%Registan%' OR p.p_content LIKE '%Registan%'
          OR p.p_name LIKE '%Uzbek%' OR p.p_content LIKE '%Uzbek%'
          OR p.p_name LIKE '%Fergana%' OR p.p_content LIKE '%Fergana%'
          OR p.p_name LIKE '%Nukus%' OR p.p_content LIKE '%Nukus%'
          OR p.p_name LIKE '%Aral Sea%' OR p.p_content LIKE '%Aral Sea%'
          OR p.p_name LIKE '%Chimgan%' OR p.p_content LIKE '%Chimgan%'
          OR p.p_name LIKE '%Termez%' OR p.p_content LIKE '%Termez%'
          OR p.p_slug LIKE '%uzbekistan%' OR p.p_slug LIKE '%tashkent%' OR p.p_slug LIKE '%samarkand%')
    AND p.status = 1 
    AND p.is_publish = 1
    AND p.p_content NOT LIKE '%Pakistan%'
    AND p.p_content NOT LIKE '%Hunza%'
    AND p.p_content NOT LIKE '%Skardu%'
    AND p.p_content NOT LIKE '%Karakoram%'
    AND p.p_content NOT LIKE '%Gilgit%'
    AND p.p_name NOT LIKE '%Pakistan%'
    GROUP BY p.id
    ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send({ error: 'Database error', details: err.message });
    const formattedPackages = results.map(pkg => {
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
        slug: pkg.p_slug,
        description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) : '',
        image: pkg.feature_img,
        duration: pkg.day_night || 'Multiple Days',
        price: actualPrice,
        savings: savings,
        currency: pkg.package_currency || 'SGD',
        cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1,
        isHalalFriendly: false,
        seatsLeft: Math.floor(Math.random() * 10) + 5,
        isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'),
        hasPriceData: minPrice !== null,
        ...pkg
      };
    });
    reply.send({ success: true, packages: formattedPackages });
  });
};

// Get Maldives packages
exports.getMaldivesPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Maldives%'
          OR p.country_id = 'undefined')
    AND p.status = 1 AND p.is_publish = 1
    GROUP BY p.id ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error fetching Maldives packages:', err);
      return reply.status(500).send({ error: 'Database error', details: err.message });
    }
    if (!results || results.length === 0) {
      return reply.send({ success: true, packages: [] });
    }
    const formattedPackages = results.map(pkg => {
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
        id: pkg.id, title: pkg.p_name, slug: pkg.p_slug || pkg.p_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : '',
        image: pkg.feature_img, duration: pkg.day_night || 'Multiple Days', price: actualPrice, savings: savings,
        currency: pkg.package_currency || 'SGD', cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1,
        isHalalFriendly: pkg.display_type && pkg.display_type.includes('halal'), seatsLeft: (pkg.id % 15) + 5,
        isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'), hasPriceData: minPrice !== null
      };
    });
    reply.send({ success: true, packages: formattedPackages });
  });

};

// Get Myanmar packages
exports.getMyanmarPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Myanmar%'
          OR p.country_id = 'undefined')
    AND p.status = 1 AND p.is_publish = 1
    GROUP BY p.id ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error fetching Myanmar packages:', err);
      return reply.status(500).send({ error: 'Database error', details: err.message });
    }
    if (!results || results.length === 0) {
      return reply.send({ success: true, packages: [] });
    }
    const formattedPackages = results.map(pkg => {
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
        id: pkg.id, title: pkg.p_name, slug: pkg.p_slug || pkg.p_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : '',
        image: pkg.feature_img, duration: pkg.day_night || 'Multiple Days', price: actualPrice, savings: savings,
        currency: pkg.package_currency || 'SGD', cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1,
        isHalalFriendly: pkg.display_type && pkg.display_type.includes('halal'), seatsLeft: (pkg.id % 15) + 5,
        isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'), hasPriceData: minPrice !== null
      };
    });
    reply.send({ success: true, packages: formattedPackages });
  });

};

// Get Philippines packages
exports.getPhilippinesPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Philippines%'
          OR p.country_id = 'undefined')
    AND p.status = 1 AND p.is_publish = 1
    GROUP BY p.id ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error fetching Philippines packages:', err);
      return reply.status(500).send({ error: 'Database error', details: err.message });
    }
    if (!results || results.length === 0) {
      return reply.send({ success: true, packages: [] });
    }
    const formattedPackages = results.map(pkg => {
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
        id: pkg.id, title: pkg.p_name, slug: pkg.p_slug || pkg.p_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : '',
        image: pkg.feature_img, duration: pkg.day_night || 'Multiple Days', price: actualPrice, savings: savings,
        currency: pkg.package_currency || 'SGD', cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1,
        isHalalFriendly: pkg.display_type && pkg.display_type.includes('halal'), seatsLeft: (pkg.id % 15) + 5,
        isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'), hasPriceData: minPrice !== null
      };
    });
    reply.send({ success: true, packages: formattedPackages });
  });

};

// Get Singapore packages
exports.getSingaporePackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Singapore%'
          OR p.country_id = 'undefined')
    AND p.status = 1 AND p.is_publish = 1
    GROUP BY p.id ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error fetching Singapore packages:', err);
      return reply.status(500).send({ error: 'Database error', details: err.message });
    }
    if (!results || results.length === 0) {
      return reply.send({ success: true, packages: [] });
    }
    const formattedPackages = results.map(pkg => {
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
        id: pkg.id, title: pkg.p_name, slug: pkg.p_slug || pkg.p_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : '',
        image: pkg.feature_img, duration: pkg.day_night || 'Multiple Days', price: actualPrice, savings: savings,
        currency: pkg.package_currency || 'SGD', cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1,
        isHalalFriendly: pkg.display_type && pkg.display_type.includes('halal'), seatsLeft: (pkg.id % 15) + 5,
        isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'), hasPriceData: minPrice !== null
      };
    });
    reply.send({ success: true, packages: formattedPackages });
  });

};

// Get Thailand packages
exports.getThailandPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Thailand%'
          OR p.country_id = 'undefined')
    AND p.status = 1 AND p.is_publish = 1
    GROUP BY p.id ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error fetching Thailand packages:', err);
      return reply.status(500).send({ error: 'Database error', details: err.message });
    }
    if (!results || results.length === 0) {
      return reply.send({ success: true, packages: [] });
    }
    const formattedPackages = results.map(pkg => {
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
        id: pkg.id, title: pkg.p_name, slug: pkg.p_slug || pkg.p_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : '',
        image: pkg.feature_img, duration: pkg.day_night || 'Multiple Days', price: actualPrice, savings: savings,
        currency: pkg.package_currency || 'SGD', cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1,
        isHalalFriendly: pkg.display_type && pkg.display_type.includes('halal'), seatsLeft: (pkg.id % 15) + 5,
        isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'), hasPriceData: minPrice !== null
      };
    });
    reply.send({ success: true, packages: formattedPackages });
  });

};

// Get Timor-Leste packages
exports.getTimorLestePackages = (req, reply) => {
  const query = `
    SELECT * FROM tbl_packages 
    WHERE (p_name LIKE '%Timor-Leste%' OR p_content LIKE '%Timor-Leste%' 
          OR p_name LIKE '%East Timor%' OR p_content LIKE '%East Timor%'
          OR p_name LIKE '%Dili%' OR p_content LIKE '%Dili%'
          OR p_name LIKE '%Timor%' OR p_content LIKE '%Timor%'
          OR p_name LIKE '%Timorese%' OR p_content LIKE '%Timorese%'
          OR p_name LIKE '%Baucau%' OR p_content LIKE '%Baucau%'
          OR p_name LIKE '%Maliana%' OR p_content LIKE '%Maliana%'
          OR p_name LIKE '%Suai%' OR p_content LIKE '%Suai%'
          OR p_name LIKE '%Lospalos%' OR p_content LIKE '%Lospalos%'
          OR p_name LIKE '%Atauro%' OR p_content LIKE '%Atauro%'
          OR p_name LIKE '%Jaco Island%' OR p_content LIKE '%Jaco Island%'
          OR p_name LIKE '%Cristo Rei%' OR p_content LIKE '%Cristo Rei%'
          OR p_slug LIKE '%timor%' OR p_slug LIKE '%dili%' OR p_slug LIKE '%east-timor%'
          OR country_id = '216')
    AND status = 1 
    AND is_publish = 1
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send(err);
    
    // Add pricing data to packages
    addPricingToPackages(results, (priceErr, packagesWithPricing) => {
      if (priceErr) {
        console.error('Error adding pricing:', priceErr);
        return reply.status(500).send(err);
      }
      reply.send(packagesWithPricing);
    });
  });
};

// Get Vietnam packages
exports.getVietnamPackages = (req, reply) => {
  const query = `
    SELECT p.*, MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.p_name LIKE '%Vietnam%'
          OR p.country_id = 'undefined')
    AND p.status = 1 AND p.is_publish = 1
    GROUP BY p.id ORDER BY p.p_name
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error fetching Vietnam packages:', err);
      return reply.status(500).send({ error: 'Database error', details: err.message });
    }
    if (!results || results.length === 0) {
      return reply.send({ success: true, packages: [] });
    }
    const formattedPackages = results.map(pkg => {
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
        id: pkg.id, title: pkg.p_name, slug: pkg.p_slug || pkg.p_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : '',
        image: pkg.feature_img, duration: pkg.day_night || 'Multiple Days', price: actualPrice, savings: savings,
        currency: pkg.package_currency || 'SGD', cities: pkg.desti_list ? pkg.desti_list.split(',').length : 1,
        isHalalFriendly: pkg.display_type && pkg.display_type.includes('halal'), seatsLeft: (pkg.id % 15) + 5,
        isTopSelling: pkg.display_type && pkg.display_type.includes('hot_deals'), hasPriceData: minPrice !== null
      };
    });
    reply.send({ success: true, packages: formattedPackages });
  });

};

// Get Oman packages
exports.getOmanPackages = (req, reply) => {
  const query = `
    SELECT * FROM tbl_packages 
    WHERE (p_name LIKE '%Oman%'
          OR p_name LIKE '%Muscat%'
          OR p_name LIKE '%Salalah%'
          OR p_name LIKE '%Omani%'
          OR p_slug LIKE '%oman%')
    AND status = 1 
    AND is_publish = 1
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error fetching Oman packages:', err);
      return reply.status(500).send({ error: 'Database error', details: err.message });
    }
    
    // Return empty array if no results
    if (!results || results.length === 0) {
      return reply.send([]);
    }
    
    // Add slug generation for each package
    const packagesWithSlugs = results.map(pkg => ({
      ...pkg,
      slug: pkg.p_slug || (pkg.p_name ? pkg.p_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : `package-${pkg.id}`)
    }));
    reply.send(packagesWithSlugs);
  });
};

// Get Qatar packages
exports.getQatarPackages = (req, reply) => {
  const query = `
    SELECT * FROM tbl_packages 
    WHERE (p_name LIKE '%Qatar%' OR p_content LIKE '%Qatar%' 
          OR p_name LIKE '%Doha%' OR p_content LIKE '%Doha%'
          OR p_name LIKE '%Al Rayyan%' OR p_content LIKE '%Al Rayyan%'
          OR p_name LIKE '%Al Wakrah%' OR p_content LIKE '%Al Wakrah%'
          OR p_name LIKE '%Lusail%' OR p_content LIKE '%Lusail%'
          OR p_name LIKE '%Qatari%' OR p_content LIKE '%Qatari%'
          OR p_name LIKE '%Corniche%' OR p_content LIKE '%Corniche%'
          OR p_name LIKE '%Souq Waqif%' OR p_content LIKE '%Souq Waqif%'
          OR p_name LIKE '%Museum of Islamic Art%' OR p_content LIKE '%Museum of Islamic Art%'
          OR p_name LIKE '%Pearl Qatar%' OR p_content LIKE '%Pearl Qatar%'
          OR p_name LIKE '%Katara%' OR p_content LIKE '%Katara%'
          OR p_name LIKE '%Al Zubarah%' OR p_content LIKE '%Al Zubarah%'
          OR p_slug LIKE '%qatar%' OR p_slug LIKE '%doha%' OR p_slug LIKE '%lusail%')
    AND status = 1 
    AND is_publish = 1
  `;
  
  db.query(query, (err, results) => {
    if (err) return reply.status(500).send(err);
    // Add slug generation for each package
    const packagesWithSlugs = results.map(pkg => ({
      ...pkg,
      slug: pkg.p_name ? pkg.p_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : `package-${pkg.id}`
    }));
    reply.send(packagesWithSlugs);
  });
};

// Get Saudi Arabia packages
exports.getSaudiArabiaPackages = (req, reply) => {
  const query = `
    SELECT * FROM tbl_packages 
    WHERE (p_name LIKE '%Saudi Arabia%'
          OR p_name LIKE '%Saudi%'
          OR p_name LIKE '%Riyadh%'
          OR p_name LIKE '%Jeddah%'
          OR p_name LIKE '%AlUla%'
          OR p_name LIKE '%Al-Ula%'
          OR p_slug LIKE '%saudi%')
    AND status = 1 
    AND is_publish = 1
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error fetching Saudi Arabia packages:', err);
      return reply.status(500).send({ error: 'Database error', details: err.message });
    }
    
    // Return empty array if no results
    if (!results || results.length === 0) {
      return reply.send([]);
    }
    
    // Add slug generation for each package
    const packagesWithSlugs = results.map(pkg => ({
      ...pkg,
      slug: pkg.p_slug || (pkg.p_name ? pkg.p_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : `package-${pkg.id}`)
    }));
    reply.send(packagesWithSlugs);
  });
};
