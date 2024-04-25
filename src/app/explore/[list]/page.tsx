"use client";

import {
  DBuser,
  Listing,
  Partner,
  ReceiptEmailProps,
  TimingRange,
  pageUser,
} from "@/types";
import { onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { auth, db } from "../../../../firebase.config";
import { doc, getDoc, runTransaction, updateDoc } from "firebase/firestore";
import { Toaster, toast } from "sonner";
import Logo from "@/assets/images/logo-nobg.png";
import Image from "next/image";
import Link from "next/link";
import { FaBurger, FaLocationDot } from "react-icons/fa6";
import { MdOutlineEmail } from "react-icons/md";
import { FaPhoneAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import {
  ROUTES_DASHBOARD,
  ROUTES_EXPLORE,
  ROUTES_HOME,
  ROUTES_LOGIN,
  ROUTES_PARTNER_DASHBOARD,
} from "../../../../routes";
import Carousel from "@/components/ui/Carousel";
import { Calendar } from "@/components/ui/calendar";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import {
  CompareDates,
  getDuration,
  haveSameDate,
  validateCreditCard,
} from "@/lib/utils";
import { formatDate, isSameDay, set } from "date-fns";
import { useRouter } from "next/navigation";
import { start } from "repl";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { IoTime } from "react-icons/io5";
import { FaMoneyBill, FaCalendar } from "react-icons/fa";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { RxHamburgerMenu } from "react-icons/rx";

const cardFormSchema = z.object({
  cardHolder: z.string().min(3, "Name is too short"),
  cardNumber: z.string().length(16, "Card number must be 16 digits"),
  expiry: z.string().length(5, "Invalid expiry date"),
  cvv: z.string().length(3, "Invalid CVV"),
});

type CardForm = z.infer<typeof cardFormSchema>;

const List = ({ params }: { params: { list: string } }) => {
  const router = useRouter();
  const [pUser, setPUser] = useState<pageUser | null>(null);
  const [listing, setListing] = useState<Listing | null>(null);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [date, setDate] = useState<Date>();
  const [paymentOptions, setPaymentOptions] = useState<"card" | "cash">("card");
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CardForm>({
    resolver: zodResolver(cardFormSchema),
  });
  const handleFormSubmit = (timing: TimingRange) =>
    handleSubmit((data) => onSubmit(data, timing));
  const onSubmit = (data: CardForm, timing: TimingRange) => {
    const isValid = cardFormSchema.safeParse(data);
    if (!isValid.success) {
      toast.error("Invalid form data");
      return;
    }
    if (
      data.expiry.split("/")[1] <
      new Date().getFullYear().toString().slice(2, 4)
    ) {
      toast.error("Card expired");
      return;
    }
    if (data.expiry.split("/")[0] < new Date().getMonth().toString()) {
      toast.error("Card expired");
      return;
    }
    const isValidCardNumber = validateCreditCard(data.cardNumber);
    if (!isValidCardNumber) {
      toast.error("Invalid card number");
      return;
    }
    if (!/^\d{3,4}$/.test(data.cvv)) {
      console.log("Invalid CVV");
      toast.error("Invalid CVV");
      return;
    }
    handleBooking(params.list, date!!, timing);
  };
  const handleBooking = async (
    listingId: string,
    date: Date,
    timing: TimingRange
  ) => {
    if (!partner || !listing || !pUser) return;
    setLoading(true);
    const loader = toast.loading("Booking...");
    try {
      const listingDocRef = doc(db, "listings", listingId);
      await runTransaction(db, async (transaction) => {
        const listingDocSnapshot = await transaction.get(listingDocRef);
        if (listingDocSnapshot.exists()) {
          const listingData = listingDocSnapshot.data() as Listing | undefined;
          if (listingData) {
            const newDates = listingData.dates.map((d) => {
              if (isSameDay(date, new Date(d.date))) {
                const newTimings = d.timings.map((t) => {
                  if (
                    t.startTime === timing.startTime &&
                    t.endTime === timing.endTime
                  ) {
                    return {
                      ...t,
                      booking: {
                        userID: pUser?.user.uid || null,
                        status: pUser?.user.uid ? "confirmed" : null,
                        paymentOptions,
                      },
                    };
                  }
                  return t;
                });
                return {
                  date: d.date,
                  timings: newTimings,
                };
              }
              return d;
            });
            transaction.update(listingDocRef, { dates: newDates });
          }
        }
      }).then(async () => {
        if (!pUser) return;
        const userRef = doc(db, "users", pUser.user.uid);
        const userDocSnapshot = await getDoc(userRef);
        if (!userDocSnapshot.exists()) return;
        const dbUser = userDocSnapshot.data() as DBuser;
        const bookings = dbUser.bookings ?? [];
        const newBooking = {
          listingId,
          date: date.toISOString(),
          time: {
            startTime: timing.startTime,
            endTime: timing.endTime,
            price: timing.price,
            status: "confirmed",
          },
        };
        await updateDoc(userRef, { bookings: [...bookings, newBooking] });
      });
      const newDates = listing!!.dates.map((d) => {
        if (isSameDay(date, new Date(d.date))) {
          const newTimings = d.timings.map((t) => {
            if (
              t.startTime === timing.startTime &&
              t.endTime === timing.endTime
            ) {
              return {
                ...t,
                booking: {
                  userID: pUser!!.user.uid,
                  status: "confirmed" as "confirmed" | "cancelled" | "pending",
                },
              };
            }
            return t;
          });
          return {
            date: d.date,
            timings: newTimings,
          };
        }
        return d;
      });

      const body: {
        to: string;
        subject: string;
      } & ReceiptEmailProps = {
        laebEmail: "laebhelpcenter@gmail.com",
        laebFacebook: "laebuae",
        laebInstagram: "laebuae",
        laebPhone: "+971 504078975",
        laebTwitter: "laebuae",
        listingBy: partner.companyName,
        listingDate: formatDate(date, "dd/MM/yyyy"),
        listingEmail:
          partner.contactInfo?.find((c) => c.type === "email")?.value ??
          partner.companyEmail,
        listingLocation: listing.location,
        listingPhone:
          partner.contactInfo?.find((c) => c.type === "phone")?.value ??
          partner.companyPhoneNumber,
        listingPrice: timing.price.toString(),
        listingTime: `${timing.startTime} - ${timing.endTime}`,
        listingUrl: `https://laebuae@gmail.com/explore/${listingId}`,
        partnerPage: `https://laebuae@gmail.com/partner/${partner.id}`,
        paymentMethod: paymentOptions,
        recieptID: pUser.user.uid.slice(0, 5),
        userName: pUser.user.displayName ?? pUser.user.email ?? "User",
        to: pUser.user.email!!,
        subject: "Booking Confirmation",
      };
      await fetch("/api/mail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authKey: `${process.env.NEXT_PUBLIC_ADMIN_USERNAME}:${process.env.NEXT_PUBLIC_ADMIN_PASSWORD}`,
        },
        body: JSON.stringify(body),
      })
        .then((res) => {
          console.log(res.json());
          toast.success(
            "Booking successful; Receipt has been sent to your email account."
          );
          setListing((prev) => {
            if (!prev) return prev;
            return { ...prev, dates: newDates };
          });
        })
        .catch((error) => {
          toast.error("Error sending receipt");
        });
    } catch (error) {
      toast.error("Error booking");
      console.log(error);
    } finally {
      toast.dismiss(loader);
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (mUser) => {
      if (mUser) {
        const userDocRef = doc(db, "users", mUser.uid);
        const userDocSnapshot = await getDoc(userDocRef);
        if (userDocSnapshot.exists()) {
          setPUser({ user: mUser, isPartner: false, isAuth: true });
        } else {
          const partnerDocRef = doc(db, "partners", mUser.uid);
          const partnerDocSnapshot = await getDoc(partnerDocRef);
          if (partnerDocSnapshot.exists()) {
            if (partnerDocSnapshot.id === mUser.uid) {
              setPUser({ user: mUser, isPartner: true, isAuth: true });
            } else {
              setPUser({ user: mUser, isPartner: true, isAuth: false });
            }
          } else {
            setPUser(null);
          }
        }
      }
    });
    return () => unsubscribe();
  }, []);
  useEffect(() => {
    const getListingDocument = async () => {
      try {
        const docRef = doc(db, "listings", params.list);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setListing(docSnap.data() as Listing);
          setDate(new Date());
        } else {
          setListing(null);
        }
      } catch (error) {
        toast.error("Error fetching listing");
      }
    };
    getListingDocument();
  }, [params]);

  useEffect(() => {
    if (!listing) return;
    const getPartnerDocument = async () => {
      try {
        const docRef = doc(db, "partners", listing.partnerId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPartner(docSnap.data() as Partner);
        } else {
          setPartner(null);
        }
      } catch (error) {
        toast.error("Error fetching partner");
      }
    };
    getPartnerDocument();
  }, [listing]);

  return (
    <div className="flex flex-col bg-night max-w-[100vw] min-h-screen overflow-y-auto overflow-x-hidden items-center justify-start text-white">
      <nav className="flex p-5 items-center justify-between h-[12vh] w-full">
        <Link href={ROUTES_HOME} className="w-full h-full overflow-hidden">
          <Image
            src={Logo}
            height={500}
            width={1000}
            alt="logo"
            className="object-cover h-full w-auto"
          />
        </Link>
        <section>
          <RxHamburgerMenu
            onClick={() => setDrawerOpen(!drawerOpen)}
            className="md:hidden w-8 h-8 text-lightPrimary"
          />
        </section>
        <section className="hidden items-center justify-center md:flex gap-6 h-full">
          <Link
            href={ROUTES_EXPLORE}
            className="bg-ebony w-48 text-center h-full flex items-center justify-center text-white text-lg rounded-md hover:bg-lightPrimary hover:text-ebony font-semibold tracking-wide"
          >
            Explore
          </Link>
          {pUser ? (
            <Link
              className="bg-ebony w-48 text-center h-full flex items-center justify-center text-white text-lg rounded-md hover:bg-lightPrimary hover:text-ebony font-semibold tracking-wide"
              href={
                pUser.isAuth
                  ? pUser.isPartner
                    ? ROUTES_PARTNER_DASHBOARD
                    : ROUTES_DASHBOARD
                  : ROUTES_LOGIN
              }
            >
              {pUser.isAuth ? "Dashboard" : "Login"}
            </Link>
          ) : (
            <Link
              href={ROUTES_LOGIN}
              className="bg-ebony w-48 text-center h-full flex items-center justify-center text-white text-lg rounded-md hover:bg-lightPrimary hover:text-ebony font-semibold tracking-wide"
            >
              Login
            </Link>
          )}
        </section>
      </nav>
      {!listing ? (
        <div className=" w-full h-full text-6xl shadow-[inset_-10px_-10px_30px_4px_rgba(0,0,0,0.1),_10px_10px_30px_4px_rgba(255,255,255,0.15)]">
          No listing found with this ID
        </div>
      ) : (
        <div className="w-full h-full flex flex-col gap-5 pt-2 items-center justify-center shadow-[inset_-10px_-10px_30px_4px_rgba(0,0,0,0.1),_10px_10px_30px_4px_rgba(255,255,255,0.15)] overflow-hidden xl:px-28 lg:px-20 px-5 relative">
          {drawerOpen && (
            <section className="absolute inset-0 w-full h-min p-5 items-center justify-center gap-3 flex flex-col sm:hidden bg-ebony">
              <Link
                href={ROUTES_EXPLORE}
                className="bg-darkPrimary w-48 text-center h-full flex items-center justify-center text-white text-lg rounded-md hover:bg-lightPrimary hover:text-ebony font-semibold tracking-wide px-3 py-2"
              >
                Explore
              </Link>
              {pUser ? (
                <Link
                  className="bg-darkPrimary w-48 text-center h-full flex items-center justify-center text-white text-lg rounded-md hover:bg-lightPrimary hover:text-ebony font-semibold tracking-wide px-3 py-2"
                  href={
                    pUser.isAuth
                      ? pUser.isPartner
                        ? ROUTES_PARTNER_DASHBOARD
                        : ROUTES_DASHBOARD
                      : ROUTES_LOGIN
                  }
                >
                  {pUser.isAuth ? "Dashboard" : "Login"}
                </Link>
              ) : (
                <Link
                  href={ROUTES_LOGIN}
                  className="bg-darkPrimary w-48 text-center h-full flex items-center justify-center text-white text-lg rounded-md hover:bg-lightPrimary hover:text-ebony font-semibold tracking-wide px-3 py-2"
                >
                  Login
                </Link>
              )}
            </section>
          )}
          <section className="flex flex-col gap-1 w-full">
            <h1 className="text-3xl text-lightPrimary font-semibold tracking-wider w-full">
              {listing.name}
            </h1>
            <span className="flex gap-1 items-center w-full">
              <FaLocationDot className="h-7 w-7 text-lightAccent" />
              <h2 className="text-xl text-lightAccent tracking-wider w-full">
                {listing.location}
              </h2>
            </span>
          </section>
          <section className="md:grid md:grid-cols-2 md:gap-x-14 flex flex-col gap-10 w-full h-full overflow-hidden">
            <p className="text-lg text-lightAccent border border-lightAccent px-2 py-1 rounded-md col-span-2 w-min self-start mb-2">
              {listing.sport}
            </p>
            <section className="flex flex-col w-full h-full items-center justify-start gap-5">
              <section className="flex flex-col w-full items-center justify-start gap-1">
                <Carousel
                  images={listing.images}
                  className="flex flex-col items-center gap-2 overflow-hidden"
                />
              </section>
              <section className="flex flex-col w-full items-center gap-2">
                <div className="text-xl text-white w-full">
                  Get in touch with{" "}
                  <span className="text-bold underline text-lightAccent">
                    <Link href={`/partner/${partner?.id}`}>
                      {partner && (partner.companyName ?? "the partner")}
                    </Link>
                  </span>
                </div>
                {partner && partner.contactInfo && (
                  <div className="xl:grid xl:grid-cols-2 flex flex-col gap-1 w-full lg:place-content-center">
                    {partner.contactInfo.map((contact, index) => (
                      <div
                        key={index}
                        className="text-lg text-lightAccent border border-lightAccent px-2 py-1 rounded-md flex items-center gap-3 self-start"
                      >
                        {contact.type === "email" && (
                          <MdOutlineEmail className="w-6 h-6" />
                        )}
                        {contact.type === "phone" && (
                          <FaPhoneAlt className="w-5 h-5" />
                        )}
                        {contact.value}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </section>
            <section className="flex flex-col w-full h-full justify-start items-center gap-3">
              <section className="flex flex-col w-full items-center justify-start gap-3">
                <p className="text-lg text-white border w-full border-lightAccent rounded-lg p-3 h-96 overflow-y-auto overflow-x-hidden sticky-container">
                  {listing.description}
                </p>
              </section>

              {listing.categories && (
                <section className="flex flex-col w-full items-center gap-2">
                  <h1 className="text-xl w-full text-white">Categories</h1>
                  <div className="grid grid-cols-2 gap-2 w-full">
                    {listing.categories.map((category, index) => (
                      <div
                        key={index}
                        className="text-lg text-lightAccent border border-lightAccent px-2 py-1 rounded-md"
                      >
                        {category}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </section>
            <section className="mt-10 flex flex-col items-center justify-center col-span-2 w-full h-full gap-5 pb-10">
              <h2 className="text-2xl text-lightPrimary font-semibold w-full text-center">
                Book The venue
              </h2>
              <div className="h-full w-full flex xl:flex-row flex-col items-center justify-center gap-3">
                <section className="flex flex-col gap-2 items-center justify-center w-full self-start">
                  <h3 className="text-xl text-lightPrimary">Select a date</h3>
                  <Calendar
                    mode="single"
                    disabled={{
                      before: new Date(),
                      after: new Date(
                        listing.dates[listing.dates.length - 1].date
                      ),
                    }}
                    selected={date}
                    onSelect={setDate}
                    className="border border-ebony rounded-lg bg-darkPrimary"
                    classNames={{
                      table: "w-full h-full",
                      cell: "md:w-16 md:h-16 w-10 h-10 text-lg flex items-center justify-center",
                      head_cell:
                        "md:w-16 md:h-16 w-10 h-10 text-lg flex items-center justify-center",
                      button: "w-full h-full",
                      nav_button_next: "absolute right-1 w-min h-min",
                      nav_button_previous: "absolute left-1 w-min h-min",
                      day_selected: `${"text-darkPrimary bg-lightPrimary"}`,
                      caption_label: "text-xl",
                    }}
                    components={{
                      IconLeft() {
                        return <ChevronLeftIcon className="h-8 w-8" />;
                      },
                      IconRight() {
                        return <ChevronRightIcon className="h-8 w-8" />;
                      },
                    }}
                    initialFocus
                  />
                </section>
                <div className="flex flex-col items-center justify-center w-full self-start gap-2">
                  <h3 className="text-xl text-lightPrimary col-span-6">
                    Select the Time
                  </h3>
                  <div className="grid sm:grid-cols-6 grid-cols-4 gap-2 w-full">
                    {listing.dates
                      .find((d) => isSameDay(date ?? new Date(), d.date))
                      ?.timings.map((timing, index) => {
                        const currentDate = date ?? new Date();
                        let isBooked = timing.booking.userID != null;
                        return (
                          <Drawer key={index}>
                            <DrawerTrigger asChild>
                              <button
                                disabled={isBooked || loading}
                                className={`text-lightPrimary ${
                                  loading && "cursor-progress"
                                } ${
                                  isBooked
                                    ? "bg-capuut cursor-not-allowed"
                                    : "bg-darkPrimary"
                                } flex flex-col gap-1 items-center justify-center aspect-square rounded-lg w-fit h-fit p-2`}
                                key={index}
                              >
                                <p className="font-bold text-xs">
                                  {timing.startTime + " - " + timing.endTime}
                                </p>
                                <p className="text-xs">
                                  {"AED " + timing.price}
                                </p>
                                <p className="text-xs">
                                  {getDuration(
                                    timing.startTime,
                                    timing.endTime
                                  )}
                                </p>
                              </button>
                            </DrawerTrigger>
                            <DrawerContent className="flex flex-col items-center justify-center bg-night max-h-screen">
                              <div className="overflow-y-auto px-10 flex flex-col items-center justify-center sticky-container gap-5 mt-5">
                                <h1 className="text-xl text-white">
                                  Booking Details
                                </h1>
                                <div className="flex gap-10 items-center justify-center">
                                  <section className="flex flex-col items-start justify-center self-start gap-2">
                                    <p className="text-lg font-bold text-lightAccent">
                                      {listing.name}
                                    </p>
                                    <div className="text-sm flex items-center justify-center gap-2 text-lightAccent">
                                      <FaLocationDot />
                                      <p>{listing.location}</p>
                                    </div>
                                    <div className="text-sm text-lightAccent flex items-center justify-center gap-2">
                                      <IoTime />
                                      <p>
                                        {timing.startTime} - {timing.endTime}
                                      </p>
                                    </div>
                                    <div className="text-sm text-lightAccent flex items-center justify-center gap-2">
                                      <FaMoneyBill />
                                      <p>AED {timing.price}</p>
                                    </div>
                                    <div className="text-sm text-lightAccent flex items-center justify-center gap-2">
                                      <FaCalendar />
                                      <p>
                                        {date === undefined
                                          ? new Date()
                                              .toISOString()
                                              .split("T")[0]
                                          : date.toISOString().split("T")[0]}
                                      </p>
                                    </div>
                                  </section>
                                  <section className="flex flex-col items-center gap-5 self-start">
                                    <h2 className="text-white font-semibold text-lg self-start">
                                      Payment Options
                                    </h2>
                                    <RadioGroup
                                      onValueChange={(value) =>
                                        setPaymentOptions(
                                          value as "card" | "cash"
                                        )
                                      }
                                      defaultValue={paymentOptions}
                                    >
                                      <section className="flex items-center gap-2">
                                        <RadioGroupItem
                                          value="card"
                                          id="card"
                                          className="text-white"
                                        />
                                        <label
                                          htmlFor="card"
                                          className="text-white text-sm"
                                        >
                                          Pay by card online
                                        </label>
                                      </section>
                                      <section className="flex items-center gap-2">
                                        <RadioGroupItem
                                          value="cash"
                                          id="cash"
                                          className="text-white"
                                        />
                                        <label
                                          htmlFor="cash"
                                          className="text-white text-sm"
                                        >
                                          Pay by cash at the venue
                                        </label>
                                      </section>
                                    </RadioGroup>
                                  </section>
                                </div>
                                {paymentOptions === "card" && (
                                  <form
                                    onSubmit={handleFormSubmit(timing)}
                                    className={`grid grid-cols-2 text-xs items-center gap-3 w-full`}
                                  >
                                    <h2 className="text-lg font-semibold col-span-2 text-white">
                                      Card Information
                                    </h2>
                                    <section className="flex flex-col w-full h-full justify-center gap-1">
                                      <label
                                        htmlFor="cardHolder"
                                        className="text-lightAccent"
                                      >
                                        Card Holder
                                      </label>
                                      <input
                                        type="text"
                                        id="cardHolder"
                                        className={`px-3 py-2 rounded-md bg-lightPrimary outline-none focus:outline-none w-full focus:shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,_rgba(0,0,0,0.3)_0px_3px_7px_-3px]`}
                                        {...register("cardHolder")}
                                      />
                                      {errors.cardNumber && (
                                        <p className="text-red-500 text-sm">
                                          {errors.cardNumber.message}
                                        </p>
                                      )}
                                    </section>
                                    <section className="flex flex-col w-full h-full justify-center gap-1">
                                      <label
                                        htmlFor="cardNumber"
                                        className="text-lightAccent"
                                      >
                                        Card Number
                                      </label>
                                      <input
                                        type="text"
                                        id="cardNumber"
                                        className={`px-3 py-2 rounded-md bg-lightPrimary outline-none focus:outline-none w-full focus:shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,_rgba(0,0,0,0.3)_0px_3px_7px_-3px]`}
                                        {...register("cardNumber")}
                                      />
                                      {errors.cardNumber && (
                                        <p className="text-red-500 text-sm">
                                          {errors.cardNumber.message}
                                        </p>
                                      )}
                                    </section>
                                    <section className="flex flex-col w-full h-full justify-center gap-1">
                                      <label
                                        htmlFor="expiry"
                                        className="text-lightAccent"
                                      >
                                        Card Expiry
                                      </label>
                                      <input
                                        type="text"
                                        id="expiry"
                                        className={`px-3 py-2 rounded-md bg-lightPrimary outline-none focus:outline-none w-full focus:shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,_rgba(0,0,0,0.3)_0px_3px_7px_-3px]`}
                                        {...register("expiry")}
                                      />
                                      {errors.expiry && (
                                        <p className="text-red-500 text-sm">
                                          {errors.expiry.message}
                                        </p>
                                      )}
                                    </section>
                                    <section className="flex flex-col w-full h-full justify-center gap-1">
                                      <label
                                        htmlFor="cvv"
                                        className="text-lightAccent"
                                      >
                                        Card CVV
                                      </label>
                                      <input
                                        type="text"
                                        id="cvv"
                                        className={`px-3 py-2 rounded-md bg-lightPrimary outline-none focus:outline-none w-full focus:shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,_rgba(0,0,0,0.3)_0px_3px_7px_-3px]`}
                                        {...register("cvv")}
                                      />
                                      {errors.cvv && (
                                        <p className="text-red-500 text-sm">
                                          {errors.cvv.message}
                                        </p>
                                      )}
                                    </section>
                                  </form>
                                )}
                                <DrawerClose
                                  className="bg-darkSecondary rounded-lg px-3 w-full py-2 text-xl text-white mb-5"
                                  onClick={() => {
                                    if (!pUser?.isAuth) {
                                      toast.error("Login to book", {
                                        action: {
                                          label: "Login",
                                          onClick: () => {
                                            router.push(ROUTES_LOGIN);
                                          },
                                        },
                                        actionButtonStyle: {
                                          padding: "1rem 2rem",
                                          backgroundColor: "#1f2937",
                                        },
                                      });
                                      return;
                                    }
                                    if (pUser.isPartner) {
                                      toast.error("Partners cannot book");
                                      return;
                                    }

                                    handleBooking(
                                      params.list,
                                      currentDate,
                                      timing
                                    );
                                  }}
                                >
                                  Book
                                </DrawerClose>
                              </div>
                            </DrawerContent>
                          </Drawer>
                        );
                      })}
                  </div>
                </div>
              </div>
            </section>
          </section>
        </div>
      )}
      <Toaster richColors />
    </div>
  );
};

export default List;
