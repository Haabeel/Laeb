import { FirebaseError } from "firebase/app";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import Cookies from "js-cookie";
import {
  AuthProvider,
  FacebookAuthProvider,
  GoogleAuthProvider,
  User,
  UserCredential,
  linkWithPopup,
  reauthenticateWithPopup,
  unlink,
} from "firebase/auth";
import { Provider } from "@/types";
import { toast } from "sonner";
import { link } from "fs";
import { auth } from "../../firebase.config";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function removeCookies() {
  Cookies.remove("isAuth");
  Cookies.remove("hasEmailVerified");
  Cookies.remove("hasPhoneVerified");
  Cookies.remove("isPartner");
}

export function setUpCookies(user: UserCredential, isPartner: boolean) {
  const hasEmailVerified = user.user.emailVerified;
  const hasPhoneVerified = user.user.phoneNumber;
  if (hasEmailVerified) Cookies.set("hasEmailVerified", "true");
  if (hasPhoneVerified) Cookies.set("hasPhoneVerified", "true");
  if (isPartner) Cookies.set("isPartner", "true");
  Cookies.set("isAuth", "true");
}

export const checkLinkedProviders = (
  setProviders: React.Dispatch<React.SetStateAction<Provider[]>>,
  user: User
) => {
  if (user) {
    const providers: Provider[] = [
      { id: 1, provider: "google.com", isLinked: false },
      { id: 2, provider: "facebook.com", isLinked: false },
      { id: 3, provider: "apple.com", isLinked: false },
    ];
    user.providerData.forEach((providerData) => {
      if (providerData.providerId === "google.com") {
        providers[0].isLinked = true;
      } else if (providerData.providerId === "facebook.com") {
        providers[1].isLinked = true;
      } else if (providerData.providerId === "apple.com") {
        providers[2].isLinked = true;
      }
    });

    setProviders(providers);
  }
};

export const handleLinkOrUnlink = async (
  providerId: string,
  isLinked: boolean,
  setProviders: React.Dispatch<React.SetStateAction<Provider[]>>,
  user: User
) => {
  const mUser = auth.currentUser;
  if (mUser) {
    try {
      if (!isLinked) {
        // Link the account
        let provider: AuthProvider;
        if (providerId === "google.com") {
          provider = new GoogleAuthProvider();
        } else if (providerId === "facebook.com") {
          provider = new FacebookAuthProvider();
        } else {
          // Handle other providers if needed
          return;
        }

        await linkWithPopup(mUser, provider)
          .then(() =>
            toast.success(`${providerId} account linked successfully.`)
          )
          .catch((error) => {
            console.log(error);
          });
      } else {
        // Unlink the account
        await unlink(mUser, providerId)
          .then((res) => {
            const providers = res?.providerData
              .filter(
                (provider) =>
                  !["phone", "password"].includes(provider.providerId)
              )
              .map((provider) => provider.providerId);
            if (providers) {
              setProviders((prev) =>
                prev.map((provider) => ({
                  ...provider,
                  isLinked: providers.includes(provider.provider),
                }))
              );
              toast.success(`${providerId} account unlinked successfully.`);
            }
          })
          .catch((error) => console.log(error));
      }
      // Update state
    } catch (error: any) {
      console.error(error);
      toast.error(
        `Error ${isLinked ? "unlinking" : "linking"} ${providerId} account:`,
        error
      );
      toast.error(formatLinkProviderError(error));
    } finally {
      setProviders((prevProviders) =>
        prevProviders.map((provider) => {
          if (provider.provider === providerId.split(".")[0]) {
            return { ...provider, isLinked: !isLinked };
          }
          return provider;
        })
      );
    }
  }
};

export const formatPhoneVerificationError = (error: FirebaseError): string => {
  let errorMessage =
    "An error occurred during phone verification. Please try again.";

  switch (error.code) {
    case "auth/invalid-phone-number":
      errorMessage = "Invalid phone number. Please enter a valid phone number.";
      break;
    case "auth/too-many-requests":
      errorMessage = "Too many requests. Please try again later.";
      break;
    case "auth/quota-exceeded":
      errorMessage = "Quota exceeded. Please try again later.";
      break;
    case "auth/missing-verification-code":
      errorMessage =
        "Missing verification code. Please enter the verification code.";
      break;
    case "auth/invalid-verification-code":
      errorMessage =
        "Invalid verification code. Please enter a valid verification code.";
      break;
    case "auth/code-expired":
      errorMessage =
        "Verification code has expired. Please request a new code.";
      break;
    case "auth/session-expired":
      errorMessage = "Session expired. Please try again.";
      break;
    case "auth/cancelled-popup-request":
      errorMessage = "Verification cancelled. Please try again.";
      break;
    case "auth/credential-already-in-use":
      errorMessage =
        "The credential is already in use. Please try a different one.";
      break;
    case "auth/provider-already-linked":
      errorMessage = "The provider is already linked to another account.";
      break;
    // Add more cases as needed
    default:
      // Use the default error message
      break;
  }

  return errorMessage;
};

function formatLinkProviderError(error: any): string {
  if (!error || !error.code) {
    return "An unknown error occurred while linking your account.";
  }

  switch (error.code) {
    case "auth/credential-already-in-use":
      return "The linked account is already associated with another user.";
    case "auth/invalid-credential":
      return "The provided credentials for linking are invalid.";
    case "auth/operation-not-allowed":
      return "Linking accounts with this provider is currently disabled.";
    case "auth/popup-closed-by-user":
      return "You cancelled the linking process.";
    case "auth/network-request-failed":
      return "A network error occurred while linking your account. Please check your internet connection and try again.";
    case "auth/user-mismatch":
      return "You must be signed in with the correct account to link this provider.";
    default:
      // Handle other potential errors (optional)
      return `An error occurred while linking your account (code: ${error.code}).`;
  }
}

interface Word {
  text: string;
  className?: string;
}

export function stringToWordsArray(
  inputString: string,
  position: number,
  className: string
): Word[] {
  const words: string[] = inputString.split(" ");
  return words.map((word, index) => ({
    text: word,
    className:
      index === position && position < words.length ? className : undefined,
  }));
}

export function validateCreditCard(cardNumber: string): string | boolean {
  // Remove spaces and dashes from the card number
  cardNumber = cardNumber.replace(/ /g, "").replace(/-/g, "");

  // Check if the card number contains only digits and has a valid length
  if (!/^\d{16}$/.test(cardNumber)) {
    return false;
  }

  // Luhn algorithm validation
  let total = 0;
  for (let i = 0; i < 16; i++) {
    let digit = parseInt(cardNumber[i]);
    if (i % 2 === 0) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    total += digit;
  }
  if (total % 10 !== 0) {
    return false;
  }

  // Check card type based on the first few digits (Issuer Identification Number or IIN)
  const iin = parseInt(cardNumber.substring(0, 6));
  if (400000 <= iin && iin <= 499999) {
    // Visa
    return "Visa";
  } else if (510000 <= iin && iin <= 559999) {
    // Mastercard
    return "Mastercard";
  } else if (
    (340000 <= iin && iin <= 349999) ||
    (370000 <= iin && iin <= 379999)
  ) {
    // American Express
    return "American Express";
  } else if (
    (30000 <= iin && iin <= 30599) ||
    (36000 <= iin && iin <= 36999) ||
    (38000 <= iin && iin <= 38999)
  ) {
    // Diners Club
    return "Diners Club";
  } else if (352800 <= iin && iin <= 358999) {
    // JCB
    return "JCB";
  } else if (620000 <= iin && iin <= 629999) {
    // UnionPay
    return "UnionPay";
  } else if (650000 <= iin && iin <= 659999) {
    // Discover
    return "Discover";
  } else {
    return "Unknown";
  }
}
export function validateCreditCardDetails(
  cardNumber: string,
  expiryDate: string,
  cvv: string
): boolean | { cardType: string; isValid: boolean } {
  // Validate card number
  if (!validateCreditCard(cardNumber)) {
    return false;
  }

  // Validate expiry date
  const currentDate = new Date();
  const [expiryMonth, expiryYear] = expiryDate.split("/");
  const expiry = new Date(
    parseInt("20" + expiryYear),
    parseInt(expiryMonth) - 1,
    1
  );
  if (expiry <= currentDate) {
    console.log("Card has expired");
    return false;
  }

  // Validate CVV
  if (!/^\d{3,4}$/.test(cvv)) {
    console.log("Invalid CVV");
    return false;
  }

  return { cardType: validateCreditCard(cardNumber) as string, isValid: true };
}
