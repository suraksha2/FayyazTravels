// Simple API utility for FTUi to connect to FT-backend
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3003';

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    },
    // credentials: 'include', // Uncomment if you need cookies
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}

// Packages API
export interface Package {
  id: number;
  p_name: string;
  p_slug: string;
  day_night: string;
  feature_img: string;
  p_content: string;
  package_currency: string;
  desti_list?: string;
  inclusions: string;
  exclusions: string;
  is_publish: number;
  status: number;
  slug: string;
  // Legacy fields for backward compatibility
  title?: string;
  destination?: string;
  category?: string;
  price?: number;
  days?: number;
  cities?: number;
  isHalalFriendly?: boolean;
  seatsLeft?: number;
  description?: string;
  image?: string;
  savings?: number;
  isTopSelling?: boolean;
}

export interface PackageFilters {
  destination?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

export async function getPackages(filters?: PackageFilters): Promise<Package[]> {
  const queryParams = new URLSearchParams();
  
  if (filters) {
    if (filters.destination) queryParams.append('destination', filters.destination);
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.minPrice) queryParams.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice.toString());
  }
  
  const queryString = queryParams.toString();
  const url = `/packages${queryString ? `?${queryString}` : ''}`;
  
  return apiFetch(url);
}

export async function getPackageCategories(): Promise<string[]> {
  return apiFetch('/packages/categories');
}

export async function getPackageDestinations(): Promise<string[]> {
  return apiFetch('/packages/destinations');
}

// Destinations API
export interface Destination {
  id: string;
  name: string;
  description: string;
  image: string;
  region: string;
  subDestinations?: Destination[];
}

export async function getDestinations(): Promise<Destination[]> {
  return apiFetch('/destinations');
}

export async function getDestinationById(id: string): Promise<Destination> {
  return apiFetch(`/destinations/${id}`);
}

export async function getDestinationCountries(): Promise<string[]> {
  return apiFetch('/destinations/countries');
}

// Special category destinations
export interface MultiCityDestination {
  name: string;
  slug: string;
}

export async function getMultiCityDestinations(): Promise<string[]> {
  // Use the dedicated endpoint for multi-city destinations
  return apiFetch('/packages/multi-city');
}

// Get a specific package by ID
export async function getPackageById(id: number | string): Promise<Package> {
  try {
    // First try with the path parameter endpoint
    return await apiFetch(`/packages/${id}`);
  } catch (error) {
    console.log(`Failed to fetch package with ID ${id} using path parameter, trying fallback...`);
    
    try {
      // If that fails, fall back to getting all packages and filtering
      const allPackages = await apiFetch('/packages');
      
      // Try to find the package by ID
      const pkg = allPackages.find((p: Package) => p.id === Number(id));
      
      if (pkg) {
        console.log(`Found package with ID ${id} in all packages list`);
        return pkg;
      }
      
      // If still not found, use the first package as a fallback
      console.log(`Package with ID ${id} not found, using fallback package`);
      return allPackages[0]; // Return the first package as a fallback
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      
      // Create a minimal package as a last resort to prevent UI crashes
      return {
        id: Number(id),
        p_name: "Package Unavailable",
        p_slug: "package-unavailable",
        day_night: "0D | 0N",
        feature_img: "/api/placeholder/400/300",
        p_content: "This package is currently unavailable.",
        package_currency: "SGD",
        desti_list: "Unknown",
        inclusions: "",
        exclusions: "",
        is_publish: 0,
        status: 0,
        slug: "package-unavailable",
        // Legacy fields for backward compatibility
        title: "Package Unavailable",
        destination: "Unknown",
        category: "Other",
        price: 0,
        days: 0,
        cities: 0,
        isHalalFriendly: false,
        seatsLeft: 0,
        description: "This package is currently unavailable.",
        image: "/api/placeholder/400/300",
        savings: 0,
        isTopSelling: false,
      };
    }
  }
}

// Enhanced package interface for booking with additional fields
export interface BookingPackage extends Package {
  booking_start_date?: string;
  booking_end_date?: string;
  disabled_dates?: string[];
  is_bookable?: boolean;
  currency?: string;
  booking_range?: string;
  disable_date?: string;
  // Additional fields from database
  itinerary_pdf?: string;
  // Price fields from tbl_price
  min_price?: number | null;
  max_price?: number | null;
  sale_price?: number | null;
  display_price?: number | null;
  savings?: number;
}

// Get package details specifically for booking (includes booking-related fields)
export async function getPackageForBooking(id: number | string): Promise<BookingPackage> {
  try {
    // Use the enhanced booking endpoint
    return await apiFetch(`/packages/booking/${id}`);
  } catch (error) {
    console.log(`Failed to fetch booking package with ID ${id}, falling back to regular package...`);
    
    // Fall back to regular package endpoint
    const regularPackage = await getPackageById(id);
    
    // Convert to booking package format
    return {
      ...regularPackage,
      booking_start_date: undefined,
      booking_end_date: undefined,
      disabled_dates: [],
      is_bookable: true,
      currency: regularPackage.package_currency || 'SGD'
    };
  }
}
