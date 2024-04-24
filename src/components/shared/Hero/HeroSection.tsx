"use client";

import React, { useEffect, useState } from "react";
import { Anton, Inter } from "next/font/google";
import MovingGrid from "./MovingGrid";
import { FaArrowRightLong } from "react-icons/fa6";
import { motion } from "framer-motion";
import Cookies from "js-cookie";
import Link from "next/link";
import { ROUTES_EXPLORE } from "../../../../routes";
const AntonFont = Anton({ weight: "400", subsets: ["latin"] });
const InterFont = Inter({ weight: "400", subsets: ["latin"] });
const HeroSection = () => {
  const [auth, setAuth] = useState(false);

  useEffect(() => {
    const isAuth = Cookies.get("isAuth");
    if (isAuth) {
      setAuth(true);
    }
  }, []);

  const para =
    "We are more than a booking platform we offer high class experience and the tournaments are much competitive. with our top class serves, facilities, and the best venue for you every sport weather your a seasoned athlete or just a beginner join us and start your journey with La'eb";

  return (
    <main className={`flex rounded m-4 h-[90%] py-5 px-3 gap-3`}>
      <section className={`flex-1 flex flex-col gap-14`}>
        <h1
          className={`text-9xl selection:bg-darkSecondary ${
            AntonFont.className
          } font-extrabold tracking-tight ${"text-darkAccent"}`}
        >
          SPORTS
          <br />
          <span className="text-darkSecondary selection:bg-darkAccent">RE</span>
          DEFINED
        </h1>
        <p
          className={`${
            InterFont.className
          } selection:bg-darkSecondary text-lg ${"text-darkAccent"}`}
        >
          {para}
        </p>
        <div className="flex justify-center items-center gap-3">
          {!auth && (
            <Link
              href={"/register"}
              className={`text-md w-full flex justify-center gap-2 items-center   ${
                InterFont.className
              } py-2 px-3 rounded-xl ${"bg-darkSecondary text-darkAccent"} transition-colors duration-200 ease-in`}
            >
              <p>Get started</p>
              <motion.div>
                <FaArrowRightLong
                  className={`${"text-darkAccent"} hover:animate-pulse`}
                />
              </motion.div>
            </Link>
          )}
          <Link
            href={ROUTES_EXPLORE}
            className={`text-md w-full border-darkSecondary ${
              InterFont.className
            } border py-2 px-3 rounded-xl text-center ${"hover:bg-darkSecondary text-darkSecondary hover:text-darkAccent hover:border-darkSecondary"} transition-colors duration-200 ease-in`}
          >
            Explore
          </Link>
        </div>
      </section>
      <MovingGrid />
    </main>
  );
};

export default HeroSection;
