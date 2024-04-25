import { Listing, TimingRange } from "@/types";
import { useEffect, useState } from "react";
import EditComponentDropTarget from "./EditComponentDropTarget";
import DropdownMenu from "@/components/shared/DropdownMenu";
import CategoriesInput from "@/components/ui/CategoriesInput";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../../../firebase.config";
import { DatePickerWithRange } from "@/components/ui/DateRangePicker";
import { DateRange } from "react-day-picker";
import TimingRanges from "@/components/ui/TimingRangePicker";
import { generateListDates } from "@/lib/utils";
import { toast } from "sonner";
import { cn } from "@/utility";

const EditComponent = ({
  selectedListing,
  setSelectedListing,
  listings,
  setListings,
  className,
}: {
  selectedListing: Listing | null;
  setSelectedListing: React.Dispatch<React.SetStateAction<Listing | null>>;
  listings: Listing[] | null;
  setListings: React.Dispatch<React.SetStateAction<Listing[] | null>>;
  className?: string;
}) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [dbCategories, setDbCategories] = useState<string[]>([]);
  const [dbSports, setDbSports] = useState<
    { sport: string; categories: string[] }[]
  >([]);
  const [date, setDate] = useState<DateRange | undefined>();
  const [timingRanges, setTimingRanges] = useState<TimingRange[]>([]);

  const handleEditListingButton = async () => {
    if (listings === null) return;
    if (selectedListing) {
      if (!date || !date.from) return toast.error("Please select a date range");
      toast.loading("Updating the listing...");
      const dates = generateListDates(date, timingRanges);
      setSelectedListing({
        ...selectedListing,
        categories,
        dates,
      });
      const docRef = doc(db, "listings", selectedListing.id as string);
      try {
        await updateDoc(docRef, selectedListing);
        const updatedListings = listings.map((listing) => {
          if (listing.id === selectedListing.id) {
            return selectedListing;
          }
          return listing;
        });
        setListings(updatedListings);
        toast.success("Listing updated successfully");
        setSelectedListing(null);
      } catch {
        toast.error("Failed to update listing");
      } finally {
        toast.dismiss();
      }
    }
  };

  useEffect(() => {
    if (selectedListing) {
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
        } else {
          console.log("No such document!");
        }
      };
      try {
        getSports();
        setCategories(selectedListing.categories || []);
        setDate({
          from: new Date(selectedListing.dates[0].date),
          to: new Date(
            selectedListing.dates[selectedListing.dates.length - 1].date
          ),
        });
        const tRanges = selectedListing.dates[0].timings.map((timings) => {
          return timings;
        });
        setTimingRanges(tRanges);
      } catch (error) {
        console.log(error);
      }
    }
  }, [selectedListing]);

  useEffect(() => {
    const categories = dbSports.flatMap((dbsport) => {
      if (dbsport.sport === selectedListing?.sport) return dbsport.categories;
      return [];
    });
    if (categories === undefined) return;
    setDbCategories(categories);
  }, [dbSports, selectedListing?.sport]);

  return (
    <div
      className={cn(
        "lg:border lg:border-dashed lg:border-lightPrimary bg-darkPrimary rounded-lg p-5 lg:block hidden h-full overflow-y-auto lg:sticky-container",
        className
      )}
    >
      {!selectedListing && (
        <div className="flex items-center justify-center w-full h-full text-white text-2xl">
          Select a listing to edit
        </div>
      )}
      {selectedListing && (
        <div className="flex flex-col items-center justify-between gap-2 w-full h-full">
          <section className="flex lg:flex-row flex-col items-center justify-between gap-3 w-full h-full">
            <section className="w-full flex items-start flex-col justify-center gap-1 text-lightPrimary text-base font-bold">
              <label>Listing Name</label>
              <input
                type="text"
                value={selectedListing.name}
                onChange={(e) =>
                  setSelectedListing({
                    ...selectedListing,
                    name: e.target.value,
                  })
                }
                className="w-full p-2 bg-lightPrimary font-normal text-darkPrimary rounded-lg outline-none focus:outline-none "
              />
            </section>
            <section className="w-full flex items-start flex-col justify-center gap-1 text-lightPrimary text-base font-bold h-full">
              <label>Listing Location</label>
              <input
                type="text"
                value={selectedListing.location}
                onChange={(e) =>
                  setSelectedListing({
                    ...selectedListing,
                    location: e.target.value,
                  })
                }
                className="w-full p-2 bg-lightPrimary font-normal text-darkPrimary rounded-lg outline-none focus:outline-none "
              />
            </section>
          </section>
          <section className="w-full flex items-start flex-col justify-center gap-1 text-lightPrimary h-full text-base font-bold">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={selectedListing.description}
              onChange={(e) =>
                setSelectedListing({
                  ...selectedListing,
                  description: e.target.value,
                })
              }
              style={{ resize: "none" }}
              className="w-full p-2 h-60 sticky-container-dark bg-lightPrimary font-normal text-darkPrimary rounded-lg outline-none focus:outline-none"
            />
          </section>
          <section className="w-full h-full flex items-start flex-col justify-center gap-1 text-lightPrimary text-base font-bold">
            <CategoriesInput
              categoriesList={categories}
              dbCategories={dbCategories || []}
              setCategoriesList={setCategories}
              sport={selectedListing.sport}
              className="rounded-lg border border-lightPrimary font-normal"
              buttonClassName="bg-ebony text-lightPrimary rounded-md"
              rootClassName="gap-1"
              categoriesClassName="gap-1 lg:grid-cols-4 grid-cols-3"
            />
          </section>

          <section className="w-full h-full flex items-start flex-col justify-center gap-1 text-lightPrimary text-base font-bold">
            <label>Date Range</label>
            <DatePickerWithRange
              date={date}
              setDate={setDate}
              className="bg-darkPrimary border border-lightPrimary rounded-lg w-full"
            />
          </section>

          <button
            onClick={() => handleEditListingButton()}
            className="bg-citron text-darkPrimary w-full p-2 text-lg font-bold rounded-md"
          >
            Save Changes
          </button>
          <div className="min-h-3 w-full bg-darkPrimary text-darkPrimary" />
        </div>
      )}
    </div>
  );
};

export default EditComponent;
