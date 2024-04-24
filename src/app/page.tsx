"use client";
import Navbar from "@/components/Navbar";
import { navPages } from "@/types";
import { useEffect, useState } from "react";
import HeroSection from "@/components/shared/Hero/HeroSection";
import { CardHoverEffectDemo } from "@/components/shared/CardHoverEffectDemo";
import ContactUs from "@/components/shared/ContactUs";
export default function LandingPage() {
  const [page, setPage] = useState<navPages>("Home");

  return (
    <div
      className={`flex flex-col h-screen w-screen ${"bg-darkPrimary"} overflow-x-hidden pb-5 custom-scrollbar`}
    >
      <Navbar page={page} setPage={setPage} />
      <HeroSection />
      <CardHoverEffectDemo />
      <ContactUs />
    </div>
  );
}
