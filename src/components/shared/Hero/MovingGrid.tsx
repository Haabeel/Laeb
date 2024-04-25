import { InfiniteMovingCards } from "@/components/ui/InfiniteMovingCards";
import React, { useEffect, useState } from "react";
import football from "@/assets/images/footballPitch.jpg";
import tennis from "@/assets/images/tennisPitch.jpg";
import swimming from "@/assets/images/swimmingPool.jpg";
import badminton from "@/assets/images/badminton.jpg";
import cricket from "@/assets/images/cricket.jpg";
import football2 from "@/assets/images/football.jpg";
import golf from "@/assets/images/golf.jpg";
import runningTrack from "@/assets/images/runningTrack.jpg";
import runningTrackAdults from "@/assets/images/runningTrackAdults.jpg";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../../firebase.config";
import { Listing } from "@/types";
import { shuffleList } from "@/lib/utils";

const MovingGrid = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [listingsOne, setListingsOne] = useState<Listing[]>([]);
  const [listingsTwo, setListingsTwo] = useState<Listing[]>([]);
  const [listingsThree, setListingsThree] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchListings = async () => {
      try {
        const collectionRef = collection(db, "listings");
        const snapshot = await getDocs(collectionRef);
        const listings = snapshot.docs.map((doc) => doc.data() as Listing);
        setListings(listings);
      } catch (error) {
        console.error("Error fetching listings: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  useEffect(() => {
    const extendedListing = [...listings, ...listings, ...listings];
    setListingsOne(shuffleList(extendedListing));
    setListingsTwo(shuffleList(extendedListing));
    setListingsThree(shuffleList(extendedListing));
  }, [listings]);

  return (
    <div className={`lg:flex hidden flex-col flex-[2.5] gap-4 w-[90%]`}>
      {loading && (
        <div className="text-5xl w-full h-full flex items-center justify-center text-white">
          Loading...
        </div>
      )}
      {!loading && (
        <InfiniteMovingCards
          items={
            listings.length >= 3
              ? listingsOne.map((listing) => ({ src: listing.images[0].url }))
              : [
                  { src: cricket.src },
                  { src: swimming.src },
                  { src: football.src },
                  { src: golf.src },
                  { src: runningTrack.src },
                  { src: badminton.src },
                  { src: runningTrackAdults.src },
                  { src: football2.src },
                  { src: tennis.src },
                ]
          }
          direction="left"
          speed="slow"
          className="ml-36 rounded-3xl"
          hasListings={listings.length >= 3}
          listings={listingsOne}
        />
      )}
      {!loading && (
        <InfiniteMovingCards
          items={
            listings.length >= 3
              ? listingsTwo.map((listing) => ({ src: listing.images[0].url }))
              : [
                  { src: cricket.src },
                  { src: swimming.src },
                  { src: football.src },
                  { src: golf.src },
                  { src: runningTrack.src },
                  { src: badminton.src },
                  { src: runningTrackAdults.src },
                  { src: football2.src },
                  { src: tennis.src },
                ]
          }
          direction="left"
          speed="slow"
          className="ml-20 rounded-3xl"
          hasListings={listings.length >= 3}
          listings={listingsTwo}
        />
      )}
      {!loading && (
        <InfiniteMovingCards
          items={
            listings.length >= 3
              ? listingsThree.map((listing) => ({ src: listing.images[0].url }))
              : [
                  { src: cricket.src },
                  { src: swimming.src },
                  { src: football.src },
                  { src: golf.src },
                  { src: runningTrack.src },
                  { src: badminton.src },
                  { src: runningTrackAdults.src },
                  { src: football2.src },
                  { src: tennis.src },
                ]
          }
          direction="left"
          speed="slow"
          className="ml-36 rounded-3xl"
          hasListings={listings.length >= 3}
          listings={listingsThree}
        />
      )}
    </div>
  );
};

export default MovingGrid;
