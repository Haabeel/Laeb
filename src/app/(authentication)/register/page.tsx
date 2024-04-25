"use client";

import React, { useState } from "react";
import {
  GoogleAuthProvider,
  IdTokenResult,
  createUserWithEmailAndPassword,
  updatePhoneNumber,
  updateProfile,
} from "firebase/auth";
import { auth, db } from "../../../../firebase.config";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { z } from "zod";
import Link from "next/link";
import { Bebas_Neue } from "next/font/google";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookSquare, FaApple } from "react-icons/fa";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FirebaseError } from "firebase/app";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import { doc, setDoc } from "firebase/firestore";
import Cookies from "js-cookie";
import { ROUTES_VERIFICATION_EMAIL } from "../../../../routes";
import Logo from "@/assets/images/logo-nobg.png";
import Image from "next/image";
import { handleGoogleSignIn } from "@/lib/utils";
const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
});
const registrationFormSchema = z.object({
  firstName: z.string().trim().max(15).min(3),
  lastName: z.string().trim().max(15).min(3),
  email: z.string().trim().email("invalid email format"),
  phoneNumber: z.string().trim().max(9).min(9),
  password: z.string().trim().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().trim().min(6),
});
export type RegistrationFormFields = z.infer<typeof registrationFormSchema>;
const RegistrationForm = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<RegistrationFormFields>({
    resolver: zodResolver(registrationFormSchema),
  });
  const [isLoading, setIsLoading] = useState(false);
  const onSubmit: SubmitHandler<RegistrationFormFields> = async (data) => {
    try {
      if (data.confirmPassword != data.password) return;
      const validationCheck = registrationFormSchema.safeParse(data);
      if (validationCheck.success) {
        try {
          setIsLoading(true);
          createUserWithEmailAndPassword(auth, data.email, data.password)
            .then((res) => {
              const user = auth.currentUser;
              if (user != null) {
                updateProfile(user, {
                  displayName: data.firstName + " " + data.lastName,
                })
                  .then(async () => {
                    const docRef = doc(db, "users", user.uid);
                    await setDoc(docRef, {
                      email: data.email,
                      firstName: data.firstName,
                      lastName: data.lastName,
                      phoneNumber: "+971" + data.phoneNumber,
                      emailSubscription: false,
                      preferredEmirate: null,
                      preferredDistrict: null,
                    })
                      .then(() => {
                        Cookies.set("isAuth", "true");
                        router.push(ROUTES_VERIFICATION_EMAIL);
                        setIsLoading(false);
                      })
                      .catch(() => {
                        toast.error("Something went wrong.");
                      });
                  })
                  .catch(() => {
                    toast.error("Something went wrong.");
                  });
              }
            })
            .catch((error: FirebaseError) => {
              toast.error(error.code);
              setIsLoading(false);
            });
        } catch (error) {
          toast.error("Something went wrong.");
        }
      } else {
        toast.error("Something went wrong.");
      }
    } catch (error) {
      toast.error("Something went wrong.");
    }
  };
  return (
    <div
      className={`flex flex-col justify-center items-center gap-3 w-screen h-screen px-5 py-3 sm:px-0 bg-darkPrimary`}
    >
      <form
        className={`bg-lightAccent sm:gap-4 gap-2 rounded-md sm:px-8 px-4 sm:py-6 py-3 flex flex-col justify-center items-center`}
        onSubmit={handleSubmit(onSubmit)}
      >
        <h1 className={`text-5xl mb-5 ${bebasNeue.className}`}>Register</h1>
        <section className={`grid grid-cols-2 sm:gap-x-10 gap-x-5 w-full`}>
          <label htmlFor="firstName" className={`text-[#000000]`}>
            First Name
          </label>
          <label htmlFor="lastName" className={`text-[#000000]`}>
            Last Name
          </label>
          <section>
            <input
              type="text"
              id="firstName"
              className={`px-3 py-2 rounded-md bg-lightPrimary outline-none focus:outline-none w-full focus:shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,_rgba(0,0,0,0.3)_0px_3px_7px_-3px]`}
              autoComplete="off"
              placeholder="First Name"
              {...register("firstName")}
            />
            {errors.firstName && (
              <p className={`text-xs text-[#000000]`}>
                {errors.firstName.message}
              </p>
            )}
          </section>
          <section>
            <input
              type="text"
              id="lastName"
              className={`px-3 py-2 rounded-md bg-lightPrimary outline-none focus:outline-none w-full focus:shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,_rgba(0,0,0,0.3)_0px_3px_7px_-3px]`}
              autoComplete="off"
              placeholder="Last Name"
              {...register("lastName")}
            />
            {errors.lastName && (
              <p className={`text-xs text-[#000000]`}>
                {errors.lastName.message}
              </p>
            )}
          </section>
        </section>
        <section className={`self-start w-full`}>
          <label htmlFor="email" className={`text-[#000000]`}>
            Your email
          </label>
          <input
            type="text"
            id="email"
            className={`px-3 py-2 rounded-md bg-lightPrimary outline-none focus:outline-none w-full focus:shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,_rgba(0,0,0,0.3)_0px_3px_7px_-3px]`}
            autoComplete="off"
            placeholder="Email"
            {...register("email")}
          />
          {errors.email && (
            <p className={`text-xs text-[#000000]`}>{errors.email.message}</p>
          )}
        </section>
        <section className={`self-start w-full`}>
          <label htmlFor="phoneNumber" className={`text-[#000000]`}>
            Phone Number
          </label>
          <input
            type="number"
            id="phoneNumber"
            className={`px-3 py-2 rounded-md bg-lightPrimary outline-none focus:outline-none w-full focus:shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,_rgba(0,0,0,0.3)_0px_3px_7px_-3px]`}
            autoComplete="off"
            placeholder="+971"
            maxLength={9}
            {...register("phoneNumber")}
          />
          {errors.phoneNumber && (
            <p className={`text-xs text-[#000000]`}>
              {errors.phoneNumber.message}
            </p>
          )}
        </section>
        <section className={`self-start w-full`}>
          <label htmlFor="password" className={`text-[#000000]`}>
            Password
          </label>
          <input
            type="password"
            id="password"
            className={`px-3 py-2 rounded-md bg-lightPrimary outline-none focus:outline-none w-full focus:shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,_rgba(0,0,0,0.3)_0px_3px_7px_-3px]`}
            autoComplete="off"
            placeholder="*******"
            {...register("password")}
          />
        </section>
        <section className={`self-start w-full`}>
          <label htmlFor="confirmPassword" className={`text-[#000000]`}>
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            className={`px-3 py-2 rounded-md bg-lightPrimary outline-none focus:outline-none w-full focus:shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,_rgba(0,0,0,0.3)_0px_3px_7px_-3px]`}
            autoComplete="off"
            placeholder="*******"
            {...register("confirmPassword")}
          />
        </section>
        <button
          className={`px-3 py-2 rounded-md bg-lightSecondary text-[#FFFFFF] flex justify-center items-center gap-2 w-full`}
          type="submit"
        >
          {isLoading ? (
            <>
              <span>Registering</span>
              <AiOutlineLoading3Quarters className="animate-spin h-4 w-4" />
            </>
          ) : (
            "Register"
          )}
        </button>
        <section className="gap-5 w-full">
          <button
            onClick={() => {
              handleGoogleSignIn(router);
            }}
            className={`flex gap-2 py-2 px-3 rounded-lg w-full bg-[#FFFFFF] items-center justify-center`}
            type="button"
          >
            <FcGoogle className={`h-5 w-5`} />
            <p className={`text-sm text-[#000000] font-semibold`}>
              Continue with google
            </p>
          </button>
        </section>
        <div className={`w-[103%] h-[0.09rem] bg-lightSecondary`}></div>
        <Link
          href={"/login"}
          className={`text-lightSecondary text-sm hover:underline`}
        >
          Already have an account?
        </Link>
      </form>
      <Toaster richColors />
    </div>
  );
};

export default RegistrationForm;
