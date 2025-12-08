interface User {
  id: number;
  name: string;
  phone: string;
  email?: string;
  role: "user" | "admin" | "delivery";
  image?: string;
  addresses?: Address[];
}

interface Address {
  id: number | string;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  street?: string;
  country: string;
  state: string;
  city: string;
  pinCode: string | number;
  geoLocation?: string;
}
interface NewAddressPayload {
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  street?: string;
  country: string;
  state: string;
  city: string;
  pinCode: string | number;
  geoLocation?: string;
}

interface RegisterPayload {
  name: string;
  phone: string;
  requestId?: string;
  deviceInfo?: string;
}

interface VerifyOtpPayload {
  phone: string;
  requestId: string;
  otp: string;
  deviceInfo: string;
}

export type {
  User,
  Address,
  RegisterPayload,
  VerifyOtpPayload,
  NewAddressPayload,
};
