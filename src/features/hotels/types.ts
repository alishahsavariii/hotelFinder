export type CityId =
  | "kish"
  | "tehran"
  | "shiraz"
  | "isfahan"
  | "mashhad"
  | "rasht"
  | "qeshm";

export type Amenity = "breakfast" | "pool" | "parking" | "wifi" | "seaView" | "gym";

export type SortOption = "recommended" | "price-low" | "price-high" | "rating";

export interface HotelSearchCriteria {
  city: CityId | string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  adults: number;
  children: number;
}

export interface HotelFilters {
  minPrice: number | null;
  maxPrice: number | null;
  stars: number[];
  amenities: Amenity[];
  sort: SortOption;
}

export type HotelSearchRequest = HotelSearchCriteria & HotelFilters;

export interface HotelListing {
  id: string;
  city: CityId;
  name: string;
  location: string;
  image: string;
  imageAlt: string;
  stars: number;
  rating: number;
  reviewCount: number;
  basePrice: number;
  amenities: Amenity[];
  highlights: string[];
  availableRooms: number;
  maxGuestsPerRoom: number;
  recommendedOrder: number;
  badge?: string;
}

export interface HotelResult extends Omit<HotelListing, "basePrice" | "availableRooms" | "maxGuestsPerRoom" | "recommendedOrder"> {
  nightlyPrice: number;
  totalPrice: number;
}

export interface HotelSearchResponse {
  hotels: HotelResult[];
  total: number;
  nights: number;
  cityName: string;
  query: HotelSearchRequest;
}

export type SearchFieldErrors = Partial<
  Record<keyof HotelSearchCriteria | "minPrice" | "maxPrice" | "stars" | "amenities" | "sort", string>
>;
