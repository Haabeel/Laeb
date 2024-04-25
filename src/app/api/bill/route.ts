import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { auth, db } from "../../../../firebase.config";
import { Partner } from "@/types";
import { NextRequest } from "next/server";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";

const authenticate = (req: NextRequest) => {
  const { NEXT_PUBLIC_ADMIN_USERNAME, NEXT_PUBLIC_ADMIN_PASSWORD } =
    process.env;
  const headers = new Headers(req.headers);
  const authKey = headers.get("authKey");

  if (
    authKey !== `${NEXT_PUBLIC_ADMIN_USERNAME}:${NEXT_PUBLIC_ADMIN_PASSWORD}`
  ) {
    return new Response("Unauthorized auth", { status: 401 });
  }
};

export const POST = async (req: NextRequest) => {
  try {
    authenticate(req);
    await signInWithEmailAndPassword(
      auth,
      "khalfayhaabeel@gmail.com",
      "C@pri1980"
    )
      .then(async () => {
        const partnersRef = collection(db, "partners");
        const snapshot = await getDocs(partnersRef);
        snapshot.forEach(async (partnerDoc) => {
          const partner = partnerDoc.data() as Partner;
          if (!partner.billingDates) {
            console.log("No billing dates found for partner", partnerDoc.id);
            const billingDates = {
              latestBilledAt: new Date().toISOString(),
              nextBillingAt: new Date(
                new Date().setMonth(new Date().getMonth() + 1)
              ).toISOString(),
            };
            await updateDoc(doc(db, "partners", partnerDoc.id), {
              billingDates,
            });
            return new Response(
              "No Billing dates found for the user, updated the default billing dates",
              {
                status: 200,
              }
            );
          }
          const billingDate = new Date(partner.billingDates.nextBillingAt);
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
        return new Response("Billing dates updated successfully", {
          status: 200,
        });
      })
      .catch((error) => {
        console.error("Error signing in", error);
        return new Response("Error signing in", { status: 500 });
      });
  } catch (error) {
    console.error("Error updating billing dates", error);
    return new Response("Error updating billing dates", { status: 500 });
  } finally {
    signOut(auth);
  }
  return new Response("Unauthorized", { status: 401 });
};

const isToday = (date: Date) => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};
