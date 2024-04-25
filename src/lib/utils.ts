import bcrypt from "bcryptjs";
import { FirebaseError } from "firebase/app";
import { type ClassValue, clsx } from "clsx";
import { addDays, format, isAfter } from "date-fns";
import { twMerge } from "tailwind-merge";
import Cookies from "js-cookie";
import crypto from "crypto";
import {
  AuthProvider,
  FacebookAuthProvider,
  GoogleAuthProvider,
  User,
  UserCredential,
  linkWithPopup,
  reauthenticateWithPopup,
  signInWithPopup,
  unlink,
} from "firebase/auth";
import { ListDate, Listing, Provider, TimingRange } from "@/types";
import { toast } from "sonner";
import { link } from "fs";
import { auth, db } from "../../firebase.config";
import { DateRange } from "react-day-picker";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
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
    ];
    user.providerData.forEach((providerData) => {
      if (providerData.providerId === "google.com") {
        providers[0].isLinked = true;
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
    //return false;
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
    //return false;
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
export const calculateNextBillingDate = (latestBilledAt: Date): Date => {
  const nextBillingDate = new Date(latestBilledAt);
  nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
  return nextBillingDate;
};
export function getOrdinalDay(day: number): string {
  if (day >= 11 && day <= 13) {
    return day + "th";
  }
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

export function formatDate(date: Date): string {
  const day = date.getDate();
  const month = getMonthName(date.getMonth());
  const year = date.getFullYear();

  return `${getOrdinalDay(day)} ${month} ${year}`;
}

function getMonthName(month: number): string {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return months[month];
}

export function hashKey(password: string, SALT_LENGTH: number): string {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const hash = crypto.createHash("sha256");
  hash.update(password + salt); // Add salt to the password before hashing
  const hashedPassword = hash.digest("hex");
  return hashedPassword.substring(0, 32); // Truncate the hash to match AES-256 key length
}

export function encrypt(text: string, key: string): string {
  const algorithm = "aes-256-cbc"; // AES encryption algorithm
  const ivLength = 16; // Initialization vector length (required for AES)
  const iv = crypto.randomBytes(ivLength); // Generate a random initialization vector
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + encrypted; // Return IV + encrypted data
}

export function decrypt(text: string, key: string): string {
  const algorithm = "aes-256-cbc"; // AES encryption algorithm
  const ivLength = 16; // Initialization vector length (required for AES)
  const iv = Buffer.from(text.slice(0, ivLength * 2), "hex"); // Extract IV from the encrypted text
  const encryptedText = text.slice(ivLength * 2); // Extract encrypted data
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export const hashPassword = (password: string) => {
  return bcrypt.hash(password, 10);
};
export const compareHash = (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
};

export const getMaxMinPrice = (timings: TimingRange[]) => {
  let maxPrice = 0;
  let minPrice = Infinity;
  timings.forEach((timing) => {
    if (timing.price > maxPrice) {
      maxPrice = timing.price;
    }
    if (timing.price < minPrice) {
      minPrice = timing.price;
    }
  });
  return { maxPrice, minPrice };
};

export const getDuration = (startTime: string, endTime: string): string => {
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  const startTotalMinutes = startHour * 60 + startMinute;
  const endTotalMinutes = endHour * 60 + endMinute;

  const durationInMinutes = endTotalMinutes - startTotalMinutes;

  if (durationInMinutes < 60) {
    return `${durationInMinutes} minutes`;
  } else {
    const durationInHours = durationInMinutes / 60;
    return `${durationInHours} hours`;
  }
};

export const haveSameDate = (
  currentDate: Date,
  dateToBeComparedTo: { date: string; userID: string }[]
) => {
  // Convert currentDate to a string in the format 'YYYY-MM-DD'
  const currentDateStr = currentDate.toISOString().split("T")[0];

  // Check if any date in dateToBeComparedTo matches the currentDate
  return dateToBeComparedTo.some(
    ({ date }) => date.split("T")[0] === currentDateStr
  );
};

export const CompareDates = (date1: Date, date2: Date) =>
  date1.getFullYear() === date2.getFullYear() &&
  date1.getMonth() === date2.getMonth() &&
  date1.getDate() === date2.getDate();

export const generateListDates = (
  dateRange: DateRange,
  timings: TimingRange[]
): ListDate[] => {
  if (!dateRange.from || !dateRange.to) {
    return [];
  }

  const generateListDatesRecursive = (
    currentDate: Date,
    endDate: Date,
    list: ListDate[]
  ): ListDate[] => {
    if (isAfter(currentDate, endDate)) {
      return list;
    }

    const formattedDate = format(currentDate, "yyyy-MM-dd");
    const listDate: ListDate = {
      date: formattedDate,
      timings: timings.map((timing) => ({
        startTime: timing.startTime,
        endTime: timing.endTime,
        price: timing.price,
        booking: timing.booking,
      })),
    };

    return generateListDatesRecursive(addDays(currentDate, 1), endDate, [
      ...list,
      listDate,
    ]);
  };

  return generateListDatesRecursive(dateRange.from, dateRange.to, []);
};

export const getPriceRange = (dates: ListDate[]): string => {
  // Extract all prices from the ListDate array
  const prices: number[] = dates.reduce((acc: number[], curr: ListDate) => {
    curr.timings.forEach((timing: TimingRange) => {
      acc.push(timing.price);
    });
    return acc;
  }, []);

  // Calculate min and max prices
  const minPrice: number = Math.min(...prices);
  const maxPrice: number = Math.max(...prices);

  // Return formatted string
  if (minPrice === maxPrice) return `AED ${minPrice}`;
  return `AED ${minPrice} - AED ${maxPrice}`;
};

export const handleGoogleSignIn = async (router: AppRouterInstance) => {
  try {
    const provider = new GoogleAuthProvider();
    const signInResult = await signInWithPopup(auth, provider);

    if (signInResult.user) {
      const user = signInResult.user;
      const userId = user.uid;

      const userDocRef = doc(db, "users", userId);
      const userDocSnapshot = await getDoc(userDocRef);

      if (userDocSnapshot.exists()) {
        // User document exists, proceed with sign in
        setUpCookies(signInResult, false);
        router.push("/dashboard");
      } else {
        const docRef = doc(db, "partners", userId);
        const docSnapshot = await getDoc(docRef);
        if (docSnapshot.exists()) {
          setUpCookies(signInResult, true);
          router.push("/partner/dashboard");
        } else {
          const userData = {
            firstName: user.displayName?.split(" ")[0] || "",
            lastName: user.displayName?.split(" ")[1] || "",
            email: user.email || "",
            phoneNumber: null,
            emailSubscription: false,
            preferredEmirate: null,
            preferredDistrict: null,
          };

          await setDoc(userDocRef, userData);

          setUpCookies(signInResult, false);
          router.push("/dashboard");
        }
        // User document doesn't exist, create a new one
      }
    } else {
      // Handle error if user is null
      console.error("User is null");
      toast.error("Sign in failed. Please try again.");
    }
  } catch (error: any) {
    console.error(error);
    toast.error(error.message || "An error occurred. Please try again.");
  }
};

export const handleEditListingButton = async (
  listings: Listing[] | null,
  selectedListing: Listing | null,
  date: DateRange | undefined,
  timingRanges: TimingRange[],
  setSelectedListing: React.Dispatch<React.SetStateAction<Listing | null>>,
  categories: string[],
  setListings: React.Dispatch<React.SetStateAction<Listing[] | null>>
) => {
  if (listings === null) return;
  if (selectedListing) {
    if (!date || !date.from) return toast.error("Please select a date range");
    toast.loading("Updating the listing...");
    const dates = generateListDates(date, timingRanges);
    setSelectedListing({
      ...selectedListing,
      categories,
      dates,
    });
    const docRef = doc(db, "listings", selectedListing.id as string);
    try {
      await updateDoc(docRef, selectedListing);
      const updatedListings = listings.map((listing) => {
        if (listing.id === selectedListing.id) {
          return selectedListing;
        }
        return listing;
      });
      setListings(updatedListings);
      toast.success("Listing updated successfully");
      setSelectedListing(null);
    } catch {
      toast.error("Failed to update listing");
    } finally {
      toast.dismiss();
    }
  }
};
