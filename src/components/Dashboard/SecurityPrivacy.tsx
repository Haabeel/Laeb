import React, { useEffect, useState } from "react";
import AccountInformationInput from "../shared/AccountInformationInput";
import {
  User,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateEmail,
} from "firebase/auth";
import { auth } from "../../../firebase.config";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";

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
        <div className="grid grid-cols-2 w-full gap-2">
          <button
            className="bg-darkSecondary w-full text-white px-3 py-2 rounded-lg"
            onClick={() => router.push("/dashboard/update-email")}
          >
            Change Email
          </button>
          <button
            disabled={timer > 0}
            className={`bg-darkSecondary w-48 text-white px-3 py-2 transition-all ease-in rounded-lg ${
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

        <Toaster richColors />
      </div>
    </div>
  );
};
