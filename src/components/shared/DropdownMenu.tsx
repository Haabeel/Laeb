import { Emirates } from "@/types";
import React, { useEffect, useState } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import { MdKeyboardArrowDown } from "react-icons/md";

type DropdownMenuProps = {
  defaultText: string;
  dataSet: string[];
  data: string | null;
  hasSearch?: boolean;
  setData: React.Dispatch<React.SetStateAction<string | null>>;
};

const DropdownMenu = ({
  defaultText,
  dataSet,
  data,
  setData,
  hasSearch,
}: DropdownMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  return (
    <div className="flex flex-col gap-2 justify-center items-center w-full relative">
      <button
        className="bg-darkPrimary rounded-lg w-full flex gap-3 px-2 py-1 justify-between items-center text-lg text-lightPrimary"
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
        className={`bg-darkPrimary overflow-y-auto max-h-60 ${
          (dataSet.length == 1 || !hasSearch) && "pt-1"
        } px-1 pb-1 w-full absolute top-10 rounded-lg border-2 dropdown-container border-lightPrimary z-10 ${
          isOpen ? "max-h-60" : "hidden"
        }`}
      >
        {hasSearch && dataSet.length > 1 && (
          <div className="flex items-center sticky top-0 bg-darkPrimary">
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
        {dataSet.map((item) => (
          <li
            key={item}
            className={`text-sm rounded-md hover:bg-lightAccent hover:text-darkPrimary cursor-pointer px-1 py-1 ${
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
              `}
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
      </ul>
    </div>
  );
};

export default DropdownMenu;
