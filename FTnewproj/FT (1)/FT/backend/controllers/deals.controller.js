// controllers/deals.controller.js
const db = require('../db');

// Enhanced deals data with better variety and pricing
const dealsData = [
  {
    id: 1,
    title: "Taiwan Odyssey",
    subtitle: "Explore the Heart of Asia",
    destination: "Taiwan",
    category: "Adventure",
    price: 4225,
    originalPrice: 4725,
    days: 7,
    cities: 3,
    isHalalFriendly: true,
    seatsLeft: 10,
    description: "Taiwan's vibrant west coast, where ancient traditions meet modern wonders.",
    image: "https://images.pexels.com/photos/5087165/pexels-photo-5087165.jpeg",
    savings: 500,
    discountPercentage: 11,
    isTopSelling: true,
    isFeatured: true,
    itinerary: [
      {
        day: 1,
        title: "Arrival in Taipei",
        subtitle: "Welcome to Taiwan's Vibrant Capital",
        description: "Begin your Taiwan adventure in the bustling metropolis of Taipei. Explore the iconic night markets, sample delicious street food, and witness the perfect blend of traditional and modern culture.",
        image: "https://images.pexels.com/photos/2408666/pexels-photo-2408666.jpeg",
        highlights: ["Night Market Tour", "Street Food Tasting", "City Orientation"]
      },
      {
        day: 2,
        title: "Taipei City Exploration",
        subtitle: "Modern Marvels & Ancient Traditions",
        description: "Discover Taipei's most iconic landmarks including Taipei 101, traditional temples, and bustling districts. Experience the harmony between cutting-edge technology and ancient wisdom.",
        image: "https://images.pexels.com/photos/3408354/pexels-photo-3408354.jpeg",
        highlights: ["Taipei 101 Observatory", "Longshan Temple", "Ximending District"]
      },
      {
        day: 3,
        title: "Jiufen & Shifen Adventure",
        subtitle: "Mountain Towns & Sky Lanterns",
        description: "Journey to the enchanting mountain town of Jiufen with its narrow alleyways and teahouses. Release sky lanterns in Shifen and make wishes under the Taiwan sky.",
        image: "https://images.pexels.com/photos/2161449/pexels-photo-2161449.jpeg",
        highlights: ["Jiufen Old Street", "Sky Lantern Release", "Mountain Views"]
      },
      {
        day: 4,
        title: "Taroko Gorge National Park",
        subtitle: "Natural Wonder & Marble Cliffs",
        description: "Explore Taiwan's most spectacular natural wonder with its dramatic marble cliffs, turquoise rivers, and scenic hiking trails through one of Asia's most beautiful gorges.",
        image: "https://images.pexels.com/photos/2166559/pexels-photo-2166559.jpeg",
        highlights: ["Marble Cliffs", "Eternal Spring Shrine", "Swallow Grotto"]
      },
      {
        day: 5,
        title: "Sun Moon Lake & Departure",
        subtitle: "Serene Beauty & Farewell",
        description: "Visit Taiwan's most beautiful alpine lake surrounded by lush mountains. Take a peaceful boat ride and enjoy the serene atmosphere before your departure with unforgettable memories.",
        image: "https://images.pexels.com/photos/5087165/pexels-photo-5087165.jpeg",
        highlights: ["Lake Cruise", "Aboriginal Culture", "Mountain Scenery"]
      }
    ]
  },
  {
    id: 2,
    title: "Sri Lanka Discovery",
    subtitle: "Tropical Paradise Adventure",
    destination: "Sri Lanka",
    category: "Cultural",
    price: 3899,
    originalPrice: 4499,
    days: 8,
    cities: 4,
    isHalalFriendly: true,
    seatsLeft: 12,
    description: "Explore ancient temples and pristine beaches in tropical paradise.",
    image: "https://images.pexels.com/photos/2161449/pexels-photo-2161449.jpeg",
    savings: 600,
    discountPercentage: 13,
    isTopSelling: true,
    isFeatured: true,
    itinerary: [
      {
        day: 1,
        title: "Arrival in Colombo",
        subtitle: "Welcome to the Pearl of the Indian Ocean",
        description: "Arrive in Colombo and transfer to your hotel. Evening city tour exploring the colonial architecture, bustling markets, and vibrant street life of Sri Lanka's commercial capital.",
        image: "https://images.pexels.com/photos/2161449/pexels-photo-2161449.jpeg",
        highlights: ["Colombo City Tour", "Colonial Architecture", "Local Markets"]
      },
      {
        day: 2,
        title: "Kandy Cultural Triangle",
        subtitle: "Ancient Capital & Sacred Temple",
        description: "Journey to Kandy, the last royal capital of Sri Lanka. Visit the Temple of the Sacred Tooth Relic, explore the Royal Botanical Gardens, and enjoy a traditional cultural show.",
        image: "https://images.pexels.com/photos/3408354/pexels-photo-3408354.jpeg",
        highlights: ["Temple of Tooth Relic", "Botanical Gardens", "Cultural Show"]
      },
      {
        day: 3,
        title: "Sigiriya Rock Fortress",
        subtitle: "Ancient Wonder of the World",
        description: "Climb the magnificent Sigiriya Rock Fortress, a UNESCO World Heritage site. Marvel at the ancient frescoes, mirror wall, and breathtaking views from the summit.",
        image: "https://images.pexels.com/photos/2166559/pexels-photo-2166559.jpeg",
        highlights: ["Sigiriya Rock Climb", "Ancient Frescoes", "Panoramic Views"]
      },
      {
        day: 4,
        title: "Safari Adventure",
        subtitle: "Wildlife & Nature Experience",
        description: "Early morning safari in Minneriya or Kaudulla National Park. Spot elephants, leopards, and diverse bird species in their natural habitat.",
        image: "https://images.pexels.com/photos/1287460/pexels-photo-1287460.jpeg",
        highlights: ["Elephant Safari", "Wildlife Photography", "Nature Conservation"]
      },
      {
        day: 5,
        title: "Nuwara Eliya Hill Country",
        subtitle: "Little England of Sri Lanka",
        description: "Travel to the cool hill country of Nuwara Eliya. Visit tea plantations, learn about tea processing, and enjoy the colonial charm of this mountain retreat.",
        image: "https://images.pexels.com/photos/5087165/pexels-photo-5087165.jpeg",
        highlights: ["Tea Plantation Tour", "Colonial Architecture", "Mountain Views"]
      },
      {
        day: 6,
        title: "Galle Dutch Fort",
        subtitle: "Colonial Heritage & Coastal Beauty",
        description: "Explore the historic Galle Fort, a UNESCO World Heritage site. Walk along the ramparts, visit museums, and enjoy the blend of Dutch colonial and Sri Lankan architecture.",
        image: "https://images.pexels.com/photos/2408666/pexels-photo-2408666.jpeg",
        highlights: ["Dutch Fort", "Colonial Museums", "Coastal Views"]
      },
      {
        day: 7,
        title: "Beach Relaxation",
        subtitle: "Tropical Paradise & Leisure",
        description: "Relax on the pristine beaches of the south coast. Enjoy water sports, beachside dining, and the tropical paradise atmosphere of Sri Lanka's coastline.",
        image: "https://images.pexels.com/photos/1282315/pexels-photo-1282315.jpeg",
        highlights: ["Beach Relaxation", "Water Sports", "Tropical Dining"]
      },
      {
        day: 8,
        title: "Departure",
        subtitle: "Farewell to Paradise",
        description: "Final shopping in Colombo for souvenirs and local crafts before departure. Transfer to airport with unforgettable memories of Sri Lanka's cultural and natural treasures.",
        image: "https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg",
        highlights: ["Souvenir Shopping", "Airport Transfer", "Departure"]
      }
    ]
  },
  {
    id: 3,
    title: "Japan Explorer",
    subtitle: "Traditional Meets Modern",
    destination: "Japan",
    category: "Cultural",
    price: 5999,
    originalPrice: 6799,
    days: 10,
    cities: 4,
    isHalalFriendly: true,
    seatsLeft: 8,
    description: "Experience the perfect blend of traditional culture and modern innovation.",
    image: "https://images.pexels.com/photos/3408354/pexels-photo-3408354.jpeg",
    savings: 800,
    discountPercentage: 12,
    isTopSelling: true,
    isFeatured: false
  },
  {
    id: 4,
    title: "Vietnam Discovery",
    subtitle: "Rich Cultural Heritage",
    destination: "Vietnam",
    category: "Cultural",
    price: 3599,
    originalPrice: 3999,
    days: 8,
    cities: 3,
    isHalalFriendly: true,
    seatsLeft: 12,
    description: "Journey through stunning landscapes and rich cultural heritage.",
    image: "https://images.pexels.com/photos/2166559/pexels-photo-2166559.jpeg",
    savings: 400,
    discountPercentage: 10,
    isTopSelling: false,
    isFeatured: true
  },
  {
    id: 5,
    title: "Thailand Adventure",
    subtitle: "Tropical Paradise",
    destination: "Thailand",
    category: "Beach",
    price: 3899,
    originalPrice: 4499,
    days: 9,
    cities: 4,
    isHalalFriendly: true,
    seatsLeft: 6,
    description: "Explore tropical paradise and ancient temples.",
    image: "https://images.pexels.com/photos/1282315/pexels-photo-1282315.jpeg",
    savings: 600,
    discountPercentage: 13,
    isTopSelling: true,
    isFeatured: true
  },
  {
    id: 6,
    title: "Bali Bliss",
    subtitle: "Indonesia's Paradise Island",
    destination: "Indonesia",
    category: "Beach",
    price: 3299,
    originalPrice: 3749,
    days: 7,
    cities: 3,
    isHalalFriendly: true,
    seatsLeft: 15,
    description: "Discover the magic of Indonesia's paradise island.",
    image: "https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg",
    savings: 450,
    discountPercentage: 12,
    isTopSelling: true,
    isFeatured: false
  },
  {
    id: 7,
    title: "Maldives Paradise",
    subtitle: "Luxury Beach Resort",
    destination: "Maldives",
    category: "Beach",
    price: 7500,
    originalPrice: 8500,
    days: 6,
    cities: 2,
    isHalalFriendly: true,
    seatsLeft: 5,
    description: "Luxury beach resort experience in crystal clear waters.",
    image: "https://images.pexels.com/photos/1287460/pexels-photo-1287460.jpeg",
    savings: 1000,
    discountPercentage: 12,
    isTopSelling: true,
    isFeatured: true
  },
  {
    id: 8,
    title: "Dubai Deluxe",
    subtitle: "Modern Arabian Adventure",
    destination: "UAE",
    category: "Luxury",
    price: 4899,
    originalPrice: 5599,
    days: 5,
    cities: 2,
    isHalalFriendly: true,
    seatsLeft: 9,
    description: "Experience luxury and modern marvels in the heart of Dubai.",
    image: "https://images.pexels.com/photos/1470405/pexels-photo-1470405.jpeg",
    savings: 700,
    discountPercentage: 13,
    isTopSelling: true,
    isFeatured: true
  }
];

exports.getAll = (req, reply) => {
  // Return all deals, sorted by featured first, then top selling, then by discount
  const sortedDeals = [...dealsData].sort((a, b) => {
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    if (a.isTopSelling && !b.isTopSelling) return -1;
    if (!a.isTopSelling && b.isTopSelling) return 1;
    return b.discountPercentage - a.discountPercentage;
  });

  reply.send({
    success: true,
    count: sortedDeals.length,
    deals: sortedDeals
  });
};

exports.getFeatured = (req, reply) => {
  // Get only featured deals
  const featuredDeals = dealsData.filter(deal => deal.isFeatured);
  
  reply.send({
    success: true,
    count: featuredDeals.length,
    deals: featuredDeals
  });
};

exports.getById = (req, reply) => {
  const { id } = req.params;
  const deal = dealsData.find(d => d.id === parseInt(id));

  if (!deal) {
    return reply.status(404).send({ 
      error: 'Deal not found' 
    });
  }

  reply.send({
    success: true,
    deal: deal
  });
};
