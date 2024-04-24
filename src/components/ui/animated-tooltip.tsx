"use client";
import Image from "next/image";
import React, { useState } from "react";
import {
  motion,
  useTransform,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { BsApple, BsGoogle } from "react-icons/bs";
import { FaFacebook, FaLink } from "react-icons/fa6";
import { FaUnlink } from "react-icons/fa";
import { Provider } from "@/types";
import { User } from "firebase/auth";
import { handleLinkOrUnlink } from "@/lib/utils";
import { cn } from "@/utility";

export const AnimatedTooltip = ({
  items,
  user,
  setProviders,
  className,
  providersContainerClassName,
}: {
  items: Provider[];
  user: User;
  setProviders: React.Dispatch<React.SetStateAction<Provider[]>>;
  className?: string;
  providersContainerClassName?: string;
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const springConfig = { stiffness: 100, damping: 5 };
  const x = useMotionValue(0); // going to set this value on mouse move
  // rotate the tooltip
  const rotate = useSpring(
    useTransform(x, [-100, 100], [-45, 45]),
    springConfig
  );
  // translate the tooltip
  const translateX = useSpring(
    useTransform(x, [-100, 100], [-50, 50]),
    springConfig
  );

  return (
    <>
      {items.map((item, idx) => (
        <div
          className="relative w-full group"
          key={item.provider}
          onMouseEnter={() => setHoveredIndex(item.id)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence mode="wait">
            {hoveredIndex === item.id && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.6 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  },
                }}
                exit={{ opacity: 0, y: 20, scale: 0.6 }}
                style={{
                  translateX: translateX,
                  rotate: rotate,
                  whiteSpace: "nowrap",
                }}
                className={cn(
                  "absolute -left-1/3 translate-x-1/2 flex text-xs flex-col items-center justify-center rounded-md bg-lightAccent z-50 shadow-xl px-4 py-2",
                  className
                )}
              >
                <div className="font-bold text-darkPrimary relative z-30 text-base">
                  {!item.isLinked ? "Link account" : "Unlink account"}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            className={cn(
              "flex justify-between items-center w-full bg-white text-darkPrimary rounded-md px-3 py-2",
              providersContainerClassName
            )}
            onClick={() =>
              handleLinkOrUnlink(
                item.provider.toLowerCase() === "apple id"
                  ? "apple.com"
                  : `${item.provider.toLowerCase()}`,
                item.isLinked,
                setProviders,
                user
              )
            }
          >
            <span className="flex gap-4 items-center">
              {item.provider == "google.com" && <BsGoogle />}
              {item.provider == "facebook.com" && <FaFacebook />}
              {item.provider == "apple.com" && <BsApple />}
              <p className="text-lg">{item.provider}</p>
            </span>
            {!item.isLinked ? <FaLink /> : <FaUnlink />}
          </button>
        </div>
      ))}
    </>
  );
};
