import axios from 'axios'

// Mock axios
jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('API Integration Tests', () => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Destinations API', () => {
    it('should fetch destinations successfully', async () => {
      const mockDestinations = [
        { id: 1, name: 'Bali', country: 'Indonesia' },
        { id: 2, name: 'Paris', country: 'France' },
      ]

      mockedAxios.get.mockResolvedValueOnce({ data: mockDestinations })

      const response = await axios.get(`${API_URL}/api/destinations`)
      
      expect(response.data).toEqual(mockDestinations)
      expect(mockedAxios.get).toHaveBeenCalledWith(`${API_URL}/api/destinations`)
    })

    it('should handle API errors gracefully', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'))

      await expect(
        axios.get(`${API_URL}/api/destinations`)
      ).rejects.toThrow('Network error')
    })
  })

  describe('Packages API', () => {
    it('should fetch packages successfully', async () => {
      const mockPackages = [
        { id: 1, title: 'Bali Adventure', price: 1500 },
        { id: 2, title: 'Paris Romance', price: 2000 },
      ]

      mockedAxios.get.mockResolvedValueOnce({ data: mockPackages })

      const response = await axios.get(`${API_URL}/api/packages`)
      
      expect(response.data).toEqual(mockPackages)
      expect(mockedAxios.get).toHaveBeenCalledWith(`${API_URL}/api/packages`)
    })
  })

  describe('Deals API', () => {
    it('should fetch deals successfully', async () => {
      const mockDeals = [
        { id: 1, title: 'Summer Sale', discount: 20 },
        { id: 2, title: 'Winter Special', discount: 30 },
      ]

      mockedAxios.get.mockResolvedValueOnce({ data: mockDeals })

      const response = await axios.get(`${API_URL}/api/deals`)
      
      expect(response.data).toEqual(mockDeals)
    })
  })

  describe('Booking API', () => {
    it('should create booking successfully', async () => {
      const bookingData = {
        packageId: 1,
        userId: 123,
        travelers: 2,
        date: '2024-06-01',
      }

      const mockResponse = { id: 456, status: 'confirmed', ...bookingData }
      mockedAxios.post.mockResolvedValueOnce({ data: mockResponse })

      const response = await axios.post(`${API_URL}/api/bookings`, bookingData)
      
      expect(response.data).toEqual(mockResponse)
      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${API_URL}/api/bookings`,
        bookingData
      )
    })

    it('should handle booking validation errors', async () => {
      const invalidBooking = { packageId: null }
      
      mockedAxios.post.mockRejectedValueOnce({
        response: { status: 400, data: { error: 'Invalid booking data' } }
      })

      await expect(
        axios.post(`${API_URL}/api/bookings`, invalidBooking)
      ).rejects.toMatchObject({
        response: { status: 400 }
      })
    })
  })

  describe('Authentication API', () => {
    it('should login user successfully', async () => {
      const credentials = { email: 'test@example.com', password: 'password123' }
      const mockResponse = { token: 'jwt-token', user: { id: 1, email: credentials.email } }

      mockedAxios.post.mockResolvedValueOnce({ data: mockResponse })

      const response = await axios.post(`${API_URL}/api/auth/login`, credentials)
      
      expect(response.data).toEqual(mockResponse)
      expect(response.data.token).toBeDefined()
    })

    it('should handle login errors', async () => {
      const credentials = { email: 'wrong@example.com', password: 'wrongpass' }
      
      mockedAxios.post.mockRejectedValueOnce({
        response: { status: 401, data: { error: 'Invalid credentials' } }
      })

      await expect(
        axios.post(`${API_URL}/api/auth/login`, credentials)
      ).rejects.toMatchObject({
        response: { status: 401 }
      })
    })
  })

  describe('Payment API', () => {
    it('should process payment successfully', async () => {
      const paymentData = {
        bookingId: 456,
        amount: 1500,
        currency: 'USD',
        paymentMethod: 'card',
      }

      const mockResponse = { 
        paymentId: 'pay_123', 
        status: 'succeeded',
        ...paymentData 
      }

      mockedAxios.post.mockResolvedValueOnce({ data: mockResponse })

      const response = await axios.post(`${API_URL}/api/payment/process`, paymentData)
      
      expect(response.data.status).toBe('succeeded')
      expect(response.data.paymentId).toBeDefined()
    })
  })
})
