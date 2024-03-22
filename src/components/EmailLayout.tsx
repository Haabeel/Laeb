import React from "react";
import { FormFields } from "./shared/ContactUs";

const EmailLayout = ({ body }: { body: FormFields }) => {
  return (
    <div className={`flex flex-col justify-center items-center gap-5`}>
      <h1>{body.name}</h1>
      <h3>{body.email}</h3>
      <h5>{body.message}</h5>
    </div>
  );
};

export default EmailLayout;
