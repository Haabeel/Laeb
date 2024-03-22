import { User } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { IoIosCloseCircle } from "react-icons/io";
import { MdEdit } from "react-icons/md";

type AccountInformationInputProps = {
  user: User;
  data?: string;
  id: string;
  fieldName: "email" | "firstName" | "lastName" | "phoneNumber";
  editable?: boolean;
};

const AccountInformationInput = ({
  user,
  data,
  id,
  fieldName,
  editable = false,
}: AccountInformationInputProps) => {
  const [value, setValue] = useState(data);
  const [isEditing, setIsEditing] = useState(false);

  const getValue = () => {
    switch (fieldName) {
      case "lastName":
        return user.displayName?.split(" ")[1] || "";
      case "email":
        return user.email || "";
      case "firstName":
        return user.displayName?.split(" ")[0] || "";
      case "phoneNumber":
        return user.phoneNumber ? user.phoneNumber : "";
      default:
        return ""; // Handle unknown fields gracefully
    }
  };

  useEffect(() => {
    if (user) {
      setValue(getValue());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <div
      className={`relative flex items-center justify-between bg-lightPrimary pr-2 rounded-md w-[17rem] text-xl ${
        !user ? "animate-pulse" : ""
      }`}
    >
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={`px-3 py-2 rounded-md bg-lightPrimary outline-none focus:outline-none `}
        disabled={!isEditing}
        autoComplete="off"
      />
      {editable &&
        (!isEditing ? (
          <MdEdit
            onClick={() => setIsEditing(true)}
            className="w-5 h-5 text-darkPrimary cursor-pointer"
          />
        ) : (
          <IoIosCloseCircle
            onClick={() => setIsEditing(false)}
            className="w-5 h-5 text-darkPrimary cursor-pointer"
          />
        ))}
    </div>
  );
};

export default AccountInformationInput;