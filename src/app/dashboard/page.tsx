"use client";

import { User, onAuthStateChanged, signOut } from "firebase/auth";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import DashboardNav from "@/components/Dashboard/DashboardNav";
import AccountInformation from "@/components/Dashboard/AccountInformation";
import Logo from "@/assets/images/logo-nobg.png";
import Settings from "@/components/Dashboard/Settings";
import { SecurityPrivacy } from "@/components/Dashboard/SecurityPrivacy";
import { useRouter } from "next/navigation";
import { auth, db } from "../../../firebase.config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Image from "next/image";

const tabs = ["Account Information", "Settings", "Security & Privacy"];
const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("Account Information");
  const [user, setUser] = useState<User | null>(null);
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
    <div className="bg-darkPrimary h-screen min-w-max flex flex-col gap-10 overflow-hidden items-center px-10 py-10">
      <div className="grid grid-cols-[1fr_5fr] place-items-center justify-items-center w-full h-[10%]">
        <Link href={"/"} className="h-full justify-self-start w-full">
          <Image
            src={Logo}
            alt="logo"
            width={1000}
            height={1000}
            className="object-fill w-auto h-[70%]"
          />
        </Link>
        <DashboardNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          tabs={tabs}
          layoutId="dashboardNav"
        />
      </div>
      {activeTab === "Account Information" && <AccountInformation />}
      {activeTab === "Settings" && <Settings />}
      {activeTab === "Security & Privacy" && <SecurityPrivacy />}
    </div>
  );
};

export default Dashboard;
