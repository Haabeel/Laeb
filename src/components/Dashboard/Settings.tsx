import React from "react";
import { BsApple, BsGoogle } from "react-icons/bs";
import { FaFacebook } from "react-icons/fa6";

const Settings = () => {
  return (
    <div className="grid grid-cols-2 gap-5 justify-center items-center text-2xl">
      <section className="flex flex-col gap-3 w-[20vw] bg-[#AEAEAE] rounded-md p-5">
        <p className="text-darkPrimary text-2xl">Link Accounts</p>
        <div className="flex gap-5 items-center bg-white rounded-md px-3 py-2">
          <BsGoogle className="text-darkPrimary" />
          <p className="text-darkPrimary text-lg">Google</p>
        </div>
        <div className="flex gap-5 items-center bg-white rounded-md px-3 py-2">
          <FaFacebook className="text-darkPrimary" />
          <p className="text-darkPrimary text-lg">Facebook</p>
        </div>
        <div className="flex gap-5 items-center bg-white rounded-md px-3 py-2">
          <BsApple className="text-darkPrimary" />
          <p className="text-darkPrimary text-lg">Apple</p>
        </div>
      </section>
      <section className="flex flex-col gap-3 w-full bg-[#AEAEAE] rounded-md p-5"></section>
    </div>
  );
};

export default Settings;
