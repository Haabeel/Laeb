"use client";

import { User, onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { auth, db } from "../../../../firebase.config";
import { IoMdAdd } from "react-icons/io";
import { FaMoneyBill } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { Listing, Partner } from "@/types";
import Image from "next/image";
import { Toaster, toast } from "sonner";
import { MdDeleteForever } from "react-icons/md";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { list } from "postcss";
import Link from "next/link";
interface pageUser {
  user: User;
  isPartner: boolean;
  isAuth: boolean;
}
const Page = ({ params }: { params: { partner: string } }) => {
  const [partner, setPartner] = React.useState<Partner | null>(null);
  const [user, setUser] = React.useState<pageUser | null>(null);
  const [about, setAbout] = React.useState<string>("");
  const [sport, setSport] = React.useState<string>("");
  const [sports, setSports] = React.useState<string[]>([]);
  const [listings, setListings] = React.useState<Listing[]>([]);
  const [selectedSport, setSelectedSport] = useState<number | null>(null);
  useEffect(() => {
    const fetchPartner = async () => {
      const collectionRef = collection(db, "partners");
      const queryRef = query(
        collectionRef,
        where("id", "==", params.partner.toLowerCase())
      );
      const querySnapshot = await getDocs(queryRef);
      if (querySnapshot.empty) {
        return;
      }
      const partnerData = querySnapshot.docs[0].data() as Partner;
      setPartner(partnerData);
      setAbout(partnerData.about || "");
      setSports(partnerData.sports || []);
      setListings(partnerData.listings || []);
    };
    fetchPartner();
  }, [params.partner]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (mUser) => {
      if (mUser) {
        const userDocRef = doc(db, "users", mUser.uid);
        const userDocSnapshot = await getDoc(userDocRef);
        if (userDocSnapshot.exists()) {
          setUser({ user: mUser, isPartner: false, isAuth: true });
        } else {
          const partnerDocRef = doc(db, "partners", mUser.uid);
          const partnerDocSnapshot = await getDoc(partnerDocRef);
          if (partnerDocSnapshot.exists()) {
            if (partnerDocSnapshot.id === mUser.uid) {
              setUser({ user: mUser, isPartner: true, isAuth: true });
            } else {
              setUser({ user: mUser, isPartner: true, isAuth: false });
            }
          } else {
            setUser(null);
          }
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const updateAboutus = async () => {
    try {
      if (about.length === 0) return toast.error("About us cannot be empty");
      if (about === partner?.about) return toast.error("No changes made");
      if (!user?.isAuth || !user?.isPartner) {
        return;
      }
      await updateDoc(doc(db, "partners", user.user.uid), {
        about: about,
      });
      toast.success("About us updated successfully");
    } catch (error) {
      toast.error("Failed to update about us");
    }
  };

  const deleteSport = async () => {
    try {
      if (selectedSport === null) return;
      if (partner === null) return;
      if (partner.listings === undefined) return;
      const listingOfSport = partner.listings.filter(
        (listing) => listing.sport == sports[selectedSport]
      );
      if (listingOfSport.length > 0)
        return toast.error("There are listings associated with this sport", {
          action: {
            label: "Delete all the listings associated with that sport?",
            async onClick(event) {
              try {
                const updatedListings = partner.listings!!.filter(
                  (listing) => listing.sport != sports[selectedSport]
                );
                await updateDoc(doc(db, "partners", user!!.user.uid), {
                  listings: updatedListings,
                });
                const updatedSports = sports.filter(
                  (sport, index) => index !== selectedSport
                );
                await updateDoc(doc(db, "partners", user!!.user.uid), {
                  sports: updatedSports,
                });
                setSports(updatedSports);
                setListings(updatedListings);
                toast.success("Sport deleted successfully");
              } catch (error: any) {
                toast.error(error);
              }
            },
          },
          className:
            "bg-capuut text-white flex flex-col gap-2 justify-center items-center rounded-lg p-3 w-full",
          actionButtonStyle: {
            width: "100%",
            textAlign: "center",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          },
        });
      const updatedSports = sports.filter(
        (sport, index) => index !== selectedSport
      );
      await updateDoc(doc(db, "partners", user!!.user.uid), {
        sports: updatedSports,
      });
      setSports(updatedSports);
      toast.success("Sport deleted successfully");
    } catch (error) {
      toast.error("Failed to delete sport");
    }
  };

  return (
    <div className="flex justify-between items-center gap-96 bg-night w-full h-full py-5 px-10">
      <div className="flex flex-col justify-start h-full items-start gap-5">
        <section className="flex gap-3 items-center">
          <div
            className={`w-20 h-20 flex justify-center items-center rounded-full bg-ebony ${
              user?.isAuth && "cursor-pointer"
            } ${!partner && "animate-pulse"}`}
          >
            {partner && partner.companyImage && (
              <Image
                src={partner.companyImage}
                alt="Company Logo"
                width={80}
                height={80}
                className="rounded-full"
              />
            )}
            {partner && !partner.companyImage && user?.isAuth && (
              <IoMdAdd size={30} />
            )}
          </div>
          <p
            className={`text-5xl ${
              !partner && "animate-pulse h-12 w-24 bg-ebony rounded-lg"
            } text-white text-bold`}
          >
            {partner?.companyName}
          </p>
        </section>
        <section className="flex flex-col gap-3 w-[30rem] max-h-96">
          <section className="flex justify-between items-center">
            <p className="text-2xl text-white text-bold">About Us</p>
            {user?.isAuth && user?.isPartner && (
              <button
                className="bg-capuut text-lg text-white rounded-lg py-2 px-3"
                onClick={() => updateAboutus()}
              >
                Save Changes
              </button>
            )}
          </section>
          {!partner && (
            <div className="text-white animate-pulse min-h-60 w-full bg-ebony rounded-lg p-3" />
          )}
          {partner &&
            (user?.isAuth && user?.isPartner ? (
              <textarea
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                className="w-full min-h-60 outline-none focus:outline-none sticky-container bg-night border-ebony border-2 text-white text-lg rounded-lg p-3"
                style={{ resize: "none" }}
              />
            ) : (
              <p className="text-white w-full min-h-60 bg-night border-ebony border-2 text-lg rounded-lg p-3">
                {partner.about}
              </p>
            ))}
        </section>
        {partner && sports.length > 0 && (
          <section className="flex flex-col gap-2 text-white text-xl">
            <p>Sports we offer:</p>
            <ul className="grid grid-cols-4 grid-flow-row gap-2 w-[30rem]">
              {sports.map((sport, index) => (
                <li
                  key={index}
                  className="bg-ebony text-center text-white text-lg rounded-lg p-2 cursor-default relative"
                  onMouseEnter={() => setSelectedSport(index)}
                  onMouseLeave={() => setSelectedSport(null)}
                >
                  {sport}
                  {selectedSport === index &&
                    user?.isAuth &&
                    user?.isPartner && (
                      <MdDeleteForever
                        className="absolute top-0 right-0"
                        onClick={() => deleteSport()}
                      />
                    )}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
      <div className="flex flex-col w-full h-full gap-4">
        <section className="flex flex-col justify-center items-center gap-3 h-full w-full pt-5">
          <h3 className="text-white text-2xl font-bold w-full text-center">
            Open Listings
          </h3>
          <div className="flex flex-col gap-2 w-full h-full">
            <div
              className={`${
                listings.length > 1
                  ? `grid grid-cols-2 grid-flow-row gap-2`
                  : "flex justify-center items-center"
              } w-full h-full rounded-lg p-3 overflow-x-hidden overflow-y-auto sticky-container ${
                !partner && "animate-pulse bg-ebony h-[90%]"
              } ${listings.length === 0 && "bg-ebony"}`}
            >
              {listings.map((listing, index) => (
                <div
                  key={listing.id || index}
                  className="flex flex-col gap-1 bg-ebony rounded-lg"
                >
                  <Image
                    src={listing.images[0]}
                    height={1000}
                    width={1000}
                    alt={listing.name}
                    className="object-cover rounded-tr-lg rounded-tl-lg h-[60%] w-full"
                  />
                  <p className="text-white text-base font-bold ml-3">
                    {listing.name}
                  </p>
                  <section className="flex flex-col justify-center gap-1 h-[20%] items-start">
                    <p className="text-white text-sm ml-3 flex gap-2 items-center">
                      <FaMoneyBill />
                      {listing.price} AED
                    </p>
                    <p className="text-white text-sm ml-3 flex items-start gap-2">
                      <FaLocationDot className="mt-0.5" />
                      <p>{listing.location}</p>
                    </p>
                  </section>
                  <p className="text-white text-sm ml-3 font-bold">
                    {listing.sport}
                  </p>
                </div>
              ))}
              {listings.length === 0 && (
                <p className="text-white text-2xl text-center">
                  No listings available
                </p>
              )}
            </div>
            {user?.isAuth && user?.isPartner && (
              <Link
                href={"/partner/dashboard/list"}
                className="bg-capuut text-center text-lg text-white rounded-lg p-2"
              >
                Add Listing
              </Link>
            )}
          </div>
        </section>
        <section className="flex flex-col gap-2 h-1/4 justify-center items-start self-end">
          <p className="text-2xl text-white text-bold">Contact Us</p>
          <div
            className={`flex flex-col justify-center items-start gap-2 rounded-lg p-3 bg-ebony ${
              !partner && "animate-pulse w-64 h-32"
            }`}
          >
            {partner && (
              <ul>
                <li className="text-white text-lg">
                  <b>Email: </b>
                  <span className="text-white">{partner?.companyEmail}</span>
                </li>
                <li className="text-white text-lg">
                  <b>Phone: </b>
                  <span className="text-white">
                    {partner?.companyPhoneNumber}
                  </span>
                </li>
                {partner?.contactInfo?.map((contact, index) => (
                  <li key={index} className="text-white text-lg">
                    <b>{contact.type}: </b>
                    <span className="text-white">{contact.value}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Page;
