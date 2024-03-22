import EmailLayout from "@/components/EmailLayout";
import { FormFields } from "@/components/shared/ContactUs";
import React from "react";
import { Resend } from "resend";

const resend = new Resend("re_f6Qcrxdn_Eynr7ETioXvLUrh4kwyeT18r");

export async function POST(req: { json: () => FormFields }) {
  const body = await req.json();
  try {
    const data = await resend.emails.send({
      from: `Contact US <onboarding@resend.dev>`,
      to: "khalfayhaabeel@gmail.com",
      subject: "testing",
      react: React.createElement(EmailLayout, { body }),
      reply_to: body.email,
    });
    return Response.json(data);
  } catch (error) {
    return Response.json({ error });
  }
}
