"use client";
import {
  PhoneAuthProvider,
  RecaptchaVerifier,
  User,
  linkWithCredential,
  onAuthStateChanged,
} from "firebase/auth";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { auth, db } from "../../../../../firebase.config";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { Toaster, toast } from "sonner";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import Cookies from "js-cookie";
import { formatPhoneVerificationError } from "@/lib/utils";
const MobileVerification = () => {
  const [user, setUser] = useState<User | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [otp, SetOtp] = useState("");
  const router = useRouter();
  const [verificationID, setVerificationID] = useState<string | null>(null);
  const [isProvider, setIsProvider] = useState(false);
  const sendOTP = async () => {
    if (phoneNumber.length !== 9) {
      return toast.error("Invalid phone number");
    }
    const usersRef = collection(db, "users");
    const usersQuery = query(
      usersRef,
      where("phoneNumber", "==", "+971" + phoneNumber)
    );
    const usersSnapshot = await getDocs(usersQuery);
    if (!usersSnapshot.empty) {
      return toast.error("Phone number already in use");
    }
    if (user !== null) {
      try {
        const recaptcha = new RecaptchaVerifier(auth, "recaptcha", {
          size: "invisible",
        });
        const provider = new PhoneAuthProvider(auth);
        await provider
          .verifyPhoneNumber("+971" + phoneNumber, recaptcha)
          .then((res) => {
            setIsLoading(true);
            setVerificationID(res);
            setResendTimer(60); // Start resend timer for 1 minute
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
          .catch((error) => {
            toast.error(formatPhoneVerificationError(error));
          });
        toast.success("OTP sent!");
      } catch (error) {
        console.error(error);
        toast.error("Something went wrong, please try again");
      } finally {
        setIsLoading(false); // Set loading state to false after all actions
      }
    }
  };

  const verifyOTP = async () => {
    toast.info("Verifying");
    if (user !== null && verificationID !== null) {
      if (otp.length != 6) return toast.error("invalid otp");
      try {
        const phoneCredential = PhoneAuthProvider.credential(
          verificationID,
          otp
        );
        linkWithCredential(user!!, phoneCredential)
          .then(async () => {
            const docRef = doc(db, "users", user.uid);
            await updateDoc(docRef, {
              phoneNumber: "+971" + phoneNumber,
            });
            Cookies.set("hasPhoneVerified", "true");
            router.push("/dashboard");
          })
          .catch((error) => toast.error(formatPhoneVerificationError(error)));
      } catch (error) {
        toast.error("Something went wrong.");
      }
    } else {
      toast.error("Something went wrong, please try again");
    }
  };

  useEffect(() => {
    onAuthStateChanged(auth, async (mUser) => {
      if (mUser) {
        const docRef = doc(db, "users", mUser.uid);
        const docSnapshot = await getDoc(docRef);
        if (docSnapshot.exists()) {
          setIsProvider(docSnapshot.data().phoneNumber == null ? false : true);
          setPhoneNumber(
            docSnapshot.data().phoneNumber
              ? docSnapshot.data().phoneNumber.slice(3)
              : ""
          );
        }
        setUser(mUser);
      }
    });
  }, [isProvider, router]);

  return (
    <div
      className={`bg-darkPrimary flex justify-center items-center w-screen h-screen`}
    >
      <div
        className={`bg-lightPrimary rounded-md px-3 py-4 flex flex-col justify-center items-center gap-3`}
      >
        <p className={`text-darkPrimary text-md`}>
          Verify your mobile number to continue
        </p>
        <div
          className={`flex items-center text-darkPrimary text-md pl-2 rounded-lg bg-lightAccent w-full h-12 ${
            user == null ? "animate-pulse" : ""
          }`}
        >
          <p className="text-md h-full text-center flex items-center justify-center">
            +971
          </p>
          <input
            type="tel"
            disabled={isProvider}
            maxLength={9}
            placeholder={!isProvider ? "Enter your Phone number" : ""}
            className={`bg-lightAccent placeholder:text-darkPrimary text-darkPrimary outline-none focus:outline-none rounded-r-lg px-2 py-3 self-stretch h-full`}
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>
        <button
          className={`px-3 py-2 rounded-md bg-lightSecondary text-[#FFFFFF] flex justify-center items-center gap-2 w-full ${
            isLoading || resendTimer ? "cursor-not-allowed opacity-50" : ""
          }`}
          onClick={() => sendOTP()}
          disabled={isLoading || resendTimer > 0}
        >
          {isLoading ? (
            <div className="flex items-center">
              <svg
                className="mr-2 animate-spin h-4 w-4 text-white"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M17.657 3.343A5.547 5.547 0 0010.007 1.91a5.547 5.547 0 00-7.65 1.433L2.893 6.757a1 1 0 01-1.414-1.414L4.293 2.343a1 1 0 011.414 1.414zM14.707 6.757a1 1 0 01-1.414-1.414L17.107 2.343a1 1 0 011.414 1.414L15.317 6.757a1 1 0 01-1.414 1.414zM10.007 14.88a4.486 4.486 0 00-4.48-4.48 4.486 4.486 0 00-4.48 4.48A4.486 4.486 0 0010.007 19.36a4.486 4.486 0 004.48-4.48zM17.657 9.383a4.486 4.486 0 01-4.48-4.48 4.486 4.486 0 014.48 4.48z" />
              </svg>
              Sending OTP...
            </div>
          ) : resendTimer > 0 ? (
            "Sent" + " " + resendTimer
          ) : (
            "Send"
          )}
        </button>
        <div id="recaptcha"></div>
        <InputOTP
          onComplete={() => verifyOTP()}
          onChange={(value) => SetOtp(value)}
          value={otp}
          pattern={REGEXP_ONLY_DIGITS}
          maxLength={6}
          render={({ slots }) => (
            <>
              <InputOTPGroup>
                {slots.slice(0, 3).map((slot, index) => (
                  <InputOTPSlot
                    className="bg-lightAccent text-darkPrimary"
                    key={index}
                    {...slot}
                  />
                ))}{" "}
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                {slots.slice(3).map((slot, index) => (
                  <InputOTPSlot
                    key={index}
                    className="bg-lightAccent text-darkPrimary"
                    {...slot}
                  />
                ))}
              </InputOTPGroup>
            </>
          )}
        />
        <div className="text-center text-sm">
          {otp === "" ? (
            <>Enter your one-time password.</>
          ) : (
            <>You entered: {otp}</>
          )}
        </div>
      </div>
      <Toaster richColors />
    </div>
  );
};

export default MobileVerification;
