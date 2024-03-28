"use client";

import { signOut } from "firebase/auth";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import DashboardNav from "@/components/Dashboard/DashboardNav";
import AccountInformation from "@/components/Dashboard/AccountInformation";
import Logo from "@/assets/images/logo-final.svg";
import Settings from "@/components/Dashboard/Settings";
import { SecurityPrivacy } from "@/components/Dashboard/SecurityPrivacy";
import { useRouter } from "next/navigation";

const tabs = ["Account Information", "Settings", "Security & Privacy"];
const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("Account Information");

  return (
    <div className="bg-darkPrimary h-screen min-w-max flex flex-col gap-10 overflow-hidden items-center px-10 py-10">
      <Link
        href={"/"}
        className="font-extrabold text-5xl text-emerald-400 fixed inset-x-0 top-0 bottom-0 mx-4 my-3 w-min h-min"
      >
        {/* eslint-disable-next-line react/no-unescaped-entities */}
        LA'EB
      </Link>
      <DashboardNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tabs={tabs}
        layoutId="dashboardNav"
      />
      {activeTab === "Account Information" && <AccountInformation />}
      {activeTab === "Settings" && <Settings />}
      {activeTab === "Security & Privacy" && <SecurityPrivacy />}
    </div>
  );
};

export default Dashboard;
