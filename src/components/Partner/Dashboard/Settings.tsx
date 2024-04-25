import ImageUpload from "@/components/shared/ImageUpload";
import { SingleImageDropzone } from "@/components/ui/SingleImageDropzone";
import { AnimatedTooltip } from "@/components/ui/animated-tooltip";
import { Switch } from "@/components/ui/switch";
import { useEdgeStore } from "@/lib/edgestore";
import { Partner, Provider } from "@/types";
import { User, updateProfile } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Image from "next/image";
import { MdAccountBox } from "react-icons/md";
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
  ]);
  const [emailNotification, setEmailNotification] = useState(false);
  const [disable, setDisable] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const { edgestore } = useEdgeStore();
  const [image, setImage] = useState<File | string>();
  const [url, setUrl] = useState<{ url: string; thumbnailUrl: string | null }>({
    url: "",
    thumbnailUrl: null,
  });
  const handleProfilePictureChange = async () => {
    try {
      if (!image) return;
      if (typeof image === "string") return;
      if (!user) return;
      if (!partner) return;
      if (
        partner?.profilePicture != undefined &&
        partner?.profilePicture?.url.length > 0
      ) {
        console.log("working");
        const res = await edgestore.profilePictures.upload({
          file: image,
          onProgressChange: (progress) => {
            setProgress(progress);
          },
          options: {
            replaceTargetUrl: partner.profilePicture.url,
            manualFileName: user?.uid + "_profile_picture_" + image.name,
          },
        });
        setUrl({ url: res.url, thumbnailUrl: res.thumbnailUrl });
        setImage(res.url);
        await updateProfile(user, { photoURL: url.url });
        const docRef = doc(db, "partners", user.uid);
        await updateDoc(docRef, {
          profilePicture: { url: res.url, thumbnailUrl: res.thumbnailUrl },
        });
        setPartner({
          ...partner,
          profilePicture: { url: res.url, thumbnailUrl: res.thumbnailUrl },
        });
        return toast.success("Image uploaded successfully");
      }
      const res = await edgestore.profilePictures.upload({
        file: image,
        onProgressChange: (progress) => {
          setProgress(progress);
        },
        options: {
          manualFileName: user?.uid + "_profile_picture_" + image.name,
        },
      });
      setUrl({ url: res.url, thumbnailUrl: res.thumbnailUrl });
      setImage(res.url);
      await updateProfile(user, { photoURL: url.url });
      const docRef = doc(db, "partners", user.uid);
      await updateDoc(docRef, {
        profilePicture: { url: res.url, thumbnailUrl: res.thumbnailUrl },
      });
      setPartner({
        ...partner,
        profilePicture: { url: res.url, thumbnailUrl: res.thumbnailUrl },
      });
      toast.success("Image uploaded successfully");
    } catch (error) {
      toast.error("Something went wrong please try again");
    }
  };
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

  useEffect(() => {
    if (partner) setImage(partner.profilePicture?.url || undefined);
  }, [partner]);

  return (
    <div
      className={`flex lg:flex-row flex-col lg:justify-center items-center gap-5 w-full h-full p-5 relative lg:overflow-x-hidden overflow-y-auto overflow-x-hidden`}
    >
      <div className="flex flex-col justify-start items-start gap-5 w-full h-full">
        <div className="flex flex-col justify-stretch items-center w-full bg-ebony px-4 py-3 rounded-lg gap-5 ">
          <div className="flex gap-3 items-center">
            <FaLink className="text-white w-8 h-8" />
            <p className="text-white text-2xl">Link Accounts</p>
          </div>
          {user && (
            <AnimatedTooltip
              items={providers}
              user={user}
              setProviders={setProviders}
              className="translate-x-1/2 left-[105%]"
              providersContainerClassName="bg-lightAccent"
            />
          )}
        </div>
        <div className="flex flex-col w-full justify-start items-center text-white bg-ebony p-5 rounded-lg overflow-x-hidden overflow-y-auto gap-5">
          <span className="flex justify-between lg:text-lg text-base items-center w-full text-darkPrimary rounded-lg px-3 py-2 bg-lightAccent">
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
          <span className="flex flex-col gap-3 justify-center text-lg items-center w-full text-darkPrimary rounded-lg px-3 py-2 bg-lightAccent">
            <p className="text-center w-full">Account Billing Information</p>
            <AccountTable data={user!!} />
          </span>
        </div>
      </div>
      <div className="h-full lg:w-[90%] w-full flex flex-col gap-2 justify-stretch items-center bg-ebony px-4 py-3 rounded-lg text-white">
        <div className="flex items-center justify-center gap-3">
          <MdAccountBox className="w-8 h-8" />
          <div className="text-center text-2xl w-full">
            Change Profile Picture
          </div>
        </div>
        <SingleImageDropzone
          value={image}
          onChange={(file) => setImage(file)}
          dropzoneOptions={{
            maxSize: 2 * 1024 * 1024,
          }}
          className={`bg-lightPrimary w-full h-full ${
            !partner &&
            "animate-pulse transition-all duration-1000 ease-in-out object-scale-down"
          } `}
          height={400}
        />

        <div className="flex gap-2 items-center w-full">
          <div className=" rounded-full border border-white w-full h-2">
            <div
              className="h-full w-0 transition-all bg-white"
              style={{ width: progress + "%" }}
            />
          </div>
          <p>{progress}%</p>
        </div>

        {(url.url.length > 0 || partner?.profilePicture) && (
          <Link
            href={
              url.url.length > 0 ? url.url : partner?.profilePicture?.url || ""
            }
            target="_blank"
            rel="noopener noreferrer"
            className="w-full rounded-md px-2 py-1 bg-lightPrimary text-black text-center"
          >
            View Image
          </Link>
        )}
        <button
          className="bg-capuut text-white px-3 py-2 w-full text-lg rounded-lg"
          onClick={() => handleProfilePictureChange()}
        >
          Upload Image
        </button>
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
      const formattedDate = `${getOrdinalDay(day)} ${month} ${year}`;
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
            <th className="border border-gray-800 px-4 py-2 lg:text-lg text-base">
              Account Creation Date
            </th>
            <th className="border border-gray-800 px-4 py-2 lg:text-lg text-base">
              Monthly Billing Amount
            </th>
            <th className="border border-gray-800 px-4 py-2 lg:text-lg text-base">
              Next Billing Date
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-800 px-4 py-2 rounded-lg text-center lg:text-base text-sm">
              {data && creationDate}
            </td>
            <td className="border border-gray-800 px-4 py-2 rounded-lg text-center lg:text-base text-sm">
              AED {data && billingData}
            </td>
            <td className="border border-gray-800 px-4 py-2 rounded-lg text-center lg:text-base text-sm">
              {data && nextBillingDate}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Settings;
