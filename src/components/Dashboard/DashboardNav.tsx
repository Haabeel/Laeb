import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/utility";

type DashboardNavProps = {
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  tabs: string[];
  layoutId: string;
  className?: string;
};
const DashboardNav = ({
  activeTab,
  setActiveTab,
  tabs,
  layoutId,
  className,
}: DashboardNavProps) => {
  return (
    <nav
      className={cn(
        "flex sm:gap-10 gap-5 justify-center items-center sm:text-xl text-base",
        className
      )}
    >
      {tabs.map((tab, idx) => (
        <button
          key={idx}
          onClick={() => {
            setActiveTab(tab);
          }}
          className={`${
            tab === activeTab ? "" : "hover:text-white/60"
          } relative rounded-full px-3 py-1.5 font-medium text-white outline-sky-400 transition focus-visible:outline-2`}
          style={{ WebkitTapHighlightColor: "transparent" }}
        >
          {activeTab === tab && (
            <motion.span
              layoutId={layoutId}
              className="absolute inset-0 z-10 bg-white mix-blend-difference"
              style={{ borderRadius: 9999 }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.8 }}
            />
          )}
          {tab}
        </button>
      ))}
    </nav>
  );
};

export default DashboardNav;
