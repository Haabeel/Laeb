import DashboardNav from "@/components/Dashboard/DashboardNav";
import { DBuser, Listing, Partner } from "@/types";
import { User } from "firebase/auth";
import { deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../../../../../firebase.config";
import Image from "next/image";
import { format, isSameDay, set } from "date-fns";
import { FaLocationDot, FaLocationPin, FaMoneyBill } from "react-icons/fa6";
import { BsCalendar, BsClock, BsPhone } from "react-icons/bs";
import { getPriceRange } from "@/lib/utils";
import Link from "next/link";
import DropdownMenu from "@/components/shared/DropdownMenu";
import { DnDProvider } from "@/lib/DnDContext";
import { DndProvider, useDrag } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { MdAccountBox, MdEmail } from "react-icons/md";
import { toast } from "sonner";
import Field from "@/components/shared/Field";
const Listings = ({
  user,
  partner,
  setSelectedListing,
  listings,
  setListings,
  loading,
  setLoading,
}: {
  user: User | null;
  partner: Partner | null;
  setSelectedListing: React.Dispatch<React.SetStateAction<Listing | null>>;
  listings: Listing[] | null;
  setListings: React.Dispatch<React.SetStateAction<Listing[] | null>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [navTab, setNavTab] = useState<"Closed" | "Open" | "Upcoming">("Open");
  const [openListings, setOpenListings] = useState<Listing[]>([]);
  const [closedListings, setClosedListings] = useState<Listing[]>([]);
  const [upcomingListings, setUpcomingListings] = useState<Listing[]>([]);
  const [items, setItems] = useState<number>(2);
  const [view, setView] = useState<"Detailed" | "List">("Detailed");
  const [views, setViews] = useState<string[]>(["Detailed", "List"]);

  useEffect(() => {
    if (listings === null || listings === undefined) return;
    console.log(listings);
    if (listings.length === 0) return;
    const openListings = listings.filter(
      (listing) =>
        new Date(listing.dates[listing.dates.length - 1].date) > new Date() &&
        new Date(listing.dates[0].date) < new Date()
    );
    const closedListings = listings.filter(
      (listing) =>
        new Date(listing.dates[listing.dates.length - 1].date) < new Date()
    );
    const upcomingListings = listings.filter(
      (listing) => new Date(listing.dates[0].date) > new Date()
    );
    setOpenListings(openListings);
    setClosedListings(closedListings);
    setUpcomingListings(upcomingListings);
  }, [listings]);

  useEffect(() => {
    if (navTab === "Open") {
      switch (openListings.length) {
        case 1:
          setItems(2);
          break;
        case 2:
          setItems(2);
          break;
        default:
          setItems(2);
          break;
      }
    } else if (navTab === "Closed") {
      switch (closedListings.length) {
        case 1:
          setItems(2);
          break;
        case 2:
          setItems(2);
          break;
        default:
          setItems(2);
          break;
      }
    } else if (navTab === "Upcoming") {
      switch (upcomingListings.length) {
        case 1:
          setItems(2);
          break;
        case 2:
          setItems(2);
          break;
        default:
          setItems(2);
          break;
      }
    } else {
      setItems(3);
    }
  }, [navTab, openListings, closedListings, upcomingListings]);

  return (
    <div className="w-full h-full items-center justify-center p-4 rounded-lg border flex flex-col gap-5 overflow-y-auto">
      <div className="w-full relative flex items-center justify-end">
        <DashboardNav
          setActiveTab={
            setNavTab as React.Dispatch<React.SetStateAction<string>>
          }
          activeTab={navTab}
          tabs={["Closed", "Open", "Upcoming"]}
          layoutId="BookingsNav"
          className="absolute left-1/2 transform -translate-x-1/2 text-sm gap-5"
        />
        <DropdownMenu
          data={view}
          dataSet={views}
          defaultText="Set View"
          setData={
            setView as React.Dispatch<React.SetStateAction<string | null>>
          }
          className="w-min border border-lightPrimary rounded-lg text-sm"
          buttonClassName="gap-5 text-sm"
        />
      </div>
      <div
        className={`${
          view === "Detailed" ? `grid grid-cols-${items}` : "grid grid-flow-col"
        } w-full h-full gap-3 overflow-y-auto rounded-lg`}
      >
        {loading ? (
          [1, 2, 3, 4, 5, 6].map((_) => {
            return (
              <div
                key={_}
                className="w-full h-full rounded-lg bg-lightPrimary animate-pulse"
              />
            );
          })
        ) : (
          <>
            {navTab === "Open" &&
              (openListings.length !== 0 ? (
                openListings.map((listing, idx) => {
                  /* if (idx == 0) return; */
                  return (
                    <ListingCard
                      listing={listing}
                      key={idx}
                      view={view}
                      setSelectedListing={setSelectedListing}
                      listings={listings}
                      setListings={setListings}
                    />
                  );
                })
              ) : (
                <p className="text-3xl font-extrabold text-white col-span-2 w-full h-full flex items-center justify-center">
                  No open listings
                </p>
              ))}
            {navTab === "Closed" &&
              (closedListings.length !== 0 ? (
                closedListings.map((listing, idx) => (
                  <ListingCard
                    listing={listing}
                    key={idx}
                    view={view}
                    setSelectedListing={setSelectedListing}
                    listings={listings}
                    setListings={setListings}
                  />
                ))
              ) : (
                <p className="text-3xl font-extrabold text-white col-span-2 w-full h-full flex items-center justify-center">
                  No closed listings
                </p>
              ))}
            {navTab === "Upcoming" &&
              (upcomingListings.length !== 0 ? (
                upcomingListings.map((listing, idx) => (
                  <ListingCard
                    listing={listing}
                    key={idx}
                    view={view}
                    setSelectedListing={setSelectedListing}
                    listings={listings}
                    setListings={setListings}
                  />
                ))
              ) : (
                <p className="text-3xl font-extrabold text-white col-span-2 w-full h-full flex items-center justify-center">
                  No upcoming listings
                </p>
              ))}
          </>
        )}
      </div>
    </div>
  );
};

const ListingCard = ({
  listing,
  view,
  setSelectedListing,
  listings,
  setListings,
}: {
  listing: Listing;
  listings: Listing[] | null;
  setListings: React.Dispatch<React.SetStateAction<Listing[] | null>>;
  view: "Detailed" | "List";
  setSelectedListing: React.Dispatch<React.SetStateAction<Listing | null>>;
}) => {
  return (
    <div
      className={`p-2 rounded-md bg-lightPrimary text-darkPrimary flex flex-col items-start text-sm gap-2 w-full ${
        view === "Detailed" ? "h-min max-h-min" : "h-min"
      }`}
    >
      {view === "Detailed" && (
        <Image
          src={listing.images[0].url}
          alt="listing"
          width={1000}
          height={500}
          className="object-cover w-full h-full max-h-[45%] rounded-md"
        />
      )}
      <section className="flex flex-col items-start gap-2 w-full">
        <section className="flex items-center justify-between w-full">
          <h1
            className={`${
              view === "Detailed" ? "text-lg" : "text-sm"
            } font-bold`}
          >
            {listing.name}
          </h1>
          <p className="p-2 rounded-md bg-darkPrimary text-center text-white font-bold text-xs">
            {listing.sport}
          </p>
        </section>
        <Field
          value={listing.location}
          icon={<FaLocationDot />}
          className="text-sm"
        />
        {view === "Detailed" && (
          <Field
            value={getPriceRange(listing.dates)}
            icon={<FaMoneyBill />}
            className="text-sm"
          />
        )}
        <Field
          value={
            formatDate(listing.dates[0].date) +
            " - " +
            formatDate(listing.dates[listing.dates.length - 1].date)
          }
          icon={<BsCalendar />}
          className="text-sm"
        />
      </section>
      <section className="grid grid-rows-2 grid-cols-2 w-full h-full gap-2">
        <Link
          href={`/explore/${listing.id}`}
          className="bg-darkPrimary transition-all duration-500 ease-in-out w-full py-1.5 text-white font-bold text-sm rounded-md text-center shadow-sm shadow-black"
        >
          View Listing Page
        </Link>
        <button
          onClick={() => setSelectedListing(listing)}
          className="bg-night transition-all duration-500 ease-in-out w-full py-1.5 text-white font-bold text-sm rounded-md text-center shadow-sm shadow-black"
        >
          Edit Listing
        </button>
        <AdditionalDetails listing={listing} />
        {listings && (
          <DeleteListing
            listing={listing}
            listings={listings}
            setListings={setListings}
          />
        )}
      </section>
    </div>
  );
};

export const ItemTypes = {
  LISTING: "Listing",
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate();
  const suffix =
    day === 1 || day === 21 || day === 31
      ? "st"
      : day === 2 || day === 22
      ? "nd"
      : day === 3 || day === 23
      ? "rd"
      : "th";

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  return date
    .toLocaleDateString("en-GB", options)
    .replace(/\b\d{1,2}\b/, `$&${suffix}`);
};

const AdditionalDetails = ({ listing }: { listing: Listing }) => {
  const [date, setDate] = useState<Date | undefined>(
    new Date(listing.dates[0].date)
  );
  const [userDetails, setUserDetails] = useState<(DBuser | undefined)[]>([]);
  const [userList, setUserList] = useState<string[]>([]);
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (date === undefined) return;
      const users = listing.dates
        .find((d) => isSameDay(new Date(d.date), new Date(date)))
        ?.timings.map((timing) => {
          if (timing.booking.userID !== null) return timing.booking.userID;
        })
        .filter((user) => user !== undefined || user !== null) as (
        | string
        | null
      )[];
      if (users === undefined) return;
      const userPromises = users.map(async (user) => {
        if (user) {
          const docRef = doc(db, "users", user);
          const docSnapshot = await getDoc(docRef);
          if (docSnapshot.exists()) {
            const data = docSnapshot.data() as DBuser;
            return data;
          }
        }
      });
      const userDetails = await Promise.all(userPromises);
      setUserDetails(userDetails);
    };

    fetchUserDetails();
  }, [listing, date]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="bg-night transition-all duration-500 ease-in-out w-full py-1.5 text-white font-bold text-sm rounded-md text-center shadow-sm shadow-black">
          Additonal Details
        </button>
      </DialogTrigger>
      <DialogContent className="flex flex-col items-center justify-center bg-darkPrimary text-lightPrimary min-w-max">
        <DialogHeader className="text-2xl sm:text-center w-full font-bold">
          Additional Details
        </DialogHeader>
        <div className="flex flex-col items-center justify-center gap-5">
          <div className="flex h-full items-start justify-between gap-2">
            <section className="flex flex-col items-center justify-center gap-2 h-full">
              <h1 className="text-lg font-bold">Select a Date</h1>
              <Calendar
                mode="single"
                disabled={{
                  before: new Date(listing.dates[0].date),
                  after: new Date(listing.dates[listing.dates.length - 1].date),
                }}
                selected={date}
                onSelect={setDate}
                className="border border-lightPrimary rounded-lg bg-darkPrimary"
                classNames={{
                  table: "w-full h-full",
                  cell: "w-10 h-10 text-xl flex items-center justify-center",
                  head_cell:
                    "w-10 h-10 text-xl flex items-center justify-center",
                  button: "w-full h-full",
                  nav_button_next: "absolute right-1 w-min h-min",
                  nav_button_previous: "absolute left-1 w-min h-min",
                  day_selected: `${"text-darkPrimary bg-lightPrimary"}`,
                  caption_label: "text-xl",
                  day_today: "",
                }}
                components={{
                  IconLeft() {
                    return <ChevronLeftIcon className="h-6 w-6" />;
                  },
                  IconRight() {
                    return <ChevronRightIcon className="h-6 w-6" />;
                  },
                }}
                initialFocus
              />
            </section>
            <section className="grid grid-cols-4 gap-2 h-full justify-items-stretch place-items-stretch">
              <h1 className="text-lg font-bold col-span-4 w-full text-center">
                Timings Available
              </h1>

              {listing.dates
                .find((d) => isSameDay(new Date(d.date), date ?? new Date()))
                ?.timings.map((timing, idx) => {
                  const user = userDetails.find((user) => {
                    if (user === undefined) return;
                    return user.id === timing.booking.userID;
                  });
                  return (
                    <div
                      key={idx}
                      className={`flex flex-col items-center justify-center rounded-lg gap-2 text-xs px-1 py-2 h-full w-full ${
                        user
                          ? "bg-lightPrimary text-darkPrimary"
                          : "border border-lightPrimary text-lightPrimary"
                      }`}
                    >
                      <section className="flex items-center justify-center gap-1 w-full">
                        <BsClock />
                        <p>
                          {timing.startTime} - {timing.endTime}
                        </p>
                      </section>
                      <section className="flex items-center justify-center gap-1 w-full">
                        <FaMoneyBill />
                        <p>{timing.price} DHS</p>
                      </section>
                      {timing.booking && user && (
                        <>
                          <section className="flex items-center justify-start gap-1 w-full">
                            <MdAccountBox />
                            <p>{user.firstName + " " + user.lastName}</p>
                          </section>
                          <section className="flex items-center justify-start gap-1 w-full">
                            <MdEmail />
                            <p>{user.email}</p>
                          </section>
                          <section className="flex items-center justify-start gap-1 w-full">
                            <BsPhone />
                            <p>{user.phoneNumber}</p>
                          </section>
                        </>
                      )}
                    </div>
                  );
                })}
            </section>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const DeleteListing = ({
  listing,
  setListings,
  listings,
}: {
  listing: Listing | null;
  listings: Listing[];
  setListings: React.Dispatch<React.SetStateAction<Listing[] | null>>;
}) => {
  const handleDelete = async () => {
    try {
      if (!listing) return;
      if (!listing.id) return;
      toast.loading("Deleting the listing");
      const docRef = doc(db, "listings", listing.id);
      await deleteDoc(docRef);
      await updateDoc(doc(db, "partners", listing.partnerId), {
        listings: listings.filter((l) => l.id !== listing.id),
      });
      const updatedListings = listings.filter((l) => l.id !== listing.id);
      setListings(updatedListings);
    } catch (error) {
      toast.error("Something went wrong please try again");
    } finally {
      toast.dismiss();
    }
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="bg-capuut transition-all duration-500 ease-in-out w-full py-1.5 text-white font-bold text-sm rounded-md text-center shadow-sm shadow-black">
          Delete Listing
        </button>
      </DialogTrigger>
      <DialogContent className="flex flex-col items-center justify-center bg-darkPrimary text-lightPrimary min-w-max">
        <DialogHeader className="text-2xl sm:text-center w-full font-bold">
          Delete Listing
        </DialogHeader>
        <div className="flex flex-col items-center justify-center gap-5">
          <p className="text-sm text-center">
            Are you sure you want to delete the listing?
          </p>
          <button
            onClick={() => handleDelete()}
            className="bg-capuut transition-all duration-500 ease-in-out w-full py-1.5 text-white font-bold text-sm rounded-md text-center shadow-sm shadow-black"
          >
            Delete
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Listings;
