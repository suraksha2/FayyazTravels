// Configuration for all regions and countries
// This replaces the hardcoded static pages with a centralized data structure

export interface CountryConfig {
  name: string;
  slug: string;
  apiEndpoint: string;
  heroImage: string;
  description: string;
  mapImage?: string;
}

export interface RegionConfig {
  name: string;
  slug: string;
  apiEndpoint: string;
  heroImage: string;
  description: string;
  countries: CountryConfig[];
}

export const regionsConfig: RegionConfig[] = [
  {
    name: "Asia",
    slug: "asia",
    apiEndpoint: "/packages/asia",
    heroImage: "https://images.pexels.com/photos/3408354/pexels-photo-3408354.jpeg",
    description: "Discover the rich cultures and ancient traditions of Asia.",
    countries: [
      { name: "Armenia", slug: "armenia", apiEndpoint: "/destination/asia/armenia", heroImage: "https://images.pexels.com/photos/5638527/pexels-photo-5638527.jpeg", description: "Explore ancient monasteries and stunning mountain landscapes." },
      { name: "Azerbaijan", slug: "azerbaijan", apiEndpoint: "/destination/asia/azerbaijan", heroImage: "https://images.pexels.com/photos/9964558/pexels-photo-9964558.jpeg", description: "Discover the land of fire and modern architecture." },
      { name: "Bahrain", slug: "bahrain", apiEndpoint: "/destination/asia/bahrain", heroImage: "https://images.pexels.com/photos/3243090/pexels-photo-3243090.jpeg", description: "Experience the pearl of the Arabian Gulf." },
      { name: "Bangladesh", slug: "bangladesh", apiEndpoint: "/destination/asia/bangladesh", heroImage: "https://images.pexels.com/photos/2583852/pexels-photo-2583852.jpeg", description: "Discover the land of rivers and natural beauty." },
      { name: "Bhutan", slug: "bhutan", apiEndpoint: "/destination/asia/bhutan", heroImage: "https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg", description: "Experience the last Himalayan kingdom." },
      { name: "China", slug: "china", apiEndpoint: "/destination/asia/china", heroImage: "https://images.pexels.com/photos/2412609/pexels-photo-2412609.jpeg", description: "Explore ancient wonders and modern marvels." },
      { name: "Georgia", slug: "georgia", apiEndpoint: "/destination/asia/georgia", heroImage: "https://images.pexels.com/photos/3566187/pexels-photo-3566187.jpeg", description: "Discover the crossroads of Europe and Asia." },
      { name: "India", slug: "india", apiEndpoint: "/destination/asia/india", heroImage: "https://images.pexels.com/photos/1583339/pexels-photo-1583339.jpeg", description: "Experience the land of diversity and heritage." },
      { name: "Iran", slug: "iran", apiEndpoint: "/destination/asia/iran", heroImage: "https://images.pexels.com/photos/5836720/pexels-photo-5836720.jpeg", description: "Explore ancient Persia's rich history." },
      { name: "Japan", slug: "japan", apiEndpoint: "/destination/asia/japan", heroImage: "https://images.pexels.com/photos/402028/pexels-photo-402028.jpeg", description: "Experience tradition meets innovation." },
      { name: "Mongolia", slug: "mongolia", apiEndpoint: "/destination/asia/asia-mongolia", heroImage: "https://images.pexels.com/photos/2166711/pexels-photo-2166711.jpeg", description: "Discover the land of nomads and vast steppes." },
      { name: "Nepal", slug: "nepal", apiEndpoint: "/destination/asia/asia-nepal", heroImage: "https://images.pexels.com/photos/933054/pexels-photo-933054.jpeg", description: "Home to the world's highest peaks." },
      { name: "Pakistan", slug: "pakistan", apiEndpoint: "/destination/asia/asia-pakistan", heroImage: "https://images.pexels.com/photos/3881104/pexels-photo-3881104.jpeg", description: "Explore mountain valleys and ancient cultures." },
      { name: "South Korea", slug: "south-korea", apiEndpoint: "/destination/asia/asia-south-korea", heroImage: "https://images.pexels.com/photos/237211/pexels-photo-237211.jpeg", description: "Experience K-culture and modern Seoul." },
      { name: "Sri Lanka", slug: "sri-lanka", apiEndpoint: "/destination/asia/asia-sri-lanka", heroImage: "https://images.pexels.com/photos/1007426/pexels-photo-1007426.jpeg", description: "Discover the pearl of the Indian Ocean." },
      { name: "Taiwan", slug: "taiwan", apiEndpoint: "/destination/asia/asia-taiwan", heroImage: "https://images.pexels.com/photos/2422461/pexels-photo-2422461.jpeg", description: "Experience vibrant culture and night markets." },
      { name: "Tibet", slug: "tibet", apiEndpoint: "/destination/asia/asia-tibet", heroImage: "https://images.pexels.com/photos/2412609/pexels-photo-2412609.jpeg", description: "Explore the roof of the world." },
      { name: "Uzbekistan", slug: "uzbekistan", apiEndpoint: "/destination/asia/asia-uzbekistan", heroImage: "https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg", description: "Discover the ancient Silk Road cities and architectural wonders." }
    ]
  },
  {
    name: "Africa",
    slug: "africa",
    apiEndpoint: "/packages/africa",
    heroImage: "https://images.pexels.com/photos/33045/lion-wild-africa-african.jpg",
    description: "Safari adventures and cultural experiences across the continent.",
    countries: [
      { name: "Botswana", slug: "botswana", apiEndpoint: "/destination/africa/africa-botswana", heroImage: "https://images.pexels.com/photos/631317/pexels-photo-631317.jpeg", description: "Experience pristine wilderness and wildlife." },
      { name: "Egypt", slug: "egypt", apiEndpoint: "/destination/africa/africa-egypt", heroImage: "https://images.pexels.com/photos/262780/pexels-photo-262780.jpeg", description: "Explore ancient pyramids and pharaohs." },
      { name: "Kenya", slug: "kenya", apiEndpoint: "/destination/africa/africa-kenya", heroImage: "https://images.pexels.com/photos/1670732/pexels-photo-1670732.jpeg", description: "Safari capital with the Great Migration." },
      { name: "Madagascar", slug: "madagascar", apiEndpoint: "/destination/africa/africa-madagascar", heroImage: "https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg", description: "Unique wildlife and pristine beaches." },
      { name: "Malawi", slug: "malawi", apiEndpoint: "/destination/africa/africa-malawi", heroImage: "https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg", description: "The warm heart of Africa." },
      { name: "Mauritius", slug: "mauritius", apiEndpoint: "/destination/africa/africa-mauritius", heroImage: "https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg", description: "Tropical paradise with turquoise waters." },
      { name: "Morocco", slug: "morocco", apiEndpoint: "/destination/africa/africa-morocco", heroImage: "https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg", description: "Exotic markets and Sahara adventures." },
      { name: "Mozambique", slug: "mozambique", apiEndpoint: "/destination/africa/africa-mozambique", heroImage: "https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg", description: "Pristine coastlines and coral reefs." },
      { name: "Namibia", slug: "namibia", apiEndpoint: "/destination/africa/africa-namibia", heroImage: "https://images.pexels.com/photos/2832382/pexels-photo-2832382.jpeg", description: "Desert landscapes and wildlife." },
      { name: "Seychelles", slug: "seychelles", apiEndpoint: "/destination/africa/africa-seychelles", heroImage: "https://images.pexels.com/photos/3250613/pexels-photo-3250613.jpeg", description: "Luxury island paradise." },
      { name: "South Africa", slug: "south-africa", apiEndpoint: "/destination/africa/africa-south-africa", heroImage: "https://images.pexels.com/photos/259447/pexels-photo-259447.jpeg", description: "Rainbow nation with diverse experiences." },
      { name: "Tanzania", slug: "tanzania", apiEndpoint: "/destination/africa/africa-tanzania", heroImage: "https://images.pexels.com/photos/631317/pexels-photo-631317.jpeg", description: "Serengeti and Mount Kilimanjaro." },
      { name: "Tunisia", slug: "tunisia", apiEndpoint: "/destination/africa/africa-tunisia", heroImage: "https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg", description: "Mediterranean charm and ancient ruins." },
      { name: "Uganda", slug: "uganda", apiEndpoint: "/destination/africa/africa-uganda", heroImage: "https://images.pexels.com/photos/631317/pexels-photo-631317.jpeg", description: "Gorilla trekking and natural beauty." },
      { name: "Zambia", slug: "zambia", apiEndpoint: "/destination/africa/africa-zambia", heroImage: "https://images.pexels.com/photos/631317/pexels-photo-631317.jpeg", description: "Victoria Falls and walking safaris." },
      { name: "Zimbabwe", slug: "zimbabwe", apiEndpoint: "/destination/africa/africa-zimbabwe", heroImage: "https://images.pexels.com/photos/631317/pexels-photo-631317.jpeg", description: "Ancient ruins and wildlife." }
    ]
  },
  {
    name: "Europe",
    slug: "europe",
    apiEndpoint: "/packages/europe",
    heroImage: "https://images.pexels.com/photos/2363/france-landmark-lights-night.jpg",
    description: "Historic cities and cultural treasures.",
    countries: [
      { name: "Austria", slug: "austria", apiEndpoint: "/destination/europe/austria", heroImage: "https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg", description: "Alpine beauty and classical music." },
      { name: "Belgium", slug: "belgium", apiEndpoint: "/destination/europe/belgium", heroImage: "https://images.pexels.com/photos/1595385/pexels-photo-1595385.jpeg", description: "Chocolates, waffles, and medieval towns." },
      { name: "Czech Republic", slug: "czech-republic", apiEndpoint: "/destination/europe/czech-republic", heroImage: "https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg", description: "Prague's fairy-tale architecture." },
      { name: "Denmark", slug: "denmark", apiEndpoint: "/destination/europe/denmark", heroImage: "https://images.pexels.com/photos/1285625/pexels-photo-1285625.jpeg", description: "Scandinavian design and hygge." },
      { name: "Finland", slug: "finland", apiEndpoint: "/destination/europe/finland", heroImage: "https://images.pexels.com/photos/1008155/pexels-photo-1008155.jpeg", description: "Northern lights and lakeland." },
      { name: "France", slug: "france", apiEndpoint: "/destination/europe/france", heroImage: "https://images.pexels.com/photos/2363/france-landmark-lights-night.jpg", description: "Romance, art, and cuisine." },
      { name: "Germany", slug: "germany", apiEndpoint: "/destination/europe/germany", heroImage: "https://images.pexels.com/photos/208733/pexels-photo-208733.jpeg", description: "Castles, beer, and innovation." },
      { name: "Hungary", slug: "hungary", apiEndpoint: "/destination/europe/hungary", heroImage: "https://images.pexels.com/photos/2246789/pexels-photo-2246789.jpeg", description: "Budapest's thermal baths and history." },
      { name: "Ireland", slug: "ireland", apiEndpoint: "/destination/europe/ireland", heroImage: "https://images.pexels.com/photos/2382681/pexels-photo-2382681.jpeg", description: "Emerald landscapes and Celtic culture." },
      { name: "Italy", slug: "italy", apiEndpoint: "/destination/europe/italy", heroImage: "https://images.pexels.com/photos/2064827/pexels-photo-2064827.jpeg", description: "Art, history, and la dolce vita." },
      { name: "Netherlands", slug: "netherlands", apiEndpoint: "/destination/europe/netherlands", heroImage: "https://images.pexels.com/photos/1285625/pexels-photo-1285625.jpeg", description: "Windmills, tulips, and canals." },
      { name: "Poland", slug: "poland", apiEndpoint: "/destination/europe/poland", heroImage: "https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg", description: "Medieval towns and rich history." },
      { name: "Portugal", slug: "portugal", apiEndpoint: "/destination/europe/portugal", heroImage: "https://images.pexels.com/photos/2356045/pexels-photo-2356045.jpeg", description: "Coastal beauty and port wine." },
      { name: "Spain", slug: "spain", apiEndpoint: "/destination/europe/spain", heroImage: "https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg", description: "Flamenco, tapas, and beaches." },
      { name: "Switzerland", slug: "switzerland", apiEndpoint: "/destination/europe/switzerland", heroImage: "https://images.pexels.com/photos/1743165/pexels-photo-1743165.jpeg", description: "Alpine peaks and chocolate." },
      { name: "United Kingdom", slug: "united-kingdom", apiEndpoint: "/destination/europe/united-kingdom", heroImage: "https://images.pexels.com/photos/460672/pexels-photo-460672.jpeg", description: "Royal heritage and countryside." }
    ]
  },
  {
    name: "Middle East",
    slug: "middle-east",
    apiEndpoint: "/packages/middle-east",
    heroImage: "https://images.pexels.com/photos/3243090/pexels-photo-3243090.jpeg",
    description: "Ancient history meets modern luxury.",
    countries: [
      { name: "Bahrain", slug: "bahrain", apiEndpoint: "/destination/middle-east/bahrain", heroImage: "https://images.pexels.com/photos/3243090/pexels-photo-3243090.jpeg", description: "Pearl of the Arabian Gulf." },
      { name: "Iran", slug: "iran", apiEndpoint: "/destination/middle-east/iran", heroImage: "https://images.pexels.com/photos/5836720/pexels-photo-5836720.jpeg", description: "Ancient Persia's treasures." },
      { name: "Iraq", slug: "iraq", apiEndpoint: "/destination/middle-east/iraq", heroImage: "https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg", description: "Cradle of civilization." },
      { name: "Israel", slug: "israel", apiEndpoint: "/destination/middle-east/israel", heroImage: "https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg", description: "Holy land and modern innovation." },
      { name: "Jordan", slug: "jordan", apiEndpoint: "/destination/middle-east/jordan", heroImage: "https://images.pexels.com/photos/4350043/pexels-photo-4350043.jpeg", description: "Petra and desert adventures." },
      { name: "Kuwait", slug: "kuwait", apiEndpoint: "/destination/middle-east/kuwait", heroImage: "https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg", description: "Modern Gulf state." },
      { name: "Lebanon", slug: "lebanon", apiEndpoint: "/destination/middle-east/lebanon", heroImage: "https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg", description: "Mediterranean jewel." },
      { name: "Oman", slug: "oman", apiEndpoint: "/destination/middle-east/oman", heroImage: "https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg", description: "Desert beauty and heritage." },
      { name: "Qatar", slug: "qatar", apiEndpoint: "/destination/middle-east/qatar", heroImage: "https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg", description: "Modern marvels and tradition." },
      { name: "Saudi Arabia", slug: "saudi-arabia", apiEndpoint: "/destination/middle-east/saudi-arabia", heroImage: "https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg", description: "Ancient heritage and new vision." },
      { name: "Syria", slug: "syria", apiEndpoint: "/destination/middle-east/syria", heroImage: "https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg", description: "Ancient cities and culture." },
      { name: "Turkey", slug: "turkey", apiEndpoint: "/destination/middle-east/turkey", heroImage: "https://images.pexels.com/photos/1486222/pexels-photo-1486222.jpeg", description: "Where East meets West." },
      { name: "United Arab Emirates", slug: "united-arab-emirates", apiEndpoint: "/destination/middle-east/united-arab-emirates", heroImage: "https://images.pexels.com/photos/1470502/pexels-photo-1470502.jpeg", description: "Luxury and innovation." },
      { name: "Yemen", slug: "yemen", apiEndpoint: "/destination/middle-east/yemen", heroImage: "https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg", description: "Ancient Arabian heritage." }
    ]
  },
  {
    name: "North America",
    slug: "north-america",
    apiEndpoint: "/packages/north-america",
    heroImage: "https://images.pexels.com/photos/290386/pexels-photo-290386.jpeg",
    description: "From wilderness to world-class cities.",
    countries: [
      { name: "Alaska", slug: "alaska", apiEndpoint: "/destination/north-america/alaska", heroImage: "https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg", description: "Last frontier wilderness." },
      { name: "Canada", slug: "canada", apiEndpoint: "/destination/north-america/canada", heroImage: "https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg", description: "Natural beauty and multicultural cities." },
      { name: "Costa Rica", slug: "costa-rica", apiEndpoint: "/destination/north-america/costa-rica", heroImage: "https://images.pexels.com/photos/1903702/pexels-photo-1903702.jpeg", description: "Eco-paradise with biodiversity." },
      { name: "Mexico", slug: "mexico", apiEndpoint: "/destination/north-america/mexico", heroImage: "https://images.pexels.com/photos/1586298/pexels-photo-1586298.jpeg", description: "Ancient ruins and vibrant culture." },
      { name: "Panama", slug: "panama", apiEndpoint: "/destination/north-america/panama", heroImage: "https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg", description: "Canal, beaches, and rainforests." },
      { name: "United States", slug: "united-states", apiEndpoint: "/destination/north-america/united-states", heroImage: "https://images.pexels.com/photos/290386/pexels-photo-290386.jpeg", description: "Diverse landscapes and experiences." }
    ]
  },
  {
    name: "South America",
    slug: "south-america",
    apiEndpoint: "/packages/south-america",
    heroImage: "https://images.pexels.com/photos/2356045/pexels-photo-2356045.jpeg",
    description: "Passion, culture, and natural wonders.",
    countries: [
      { name: "Argentina", slug: "argentina", apiEndpoint: "/destination/south-america/argentina", heroImage: "https://images.pexels.com/photos/2356045/pexels-photo-2356045.jpeg", description: "Tango, wine, and Patagonia." },
      { name: "Bolivia", slug: "bolivia", apiEndpoint: "/destination/south-america/bolivia", heroImage: "https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg", description: "Salt flats and Andean culture." },
      { name: "Brazil", slug: "brazil", apiEndpoint: "/destination/south-america/brazil", heroImage: "https://images.pexels.com/photos/2868242/pexels-photo-2868242.jpeg", description: "Carnival, beaches, and Amazon." },
      { name: "Chile", slug: "chile", apiEndpoint: "/destination/south-america/chile", heroImage: "https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg", description: "From desert to glaciers." },
      { name: "Colombia", slug: "colombia", apiEndpoint: "/destination/south-america/colombia", heroImage: "https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg", description: "Coffee, culture, and Caribbean." },
      { name: "Ecuador", slug: "ecuador", apiEndpoint: "/destination/south-america/ecuador", heroImage: "https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg", description: "Galapagos and biodiversity." },
      { name: "Peru", slug: "peru", apiEndpoint: "/destination/south-america/peru", heroImage: "https://images.pexels.com/photos/2356045/pexels-photo-2356045.jpeg", description: "Machu Picchu and Inca heritage." },
      { name: "Uruguay", slug: "uruguay", apiEndpoint: "/destination/south-america/uruguay", heroImage: "https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg", description: "Beaches and colonial charm." },
      { name: "Venezuela", slug: "venezuela", apiEndpoint: "/destination/south-america/venezuela", heroImage: "https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg", description: "Angel Falls and Caribbean coast." }
    ]
  },
  {
    name: "South East Asia",
    slug: "south-east-asia",
    apiEndpoint: "/packages/south-east-asia",
    heroImage: "https://images.pexels.com/photos/1031659/pexels-photo-1031659.jpeg",
    description: "Tropical paradise and vibrant cultures.",
    countries: [
      { name: "Batam", slug: "batam", apiEndpoint: "/destination/south-east-asia/batam", heroImage: "https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg", description: "Indonesian island getaway." },
      { name: "Bintan Islands", slug: "bintan-islands", apiEndpoint: "/destination/south-east-asia/bintan-islands", heroImage: "https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg", description: "Beach resorts and relaxation." },
      { name: "Brunei Darussalam", slug: "brunei-darussalam", apiEndpoint: "/destination/south-east-asia/brunei-darussalam", heroImage: "https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg", description: "Sultanate with golden mosques." },
      { name: "Cambodia", slug: "cambodia", apiEndpoint: "/destination/south-east-asia/cambodia", heroImage: "https://images.pexels.com/photos/2166559/pexels-photo-2166559.jpeg", description: "Angkor Wat and ancient temples." },
      { name: "Indonesia", slug: "indonesia", apiEndpoint: "/destination/south-east-asia/indonesia", heroImage: "https://images.pexels.com/photos/2166559/pexels-photo-2166559.jpeg", description: "Islands, temples, and diversity." },
      { name: "Laos", slug: "laos", apiEndpoint: "/destination/south-east-asia/laos", heroImage: "https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg", description: "Tranquil landscapes and Buddhism." },
      { name: "Malaysia", slug: "malaysia", apiEndpoint: "/destination/south-east-asia/malaysia", heroImage: "https://images.pexels.com/photos/1285625/pexels-photo-1285625.jpeg", description: "Multicultural cities and rainforests." },
      { name: "Maldives", slug: "maldives", apiEndpoint: "/destination/south-east-asia/maldives", heroImage: "https://images.pexels.com/photos/3250613/pexels-photo-3250613.jpeg", description: "Luxury overwater villas." },
      { name: "Myanmar", slug: "myanmar", apiEndpoint: "/destination/south-east-asia/myanmar", heroImage: "https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg", description: "Golden pagodas and traditions." },
      { name: "Philippines", slug: "philippines", apiEndpoint: "/destination/south-east-asia/philippines", heroImage: "https://images.pexels.com/photos/2166559/pexels-photo-2166559.jpeg", description: "Tropical islands and beaches." },
      { name: "Singapore", slug: "singapore", apiEndpoint: "/destination/south-east-asia/singapore", heroImage: "https://images.pexels.com/photos/1285625/pexels-photo-1285625.jpeg", description: "Modern city-state." },
      { name: "Thailand", slug: "thailand", apiEndpoint: "/destination/south-east-asia/thailand", heroImage: "https://images.pexels.com/photos/1031659/pexels-photo-1031659.jpeg", description: "Temples, beaches, and street food." },
      { name: "Timor-Leste", slug: "timor-leste", apiEndpoint: "/destination/south-east-asia/timor-leste", heroImage: "https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg", description: "Emerging destination." },
      { name: "Vietnam", slug: "vietnam", apiEndpoint: "/destination/south-east-asia/vietnam", heroImage: "https://images.pexels.com/photos/1031659/pexels-photo-1031659.jpeg", description: "Rich history and cuisine." }
    ]
  },
  {
    name: "The Caribbean",
    slug: "the-caribbean",
    apiEndpoint: "/packages/the-caribbean",
    heroImage: "https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg",
    description: "Pristine beaches and tropical paradise.",
    countries: [
      { name: "Anguilla", slug: "anguilla", apiEndpoint: "/destination/caribbean/anguilla", heroImage: "https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg", description: "Luxury Caribbean island." },
      { name: "Antigua and Barbuda", slug: "antigua-and-barbuda", apiEndpoint: "/destination/caribbean/antigua-and-barbuda", heroImage: "https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg", description: "365 beaches to explore." },
      { name: "Bahamas", slug: "bahamas", apiEndpoint: "/destination/caribbean/bahamas", heroImage: "https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg", description: "Crystal clear waters." },
      { name: "Barbados", slug: "barbados", apiEndpoint: "/destination/caribbean/barbados", heroImage: "https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg", description: "Rum and beaches." },
      { name: "British Virgin Islands", slug: "british-virgin-islands", apiEndpoint: "/destination/caribbean/british-virgin-islands", heroImage: "https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg", description: "Sailing paradise." },
      { name: "Cuba", slug: "cuba", apiEndpoint: "/destination/caribbean/cuba", heroImage: "https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg", description: "Classic cars and culture." },
      { name: "Dominican Republic", slug: "dominican-republic", apiEndpoint: "/destination/caribbean/dominican-republic", heroImage: "https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg", description: "All-inclusive resorts." },
      { name: "Jamaica", slug: "jamaica", apiEndpoint: "/destination/caribbean/jamaica", heroImage: "https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg", description: "Reggae and beaches." },
      { name: "Puerto Rico", slug: "puerto-rico", apiEndpoint: "/destination/caribbean/puerto-rico", heroImage: "https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg", description: "Old San Juan charm." }
    ]
  },
  {
    name: "Oceania",
    slug: "oceania",
    apiEndpoint: "/packages/oceania",
    heroImage: "https://images.pexels.com/photos/995763/pexels-photo-995763.jpeg",
    description: "Pacific islands and adventures.",
    countries: [
      { name: "Australia", slug: "australia", apiEndpoint: "/destination/oceania/australia", heroImage: "https://images.pexels.com/photos/995763/pexels-photo-995763.jpeg", description: "Outback and Great Barrier Reef." },
      { name: "Fiji", slug: "fiji", apiEndpoint: "/destination/oceania/fiji", heroImage: "https://images.pexels.com/photos/3250613/pexels-photo-3250613.jpeg", description: "Tropical island paradise." },
      { name: "New Zealand", slug: "new-zealand", apiEndpoint: "/destination/oceania/new-zealand", heroImage: "https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg", description: "Adventure capital of the world." },
      { name: "Papua New Guinea", slug: "papua-new-guinea", apiEndpoint: "/destination/oceania/papua-new-guinea", heroImage: "https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg", description: "Tribal cultures and diving." },
      { name: "Samoa", slug: "samoa", apiEndpoint: "/destination/oceania/samoa", heroImage: "https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg", description: "Polynesian culture." },
      { name: "Tonga", slug: "tonga", apiEndpoint: "/destination/oceania/tonga", heroImage: "https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg", description: "Kingdom of the Pacific." },
      { name: "Vanuatu", slug: "vanuatu", apiEndpoint: "/destination/oceania/vanuatu", heroImage: "https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg", description: "Volcanic islands." }
    ]
  },
  {
    name: "Scandinavia",
    slug: "scandinavia",
    apiEndpoint: "/packages/scandinavia",
    heroImage: "https://images.pexels.com/photos/1008155/pexels-photo-1008155.jpeg",
    description: "Northern lights and Nordic culture.",
    countries: [
      { name: "Denmark", slug: "denmark", apiEndpoint: "/destination/scandinavia/denmark", heroImage: "https://images.pexels.com/photos/1285625/pexels-photo-1285625.jpeg", description: "Copenhagen and hygge." },
      { name: "Finland", slug: "finland", apiEndpoint: "/destination/scandinavia/finland", heroImage: "https://images.pexels.com/photos/1008155/pexels-photo-1008155.jpeg", description: "Lapland and saunas." },
      { name: "Iceland", slug: "iceland", apiEndpoint: "/destination/scandinavia/iceland", heroImage: "https://images.pexels.com/photos/1008155/pexels-photo-1008155.jpeg", description: "Fire and ice." },
      { name: "Norway", slug: "norway", apiEndpoint: "/destination/scandinavia/norway", heroImage: "https://images.pexels.com/photos/1008155/pexels-photo-1008155.jpeg", description: "Fjords and northern lights." },
      { name: "Sweden", slug: "sweden", apiEndpoint: "/destination/sweden", heroImage: "https://images.pexels.com/photos/1008155/pexels-photo-1008155.jpeg", description: "Stockholm and design." }
    ]
  },
  {
    name: "South East Europe",
    slug: "south-east-europe",
    apiEndpoint: "/packages/south-east-europe",
    heroImage: "https://images.pexels.com/photos/2166559/pexels-photo-2166559.jpeg",
    description: "Balkans and Mediterranean charm.",
    countries: [
      { name: "Albania", slug: "albania", apiEndpoint: "/destination/south-east-europe/albania", heroImage: "https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg", description: "Undiscovered Adriatic coast." },
      { name: "Bosnia and Herzegovina", slug: "bosnia-and-herzegovina", apiEndpoint: "/destination/south-east-europe/bosnia-and-herzegovina", heroImage: "https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg", description: "Ottoman heritage." },
      { name: "Bulgaria", slug: "bulgaria", apiEndpoint: "/destination/south-east-europe/bulgaria", heroImage: "https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg", description: "Black Sea beaches." },
      { name: "Croatia", slug: "croatia", apiEndpoint: "/destination/south-east-europe/croatia", heroImage: "https://images.pexels.com/photos/2166559/pexels-photo-2166559.jpeg", description: "Dalmatian coast and islands." },
      { name: "Greece", slug: "greece", apiEndpoint: "/destination/south-east-europe/greece", heroImage: "https://images.pexels.com/photos/2166559/pexels-photo-2166559.jpeg", description: "Ancient ruins and islands." },
      { name: "Montenegro", slug: "montenegro", apiEndpoint: "/destination/south-east-europe/montenegro", heroImage: "https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg", description: "Adriatic gem." },
      { name: "North Macedonia", slug: "north-macedonia", apiEndpoint: "/destination/south-east-europe/north-macedonia", heroImage: "https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg", description: "Lake Ohrid beauty." },
      { name: "Serbia", slug: "serbia", apiEndpoint: "/destination/south-east-europe/serbia", heroImage: "https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg", description: "Belgrade nightlife." },
      { name: "Slovenia", slug: "slovenia", apiEndpoint: "/destination/south-east-europe/slovenia", heroImage: "https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg", description: "Alpine lakes and caves." }
    ]
  }
];

// Helper function to get region by slug
export function getRegionBySlug(slug: string): RegionConfig | undefined {
  return regionsConfig.find(region => region.slug === slug);
}

// Helper function to get country by region and country slug
export function getCountryBySlug(regionSlug: string, countrySlug: string): CountryConfig | undefined {
  const region = getRegionBySlug(regionSlug);
  return region?.countries.find(country => country.slug === countrySlug);
}

// Helper function to get all region slugs
export function getAllRegionSlugs(): string[] {
  return regionsConfig.map(region => region.slug);
}

// Helper function to get all country slugs for a region
export function getAllCountrySlugsForRegion(regionSlug: string): string[] {
  const region = getRegionBySlug(regionSlug);
  return region?.countries.map(country => country.slug) || [];
}
