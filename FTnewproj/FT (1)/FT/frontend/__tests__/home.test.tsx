import { render, screen } from '@testing-library/react'
import Home from '@/app/page'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

// Mock react-intersection-observer
jest.mock('react-intersection-observer', () => ({
  useInView: () => [jest.fn(), true],
}))

// Mock all components
jest.mock('@/components/HeroSection', () => {
  return function HeroSection() {
    return <div data-testid="hero-section">Hero Section</div>
  }
})

jest.mock('@/components/HotDealsSection', () => {
  return function HotDealsSection() {
    return <div data-testid="hot-deals-section">Hot Deals Section</div>
  }
})

jest.mock('@/components/WhyBookSection', () => {
  return function WhyBookSection() {
    return <div data-testid="why-book-section">Why Book Section</div>
  }
})

jest.mock('@/components/BudgetCard', () => {
  return function BudgetCard() {
    return <div data-testid="budget-card">Budget Card</div>
  }
})

jest.mock('@/components/PersonalizedItinerariesSection', () => {
  return function PersonalizedItinerariesSection() {
    return <div data-testid="personalized-section">Personalized Section</div>
  }
})

jest.mock('@/components/FeaturedInSection', () => {
  return function FeaturedInSection() {
    return <div data-testid="featured-section">Featured Section</div>
  }
})

jest.mock('@/components/AdventureTravelSection', () => {
  return function AdventureTravelSection() {
    return <div data-testid="adventure-section">Adventure Section</div>
  }
})

jest.mock('@/components/ServicesSection', () => {
  return function ServicesSection() {
    return <div data-testid="services-section">Services Section</div>
  }
})

jest.mock('@/components/MagazineSection', () => {
  return function MagazineSection() {
    return <div data-testid="magazine-section">Magazine Section</div>
  }
})

jest.mock('@/components/NewsletterSection', () => {
  return function NewsletterSection() {
    return <div data-testid="newsletter-section">Newsletter Section</div>
  }
})

jest.mock('@/components/Footer', () => {
  return function Footer() {
    return <div data-testid="footer">Footer</div>
  }
})

jest.mock('@/components/TravelInspirationSection', () => {
  return function TravelInspirationSection() {
    return <div data-testid="travel-inspiration-section">Travel Inspiration</div>
  }
})

describe('Home Page', () => {
  it('renders without crashing', () => {
    render(<Home />)
    expect(screen.getByTestId('hero-section')).toBeInTheDocument()
  })

  it('renders all main sections', () => {
    render(<Home />)
    
    expect(screen.getByTestId('hero-section')).toBeInTheDocument()
    expect(screen.getByTestId('hot-deals-section')).toBeInTheDocument()
    expect(screen.getByTestId('why-book-section')).toBeInTheDocument()
    expect(screen.getByTestId('budget-card')).toBeInTheDocument()
    expect(screen.getByTestId('personalized-section')).toBeInTheDocument()
    expect(screen.getByTestId('featured-section')).toBeInTheDocument()
    expect(screen.getByTestId('adventure-section')).toBeInTheDocument()
    expect(screen.getByTestId('services-section')).toBeInTheDocument()
    expect(screen.getByTestId('magazine-section')).toBeInTheDocument()
    expect(screen.getByTestId('newsletter-section')).toBeInTheDocument()
    expect(screen.getByTestId('footer')).toBeInTheDocument()
  })

  it('has correct main element structure', () => {
    const { container } = render(<Home />)
    const main = container.querySelector('main')
    expect(main).toHaveClass('min-h-screen')
  })
})
