import AccountInformationInput from "@/components/shared/AccountInformationInput";
import { Partner } from "@/types";
import { User, updateProfile } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { db } from "../../../../firebase.config";
import { doc, updateDoc } from "firebase/firestore";
import { IoLogoInstagram } from "react-icons/io5";
import { FaFacebookSquare, FaWhatsapp } from "react-icons/fa";
import { FaSquareXTwitter, FaLinkedin } from "react-icons/fa6";
import { SingleImageDropzone } from "@/components/ui/SingleImageDropzone";
import { useEdgeStore } from "@/lib/edgestore";
import Link from "next/link";
const AccountInformation = ({
  user,
  partner,
  setPartner,
}: {
  user: User | null;
  partner: Partner | null;
  setPartner: React.Dispatch<React.SetStateAction<Partner | null>>;
}) => {
  const [companyName, setCompanyName] = useState<string>("");
  const [needsUpdate, setNeedsUpdate] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [about, setAbout] = useState<string>("");
  const [instagram, setInstagram] = useState<string>("");
  const [facebook, setFacebook] = useState<string>("");
  const [twitter, setTwitter] = useState<string>("");
  const [linkedin, setLinkedin] = useState<string>("");
  const [whatsapp, setWhatsapp] = useState<string>("");
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
  const handleUpdateCompanyName = async () => {
    try {
      if (!user || !partner) return;
      setIsLoading(true);
      await updateProfile(user, {
        displayName: companyName,
      });
      const docRef = doc(db, "partners", user.uid);
      await updateDoc(docRef, {
        companyName,
      });
      setPartner({ ...partner, companyName });
      toast.success("Company name updated successfully");
    } catch (error) {
      toast.error("An error occurred while updating your company name");
    } finally {
      setNeedsUpdate(false);
      setIsLoading(false);
    }
  };
  const updateAboutUs = async () => {
    try {
      if (!user || !partner) return;
      setIsLoading(true);
      const docRef = doc(db, "partners", user?.uid);
      await updateDoc(docRef, {
        about,
      });
      setPartner({ ...partner, about });
      toast.success("About us updated successfully");
    } catch (error) {
      toast.error("An error occurred while updating your about us");
    } finally {
      setIsLoading(false);
    }
  };
  const updateSocials = async () => {
    try {
      if (!user || !partner) return;
      if (
        whatsapp.length === 0 &&
        instagram.length === 0 &&
        facebook.length === 0 &&
        twitter.length === 0 &&
        linkedin.length === 0
      )
        return toast.error("Please enter at least one social media account");
      setIsLoading(true);
      const docRef = doc(db, "partners", user?.uid);
      await updateDoc(docRef, {
        socialMedia: {
          instagram,
          facebook,
          twitter,
          linkedin,
          whatsapp,
        },
      });
      setPartner({
        ...partner,
        socialMedia: {
          instagram,
          facebook,
          twitter,
          linkedin,
          whatsapp,
        },
      });
      toast.success("Socials updated successfully");
    } catch (error) {
      toast.error("An error occurred while updating your socials");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (!partner) return;
    setAbout(partner.about || "");
    setInstagram(partner.socialMedia?.instagram || "");
    setFacebook(partner.socialMedia?.facebook || "");
    setTwitter(partner.socialMedia?.twitter || "");
    setLinkedin(partner.socialMedia?.linkedin || "");
    setWhatsapp(partner.socialMedia?.whatsapp || "");
    setImage(partner.profilePicture?.url || undefined);
  }, [partner]);
  return (
    <div className="flex w-full h-full justify-between gap-10 px-5 items-start py-5">
      <div className="flex flex-col h-full justify-between items-center w-full">
        <div className="flex flex-col h-full w-full justify-start items-center gap-5">
          <h1 className="text-2xl text-white">Account Details</h1>
          <div className="flex h-full w-full gap-2 justify-center items-center">
            <div className="flex flex-col h-full w-full justify-start items-center gap-5">
              <section className="flex flex-col gap-2 text-xl">
                <label htmlFor="email" className="text-white">
                  Email
                </label>
                <AccountInformationInput
                  fieldName="email"
                  id="email"
                  user={user}
                />
              </section>
              <section className="flex flex-col gap-2 text-xl">
                <label htmlFor="fullName" className="text-white">
                  Company Name
                </label>
                <AccountInformationInput
                  fieldName="fullName"
                  id="fullName"
                  user={user}
                  editable
                  data={companyName}
                  setData={setCompanyName}
                  setNeedsUpdate={setNeedsUpdate}
                />
              </section>
              <section className="flex flex-col gap-2 text-xl">
                <label htmlFor="phoneNumber" className="text-white">
                  Phone Number
                </label>
                <AccountInformationInput
                  fieldName="phoneNumber"
                  id="phoneNumber"
                  user={user}
                />
              </section>
              {needsUpdate && (
                <button
                  className="w-full text-white px-3 py-2 rounded-md bg-capuut"
                  onClick={() => handleUpdateCompanyName()}
                  disabled={isLoading}
                >
                  {isLoading ? "Updating..." : "Update Company Name"}
                </button>
              )}
            </div>
            <div className="h-full max-h-full flex flex-col gap-2 items-stretch justify-start text-white">
              <div className="text-center text-lg">Change Profile Picture</div>
              <SingleImageDropzone
                value={image}
                onChange={(file) => setImage(file)}
                dropzoneOptions={{
                  maxSize: 2 * 1024 * 1024,
                }}
                className={`bg-lightPrimary max-h-full max-w-full h-[210px] w-[210px] ${
                  !partner &&
                  "animate-pulse transition-all duration-1000 ease-in-out"
                } `}
              />

              <div className=" rounded-full border border-white w-full h-2">
                <div
                  className="h-full w-0 transition-all bg-white"
                  style={{ width: progress + "%" }}
                />
              </div>

              {(url.url.length > 0 || partner?.profilePicture) && (
                <Link
                  href={
                    url.url.length > 0
                      ? url.url
                      : partner?.profilePicture?.url || ""
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full rounded-lg bg-lightPrimary text-black text-center"
                >
                  View Image
                </Link>
              )}
              <button
                className="bg-capuut text-white px-3 py-2 text-lg rounded-lg"
                onClick={() => handleProfilePictureChange()}
              >
                Upload Image
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 h-full w-full justify-items-center place-items-center gap-2 text-sm">
          <h1 className="text-2xl text-white col-span-2">Social Accounts</h1>
          <section className="flex justify-center items-center gap-2 w-full">
            <label htmlFor="instagram" className="text-white">
              <IoLogoInstagram className="w-11 h-11" />
            </label>
            <input
              onChange={(e) => setInstagram(e.target.value)}
              placeholder={"Enter the url to your instagram account"}
              type="text"
              id="instagram"
              value={instagram || ""}
              className={`px-3 py-2 rounded-md bg-lightPrimary outline-none focus:outline-none w-full ${
                !partner && "animate-pulse"
              }`}
            />
          </section>
          <section className="flex justify-center items-center gap-2 w-full">
            <label htmlFor="facebook" className="text-white">
              <FaFacebookSquare className="w-11 h-11" />
            </label>
            <input
              onChange={(e) => setFacebook(e.target.value)}
              placeholder={"Enter the url to your facebook account"}
              id="facebook"
              type="text"
              value={facebook || ""}
              className={`px-3 py-2 rounded-md bg-lightPrimary outline-none focus:outline-none w-full ${
                !partner && "animate-pulse"
              }`}
            />
          </section>

          <section className="flex justify-center items-center gap-2 w-full">
            <label htmlFor="twitter" className="text-white">
              <FaSquareXTwitter className="w-11 h-11" />
            </label>
            <input
              onChange={(e) => setTwitter(e.target.value)}
              placeholder={"Enter the url to your X / twitter account"}
              id="twitter"
              type="text"
              value={twitter || ""}
              className={`px-3 py-2 rounded-md bg-lightPrimary outline-none focus:outline-none w-full ${
                !partner && "animate-pulse"
              }`}
            />
          </section>
          <section className="flex justify-center items-center gap-2 w-full">
            <label htmlFor="linkedin" className="text-white">
              <FaLinkedin className="w-11 h-11" />
            </label>
            <input
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder={"Enter the url to your linkedIn account"}
              id="linkedin"
              type="text"
              value={linkedin || ""}
              className={`px-3 py-2 rounded-md bg-lightPrimary outline-none focus:outline-none w-full ${
                !partner && "animate-pulse"
              }`}
            />
          </section>
          <section className="flex justify-center items-center gap-2 w-full">
            <label htmlFor="whatsapp" className="text-white">
              <FaWhatsapp className="w-11 h-11" />
            </label>
            <input
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder={"Enter the phone of your whatsapp account"}
              id="whatsapp"
              type="text"
              value={whatsapp || ""}
              className={`px-3 py-2 rounded-md bg-lightPrimary outline-none focus:outline-none w-full ${
                !partner && "animate-pulse"
              }`}
            />
          </section>
          <button
            className="w-full text-white px-3 py-2 rounded-md bg-capuut"
            onClick={() => updateSocials()}
          >
            {isLoading ? "Updating..." : "Update Socials"}
          </button>
        </div>
      </div>
      <div className="flex flex-col h-full justify-start items-center gap-5">
        <h1 className="text-2xl text-white">About Us</h1>
        <section className="flex flex-col gap-2 text-xl">
          <section className="w-full">
            <textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              className={`px-3 py-2 rounded-md bg-lightPrimary outline-none focus:outline-none w-[30rem] min-h-60 sticky-container-dark ${
                !partner && "animate-pulse"
              }`}
              maxLength={500}
              disabled={!partner}
              placeholder="Company about us in under 500 words"
              style={{ resize: "none" }}
            />
            <p className="text-white text-sm w-full text-end">
              {about.length}/500
            </p>
          </section>
          <button
            className="w-full text-white px-3 py-2 rounded-md bg-capuut"
            onClick={() => updateAboutUs()}
            disabled={isLoading}
          >
            {partner
              ? isLoading
                ? "Updating..."
                : "Update About Us"
              : "Loading..."}
          </button>
        </section>
      </div>
    </div>
  );
};

export default AccountInformation;
