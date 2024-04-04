"use client";

import { User, onAuthStateChanged, signOut } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { auth, db } from "../../../../firebase.config";
import { removeCookies } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Logo from "@/assets/images/logo-nobg.png";
import Link from "next/link";
import { ROUTES_HOME } from "../../../../routes";
import AccountInformation from "@/components/Partner/Dashboard/AccountInformation";
import { doc, getDoc } from "firebase/firestore";
import { Toaster, toast } from "sonner";
import { Partner } from "@/types";
import Settings from "@/components/Partner/Dashboard/Settings";

const PartnerDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [tab, setTab] = useState<string>("Account Information");
  const [partner, setPartner] = useState<Partner | null>(null);
  const router = useRouter();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (mUser) => {
      if (mUser) {
        setUser(mUser);
      }
    });
    return () => unsubscribe();
  }, []);
  useEffect(() => {
    async function fetchPartnerData() {
      try {
        if (!user) return;
        const docRef = doc(db, "partners", user.uid);
        const docSnapshot = await getDoc(docRef);
        if (docSnapshot.exists()) {
          const data = docSnapshot.data() as Partner;
          setPartner(data);
        } else {
          toast.error("Partner data not found");
        }
      } catch (error) {
        toast.error("Something went wrong please relaod the page");
      }
    }
    fetchPartnerData();
  }, [user]);
  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        removeCookies();
        router.push("/");
      })
      .catch((error) => {
        console.log(error);
      });
  };
  return (
    <div
      className={`bg-darkPrimary w-screen h-screen overflow-hidden flex flex-col`}
    >
      <nav
        className={`bg-darkPrimary border-b-1 border-neutral-800 h-[15%] flex justify-between p-5 items-center w-full`}
      >
        <Link href={ROUTES_HOME} className="h-full w-auto">
          <Image
            src={Logo}
            height={1000}
            width={1000}
            alt="logo"
            className="object-fill w-auto h-[80%]"
          />
        </Link>
        <h1 className="text-2xl text-white">{tab}</h1>
        <button
          onClick={() => handleSignOut()}
          className="bg-darkPrimary px-3 py-2 text-white rounded-md shadow-[-10px_-10px_30px_4px_rgba(0,0,0,0.1),_10px_10px_30px_4px_rgba(255,78,25,0.15)] hover:shadow-[-10px_-10px_30px_4px_rgba(0,0,0,0.1),_10px_10px_30px_4px_rgba(45,78,255,0.15)] hover:bg-capuut transition-all duration-300 ease-in-out"
        >
          Sign out{" "}
        </button>
      </nav>
      <div className="flex w-full h-full">
        <div className="h-full w-[20%] bg-darkPrimary border-r-2 border-neutral-800 py-3 flex items-center justify-center">
          <ul className="flex flex-col gap-3 justify-center text-white">
            <li
              onClick={() => setTab("Account Information")}
              className={`hover:text-white text-lightPrimary after:block after:h-[1px] cursor-pointer after:w-0 hover:after:w-full after:transition-all after:duration-300 after:ease-in-out after:bg-white w-fit ${
                tab === "Account Information"
                  ? "text-white after:w-full"
                  : "text-lightPrimary"
              }`}
            >
              Account Information
            </li>
            <li
              onClick={() => setTab("Settings")}
              className={`hover:text-white text-lightPrimary after:block after:h-[1px] cursor-pointer after:w-0 after:hover:w-full after:transition-all after:duration-300 after:ease-in-out after:bg-white w-fit ${
                tab === "Settings"
                  ? "text-white after:w-full"
                  : "text-lightPrimary"
              }`}
            >
              Settings
            </li>
            <li
              onClick={() => setTab("Security & Privacy")}
              className={`hover:text-white text-lightPrimary after:block after:h-[1px] cursor-pointer after:w-0 after:hover:w-full after:transition-all after:duration-300 after:ease-in-out after:bg-white w-fit ${
                tab === "Security & Privacy"
                  ? "text-white after:w-full"
                  : "text-lightPrimary"
              }`}
            >
              Security & Privacy
            </li>
            <li
              onClick={() => setTab("Bookings")}
              className={`hover:text-white text-lightPrimary after:block after:h-[1px] cursor-pointer after:w-0 after:hover:w-full after:transition-all after:duration-300 after:ease-in-out after:bg-white w-fit ${
                tab === "Bookings"
                  ? "text-white after:w-full"
                  : "text-lightPrimary"
              }`}
            >
              Bookings
            </li>
          </ul>
        </div>

        <div className="h-full w-full shadow-[inset_-10px_-10px_30px_4px_rgba(0,0,0,0.1),_10px_10px_30px_4px_rgba(255,255,255,0.15)]">
          {tab === "Account Information" ? (
            <AccountInformation
              user={user}
              partner={partner}
              setPartner={setPartner}
            />
          ) : tab === "Settings" ? (
            <Settings user={user} partner={partner} setPartner={setPartner} />
          ) : null}
        </div>
      </div>

      <Toaster richColors />
    </div>
  );
};

export default PartnerDashboard;
