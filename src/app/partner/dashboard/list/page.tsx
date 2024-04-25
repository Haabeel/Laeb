"use client";

import { cn } from "@/utility";
import { zodResolver } from "@hookform/resolvers/zod";
import { Bebas_Neue } from "next/font/google";
import Image from "next/image";
import React, { FC, useEffect, useState } from "react";
import {
  FieldErrors,
  UseFormGetValues,
  UseFormRegister,
  UseFormSetValue,
  useForm,
} from "react-hook-form";
import { set, z } from "zod";
import Logo from "@/assets/images/logo-nobg.png";
import Link from "next/link";
import { ROUTES_HOME, ROUTES_PARTNER_DASHBOARD } from "../../../../../routes";
import DropdownMenu from "@/components/shared/DropdownMenu";
import { Toaster, toast } from "sonner";
import { DatePickerWithRange } from "@/components/ui/DateRangePicker";
import TimingRanges from "@/components/ui/TimingRangePicker";
import {
  FileState,
  MultiImageDropzone,
} from "@/components/ui/MultiImageDropzone";
import CategoriesInput from "@/components/ui/CategoriesInput";
import { addDoc, collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../../../../firebase.config";
import { ListDate, TimingRange } from "@/types";
import { DateRange } from "react-day-picker";
import { useEdgeStore } from "@/lib/edgestore";
import { User, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { generateListDates } from "@/lib/utils";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
});

const listFormSchema = z.object({
  name: z
    .string()
    .max(70, { message: "Name is too long" })
    .min(5, { message: "Name is too short" }),
  description: z
    .string()
    .max(500, { message: "Description is too long" })
    .min(10, { message: "Description is too short" }),
  location: z.string().min(1, "Location is required"),
});
type ListFormFields = z.infer<typeof listFormSchema>;

const List = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ListFormFields>({
    resolver: zodResolver(listFormSchema),
  });
  const [partner, setPartner] = useState<User | null>(null);
  const [sport, setSport] = useState<string | null>("Sport");
  const [sports, setSports] = useState<string[]>([]);
  const [images, setImages] = useState<FileState[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [dbCategories, setDbCategories] = useState<string[]>([]);
  const [timingRanges, setTimingRanges] = useState<TimingRange[]>([]);
  const { edgestore } = useEdgeStore();
  const [loading, setLoading] = useState<boolean>(false);
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(),
    to: undefined,
  });
  const [dbSports, setDbSports] = useState<
    { sport: string; categories: string[] }[]
  >([]);
  const onSubmit = async (data: ListFormFields) => {
    try {
      if (!partner) return;
      if (date === undefined || date.from === undefined)
        return toast.error("Please select a date");
      if (sport === null) return toast.error("Please select a sport");
      if (images.length === 0)
        return toast.error("Please upload atleast one image");
      if (timingRanges.length === 0)
        return toast.error("Please add atleast one timing range");
      setLoading(true);
      const timings: TimingRange[] = timingRanges.map((timing) => {
        return {
          startTime: timing.startTime,
          endTime: timing.endTime,
          price: timing.price,
          booking: { userID: null, status: null, paymentOption: null },
        };
      });
      const dates: ListDate[] = generateListDates(date, timings);

      await uploadImages().then(async (res) => {
        const collectionRef = collection(db, "listings");
        const listingsDocRef = await addDoc(collectionRef, {
          partnerId: partner.uid,
          ...data,
          sport,
          images: res,
          categories,
          dates,
        });
        const partnerDocRef = doc(db, "partners", partner.uid);
        const partnerDocSnap = await getDoc(partnerDocRef);
        if (partnerDocSnap.exists()) {
          const partnerData = partnerDocSnap.data();
          let updatedListings: any[];
          if (partnerData?.listings) {
            updatedListings = [...partnerData.listings, listingsDocRef.id];
          } else {
            updatedListings = [listingsDocRef.id];
          }
          await updateDoc(partnerDocRef, {
            listings: updatedListings,
          });
          const listingDocRef = doc(db, "listings", listingsDocRef.id);
          await updateDoc(listingDocRef, {
            id: listingsDocRef.id,
          });
          toast.success("Listing posted successfully");
          router.push(`/explore/${listingsDocRef.id}`);
        }
      });
    } catch (error) {
      toast.error("Something Went Wrong");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const uploadImages = async () => {
    if (!partner) return;
    const imageURLS: { url: string; thumbnailUrl: string | null }[] = [];
    try {
      await Promise.all(
        images.map(async (image, index) => {
          if (typeof image.file === "string") return;
          const res = await edgestore.listings.upload({
            file: image.file,
            options: {
              manualFileName: `${partner.uid}-${getValues("name")}-${index}-${
                image.file.name
              }`,
            },
          });
          imageURLS.push({ url: res.url, thumbnailUrl: res.thumbnailUrl });
        })
      );
      return imageURLS;
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddNewSportClick = (sport: string) => {
    const sportExists = sports.some(
      (existingSport) => existingSport.toLowerCase() === sport.toLowerCase()
    );
    if (sportExists) {
      // Display toast error message
      toast.error("Sport already exists in the dropdown list");
    } else {
      setSports((prevSports) => [...prevSports, sport]);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setPartner(user);
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const categories = dbSports.flatMap((dbsport) => {
      if (dbsport.sport === sport) return dbsport.categories;
      return [];
    });
    if (categories === undefined) return;
    setDbCategories(categories);

    setCategories([]);
  }, [dbSports, sport]);

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
      console.log(error);
    }
  }, []);

  return (
    <div className="w-screen h-screen bg-ebony flex flex-col items-center overflow-y-auto overflow-x-hidden">
      <nav className="flex h-[15%] items-center p-5 lg:justify-between gap-5 w-full border-b-1 border-neutral-800">
        <Link
          href={ROUTES_HOME}
          className="h-full items-center justify-center flex"
        >
          <Image
            src={Logo}
            width={1000}
            height={1000}
            alt="logo"
            className="object-cover lg:h-full lg:w-auto h-auto w-full"
          />
        </Link>
        <Link
          href={ROUTES_PARTNER_DASHBOARD}
          className={`bg-darkPrimary flex justify-center items-center gap-3 text-white px-10 py-3 rounded-md text-lg`}
        >
          Dashboard
        </Link>
      </nav>
      <div className="shadow-[inset_-10px_-10px_30px_4px_rgba(0,0,0,0.1),_10px_10px_30px_4px_rgba(255,255,255,0.15)] flex justify-center p-5 w-full">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5 p-5 rounded-lg bg-lightAccent items-center xl:w-[50vw] w-full shadow-lg transition-all duration-500 ease-in-out"
        >
          <h1 className={`text-5xl mb-2 ${bebasNeue.className}`}>
            New Listing
          </h1>
          <section className="flex xl:flex-row flex-col items-center justify-between xl:gap-14 gap-3 w-full h-full">
            <section className="flex flex-col items-center w-full justify-start gap-4 h-full">
              <FormField
                label="name"
                type="text"
                placeholder="Name"
                register={register}
                errors={errors}
              />
              <FormField
                label="description"
                type="text"
                placeholder="Description"
                register={register}
                errors={errors}
                className="h-72"
              />
              <CategoriesInput
                categoriesList={categories}
                setCategoriesList={setCategories}
                dbCategories={dbCategories}
                sport={sport}
              />
            </section>
            <section className="flex flex-col items-center w-full justify-start gap-4 h-full">
              <section className=" w-full flex flex-col justify-between items-center gap-2">
                <label className="w-full">{"Listing Sport"}</label>
                <DropdownMenu
                  data={sport}
                  setData={setSport}
                  dataSet={sports}
                  defaultText="sport"
                  hasSearch
                  key={"sport"}
                  className="xl:min-w-[20rem] min-w-full"
                  addNew
                  handleAddNewButtonClick={handleAddNewSportClick}
                />
              </section>
              <section className=" w-full flex flex-col justify-between items-center gap-2">
                <p className="w-full">Listing Date range</p>
                <DatePickerWithRange
                  className=" w-full bg-darkPrimary text-white rounded-lg"
                  date={date}
                  setDate={setDate}
                />
              </section>
              <FormField
                label="location"
                type="text"
                placeholder="Location"
                register={register}
                errors={errors}
                className="w-full"
              />
              <section className="w-full h-full flex flex-col justify-between items-center gap-2">
                <p className="w-full">Listing Images</p>
                <MultiImageDropzone
                  value={images}
                  dropzoneOptions={{
                    maxFiles: 5,
                    maxSize: 5 * 1024 * 1024,
                  }}
                  onChange={(newImages) => setImages(newImages)}
                />
              </section>
            </section>
          </section>
          <TimingRanges
            defaultPrice={250}
            setTimingRanges={setTimingRanges}
            timingRanges={timingRanges}
          />
          <button
            type="submit"
            className="bg-lightSecondary w-full text-white px-5 py-2 rounded-md"
          >
            {`Post this Listing ${loading ? "..." : ""}`}
          </button>
        </form>
      </div>
      <Toaster richColors />
    </div>
  );
};

type FormFieldProps = {
  label: keyof ListFormFields;
  type: string;
  placeholder: string;
  register: UseFormRegister<ListFormFields>;
  errors: FieldErrors<ListFormFields>;
  className?: string;
};

const FormField: FC<FormFieldProps> = ({
  label,
  type,
  placeholder,
  register,
  errors,
  className,
}) => {
  return (
    <section className={cn(`w-full flex flex-col gap-2`, className)}>
      <label htmlFor={label}>
        {"Listing " + label.charAt(0).toUpperCase() + label.substring(1)}
      </label>
      {label === "description" ? (
        <textarea
          {...register(label)}
          className={`px-3 py-2 rounded-md bg-lightPrimary outline-none focus:outline-none w-full sticky-container-dark h-full focus:shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,_rgba(0,0,0,0.3)_0px_3px_7px_-3px]`}
          maxLength={500}
          placeholder="Listing Description in under 500 words"
          style={{ resize: "none" }}
        />
      ) : (
        <input
          type={type}
          id={label}
          placeholder={placeholder}
          {...register(label)}
          autoComplete="off"
          className={`px-3 py-2 rounded-md bg-lightPrimary outline-none focus:outline-none w-full focus:shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,_rgba(0,0,0,0.3)_0px_3px_7px_-3px]`}
        />
      )}

      {errors && errors[label] && (
        <p className="text-xs text-[#000000]">{errors[label]?.message}</p>
      )}
    </section>
  );
};

export default List;
