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
  firstName: string;
  lastName: string;
  email: string | null;
  phoneNumber: string | null;
  preferredEmirate: string | null;
  preferredDistrict: string | null;
  emailSubscription: boolean;
};
export type Account = User & DBuser;

type Listing = {
  id?: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  sport: string;
  location: string;
  timings: string[];
  categories?: string[];
};

export type Partner = {
  id?: string;
  companyName: string;
  companyEmail: string;
  companyPhoneNumber: string;
  companyImage?: string;
  cardType: string;
  cardNumber: string;
  cardCVV: string;
  cardExpiry: string;
  cardHolder: string;
  about?: string;
  sports?: string[];
  contactInfo?: { type: string; value: string }[];
  listings?: Listing[];
  socialMedia?: {
    instagram: string;
    facebook: string;
    twitter: string;
    linkedin: string;
    whatsapp: string;
  };
  profilePicture?: { url: string; thumbnailUrl: string | null };
};
