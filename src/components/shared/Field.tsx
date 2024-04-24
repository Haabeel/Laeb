import { cn } from "@/utility";

const Field = ({
  value,
  icon,
  className,
}: {
  value: string;
  icon: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("flex items-center gap-1 text-base", className)}>
    {icon}
    <p>{value}</p>
  </div>
);

export default Field;
