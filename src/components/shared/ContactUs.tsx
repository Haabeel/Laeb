"use client";

import React, { useState } from "react";
import { FaPhone, FaSquareXTwitter } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import { FaInstagram, FaLinkedin, FaFacebookSquare } from "react-icons/fa";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { ROUTES_SEND_EMAIL } from "../../../routes";

const formSchema = z.object({
  name: z
    .string()
    .min(3)
    .max(20, { message: "Your name should be at least 3 characters long." }),
  email: z.string().email("Invalid email format."),
  message: z
    .string()
    .min(10, { message: "Your message should be at least 10 characters long." })
    .max(500),
});
export type FormFields = z.infer<typeof formSchema>;
const ContactUs = () => {
  const contactInfo = [
    {
      icon: <FaPhone className={`text-[#FFFFFF]`} />,
      contact: "+971 554078975",
    },
    {
      icon: <MdEmail className={`text-[#FFFFFF]`} />,
      contact: "laeb@info.com",
    },
  ];
  return (
    <section
      className={`flex sm:flex-row flex-col justify-stretch lg:gap-60 gap-5 lg:mx-auto mx-5`}
    >
      <section className={`flex flex-col gap-5 lg:w-[38.333333%] w-full`}>
        <h3 className={`text-2xl text-[#FFFFFF]`}>Contact us</h3>
        <p className={`text-lg text-[#FFFFFF]`}>
          Fill up the form and our team will revert back to you soon! <br />
          Hope to connect with you!!
        </p>
        {contactInfo.map((info) => {
          return (
            <div
              key={info.contact}
              className={`bg-darkSecondary text-[#FFFFFF] text-lg rounded-lg px-3 py-4 flex gap-3 items-center pl-8`}
            >
              {info.icon}
              <p>{info.contact}</p>
            </div>
          );
        })}
        <section className={`flex gap-4`}>
          <FaInstagram className={`text-[#FFFFFF] h-8 w-8`} />
          <FaLinkedin className={`text-[#FFFFFF] h-8 w-8`} />
          <FaFacebookSquare className={`text-[#FFFFFF] h-8 w-8`} />
          <FaSquareXTwitter className={`text-[#FFFFFF] h-8 w-8`} />
        </section>
      </section>
      <ContactUsForm />
    </section>
  );
};

const ContactUsForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    reset,
  } = useForm<FormFields>({
    resolver: zodResolver(formSchema),
  });
  const [characterCount, setCharacterCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    try {
      const result = formSchema.safeParse(data);
      if (result.success) {
        try {
          setIsLoading(true);
          const response = await fetch(ROUTES_SEND_EMAIL, {
            method: "POST",
            body: JSON.stringify(getValues()),
          }).then(() => {
            setIsLoading(false);
            reset();
            setCharacterCount(0);
          });
        } catch (error) {
          console.log(error);
        }
      } else {
        console.error(result.error.format());
      }
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <form
      className={`bg-darkSecondary rounded-2xl p-6 flex flex-col gap-4 sm:w-full lg:w-[35%] w-full`}
      onSubmit={handleSubmit(onSubmit)}
    >
      <section>
        <label htmlFor="name" className={`text-[#FFFFFF]`}>
          Your Name
        </label>
        <input
          type="text"
          id="name"
          className={`px-3 py-2 rounded-md bg-lightPrimary outline-none focus:outline-none w-full`}
          autoComplete="off"
          {...register("name")}
        />
        {errors.name && (
          <p className={`text-xs text-[#ffe0e0]`}>{errors.name.message}</p>
        )}
      </section>
      <section>
        <label htmlFor="email" className={`text-[#FFFFFF]`}>
          Your email
        </label>
        <input
          type="text"
          id="email"
          className={`px-3 py-2 rounded-md bg-lightPrimary outline-none focus:outline-none w-full`}
          autoComplete="off"
          {...register("email")}
        />
        {errors.email && (
          <p className={`text-xs text-[#ffe0e0]`}>{errors.email.message}</p>
        )}
      </section>
      <section>
        <label htmlFor="message" className={`text-[#FFFFFF]`}>
          Message
        </label>
        <textarea
          maxLength={500}
          id="message"
          className={`px-3 py-2 rounded-md bg-lightPrimary outline-none focus:outline-none resize-none w-full`}
          {...register("message", {
            onChange(event) {
              setCharacterCount(event.target.value.length);
            },
          })}
          rows={7}
        />
        <section className={`flex`}>
          {errors.message && (
            <p className={`text-xs text-[#ffe0e0]`}>{errors.message.message}</p>
          )}
          <p className={`text-xs text-end text-[#FFFFFF] flex-grow`}>
            {characterCount} / 500
          </p>
        </section>
      </section>
      <button
        className={`px-3 py-2 rounded-md bg-lightSecondary text-[#FFFFFF] flex justify-center items-center gap-2`}
        type="submit"
      >
        {isLoading ? (
          <>
            <span>Sending</span>
            <AiOutlineLoading3Quarters className="animate-spin h-4 w-4" />
          </>
        ) : (
          "Send"
        )}
      </button>
    </form>
  );
};
export default ContactUs;
