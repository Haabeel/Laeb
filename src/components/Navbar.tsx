import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Bebas_Neue, Inter } from "next/font/google";
import { MdOutlineAccountCircle } from "react-icons/md";
import { navPages } from "@/types";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase.config";
import logo from "@/assets/images/logo-nobg.png";
import Image from "next/image";

const inter = Inter({ weight: "400", subsets: ["latin"] });
const BebasNeue = Bebas_Neue({ weight: "400", subsets: ["latin"] });
const Navbar = ({
  page,
  setPage,
}: {
  page: navPages;
  setPage: Dispatch<SetStateAction<navPages>>;
}) => {
  const [link, setLink] = useState("/login");
  const title = "LA'EB";
  useEffect(() => {
    onAuthStateChanged(auth, (mUser) => {
      if (mUser) {
        setLink("/dashboard");
      } else {
        setLink("/login");
      }
    });
  }, []);
  return (
    <nav
      className={`mx-2 mt-2 ${"text-darkSecondary"} flex justify-between items-center rounded-md px-3 h-[10%]`}
    >
      <Image
        src={logo}
        height={1000}
        width={1000}
        alt="logo"
        className={`object-fill w-auto h-full`}
      />
      <div className={`flex items-center gap-3 mr-5`}>
        {link == "/login" && (
          <Link
            href={"/partner"}
            className={`text-md text-center ${
              inter.className
            } border py-2 px-3 rounded-xl w-[12rem] border-darkSecondary ${"hover:bg-darkSecondary text-darkSecondary hover:text-darkAccent"} transition-colors duration-200 ease-in`}
          >
            Become a partner
          </Link>
        )}
        <Link
          href={link}
          className={`text-md text-center ${
            inter.className
          } border py-2 px-3 w-[12rem] rounded-xl border-darkSecondary ${"hover:bg-darkSecondary text-darkSecondary hover:text-darkAccent hover:border-darkSecondary"} transition-colors duration-200 ease-in`}
        >
          {link == "/login" ? "Sign in" : "Dashboard"}
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
