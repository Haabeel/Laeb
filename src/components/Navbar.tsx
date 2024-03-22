import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Bebas_Neue, Inter } from "next/font/google";
import { MdOutlineAccountCircle } from "react-icons/md";
import { navPages } from "@/types";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase.config";
const inter = Inter({ weight: "400", subsets: ["latin"] });
const BebasNeue = Bebas_Neue({ weight: "400", subsets: ["latin"] });
const Navbar = ({
  page,
  setPage,
  isDarkMode,
  setIsDarkMode,
}: {
  page: navPages;
  setPage: Dispatch<SetStateAction<navPages>>;
  isDarkMode: boolean;
  setIsDarkMode: Dispatch<SetStateAction<boolean>>;
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
      className={`mx-2 mt-2 ${
        isDarkMode ? "text-darkSecondary" : "text-lightSecondary"
      } flex justify-between items-center rounded-md px-3`}
    >
      <p
        className={`sm:text-5xl text-md ml-5 ${
          isDarkMode ? "text-darkSecondary" : "text-lightSecondary"
        } ${BebasNeue.className} tracking-[0.15em]`}
      >
        {title}
      </p>
      <div className={`flex items-center gap-3 mr-5`}>
        {link == "/login" && (
          <button
            className={`text-md ${
              inter.className
            } border py-2 px-3 rounded-xl w-[12rem] border-darkSecondary ${
              isDarkMode
                ? "hover:bg-darkSecondary text-darkSecondary hover:text-darkAccent"
                : "hover:bg-lightSecondary text-lightSecondary hover:text-lightPrimary"
            } transition-colors duration-200 ease-in`}
          >
            Become a partner
          </button>
        )}
        <Link
          href={link}
          className={`text-md text-center ${
            inter.className
          } border py-2 px-3 w-[12rem] rounded-xl border-darkSecondary ${
            isDarkMode
              ? "hover:bg-darkSecondary text-darkSecondary hover:text-darkAccent hover:border-darkSecondary"
              : "hover:bg-lightSecondary text-lightSecondary hover:text-lightPrimary hover:border-lightSecondary"
          } transition-colors duration-200 ease-in`}
        >
          {link == "/login" ? "Sign in" : "Dashboard"}
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
