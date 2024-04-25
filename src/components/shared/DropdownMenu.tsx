import { Emirates } from "@/types";
import { cn } from "@/utility";
import React, { useEffect, useState } from "react";
import { UseFormSetValue } from "react-hook-form";
import { AiOutlineSearch } from "react-icons/ai";
import { MdKeyboardArrowDown } from "react-icons/md";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "../ui/dialog";

type DropdownMenuProps = {
  defaultText: string;
  dataSet: string[];
  data: string | null;
  hasSearch?: boolean;
  placeholder?: string;
  setData: React.Dispatch<React.SetStateAction<string | null>>;
  className?: string;
  addNew?: boolean;
  buttonClassName?: string;
  listClassName?: string;
} & (
  | { addNew: true; handleAddNewButtonClick: (text: string) => void }
  | { addNew?: false; handleAddNewButtonClick?: never }
);

const DropdownMenu = ({
  defaultText,
  dataSet,
  data,
  setData,
  hasSearch,
  className,
  addNew,
  handleAddNewButtonClick,
  buttonClassName,
  placeholder = "No data available",
  listClassName,
}: DropdownMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [dialogInputValue, setDialogInputValue] = useState("");
  return (
    <div
      className={cn(
        "flex flex-col gap-2 justify-center items-center w-full relative",
        className
      )}
    >
      <button
        className={cn(
          "bg-darkPrimary rounded-lg w-full flex gap-3 px-2 py-1 justify-between items-center text-base sm:text-lg text-lightPrimary",
          buttonClassName
        )}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <p>{data === "" || data === null ? defaultText : data}</p>
        <MdKeyboardArrowDown
          className={`${
            isOpen ? "rotate-180" : ""
          } transition ease-in-out duration-300`}
        />
      </button>
      <ul
        className={`bg-darkPrimary overflow-y-auto flex flex-col items-center gap-1 max-h-60 ${
          (dataSet.length == 1 || !hasSearch) && "pt-1"
        } ${
          dataSet.length == 0 && "pt-1"
        }  px-1 pb-1 w-full absolute top-10 rounded-lg border-2 dropdown-container border-lightPrimary z-10 ${
          isOpen ? "max-h-60" : "hidden"
        }`}
      >
        {hasSearch && dataSet.length > 1 && (
          <div className="flex w-full items-center sticky top-0 bg-darkPrimary">
            <AiOutlineSearch className={`text-lightPrimary`} />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search"
              className="placeholder:text-lightAccent outline-none w-full rounded-lg text-sm px-2 py-1 bg-darkPrimary border-blue-100 text-white"
            />
          </div>
        )}
        {dataSet.length == 0 && (
          <li className="text-sm rounded-md w-full px-1 py-1 text-lightAccent">
            {placeholder}
          </li>
        )}
        {dataSet.map((item) => (
          <li
            key={item}
            className={cn(
              `text-sm rounded-md w-full hover:bg-lightAccent hover:text-darkPrimary cursor-pointer px-1 py-1 ${
                item === data
                  ? "bg-lightAccent text-darkPrimary"
                  : "text-lightAccent"
              } ${
                item.toLowerCase().startsWith(inputValue.toLowerCase()) ||
                (item.toLowerCase().includes(inputValue.toLowerCase()) &&
                  !item.toLowerCase().startsWith(inputValue.toLowerCase()))
                  ? "block"
                  : "hidden"
              }
              `,
              listClassName
            )}
            onClick={() => {
              if (dataSet.length == 1) {
                setIsOpen(false);
                return;
              }
              if (data !== item) {
                setData(item);
                setIsOpen(false);
                setInputValue("");
              }
            }}
          >
            {item}
          </li>
        ))}
        {addNew && (
          <Dialog>
            <DialogTrigger asChild>
              <button className="bg-capuut px-1 py-1 text-sm text-white rounded-md w-full">
                Add a new {defaultText}
              </button>
            </DialogTrigger>
            <DialogContent className="bg-ebony text-white">
              <DialogHeader className="text-xl">Add a new Sport</DialogHeader>
              <input
                type="text"
                placeholder={`Enter a new ${defaultText.toLowerCase()}`}
                value={dialogInputValue}
                onChange={(e) => setDialogInputValue(e.target.value)}
                className="text-lg rounded-md w-full px-3 py-2 bg-lightPrimary text-darkPrimary outline-none focus:outline-none focus:shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,_rgba(0,0,0,0.3)_0px_3px_7px_-3px]"
              />
              <DialogClose
                className={`bg-capuut px-1 py-1 text-lg text-white rounded-md w-full`}
                onClick={() => {
                  handleAddNewButtonClick(dialogInputValue);
                }}
              >
                Add
              </DialogClose>
            </DialogContent>
          </Dialog>
        )}
      </ul>
    </div>
  );
};

export default DropdownMenu;
