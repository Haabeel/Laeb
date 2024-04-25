import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "laebuae@gmail.com",
    pass: "bslibfyplfunfcla",
  },
});
