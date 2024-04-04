import ImageUpload from "@/components/shared/ImageUpload";
import { SingleImageDropzone } from "@/components/ui/SingleImageDropzone";
import { AnimatedTooltip } from "@/components/ui/animated-tooltip";
import { Switch } from "@/components/ui/switch";
import { useEdgeStore } from "@/lib/edgestore";
import { Partner, Provider } from "@/types";
import { User, updateProfile } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { FaLink } from "react-icons/fa6";
import { toast } from "sonner";
import { db } from "../../../../firebase.config";
import {
  calculateNextBillingDate,
  formatDate,
  getOrdinalDay,
} from "@/lib/utils";

const Settings = ({
  user,
  partner,
  setPartner,
}: {
  user: User | null;
  partner: Partner | null;
  setPartner: React.Dispatch<React.SetStateAction<Partner | null>>;
}) => {
  const [providers, setProviders] = useState<Provider[]>([
    { id: 1, provider: "google.com", isLinked: false },
    { id: 2, provider: "facebook.com", isLinked: false },
    { id: 3, provider: "apple.com", isLinked: false },
  ]);
  const [emailNotification, setEmailNotification] = useState(false);
  const [disable, setDisable] = useState(false);

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

  useEffect(() => {
    setEmailNotification(partner?.emailNotification ?? false);
    console.log(partner?.emailNotification);
  }, [partner?.emailNotification]);

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
      <div className="flex flex-col w-1/2 h-full justify-start items-center text-white bg-ebony p-5 rounded-lg overflow-x-hidden overflow-y-auto gap-5">
        <span className="flex justify-between text-lg items-center w-full text-darkPrimary rounded-lg px-3 py-2 bg-lightAccent">
          <p>Receive email notifications for booking details.</p>
          <Switch
            className="dark:bg-darkPrimary w-11"
            disabled={disable}
            checked={emailNotification}
            onCheckedChange={async (checked: boolean) => {
              setEmailNotification(checked);
              setDisable(true);
              try {
                const docRef = doc(db, "partners", user!!.uid);
                await updateDoc(docRef, {
                  emailNotification: checked,
                });
              } catch (error) {
                toast.error("Something went wrong");
              } finally {
                setDisable(false);
              }
            }}
          />
        </span>
        <span className="flex flex-col gap-3 justify-between text-lg items-center w-full text-darkPrimary rounded-lg px-3 py-2 bg-lightAccent">
          <p className="text-center w-full">Account Billing Information</p>
          <AccountTable data={user!!} />
        </span>
      </div>
    </div>
  );
};

const AccountTable = ({ data }: { data: User | null }) => {
  const [creationDate, setCreationDate] = useState<string>();
  const [billingData, setBillingData] = useState<number>();
  const [nextBillingDate, setNextBillingDate] = useState<string>();
  useEffect(() => {
    if (!data) return;
    const creationTime = data.metadata.creationTime;
    if (creationTime) {
      const dateString = data.metadata.creationTime;
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.toLocaleString("default", { month: "long" });
      const year = date.getFullYear();
      const formattedDate = `${day}${getOrdinalDay(day)} ${month} ${year}`;
      setCreationDate(formattedDate);
    }
  }, [data]);

  useEffect(() => {
    const fetchBillingData = async () => {
      const docRef = doc(db, "utility", "billing");
      const docSnapshot = await getDoc(docRef);
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        setBillingData(data?.monthlyBillingPrice);
      }
    };
    fetchBillingData();
    if (!data) return;
    const fetchNextBillingDate = async () => {
      const docRef = doc(db, "partners", data.uid);
      const docSnapshot = await getDoc(docRef);
      if (docSnapshot.exists()) {
        const data = docSnapshot.data() as Partner;
        if (!data.billingDates) return;
        const nextBilling = new Date(data.billingDates.nextBillingAt);
        setNextBillingDate(formatDate(nextBilling));
      }
    };
    fetchNextBillingDate();
  }, [data]);

  return (
    <div className="overflow-x-auto w-full">
      <table className="table-auto w-full border-collapse rounded-lg border border-gray-800">
        <thead className="rounded-lg">
          <tr>
            <th className="border border-gray-800 px-4 py-2">
              Account Creation Date
            </th>
            <th className="border border-gray-800 px-4 py-2">
              Monthly Billing Amount
            </th>
            <th className="border border-gray-800 px-4 py-2">
              Next Billing Date
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-800 px-4 py-2 rounded-lg text-center">
              {data && creationDate}
            </td>
            <td className="border border-gray-800 px-4 py-2 rounded-lg text-center">
              AED {data && billingData}
            </td>
            <td className="border border-gray-800 px-4 py-2 rounded-lg text-center">
              {data && creationDate}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Settings;
