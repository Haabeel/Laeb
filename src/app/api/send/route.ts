import EmailLayout from "@/components/EmailLayout";
import { FormFields } from "@/components/shared/ContactUs";
import React from "react";
import { Resend } from "resend";
import { NextApiRequest, NextApiResponse } from "next";

const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY);

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  const body: FormFields = req.body;
  try {
    const data = await resend.emails.send({
      from: `Contact US <onboarding@resend.dev>`,
      to: "khalfayhaabeel@gmail.com",
      subject: "testing",
      react: React.createElement(EmailLayout, { body }),
      reply_to: body.email,
    });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error });
  }
}
