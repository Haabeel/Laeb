import { HoverEffect } from "../ui/card-hover-effect";

export function CardHoverEffectDemo() {
  return (
    <div className="max-w-5xl mx-auto px-8">
      <HoverEffect items={projects} />
    </div>
  );
}
export const projects = [
  {
    title: "Find Your Perfect Field",
    description:
      "La'eb connects you to a variety of sports venues – from state-of-the-art fields and turfs to refreshing swimming pools. Browse, filter, and book your next game with ease.",
  },
  {
    title: "Simple & Seamless Booking",
    description:
      "Say goodbye to endless phone calls and complicated reservations. La'eb's user-friendly platform allows for quick and hassle-free booking of your favorite sports facilities.",
  },
  {
    title: "Become a Partner & Level Up",
    description:
      "Own a sports venue? Partner with La'eb to reach a wider audience and simplify your booking management. Our platform offers partner-exclusive features to help you grow your business.",
  },
  {
    title: "Subscriptions that Empower",
    description:
      "La'eb's subscription plans provide partners with a dedicated dashboard to track bookings, manage finances, and gain valuable insights.",
  },
  {
    title: "Dedicated Support, Every Step of the Way",
    description:
      "Our friendly customer support team is always available to assist users and partners with any questions or concerns. We're invested in making your La'eb experience smooth and enjoyable.",
  },
  {
    title: "Join the La'eb Community",
    description:
      "As a user or a partner, La'eb is your gateway to a thriving sports community. Find your perfect playing space, manage your bookings efficiently, and connect with passionate athletes.",
  },
];
