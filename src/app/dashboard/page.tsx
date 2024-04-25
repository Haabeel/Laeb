"use client";

import { User, onAuthStateChanged, signOut } from "firebase/auth";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import AccountInformation from "@/components/Dashboard/AccountInformation";
import Logo from "@/assets/images/logo-nobg.png";
import { auth, db } from "../../../firebase.config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Image from "next/image";
import { removeCookies } from "@/lib/utils";
import { useRouter } from "next/navigation";
const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (mUser) => {
      if (mUser) {
        setUser(mUser);
        const ref = doc(db, "users", mUser.uid);
        const docRef = getDoc(ref);
        docRef.then((doc) => {
          if (doc.exists()) {
            const data = doc.data();
            if (data.email != mUser.email)
              updateDoc(ref, { email: mUser.email });
          }
        });
      }
    });
    return () => unsubscribe();
  }, []);
  return (
    <div className="bg-darkPrimary min-h-screen h-full lg:min-w-max  flex flex-col overflow-x-hidden overflow-y-auto items-center">
      <div className="flex items-center justify-between w-full h-[12%] px-4 py-4">
        <Link href={"/"} className="h-full">
          <Image
            src={Logo}
            alt="logo"
            width={1000}
            height={1000}
            className="object-fill w-full h-full"
          />
        </Link>
        <button
          className={`px-3 py-2 rounded-md bg-lightAccent text-darkPrimary w-32`}
          onClick={() => {
            signOut(auth);
            removeCookies();
            router.push("/");
          }}
        >
          Sign out
        </button>
      </div>
      <AccountInformation />
    </div>
  );
};

export default Dashboard;
