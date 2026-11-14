// Tipos que reflejan los DTOs del backend (com.altairis.backoffice.*.dto)

export type UUID = string;
export type IsoDate = string; // "2026-11-14"

export interface Page<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ApiErrorBody {
  status: number;
  error: string;
  message: string;
  path: string;
  fieldErrors: Record<string, string>;
}

export interface Hotel {
  id: UUID;
  name: string;
  address: string;
  city: string;
  country: string;
  stars: number;
  description: string | null;
  createdAt: string;
}

export interface HotelInput {
  name: string;
  address: string;
  city: string;
  country: string;
  stars: number;
  description?: string;
}

export interface RoomType {
  id: UUID;
  hotelId: UUID;
  hotelName: string;
  name: string;
  description: string | null;
  capacity: number;
  basePrice: number;
}

export interface RoomTypeInput {
  name: string;
  description?: string;
  capacity: number;
  basePrice: number;
}

export interface InventoryDay {
  date: IsoDate;
  totalRooms: number;
  availableRooms: number;
  bookedRooms: number;
  price: number;
  occupancyPct: number;
}

export interface HotelInventory {
  hotelId: UUID;
  hotelName: string;
  from: IsoDate;
  to: IsoDate;
  roomTypes: { roomTypeId: UUID; name: string; days: InventoryDay[] }[];
}

export interface InventoryInput {
  from: IsoDate;
  to: IsoDate;
  totalRooms: number;
  price?: number;
}

export type ReservationStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

export interface Reservation {
  id: UUID;
  hotelId: UUID;
  hotelName: string;
  roomTypeId: UUID;
  roomTypeName: string;
  holderName: string;
  holderEmail: string;
  holderPhone: string | null;
  checkIn: IsoDate;
  checkOut: IsoDate;
  nights: number;
  roomsCount: number;
  status: ReservationStatus;
  totalPrice: number;
  createdAt: string;
}

export interface ReservationInput {
  roomTypeId: UUID;
  holderName: string;
  holderEmail: string;
  holderPhone?: string;
  checkIn: IsoDate;
  checkOut: IsoDate;
  roomsCount: number;
  status?: Exclude<ReservationStatus, "CANCELLED">;
}

export interface DashboardSummary {
  date: IsoDate;
  totalHotels: number;
  totalRoomTypes: number;
  arrivals: number;
  departures: number;
  inHouse: number;
  reservationsCreatedToday: number;
  roomsAvailable: number;
  roomsBooked: number;
  occupancyPct: number;
  revenueLast30Days: number;
  reservationsByStatus: Record<ReservationStatus, number>;
}

export interface OccupancyPoint {
  date: IsoDate;
  totalRooms: number;
  bookedRooms: number;
  occupancyPct: number;
  arrivals: number;
}
