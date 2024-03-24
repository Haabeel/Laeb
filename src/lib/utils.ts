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
  reauthenticateWithPopup,
  unlink,
} from "firebase/auth";
import { Provider } from "@/types";
import { toast } from "sonner";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function removeCookies() {
  Cookies.remove("isAuth");
  Cookies.remove("hasEmailVerified");
  Cookies.remove("hasPhoneVerified");
}

export function setUpCookies(user: UserCredential) {
  Cookies.set("isAuth", "true");
  const hasEmailVerified = user.user.emailVerified;
  const hasPhoneVerified = user.user.phoneNumber;
  if (hasEmailVerified) Cookies.set("hasEmailVerified", "true");
  if (hasPhoneVerified) Cookies.set("hasPhoneVerified", "true");
}

export const checkLinkedProviders = (
  setProviders: React.Dispatch<React.SetStateAction<Provider[]>>,
  user: User
) => {
  if (user) {
    const providers: Provider[] = [
      { id: 1, provider: "Google", isLinked: false },
      { id: 2, provider: "Facebook", isLinked: false },
      { id: 3, provider: "Apple ID", isLinked: false },
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
  if (user) {
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

        await reauthenticateWithPopup(user, provider);
        toast.success(`${providerId} account linked successfully.`);
      } else {
        // Unlink the account
        await unlink(user, providerId);
        toast.success(`${providerId} account unlinked successfully.`);
      }
      // Update state
    } catch (error: any) {
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
