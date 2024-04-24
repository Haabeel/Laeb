import React, { useEffect, useState } from "react";
import Listings from "./Bookings/Listings";
import { User } from "firebase/auth";
import { Listing, Partner } from "@/types";
import EditComponent from "./Bookings/EditComponent";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../../firebase.config";

const Bookings = ({
  user,
  partner,
}: {
  user: User | null;
  partner: Partner | null;
}) => {
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [listings, setListings] = useState<Listing[] | null>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchListings = async () => {
      if (!partner) return;
      const listingsStringList = partner.listings;
      Promise.all(
        listingsStringList.map(async (listingId) => {
          const docRef = doc(db, "listings", listingId);
          const docSnapshot = await getDoc(docRef);
          if (docSnapshot.exists()) {
            const data = docSnapshot.data() as Listing;
            return data;
          }
        })
      ).then((data) => {
        setListings(data as Listing[]);
        setLoading(false);
      });
    };
    fetchListings();
  }, [partner]);

  return (
    <div className="grid grid-cols-2 w-full h-full p-5 gap-5 overflow-hidden">
      <Listings
        user={user}
        partner={partner}
        setSelectedListing={setSelectedListing}
        listings={listings}
        setListings={setListings}
        loading={loading}
        setLoading={setLoading}
      />
      <EditComponent
        selectedListing={selectedListing}
        setSelectedListing={setSelectedListing}
        listings={listings}
        setListings={setListings}
      />
    </div>
  );
};

export default Bookings;
