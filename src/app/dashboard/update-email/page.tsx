"use client";

import {
  EmailAuthProvider,
  FacebookAuthProvider,
  GoogleAuthProvider,
  User,
  onAuthStateChanged,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  sendEmailVerification,
  signOut,
  verifyBeforeUpdateEmail,
} from "firebase/auth";
import React, { useEffect, useState } from "react";
import { auth, db } from "../../../../firebase.config";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookSquare } from "react-icons/fa";
import { FaApple } from "react-icons/fa6";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { Toaster, toast } from "sonner";
import { useRouter } from "next/navigation";
import { removeCookies } from "@/lib/utils";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
const Page = () => {
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [updatedEmail, setUpdatedEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const isValidEmail = (email: string) => {
    // Simple email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  useEffect(() => {
    onAuthStateChanged(auth, (mUser) => {
      if (mUser) {
        setUser(mUser);
      }
    });
  });
  /**
   * Handles reauthentication and email change for a user.
   * @param user - The user object.
   * @param provider - The authentication provider ("google", "facebook", "apple", or "email_password").
   * @param email - The new email (optional, required for "email_password" provider).
   * @param password - The password (optional, required for "email_password" provider).
   */

  const handleReauthenticationAndEmailChange = async (
    user: User,
    provider: "google" | "facebook" | "apple" | "email_password",
    email?: string,
    password?: string
  ) => {
    if (!isValidEmail(updatedEmail)) {
      toast.error("Invalid email address");
      return;
    }
    if (password?.length === 0) {
      toast.error("Password is required for email-password provider");
      return;
    }
    setIsLoading(true);
    try {
      const usersRef = collection(db, "users");
      const docQuery = query(usersRef, where("email", "==", updatedEmail));
      const querySnapshot = await getDocs(docQuery);

      if (!querySnapshot.empty) {
        toast.error("Email already in use");
        setIsLoading(false);
        return;
      }

      switch (provider) {
        case "google":
          // Handle reauthentication with Google provider
          await reauthenticateWithPopup(user, new GoogleAuthProvider());
          break;
        case "facebook":
          // Handle reauthentication with Facebook provider
          await reauthenticateWithPopup(user, new FacebookAuthProvider());
          break;
        case "email_password":
          // Handle reauthentication with email/password provider
          const credential = EmailAuthProvider.credential(email!!, password!!);
          await reauthenticateWithCredential(user, credential);
          break;
      }

      await verifyBeforeUpdateEmail(user, updatedEmail)
        .then(() => {
          toast.success(
            "A verification email has been sent to your new email address. Please verify your email address to update it."
          );
          toast.success("You will be signed out in 5 seconds");
          const interval = setTimeout(() => {
            signOut(auth);
            removeCookies();
            router.push("/dashboard");
          }, 5000);
          return () => clearInterval(interval);
        })
        .catch((error) => console.log(error));
    } catch (error: any) {
      if (error.code === "auth/invalid-credential") {
        toast.error("invalid credentials");
      } else if (error.code === "auth/email-already-in-use") {
        toast.error("Email already in use");
      } else if (error.code === "auth/user-mismatch") {
        toast.error("User mismatch");
      } else {
        toast.error("Something went wrong");
      }
      console.log(error);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col gap-4 bg-darkPrimary w-screen h-screen justify-center items-center">
      <div className="flex flex-col gap-10">
        <input
          type="email"
          value={updatedEmail}
          onChange={(e) => setUpdatedEmail(e.target.value)}
          className={`px-3 py-2 rounded-md bg-lightPrimary outline-none focus:outline-none w-96 focus:shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,_rgba(0,0,0,0.3)_0px_3px_7px_-3px]`}
          autoComplete="off"
          placeholder="new Email"
        />
        <input
          type="password"
          id="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={`px-3 py-2 rounded-md bg-lightPrimary outline-none focus:outline-none w-96 focus:shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,_rgba(0,0,0,0.3)_0px_3px_7px_-3px]`}
          autoComplete="off"
          placeholder="*******"
        />
      </div>
      <section className="grid grid-rows-3 gap-5 w-96">
        <button
          className={`flex gap-2 py-2 px-3 w-96 rounded-lg bg-[#FFFFFF] items-center justify-start`}
          type="button"
          onClick={() => {
            const mUser = auth.currentUser;
            if (mUser) {
              handleReauthenticationAndEmailChange(mUser, "google");
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
              handleReauthenticationAndEmailChange(mUser, "facebook");
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
        className={`px-3 py-2 rounded-md bg-red-800 text-[#FFFFFF] flex justify-center items-center gap-2 w-96`}
        type="submit"
        onClick={() => {
          const mUser = auth.currentUser;
          if (mUser) {
            handleReauthenticationAndEmailChange(
              mUser,
              "email_password",
              mUser.email!!,
              value
            );
          }
        }}
      >
        {isLoading ? (
          <>
            <span>Authenticating...</span>
            <AiOutlineLoading3Quarters className="animate-spin h-4 w-4" />
          </>
        ) : (
          "Authenticate & change email"
        )}
      </button>

      <Toaster richColors />
    </div>
  );
};

export default Page;
