import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../../firebase.config";
import { Partner } from "@/types";
const authenticate = async (req: NextApiRequest, res: NextApiResponse) => {
  const { NEXT_PUBLIC_ADMIN_USERNAME, NEXT_PUBLIC_ADMIN_PASSWORD } =
    process.env;
  const { authKey } = req.headers;

  if (
    authKey !== `${NEXT_PUBLIC_ADMIN_USERNAME}:${NEXT_PUBLIC_ADMIN_PASSWORD}`
  ) {
    return res.status(401).json({ error: "Unauthorized" });
  }
};
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    authenticate(req, res);

    const partnersRef = collection(db, "partners");
    const snapshot = await getDocs(partnersRef);
    snapshot.forEach(async (partnerDoc) => {
      const partner = partnerDoc.data() as Partner;
      const billingDate = new Date(partner.billingDates!!.nextBillingAt);
      if (isToday(billingDate)) {
        const newNextBillingDate = new Date();
        newNextBillingDate.setMonth(newNextBillingDate.getMonth() + 1);
        await updateDoc(doc(db, "partners", partnerDoc.id), {
          billingDates: {
            nextBillingAt: newNextBillingDate.toISOString(),
            latestBilledAt: billingDate.toISOString(),
          },
        });
      }
    });
    res.status(200).json({ message: "Billing dates updated" });
  } catch {
    console.error("Error updating billing dates");
    res.status(500).json({ error: "Error updating billing dates" });
  }
};

const isToday = (date: Date) => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

export default handler;
