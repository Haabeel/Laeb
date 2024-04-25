"use client";

import { User, onAuthStateChanged, signOut } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { auth, db } from "../../../../firebase.config";
import { removeCookies } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Logo from "@/assets/images/logo-nobg.png";
import Link from "next/link";
import { ROUTES_HOME, ROUTES_PARTNER_DASHBOARD_LIST } from "../../../../routes";
import AccountInformation from "@/components/Partner/Dashboard/AccountInformation";
import { doc, getDoc } from "firebase/firestore";
import { Toaster, toast } from "sonner";
import { Partner } from "@/types";
import Settings from "@/components/Partner/Dashboard/Settings";
import SecurityPrivacy from "@/components/Partner/Dashboard/SecurityPrivacy";
import Bookings from "@/components/Partner/Dashboard/Bookings";
import { RxHamburgerMenu } from "react-icons/rx";
import { AiOutlineClose } from "react-icons/ai";
import DrawerNav from "@/components/ui/DrawerNav";
const PartnerDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [tab, setTab] = useState<string>("Account Information");
  const [partner, setPartner] = useState<Partner | null>(null);
  const [open, setOpen] = useState<boolean>(false);
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
        className={`bg-darkPrimary border-b-1 border-neutral-800 h-[15vh] flex justify-between p-5 items-center w-full`}
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
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center justify-center lg:hidden text-lightPrimary"
        >
          {!open && <RxHamburgerMenu className="h-8 w-8" />}
          {open && <AiOutlineClose className="h-8 w-8" />}
        </button>
        <h1 className="text-2xl text-white absolute left-1/2 lg:block hidden">
          {tab}
        </h1>
        <div className="hidden gap-2 items-center lg:flex">
          <Link
            href={ROUTES_PARTNER_DASHBOARD_LIST}
            className="bg-darkPrimary px-3 py-2 text-white rounded-md shadow-[-10px_-10px_30px_4px_rgba(0,0,0,0.1),_10px_10px_30px_4px_rgba(255,78,25,0.15)] hover:shadow-[-10px_-10px_30px_4px_rgba(0,0,0,0.1),_10px_10px_30px_4px_rgba(45,78,255,0.15)] hover:bg-capuut transition-all duration-300 ease-in-out"
          >
            Make a new Listing
          </Link>
          <button
            onClick={() => handleSignOut()}
            className="bg-darkPrimary px-3 py-2 text-white rounded-md shadow-[-10px_-10px_30px_4px_rgba(0,0,0,0.1),_10px_10px_30px_4px_rgba(255,78,25,0.15)] hover:shadow-[-10px_-10px_30px_4px_rgba(0,0,0,0.1),_10px_10px_30px_4px_rgba(45,78,255,0.15)] hover:bg-capuut transition-all duration-300 ease-in-out"
          >
            Sign out{" "}
          </button>
        </div>
      </nav>
      <div className="flex w-full h-full relative">
        <DrawerNav
          open={open}
          tab={tab}
          setTab={setTab}
          handleSignOut={handleSignOut}
        >
          <ul className="flex flex-col gap-3 justify-center text-white">
            <li
              onClick={() => {
                setTab("Account Information");
                setOpen(false);
              }}
              className={`hover:text-white text-lightPrimary after:block after:h-[1px] cursor-pointer after:w-0 hover:after:w-full after:transition-all after:duration-300 after:ease-in-out after:bg-white w-fit ${
                tab === "Account Information"
                  ? "text-white after:w-full"
                  : "text-lightPrimary"
              }`}
            >
              Account Information
            </li>
            <li
              onClick={() => {
                setTab("Settings");
                setOpen(false);
              }}
              className={`hover:text-white text-lightPrimary after:block after:h-[1px] cursor-pointer after:w-0 after:hover:w-full after:transition-all after:duration-300 after:ease-in-out after:bg-white w-fit ${
                tab === "Settings"
                  ? "text-white after:w-full"
                  : "text-lightPrimary"
              }`}
            >
              Settings
            </li>
            <li
              onClick={() => {
                setTab("Security & Privacy");
                setOpen(false);
              }}
              className={`hover:text-white text-lightPrimary after:block after:h-[1px] cursor-pointer after:w-0 after:hover:w-full after:transition-all after:duration-300 after:ease-in-out after:bg-white w-fit ${
                tab === "Security & Privacy"
                  ? "text-white after:w-full"
                  : "text-lightPrimary"
              }`}
            >
              Security & Privacy
            </li>
            <li
              onClick={() => {
                setTab("Listings");
                setOpen(false);
              }}
              className={`hover:text-white text-lightPrimary after:block after:h-[1px] cursor-pointer after:w-0 after:hover:w-full after:transition-all after:duration-300 after:ease-in-out after:bg-white w-fit ${
                tab === "Listings"
                  ? "text-white after:w-full"
                  : "text-lightPrimary"
              }`}
            >
              Listings
            </li>
          </ul>
          <div className="flex gap-2 items-center flex-col w-full">
            <Link
              href={ROUTES_PARTNER_DASHBOARD_LIST}
              className="lg:bg-darkPrimary bg-lightDarkCommon px-3 py-2 text-white rounded-md lg:shadow-[-10px_-10px_30px_4px_rgba(0,0,0,0.1),_10px_10px_30px_4px_rgba(255,78,25,0.15)] hover:shadow-[-10px_-10px_30px_4px_rgba(0,0,0,0.1),_10px_10px_30px_4px_rgba(45,78,255,0.15)] hover:bg-capuut transition-all duration-300 ease-in-out w-full"
            >
              Make a new listing
            </Link>
            <button
              onClick={() => handleSignOut()}
              className="lg:bg-darkPrimary bg-capuut px-3 py-2 text-white rounded-md lg:shadow-[-10px_-10px_30px_4px_rgba(0,0,0,0.1),_10px_10px_30px_4px_rgba(255,78,25,0.15)] hover:shadow-[-10px_-10px_30px_4px_rgba(0,0,0,0.1),_10px_10px_30px_4px_rgba(45,78,255,0.15)] hover:bg-capuut transition-all duration-300 ease-in-out w-full"
            >
              Sign out
            </button>
          </div>
        </DrawerNav>

        <div className="h-full w-[20%] bg-darkPrimary border-r-2 border-neutral-800 py-3 lg:flex hidden items-center justify-center">
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
              onClick={() => setTab("Listings")}
              className={`hover:text-white text-lightPrimary after:block after:h-[1px] cursor-pointer after:w-0 after:hover:w-full after:transition-all after:duration-300 after:ease-in-out after:bg-white w-fit ${
                tab === "Listings"
                  ? "text-white after:w-full"
                  : "text-lightPrimary"
              }`}
            >
              Listings
            </li>
          </ul>
        </div>
        <div className="h-[85vh] w-full rounded-tl-lg shadow-[inset_-10px_-10px_30px_4px_rgba(0,0,0,0.1),_10px_10px_30px_4px_rgba(255,255,255,0.15)] overflow-x-hidden overflow-y-auto">
          {tab === "Account Information" ? (
            <AccountInformation
              user={user}
              partner={partner}
              setPartner={setPartner}
            />
          ) : tab === "Settings" ? (
            <Settings user={user} partner={partner} setPartner={setPartner} />
          ) : tab === "Security & Privacy" ? (
            <SecurityPrivacy
              user={user}
              partner={partner}
              setPartner={setPartner}
            />
          ) : tab === "Listings" ? (
            <Bookings user={user} partner={partner} />
          ) : (
            <AccountInformation
              user={user}
              partner={partner}
              setPartner={setPartner}
            />
          )}
        </div>
      </div>
      <Toaster richColors />
    </div>
  );
};

export default PartnerDashboard;
