import React, { useEffect, useState } from "react";
import AccountInformationInput from "../shared/AccountInformationInput";
import {
  ConfirmationResult,
  PhoneAuthCredential,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  RecaptchaVerifier,
  User,
  multiFactor,
  onAuthStateChanged,
  reauthenticateWithPhoneNumber,
  sendPasswordResetEmail,
  updateEmail,
} from "firebase/auth";
import { auth } from "../../../firebase.config";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";
import { set } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from "../ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "../ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { FaLock } from "react-icons/fa6";

export const SecurityPrivacy = () => {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [reauthentication, setReauthentication] =
    useState<ConfirmationResult | null>(null);
  const [recaptchaVerifier, setRecaptchaVerifier] =
    useState<RecaptchaVerifier | null>(null);
  const [otp, setOtp] = useState("");
  const router = useRouter();
  useEffect(() => {
    onAuthStateChanged(auth, (mUser) => {
      if (mUser) {
        setUser(mUser);
        setEmail(mUser.email!!);
        setPhoneNumber(mUser.phoneNumber!!);
      }
    });
  }, []);
  const [timer, setTimer] = useState(10);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

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
  return (
    <div className="flex justify-center items-center">
      <div
        className={`flex flex-col gap-5 w-full justify-center items-center p-5 rounded-lg bg-[#AEAEAE] transition ease-in`}
      >
        <p
          className={`px-3 py-2 rounded-md text-lg w-full bg-lightPrimary outline-none focus:outline-none ${
            !user && "animate-pulse"
          } `}
        >
          {user && user?.email}
        </p>
        <div className="grid grid-rows-2 w-full gap-2">
          <button
            className="bg-darkSecondary w-full text-white px-3 py-2 rounded-lg"
            onClick={() => router.push("/dashboard/update-email")}
          >
            Change Email
          </button>
          <button
            disabled={timer > 0}
            className={`bg-darkSecondary w-full text-white px-3 py-2 transition-all ease-in rounded-lg ${
              timer > 0 && "cursor-not-allowed bg-gray-600"
            }`}
            onClick={() => handleResetPassword()}
          >
            {`Reset Password ${timer > 0 ? `(${timer})` : ""}`}
          </button>
        </div>
        <p
          className={`px-3 py-2 rounded-md text-lg w-full bg-lightPrimary outline-none focus:outline-none ${
            !user && "animate-pulse"
          } `}
        >
          {user &&
            user.phoneNumber &&
            user.phoneNumber.substring(0, 4) +
              "   " +
              user.phoneNumber.substring(4, user.phoneNumber.length)}
        </p>
        <Dialog>
          <DialogTrigger asChild>
            <button className="bg-darkSecondary w-full text-white px-3 py-2 rounded-lg">
              Enable Multi factor authentication
            </button>
          </DialogTrigger>
          <DialogContent className="text-lightAccent bg-darkPrimary flex flex-col justify-center items-center">
            <DialogHeader>Enable Multi factor authentication</DialogHeader>
            <DialogDescription>
              Enter the OTP sent to your phone number
            </DialogDescription>
            <InputOTP
              onChange={(value) => setOtp(value)}
              value={otp}
              pattern={REGEXP_ONLY_DIGITS}
              maxLength={6}
              render={({ slots }) => (
                <>
                  <InputOTPGroup className="flex gap-2">
                    {slots.slice(0, 3).map((slot, index) => (
                      <InputOTPSlot
                        className="bg-transparent border border-lightAccent rounded-md px-3 py-2 text-lightAccent text-lg w-12 h-12 text-center"
                        key={index}
                        {...slot}
                      />
                    ))}{" "}
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup className="flex gap-2">
                    {slots.slice(3).map((slot, index) => (
                      <InputOTPSlot
                        key={index}
                        className="bg-transparent border border-lightAccent rounded-md px-3 py-2 text-lightAccent text-lg w-12 h-12 text-center"
                        {...slot}
                      />
                    ))}
                  </InputOTPGroup>
                </>
              )}
            />
          </DialogContent>
        </Dialog>
        <Toaster richColors />
        <div id="recaptcha"></div>
      </div>
    </div>
  );
};
