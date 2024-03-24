import { User } from "firebase/auth";

export type navPages = "Home" | "Browse";
export type Provider = {
  id: number;
  provider: "Google" | "Facebook" | "Apple ID";
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
