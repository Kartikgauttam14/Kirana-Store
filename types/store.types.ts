export interface Store {
  id: string;
  ownerId: string;
  name: string;
  bannerImage?: string;
  gstNumber?: string;
  fssaiNumber?: string;
  phone?: string;
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  pincode: string;
  deliveryRadius: number;
  minOrderValue: number;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
  isActive: boolean;
  rating: number;
  totalRatings: number;
  createdAt: string;
  updatedAt: string;
  distance?: number;
}

export interface User {
  id: string;
  phone: string;
  name: string;
  role: "STORE_OWNER" | "CUSTOMER";
  language: string;
}
