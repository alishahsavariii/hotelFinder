import Image from "next/image";
import { CarFront, Check, Coffee, Dumbbell, MapPin, Star, Waves, Wifi } from "lucide-react";
import { getAmenityLabel } from "../constants";
import { formatNumber } from "../date";
import type { Amenity, HotelResult } from "../types";

function AmenityIcon({ amenity }: { amenity: Amenity }) {
  switch (amenity) {
    case "breakfast": return <Coffee size={15} />;
    case "pool": return <Waves size={15} />;
    case "parking": return <CarFront size={15} />;
    case "wifi": return <Wifi size={15} />;
    case "gym": return <Dumbbell size={15} />;
    default: return <Waves size={15} />;
  }
}

export function HotelCard({ hotel, nights, rooms }: { hotel: HotelResult; nights: number; rooms: number }) {
  const ratingLabel = hotel.rating >= 9 ? "فوق‌العاده" : hotel.rating >= 8.5 ? "عالی" : "خیلی خوب";
  return (
    <article className="hotel-card">
      <div className="hotel-image-wrap">
        <Image src={hotel.image} alt={hotel.imageAlt} fill sizes="(max-width: 700px) 100vw, (max-width: 1100px) 220px, 250px" className="hotel-image" />
        {hotel.badge && <span className="hotel-image-badge"><Star size={13} fill="currentColor" /> {hotel.badge}</span>}
      </div>
      <div className="hotel-info">
        <div className="hotel-star-row"><span className="hotel-category">هتل {formatNumber(hotel.stars)} ستاره</span><span className="hotel-stars" aria-label={`${formatNumber(hotel.stars)} ستاره`}>{Array.from({ length: hotel.stars }, (_, index) => <Star key={index} size={13} fill="currentColor" strokeWidth={1.4} />)}</span></div>
        <h3>{hotel.name}</h3>
        <p className="hotel-location"><MapPin size={15} strokeWidth={1.8} /> {hotel.location}</p>
        <div className="hotel-highlights">{hotel.highlights.slice(0, 2).map((highlight) => <span key={highlight}><Check size={14} /> {highlight}</span>)}</div>
        <div className="hotel-amenities">{hotel.amenities.slice(0, 3).map((amenity) => <span key={amenity}><AmenityIcon amenity={amenity} />{getAmenityLabel(amenity)}</span>)}{hotel.amenities.length > 3 && <span className="more-amenities">+{formatNumber(hotel.amenities.length - 3)} امکان دیگر</span>}</div>
      </div>
      <div className="hotel-price-panel">
        <div className="hotel-rating"><span className="rating-number">{formatNumber(hotel.rating)}</span><span><strong>{ratingLabel}</strong><small>{formatNumber(hotel.reviewCount)} نظر</small></span></div>
        <div className="hotel-price"><span className="price-caption">قیمت هر شب، هر اتاق</span><div className="price-amount"><strong>{formatNumber(hotel.nightlyPrice)}</strong><span>تومان</span></div><p>مجموع {formatNumber(nights)} شب، {formatNumber(rooms)} اتاق: <b>{formatNumber(hotel.totalPrice)}</b> تومان</p></div>
      </div>
    </article>
  );
}
