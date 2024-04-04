import ImageUpload from "@/components/shared/ImageUpload";
import { SingleImageDropzone } from "@/components/ui/SingleImageDropzone";
import { AnimatedTooltip } from "@/components/ui/animated-tooltip";
import { useEdgeStore } from "@/lib/edgestore";
import { Provider } from "@/types";
import { User, updateProfile } from "firebase/auth";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { FaLink } from "react-icons/fa6";
import { toast } from "sonner";

const Settings = ({ user }: { user: User | null }) => {
  const [providers, setProviders] = useState<Provider[]>([
    { id: 1, provider: "google.com", isLinked: false },
    { id: 2, provider: "facebook.com", isLinked: false },
    { id: 3, provider: "apple.com", isLinked: false },
  ]);

  useEffect(() => {
    const providers = user?.providerData
      .filter((provider) => provider.providerId !== "password")
      .map((provider) => provider.providerId);
    if (providers) {
      setProviders((prev) =>
        prev.map((provider) => ({
          ...provider,
          isLinked: providers.includes(provider.provider),
        }))
      );
    }
  }, [user?.providerData]);
  return (
    <div
      className={`flex flex-col justify-start items-start gap-5 w-full h-full p-5 relative`}
    >
      <div className="flex flex-col justify-stretch items-center w-1/2 bg-ebony px-4 py-3 rounded-lg gap-5 ">
        <div className="flex gap-3 items-center">
          <FaLink className="text-white w-6 h-6" />
          <p className="text-white text-2xl">Link Accounts</p>
        </div>
        {user && (
          <AnimatedTooltip
            items={providers}
            user={user}
            setProviders={setProviders}
            className="translate-x-1/2 left-[105%]"
          />
        )}
      </div>
      <div className="flex flex-col w-1/2 h-full justify-start items-center text-white overflow-x-hidden overflow-y-auto"></div>
    </div>
  );
};

export default Settings;
