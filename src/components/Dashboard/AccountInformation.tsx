import {
  User,
  onAuthStateChanged,
  signOut,
  updateProfile,
} from "firebase/auth";
import React, { ReactNode, useEffect, useState } from "react";
import { auth, db } from "../../../firebase.config";
import { MdEdit } from "react-icons/md";
import { IoIosCloseCircle } from "react-icons/io";
import AccountInformationInput from "../shared/AccountInformationInput";
import DashboardNav from "./DashboardNav";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { removeCookies } from "@/lib/utils";
import { Toaster, toast } from "sonner";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { AiOutlineLoading } from "react-icons/ai";
import { Booking, DBuser, Listing, Partner } from "@/types";
import { format } from "date-fns";
import { FaLocationDot } from "react-icons/fa6";
import { BsCalendar, BsClock, BsPhone } from "react-icons/bs";
import Image from "next/image";
import Link from "next/link";
import Settings from "./Settings";

const bookingsTab = ["Upcoming Bookings", "Past Bookings"];
const AccountInformation = () => {
  const [user, setUser] = useState<User | null>(null);
  const [DBuser, setDBuser] = useState<DBuser | null>(null);
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const updateUserProfile = async () => {
    if (firstName.length < 3) {
      return toast.error("First name should be more than 3 characters", {
        duration: 1500,
      });
    }
    updateProfile(user!!, { displayName: firstName + " " + lastName })
      .then(async () => {
        setIsLoading(true);
        setUser((prevUser) => {
          if (prevUser) {
            return {
              ...prevUser,
              displayName: firstName + " " + lastName,
            };
          }
          return prevUser;
        });
        const userDocRef = doc(db, "users", user!!.uid);
        try {
          await updateDoc(userDocRef, {
            firstName: firstName,
            lastName: lastName,
          }).then(() => {
            toast.success("Profile updated successfully.");
            setIsLoading(false);
          });
        } catch (error: any) {
          toast.error("Something went wrong");
        }
        setNeedsUpdate(false);
      })
      .catch((error: any) => toast.error("Something went wrong"));
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (mUser) => {
      if (mUser) {
        setUser(mUser);
        if (mUser.displayName) {
          setFirstName(mUser.displayName.split(" ")[0]);
          setLastName(mUser.displayName.split(" ")[1]);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as DBuser;
            setDBuser(data);
          }
        } catch (error: any) {
          console.log("Error getting document:", error);
          toast.error("Something went wrong");
        }
      }
    };
    fetchUserData();
  }, [user]);

  return (
    <main className="flex justify-center items-start w-full h-full gap-20 relative shadow-[inset_-10px_-10px_30px_4px_rgba(0,0,0,0.1),_10px_10px_30px_4px_rgba(255,255,255,0.15)] py-10">
      <section className="flex flex-col gap-5 justify-center items-center">
        <H2>Your Profile</H2>
        <section className="flex gap-4 w-full justify-between items-center">
          <label htmlFor="FirstName" className="text-white text-xl text-medium">
            First Name
          </label>
          <AccountInformationInput
            id="firstName"
            fieldName="firstName"
            user={user}
            editable
            setData={setFirstName}
            setNeedsUpdate={setNeedsUpdate}
          />
        </section>
        <section className="flex gap-4 w-full justify-between items-center">
          <label htmlFor="LastName" className="text-white text-xl text-medium">
            Last Name
          </label>
          <AccountInformationInput
            id="lastName"
            fieldName="lastName"
            user={user!!}
            editable
            setData={setLastName}
            setNeedsUpdate={setNeedsUpdate}
          />
        </section>
        <section className="flex gap-4 justify-between w-full items-center">
          <label htmlFor="email" className="text-white text-xl text-medium">
            Email
          </label>
          <AccountInformationInput
            id="email"
            fieldName="email"
            user={user!!}
            setNeedsUpdate={setNeedsUpdate}
          />
        </section>
        <section className="flex gap-4 justify-between w-full items-center">
          <label
            htmlFor="phoneNumber"
            className="text-white text-xl text-medium"
          >
            Phone Number
          </label>
          <AccountInformationInput
            id="phoneNumber"
            fieldName="phoneNumber"
            user={user!!}
            setNeedsUpdate={setNeedsUpdate}
          />
        </section>
        {needsUpdate && (
          <button
            className={`px-3 py-2 rounded-md bg-lightAccent text-darkPrimary flex justify-center items-center gap-2 w-full`}
            onClick={() => updateUserProfile()}
          >
            {!isLoading ? (
              "Update Profile"
            ) : (
              <>
                <p>Updating...</p>
                <AiOutlineLoading className="animate-spin" />
              </>
            )}
          </button>
        )}
        <Settings />
      </section>
      <Bookings bookings={DBuser?.bookings} />
      <Toaster className="fixed" richColors />
    </main>
  );
};
const H2 = ({ children }: { children: ReactNode }) => {
  return (
    <h2 className={`font-bold text-4xl text-lightPrimary mb-5`}>{children}</h2>
  );
};

const Bookings = ({ bookings }: { bookings: Booking[] | undefined }) => {
  const [bookingTab, setBooktingTab] = useState("Upcoming Bookings");
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [pastBookings, setPastBookings] = useState<Booking[]>([]);
  const [listings, setListings] = useState<Listing[] | null>(null);
  const [partners, setPartners] = useState<Partner[] | null>(null);
  const fetchListingsByIds = async (listingIds: string[]) => {
    const listings: Listing[] = [];

    // Loop through each listing ID
    for (const listingId of listingIds) {
      // Fetch the document with the given ID
      const docRef = doc(db, "listings", listingId);
      const docSnap = await getDoc(docRef);

      // Check if the document exists
      if (docSnap.exists()) {
        // If the document exists, push its data to the listings array
        const listingData = docSnap.data() as Listing;
        listings.push(listingData);
      } else {
        console.log(`Listing with ID ${listingId} does not exist.`);
      }
    }

    setListings(listings);
  };

  const fetchPartnersByIds = async (partnerIds: string[]) => {
    for (const partnerId of partnerIds) {
      const docRef = doc(db, "partners", partnerId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const partnerData = docSnap.data() as Partner;
        setPartners((prev) => [...(prev || []), partnerData]);
      } else {
        console.log(`Partner with ID ${partnerId} does not exist.`);
      }
    }
  };

  useEffect(() => {
    const fetchBookings = async () => {
      if (bookings) {
        console.log("Bookings fetched");
        const now = new Date();
        const upcoming = bookings.filter(
          (booking) => new Date(booking.date) > now
        );
        const past = bookings.filter((booking) => new Date(booking.date) < now);
        setUpcomingBookings(upcoming);
        setPastBookings(past);
      }
    };
    fetchBookings();
  }, [bookings]);

  useEffect(() => {
    const fetchData = async () => {
      if (!bookings) return;
      console.log("Bookings changed");
      await fetchListingsByIds(bookings.map((booking) => booking.listingId));
    };
    fetchData();
  }, [bookings]);

  useEffect(() => {
    const fetchData = async () => {
      if (!listings) return;
      console.log("Listings changed");
      await fetchPartnersByIds(
        listings.map((listing) => listing.partnerId).filter((id) => id)
      );
    };
    fetchData();
  }, [listings]);

  return (
    <section className="flex flex-col w-[45rem] gap-5 justify-center items-center h-full">
      <H2>Bookings</H2>
      <DashboardNav
        activeTab={bookingTab}
        setActiveTab={setBooktingTab}
        tabs={bookingsTab}
        layoutId={"bookings"}
      />
      {bookingTab == "Upcoming Bookings" && (
        <section
          className={`grid grid-cols-2 gap-x-3 gap-y-3 w-full h-full overflow-y-auto rounded-md bookings-container`}
        >
          {upcomingBookings.map((booking, idx) => {
            if (!listings) return null; // Handle missing listings (loading state
            const matchedListing = listings.find(
              (listing) => listing.id === booking.listingId
            ); // Find matching listing
            const matchedPartner = partners?.find(
              (partner) => partner.id === matchedListing?.partnerId
            );
            if (!matchedListing) return null; // Handle missing listing (loading state
            if (!matchedPartner) return null; // Handle missing partner (loading state
            return (
              <BookingCard
                key={idx}
                name={matchedListing ? matchedListing.name : "Name Not Found"} // Handle missing listing
                date={format(new Date(booking.date), "dd/MM/yyyy")}
                location={
                  matchedListing
                    ? matchedListing.location
                    : "Location Not Found"
                }
                time={`${booking.time.startTime} - ${booking.time.endTime}`}
                phone={matchedPartner?.companyPhoneNumber}
                image={matchedListing.images[0].url}
                sport={matchedListing.sport}
                url={`/explore/${matchedListing.id}`}
              />
            );
          })}
          {!listings &&
            [1, 2, 3, 4].map((idx) => (
              <section
                key={idx}
                className="flex flex-col justify-center items-center gap-3 bg-lightPrimary rounded-lg w-full h-[55vh] animate-pulse  px-4 py-4"
              />
            ))}
          {upcomingBookings.length == 0 && (
            <p className="text-white text-3xl w-full col-span-2 text-center my-20">
              No upcoming bookings
            </p>
          )}
        </section>
      )}
      {bookingTab == "Past Bookings" && (
        <section className="grid grid-cols-2 gap-3 w-full h-full overflow-y-scroll rounded-md bookings-container">
          {pastBookings.map((booking, idx) => {
            if (!listings) return null; // Handle missing listings (loading state
            const matchedListing = listings.find(
              (listing) => listing.id === booking.listingId
            ); // Find matching listing
            const matchedPartner = partners?.find(
              (partner) => partner.id === matchedListing?.partnerId
            );
            if (!matchedListing) return null; // Handle missing listing (loading state
            if (!matchedPartner) return null; // Handle missing partner (loading state
            return (
              <BookingCard
                key={idx}
                name={matchedListing ? matchedListing.name : "Name Not Found"} // Handle missing listing
                date={format(new Date(booking.date), "dd/MM/yyyy")}
                location={
                  matchedListing
                    ? matchedListing.location
                    : "Location Not Found"
                }
                time={`${booking.time.startTime} - ${booking.time.endTime}`}
                phone={matchedPartner?.companyPhoneNumber}
                image={matchedListing.images[0].url}
                sport={matchedListing.sport}
                url={`/explore/${matchedListing.id}`}
              />
            );
          })}
          {!listings &&
            [1, 2, 3, 4].map((idx) => (
              <section
                key={idx}
                className="flex flex-col justify-center items-center gap-3 bg-lightPrimary rounded-lg w-full h-[55vh] animate-pulse  px-4 py-4"
              />
            ))}
        </section>
      )}
      <Link
        href={"/explore"}
        className={`px-3 py-2 rounded-md bg-lightAccent text-darkPrimary flex justify-center items-center gap-2 w-full`}
      >
        Book more
      </Link>
    </section>
  );
};

const BookingCard = ({
  name,
  location,
  date,
  time,
  phone,
  image,
  sport,
  url,
}: {
  name: string;
  location: string;
  date: string;
  time: string;
  phone: string;
  image: string;
  sport: string;
  url: string;
}) => {
  return (
    <Link
      href={url}
      className="flex flex-col justify-between items-start gap-3 bg-lightPrimary rounded-lg w-full h-[55vh] px-4 py-4"
    >
      <Image
        src={image}
        alt="booking"
        width={2000}
        height={1000}
        className="w-full h-full object-cover rounded-md"
      />
      <section className="flex items-center justify-between w-full">
        <p className="text-2xl text-darkPrimary w-full font-bold">{name}</p>
        <p className="text-base text-lightPrimary px-2 py-1 rounded-md bg-darkPrimary">
          {sport}
        </p>
      </section>
      <section className="flex flex-col justify-center gap-1">
        <div className="text-xl text-darkPrimary flex items-center gap-1">
          <FaLocationDot />
          <p>{location}</p>
        </div>
        <div className="text-xl text-darkPrimary flex items-center gap-1">
          <BsPhone />
          <p>{phone}</p>
        </div>
        <div className="text-xl text-darkPrimary flex items-center gap-1">
          <BsCalendar />
          <p className="text-xl text-darkPrimary">{date}</p>
        </div>
        <div className="text-xl text-darkPrimary flex items-center gap-1">
          <BsClock />
          <p className="text-xl text-darkPrimary">{time}</p>
        </div>
      </section>
    </Link>
  );
};
export default AccountInformation;
