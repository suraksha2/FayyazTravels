// controllers/packages.controller.js
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

// For demo: static data. Replace with DB logic as needed.
const packages = [
  {
    id: 1,
    title: "Taiwan Odyssey",
    destination: "Taiwan",
    category: "Adventure",
    price: 4225,
    days: 7,
    cities: 3,
    isHalalFriendly: true,
    seatsLeft: 10,
    description: "A week-long adventure in Taiwan.",
    image: "https://images.pexels.com/photos/5087165/pexels-photo-5087165.jpeg",
    savings: 500,
    isTopSelling: true
  },
  {
    id: 2,
    title: "Serengeti Safari",
    destination: "Tanzania",
    category: "Safari",
    price: 8450,
    days: 10,
    cities: 4,
    isHalalFriendly: true,
    seatsLeft: 8,
    description: "Wildlife and adventure in the Serengeti.",
    image: "https://images.pexels.com/photos/4577791/pexels-photo-4577791.jpeg",
    savings: 800,
    isTopSelling: true
  },
  {
    id: 3,
    title: "Northern Lights Adventure",
    destination: "Sweden",
    category: "Adventure",
    price: 3999,
    days: 8,
    cities: 3,
    isHalalFriendly: true,
    seatsLeft: 12,
    description: "See the Northern Lights in Sweden.",
    image: "https://images.pexels.com/photos/1933316/pexels-photo-1933316.jpeg",
    savings: 400,
    isTopSelling: false
  },
  {
    id: 4,
    title: "Japan Explorer",
    destination: "Japan",
    category: "Cultural",
    price: 5999,
    days: 10,
    cities: 4,
    isHalalFriendly: true,
    seatsLeft: 8,
    description: "Experience the perfect blend of traditional culture and modern innovation in Japan.",
    image: "https://images.pexels.com/photos/3408354/pexels-photo-3408354.jpeg",
    savings: 800,
    isTopSelling: true
  },
  {
    id: 5,
    title: "Vietnam Discovery",
    destination: "Vietnam",
    category: "Cultural",
    price: 3599,
    days: 8,
    cities: 3,
    isHalalFriendly: true,
    seatsLeft: 12,
    description: "Journey through Vietnam's stunning landscapes and rich cultural heritage.",
    image: "https://images.pexels.com/photos/2166559/pexels-photo-2166559.jpeg",
    savings: 400,
    isTopSelling: false
  },
  {
    id: 6,
    title: "Thailand Adventure",
    destination: "Thailand",
    category: "Beach",
    price: 3899,
    days: 9,
    cities: 4,
    isHalalFriendly: true,
    seatsLeft: 6,
    description: "Explore Thailand's tropical paradise and ancient temples.",
    image: "https://images.pexels.com/photos/1282315/pexels-photo-1282315.jpeg",
    savings: 600,
    isTopSelling: true
  },
  {
    id: 7,
    title: "Maldives Paradise",
    destination: "Maldives",
    category: "Beach",
    price: 7500,
    days: 6,
    cities: 2,
    isHalalFriendly: true,
    seatsLeft: 5,
    description: "Luxury beach resort experience in the Maldives.",
    image: "https://images.pexels.com/photos/1287460/pexels-photo-1287460.jpeg",
    savings: 1000,
    isTopSelling: true
  },
  {
    id: 8,
    title: "Kenya Wildlife Safari",
    destination: "Kenya",
    category: "Safari",
    price: 6800,
    days: 12,
    cities: 5,
    isHalalFriendly: true,
    seatsLeft: 7,
    description: "Experience the Big Five in Kenya's national parks.",
    image: "https://images.pexels.com/photos/631317/pexels-photo-631317.jpeg",
    savings: 700,
    isTopSelling: false
  }
];

exports.getAll = (req, reply) => {
  const { country, destination, category, minPrice, maxPrice, id, limit = 100 } = req.query;
  
  // Build WHERE clause
  let whereConditions = ['p.status = 1', 'p.is_publish = 1'];
  let queryParams = [];
  
  // Filter by country name
  if (country) {
    whereConditions.push('p.p_name LIKE ?');
    queryParams.push(`%${country}%`);
  }
  
  // Filter by destination
  if (destination) {
    whereConditions.push('p.p_name LIKE ?');
    queryParams.push(`%${destination}%`);
  }
  
  const whereClause = whereConditions.join(' AND ');
  
  // Query database for packages
  const query = `
    SELECT 
      p.id,
      p.p_name as title,
      p.p_slug as slug,
      p.day_night,
      p.feature_img as image,
      p.p_content as description,
      p.package_currency,
      p.country_id,
      p.insert_date,
      MIN(pr.price_t2) as min_price,
      MAX(pr.price_t2) as max_price,
      MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p
    LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE ${whereClause}
    GROUP BY p.id
    ORDER BY p.insert_date DESC
    LIMIT ?
  `;
  
  queryParams.push(parseInt(limit));
  
  db.query(query, queryParams, (err, results) => {
    if (err) {
      console.error('Error fetching packages:', err);
      return reply.status(500).send({ 
        error: 'Failed to fetch packages', 
        details: err.message 
      });
    }
    
    // Format the results
    const formattedPackages = results.map(pkg => {
      const dayMatch = pkg.day_night ? pkg.day_night.match(/(\d+)D/) : null;
      const days = dayMatch ? parseInt(dayMatch[1]) : 7;
      const slug = pkg.slug || pkg.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const cities = Math.min(Math.max(Math.floor(days / 2), 1), 5);
      
      const minPrice = pkg.min_price ? parseInt(pkg.min_price) : null;
      const salePrice = pkg.sale_price && pkg.sale_price !== '' ? parseInt(pkg.sale_price) : null;
      
      let actualPrice, savings;
      if (minPrice) {
        actualPrice = minPrice;
        savings = salePrice && salePrice < minPrice ? minPrice - salePrice : Math.floor(minPrice * 0.1);
      } else {
        actualPrice = days * 300 + (pkg.id % 2000) + 2000;
        savings = Math.floor(actualPrice * 0.1);
      }
      
      return {
        id: pkg.id,
        slug: slug,
        title: pkg.title,
        duration: `${days} Days`,
        cities: cities,
        image: pkg.image || `https://images.pexels.com/photos/${3408354 + (pkg.id % 1000)}/pexels-photo-${3408354 + (pkg.id % 1000)}.jpeg`,
        days: days,
        isHalalFriendly: true,
        seatsLeft: (pkg.id % 15) + 5,
        description: pkg.description ? pkg.description.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : `Discover ${pkg.title}`,
        price: actualPrice,
        savings: savings,
        isTopSelling: (pkg.id % 3) === 0,
        currency: pkg.package_currency || 'SGD',
        hasPriceData: !!minPrice
      };
    });
    
    reply.send({
      success: true,
      count: formattedPackages.length,
      packages: formattedPackages
    });
  });
};

// Get unique categories
exports.getCategories = async (req, reply) => {
  const categories = [...new Set(packages.map(pkg => pkg.category))];
  reply.send(categories);
};

// Get unique destinations
exports.getDestinations = async (req, reply) => {
  const destinations = [...new Set(packages.map(pkg => pkg.destination))];
  reply.send(destinations);
};

// Get Multi City packages from database
exports.getMultiCityDestinations = (req, reply) => {
  const { limit = 12 } = req.query;
  const limitValue = parseInt(limit) || 12;
  
  // Query database for Multi City packages with real prices from tbl_price
  const query = `
    SELECT 
      p.id,
      p.p_name as title,
      p.p_slug as slug,
      p.day_night,
      p.feature_img as image,
      p.p_content as description,
      p.package_currency,
      p.country_id,
      p.insert_date,
      p.status,
      p.is_publish,
      p.display_type,
      MIN(pr.price_t2) as min_price,
      MAX(pr.price_t2) as max_price,
      MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p
    LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (
      p.display_type LIKE '%multi_city%'
      OR p.display_type LIKE '%multi-city%'
      OR p.p_name LIKE '%-%'
      OR p.p_name LIKE '%Australia%New Zealand%'
      OR p.p_name LIKE '%Austria%Switzerland%'
      OR p.p_name LIKE '%Bulgaria%Greece%'
      OR p.p_name LIKE '%Japan%Korea%'
      OR p.p_name LIKE '%Thailand%Vietnam%'
      OR p.p_name LIKE '%France%Italy%'
      OR p.p_name LIKE '%Spain%Portugal%'
      OR p.p_name LIKE '%Canada%United States%'
    )
    AND p.status = 1 
    AND p.is_publish = 1
    GROUP BY p.id
    ORDER BY p.insert_date DESC
    LIMIT ${limitValue}
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching Multi City packages:', err);
      return reply.status(500).send({ 
        error: 'Failed to fetch Multi City packages', 
        details: err.message 
      });
    }
    
    // Format the results for frontend consumption
    const formattedPackages = results.map(pkg => {
      // Parse day_night to extract days
      const dayMatch = pkg.day_night ? pkg.day_night.match(/(\d+)D/) : null;
      const days = dayMatch ? parseInt(dayMatch[1]) : 7;
      
      // Generate slug if not available
      const slug = pkg.slug || pkg.title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      // Estimate cities based on days (simple logic)
      const cities = Math.min(Math.max(Math.floor(days / 2), 1), 5);
      
      // Use real price from database or fallback to calculated
      const minPrice = pkg.min_price ? parseInt(pkg.min_price) : null;
      const salePrice = pkg.sale_price && pkg.sale_price !== '' ? parseInt(pkg.sale_price) : null;
      
      // Determine actual price and savings (MUST match getBySlug logic)
      let actualPrice, savings;
      if (minPrice) {
        actualPrice = minPrice;
        savings = salePrice && salePrice < minPrice ? minPrice - salePrice : Math.floor(minPrice * 0.1);
      } else {
        // Fallback to calculated price if no price in database (same as detail page)
        actualPrice = days * 300 + (pkg.id % 2000) + 2000;
        savings = Math.floor(actualPrice * 0.1);
      }
      
      return {
        id: pkg.id,
        slug: slug,
        title: pkg.title,
        duration: `${days} Days`,
        cities: `${cities} Cities`,
        image: pkg.image || `https://images.pexels.com/photos/${2193300 + (pkg.id % 1000)}/pexels-photo-${2193300 + (pkg.id % 1000)}.jpeg`,
        days: days,
        isHalalFriendly: true,
        seatsLeft: (pkg.id % 15) + 5,
        description: pkg.description ? pkg.description.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : `Experience multiple destinations with our ${pkg.title} package`,
        price: actualPrice,
        savings: savings,
        isTopSelling: (pkg.id % 3) === 0,
        currency: pkg.package_currency || 'SGD',
        hasPriceData: !!minPrice
      };
    });
    
    reply.send({
      success: true,
      count: formattedPackages.length,
      packages: formattedPackages
    });
  });
};

// Create a new package
// Get package by ID from database
exports.getById = (req, reply) => {
  const { id } = req.params;
  
  if (!id) {
    return reply.status(400).send({
      error: 'Package ID is required'
    });
  }

  // Validate and parse ID
  const packageId = parseInt(id);
  if (isNaN(packageId)) {
    return reply.status(400).send({
      error: 'Invalid package ID. ID must be a number.'
    });
  }

  // Query database for the specific package
  db.query(
    'SELECT * FROM tbl_packages WHERE id = ? AND status = 1 AND is_publish = 1', 
    [packageId], 
    (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return reply.status(500).send({ error: 'Database error', details: err.message });
      }
      
      if (!results.length) {
        return reply.status(404).send({
          error: 'Package not found'
        });
      }
      
      const packageData = results[0];
      
      // Fetch price data from tbl_price
      db.query(
        'SELECT MIN(price_t2) as min_price, MAX(price_t2) as max_price, MIN(price_t2_sale) as sale_price FROM tbl_price WHERE package_id = ?',
        [packageData.id],
        (priceErr, priceResults) => {
          if (priceErr) {
            console.error('Error fetching price data:', priceErr);
            // Continue without price data
          }
          
          // Helper function to convert empty strings to null and parse numbers
          const parsePrice = (value) => {
            if (!value || value === '' || value === '0') return null;
            const parsed = parseInt(value);
            return isNaN(parsed) ? null : parsed;
          };
          
          // Parse price data
          const minPrice = priceResults && priceResults[0] ? parsePrice(priceResults[0].min_price) : null;
          const maxPrice = priceResults && priceResults[0] ? parsePrice(priceResults[0].max_price) : null;
          const salePrice = priceResults && priceResults[0] ? parsePrice(priceResults[0].sale_price) : null;
          
          // Calculate display price (matching logic from listing endpoints)
          let displayPrice, savings;
          if (minPrice) {
            displayPrice = minPrice;
            savings = salePrice && salePrice < minPrice ? minPrice - salePrice : Math.floor(minPrice * 0.1);
          } else {
            // Fallback: calculate price based on days and package ID
            const dayMatch = packageData.day_night ? packageData.day_night.match(/(\d+)D/) : null;
            const days = dayMatch ? parseInt(dayMatch[1]) : 7;
            displayPrice = days * 300 + (packageData.id % 2000) + 2000;
            savings = Math.floor(displayPrice * 0.1);
          }
          
          // Add pricing information to package data
          const packageWithPricing = {
            ...packageData,
            min_price: minPrice,
            max_price: maxPrice,
            sale_price: salePrice,
            display_price: displayPrice,
            price: displayPrice,
            savings: savings
          };
          
          reply.send(packageWithPricing);
        }
      );
    }
  );
};

// Get package details for booking (includes pricing and availability)
exports.getForBooking = (req, reply) => {
  const { id } = req.params;
  
  if (!id) {
    return reply.status(400).send({
      error: 'Package ID is required'
    });
  }

  // Query database for the specific package with booking-relevant fields
  db.query(
    `SELECT id, p_name, p_slug, p_content, day_night, feature_img, 
     booking_range, disable_date, package_currency, desti_list,
     inclusions, exclusions, itinerary_pdf, status, is_publish
     FROM tbl_packages 
     WHERE id = ? AND status = 1 AND is_publish = 1`, 
    [parseInt(id)], 
    (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return reply.status(500).send({ error: 'Database error', details: err.message });
      }
      
      if (!results.length) {
        return reply.status(404).send({
          error: 'Package not found or not available for booking'
        });
      }
      
      const packageData = results[0];
      
      // Fetch price data from tbl_price
      db.query(
        'SELECT MIN(price_t2) as min_price, MAX(price_t2) as max_price, MIN(price_t2_sale) as sale_price FROM tbl_price WHERE package_id = ?',
        [packageData.id],
        (priceErr, priceResults) => {
          if (priceErr) {
            console.error('Error fetching price data:', priceErr);
            // Continue without price data
          }
          
          // Helper function to convert empty strings to null and parse numbers
          const parsePrice = (value) => {
            if (!value || value === '' || value === '0') return null;
            const parsed = parseInt(value);
            return isNaN(parsed) ? null : parsed;
          };
          
          // Parse price data
          const minPrice = priceResults && priceResults[0] ? parsePrice(priceResults[0].min_price) : null;
          const maxPrice = priceResults && priceResults[0] ? parsePrice(priceResults[0].max_price) : null;
          const salePrice = priceResults && priceResults[0] ? parsePrice(priceResults[0].sale_price) : null;
          
          // Calculate display price (matching logic from listing endpoints)
          let displayPrice, savings;
          if (minPrice) {
            displayPrice = minPrice;
            savings = salePrice && salePrice < minPrice ? minPrice - salePrice : Math.floor(minPrice * 0.1);
          } else {
            // Fallback: calculate price based on days and package ID
            const dayMatch = packageData.day_night ? packageData.day_night.match(/(\d+)D/) : null;
            const days = dayMatch ? parseInt(dayMatch[1]) : 7;
            displayPrice = days * 300 + (packageData.id % 2000) + 2000;
            savings = Math.floor(displayPrice * 0.1);
          }
          
          // Parse booking range and disabled dates
          const bookingRange = packageData.booking_range ? packageData.booking_range.split(',') : [];
          const disabledDates = packageData.disable_date ? packageData.disable_date.split(',') : [];
          
          // Add booking-specific information with price data
          const bookingPackage = {
            ...packageData,
            booking_start_date: bookingRange[0] || null,
            booking_end_date: bookingRange[1] || null,
            disabled_dates: disabledDates,
            is_bookable: true,
            currency: packageData.package_currency || 'SGD',
            min_price: minPrice,
            max_price: maxPrice,
            sale_price: salePrice,
            display_price: displayPrice,
            savings: savings
          };
          
          reply.send(bookingPackage);
        }
      );
    }
  );
};

exports.create = async (req, reply) => {
  try {
    const {
      title,
      destination,
      category,
      price,
      days,
      cities,
      isHalalFriendly,
      seatsLeft,
      description,
      image,
      savings,
      isTopSelling
    } = req.body;

    // Validate required fields
    if (!title || !destination || !category || !price || !days) {
      return reply.status(400).send({
        error: 'Missing required fields: title, destination, category, price, days'
      });
    }

    // Generate new ID (in a real app, this would be handled by the database)
    const newId = Math.max(...packages.map(pkg => pkg.id)) + 1;

    // Create new package object
    const newPackage = {
      id: newId,
      title,
      destination,
      category,
      price: Number(price),
      days: Number(days),
      cities: Number(cities) || 1,
      isHalalFriendly: isHalalFriendly !== undefined ? Boolean(isHalalFriendly) : true,
      seatsLeft: Number(seatsLeft) || 10,
      description: description || '',
      image: image || 'https://images.pexels.com/photos/1287460/pexels-photo-1287460.jpeg',
      savings: Number(savings) || 0,
      isTopSelling: isTopSelling !== undefined ? Boolean(isTopSelling) : false
    };

    // Add to packages array (in a real app, this would be saved to database)
    packages.push(newPackage);

    reply.status(201).send({
      message: 'Package created successfully',
      package: newPackage
    });
  } catch (error) {
    reply.status(500).send({
      error: 'Internal server error',
      details: error.message
    });
  }
};

// Get hot deals packages from database
exports.getHotDeals = (req, reply) => {
  const { limit = 6 } = req.query;
  const limitValue = parseInt(limit) || 6;
  
  // Query database for hot deals packages with pricing
  const query = `
    SELECT * FROM tbl_packages 
    WHERE (display_type LIKE '%hot_deals%' OR display_type = 'hot_deals')
    AND status = 1 
    AND is_publish = 1
    ORDER BY insert_date DESC
    LIMIT ${limitValue}
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching hot deals:', err);
      return reply.status(500).send({ 
        error: 'Failed to fetch hot deals', 
        details: err.message 
      });
    }
    
    // Add pricing data to packages
    addPricingToPackages(results, (priceErr, packagesWithPricing) => {
      if (priceErr) {
        console.error('Error adding pricing to hot deals:', priceErr);
        return reply.status(500).send({ 
          error: 'Failed to process hot deals pricing', 
          details: priceErr.message 
        });
      }
      
      // Format the results for frontend consumption
      const formattedDeals = packagesWithPricing.map(pkg => {
        // Parse day_night to extract days
        const dayMatch = pkg.day_night ? pkg.day_night.match(/(\d+)D/) : null;
        const days = dayMatch ? parseInt(dayMatch[1]) : 7;
        
        // Generate slug if not available
        const slug = pkg.slug || pkg.p_slug || pkg.p_name.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        
        // Estimate cities based on days (simple logic)
        const cities = Math.min(Math.max(Math.floor(days / 2), 1), 5);
        
        return {
          id: pkg.id,
          slug: slug,
          title: pkg.p_name,
          subtitle: `Explore ${pkg.p_name}`,
          image: pkg.feature_img || `https://images.pexels.com/photos/${5087165 + (pkg.id % 1000)}/pexels-photo-${5087165 + (pkg.id % 1000)}.jpeg`,
          days: days,
          cities: cities,
          isHalalFriendly: true,
          seatsLeft: (pkg.id % 15) + 5,
          description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 100) + '...' : `Discover the beauty and culture of ${pkg.p_name}.`,
          price: pkg.price || 0,
          savings: pkg.savings || 0,
          isTopSelling: (pkg.id % 2) === 0,
          currency: pkg.package_currency || 'SGD'
        };
      });
      
      reply.send({
        success: true,
        count: formattedDeals.length,
        deals: formattedDeals
      });
    });
  });
};

// Get packages by category
exports.getByCategory = (req, reply) => {
  const { category } = req.params;
  const { limit = 12, offset = 0 } = req.query;
  
  // Map frontend categories to database filters
  const categoryMapping = {
    'adventure': {
      keywords: ['adventure', 'hiking', 'trekking', 'mountain', 'expedition', 'explorer'],
      displayTypes: ['adventure_packages']
    },
    'safari': {
      keywords: ['safari', 'wildlife', 'kenya', 'tanzania', 'africa', 'serengeti'],
      displayTypes: []
    },
    'cultural': {
      keywords: ['cultural', 'heritage', 'temple', 'historic', 'traditional', 'culture'],
      displayTypes: []
    },
    'beach': {
      keywords: ['beach', 'island', 'maldives', 'tropical', 'resort', 'paradise'],
      displayTypes: []
    }
  };
  
  const categoryConfig = categoryMapping[category.toLowerCase()];
  
  if (!categoryConfig) {
    return reply.status(404).send({
      error: 'Category not found',
      availableCategories: Object.keys(categoryMapping)
    });
  }
  
  // Build WHERE clause for category filtering
  let whereConditions = ['status = 1', 'is_publish = 1'];
  let queryParams = [];
  
  // Add keyword-based filtering
  if (categoryConfig.keywords.length > 0) {
    const keywordConditions = categoryConfig.keywords.map(() => 'p_name LIKE ?').join(' OR ');
    whereConditions.push(`(${keywordConditions})`);
    categoryConfig.keywords.forEach(keyword => {
      queryParams.push(`%${keyword}%`);
    });
  }
  
  // Add display type filtering
  if (categoryConfig.displayTypes.length > 0) {
    const displayTypeConditions = categoryConfig.displayTypes.map(() => 'display_type LIKE ?').join(' OR ');
    whereConditions.push(`(${displayTypeConditions})`);
    categoryConfig.displayTypes.forEach(displayType => {
      queryParams.push(`%${displayType}%`);
    });
  }
  
  const whereClause = whereConditions.join(' AND ');
  
  // Query for packages
  const query = `
    SELECT * FROM tbl_packages 
    WHERE ${whereClause}
    ORDER BY insert_date DESC
    LIMIT ? OFFSET ?
  `;
  
  queryParams.push(parseInt(limit), parseInt(offset));
  
  db.query(query, queryParams, (err, results) => {
    if (err) {
      console.error('Error fetching packages by category:', err);
      return reply.status(500).send({ 
        error: 'Failed to fetch packages', 
        details: err.message 
      });
    }
    
    // Add pricing data to packages
    addPricingToPackages(results, (priceErr, packagesWithPricing) => {
      if (priceErr) {
        console.error('Error adding pricing to category packages:', priceErr);
        return reply.status(500).send({ 
          error: 'Failed to process category packages pricing', 
          details: priceErr.message 
        });
      }
      
      // Format the results
      const formattedPackages = packagesWithPricing.map(pkg => {
        // Parse day_night to extract days
        const dayMatch = pkg.day_night ? pkg.day_night.match(/(\d+)D/) : null;
        const days = dayMatch ? parseInt(dayMatch[1]) : 7;
        
        // Generate slug if not available
        const slug = pkg.slug || pkg.p_slug || pkg.p_name.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        
        // Estimate cities
        const cities = Math.min(Math.max(Math.floor(days / 2), 1), 5);
        
        return {
          id: pkg.id,
          slug: slug,
          title: pkg.p_name,
          image: pkg.feature_img || `https://images.pexels.com/photos/${5087165 + (pkg.id % 1000)}/pexels-photo-${5087165 + (pkg.id % 1000)}.jpeg`,
          days: days,
          cities: cities,
          description: pkg.p_content ? pkg.p_content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : `Discover the beauty of ${pkg.p_name}.`,
          price: pkg.price || 0,
          savings: pkg.savings || 0,
          currency: pkg.package_currency || 'SGD',
          category: category
        };
      });
      
      reply.send({
        success: true,
        category: category,
        count: formattedPackages.length,
        packages: formattedPackages
      });
    });
  });
};

// Get South East Asia packages from database
exports.getSouthEastAsiaPackages = (req, reply) => {
  const { limit = 12 } = req.query;
  const limitValue = parseInt(limit) || 12;
  
  // Query database for South East Asia packages with real prices from tbl_price
  const query = `
    SELECT 
      p.id,
      p.p_name as title,
      p.p_slug as slug,
      p.day_night,
      p.feature_img as image,
      p.p_content as description,
      p.package_currency,
      p.country_id,
      p.insert_date,
      p.status,
      p.is_publish,
      p.display_type,
      MIN(pr.price_t2) as min_price,
      MAX(pr.price_t2) as max_price,
      MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p
    LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (
      p.display_type LIKE '%south_east_asia%' 
      OR p.display_type LIKE '%south-east-asia%'
      OR p.p_name LIKE '%Vietnam%'
      OR p.p_name LIKE '%Singapore%'
      OR p.p_name LIKE '%Thailand%'
      OR p.p_name LIKE '%Malaysia%'
      OR p.p_name LIKE '%Indonesia%'
      OR p.p_name LIKE '%Cambodia%'
      OR p.p_name LIKE '%Laos%'
      OR p.p_name LIKE '%Myanmar%'
      OR p.p_name LIKE '%Philippines%'
      OR p.p_name LIKE '%Brunei%'
      OR p.p_name LIKE '%Sapa%'
      OR p.p_name LIKE '%Ha Long%'
      OR p.p_name LIKE '%Bali%'
      OR p.p_name LIKE '%Phuket%'
      OR p.p_name LIKE '%Bangkok%'
    )
    AND p.status = 1 
    AND p.is_publish = 1
    GROUP BY p.id
    ORDER BY p.insert_date DESC
    LIMIT ${limitValue}
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching South East Asia packages:', err);
      return reply.status(500).send({ 
        error: 'Failed to fetch South East Asia packages', 
        details: err.message 
      });
    }
    
    // Format the results for frontend consumption
    const formattedPackages = results.map(pkg => {
      // Parse day_night to extract days
      const dayMatch = pkg.day_night ? pkg.day_night.match(/(\d+)D/) : null;
      const days = dayMatch ? parseInt(dayMatch[1]) : 7;
      
      // Generate slug if not available
      const slug = pkg.slug || pkg.title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      // Estimate cities based on days (simple logic)
      const cities = Math.min(Math.max(Math.floor(days / 2), 1), 5);
      
      // Use real price from database or fallback to calculated
      const minPrice = pkg.min_price ? parseInt(pkg.min_price) : null;
      const salePrice = pkg.sale_price && pkg.sale_price !== '' ? parseInt(pkg.sale_price) : null;
      
      // Determine actual price and savings
      let actualPrice, savings;
      if (minPrice) {
        actualPrice = minPrice;
        savings = salePrice && salePrice < minPrice ? minPrice - salePrice : Math.floor(minPrice * 0.1);
      } else {
        // Fallback to calculated price if no price in database
        actualPrice = days * 300 + (pkg.id % 2000) + 2000;
        savings = Math.floor(actualPrice * 0.1);
      }
      
      return {
        id: pkg.id,
        slug: slug,
        title: pkg.title,
        duration: `${days} Days`,
        cities: `${cities} Cities`,
        image: pkg.image || `https://images.pexels.com/photos/${1282315 + (pkg.id % 1000)}/pexels-photo-${1282315 + (pkg.id % 1000)}.jpeg`,
        days: days,
        isHalalFriendly: true, // Default to true
        seatsLeft: (pkg.id % 15) + 5, // Seats 5-20 based on ID (can be updated when you have real availability data)
        description: pkg.description ? pkg.description.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : `Embark on an adventure with our ${pkg.title} package`,
        price: actualPrice,
        savings: savings,
        isTopSelling: (pkg.id % 3) === 0, // Based on ID (can be updated with real data)
        currency: pkg.package_currency || 'SGD',
        hasPriceData: !!minPrice // Flag to indicate if real price data exists
      };
    });
    
    reply.send({
      success: true,
      count: formattedPackages.length,
      packages: formattedPackages
    });
  });
};

// Get Scandinavia packages from database
exports.getScandinaviaPackages = (req, reply) => {
  const { limit = 12 } = req.query;
  const limitValue = parseInt(limit) || 12;
  
  // Query database for Scandinavia packages with real prices from tbl_price
  const query = `
    SELECT 
      p.id,
      p.p_name as title,
      p.p_slug as slug,
      p.day_night,
      p.feature_img as image,
      p.p_content as description,
      p.package_currency,
      p.country_id,
      p.insert_date,
      p.status,
      p.is_publish,
      p.display_type,
      MIN(pr.price_t2) as min_price,
      MAX(pr.price_t2) as max_price,
      MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p
    LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (
      p.display_type LIKE '%scandinavia%'
      OR p.display_type LIKE '%nordic%'
      OR p.p_name LIKE '%Scandinavia%'
      OR p.p_name LIKE '%Norway%'
      OR p.p_name LIKE '%Sweden%'
      OR p.p_name LIKE '%Denmark%'
      OR p.p_name LIKE '%Finland%'
      OR p.p_name LIKE '%Iceland%'
      OR p.p_name LIKE '%Oslo%'
      OR p.p_name LIKE '%Stockholm%'
      OR p.p_name LIKE '%Copenhagen%'
      OR p.p_name LIKE '%Helsinki%'
      OR p.p_name LIKE '%Reykjavik%'
      OR p.p_name LIKE '%Bergen%'
      OR p.p_name LIKE '%Gothenburg%'
    )
    AND p.status = 1 
    AND p.is_publish = 1
    GROUP BY p.id
    ORDER BY p.insert_date DESC
    LIMIT ${limitValue}
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching Scandinavia packages:', err);
      return reply.status(500).send({ 
        error: 'Failed to fetch Scandinavia packages', 
        details: err.message 
      });
    }
    
    // Format the results for frontend consumption
    const formattedPackages = results.map(pkg => {
      // Parse day_night to extract days
      const dayMatch = pkg.day_night ? pkg.day_night.match(/(\d+)D/) : null;
      const days = dayMatch ? parseInt(dayMatch[1]) : 7;
      
      // Generate slug if not available
      const slug = pkg.slug || pkg.title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      // Estimate cities based on days (simple logic)
      const cities = Math.min(Math.max(Math.floor(days / 2), 1), 5);
      
      // Use real price from database or fallback to calculated
      const minPrice = pkg.min_price ? parseInt(pkg.min_price) : null;
      const salePrice = pkg.sale_price && pkg.sale_price !== '' ? parseInt(pkg.sale_price) : null;
      
      // Determine actual price and savings
      let actualPrice, savings;
      if (minPrice) {
        actualPrice = minPrice;
        savings = salePrice && salePrice < minPrice ? minPrice - salePrice : Math.floor(minPrice * 0.1);
      } else {
        // Fallback to calculated price if no price in database
        actualPrice = days * 300 + (pkg.id % 2000) + 2000;
        savings = Math.floor(actualPrice * 0.1);
      }
      
      return {
        id: pkg.id,
        slug: slug,
        title: pkg.title,
        duration: `${days} Days`,
        cities: `${cities} Cities`,
        image: pkg.image || `https://images.pexels.com/photos/${1285625 + (pkg.id % 1000)}/pexels-photo-${1285625 + (pkg.id % 1000)}.jpeg`,
        days: days,
        isHalalFriendly: true,
        seatsLeft: (pkg.id % 15) + 5,
        description: pkg.description ? pkg.description.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : `Embark on an adventure with our ${pkg.title} package`,
        price: actualPrice,
        savings: savings,
        isTopSelling: (pkg.id % 3) === 0,
        currency: pkg.package_currency || 'SGD',
        hasPriceData: !!minPrice
      };
    });
    
    reply.send({
      success: true,
      count: formattedPackages.length,
      packages: formattedPackages
    });
  });
};

// Get Oceania packages from database
exports.getOceaniaPackages = (req, reply) => {
  const { limit = 12 } = req.query;
  const limitValue = parseInt(limit) || 12;
  
  // Query database for Oceania packages with real prices from tbl_price
  const query = `
    SELECT 
      p.id,
      p.p_name as title,
      p.p_slug as slug,
      p.day_night,
      p.feature_img as image,
      p.p_content as description,
      p.package_currency,
      p.country_id,
      p.insert_date,
      p.status,
      p.is_publish,
      p.display_type,
      MIN(pr.price_t2) as min_price,
      MAX(pr.price_t2) as max_price,
      MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p
    LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (
      p.display_type LIKE '%oceania%'
      OR p.display_type LIKE '%australia%'
      OR p.display_type LIKE '%new_zealand%'
      OR p.display_type LIKE '%new-zealand%'
      OR p.p_name LIKE '%Australia%'
      OR p.p_name LIKE '%New Zealand%'
      OR p.p_name LIKE '%Sydney%'
      OR p.p_name LIKE '%Melbourne%'
      OR p.p_name LIKE '%Brisbane%'
      OR p.p_name LIKE '%Perth%'
      OR p.p_name LIKE '%Auckland%'
      OR p.p_name LIKE '%Wellington%'
      OR p.p_name LIKE '%Queenstown%'
      OR p.p_name LIKE '%Fiji%'
      OR p.p_name LIKE '%Tahiti%'
      OR p.p_name LIKE '%Papua New Guinea%'
    )
    AND p.status = 1 
    AND p.is_publish = 1
    GROUP BY p.id
    ORDER BY p.insert_date DESC
    LIMIT ${limitValue}
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching Oceania packages:', err);
      return reply.status(500).send({ 
        error: 'Failed to fetch Oceania packages', 
        details: err.message 
      });
    }
    
    // Format the results for frontend consumption
    const formattedPackages = results.map(pkg => {
      // Parse day_night to extract days
      const dayMatch = pkg.day_night ? pkg.day_night.match(/(\d+)D/) : null;
      const days = dayMatch ? parseInt(dayMatch[1]) : 7;
      
      // Generate slug if not available
      const slug = pkg.slug || pkg.title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      // Estimate cities based on days (simple logic)
      const cities = Math.min(Math.max(Math.floor(days / 2), 1), 5);
      
      // Use real price from database or fallback to calculated
      const minPrice = pkg.min_price ? parseInt(pkg.min_price) : null;
      const salePrice = pkg.sale_price && pkg.sale_price !== '' ? parseInt(pkg.sale_price) : null;
      
      // Determine actual price and savings
      let actualPrice, savings;
      if (minPrice) {
        actualPrice = minPrice;
        savings = salePrice && salePrice < minPrice ? minPrice - salePrice : Math.floor(minPrice * 0.1);
      } else {
        // Fallback to calculated price if no price in database
        actualPrice = days * 300 + (pkg.id % 2000) + 2000;
        savings = Math.floor(actualPrice * 0.1);
      }
      
      return {
        id: pkg.id,
        slug: slug,
        title: pkg.title,
        duration: `${days} Days`,
        cities: `${cities} Cities`,
        image: pkg.image || `https://images.pexels.com/photos/${1878293 + (pkg.id % 1000)}/pexels-photo-${1878293 + (pkg.id % 1000)}.jpeg`,
        days: days,
        isHalalFriendly: true,
        seatsLeft: (pkg.id % 15) + 5,
        description: pkg.description ? pkg.description.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : `Embark on an adventure with our ${pkg.title} package`,
        price: actualPrice,
        savings: savings,
        isTopSelling: (pkg.id % 3) === 0,
        currency: pkg.package_currency || 'SGD',
        hasPriceData: !!minPrice
      };
    });
    
    reply.send({
      success: true,
      count: formattedPackages.length,
      packages: formattedPackages
    });
  });
};

// Get Europe packages from database
exports.getEuropePackages = (req, reply) => {
  const { limit = 12 } = req.query;
  const limitValue = parseInt(limit) || 12;
  
  // Query database for Europe packages with real prices from tbl_price
  const query = `
    SELECT 
      p.id,
      p.p_name as title,
      p.p_slug as slug,
      p.day_night,
      p.feature_img as image,
      p.p_content as description,
      p.package_currency,
      p.country_id,
      p.insert_date,
      p.status,
      p.is_publish,
      p.display_type,
      MIN(pr.price_t2) as min_price,
      MAX(pr.price_t2) as max_price,
      MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p
    LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (
      p.display_type LIKE '%europe%'
      OR p.p_name LIKE '%France%'
      OR p.p_name LIKE '%Paris%'
      OR p.p_name LIKE '%Italy%'
      OR p.p_name LIKE '%Rome%'
      OR p.p_name LIKE '%Spain%'
      OR p.p_name LIKE '%Barcelona%'
      OR p.p_name LIKE '%Germany%'
      OR p.p_name LIKE '%Berlin%'
      OR p.p_name LIKE '%UK%'
      OR p.p_name LIKE '%London%'
      OR p.p_name LIKE '%Switzerland%'
      OR p.p_name LIKE '%Austria%'
      OR p.p_name LIKE '%Vienna%'
      OR p.p_name LIKE '%Netherlands%'
      OR p.p_name LIKE '%Amsterdam%'
      OR p.p_name LIKE '%Belgium%'
      OR p.p_name LIKE '%Portugal%'
      OR p.p_name LIKE '%Lisbon%'
      OR p.p_name LIKE '%Iceland%'
      OR p.p_name LIKE '%Scandinavia%'
      OR p.p_name LIKE '%Norway%'
      OR p.p_name LIKE '%Sweden%'
      OR p.p_name LIKE '%Denmark%'
    )
    AND p.status = 1 
    AND p.is_publish = 1
    GROUP BY p.id
    ORDER BY p.insert_date DESC
    LIMIT ${limitValue}
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching Europe packages:', err);
      return reply.status(500).send({ 
        error: 'Failed to fetch Europe packages', 
        details: err.message 
      });
    }
    
    // Format the results for frontend consumption
    const formattedPackages = results.map(pkg => {
      // Parse day_night to extract days
      const dayMatch = pkg.day_night ? pkg.day_night.match(/(\d+)D/) : null;
      const days = dayMatch ? parseInt(dayMatch[1]) : 7;
      
      // Generate slug if not available
      const slug = pkg.slug || pkg.title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      // Estimate cities based on days (simple logic)
      const cities = Math.min(Math.max(Math.floor(days / 2), 1), 5);
      
      // Use real price from database or fallback to calculated
      const minPrice = pkg.min_price ? parseInt(pkg.min_price) : null;
      const salePrice = pkg.sale_price && pkg.sale_price !== '' ? parseInt(pkg.sale_price) : null;
      
      // Determine actual price and savings
      let actualPrice, savings;
      if (minPrice) {
        actualPrice = minPrice;
        savings = salePrice && salePrice < minPrice ? minPrice - salePrice : Math.floor(minPrice * 0.1);
      } else {
        // Fallback to calculated price if no price in database
        actualPrice = days * 300 + (pkg.id % 2000) + 2000;
        savings = Math.floor(actualPrice * 0.1);
      }
      
      return {
        id: pkg.id,
        slug: slug,
        title: pkg.title,
        duration: `${days} Days`,
        cities: `${cities} Cities`,
        image: pkg.image || `https://images.pexels.com/photos/${2363 + (pkg.id % 1000)}/pexels-photo-${2363 + (pkg.id % 1000)}.jpeg`,
        days: days,
        isHalalFriendly: true,
        seatsLeft: (pkg.id % 15) + 5,
        description: pkg.description ? pkg.description.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : `Embark on an adventure with our ${pkg.title} package`,
        price: actualPrice,
        savings: savings,
        isTopSelling: (pkg.id % 3) === 0,
        currency: pkg.package_currency || 'SGD',
        hasPriceData: !!minPrice
      };
    });
    
    reply.send({
      success: true,
      count: formattedPackages.length,
      packages: formattedPackages
    });
  });
};

// Get South East Europe packages from database
exports.getSouthEastEuropePackages = (req, reply) => {
  const { limit = 12 } = req.query;
  const limitValue = parseInt(limit) || 12;
  
  // Query database for South East Europe packages with real prices from tbl_price
  const query = `
    SELECT 
      p.id,
      p.p_name as title,
      p.p_slug as slug,
      p.day_night,
      p.feature_img as image,
      p.p_content as description,
      p.package_currency,
      p.country_id,
      p.insert_date,
      p.status,
      p.is_publish,
      p.display_type,
      MIN(pr.price_t2) as min_price,
      MAX(pr.price_t2) as max_price,
      MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p
    LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (
      p.display_type LIKE '%south_east_europe%' 
      OR p.display_type LIKE '%south-east-europe%'
      OR p.display_type LIKE '%southeast_europe%'
      OR p.display_type LIKE '%southeast-europe%'
      OR p.p_name LIKE '%Greece%'
      OR p.p_name LIKE '%Athens%'
      OR p.p_name LIKE '%Bulgaria%'
      OR p.p_name LIKE '%Sofia%'
      OR p.p_name LIKE '%Romania%'
      OR p.p_name LIKE '%Bucharest%'
      OR p.p_name LIKE '%Croatia%'
      OR p.p_name LIKE '%Dubrovnik%'
      OR p.p_name LIKE '%Serbia%'
      OR p.p_name LIKE '%Belgrade%'
      OR p.p_name LIKE '%Albania%'
      OR p.p_name LIKE '%Tirana%'
      OR p.p_name LIKE '%Montenegro%'
      OR p.p_name LIKE '%Bosnia%'
      OR p.p_name LIKE '%Macedonia%'
      OR p.p_name LIKE '%Slovenia%'
    )
    AND p.status = 1 
    AND p.is_publish = 1
    GROUP BY p.id
    ORDER BY p.insert_date DESC
    LIMIT ${limitValue}
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching South East Europe packages:', err);
      return reply.status(500).send({ 
        error: 'Failed to fetch South East Europe packages', 
        details: err.message 
      });
    }
    
    // Format the results for frontend consumption
    const formattedPackages = results.map(pkg => {
      // Parse day_night to extract days
      const dayMatch = pkg.day_night ? pkg.day_night.match(/(\d+)D/) : null;
      const days = dayMatch ? parseInt(dayMatch[1]) : 7;
      
      // Generate slug if not available
      const slug = pkg.slug || pkg.title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      // Estimate cities based on days (simple logic)
      const cities = Math.min(Math.max(Math.floor(days / 2), 1), 5);
      
      // Use real price from database or fallback to calculated
      const minPrice = pkg.min_price ? parseInt(pkg.min_price) : null;
      const salePrice = pkg.sale_price && pkg.sale_price !== '' ? parseInt(pkg.sale_price) : null;
      
      // Determine actual price and savings
      let actualPrice, savings;
      if (minPrice) {
        actualPrice = minPrice;
        savings = salePrice && salePrice < minPrice ? minPrice - salePrice : Math.floor(minPrice * 0.1);
      } else {
        // Fallback to calculated price if no price in database
        actualPrice = days * 300 + (pkg.id % 2000) + 2000;
        savings = Math.floor(actualPrice * 0.1);
      }
      
      return {
        id: pkg.id,
        slug: slug,
        title: pkg.title,
        duration: `${days} Days`,
        cities: `${cities} Cities`,
        image: pkg.image || `https://images.pexels.com/photos/${2166559 + (pkg.id % 1000)}/pexels-photo-${2166559 + (pkg.id % 1000)}.jpeg`,
        days: days,
        isHalalFriendly: true,
        seatsLeft: (pkg.id % 15) + 5,
        description: pkg.description ? pkg.description.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : `Embark on an adventure with our ${pkg.title} package`,
        price: actualPrice,
        savings: savings,
        isTopSelling: (pkg.id % 3) === 0,
        currency: pkg.package_currency || 'SGD',
        hasPriceData: !!minPrice
      };
    });
    
    reply.send({
      success: true,
      count: formattedPackages.length,
      packages: formattedPackages
    });
  });
};

// Get Middle East packages from database
exports.getMiddleEastPackages = (req, reply) => {
  const { limit = 12 } = req.query;
  const limitValue = parseInt(limit) || 12;
  
  // Query database for Middle East packages with real prices from tbl_price
  const query = `
    SELECT 
      p.id,
      p.p_name as title,
      p.p_slug as slug,
      p.day_night,
      p.feature_img as image,
      p.p_content as description,
      p.package_currency,
      p.country_id,
      p.insert_date,
      p.status,
      p.is_publish,
      p.display_type,
      MIN(pr.price_t2) as min_price,
      MAX(pr.price_t2) as max_price,
      MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p
    LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (
      p.display_type LIKE '%middle_east%' 
      OR p.display_type LIKE '%middle-east%'
      OR p.p_name LIKE '%Dubai%'
      OR p.p_name LIKE '%UAE%'
      OR p.p_name LIKE '%Abu Dhabi%'
      OR p.p_name LIKE '%Jordan%'
      OR p.p_name LIKE '%Petra%'
      OR p.p_name LIKE '%Israel%'
      OR p.p_name LIKE '%Jerusalem%'
      OR p.p_name LIKE '%Oman%'
      OR p.p_name LIKE '%Muscat%'
      OR p.p_name LIKE '%Qatar%'
      OR p.p_name LIKE '%Doha%'
      OR p.p_name LIKE '%Bahrain%'
      OR p.p_name LIKE '%Kuwait%'
      OR p.p_name LIKE '%Saudi Arabia%'
      OR p.p_name LIKE '%Riyadh%'
    )
    AND p.status = 1 
    AND p.is_publish = 1
    GROUP BY p.id
    ORDER BY p.insert_date DESC
    LIMIT ${limitValue}
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching Middle East packages:', err);
      return reply.status(500).send({ 
        error: 'Failed to fetch Middle East packages', 
        details: err.message 
      });
    }
    
    // Format the results for frontend consumption
    const formattedPackages = results.map(pkg => {
      // Parse day_night to extract days
      const dayMatch = pkg.day_night ? pkg.day_night.match(/(\d+)D/) : null;
      const days = dayMatch ? parseInt(dayMatch[1]) : 7;
      
      // Generate slug if not available
      const slug = pkg.slug || pkg.title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      // Estimate cities based on days (simple logic)
      const cities = Math.min(Math.max(Math.floor(days / 2), 1), 5);
      
      // Use real price from database or fallback to calculated
      const minPrice = pkg.min_price ? parseInt(pkg.min_price) : null;
      const salePrice = pkg.sale_price && pkg.sale_price !== '' ? parseInt(pkg.sale_price) : null;
      
      // Determine actual price and savings
      let actualPrice, savings;
      if (minPrice) {
        actualPrice = minPrice;
        savings = salePrice && salePrice < minPrice ? minPrice - salePrice : Math.floor(minPrice * 0.1);
      } else {
        // Fallback to calculated price if no price in database
        actualPrice = days * 300 + (pkg.id % 2000) + 2000;
        savings = Math.floor(actualPrice * 0.1);
      }
      
      return {
        id: pkg.id,
        slug: slug,
        title: pkg.title,
        duration: `${days} Days`,
        cities: `${cities} Cities`,
        image: pkg.image || `https://images.pexels.com/photos/${2044434 + (pkg.id % 1000)}/pexels-photo-${2044434 + (pkg.id % 1000)}.jpeg`,
        days: days,
        isHalalFriendly: true,
        seatsLeft: (pkg.id % 15) + 5,
        description: pkg.description ? pkg.description.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : `Embark on an adventure with our ${pkg.title} package`,
        price: actualPrice,
        savings: savings,
        isTopSelling: (pkg.id % 3) === 0,
        currency: pkg.package_currency || 'SGD',
        hasPriceData: !!minPrice
      };
    });
    
    reply.send({
      success: true,
      count: formattedPackages.length,
      packages: formattedPackages
    });
  });
};

// Get package by slug from database
exports.getBySlug = (req, reply) => {
  const { slug } = req.params;
  
  // Clean the incoming slug (remove trailing dashes)
  const cleanSlug = slug.replace(/(^-|-$)/g, '');
  
  // Check if this is actually a category request
  const categories = ['adventure', 'safari', 'cultural', 'beach'];
  if (categories.includes(cleanSlug.toLowerCase())) {
    // Redirect to category endpoint
    req.params.category = cleanSlug;
    return exports.getByCategory(req, reply);
  }
  
  // Query database for packages
  db.query('SELECT * FROM tbl_packages WHERE status = 1 AND is_publish = 1', (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return reply.status(500).send({ error: 'Database error', details: err.message });
    }
    
    // Find package by matching slug in multiple ways
    const package = results.find(pkg => {
      // Check if p_slug exists and matches
      if (pkg.p_slug) {
        const dbSlug = pkg.p_slug.replace(/(^-|-$)/g, '');
        if (dbSlug === cleanSlug) return true;
      }
      
      // Generate slug from p_name and check
      if (pkg.p_name) {
        const generatedSlug = pkg.p_name.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        if (generatedSlug === cleanSlug) return true;
      }
      
      // Check if the package ID matches (fallback)
      if (pkg.id && `package-${pkg.id}` === cleanSlug) return true;
      
      return false;
    });
    
    if (!package) {
      console.log(`Package not found for slug: ${slug} (cleaned: ${cleanSlug})`);
      console.log(`Available packages: ${results.length}`);
      return reply.status(404).send({ 
        error: 'Package not found',
        slug: slug,
        cleanSlug: cleanSlug,
        availablePackages: results.length,
        suggestion: categories.includes(cleanSlug.toLowerCase()) ? 
          `Did you mean to search for category "${cleanSlug}"? Try /packages/category/${cleanSlug}` : null
      });
    }
    
    // Fetch price data from tbl_price
    db.query(
      'SELECT MIN(price_t2) as min_price, MAX(price_t2) as max_price, MIN(price_t2_sale) as sale_price FROM tbl_price WHERE package_id = ?',
      [package.id],
      (priceErr, priceResults) => {
        if (priceErr) {
          console.error('Error fetching price data:', priceErr);
          // Continue without price data
        }
        
        // Helper function to convert empty strings to null and parse numbers
        const parsePrice = (value) => {
          if (!value || value === '' || value === '0') return null;
          const parsed = parseInt(value);
          return isNaN(parsed) ? null : parsed;
        };
        
        // Parse price data
        const minPrice = priceResults && priceResults[0] ? parsePrice(priceResults[0].min_price) : null;
        const maxPrice = priceResults && priceResults[0] ? parsePrice(priceResults[0].max_price) : null;
        const salePrice = priceResults && priceResults[0] ? parsePrice(priceResults[0].sale_price) : null;
        
        // Calculate display price (matching logic from listing endpoints)
        let displayPrice, savings;
        if (minPrice) {
          displayPrice = minPrice;
          savings = salePrice && salePrice < minPrice ? minPrice - salePrice : Math.floor(minPrice * 0.1);
        } else {
          // Fallback: calculate price based on days and package ID
          const dayMatch = package.day_night ? package.day_night.match(/(\d+)D/) : null;
          const days = dayMatch ? parseInt(dayMatch[1]) : 7;
          displayPrice = days * 300 + (package.id % 2000) + 2000;
          savings = Math.floor(displayPrice * 0.1);
        }
        
        // Add the slug and price data to the response
        const packageWithSlug = {
          ...package,
          slug: cleanSlug,
          min_price: minPrice,
          max_price: maxPrice,
          sale_price: salePrice,
          display_price: displayPrice,
          price: displayPrice,
          savings: savings
        };
        
        reply.send(packageWithSlug);
      }
    );
  });
};

// Get Africa packages from database
exports.getAfricaPackages = (req, reply) => {
  const { limit = 12 } = req.query;
  const limitValue = parseInt(limit) || 12;
  
  const query = `
    SELECT 
      p.id, p.p_name as title, p.p_slug as slug, p.day_night, p.feature_img as image,
      p.p_content as description, p.package_currency, p.country_id, p.insert_date,
      p.status, p.is_publish, p.display_type,
      MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p
    LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (
      p.display_type LIKE '%africa%' OR p.p_name LIKE '%Africa%' OR p.p_name LIKE '%Kenya%'
      OR p.p_name LIKE '%Tanzania%' OR p.p_name LIKE '%South Africa%' OR p.p_name LIKE '%Egypt%'
      OR p.p_name LIKE '%Morocco%' OR p.p_name LIKE '%Botswana%' OR p.p_name LIKE '%Madagascar%'
    ) AND p.status = 1 AND p.is_publish = 1
    GROUP BY p.id ORDER BY p.insert_date DESC LIMIT ${limitValue}
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching Africa packages:', err);
      return reply.status(500).send({ error: 'Failed to fetch Africa packages', details: err.message });
    }
    
    const formattedPackages = results.map(pkg => {
      const dayMatch = pkg.day_night ? pkg.day_night.match(/(\d+)D/) : null;
      const days = dayMatch ? parseInt(dayMatch[1]) : 7;
      const slug = pkg.slug || pkg.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const cities = Math.min(Math.max(Math.floor(days / 2), 1), 5);
      const minPrice = pkg.min_price ? parseInt(pkg.min_price) : null;
      const salePrice = pkg.sale_price && pkg.sale_price !== '' ? parseInt(pkg.sale_price) : null;
      
      let actualPrice, savings;
      if (minPrice) {
        actualPrice = minPrice;
        savings = salePrice && salePrice < minPrice ? minPrice - salePrice : Math.floor(minPrice * 0.1);
      } else {
        actualPrice = days * 300 + (pkg.id % 2000) + 2000;
        savings = Math.floor(actualPrice * 0.1);
      }
      
      return {
        id: pkg.id, slug, title: pkg.title, duration: `${days} Days`, cities: `${cities} Cities`,
        image: pkg.image || `https://images.pexels.com/photos/${1670732 + (pkg.id % 1000)}/pexels-photo-${1670732 + (pkg.id % 1000)}.jpeg`,
        days, isHalalFriendly: true, seatsLeft: (pkg.id % 15) + 5,
        description: pkg.description ? pkg.description.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : `Discover the beauty of Africa with our ${pkg.title} package`,
        price: actualPrice, savings, isTopSelling: (pkg.id % 3) === 0,
        currency: pkg.package_currency || 'SGD', hasPriceData: !!minPrice
      };
    });
    
    reply.send({ success: true, count: formattedPackages.length, packages: formattedPackages });
  });
};

// Get Caribbean packages from database
exports.getCaribbeanPackages = (req, reply) => {
  const { limit = 12 } = req.query;
  const limitValue = parseInt(limit) || 12;
  
  const query = `
    SELECT p.id, p.p_name as title, p.p_slug as slug, p.day_night, p.feature_img as image,
      p.p_content as description, p.package_currency, p.country_id, p.insert_date,
      p.status, p.is_publish, p.display_type,
      MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.display_type LIKE '%caribbean%' OR p.p_name LIKE '%Caribbean%' OR p.p_name LIKE '%Jamaica%'
      OR p.p_name LIKE '%Bahamas%' OR p.p_name LIKE '%Barbados%' OR p.p_name LIKE '%Cuba%')
    AND p.status = 1 AND p.is_publish = 1
    GROUP BY p.id ORDER BY p.insert_date DESC LIMIT ${limitValue}
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching Caribbean packages:', err);
      return reply.status(500).send({ error: 'Failed to fetch Caribbean packages', details: err.message });
    }
    
    const formattedPackages = results.map(pkg => {
      const dayMatch = pkg.day_night ? pkg.day_night.match(/(\d+)D/) : null;
      const days = dayMatch ? parseInt(dayMatch[1]) : 7;
      const slug = pkg.slug || pkg.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const cities = Math.min(Math.max(Math.floor(days / 2), 1), 5);
      const minPrice = pkg.min_price ? parseInt(pkg.min_price) : null;
      const salePrice = pkg.sale_price && pkg.sale_price !== '' ? parseInt(pkg.sale_price) : null;
      
      let actualPrice, savings;
      if (minPrice) {
        actualPrice = minPrice;
        savings = salePrice && salePrice < minPrice ? minPrice - salePrice : Math.floor(minPrice * 0.1);
      } else {
        actualPrice = days * 350 + (pkg.id % 2500) + 2800;
        savings = Math.floor(actualPrice * 0.12);
      }
      
      return {
        id: pkg.id, slug, title: pkg.title, duration: `${days} Days`, cities: `${cities} Cities`,
        image: pkg.image || `https://images.pexels.com/photos/${1450353 + (pkg.id % 1000)}/pexels-photo-${1450353 + (pkg.id % 1000)}.jpeg`,
        days, isHalalFriendly: true, seatsLeft: (pkg.id % 15) + 5,
        description: pkg.description ? pkg.description.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : `Experience the tropical paradise of the Caribbean with our ${pkg.title} package`,
        price: actualPrice, savings, isTopSelling: (pkg.id % 3) === 0,
        currency: pkg.package_currency || 'SGD', hasPriceData: !!minPrice
      };
    });
    
    reply.send({ success: true, count: formattedPackages.length, packages: formattedPackages });
  });
};

// Get South America packages from database
exports.getSouthAmericaPackages = (req, reply) => {
  const { limit = 12 } = req.query;
  const limitValue = parseInt(limit) || 12;
  
  const query = `
    SELECT p.id, p.p_name as title, p.p_slug as slug, p.day_night, p.feature_img as image,
      p.p_content as description, p.package_currency, p.country_id, p.insert_date,
      p.status, p.is_publish, p.display_type,
      MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.display_type LIKE '%south_america%' OR p.display_type LIKE '%south-america%'
      OR p.p_name LIKE '%South America%' OR p.p_name LIKE '%Brazil%' OR p.p_name LIKE '%Argentina%'
      OR p.p_name LIKE '%Peru%' OR p.p_name LIKE '%Chile%' OR p.p_name LIKE '%Machu Picchu%')
    AND p.status = 1 AND p.is_publish = 1
    GROUP BY p.id ORDER BY p.insert_date DESC LIMIT ${limitValue}
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching South America packages:', err);
      return reply.status(500).send({ error: 'Failed to fetch South America packages', details: err.message });
    }
    
    const formattedPackages = results.map(pkg => {
      const dayMatch = pkg.day_night ? pkg.day_night.match(/(\d+)D/) : null;
      const days = dayMatch ? parseInt(dayMatch[1]) : 7;
      const slug = pkg.slug || pkg.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const cities = Math.min(Math.max(Math.floor(days / 2), 1), 5);
      const minPrice = pkg.min_price ? parseInt(pkg.min_price) : null;
      const salePrice = pkg.sale_price && pkg.sale_price !== '' ? parseInt(pkg.sale_price) : null;
      
      let actualPrice, savings;
      if (minPrice) {
        actualPrice = minPrice;
        savings = salePrice && salePrice < minPrice ? minPrice - salePrice : Math.floor(minPrice * 0.1);
      } else {
        actualPrice = days * 380 + (pkg.id % 2800) + 3200;
        savings = Math.floor(actualPrice * 0.12);
      }
      
      return {
        id: pkg.id, slug, title: pkg.title, duration: `${days} Days`, cities: `${cities} Cities`,
        image: pkg.image || `https://images.pexels.com/photos/${1287460 + (pkg.id % 1000)}/pexels-photo-${1287460 + (pkg.id % 1000)}.jpeg`,
        days, isHalalFriendly: true, seatsLeft: (pkg.id % 15) + 5,
        description: pkg.description ? pkg.description.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : `Discover the wonders of South America with our ${pkg.title} package`,
        price: actualPrice, savings, isTopSelling: (pkg.id % 3) === 0,
        currency: pkg.package_currency || 'SGD', hasPriceData: !!minPrice
      };
    });
    
    reply.send({ success: true, count: formattedPackages.length, packages: formattedPackages });
  });
};

// Get Group Tours packages from database
exports.getGroupTours = (req, reply) => {
  const { limit = 12 } = req.query;
  const limitValue = parseInt(limit) || 12;
  
  const query = `
    SELECT p.id, p.p_name as title, p.p_slug as slug, p.day_night, p.feature_img as image,
      p.p_content as description, p.package_currency, p.country_id, p.insert_date,
      p.status, p.is_publish, p.display_type,
      MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE p.status = 1 AND p.is_publish = 1
    GROUP BY p.id
    ORDER BY CASE WHEN p.display_type LIKE '%group_tour%' OR p.display_type LIKE '%group-tour%' 
      OR p.p_name LIKE '%Group Tour%' OR p.p_name LIKE '%Group Travel%' THEN 1 ELSE 2 END,
      p.insert_date DESC LIMIT ${limitValue}
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching Group Tours packages:', err);
      return reply.status(500).send({ error: 'Failed to fetch Group Tours packages', details: err.message });
    }
    
    const formattedPackages = results.map(pkg => {
      const dayMatch = pkg.day_night ? pkg.day_night.match(/(\d+)D/) : null;
      const days = dayMatch ? parseInt(dayMatch[1]) : 7;
      const slug = pkg.slug || pkg.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const cities = Math.min(Math.max(Math.floor(days / 2), 1), 5);
      const minPrice = pkg.min_price ? parseInt(pkg.min_price) : null;
      const salePrice = pkg.sale_price && pkg.sale_price !== '' ? parseInt(pkg.sale_price) : null;
      
      let actualPrice, savings;
      if (minPrice) {
        actualPrice = minPrice;
        savings = salePrice && salePrice < minPrice ? minPrice - salePrice : Math.floor(minPrice * 0.1);
      } else {
        actualPrice = days * 350 + (pkg.id % 2000) + 2500;
        savings = Math.floor(actualPrice * 0.12);
      }
      
      return {
        id: pkg.id, slug, title: pkg.title, duration: `${days} Days`, cities: `${cities} Cities`,
        image: pkg.image || `https://images.pexels.com/photos/${3408354 + (pkg.id % 1000)}/pexels-photo-${3408354 + (pkg.id % 1000)}.jpeg`,
        days, isHalalFriendly: true, seatsLeft: (pkg.id % 15) + 5,
        description: pkg.description ? pkg.description.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : `Join our expertly guided group tour to ${pkg.title}`,
        price: actualPrice, savings, isTopSelling: (pkg.id % 3) === 0,
        currency: pkg.package_currency || 'SGD', hasPriceData: !!minPrice
      };
    });
    
    reply.send({ success: true, count: formattedPackages.length, packages: formattedPackages });
  });
};

// Get Multi-City packages from database
exports.getMultiCityPackages = (req, reply) => {
  const { limit = 12 } = req.query;
  const limitValue = parseInt(limit) || 12;
  
  const query = `
    SELECT p.id, p.p_name as title, p.p_slug as slug, p.day_night, p.feature_img as image,
      p.p_content as description, p.package_currency, p.country_id, p.insert_date,
      p.status, p.is_publish, p.display_type,
      MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.display_type LIKE '%multi_city%' OR p.display_type LIKE '%multi-city%'
      OR p.display_type LIKE '%multicity%' OR p.p_name LIKE '%Multi City%'
      OR p.p_name LIKE '%Multi-City%' OR p.p_name LIKE '%Multiple Cities%')
    AND p.status = 1 AND p.is_publish = 1
    GROUP BY p.id ORDER BY p.insert_date DESC LIMIT ${limitValue}
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching Multi-City packages:', err);
      return reply.status(500).send({ error: 'Failed to fetch Multi-City packages', details: err.message });
    }
    
    const formattedPackages = results.map(pkg => {
      const dayMatch = pkg.day_night ? pkg.day_night.match(/(\d+)D/) : null;
      const days = dayMatch ? parseInt(dayMatch[1]) : 7;
      const slug = pkg.slug || pkg.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const cities = Math.min(Math.max(Math.floor(days / 2), 2), 6);
      const minPrice = pkg.min_price ? parseInt(pkg.min_price) : null;
      const salePrice = pkg.sale_price && pkg.sale_price !== '' ? parseInt(pkg.sale_price) : null;
      
      let actualPrice, savings;
      if (minPrice) {
        actualPrice = minPrice;
        savings = salePrice && salePrice < minPrice ? minPrice - salePrice : Math.floor(minPrice * 0.1);
      } else {
        actualPrice = days * 300 + (pkg.id % 2000) + 2000;
        savings = Math.floor(actualPrice * 0.1);
      }
      
      return {
        id: pkg.id, slug, title: pkg.title, duration: `${days} Days`, cities: `${cities} Cities`,
        image: pkg.image || `https://images.pexels.com/photos/${1878293 + (pkg.id % 1000)}/pexels-photo-${1878293 + (pkg.id % 1000)}.jpeg`,
        days, isHalalFriendly: true, seatsLeft: (pkg.id % 15) + 5,
        description: pkg.description ? pkg.description.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : `Explore multiple cities with our ${pkg.title} package`,
        price: actualPrice, savings, isTopSelling: (pkg.id % 3) === 0,
        currency: pkg.package_currency || 'SGD', hasPriceData: !!minPrice
      };
    });
    
    reply.send({ success: true, count: formattedPackages.length, packages: formattedPackages });
  });
};

// Get North America packages from database
exports.getNorthAmericaPackages = (req, reply) => {
  const { limit = 12 } = req.query;
  const limitValue = parseInt(limit) || 12;
  
  const query = `
    SELECT p.id, p.p_name as title, p.p_slug as slug, p.day_night, p.feature_img as image,
      p.p_content as description, p.package_currency, p.country_id, p.insert_date,
      p.status, p.is_publish, p.display_type,
      MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.display_type LIKE '%north_america%' OR p.display_type LIKE '%north-america%'
      OR p.p_name LIKE '%North America%' OR p.p_name LIKE '%USA%' OR p.p_name LIKE '%United States%'
      OR p.p_name LIKE '%New York%' OR p.p_name LIKE '%Los Angeles%' OR p.p_name LIKE '%Canada%'
      OR p.p_name LIKE '%Toronto%' OR p.p_name LIKE '%Vancouver%' OR p.p_name LIKE '%Mexico%')
    AND p.status = 1 AND p.is_publish = 1
    GROUP BY p.id ORDER BY p.insert_date DESC LIMIT ${limitValue}
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching North America packages:', err);
      return reply.status(500).send({ error: 'Failed to fetch North America packages', details: err.message });
    }
    
    const formattedPackages = results.map(pkg => {
      const dayMatch = pkg.day_night ? pkg.day_night.match(/(\d+)D/) : null;
      const days = dayMatch ? parseInt(dayMatch[1]) : 7;
      const slug = pkg.slug || pkg.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const cities = Math.min(Math.max(Math.floor(days / 2), 1), 5);
      const minPrice = pkg.min_price ? parseInt(pkg.min_price) : null;
      const salePrice = pkg.sale_price && pkg.sale_price !== '' ? parseInt(pkg.sale_price) : null;
      
      let actualPrice, savings;
      if (minPrice) {
        actualPrice = minPrice;
        savings = salePrice && salePrice < minPrice ? minPrice - salePrice : Math.floor(minPrice * 0.1);
      } else {
        actualPrice = days * 300 + (pkg.id % 2000) + 2000;
        savings = Math.floor(actualPrice * 0.1);
      }
      
      return {
        id: pkg.id, slug, title: pkg.title, duration: `${days} Days`, cities: `${cities} Cities`,
        image: pkg.image || `https://images.pexels.com/photos/${1878293 + (pkg.id % 1000)}/pexels-photo-${1878293 + (pkg.id % 1000)}.jpeg`,
        days, isHalalFriendly: true, seatsLeft: (pkg.id % 15) + 5,
        description: pkg.description ? pkg.description.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : `Discover the diverse landscapes of North America with our ${pkg.title} package`,
        price: actualPrice, savings, isTopSelling: (pkg.id % 3) === 0,
        currency: pkg.package_currency || 'SGD', hasPriceData: !!minPrice
      };
    });
    
    reply.send({ success: true, count: formattedPackages.length, packages: formattedPackages });
  });
};

// Get Asia packages from database
exports.getAsiaPackages = (req, reply) => {
  const { limit = 12 } = req.query;
  const limitValue = parseInt(limit) || 12;
  
  const query = `
    SELECT p.id, p.p_name as title, p.p_slug as slug, p.day_night, p.feature_img as image,
      p.p_content as description, p.package_currency, p.country_id, p.insert_date,
      p.status, p.is_publish, p.display_type,
      MIN(pr.price_t2) as min_price, MAX(pr.price_t2) as max_price, MIN(pr.price_t2_sale) as sale_price
    FROM tbl_packages p LEFT JOIN tbl_price pr ON p.id = pr.package_id
    WHERE (p.display_type LIKE '%asia%' OR p.p_name LIKE '%Asia%' OR p.p_name LIKE '%Japan%'
      OR p.p_name LIKE '%Tokyo%' OR p.p_name LIKE '%China%' OR p.p_name LIKE '%Thailand%'
      OR p.p_name LIKE '%Vietnam%' OR p.p_name LIKE '%Singapore%' OR p.p_name LIKE '%Malaysia%'
      OR p.p_name LIKE '%Indonesia%' OR p.p_name LIKE '%South Korea%' OR p.p_name LIKE '%India%')
    AND p.status = 1 AND p.is_publish = 1
    GROUP BY p.id ORDER BY p.insert_date DESC LIMIT ${limitValue}
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching Asia packages:', err);
      return reply.status(500).send({ error: 'Failed to fetch Asia packages', details: err.message });
    }
    
    const formattedPackages = results.map(pkg => {
      const dayMatch = pkg.day_night ? pkg.day_night.match(/(\d+)D/) : null;
      const days = dayMatch ? parseInt(dayMatch[1]) : 7;
      const slug = pkg.slug || pkg.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const cities = Math.min(Math.max(Math.floor(days / 2), 1), 5);
      const minPrice = pkg.min_price ? parseInt(pkg.min_price) : null;
      const salePrice = pkg.sale_price && pkg.sale_price !== '' ? parseInt(pkg.sale_price) : null;
      
      let actualPrice, savings;
      if (minPrice) {
        actualPrice = minPrice;
        savings = salePrice && salePrice < minPrice ? minPrice - salePrice : Math.floor(minPrice * 0.1);
      } else {
        actualPrice = days * 300 + (pkg.id % 2000) + 2000;
        savings = Math.floor(actualPrice * 0.1);
      }
      
      return {
        id: pkg.id, slug, title: pkg.title, duration: `${days} Days`, cities: `${cities} Cities`,
        image: pkg.image || `https://images.pexels.com/photos/${1878293 + (pkg.id % 1000)}/pexels-photo-${1878293 + (pkg.id % 1000)}.jpeg`,
        days, isHalalFriendly: true, seatsLeft: (pkg.id % 15) + 5,
        description: pkg.description ? pkg.description.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : `Experience the rich heritage of Asia with our ${pkg.title} package`,
        price: actualPrice, savings, isTopSelling: (pkg.id % 3) === 0,
        currency: pkg.package_currency || 'SGD', hasPriceData: !!minPrice
      };
    });
    
    reply.send({ success: true, count: formattedPackages.length, packages: formattedPackages });
  });
};

// Get grouped destinations for navigation dropdown
exports.getGroupedDestinations = (req, reply) => {
  // Query to get all destinations from tbl_destinations table
  const destinationsQuery = `
    SELECT *
    FROM tbl_destinations
    ORDER BY d_name
  `;
  
  db.query(destinationsQuery, (err, destinations) => {
    if (err) {
      console.error('Error fetching destinations:', err);
      return reply.status(500).send({ 
        error: 'Failed to fetch destinations', 
        details: err.message 
      });
    }
    
    // Filter to get only parent destinations (p_destination = 0)
    const parentDestinations = destinations.filter(d => d.p_destination === 0);
    
    // For each destination, get child destinations (countries) and count packages
    const destinationPromises = parentDestinations.map(destination => {
      return new Promise((resolve) => {
        // Get child destinations (countries) for this region
        const childQuery = `
          SELECT *
          FROM tbl_destinations
          WHERE p_destination = ?
          ORDER BY d_name
        `;
        
        db.query(childQuery, [destination.id], (childErr, children) => {
          if (childErr) {
            console.error('Error fetching child destinations:', childErr);
            resolve({ region: destination.d_name, countries: [] });
            return;
          }
          
          // Debug logging for Multi City and Group Tours
          if (destination.d_name === 'Multi City' || destination.d_name === 'Group Tours') {
            console.log(`\n${destination.d_name} has ${children.length} children:`, children.map(c => c.d_name));
          }
          
          // If no children, this region has no sub-destinations
          if (children.length === 0) {
            resolve({ region: destination.d_name, countries: [] });
            return;
          }
          
          const countryPromises = children.map(country => {
            return new Promise((resolveCountry) => {
              // Count packages for this destination
              const packageCountQuery = `
                SELECT COUNT(*) as count
                FROM tbl_packages
                WHERE (desti_list LIKE ? OR p_name LIKE ?)
                  AND status = 1 
                  AND is_publish = 1
              `;
              
              const searchPattern = `%${country.d_name}%`;
              
              db.query(packageCountQuery, [searchPattern, searchPattern], (countErr, countResult) => {
                if (countErr) {
                  console.error('Error counting packages:', countErr);
                  // Still include the country even if there's an error
                  resolveCountry({
                    id: country.id,
                    name: country.d_name,
                    slug: country.d_slug || country.d_name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                    packageCount: 0
                  });
                  return;
                }
                
                const packageCount = countResult[0].count;
                
                // Include ALL countries regardless of package count
                resolveCountry({
                  id: country.id,
                  name: country.d_name,
                  slug: country.d_slug || country.d_name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                  packageCount: packageCount
                });
              });
            });
          });
          
          Promise.all(countryPromises).then(countries => {
            // Include all countries (no filtering)
            resolve({ 
              region: destination.d_name, 
              countries: countries 
            });
          });
        });
      });
    });
    
    Promise.all(destinationPromises).then(results => {
      // Build the grouped object
      const grouped = {};
      
      results.forEach(result => {
        // Include ALL regions, even those with no countries
        grouped[result.region] = result.countries;
      });
      
      console.log('Grouped destinations:', JSON.stringify(grouped, null, 2));
      console.log('Number of regions:', Object.keys(grouped).length);
      
      reply.send({
        success: true,
        data: grouped
      });
    });
  });
};

// Get search suggestions (packages and destinations)
exports.getSearchSuggestions = (request, reply) => {
  const { q } = request.query;
  
  if (!q || q.trim().length < 2) {
    return reply.send({
      success: true,
      suggestions: {
        packages: [],
        destinations: []
      }
    });
  }

  const searchTerm = q.trim().toLowerCase();
  
  // Query to get matching packages
  const packagesQuery = `
    SELECT 
      p.id,
      p.p_name as title,
      p.p_slug as slug,
      p.desti_list as country,
      'package' as type
    FROM tbl_packages p
    WHERE p.status = 1 
      AND p.is_publish = 1
      AND (LOWER(p.p_name) LIKE ? OR LOWER(p.desti_list) LIKE ?)
    ORDER BY 
      CASE 
        WHEN LOWER(p.p_name) LIKE ? THEN 1
        WHEN LOWER(p.desti_list) LIKE ? THEN 2
        ELSE 3
      END,
      p.p_name
    LIMIT 5
  `;
  
  // Query to get matching destinations (countries)
  const destinationsQuery = `
    SELECT DISTINCT
      p.desti_list as title,
      p.desti_list as country,
      'destination' as type,
      COUNT(*) as package_count
    FROM tbl_packages p
    WHERE p.status = 1 
      AND p.is_publish = 1
      AND LOWER(p.desti_list) LIKE ?
    GROUP BY p.desti_list
    ORDER BY package_count DESC
    LIMIT 5
  `;
  
  const searchPattern = `%${searchTerm}%`;
  const startPattern = `${searchTerm}%`;
  
  // Execute both queries
  db.query(packagesQuery, [searchPattern, searchPattern, startPattern, startPattern], (err, packages) => {
    if (err) {
      console.error('Error fetching package suggestions:', err);
      return reply.code(500).send({
        success: false,
        error: 'Failed to fetch package suggestions'
      });
    }
    
    db.query(destinationsQuery, [searchPattern], (err, destinations) => {
      if (err) {
        console.error('Error fetching destination suggestions:', err);
        return reply.code(500).send({
          success: false,
          error: 'Failed to fetch destination suggestions'
        });
      }
      
      // Format the results
      const packageSuggestions = packages.map(pkg => ({
        id: pkg.id,
        title: pkg.title,
        type: 'package',
        slug: pkg.slug || `package-${pkg.id}`,
        country: pkg.country
      }));
      
      const destinationSuggestions = destinations.map(dest => ({
        id: dest.title,
        title: dest.title,
        type: 'destination',
        slug: dest.title.toLowerCase().replace(/\s+/g, '-'),
        packageCount: dest.package_count
      }));
      
      return reply.send({
        success: true,
        suggestions: {
          packages: packageSuggestions,
          destinations: destinationSuggestions
        }
      });
    });
  });
};
