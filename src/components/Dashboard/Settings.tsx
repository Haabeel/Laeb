import React, { useEffect, useState } from "react";
import { FaApple } from "react-icons/fa6";
import { Switch } from "../ui/switch";
import { FaFacebookSquare, FaLink } from "react-icons/fa";
import { auth, db } from "../../../firebase.config";
import { checkLinkedProviders, removeCookies } from "@/lib/utils";
import { AnimatedTooltip } from "../ui/animated-tooltip";
import {
  EmailAuthProvider,
  FacebookAuthProvider,
  GoogleAuthProvider,
  User,
  onAuthStateChanged,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
} from "firebase/auth";
import { Account, DBuser, Provider } from "@/types";
import emirates from "../../../public/emirates";
import DropdownMenu from "../shared/DropdownMenu";
import { deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { Toaster, toast } from "sonner";
import { AiOutlineLoading, AiOutlineLoading3Quarters } from "react-icons/ai";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { FcGoogle } from "react-icons/fc";
const Settings = () => {
  const [user, setUser] = useState<Account | null>(null);
  const [emirate, setEmirate] = useState<string | null>(null);
  const [district, setDistrict] = useState<string | null>(null);
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [emailSubscription, setEmailSubscription] = useState(false);
  const [disable, setDisable] = useState(false);
  const [value, setValue] = useState("");
  const [providers, setProviders] = useState<Provider[]>([
    { id: 1, provider: "Google", isLinked: false },
    { id: 2, provider: "Facebook", isLinked: false },
    { id: 3, provider: "Apple ID", isLinked: false },
  ]);

  const getUserPreferences = async (user: User) => {
    try {
      const userDocRef = doc(db, "users", user.uid); // Assuming the collection name is "users"

      const docSnapshot = await getDoc(userDocRef);

      if (docSnapshot.exists()) {
        const userData = docSnapshot.data() as DBuser;
        if (userData) {
          const {
            preferredEmirate,
            preferredDistrict,
            firstName,
            lastName,
            emailSubscription,
          } = userData;
          if (preferredEmirate) setEmirate(preferredEmirate);
          if (preferredDistrict) setDistrict(preferredDistrict);
          setUser({
            ...user,
            preferredDistrict,
            preferredEmirate,
            firstName,
            lastName,
            emailSubscription,
          });
          setEmailSubscription(emailSubscription);
        }
      } else {
        console.log("User preferences not found.");
      }
    } catch (error: any) {
      console.error("Error fetching user preferences:", error);
      // Handle error accordingly
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      setIsLoading(true);
      const docRef = doc(db, "users", user!!.uid);
      await updateDoc(docRef, {
        preferredEmirate: emirate,
        preferredDistrict: district,
      });
      toast.success("Preferences updated");
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
      setNeedsUpdate(false);
    }
  };

  useEffect(() => {
    onAuthStateChanged(auth, (mUser) => {
      if (mUser) {
        checkLinkedProviders(setProviders, mUser);
        getUserPreferences(mUser);
      }
    });
  }, []);

  useEffect(() => {
    const isEmirateUpdated =
      emirate !== user?.preferredEmirate && emirate != "";
    const isDistrictUpdated =
      district !== user?.preferredDistrict && district != "";

    if (isEmirateUpdated || isDistrictUpdated) {
      setNeedsUpdate(true);
    } else {
      setNeedsUpdate(false);
    }
  }, [emirate, district, user?.preferredEmirate, user?.preferredDistrict]);

  const handleReauthenticationAndDelete = async (
    user: User,
    providerType: "google" | "facebook" | "email_password",
    email?: string,
    password?: string
  ) => {
    try {
      setIsLoading(true);
      switch (providerType) {
        case "google":
          await reauthenticateWithPopup(user, new GoogleAuthProvider());
          break;
        case "facebook":
          await reauthenticateWithPopup(user, new FacebookAuthProvider());
          break;
        case "email_password":
          const credential = EmailAuthProvider.credential(email!, password!);
          await reauthenticateWithCredential(user, credential);
          break;
        default:
          toast.error("Something went wrong");
      }
      await handleDeleteUser(user.uid);
    } catch (error) {
      toast.error("Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userID: string): Promise<void> => {
    if (!auth.currentUser) {
      console.error("User is not authenticated");
      return;
    }
    try {
      const mUser = auth.currentUser;
      if (mUser)
        await deleteDoc(doc(db, "users", mUser.uid))
          .then(() => {
            mUser
              .delete()
              .then(async () => {
                console.log("running");
                removeCookies();
                window.location.reload();
              })
              .catch(() => toast.error("Invalid Credentials"));
          })
          .catch(() => toast.error("Error deleting user document"));
    } catch (error: any) {
      toast.error("Error deleting user document");
    }
  };

  return (
    <div className="flex flex-col gap-3 justify-center items-center text-2xl">
      <section className="flex flex-col gap-3 w-full bg-[#AEAEAE] rounded-md p-5">
        <div className="flex gap-3 items-center">
          <FaLink className="text-darkPrimary" />
          <p className="text-darkPrimary text-2xl">Link Accounts</p>
        </div>
        {user && (
          <AnimatedTooltip
            items={providers}
            user={user}
            setProviders={setProviders}
          />
        )}
        <span className="text-xl text-darkPrimary flex gap-3 items-center">
          <p>Opt in to receive promotional and update emails.</p>
          <Switch
            className="dark:bg-darkPrimary w-11"
            disabled={disable}
            checked={emailSubscription}
            onCheckedChange={async (checked: boolean) => {
              setEmailSubscription(checked);
              setDisable(true);
              try {
                const docRef = doc(db, "users", user!!.uid);
                await updateDoc(docRef, {
                  emailSubscription: checked,
                });
              } catch (error) {
                toast.error("Something went wrong");
              } finally {
                setDisable(false);
              }
            }}
          />
        </span>
        <span className="text-xl text-darkPrimary flex gap-3 items-center w-full justify-between">
          <p className="w-full">Preferred Emirate</p>
          <DropdownMenu
            data={emirate}
            setData={setEmirate}
            dataSet={Object.keys(emirates)}
            defaultText="Emirates"
          />
        </span>
        <span className="text-xl text-darkPrimary flex gap-3 items-center w-full justify-between">
          <p className="w-full">Preferred District</p>
          <DropdownMenu
            data={district}
            setData={setDistrict}
            dataSet={
              emirate ? emirates[emirate]?.districts : ["Select an Emirate"]
            }
            defaultText="Districts"
            hasSearch
          />
        </span>
        {needsUpdate && (
          <button
            className={`px-3 py-2 rounded-md bg-lightSecondary text-white text-lg flex justify-center items-center gap-2 w-full`}
            onClick={() => updateProfile()}
          >
            {!isLoading ? (
              "Update Profile"
            ) : (
              <>
                <p>Updating...</p>
                <AiOutlineLoading className="animate-spin" />
              </>
            )}
          </button>
        )}
      </section>
      {user && (
        <Dialog>
          <DialogTrigger asChild>
            <button
              className={`px-3 py-2 rounded-md bg-red-900 text-white text-lg flex justify-center items-center gap-2 w-full`}
            >
              Delete Account
            </button>
          </DialogTrigger>
          <DialogContent className="bg-darkPrimary text-lightAccent">
            <DialogHeader>
              <DialogTitle>Re-Authenticate to continue</DialogTitle>
            </DialogHeader>
            <div>
              <input
                type="password"
                id="password"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className={`px-3 py-2 rounded-md bg-lightPrimary outline-none focus:outline-none w-full focus:shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,_rgba(0,0,0,0.3)_0px_3px_7px_-3px]`}
                autoComplete="off"
                placeholder="*******"
              />
            </div>
            <section className="grid grid-rows-3 gap-5 w-full">
              <button
                className={`flex gap-2 py-2 px-3 w-full rounded-lg bg-[#FFFFFF] items-center justify-start`}
                type="button"
                onClick={() => {
                  const mUser = auth.currentUser;
                  if (mUser) {
                    handleReauthenticationAndDelete(mUser, "google");
                  }
                }}
              >
                <FcGoogle className={`h-5 w-5`} />
                <p className={`text-sm text-[#000000] font-semibold`}>
                  Continue with google
                </p>
              </button>
              <button
                className={`flex gap-2 py-2 px-3 rounded-lg bg-[#FFFFFF] items-center justify-start`}
                type="button"
                onClick={() => {
                  const mUser = auth.currentUser;
                  if (mUser) {
                    handleReauthenticationAndDelete(mUser, "facebook");
                  }
                }}
              >
                <FaFacebookSquare className={`h-5 w-5 text-[#0000AA]`} />
                <p className={`text-sm text-[#000000] font-semibold`}>
                  Continue with facebook
                </p>
              </button>
              <button
                className={`flex gap-2 py-2 px-3 rounded-lg bg-[#FFFFFF] items-center justify-start`}
                type="button"
              >
                <FaApple className={`h-5 w-5`} />
                <p className={`text-sm text-[#000000] font-semibold`}>
                  Continue with apple
                </p>
              </button>
            </section>
            <button
              className={`px-3 py-2 rounded-md bg-red-800 text-[#FFFFFF] flex justify-center items-center gap-2 w-full`}
              type="submit"
              onClick={() => {
                const mUser = auth.currentUser;
                if (mUser) {
                  handleReauthenticationAndDelete(
                    mUser,
                    "email_password",
                    user.email!!,
                    value
                  );
                }
              }}
            >
              {isLoading ? (
                <>
                  <span>Deleting</span>
                  <AiOutlineLoading3Quarters className="animate-spin h-4 w-4" />
                </>
              ) : (
                "Delete"
              )}
            </button>
          </DialogContent>
        </Dialog>
      )}
      <Toaster richColors />
    </div>
  );
};

export default Settings;
