import { User } from "firebase/auth";

export type navPages = "Home" | "Browse";
export type Provider = {
  id: number;
  provider: "google.com" | "facebook.com" | "apple.com";
  isLinked: boolean;
};
export type Emirates = {
  [emirate: string]: {
    districts: string[];
  };
};
export type DBuser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phoneNumber: string | null;
  preferredEmirate: string | null;
  preferredDistrict: string | null;
  emailSubscription: boolean;
  bookings?: Booking[];
};
export type Account = User & DBuser;

export type Partner = {
  id?: string;
  companyName: string;
  companyEmail: string;
  companyPhoneNumber: string;
  cardType: string;
  cardNumber: string;
  cardCVV: string;
  cardExpiry: string;
  cardHolder: string;
  about?: string;
  sports?: string[];
  contactInfo?: { type: string; value: string }[];
  socialMedia?: {
    instagram: string;
    facebook: string;
    twitter: string;
    linkedin: string;
    whatsapp: string;
  };
  profilePicture?: { url: string; thumbnailUrl: string | null };
  emailNotification?: boolean;
  billingDates?: { latestBilledAt: string; nextBillingAt: string };
  key: string;
  hashedPassword: string;
  listings: string[];
};

export type Listing = {
  numId: number;
  id: string;
  partnerId: string;
  name: string;
  description: string;
  location: string;
  sport: string;
  images: {
    url: string;
    thumbnailUrl: string;
  }[];
  categories?: string[];
  dates: ListDate[];
};

export type Booking = {
  id?: string;
  listingId: string;
  date: string;
  time: {
    startTime: string;
    endTime: string;
    price: number;
    status: "pending" | "confirmed" | "cancelled";
  };
};

export type TimingRange = {
  startTime: string;
  endTime: string;
  price: number;
  booking:
    | {
        userID: string;
        status: "pending" | "confirmed" | "cancelled";
        paymentOption?: "cash" | "card";
      }
    | {
        userID: string;
        status: "confirmed";
        paymentOption: "cash" | "card";
      }
    | {
        userID: null;
        status: null;
        paymentOption: null;
      };
};

export type pageUser = {
  user: User;
  isPartner: boolean;
  isAuth: boolean;
};

export type ListDate = {
  date: string;
  timings: TimingRange[];
};

export type ReceiptEmailProps = {
  listingUrl: string;
  recieptID: string;
  userName: string;
  listingLocation: string;
  listingDate: string;
  listingTime: string;
  listingPhone: string;
  listingEmail: string;
  listingPrice: string;
  listingBy: string;
  laebEmail: string;
  laebPhone: string;
  laebInstagram: string;
  laebFacebook: string;
  laebTwitter: string;
  partnerPage: string;
  paymentMethod: "card" | "cash";
};
