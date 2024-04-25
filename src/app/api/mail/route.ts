import ReceiptEmail from "@/emails/receipt";
import { transporter } from "@/lib/nodemailer";
import { ReceiptEmailProps } from "@/types";
import { render } from "@react-email/render";
import { NextRequest } from "next/server";

const authenticate = (req: NextRequest) => {
  const { NEXT_PUBLIC_ADMIN_USERNAME, NEXT_PUBLIC_ADMIN_PASSWORD } =
    process.env;
  const headers = new Headers(req.headers);
  const authKey = headers.get("authKey");

  if (
    authKey !== `${NEXT_PUBLIC_ADMIN_USERNAME}:${NEXT_PUBLIC_ADMIN_PASSWORD}`
  ) {
    return false;
  }
  return true;
};

export const POST = async (req: NextRequest) => {
  const isAuth = authenticate(req);
  if (isAuth) {
    try {
      const data = (await req.json()) as {
        to: string;
        subject: string;
      } & ReceiptEmailProps;
      const htmlEmail = render(
        ReceiptEmail({
          laebEmail: data.laebEmail,
          laebFacebook: data.laebFacebook,
          laebInstagram: data.laebInstagram,
          laebPhone: data.laebPhone,
          laebTwitter: data.laebTwitter,
          listingBy: data.listingBy,
          listingDate: data.listingDate,
          listingEmail: data.listingEmail,
          listingLocation: data.listingLocation,
          listingPhone: data.listingPhone,
          listingPrice: data.listingPrice,
          listingTime: data.listingTime,
          listingUrl: data.listingUrl,
          partnerPage: data.partnerPage,
          paymentMethod: data.paymentMethod,
          recieptID: data.recieptID,
          userName: data.userName,
        })
      );
      await transporter.sendMail({
        from: "laebuae@gmail.com",
        to: data.to,
        subject: data.subject,
        html: htmlEmail,
      });

      return new Response("success", { status: 200 });
    } catch (error) {
      return new Response(error as string, { status: 500 });
    }
  }
  return new Response("Unauthorized", { status: 401 });
};
