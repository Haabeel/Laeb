"use client";

import React, { useState } from "react";

import Cookies from "js-cookie";
import { auth, db } from "../../../../firebase.config";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Bebas_Neue } from "next/font/google";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookSquare } from "react-icons/fa";
import { FaApple } from "react-icons/fa6";
import Link from "next/link";
import {
  FacebookAuthProvider,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { Toaster, toast } from "sonner";
import { cookies } from "next/headers";
import { setUpCookies } from "@/lib/utils";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
});

const loginFormSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().trim().min(6),
});

export type LoginFormFields = z.infer<typeof loginFormSchema>;
const Login = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<LoginFormFields>({ resolver: zodResolver(loginFormSchema) });
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginError = (error: FirebaseError) => {
    switch (error.code) {
      case "auth/invalid-credential":
        toast.error("Invalid credentials");
        break;
      case "auth/wrong-password":
        toast.error("Incorrect password. Please try again.");
        break;
      case "auth/user-not-found":
        toast.error(
          "Email address not found. Please check your email or create an account."
        );
        break;
      case "auth/invalid-email":
        toast.error(
          "Invalid email address. Please enter a valid email format."
        );
        break;
      case "auth/too-many-requests":
        toast.error("Too many login attempts. Please try again later.");
        break;
      case "auth/account-exists-with-different-credential":
        toast.error(
          "An account already exists with the same email address but different sign-in credentials. Sign in using a provider associated with this email address."
        );
        break;
      case "auth/operation-not-allowed":
        toast.error("Login operation is not allowed. Please contact support.");
        break;
      case "auth/weak-password":
        toast.error("Password is too weak. Please choose a stronger password.");
        break;
      // Add more specific error handling cases as needed
      default:
        toast.error("An error occurred during login. Please try again later.");
    }
  };
  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const signInResult = await signInWithPopup(auth, provider);

      if (signInResult.user) {
        const user = signInResult.user;
        const userId = user.uid;

        const userDocRef = doc(db, "users", userId);
        const userDocSnapshot = await getDoc(userDocRef);

        if (userDocSnapshot.exists()) {
          // User document exists, proceed with sign in
          setUpCookies(signInResult);
          router.push("/dashboard");
        } else {
          // User document doesn't exist, create a new one
          const userData = {
            firstName: user.displayName?.split(" ")[0] || "",
            lastName: user.displayName?.split(" ")[1] || "",
            email: user.email || "",
            phoneNumber: null,
            emailSubscription: false,
            preferredEmirate: null,
            preferredDistrict: null,
          };

          await setDoc(userDocRef, userData);

          setUpCookies(signInResult);
          router.push("/dashboard");
        }
      } else {
        // Handle error if user is null
        console.error("User is null");
        toast.error("Sign in failed. Please try again.");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "An error occurred. Please try again.");
    }
  };
  const handleFacebookSignIn = async () => {
    try {
      const provider = new FacebookAuthProvider();
      const signInResult = await signInWithPopup(auth, provider);
      if (signInResult.user) {
        const user = signInResult.user;
        const userId = user.uid;

        const userDocRef = doc(db, "users", userId);
        const userDocSnapshot = await getDoc(userDocRef);

        if (userDocSnapshot.exists()) {
          // User document exists, proceed with sign in
          setUpCookies(signInResult);
          router.push("/dashboard");
        } else {
          // User document doesn't exist, create a new one
          const userData = {
            firstName: user.displayName?.split(" ")[0] || "",
            lastName: user.displayName?.split(" ")[1] || "",
            email: user.email || "",
            phoneNumber: null,
            emailSubscription: false,
            preferredEmirate: null,
            preferredDistrict: null,
          };

          await setDoc(userDocRef, userData);

          setUpCookies(signInResult);
          router.push("/dashboard");
        }
      } else {
        // Handle error if user is null
        console.error("User is null");
        toast.error("Sign in failed. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    }
  };

  const handleForgotPassword = async () => {
    const email = getValues("email");
    const validationCheck = loginFormSchema.safeParse({ email });
    if (!validationCheck.success) {
      toast.error("Invalid email address. Please enter a valid email format.");
      return;
    }
    try {
      const usersRef = collection(db, "users");
      const docQuery = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(docQuery);
      if (querySnapshot.empty) {
        toast.error(
          "No user found with this email address. Please check your email address and try again."
        );
        return;
      }
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent. Please check your inbox.");
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    }
  };

  const onSumbit: SubmitHandler<LoginFormFields> = async (data) => {
    try {
      const validationCheck = loginFormSchema.safeParse(data);
      if (validationCheck.success) {
        try {
          setIsLoading(true);
          const email = getValues("email");
          const usersRef = collection(db, "users");
          const docQuery = query(usersRef, where("email", "==", email));
          const querySnapshot = await getDocs(docQuery);
          if (querySnapshot.empty) {
            toast.error(
              "No user found with this email address. Please check your email address and try again."
            );
            setIsLoading(false);
            return;
          } else {
            await signInWithEmailAndPassword(auth, data.email, data.password)
              .then((res) => {
                setUpCookies(res);
                router.push("/dashboard");
                setIsLoading(false);
              })
              .catch((error: FirebaseError) => {
                console.log(error);
                handleLoginError(error);
                setIsLoading(false);
              });
          }
        } catch (error) {
          toast.error("An unexpected error occurred. Please try again later.");
          setIsLoading(false);
          console.log(error);
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again later.");
      console.log(error);
    }
  };
  const registerText = "Don't have an account?";
  return (
    <div
      className={`flex flex-col justify-center items-center gap-3 w-screen h-screen bg-darkPrimary`}
    >
      <form
        className={`bg-lightAccent gap-4 rounded-3xl px-8 py-6 flex flex-col justify-center items-center`}
        onSubmit={handleSubmit(onSumbit)}
      >
        <h1 className={`text-5xl mb-5 ${bebasNeue.className} tracking-wider`}>
          Login
        </h1>
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
        <button
          className="text-black text-sm underline self-start"
          type="button"
          onClick={() => handleForgotPassword()}
        >
          Forgot your password?
        </button>
        <button
          className={`px-3 py-2 rounded-md bg-lightSecondary text-[#FFFFFF] flex justify-center items-center gap-2 w-full`}
          type="submit"
        >
          {isLoading ? (
            <>
              <span>Logging in</span>
              <AiOutlineLoading3Quarters className="animate-spin h-4 w-4" />
            </>
          ) : (
            "Login"
          )}
        </button>
        <section className="grid grid-cols-3 gap-5 w-full">
          <button
            className={`flex gap-2 py-2 px-3 rounded-lg bg-[#FFFFFF] items-center justify-start`}
            type="button"
            onClick={() => handleGoogleSignIn()}
          >
            <FcGoogle className={`h-5 w-5`} />
            <p className={`text-sm text-[#000000] font-semibold`}>
              Continue with google
            </p>
          </button>
          <button
            className={`flex gap-2 py-2 px-3 rounded-lg bg-[#FFFFFF] items-center justify-start`}
            type="button"
            onClick={() => handleFacebookSignIn()}
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
        <div className={`w-[103%] h-[0.09rem] bg-lightSecondary`}></div>
        <Link
          href={"/register"}
          className={`text-lightSecondary text-sm hover:underline`}
        >
          {registerText}
        </Link>
      </form>
      <Toaster richColors className="z-1000 fixed" />
    </div>
  );
};

export default Login;
