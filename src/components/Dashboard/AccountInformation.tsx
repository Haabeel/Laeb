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
import { doc, updateDoc } from "firebase/firestore";
import { AiOutlineLoading } from "react-icons/ai";

const bookingsTab = ["Upcoming Bookings", "Past Bookings"];
const AccountInformation = () => {
  const [user, setUser] = useState<User | null>(null);
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
  return (
    <main className="flex justify-center items-start w-full h-full gap-20 relative">
      <section className="flex flex-col gap-5 justify-center items-center">
        <H2>Your Profile</H2>
        <section className="flex gap-4 w-full justify-between items-center">
          <label htmlFor="FirstName" className="text-white text-xl text-medium">
            First Name
          </label>
          <AccountInformationInput
            id="firstName"
            fieldName="firstName"
            user={user!!}
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
        <button
          className={`px-3 py-2 rounded-md bg-lightAccent text-darkPrimary flex justify-center items-center gap-2 w-full`}
          onClick={() => {
            signOut(auth);
            removeCookies();
            router.push("/");
          }}
        >
          Sign out
        </button>
      </section>
      <Bookings />
      <Toaster className="fixed" richColors />
    </main>
  );
};
const H2 = ({ children }: { children: ReactNode }) => {
  return <h2 className={`font-bold text-4xl text-lightPrimary`}>{children}</h2>;
};

const Bookings = () => {
  const [bookingTab, setBooktingTab] = useState("Upcoming Bookings");
  return (
    <section className="flex flex-col w-[45rem] gap-5 justify-center items-center">
      <H2>Bookings</H2>
      <DashboardNav
        activeTab={bookingTab}
        setActiveTab={setBooktingTab}
        tabs={bookingsTab}
        layoutId={"bookings"}
      />
      {bookingTab == "Upcoming Bookings" && (
        <section className="grid grid-cols-2 gap-x-3 gap-y-3 w-full h-[55vh] overflow-y-auto rounded-md bookings-container">
          {[3, 4, 5, 6].map((idx) => (
            <BookingCard
              key={idx}
              name="Hadaf Pitches"
              date="10/11/2024"
              location="Al tawuun, Sharjah"
              time="19:00 - 20:00"
            />
          ))}
        </section>
      )}
      {bookingTab == "Past Bookings" && (
        <section className="grid grid-cols-2 gap-3 w-full h-[55vh] overflow-y-scroll rounded-md bookings-container">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((idx) => (
            <BookingCard
              key={idx}
              name="Hadaf Pitches"
              date="10/11/2024"
              location="Al tawuun, Sharjah"
              time="19:00 - 20:00"
            />
          ))}
        </section>
      )}
      <button
        className={`px-3 py-2 rounded-md bg-lightAccent text-darkPrimary flex justify-center items-center gap-2 w-full`}
        type="submit"
      >
        Book more
      </button>
    </section>
  );
};

const BookingCard = ({
  name,
  location,
  date,
  time,
}: {
  name: string;
  location: string;
  date: string;
  time: string;
}) => {
  return (
    <div className="flex justify-between items-center gap-3 bg-lightPrimary rounded-lg w-full px-4 py-3">
      <section className="flex flex-col justify-center items-center gap-1">
        <p className="text-2xl text-darkPrimary font-medium">{name}</p>
        <p className="text-xl text-darkPrimary">{location}</p>
        <p className="text-xl text-darkPrimary text-left w-full">
          {"+971554078975"}
        </p>
      </section>
      <section className="flex flex-col justify-center items-center gap-1">
        <p className="text-xl text-darkPrimary">{date}</p>
        <p className="text-xl text-darkPrimary">{time}</p>
      </section>
    </div>
  );
};
export default AccountInformation;
