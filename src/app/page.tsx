"use client";
import Navbar from "@/components/Navbar";
import { navPages } from "@/types";
import { useEffect, useState } from "react";
import { checkIsDarkMode } from "@/utility";
import MovingGrid from "@/components/shared/Hero/HeroSection";
import HeroSection from "@/components/shared/Hero/HeroSection";
import { CardHoverEffectDemo } from "@/components/shared/CardHoverEffectDemo";
import ContactUs from "@/components/shared/ContactUs";
export default function LandingPage() {
  const [page, setPage] = useState<navPages>("Home");
  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    setIsDarkMode(checkIsDarkMode());
  }, [isDarkMode]);

  return (
    <div
      className={`flex flex-col h-screen w-screen ${
        isDarkMode ? "bg-darkPrimary" : "bg-lightPrimary"
      } overflow-x-hidden pb-5 custom-scrollbar`}
    >
      <Navbar
        page={page}
        setPage={setPage}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />
      <HeroSection isDarkMode={isDarkMode} />
      <CardHoverEffectDemo />
      <ContactUs />
    </div>
  );
}
