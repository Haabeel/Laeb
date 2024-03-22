"use client";

import React, { useEffect, useState } from "react";
import { auth } from "../../../../../firebase.config";
import { useRouter } from "next/navigation";
import { User, onAuthStateChanged, sendEmailVerification } from "firebase/auth";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { toast, Toaster } from "sonner";
import Cookies from "js-cookie";
const EmailVerification = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const router = useRouter();
  const sendVerificationEmail = async () => {
    await sendEmailVerification(user!!)
      .then(() => {
        toast.success("Email sent!");
        setResendTimer(60);
        let prev: number;
        const resendInterval = setInterval(() => {
          setResendTimer((prevValue) => {
            const newValue = Math.max(0, prevValue - 1);
            prev = newValue;
            return newValue;
          });

          if (prev === 0) {
            clearInterval(resendInterval);
          }
        }, 1000);
      })
      .catch(() => toast.error("Something went wrong please try again"))
      .finally(() => setIsLoading(false));
  };
  useEffect(() => {
    onAuthStateChanged(auth, (mUser) => {
      if (mUser) {
        setUser(mUser);
        if (user?.emailVerified) {
          Cookies.set("hasEmailVerified", "true");
          router.push("/verification/mobile");
        }
      }
    });
  }, [router, user?.emailVerified]);

  return (
    <div
      className={`bg-darkPrimary flex justify-center items-center w-screen h-screen`}
    >
      <div
        className={`bg-lightPrimary rounded-md px-3 py-4 flex flex-col gap-3`}
      >
        <p className={`text-darkPrimary text-md`}>
          Verify your email address to continue
        </p>
        <p
          className={`bg-lightAccent text-darkPrimary text-md rounded-lg px-2 py-3`}
        >
          {user?.email}
        </p>
        <button
          className={`px-3 py-2 rounded-md bg-lightSecondary text-[#FFFFFF] flex justify-center items-center gap-2 w-full ${
            isLoading || resendTimer ? "cursor-not-allowed opacity-50" : ""
          }`}
          type="submit"
          onClick={() => {
            sendVerificationEmail();
          }}
          disabled={isLoading || resendTimer > 0}
        >
          {isLoading ? (
            <>
              <span>Sending</span>
              <AiOutlineLoading3Quarters className="animate-spin h-4 w-4" />
            </>
          ) : resendTimer > 0 ? (
            "sent" + " " + resendTimer
          ) : (
            "Send"
          )}
        </button>
        <button
          className={`px-3 py-2 rounded-md bg-lightSecondary text-[#FFFFFF] flex justify-center items-center gap-2 w-full`}
          type="submit"
          onClick={() => window.location.reload()}
        >
          {isLoading ? (
            <>
              <span>Verifying</span>
              <AiOutlineLoading3Quarters className="animate-spin h-4 w-4" />
            </>
          ) : (
            "I have already verified"
          )}
        </button>
      </div>
      <Toaster richColors />
    </div>
  );
};

export default EmailVerification;
