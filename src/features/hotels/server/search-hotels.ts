import "server-only";
import { getCityName } from "../constants";
import { nightsBetween } from "../date";
import type { HotelResult, HotelSearchRequest, HotelSearchResponse } from "../types";
import { HOTEL_CATALOG } from "./catalog";

export function searchHotels(request: HotelSearchRequest): HotelSearchResponse {
  const nights = nightsBetween(request.checkIn, request.checkOut);
  const month = Number(request.checkIn.slice(5, 7));
  const seasonalMultiplier = [3, 4, 8, 12].includes(month) ? 1.12 : 1;
  const guests = request.adults + request.children;

  const hotels = HOTEL_CATALOG.filter(
    (hotel) =>
      hotel.city === request.city &&
      hotel.availableRooms >= request.rooms &&
      guests <= hotel.maxGuestsPerRoom * request.rooms,
  )
    .map((hotel) => {
      const nightlyPrice = Math.round((hotel.basePrice * seasonalMultiplier) / 10_000) * 10_000;
      const result: HotelResult & { recommendedOrder: number } = {
        id: hotel.id,
        city: hotel.city,
        name: hotel.name,
        location: hotel.location,
        image: hotel.image,
        imageAlt: hotel.imageAlt,
        stars: hotel.stars,
        rating: hotel.rating,
        reviewCount: hotel.reviewCount,
        amenities: hotel.amenities,
        highlights: hotel.highlights,
        badge: hotel.badge,
        nightlyPrice,
        totalPrice: nightlyPrice * request.rooms * nights,
        recommendedOrder: hotel.recommendedOrder,
      };
      return result;
    })
    .filter(
      (hotel) =>
        (request.minPrice === null || hotel.nightlyPrice >= request.minPrice) &&
        (request.maxPrice === null || hotel.nightlyPrice <= request.maxPrice) &&
        (request.stars.length === 0 || request.stars.includes(hotel.stars)) &&
        request.amenities.every((amenity) => hotel.amenities.includes(amenity)),
    );

  hotels.sort((a, b) => {
    switch (request.sort) {
      case "price-low":
        return a.nightlyPrice - b.nightlyPrice || a.recommendedOrder - b.recommendedOrder;
      case "price-high":
        return b.nightlyPrice - a.nightlyPrice || a.recommendedOrder - b.recommendedOrder;
      case "rating":
        return b.rating - a.rating || a.recommendedOrder - b.recommendedOrder;
      default:
        return a.recommendedOrder - b.recommendedOrder;
    }
  });

  const results: HotelResult[] = hotels.map(({ recommendedOrder: _recommendedOrder, ...hotel }) => hotel);
  return {
    hotels: results,
    total: results.length,
    nights,
    cityName: getCityName(request.city),
    query: request,
  };
}
