"use client";

import { stringToWordsArray } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import React, { useRef } from "react";
import IncreasedVisibility from "@/assets/images/footballPitch.jpg";
import BookingManagement from "@/assets/images/bookingManagement.jpg";
import profitLoss from "@/assets/images/profitLoss.jpg";
import customerSupport from "@/assets/images/customerSupport.jpg";
import LaebLogo from "@/assets/images/logo-nobg.png";
import logoBg from "@/assets/images/logo.jpg";
import { StickyScroll } from "@/components/ui/sticky-scroll";
import { WavyBackground } from "@/components/ui/wavy-background";
import { Toaster } from "sonner";
type Content = {
  title: string;
  description: string | React.ReactNode;
  content?: React.ReactNode | any;
};

const Partner = () => {
  const targetRef = useRef<HTMLDivElement>(null);

  const content: Content[] = [
    {
      title: "Reach a Wider Audience",
      description:
        "Expand your customer reach beyond your local area. Our platform connects you with sports enthusiasts actively searching for venues, showcasing your facilities to a wider audience and attracting new customers.",
      content: (
        <Image
          src={IncreasedVisibility}
          className="object-cover h-full w-full"
          alt="Increased Visibility"
        />
      ),
    },
    {
      title: "Streamline Your Booking Process",
      description:
        "Say goodbye to manual booking hassles. Our user-friendly dashboard allows you to manage all bookings, online and offline, in one centralized location. Schedule bookings, track availability, and manage cancellations effortlessly, saving you valuable time and effort.",
      content: (
        <Image
          src={BookingManagement}
          className="object-cover h-full w-full"
          alt="Booking Management"
        />
      ),
    },
    {
      title: "Gain Insights & Track Profits",
      description:
        "Stay on top of your finances with ease. Our detailed reporting tools provide clear insights into your bookings, revenue, and profits. Analyze trends, make informed decisions, and maximize your earning potential with our comprehensive data at your fingertips.",
      content: (
        <Image
          src={profitLoss}
          className="object-cover h-full w-full"
          alt="Profit loss"
        />
      ),
    },
    {
      title: "Dedicated Partner Support",
      description:
        "Never feel alone. Our dedicated support team is here to assist you every step of the way. Get your questions answered, receive guidance on using the platform, and benefit from ongoing support to ensure your success as a partner.",
      content: (
        <Image
          src={customerSupport}
          className="object-cover h-full w-full"
          alt="Customer Support"
        />
      ),
    },
    {
      title: "Get Started Today",
      description: (
        <div className="flex flex-col gap-2">
          <p>
            Become a partner and unlock the full potential of your sports venue.
          </p>
          <p className="text-lg">
            For a monthly subscription plan of <b> AED 120</b>
          </p>
          <section className="flex flex-col justify-center items-center gap-2">
            <ul className="list-disc">
              <li>Post & promote your venues online</li>
              <li>View upcoming and past bookings.</li>
              <li>Approve or reject booking requests.</li>
              <li>Schedule bookings based on availability.</li>
              <li>Manage cancellations and reschedules.</li>
              <li>Communicate with customers regarding bookings.</li>
            </ul>
          </section>
          <Link
            href={"/partner/signup"}
            className="text-center rounded-md bg-[#56282D] px-3 py-2 text-white"
          >
            Sign Up
          </Link>
        </div>
      ),
      content: (
        <Image
          src={logoBg}
          className="object-cover h-full w-full"
          alt="La'eb Logo"
        />
      ),
    },
  ];

  return (
    <WavyBackground
      className="w-screen min-h-screen overflow-x-hidden overflow-y-auto"
      waveWidth={70}
      blur={5}
      waveOpacity={0.4}
      speed="fast"
      colors={["#BDC667", "#77966D", "#626D58", "#544343", "#56282D"]}
    >
      <div
        className={`flex flex-col items-center justify-center w-full px-5 py-3 h-screen`}
      >
        <nav
          className={`grid grid-cols-3 place-items-center w-[50%] text-white h-[8%] fixed top-3 left-4 `}
        >
          <Link
            href={"/"}
            className={`text-6xl font-semibold tracking-wide place-self-start h-full`}
          >
            <Image
              src={LaebLogo}
              alt="logo"
              width={1000}
              height={1000}
              className="h-full w-auto object-fill"
            />
          </Link>
        </nav>
        <main
          className={`flex justify-center items-center flex-col gap-4 w-full h-full`}
        >
          <span className="text-4xl text-white tracking-wide font-bold flex gap-3">
            <p>Expand</p>
            <p>Your</p>
            <p>Reach</p>
            <p>With</p>
            <p className="text-darkSecondary">{"LA'EB"}</p>
          </span>
          {<StickyScroll content={content} />}
        </main>
      </div>
    </WavyBackground>
  );
};

export default Partner;
