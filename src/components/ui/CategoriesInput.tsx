import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import DropdownMenu from "../shared/DropdownMenu";
import { cn } from "@/utility";

type CategoriesInputProps = {
  dbCategories: string[];
  categoriesList: string[];
  setCategoriesList: React.Dispatch<React.SetStateAction<string[]>>;
  sport: string | null;
  buttonClassName?: string;
  className?: string;
  rootClassName?: string;
  categoriesClassName?: string;
};

const CategoriesInput = ({
  categoriesList,
  dbCategories,
  setCategoriesList,
  sport,
  buttonClassName,
  className,
  rootClassName,
  categoriesClassName,
}: CategoriesInputProps) => {
  const [category, setCategory] = useState<string | null>("");
  const addCategory = () => {
    if (category === null) return;
    if (category.trim() === "") return;
    if (category.length < 3)
      return toast.error("Category must be at least 3 characters long.");
    const formattedCategory =
      category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
    // Check if the category already exists in the list (ignoring case)
    if (
      categoriesList.some(
        (existingCategory) =>
          existingCategory.toLowerCase() === formattedCategory.toLowerCase()
      )
    ) {
      toast.error("Category already exists.");
      return;
    }

    // Add the formatted category to the list
    setCategoriesList([...categoriesList, formattedCategory]);
  };
  const removeCategory = (index: number) => {
    if (categoriesList === null) return;
    const newCategoriesList = categoriesList.filter((_, i) => i !== index);
    setCategoriesList(newCategoriesList);
  };
  useEffect(() => {
    setCategory("");
  }, [dbCategories]);
  return (
    <div
      className={cn("flex flex-col items-center w-full gap-3", rootClassName)}
    >
      <label htmlFor="categoryInput" className="w-full">
        Categories
      </label>
      <input
        id="categoryInput"
        type="text"
        disabled={sport === null || sport === "" || sport === "Sport"}
        value={category!!}
        onChange={(e) => setCategory(e.target.value)}
        placeholder={
          sport === null || sport === "" || sport === "Sport"
            ? "Select a Sport"
            : "Add a category"
        }
        className={`px-3 py-2 rounded-md bg-lightPrimary text-darkPrimary outline-none focus:outline-none relative w-full focus:shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,_rgba(0,0,0,0.3)_0px_3px_7px_-3px] ${
          sport === null || sport === "" || sport === "Sport"
            ? "cursor-not-allowed"
            : "cursor-text"
        }`}
      />
      <DropdownMenu
        data={category}
        setData={setCategory}
        dataSet={dbCategories}
        defaultText="Categories"
        hasSearch
        placeholder="No Categories Available"
        className={className}
      />
      <button
        onClick={() => addCategory()}
        type="button"
        className={cn(
          "px-2 py-1 text-lightPrimary bg-darkPrimary w-full rounded-lg",
          buttonClassName
        )}
      >
        Add Category
      </button>
      <section
        className={cn(
          "grid grid-cols-2 items-center w-full gap-2",
          categoriesClassName
        )}
      >
        {categoriesList?.map((category, index) => (
          <div
            key={index}
            onClick={() => removeCategory(index)}
            className="bg-lightPrimary text-darkPrimary w-full px-3 py-2 text-sm rounded-md text-center relative after:absolute hover:after:inset-0 hover:after:h-full hover:after:w-full after:text-white after:bg-capuut after:rounded-md after:transition-all after:duration-700 after:ease-in-out hover:after:content-['Delete'] after:flex after:justify-center after:items-center"
          >
            <p>{category}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default CategoriesInput;
