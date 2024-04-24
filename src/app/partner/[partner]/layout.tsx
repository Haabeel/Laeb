"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import logo from "@/assets/images/logo-nobg.png";
import Image from "next/image";
import { Toaster } from "sonner";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../../../firebase.config";
import { doc, getDoc } from "firebase/firestore";
const Layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const [isAuth, setIsAuth] = useState(false);
  const [isPartner, setIsPartner] = useState(false);
  useEffect(() => {
    const isAuth = Cookies.get("isAuth");
    const isPartner = Cookies.get("isPartner");
    const unsubscribe = onAuthStateChanged(auth, async (mUser) => {
      if (mUser) {
        setIsAuth(true);
        const userDocRef = doc(db, "users", mUser.uid);
        const userDocSnapshot = await getDoc(userDocRef);
        if (userDocSnapshot.exists()) {
          setIsPartner(false);
        } else {
          const partnerDocRef = doc(db, "partners", mUser.uid);
          const partnerDocSnapshot = await getDoc(partnerDocRef);
          if (partnerDocSnapshot.exists()) {
            setIsPartner(true);
          }
        }
      }
    });
    if (isAuth) {
      setIsAuth(true);
    }
    if (isPartner) {
      setIsPartner(true);
    }
  }, []);
  return (
    <div className="flex flex-col w-screen h-screen overflow-x-hidden overflow-y-auto">
      <nav className="flex h-[12%] w-full bg-ebony items-center justify-between pl-5 pr-10 py-5 sticky top-0">
        <Link
          href={"/"}
          className="text-4xl h-full flex justify-center items-center text-bold text-center"
        >
          <Image
            src={logo}
            alt="logo"
            width={1000}
            height={1000}
            className="object-cover w-full h-full"
          />
        </Link>
        <section className="flex items-center justify-between gap-10">
          <Link
            href={"/explore"}
            className="text-lg text-bold text-center text-white bg-night px-3 py-2 rounded-md"
          >
            Explore available bookings
          </Link>
          {isPartner &&
            (isAuth ? (
              <Link
                href={"/partner/dashboard"}
                className="text-lg text-bold text-center text-white bg-night px-3 py-2 rounded-md"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href={"/login"}
                className="text-lg text-bold text-center text-white bg-night px-3 py-2 rounded-md"
              >
                Login
              </Link>
            ))}
          {!isPartner &&
            (isAuth ? (
              <Link
                href={"/dashboard"}
                className="text-lg text-bold text-center text-white bg-night px-3 py-2 rounded-md"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href={"/login"}
                className="text-lg text-bold text-center text-white bg-night px-3 py-2 rounded-md"
              >
                Login
              </Link>
            ))}
        </section>
      </nav>
      {children}
      <Toaster richColors />
    </div>
  );
};
export default Layout;
