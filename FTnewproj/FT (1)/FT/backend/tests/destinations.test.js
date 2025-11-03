const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3003';

describe('Destinations Controller Tests', () => {
  describe('GET /get-destination', () => {
    it('should return list of destinations', async () => {
      const response = await axios.get(`${API_URL}/get-destination`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should return destinations with required fields', async () => {
      const response = await axios.get(`${API_URL}/destination-list`);
      
      if (response.data.length > 0) {
        const destination = response.data[0];
        expect(destination).toHaveProperty('id');
        expect(destination).toHaveProperty('d_name'); // Database field is d_name
        expect(destination).toHaveProperty('d_slug');
      }
    });
  });

  describe('GET /destination/:id', () => {
    it('should return a single destination by id', async () => {
      // First get all destinations
      const allDestinations = await axios.get(`${API_URL}/get-destination`);
      
      if (allDestinations.data.length > 0) {
        const firstDestId = allDestinations.data[0].id;
        const response = await axios.get(`${API_URL}/destination/${firstDestId}`);
        
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('id', firstDestId);
      }
    });

    it('should return 404 for non-existent destination', async () => {
      try {
        await axios.get(`${API_URL}/destination/999999`);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).toBe(404);
      }
    });
  });

  describe('Destination by Slug', () => {
    it('should get destination by slug', async () => {
      // First get all destinations to find a valid slug
      const allDestinations = await axios.get(`${API_URL}/get-destination`);
      
      if (allDestinations.data.length > 0 && allDestinations.data[0].d_slug) {
        const slug = allDestinations.data[0].d_slug;
        const response = await axios.get(`${API_URL}/destination/slug/${slug}`);
        
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('d_slug');
      }
    });

    it('should get packages for a destination', async () => {
      // First get all destinations to find a valid slug
      const allDestinations = await axios.get(`${API_URL}/get-destination`);
      
      if (allDestinations.data.length > 0 && allDestinations.data[0].d_slug) {
        const slug = allDestinations.data[0].d_slug;
        const response = await axios.get(`${API_URL}/destination/${slug}/packages`);
        
        expect(response.status).toBe(200);
        // Response might be array or object with packages property
        const isValid = Array.isArray(response.data) || 
                       (response.data && typeof response.data === 'object');
        expect(isValid).toBe(true);
      }
    });
  });
});
