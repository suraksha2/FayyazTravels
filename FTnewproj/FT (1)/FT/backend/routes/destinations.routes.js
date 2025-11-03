// routes/destinations.routes.js
const controller = require('../controllers/destinations.controller');

module.exports = async function (fastify, opts) {
  // Main route for getting destinations
  fastify.get('/get-destination', controller.getAll);
  
  // Get all destinations (alternative route)
  fastify.get('/destination-list', controller.getAll);
  
  // Get destination by ID
  fastify.get('/destination/:id', controller.getById);
  
  // Get destination by slug
  fastify.get('/destination/slug/:slug', controller.getBySlug);
  
  // Get packages for a specific destination
  fastify.get('/destination/:slug/packages', controller.getPackagesByDestination);
  
  // Get multi-city destinations
  fastify.get('/destination/multi-city', controller.getMultiCityDestinations);
  
  // Get Australia-New Zealand packages specifically
  fastify.get('/destination/multi-city/australia-new-zealand', controller.getAustraliaNewZealandPackages);
  
  // Get Austria-Switzerland packages specifically
  fastify.get('/destination/multi-city/austria-switzerland', controller.getAustriaSwitzerlandPackages);
  
  // Get Bulgaria-Greece packages specifically
  fastify.get('/destination/multi-city/bulgaria-greece', controller.getBulgariaGreecePackages);
  
  // Get Panama-Costa Rica packages specifically
  fastify.get('/destination/multi-city/panama-costa-rica', controller.getPanamaCostaRicaPackages);
  
  // Get Paris-Switzerland packages specifically
  fastify.get('/destination/multi-city/paris-switzerland', controller.getParisSwitzerlandPackages);
  
  // Get Fixed Departures packages
  fastify.get('/destination/multi-city/fixed-departures', controller.getFixedDeparturesPackages);
  
  // GROUP TOUR ROUTES
  
  // Get Kashmir Group Tour packages
  fastify.get('/packages/group-tours/kashmir-group-tour', controller.getKashmirGroupTourPackages);
  
  // Get North India Group Tour packages
  fastify.get('/packages/group-tours/tour-of-north-india', controller.getNorthIndiaGroupTourPackages);
  
  // Get Turkey-Georgia-Azerbaijan packages
  fastify.get('/packages/group-tours/turkey-georgia-azerbaijan', controller.getTurkeyGeorgiaAzerbaijanPackages);
  fastify.get('/packages/group-tours/turkey-georgia-azerbaijan-group-tour', controller.getTurkeyGeorgiaAzerbaijanPackages); // Alias
  
  // Get Uzbekistan Group Tour packages
  fastify.get('/packages/group-tours/uzbekistan-group-tour', controller.getUzbekistanGroupTourPackages);
  
  // Get General Group Tour packages
  fastify.get('/packages/group-tours/group-tour', controller.getGeneralGroupTourPackages);
  
  // AFRICA DESTINATION ROUTES
  
  // Get Botswana packages
  fastify.get('/destination/africa/africa-botswana', controller.getBotswanaPackages);
  
  // Get Egypt packages
  fastify.get('/destination/africa/africa-egypt', controller.getEgyptPackages);
  
  // Get Kenya packages
  fastify.get('/destination/africa/africa-kenya', controller.getKenyaPackages);
  
  // Get Madagascar packages
  fastify.get('/destination/africa/africa-madagascar', controller.getMadagascarPackages);
  
  // Get Malawi packages
  fastify.get('/destination/africa/africa-malawi', controller.getMalawiPackages);
  
  // Get Mauritius packages
  fastify.get('/destination/africa/africa-mauritius', controller.getMauritiusPackages);
  // Get Morocco packages
  fastify.get('/destination/africa/africa-morocco', controller.getMoroccoPackages);
  
  // Get Mozambique packages
  fastify.get('/destination/africa/africa-mozambique', controller.getMozambiquePackages);

  // Get Namibia packages
  fastify.get('/destination/africa/africa-namibia', controller.getNamibiaPackages);

  // Get Seychelles packages
  fastify.get('/destination/africa/africa-seychelles', controller.getSeychellesPackages);

  // Get South Africa packages
  fastify.get('/destination/africa/africa-south-africa', controller.getSouthAfricaPackages);

  // Get Tanzania packages
  fastify.get('/destination/africa/africa-tanzania', controller.getTanzaniaPackages);

  // Get Tunisia packages
  fastify.get('/destination/africa/africa-tunisia', controller.getTunisiaPackages);

  // Get Uganda packages
  fastify.get('/destination/africa/africa-uganda', controller.getUgandaPackages);

  // Get Zambia packages
  fastify.get('/destination/africa/africa-zambia', controller.getZambiaPackages);

  // Get Zimbabwe packages
  fastify.get('/destination/africa/africa-zimbabwe', controller.getZimbabwePackages);

  // CARIBBEAN DESTINATION ROUTES
  
  // Get Anguilla packages
  fastify.get('/destination/caribbean/anguilla', controller.getAnguillaPackages);
  // Get Antigua and Barbuda packages
  fastify.get('/destination/caribbean/antigua-and-barbuda', controller.getAntiguaBarbudaPackages);
  
  // Get Bahamas packages
  fastify.get('/destination/caribbean/bahamas', controller.getBahamasPackages);
  
  // Get Barbados packages
  fastify.get('/destination/caribbean/barbados', controller.getBarbadosPackages);
  
  // Get British Virgin Islands packages
  fastify.get('/destination/caribbean/british-virgin-islands', controller.getBritishVirginIslandsPackages);
  
  // Get Cuba packages
  fastify.get('/destination/caribbean/cuba', controller.getCubaPackages);
  
  // Get Dominican Republic packages
  fastify.get('/destination/caribbean/dominican-republic', controller.getDominicanRepublicPackages);
  
  // Get Jamaica packages
  fastify.get('/destination/caribbean/jamaica', controller.getJamaicaPackages);
  
  // Get Puerto Rico packages
  fastify.get('/destination/caribbean/puerto-rico', controller.getPuertoRicoPackages);
  
  // SOUTH AMERICA DESTINATION ROUTES
  
  // Get Argentina packages
  fastify.get('/destination/south-america/argentina', controller.getArgentinaPackages);
  
  // Get Bolivia packages
  fastify.get('/destination/south-america/bolivia', controller.getBoliviaPackages);
  
  // Get Brazil packages
  fastify.get('/destination/south-america/brazil', controller.getBrazilPackages);
  
  // Get Chile packages
  fastify.get('/destination/south-america/chile', controller.getChilePackages);
  
  // Get Colombia packages
  fastify.get('/destination/south-america/colombia', controller.getColombiaPackages);
  
  // Get Ecuador packages
  fastify.get('/destination/south-america/ecuador', controller.getEcuadorPackages);
  
  // Get Peru packages
  fastify.get('/destination/south-america/peru', controller.getPeruPackages);
  
  // Get Uruguay packages
  fastify.get('/destination/south-america/uruguay', controller.getUruguayPackages);
  
  // Get Venezuela packages
  fastify.get('/destination/south-america/venezuela', controller.getVenezuelaPackages);
  
  // Get Alaska packages
  fastify.get('/destination/north-america/alaska', controller.getAlaskaPackages);
  
  // Get Canada packages
  fastify.get('/destination/north-america/canada', controller.getCanadaPackages);
  
  // Get Costa Rica packages
  fastify.get('/destination/north-america/costa-rica', controller.getCostaRicaPackages);
  
  // Get Japan packages
  fastify.get('/destination/asia/japan', controller.getJapanPackages);
  
  // Get China packages
  fastify.get('/destination/asia/china', controller.getChinaPackages);
  
  // Get India packages
  fastify.get('/destination/asia/india', controller.getIndiaPackages);
  
  // Get Mexico packages
  fastify.get('/destination/north-america/mexico', controller.getMexicoPackages);
  
  // Get Panama packages
  fastify.get('/destination/north-america/panama', controller.getPanamaPackages);
  
  // Get United States packages
  fastify.get('/destination/north-america/united-states', controller.getUnitedStatesPackages);
  
  // Get Armenia packages
  fastify.get('/destination/asia/armenia', controller.getArmeniaPackages);
  
  // Get Azerbaijan packages
  fastify.get('/destination/asia/azerbaijan', controller.getAzerbaijanPackages);
  
  // Get Bahrain packages
  fastify.get('/destination/asia/bahrain', controller.getBahrainPackages);
  
  // Get Bangladesh packages
  fastify.get('/destination/asia/bangladesh', controller.getBangladeshPackages);
  
  // Get Bhutan packages
  fastify.get('/destination/asia/bhutan', controller.getBhutanPackages);
  
  // Get Georgia packages
  fastify.get('/destination/asia/georgia', controller.getGeorgiaPackages);
  
  // Get Iran packages
  fastify.get('/destination/asia/iran', controller.getIranPackages);

  // Get Mongolia packages
  fastify.get('/destination/asia/asia-mongolia', controller.getMongoliaPackages);

  // Get Nepal packages
  fastify.get('/destination/asia/asia-nepal', controller.getNepalPackages);

  // Get Pakistan packages
  fastify.get('/destination/asia/asia-pakistan', controller.getPakistanPackages);

  // Get South Korea packages
  fastify.get('/destination/asia/asia-south-korea', controller.getSouthKoreaPackages);

  // Get Sri Lanka packages
  fastify.get('/destination/asia/asia-sri-lanka', controller.getSriLankaPackages);

  // Get Taiwan packages
  fastify.get('/destination/asia/asia-taiwan', controller.getTaiwanPackages);

  // Get Tibet packages
  fastify.get('/destination/asia/asia-tibet', controller.getTibetPackages);

  // Get Uzbekistan packages
  fastify.get('/destination/asia/asia-uzbekistan', controller.getUzbekistanPackages);

  // Get Batam packages
  fastify.get('/destination/south-east-asia/batam', controller.getBatamPackages);
  
  // Get Bintan Islands packages
  fastify.get('/destination/south-east-asia/bintan-islands', controller.getBintanIslandsPackages);
  // Get Brunei Darussalam packages
  fastify.get('/destination/south-east-asia/brunei-darussalam', controller.getBruneiDarussalamPackages);
  
  // Get Cambodia packages
  fastify.get('/destination/south-east-asia/cambodia', controller.getCambodiaPackages);
  
  // Get Indonesia packages
  fastify.get('/destination/south-east-asia/indonesia', controller.getIndonesiaPackages);
  
  // Get Laos packages
  fastify.get('/destination/south-east-asia/laos', controller.getLaosPackages);
  
  // Get Malaysia packages
  fastify.get('/destination/south-east-asia/malaysia', controller.getMalaysiaPackages);
  
  // Get Maldives packages
  fastify.get('/destination/south-east-asia/maldives', controller.getMaldivesPackages);
  
  // Get Myanmar packages
  fastify.get('/destination/south-east-asia/myanmar', controller.getMyanmarPackages);
  
  // Get Philippines packages
  fastify.get('/destination/south-east-asia/philippines', controller.getPhilippinesPackages);
  
  // Get Singapore packages
  fastify.get('/destination/south-east-asia/singapore', controller.getSingaporePackages);
  
  // Get Thailand packages
  fastify.get('/destination/south-east-asia/thailand', controller.getThailandPackages);
  
  // Get Timor-Leste packages
  fastify.get('/destination/south-east-asia/timor-leste', controller.getTimorLestePackages);
  
  // Get Vietnam packages
  fastify.get('/destination/south-east-asia/vietnam', controller.getVietnamPackages);
  
  // Get Bahrain packages
  fastify.get('/destination/middle-east/bahrain', controller.getBahrainPackages);
  
  // Get Iran packages
  fastify.get('/destination/middle-east/iran', controller.getIranPackages);
  
  // Get Iraq packages
  fastify.get('/destination/middle-east/iraq', controller.getIraqPackages);
  
  // Get Israel packages
  fastify.get('/destination/middle-east/israel', controller.getIsraelPackages);
  
  // Get Oman packages
  fastify.get('/destination/middle-east/oman', controller.getOmanPackages);
  
  // Get Qatar packages
  fastify.get('/destination/middle-east/qatar', controller.getQatarPackages);
  
  // Get Saudi Arabia packages
  fastify.get('/destination/middle-east/saudi-arabia', controller.getSaudiArabiaPackages);
  
  // Get Jordan packages
  fastify.get('/destination/middle-east/jordan', controller.getJordanPackages);
  
  // Get Kuwait packages
  fastify.get('/destination/middle-east/kuwait', controller.getKuwaitPackages);
  
  // Get Lebanon packages
  fastify.get('/destination/middle-east/lebanon', controller.getLebanonPackages);

  // Get Syria packages
  fastify.get('/destination/middle-east/syria', controller.getSyriaPackages);

  // Get Turkey packages
  fastify.get('/destination/middle-east/turkey', controller.getTurkeyPackages);

  // Get United Arab Emirates packages
  fastify.get('/destination/middle-east/united-arab-emirates', controller.getUAEPackages);

  // Get Yemen packages
  fastify.get('/destination/middle-east/yemen', controller.getYemenPackages);

  // Get Albania packages
  fastify.get('/destination/south-east-europe/albania', controller.getAlbaniaPackages);
  
  // Get Bosnia and Herzegovina packages
  fastify.get('/destination/south-east-europe/bosnia-and-herzegovina', controller.getBosniaHerzegovinaPackages);
  // Get Bulgaria packages
  fastify.get('/destination/south-east-europe/bulgaria', controller.getBulgariaPackages);
  
  // Get Croatia packages
  fastify.get('/destination/south-east-europe/croatia', controller.getCroatiaPackages);
  
  // Get Greece packages
  fastify.get('/destination/south-east-europe/greece', controller.getGreecePackages);

  // Get Montenegro packages
  fastify.get('/destination/south-east-europe/montenegro', controller.getMontenegroPackages);

  // Get North Macedonia packages
  fastify.get('/destination/south-east-europe/north-macedonia', controller.getNorthMacedoniaPackages);

  // Get Serbia packages
  fastify.get('/destination/south-east-europe/serbia', controller.getSerbiaPackages);

  // Get Slovenia packages
  fastify.get('/destination/south-east-europe/slovenia', controller.getSloveniaPackages);

  // Get Austria packages
  fastify.get('/destination/europe/austria', controller.getAustriaPackages);
  
  // Get Belgium packages
  fastify.get('/destination/europe/belgium', controller.getBelgiumPackages);
  // Get Czech Republic packages
  fastify.get('/destination/europe/czech-republic', controller.getCzechRepublicPackages);
  
  // Get Denmark packages
  fastify.get('/destination/europe/denmark', controller.getDenmarkPackages);
  
  // Get Finland packages
  fastify.get('/destination/europe/finland', controller.getFinlandPackages);
  
  // Get France packages
  fastify.get('/destination/europe/france', controller.getFrancePackages);
  
  // Get Germany packages
  fastify.get('/destination/europe/germany', controller.getGermanyPackages);
  
  // Get Hungary packages
  fastify.get('/destination/europe/hungary', controller.getHungaryPackages);
  
  // Get Ireland packages
  fastify.get('/destination/europe/ireland', controller.getIrelandPackages);
  
  // Get Italy packages
  fastify.get('/destination/europe/italy', controller.getItalyPackages);
  
  // Get Netherlands packages
  fastify.get('/destination/europe/netherlands', controller.getNetherlandsPackages);
  
  // Get Poland packages
  fastify.get('/destination/europe/poland', controller.getPolandPackages);
  
  // Get Portugal packages
  fastify.get('/destination/europe/portugal', controller.getPortugalPackages);
  
  // Get Spain packages
  fastify.get('/destination/europe/spain', controller.getSpainPackages);
  
  // Get Switzerland packages
  fastify.get('/destination/europe/switzerland', controller.getSwitzerlandPackages);
  
  // Get United Kingdom packages
  fastify.get('/destination/europe/united-kingdom', controller.getUnitedKingdomPackages);
  
  // Get Scandinavia Denmark packages
  fastify.get('/destination/scandinavia/denmark', controller.getScandinavia_DenmarkPackages);
  
  // Get Scandinavia Finland packages
  fastify.get('/destination/scandinavia/finland', controller.getScandinavia_FinlandPackages);
  
  // Get Scandinavia Iceland packages
  fastify.get('/destination/scandinavia/iceland', controller.getScandinavia_IcelandPackages);
  
  // Get Scandinavia Norway packages
  fastify.get('/destination/scandinavia/norway', controller.getScandinavia_NorwayPackages);
  
  // Get Sweden packages
  fastify.get('/destination/sweden', controller.getSwedenPackages);
  
  // Get Oceania Australia packages
  fastify.get('/destination/oceania/australia', controller.getOceania_AustraliaPackages);
  
  // Get Oceania Fiji packages
  fastify.get('/destination/oceania/fiji', controller.getOceania_FijiPackages);
  
  // Get Oceania New Zealand packages
  fastify.get('/destination/oceania/new-zealand', controller.getOceania_NewZealandPackages);
  
  // Get Oceania Papua New Guinea packages
  fastify.get('/destination/oceania/papua-new-guinea', controller.getOceania_PapuaNewGuineaPackages);
  
  // Get Oceania Samoa packages
  fastify.get('/destination/oceania/samoa', controller.getOceania_SamoaPackages);
  
  // Get Oceania Tonga packages
  fastify.get('/destination/oceania/tonga', controller.getOceania_TongaPackages);
  
  // Get Oceania Vanuatu packages
  fastify.get('/destination/oceania/vanuatu', controller.getOceania_VanuatuPackages);
};
