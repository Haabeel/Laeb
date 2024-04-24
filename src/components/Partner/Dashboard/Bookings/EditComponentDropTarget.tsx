import { useDrop } from "react-dnd";
import { ItemTypes } from "@/components/Partner/Dashboard/Bookings/Listings";
import { Listing } from "@/types";
import { useState } from "react";
import { cn } from "@/utility";

const EditComponentDropTarget = ({
  onDrop,
}: {
  onDrop: (listing: Listing) => void;
}) => {
  const [droppedListing, setDroppedListing] = useState<Listing | null>(null);
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.LISTING,
    drop: (item: Listing) => {
      onDrop(item);
    }, // Pass the dropped listing to the onDrop function
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={cn(
        "w-full h-full border border-lightPrimary rounded-lg border-dashed flex items-center justify-center text-center text-lg font-bold text-lightPrimary",
        { "bg-lightgreen": isOver, "bg-transparent": !isOver },
        { "opacity-100": canDrop, "opacity-50": !canDrop }
      )}
    >
      {isOver && <p>Drop here to edit</p>}
    </div>
  );
};

export default EditComponentDropTarget;
