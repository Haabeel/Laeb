"use client";

import { validateCreditCardDetails } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import bcrypt from "bcryptjs";
import { AES } from "crypto-js";
import Cookies from "js-cookie";
import {
  IdTokenResult,
  UserCredential,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { Bebas_Neue } from "next/font/google";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { Toaster, toast } from "sonner";
import { z } from "zod";
import { auth, db } from "../../../../firebase.config";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { ROUTES_VERIFICATION_EMAIL } from "../../../../routes";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
});

const partnerUpFormSchema = z.object({
  companyName: z.string().trim().max(15).min(3),
  companyEmail: z.string().trim().email("invalid email format"),
  companyPhoneNumber: z.string().trim().max(9).min(9),
  companyPassword: z
    .string()
    .trim()
    .min(6, "Password must be at least 6 characters"),
  companyConfirmPassword: z.string().trim().min(6),
  companyCardNumber: z.string().trim().max(16).min(16),
  companyCardHolder: z.string().trim().max(15).min(3),
  companyCardExpiryMonth: z.string().trim().max(2).min(2),
  companyCardExpiryYear: z.string().trim().max(2).min(2),
  companyCardCVV: z.string().trim().max(3).min(3),
});
export type PartnerUpFormFields = z.infer<typeof partnerUpFormSchema>;
const SignUp = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<PartnerUpFormFields>({
    resolver: zodResolver(partnerUpFormSchema),
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const onSubmit = async (data: PartnerUpFormFields) => {
    if (data.companyPassword != data.companyConfirmPassword)
      return toast.error("Passwords do not match");

    try {
      const validationCheck = partnerUpFormSchema.safeParse(data);
      if (!validationCheck.success) {
        return toast.error(errors.root?.message);
      } else {
        const isCardValid: boolean | { cardType: string; isValid: boolean } =
          validateCreditCardDetails(
            getValues("companyCardNumber"),
            getValues("companyCardExpiryMonth") +
              "/" +
              getValues("companyCardExpiryYear"),
            getValues("companyCardCVV")
          );
        if (typeof isCardValid !== "boolean" && isCardValid) {
          const cardType = isCardValid.cardType;
          const isValid = isCardValid.isValid;
          if (isValid) {
            setIsLoading(true);
            const user: UserCredential = await createUserWithEmailAndPassword(
              auth,
              data.companyEmail,
              data.companyPassword
            );
            await updateProfile(user.user, { displayName: data.companyName });
            const salt = await bcrypt.genSalt(10);
            const key = await bcrypt.hash(data.companyPassword, salt);
            const cardNumber = AES.encrypt(
              data.companyCardNumber,
              key
            ).toString();
            const cardCVV = AES.encrypt(data.companyCardCVV, key).toString();
            await setDoc(doc(db, "partners", user.user.uid), {
              companyName: data.companyName,
              companyEmail: data.companyEmail,
              companyPhoneNumber: "+971" + data.companyPhoneNumber,
              cardType: cardType,
              cardHolder: data.companyCardHolder,
              cardNumber,
              cardExpiry:
                data.companyCardExpiryMonth + "/" + data.companyCardExpiryYear,
              cardCVV,
              key,
            }).then(() => {
              Cookies.set("isAuth", "true");
              Cookies.set("isPartner", "true");
              router.push(ROUTES_VERIFICATION_EMAIL);
            });
          }
        } else {
          return toast.error("Invalid Card Details");
        }
      }
    } catch (error) {
      toast.error("Something Went wrong");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="bg-[#626D58] flex flex-col justify-center items-center py-4 px-5 gap-3 w-screen h-screen">
      <form
        className={`bg-lightAccent gap-4 rounded-md px-8 py-6 flex flex-col justify-center items-center`}
        onSubmit={handleSubmit(onSubmit)}
      >
        <h1 className={`text-5xl mb-2 ${bebasNeue.className}`}>Partner Up</h1>

        <section
          className={`flex flex-col justify-center w-full items-center gap-3`}
        >
          <h2 className="self-start font-bold text-lg">Company Details</h2>
          <section className={`w-full`}>
            <label htmlFor="companyName">Company Name*</label>
            <input
              type="text"
              id="companyName"
              placeholder="Name of your company"
              {...register("companyName")}
              className={`px-3 py-2 rounded-md bg-lightPrimary outline-none focus:outline-none w-full focus:shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,_rgba(0,0,0,0.3)_0px_3px_7px_-3px]`}
            />
            {errors.companyName && (
              <p className={`text-xs text-[#000000]`}>
                {errors.companyName.message}
              </p>
            )}
          </section>
          <section className={`w-full`}>
            <label htmlFor="companyEmail">Company Email*</label>
            <input
              type="email"
              id="companyEmail"
              placeholder="Email of your company"
              {...register("companyEmail")}
              className={`px-3 py-2 rounded-md bg-lightPrimary outline-none focus:outline-none w-full focus:shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,_rgba(0,0,0,0.3)_0px_3px_7px_-3px]`}
            />
            {errors.companyEmail && (
              <p className={`text-xs text-[#000000]`}>
                {errors.companyEmail.message}
              </p>
            )}
          </section>
          <section className={`w-full`}>
            <label htmlFor="companyPhoneNumber">Company Phone Number*</label>
            <input
              type="tel"
              id="companyPhoneNumber"
              placeholder="Phone number of your company"
              {...register("companyPhoneNumber")}
              className={`px-3 py-2 rounded-md bg-lightPrimary outline-none focus:outline-none w-full focus:shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,_rgba(0,0,0,0.3)_0px_3px_7px_-3px]`}
            />
            {errors.companyPhoneNumber && (
              <p className={`text-xs text-[#000000]`}>
                {errors.companyPhoneNumber.message}
              </p>
            )}
          </section>
          <section className="flex justify-between w-full gap-4">
            <section className={`w-full`}>
              <label htmlFor="companyPassword">Password*</label>
              <input
                type="password"
                id="companyPassword"
                placeholder="Password"
                {...register("companyPassword")}
                className={`px-3 py-2 rounded-md bg-lightPrimary outline-none focus:outline-none w-full focus:shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,_rgba(0,0,0,0.3)_0px_3px_7px_-3px]`}
              />
              {errors.companyPassword && (
                <p className={`text-xs text-[#000000]`}>
                  {errors.companyPassword.message}
                </p>
              )}
            </section>
            <section className={`w-full`}>
              <label htmlFor="companyConfirmPassword">Confirm Password*</label>
              <input
                type="password"
                id="companyConfirmPassword"
                placeholder="Confirm Password"
                {...register("companyConfirmPassword")}
                className={`px-3 py-2 rounded-md bg-lightPrimary outline-none focus:outline-none w-full focus:shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,_rgba(0,0,0,0.3)_0px_3px_7px_-3px]`}
              />
              {errors.companyConfirmPassword && (
                <p className={`text-xs text-[#000000]`}>
                  {errors.companyConfirmPassword.message}
                </p>
              )}
            </section>
          </section>
        </section>
        <section className="w-full flex flex-col gap-3">
          <h2 className="self-start font-bold text-lg">Payment Details</h2>
          <section className="flex justify-between gap-4 items-center">
            <section className={`w-full`}>
              <label htmlFor="companyCardNumber">Card Holder*</label>
              <input
                type="text"
                id="companyCardHolder"
                placeholder="Card Holder"
                {...register("companyCardHolder")}
                className={`px-3 py-2 rounded-md bg-lightPrimary outline-none focus:outline-none w-full focus:shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,_rgba(0,0,0,0.3)_0px_3px_7px_-3px]`}
              />
              {errors.companyCardHolder && (
                <p className={`text-xs text-[#000000]`}>
                  {errors.companyCardHolder.message}
                </p>
              )}
            </section>
            <section className={`w-full`}>
              <label htmlFor="companyCardNumber">Card Number*</label>
              <input
                type="text"
                id="companyCardNumber"
                placeholder="Card Number"
                {...register("companyCardNumber")}
                className={`px-3 py-2 rounded-md bg-lightPrimary outline-none focus:outline-none w-full focus:shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,_rgba(0,0,0,0.3)_0px_3px_7px_-3px]`}
              />
              {errors.companyCardNumber && (
                <p className={`text-xs text-[#000000]`}>
                  {errors.companyCardNumber.message}
                </p>
              )}
            </section>
          </section>

          <section className={`w-full flex justify-between items-center gap-4`}>
            <section className={`w-1/2`}>
              <label htmlFor="companyCardExpiry">Card Expiry*</label>
              <div className="flex gap-1 justify-center items-center rounded-md bg-lightPrimary w-full">
                <input
                  type="number"
                  id="companyCardExpiryMonth"
                  maxLength={2}
                  placeholder="MM"
                  {...register("companyCardExpiryMonth")}
                  className={`px-3 py-2 rounded-md bg-lightPrimary outline-none focus:outline-none w-full focus:shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,_rgba(0,0,0,0.3)_0px_3px_7px_-3px]`}
                />
                <span className="text-2xl">/</span>
                <input
                  type="number"
                  id="companyCardExpiryYear"
                  maxLength={2}
                  min={1}
                  placeholder="YY"
                  {...register("companyCardExpiryYear")}
                  className={`px-3 py-2 rounded-md bg-lightPrimary outline-none focus:outline-none w-full focus:shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,_rgba(0,0,0,0.3)_0px_3px_7px_-3px]`}
                />
              </div>
              {errors.companyCardExpiryMonth && (
                <p className={`text-xs text-[#000000]`}>
                  {errors.companyCardExpiryMonth.message}
                </p>
              )}
              {errors.companyCardExpiryYear && (
                <p className={`text-xs text-[#000000]`}>
                  {errors.companyCardExpiryYear.message}
                </p>
              )}
            </section>
            <section className={`w-1/2`}>
              <label htmlFor="companyCardCVC">Card CVV*</label>
              <input
                type="text"
                id="companyCardCVV"
                placeholder="CVV"
                {...register("companyCardCVV")}
                className={`px-3 py-2 rounded-md bg-lightPrimary outline-none focus:outline-none w-full focus:shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,_rgba(0,0,0,0.3)_0px_3px_7px_-3px]`}
              />
              {errors.companyCardCVV && (
                <p className={`text-xs text-[#000000]`}>
                  {errors.companyCardCVV.message}
                </p>
              )}
            </section>
          </section>
        </section>
        <button
          type="submit"
          className={`bg-[#56282D] w-full flex justify-center items-center gap-3 text-white px-3 py-2 rounded-md`}
        >
          {isLoading ? (
            <>
              <span>Registering</span>
              <AiOutlineLoading3Quarters className="animate-spin h-4 w-4" />
            </>
          ) : (
            "Sign Up"
          )}
        </button>
      </form>
      <Toaster richColors />
    </div>
  );
};

export default SignUp;
