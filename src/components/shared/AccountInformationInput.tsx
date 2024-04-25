import { cn } from "@/utility";
import { User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { IoIosCloseCircle } from "react-icons/io";
import { MdEdit } from "react-icons/md";
import { db } from "../../../firebase.config";

type AccountInformationInputProps = {
  user: User | null;
  data?: string;
  id: string;
  fieldName:
    | "email"
    | "firstName"
    | "lastName"
    | "phoneNumber"
    | "password"
    | "fullName";
  editable?: boolean;
  setNeedsUpdate?: React.Dispatch<React.SetStateAction<boolean>>;
  setData?: React.Dispatch<React.SetStateAction<string>>;
  className?: string;
};

const AccountInformationInput = ({
  user,
  data,
  id,
  fieldName,
  editable = false,
  setNeedsUpdate,
  setData,
  className,
}: AccountInformationInputProps) => {
  const [value, setValue] = useState(data || "");
  const [isEditing, setIsEditing] = useState(false);
  const [prev, setPrev] = useState<string | undefined>(data || "");

  const getValue = () => {
    if (user) {
      switch (fieldName) {
        case "lastName":
          return user.displayName?.split(" ")[1] || "";
        case "email":
          return user.email || "";
        case "firstName":
          return user.displayName?.split(" ")[0] || "";
        case "phoneNumber":
          console.log(user.phoneNumber);
          return user.phoneNumber
            ? user.phoneNumber.slice(0, 4) + " " + user.phoneNumber.slice(4)
            : "";
        case "password":
          return "********";
        case "fullName":
          return user.displayName || "";
        default:
          return ""; // Handle unknown fields gracefully
      }
    }
  };

  useEffect(() => {
    if (user) {
      setValue(getValue()!!);
      setPrev(getValue());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <div
      className={cn(
        `relative flex items-center justify-between bg-lightPrimary pr-2 rounded-md w-[20rem] text-xl ${
          !user ? "animate-pulse" : ""
        }`,
        className
      )}
    >
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
        }}
        className={`px-3 py-2 rounded-md bg-lightPrimary outline-none focus:outline-none w-full`}
        disabled={!isEditing}
        autoComplete="off"
      />
      {editable &&
        setData &&
        (!isEditing ? (
          <MdEdit
            onClick={() => setIsEditing(true)}
            className="w-5 h-5 text-darkPrimary cursor-pointer"
          />
        ) : (
          <IoIosCloseCircle
            onClick={() => {
              setIsEditing(false);
              if (setNeedsUpdate)
                setNeedsUpdate(prev?.toLowerCase() !== value?.toLowerCase());
              setData(value);
            }}
            className="w-5 h-5 text-darkPrimary cursor-pointer"
          />
        ))}
    </div>
  );
};

export default AccountInformationInput;
