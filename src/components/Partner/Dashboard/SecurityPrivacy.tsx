"use client";

import { Partner } from "@/types";
import {
  EmailAuthProvider,
  FacebookAuthProvider,
  GoogleAuthProvider,
  User,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { auth, db } from "../../../../firebase.config";
import { toast } from "sonner";
import AccountInformationInput from "@/components/shared/AccountInformationInput";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteDoc, doc } from "firebase/firestore";
import {
  compareHash,
  decrypt,
  encrypt,
  hashPassword,
  removeCookies,
} from "@/lib/utils";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookSquare } from "react-icons/fa";
import { FaApple } from "react-icons/fa6";

type props = {
  user: User | null;
  partner: Partner | null;
  setPartner: React.Dispatch<React.SetStateAction<Partner | null>>;
};

const SecurityPrivacy = ({ user, partner, setPartner }: props) => {
  const router = useRouter();
  const [timer, setTimer] = React.useState(0);
  const [email, setEmail] = React.useState("");
  const [cardNumber, setCardNumber] = React.useState("");
  const [cardHolder, setCardHolder] = React.useState("");
  const [cardCVV, setCardCVV] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [cardExpiry, setCardExpiry] = React.useState("");
  const [value, setValue] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [key, setKey] = React.useState("");
  const [hashedPassword, setHashedPassword] = React.useState("");
  const [isDecrypted, setIsDecrypted] = React.useState(false);
  const handleResetPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, email).then(() => {
        toast.success("Password reset email sent successfully.");
        setTimer(120); // Reset the timer when password reset is initiated
      });
    } catch (error) {
      console.error(error);
    }
  };
  const authenticatePasswordAndDecrypt = async () => {
    try {
      const isValid = await compareHash(password, hashedPassword);
      if (isValid) {
        const decryptedCardNumber = decrypt(cardNumber, key);
        const decryptedCardCVV = decrypt(cardCVV, key);
        setIsDecrypted(true);
        setCardNumber(decryptedCardNumber);
        setCardCVV(decryptedCardCVV);
      } else {
        toast.error("Invalid password");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };
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
      await handleDeleteUser();
    } catch (error) {
      toast.error("Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (): Promise<void> => {
    if (!auth.currentUser) {
      console.error("User is not authenticated");
      return;
    }
    try {
      const mUser = auth.currentUser;
      if (mUser)
        await deleteDoc(doc(db, "partners", mUser.uid))
          .then(() => {
            mUser
              .delete()
              .then(async () => {
                console.log("running");
                removeCookies();
                router.push("/");
              })
              .catch(() => toast.error("Invalid Credentials"));
          })
          .catch(() => toast.error("Error deleting user document"));
    } catch (error: any) {
      toast.error("Error deleting user document");
    }
  };
  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
    }
  }, [user]);
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);
  useEffect(() => {
    if (partner) {
      setCardNumber(partner.cardNumber);
      setCardHolder(partner.cardHolder);
      setCardCVV(partner.cardCVV);
      setCardExpiry(partner.cardExpiry);
      setKey(partner.key);
      setHashedPassword(partner.hashedPassword);
    }
  }, [partner]);
  return (
    <div className="flex flex-col w-full h-full items-center p-5">
      <div className="flex flex-col items-center lg:w-1/2 w-full bg-ebony justify-center gap-3 rounded-lg px-5 py-3">
        <div className="flex flex-col justify-center items-center w-full gap-2">
          <label htmlFor="email" className="text-lg text-white w-full">
            Change your email address
          </label>
          <AccountInformationInput
            fieldName="email"
            data={email}
            className="w-full"
            user={user}
            id="email"
          />
          <button
            className="bg-darkPrimary w-full text-white px-3 py-2 rounded-lg"
            onClick={() => router.push("/dashboard/update-email")}
          >
            Change Email
          </button>
          <button
            disabled={timer > 0}
            className={`bg-darkPrimary w-full text-white px-3 py-2 transition-all ease-in rounded-lg ${
              timer > 0 && "cursor-not-allowed bg-gray-600"
            }`}
            onClick={() => handleResetPassword()}
          >
            {`Reset Password ${timer > 0 ? `(${timer})` : ""}`}
          </button>
        </div>
        <div className="flex flex-col gap-2 items-center text-white justify-center w-full">
          <p className="text-lg text-white w-full">Payment Details</p>
          <div className="w-full h-full">
            <label htmlFor="cardHolder">Card Holder</label>
            <input
              id="cardHolder"
              type="text"
              value={cardHolder}
              className="px-3 text-black py-2 rounded-md bg-lightPrimary outline-none focus:outline-none w-full"
              disabled
              autoComplete="off"
            />
          </div>
          <div className="w-full h-full">
            <label htmlFor="cardNumber">Card Number</label>
            <div className="relative w-full">
              <input
                id="cardNumber"
                type="text"
                value={cardNumber}
                className="px-3 text-black py-2 rounded-md bg-lightPrimary outline-none focus:outline-none w-full"
                disabled
                autoComplete="off"
              />
              {!isDecrypted && (
                <div className="absolute inset-0 flex justify-center items-center">
                  <div className="bg-black w-[98%] text-xs py-1 px-3 rounded-md text-white">
                    {/* Content for the overlay goes here */}
                    Encrypted enter the password to view
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-between items-center w-full gap-3">
            <div className="w-full h-full">
              <label htmlFor="expiry">Expiry</label>
              <input
                id="expiry"
                type="text"
                value={cardExpiry}
                className="px-3 text-black py-2 rounded-md bg-lightPrimary outline-none focus:outline-none w-full"
                disabled
                autoComplete="off"
              />
            </div>
            <div className="w-full h-full">
              <label htmlFor="cvv">CVV</label>
              <div className="relative w-full">
                <input
                  id="cvv"
                  type="text"
                  value={cardCVV}
                  className="px-3 text-black py-2 rounded-md bg-lightPrimary outline-none focus:outline-none w-full"
                  disabled
                  autoComplete="off"
                />
                {!isDecrypted && (
                  <div className="absolute inset-0 flex justify-center items-center">
                    <div className="bg-black w-[98%] text-xs py-1 px-3 rounded-md text-white">
                      {/* Content for the overlay goes here */}
                      Encrypted enter the password to view
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <button className="w-full text-base text-white px-3 py-2 bg-darkPrimary rounded-lg">
                Enter the password
              </button>
            </DialogTrigger>
            <DialogContent className="text-lightAccent bg-darkPrimary flex flex-col justify-center items-center">
              <DialogHeader>Enter the password</DialogHeader>
              <DialogDescription className="text-lightPrimary">
                Enter the password to view the card details
              </DialogDescription>
              <input
                id="cvv"
                type="text"
                value={password}
                placeholder="********"
                onChange={(e) => setPassword(e.target.value)}
                className="px-3 text-black py-2 rounded-md bg-lightPrimary outline-none focus:outline-none w-full"
                autoComplete="off"
              />
              <DialogClose
                className="bg-darkAccent w-full text-darkPrimary px-3 py-2 rounded-lg"
                onClick={() => authenticatePasswordAndDecrypt()}
              >
                View Card Details
              </DialogClose>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col text-lg text-white gap-2 items-center justify-center w-full">
          <p className="w-full">Delete Your Account</p>
          {user && (
            <Dialog>
              <DialogTrigger asChild>
                <button
                  className={`px-3 py-2 rounded-md bg-capuut text-white text-base flex justify-center items-center gap-2 w-full`}
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
                <section className="gap-5 w-full">
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
                </section>
                <button
                  className={`px-3 py-2 rounded-md bg-capuut text-[#FFFFFF] flex justify-center items-center gap-2 w-full`}
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
        </div>
      </div>
    </div>
  );
};

export default SecurityPrivacy;
