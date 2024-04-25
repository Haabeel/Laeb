import { Variants, motion } from "framer-motion";
import { ReactNode } from "react";

interface DrawerProps {
  open: boolean;
  tab: string;
  setTab: (tab: string) => void;
  handleSignOut: () => void;
  children?: ReactNode;
}

const drawerVariants: Variants = {
  open: {
    x: "0%",
    transition: { duration: 0.3, ease: "easeInOut" },
  },
  closed: {
    x: "-100%",
    transition: { duration: 0.3, ease: "easeInOut" },
  },
};

const DrawerNav: React.FC<DrawerProps> = ({ open, children }) => {
  return (
    <motion.div
      className="absolute inset-0 bg-darkPrimary flex-col gap-5 z-[9999] p-5"
      style={{
        width: open ? "fit-content" : "0",
        height: open ? "100%" : "0",
        overflow: "hidden",
        display: open ? "flex" : "none",
      }}
      animate={{ x: open ? "0%" : "-100%" }}
      transition={{ duration: 0.7, ease: "easeInOut" }}
    >
      <h1 className="flex flex-col gap-3 justify-center text-white font-bold text-xl">
        Tabs
      </h1>
      <div className="flex gap-2 flex-col items-center justify-between h-full">
        {children}
      </div>
    </motion.div>
  );
};

export default DrawerNav;
