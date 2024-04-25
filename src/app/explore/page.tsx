"use client";

import { Listing, pageUser } from "@/types";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";

import {
  ROUTES_DASHBOARD,
  ROUTES_EXPLORE,
  ROUTES_HOME,
  ROUTES_LOGIN,
  ROUTES_PARTNER_DASHBOARD,
} from "../../../routes";
import Logo from "@/assets/images/logo-nobg.png";
import Image from "next/image";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../../firebase.config";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import DropdownMenu from "@/components/shared/DropdownMenu";
import emiratesData from "../../../public/emirates";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/utility";
import { toast } from "sonner";
import { BsCalendar, BsSearch } from "react-icons/bs";
import { getPriceRange } from "@/lib/utils";
import { FaLocationDot, FaMoneyBill } from "react-icons/fa6";
import Field from "@/components/shared/Field";
import { LiaFilterSolid } from "react-icons/lia";
import { IoClose } from "react-icons/io5";

const Explore = () => {
  const [pUser, setPUser] = useState<pageUser | null>(null);
  const [search, setSearch] = useState<string>("");
  const [selectedEmirate, setSelectedEmirate] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [price, setPrice] = useState<{ min: string; max: string }>({
    min: "",
    max: "",
  });
  const [dbSports, setDbSports] = useState<
    { sport: string; categories: string[] }[]
  >([]);
  const [sports, setSports] = useState<string[] | null>(null);
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [dbCategories, setDbCategories] = useState<string[]>([]);
  const [category, setCategory] = useState<string | null>("");
  const [categories, setCategories] = useState<string[]>([]);
  const [listing, setListing] = useState<Listing[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [previousListings, setPreviousListings] = useState<Listing[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const getSports = async () => {
      const docRef = doc(db, "utility/sports");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const sports = docSnap
          .data()
          .sports.map(
            (sport: { sport: string; categories: string[] }) => sport.sport
          );
        setDbSports(docSnap.data().sports);
        setSports(sports);
      } else {
        console.log("No such document!");
      }
    };

    try {
      getSports();
    } catch (error) {
      toast.error("An error occurred. Please reload the page.");
    }
  }, []);

  useEffect(() => {
    const unsubscribe = () =>
      onAuthStateChanged(auth, async (mUser) => {
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
        } else {
          console.log("No user is signed in.");
        }
      });
    return unsubscribe();
  }, []);
  useEffect(() => {
    // Example usage: Fetch filtered listings when component mounts
    const fetchListing = async () => {
      try {
        const listingRef = collection(db, "listings");

        const Query = query(listingRef, orderBy("numId", "desc"));

        // Fetch all listings from Firestore
        const listingSnapshot = await getDocs(Query);

        // Initialize filtered listings array with all listings
        let listings: Listing[] = listingSnapshot.docs.map(
          (doc) => doc.data() as Listing
        );
        console.log("listings", listings);
        setListing(listings);
        setPreviousListings(listings);
      } catch (error) {
        toast.error("An error occurred. Please reload the page.");
      }
    };
    fetchListing();
  }, []);
  useEffect(() => {
    if (selectedSport) {
      const categories = dbSports.find(
        (sport) => sport.sport === selectedSport
      )?.categories;
      setDbCategories(categories ?? []);
      setCategories(categories ?? []);
    }
  }, [selectedSport, dbSports]);

  useEffect(() => {
    if (category) {
      if (
        categories.some(
          (existingCategory) =>
            existingCategory.toLowerCase() === category.toLowerCase()
        )
      ) {
        return setCategory("");
      }
      setCategories([...categories, category]);
      setCategory("");
    }
  }, [categories, category]);
  useEffect(() => {
    if (selectedSport) {
      setCategories([]);
    }
  }, [selectedSport]);

  const fetchFilteredListings = async (
    selectedSport: string | null,
    selectedEmirate: string | null,
    selectedCity: string | null,
    date: Date | undefined,
    minPrice: number | undefined,
    maxPrice: number | undefined,
    selectedCategories: string[] | null
  ) => {
    const listingRef = collection(db, "listings");

    // Fetch all listings from Firestore
    const listingSnapshot = await getDocs(listingRef);

    // Initialize filtered listings array with all listings
    let filteredListings: Listing[] = listingSnapshot.docs.map(
      (doc) => doc.data() as Listing
    );

    // Apply filters successively
    if (selectedSport) {
      const sportLower = selectedSport.toLowerCase();
      filteredListings = filteredListings.filter(
        (listing) => listing.sport.toLowerCase() === sportLower
      );
    }
    if (selectedEmirate) {
      const emirateLower = selectedEmirate.toLowerCase();
      filteredListings = filteredListings.filter(
        (listing) => listing.location.toLowerCase() === emirateLower
      );
    }
    if (selectedCity) {
      const cityLower = selectedCity.toLowerCase();
      filteredListings = filteredListings.filter(
        (listing) => listing.location.toLowerCase() === cityLower
      );
    }
    if (date) {
      const dateString = convertDateToString(date);
      filteredListings = filteredListings.filter((listing) =>
        listing.dates.some((listDate) => listDate.date === dateString)
      );
    }
    if (
      (minPrice !== undefined && maxPrice !== undefined) ||
      (minPrice !== undefined && maxPrice === undefined)
    ) {
      filteredListings = filteredListings.filter((listing) =>
        listing.dates.some((listDate) =>
          listDate.timings.some((timing) => timing.price >= minPrice)
        )
      );
    } else if (minPrice === undefined && maxPrice !== undefined) {
      filteredListings = filteredListings.filter((listing) =>
        listing.dates.some((listDate) =>
          listDate.timings.some((timing) => timing.price <= maxPrice)
        )
      );
    }

    if (selectedCategories && selectedCategories.length > 0) {
      const categoriesLower = selectedCategories.map((category) =>
        category.toLowerCase()
      );
      filteredListings = filteredListings.filter((listing) =>
        listing.categories?.some((cat) =>
          categoriesLower.includes(cat.toLowerCase())
        )
      );
    }

    setListing(filteredListings);
    setPreviousListings(listing);
    if (listing.length === 0) {
      toast.info("No listings found.");
    }
  };

  const convertDateToString = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const clearFilters = () => {
    setSelectedSport(null);
    setSelectedEmirate(null);
    setSelectedCity(null);
    setDate(new Date());
    setPrice({ min: "", max: "" });
    setCategories([]);
  };

  const fetchListingsBySearch = async (query: string) => {
    try {
      const listingRef = collection(db, "listings");
      const listingSnapshot = await getDocs(listingRef);
      const allListings: Listing[] = listingSnapshot.docs.map(
        (doc) => doc.data() as Listing
      );

      // Filter listings based on search query
      const filteredListings = allListings.filter((listing) =>
        listing.name.toLowerCase().includes(query.toLowerCase())
      ); // Adjust for relevant fields

      // Store the previous listings if search query is less than 4 characters
      if (query.length < 4) {
        setPreviousListings(filteredListings);
      }

      // Update the listings state with filtered or previous listings based on query length
      setListing(query.length >= 4 ? filteredListings : previousListings);

      if (filteredListings.length === 0) {
        toast.info("No listings found.");
      }
    } catch (error) {
      console.error("Error fetching listings:", error);
      toast.error(
        "An error occurred while fetching listings. Please try again."
      );
    }
  };

  // Function to handle search input change
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSearch(value);

    // If the search query is less than 4 characters, revert to the previous listings
    if (value.length < 4) {
      setListing(previousListings);
      return;
    }

    // Filter the existing listings based on the search query
    const filteredListings = listing.filter((listing) =>
      listing.name.toLowerCase().includes(value.toLowerCase())
    ); // Adjust for relevant fields

    // Update the listings state with filtered listings
    setListing(filteredListings);
  };

  useEffect(() => {
    console.log("listing", listing);
    console.log("previousListings", previousListings);
  }, [listing, previousListings]);

  return (
    <div
      className={`bg-darkPrimary flex flex-col justify-center items-center min-w-screen min-h-screen h-full overflow-x-hidden overflow-y-auto gap-3 pt-[12vh]`}
    >
      {open && (
        <section
          className="lg:hidden flex flex-col pt-[13vh] overflow-y-auto
        justify-start items-start gap-2.5 md:w-fit text-darkPrimary rounded-lg p-5 bg-lightAccent w-full inset-0 absolute z-[9999]"
        >
          <div className="text-3xl text-darkPrimary font-bold w-full flex items-center justify-between">
            <p>Filters</p>
            <IoClose onClick={() => setOpen(false)} />
          </div>
          <Section>
            <h2 className="text-lg font-bold">Sport</h2>
            <DropdownMenu
              data={selectedSport}
              dataSet={sports ?? []}
              defaultText="Sports"
              setData={setSelectedSport}
              placeholder="No Sports Available"
              hasSearch
              className="w-full"
              buttonClassName="text-base"
            />
            <DropdownMenu
              data={category}
              setData={setCategory}
              dataSet={dbCategories}
              defaultText="Categories"
              hasSearch
              placeholder="No Categories Available"
              buttonClassName="text-base"
            />
            {categories.length > 0 && (
              <div
                className={`grid w-full gap-1 ${
                  categories.length === 2
                    ? "grid-cols-2"
                    : categories.length === 1
                    ? "grid-cols-1"
                    : "grid-cols-3"
                }`}
              >
                {categories.map((category, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      const newCategories = categories.filter(
                        (cat) => cat !== category
                      );
                      setCategories(newCategories);
                    }}
                    className={`bg-darkPrimary text-lightPrimary p-1 w-full flex items-center justify-center text-xs rounded-md relative after:absolute hover:after:inset-0 hover:after:h-full hover:after:w-full after:text-white after:bg-capuut after:rounded-md after:transition-all after:duration-700 after:ease-in-out hover:after:content-['Delete'] after:flex after:justify-center after:items-center`}
                  >
                    <p className="text-center">{category}</p>
                  </div>
                ))}
              </div>
            )}
          </Section>
          <Section>
            <h2 className="text-lg font-bold">Location</h2>
            <DropdownMenu
              data={selectedEmirate}
              dataSet={Object.keys(emiratesData)}
              defaultText="Emirates"
              setData={setSelectedEmirate}
              hasSearch
              className="w-full"
              buttonClassName="text-base"
            />
            <DropdownMenu
              data={selectedCity}
              dataSet={
                selectedEmirate ? emiratesData[selectedEmirate]?.districts : []
              }
              defaultText="Cities"
              setData={setSelectedCity}
              hasSearch
              className="w-full"
              placeholder="Select an Emirate"
              buttonClassName="text-base"
            />
          </Section>
          <Section>
            <h2 className="text-lg font-bold">Date</h2>
            <Calendar
              mode="single"
              onSelect={(date) => setDate(date)}
              selected={date}
              disabled={{
                before: new Date(),
              }}
              className="bg-darkPrimary rounded-md text-white"
              classNames={{
                day_disabled: "text-gray-400",
                head_cell: "text-white w-full text-sm font-normal",
                day_selected: "bg-lightPrimary text-darkPrimary",
                day_today: "",
              }}
            />
          </Section>
          <Section>
            <h2 className="text-lg font-bold">Price</h2>
            <div className="flex flex-col gap-2 justify-between items-center w-full text-sm">
              <section className="flex flex-col gap-1 items-center justify-center w-full">
                <label htmlFor="minPrice" className="w-full">
                  Min Price
                </label>
                <input
                  type="number"
                  id="minPrice"
                  value={price.min}
                  onChange={(e) => {
                    if (parseInt(e.target.value) < 0) return;
                    setPrice({ ...price, min: e.target.value });
                  }}
                  placeholder="AED"
                  className="w-full p-2 border border-darkPrimary rounded-md outline-none focus:outline-none"
                />
              </section>
              <section className="flex flex-col gap-1 items-center justify-center w-full">
                <label htmlFor="maxPrice" className="w-full">
                  Max Price
                </label>
                <input
                  type="number"
                  id="maxPrice"
                  value={price.max}
                  onChange={(e) => {
                    if (parseInt(e.target.value) < 0) return;
                    setPrice({ ...price, max: e.target.value });
                  }}
                  placeholder="AED"
                  className="w-full p-2 border border-darkPrimary rounded-md outline-none focus:outline-none"
                />
              </section>
            </div>
          </Section>
          <button
            onClick={() => {
              setOpen(false);
              fetchFilteredListings(
                selectedSport,
                selectedEmirate,
                selectedCity,
                date,
                price.min !== "" ? parseInt(price.min) : undefined,
                price.max !== "" ? parseInt(price.max) : undefined,
                categories.length > 0 ? categories : null
              );
            }}
            className="bg-darkPrimary w-full py-2 text-white font-bold text-sm rounded-md"
          >
            Apply Filters
          </button>
          <button
            onClick={() => clearFilters()}
            className="bg-capuut w-full py-2 text-white font-bold text-sm rounded-md"
          >
            Clear Filters
          </button>
        </section>
      )}
      <nav className="flex p-5 items-center justify-between gap-5 h-[12vh] w-full fixed z-[9999] top-0 bg-ebony">
        <Link
          href={ROUTES_HOME}
          className="h-full overflow-hidden flex items-center justify-center"
        >
          <Image
            src={Logo}
            height={500}
            width={1000}
            alt="logo"
            className="object-cover sm:h-full sm:w-auto h-auto w-full"
          />
        </Link>
        <section className="bg-lightPrimary text-darkPrimary gap-1 items-center rounded-md absolute left-1/2 transform -translate-x-1/2 px-3 lg:flex hidden ">
          <input
            id="search"
            type="text"
            autoComplete="off"
            value={search}
            onChange={(e) => handleSearchInputChange(e)}
            placeholder="Search"
            className="w-96 py-2 border rounded-md outline-none bg-inherit focus:outline-none"
          />
          <label htmlFor="search">
            <BsSearch className="text-gray-400" />
          </label>
        </section>
        <section className="flex items-center justify-center gap-6 h-full">
          <Link
            className={`bg-darkPrimary sm:w-48 w-fit px-3 py-2 text-center h-full flex items-center justify-center text-white text-lg rounded-md hover:bg-lightPrimary hover:text-ebony font-semibold tracking-wide ${
              !pUser && "animate-pulse pointer-events-none"
            }`}
            href={
              !pUser
                ? "/"
                : pUser.isAuth
                ? pUser.isPartner
                  ? ROUTES_PARTNER_DASHBOARD
                  : ROUTES_DASHBOARD
                : ROUTES_LOGIN
            }
          >
            {pUser ? (pUser.isAuth ? "Dashboard" : "Login") : "Loading..."}
          </Link>
        </section>
      </nav>
      <div className="w-full h-full min-h-[88vh] flex lg:flex-row flex-col items-start justify-between shadow-[inset_-10px_-10px_30px_4px_rgba(0,0,0,0.1),_10px_10px_30px_4px_rgba(255,255,255,0.15)] px-10 py-10 gap-5">
        <section className="bg-lightPrimary text-darkPrimary gap-1 items-center rounded-md px-3 lg:hidden flex w-full">
          <LiaFilterSolid onClick={() => setOpen(!open)} className="w-8 h-8" />
          <input
            id="search"
            type="text"
            autoComplete="off"
            value={search}
            onChange={(e) => handleSearchInputChange(e)}
            placeholder="Search"
            className="w-full py-2 border rounded-md outline-none bg-inherit focus:outline-none"
          />
          <label htmlFor="search">
            <BsSearch className="w-5 h-5" />
          </label>
        </section>
        <section className="lg:flex hidden flex-col items-center justify-between gap-2.5 w-[288px] text-darkPrimary rounded-lg p-5 bg-lightAccent">
          <h1 className="text-3xl text-darkPrimary font-bold">Filters</h1>
          <Section>
            <h2 className="text-lg font-bold">Sport</h2>
            <DropdownMenu
              data={selectedSport}
              dataSet={sports ?? []}
              defaultText="Sports"
              setData={setSelectedSport}
              placeholder="No Sports Available"
              hasSearch
              className="w-full"
              buttonClassName="text-base"
            />
            <DropdownMenu
              data={category}
              setData={setCategory}
              dataSet={dbCategories}
              defaultText="Categories"
              hasSearch
              placeholder="No Categories Available"
              buttonClassName="text-base"
            />
            {categories.length > 0 && (
              <div
                className={`grid w-full gap-1 ${
                  categories.length === 2
                    ? "grid-cols-2"
                    : categories.length === 1
                    ? "grid-cols-1"
                    : "grid-cols-3"
                }`}
              >
                {categories.map((category, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      const newCategories = categories.filter(
                        (cat) => cat !== category
                      );
                      setCategories(newCategories);
                    }}
                    className={`bg-darkPrimary text-lightPrimary p-1 w-full flex items-center justify-center text-xs rounded-md relative after:absolute hover:after:inset-0 hover:after:h-full hover:after:w-full after:text-white after:bg-capuut after:rounded-md after:transition-all after:duration-700 after:ease-in-out hover:after:content-['Delete'] after:flex after:justify-center after:items-center`}
                  >
                    <p className="text-center">{category}</p>
                  </div>
                ))}
              </div>
            )}
          </Section>
          <Section>
            <h2 className="text-lg font-bold">Location</h2>
            <DropdownMenu
              data={selectedEmirate}
              dataSet={Object.keys(emiratesData)}
              defaultText="Emirates"
              setData={setSelectedEmirate}
              hasSearch
              className="w-full"
              buttonClassName="text-base"
            />
            <DropdownMenu
              data={selectedCity}
              dataSet={
                selectedEmirate ? emiratesData[selectedEmirate]?.districts : []
              }
              defaultText="Cities"
              setData={setSelectedCity}
              hasSearch
              className="w-full"
              placeholder="Select an Emirate"
              buttonClassName="text-base"
            />
          </Section>
          <Section>
            <h2 className="text-lg font-bold">Date</h2>
            <Calendar
              mode="single"
              onSelect={(date) => setDate(date)}
              selected={date}
              disabled={{
                before: new Date(),
              }}
              className="bg-darkPrimary rounded-md text-white"
              classNames={{
                day_disabled: "text-gray-400",
                head_cell: "text-white w-full text-sm font-normal",
                day_selected: "bg-lightPrimary text-darkPrimary",
                day_today: "",
              }}
            />
          </Section>
          <Section>
            <h2 className="text-lg font-bold">Price</h2>
            <div className="flex flex-col gap-2 justify-between items-center w-full text-sm">
              <section className="flex flex-col gap-1 items-center justify-center w-full">
                <label htmlFor="minPrice" className="w-full">
                  Min Price
                </label>
                <input
                  type="number"
                  id="minPrice"
                  value={price.min}
                  onChange={(e) => {
                    if (parseInt(e.target.value) < 0) return;
                    setPrice({ ...price, min: e.target.value });
                  }}
                  placeholder="AED"
                  className="w-full p-2 border border-darkPrimary rounded-md outline-none focus:outline-none"
                />
              </section>
              <section className="flex flex-col gap-1 items-center justify-center w-full">
                <label htmlFor="maxPrice" className="w-full">
                  Max Price
                </label>
                <input
                  type="number"
                  id="maxPrice"
                  value={price.max}
                  onChange={(e) => {
                    if (parseInt(e.target.value) < 0) return;
                    setPrice({ ...price, max: e.target.value });
                  }}
                  placeholder="AED"
                  className="w-full p-2 border border-darkPrimary rounded-md outline-none focus:outline-none"
                />
              </section>
            </div>
          </Section>
          <button
            onClick={() =>
              fetchFilteredListings(
                selectedSport,
                selectedEmirate,
                selectedCity,
                date,
                price.min !== "" ? parseInt(price.min) : undefined,
                price.max !== "" ? parseInt(price.max) : undefined,
                categories.length > 0 ? categories : null
              )
            }
            className="bg-darkPrimary w-full py-2 text-white font-bold text-sm rounded-md"
          >
            Apply Filters
          </button>
          <button
            onClick={() => clearFilters()}
            className="bg-capuut w-full py-2 text-white font-bold text-sm rounded-md"
          >
            Clear Filters
          </button>
        </section>
        <section className="xl:grid-cols-3 xl:grid md:grid md:grid-cols-2 justify-start items-start flex flex-col w-full gap-5">
          {listing.length !== 0 &&
            listing.map((item, index) => (
              <div
                key={index}
                className="bg-lightAccent text-darkPrimary rounded-lg p-5 flex flex-col items-start justify-between gap-2.5 w-full h-[27rem] shadow-md shadow-black"
              >
                <Image
                  src={item.images[0].url}
                  alt="listing image"
                  height={1000}
                  width={2000}
                  className="object-cover w-full h-52 rounded-md shadow-md shadow-black"
                />
                <section className="flex items-center justify-between w-full">
                  <h1 className="text-2xl font-bold">{item.name}</h1>
                  <p className="p-2 rounded-md bg-darkPrimary text-center text-white font-bold text-xs">
                    {item.sport}
                  </p>
                </section>
                <Field value={item.location} icon={<FaLocationDot />} />
                <Field
                  value={getPriceRange(item.dates)}
                  icon={<FaMoneyBill />}
                />
                <Field
                  value={
                    formatDate(item.dates[0].date) +
                    " - " +
                    formatDate(item.dates[item.dates.length - 1].date)
                  }
                  icon={<BsCalendar />}
                />
                <Link
                  href={`/explore/${item.id}`}
                  className="bg-darkPrimary transition-all duration-500 ease-in-out w-full py-2 text-white font-bold text-sm rounded-md text-center shadow-sm shadow-black"
                >
                  Book Now
                </Link>
              </div>
            ))}
          {listing.length === 0 &&
            [1, 2, 3, 4, 5, 6].map((_, index) => (
              <div
                key={index}
                className="bg-lightAccent text-darkPrimary rounded-lg p-5 flex flex-col items-start justify-between gap-2.5 w-full h-[27rem] shadow-md animate-pulse shadow-black"
              />
            ))}
        </section>
      </div>
    </div>
  );
};

const Section = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => (
  <section
    className={cn(
      "flex flex-col w-full items-start justify-between gap-2 border-b pb-2.5 border-darkPrimary",
      className
    )}
  >
    {children}
  </section>
);

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

export default Explore;
