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
import { ROUTES_DASHBOARD_CHANGE_EMAIL } from "../../../routes";

export const SecurityPrivacy = () => {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const router = useRouter();
  useEffect(() => {
    onAuthStateChanged(auth, (mUser) => {
      if (mUser) {
        setUser(mUser);
        setEmail(mUser.email!!);
      }
    });
  }, []);
  const [timer, setTimer] = useState(0);

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
    <div className="flex justify-center items-center w-full">
      <div
        className={`flex flex-col gap-5 w-full justify-center items-center p-5 rounded-lg bg-[#AEAEAE] transition ease-in`}
      >
        <section className="flex flex-col w-full justify-between">
          <h1 className="text-xl font-bold">Email Address</h1>
          <p
            className={`px-3 py-2 rounded-md text-lg w-full bg-lightPrimary outline-none focus:outline-none ${
              !user && "animate-pulse"
            } `}
          >
            {user && user?.email}
          </p>
        </section>
        <div className="grid grid-rows-2 w-full gap-2">
          <button
            className="bg-darkSecondary w-full text-white px-3 py-2 rounded-lg"
            onClick={() => router.push(ROUTES_DASHBOARD_CHANGE_EMAIL)}
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
        {/* <p
          className={`px-3 py-2 rounded-md text-lg w-full bg-lightPrimary outline-none focus:outline-none ${
            !user && "animate-pulse"
          } `}
        >
          {user &&
            user.phoneNumber &&
            user.phoneNumber.substring(0, 4) +
              "   " +
              user.phoneNumber.substring(4, user.phoneNumber.length)}
        </p> */}
        <Toaster richColors />
      </div>
    </div>
  );
};
