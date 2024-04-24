import { addMinutes } from "date-fns";
import React, { useState } from "react";
import { toast } from "sonner";
import DropdownMenu from "../shared/DropdownMenu";
import { TimingRange } from "../../types";
import { cn } from "@/utility";

type TimingRangesProps = {
  defaultPrice?: number;
  timingRanges: TimingRange[];
  setTimingRanges: React.Dispatch<React.SetStateAction<TimingRange[]>>;
  incrementClassName?: string;
  buttonClassName?: string;
};

const TimingRanges: React.FC<TimingRangesProps> = ({
  defaultPrice = 100,
  timingRanges,
  setTimingRanges,
  incrementClassName,
  buttonClassName,
}) => {
  const [newTimingRange, setNewTimingRange] = useState<TimingRange>({
    startTime: "",
    endTime: "",
    price: defaultPrice,
    booking: { userID: null, status: null, paymentOption: null },
  });
  const [incrementMinutes, setIncrementMinutes] = useState<string | null>(null);
  const addTimingRange = () => {
    if (isTimingRangeValid(newTimingRange)) {
      setTimingRanges([...timingRanges, newTimingRange]);
      setNewTimingRange({
        startTime: "",
        endTime: "",
        price: defaultPrice,
        booking: { userID: null, status: null, paymentOption: null },
      });
    } else {
      toast.error("Invalid timing range");
    }
  };

  const isTimingRangeValid = (timingRange: TimingRange) => {
    if (timingRange.startTime === "" || timingRange.endTime === "") {
      toast.error("Start time and end time are required.");
      return false;
    }

    // Parse start and end time to compare only hours and minutes
    const startTime = new Date(`2022-01-01T${timingRange.startTime}`);
    const endTime = new Date(`2022-01-01T${timingRange.endTime}`);

    // Check if end time is before start time
    if (endTime < startTime) {
      toast.error("End time cannot be before start time.");
      return false;
    }

    // Check if any timing range goes to the next day
    if (startTime.getDate() !== endTime.getDate()) {
      toast.error("Timing range cannot go to the next day.");
      return false;
    }

    // Check for overlap or duplicate timings
    if (
      timingRanges.some(
        (range) =>
          // Check if the start time or end time of the new range matches any existing range
          (timingRange.startTime >= range.startTime &&
            timingRange.startTime < range.endTime) ||
          (timingRange.endTime > range.startTime &&
            timingRange.endTime <= range.endTime) ||
          // Check if the new range is completely inside any existing range
          (timingRange.startTime <= range.startTime &&
            timingRange.endTime >= range.endTime)
      )
    ) {
      toast.error("Timing range overlaps with existing range.");
      return false;
    }

    return true;
  };
  const addCustomTimingRanges = (defaultPrice: number) => {
    const timingRanges: TimingRange[] = [];
    const startOfDay = new Date(2022, 0, 1, 0, 0); // Start time of the day
    const endOfDay = new Date(2022, 0, 1, 23, 59); // End time of the day
    const increment =
      incrementMinutes === "Every 30 Minutes"
        ? 30
        : incrementMinutes === "Every Hour"
        ? 60
        : incrementMinutes === "Every 2 Hours"
        ? 120
        : incrementMinutes === "Every 3 Hours"
        ? 180
        : 60; // Default to 1 hour
    for (let currentTime = startOfDay; currentTime <= endOfDay; ) {
      const startTime = currentTime;
      const endTime = new Date(startTime.getTime() + increment * 60 * 1000); // Add incrementMinutes to the start time

      timingRanges.push({
        startTime: startTime.toTimeString().slice(0, 5), // Convert start time to string format HH:mm
        endTime: endTime.toTimeString().slice(0, 5), // Convert end time to string format HH:mm
        price: defaultPrice,
        booking: { userID: null, status: null, paymentOption: null },
      });

      // Increment current time by the increment duration
      currentTime = endTime;
    }

    setTimingRanges(timingRanges);
  };

  const removeTimingRange = (index: number) => {
    const newTimingRanges = timingRanges.filter((_, i) => i !== index);
    setTimingRanges(newTimingRanges);
  };

  return (
    <div className="flex w-full flex-col items-center justify-start gap-2">
      <h2 className="w-full">Timing Ranges</h2>
      {timingRanges.length > 0 && (
        <div className="grid w-full grid-cols-3 gap-2 overflow-y-auto">
          {timingRanges.map((range, index) => (
            <div
              key={index}
              onClick={() => removeTimingRange(index)}
              className="bg-lightPrimary text-darkPrimary p-1 text-sm rounded-md relative after:absolute hover:after:inset-0 hover:after:h-full hover:after:w-full after:text-white after:bg-capuut after:rounded-md after:transition-all after:duration-700 after:ease-in-out hover:after:content-['Delete'] after:flex after:justify-center after:items-center"
            >
              <p>{`${range.startTime} - ${range.endTime} : ${range.price} DHS`}</p>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-3 items-center justify-between w-full">
        <section className="flex flex-col gap-1 w-full">
          <label htmlFor="startTime">Start time</label>
          <input
            type="time"
            id="startTime"
            value={newTimingRange.startTime}
            className="rounded-lg bg-lightPrimary px-2 py-1 outline-none focus:outline-none selection:bg-darkPrimary selection:text-lightPrimary text-darkPrimary"
            onChange={(e) =>
              setNewTimingRange({
                ...newTimingRange,
                startTime: e.target.value,
              })
            }
          />
        </section>
        <section className="flex flex-col gap-1 w-full">
          <label htmlFor="endTime">End Time</label>
          <input
            type="time"
            id="endTime"
            value={newTimingRange.endTime}
            className="rounded-lg bg-lightPrimary px-2 py-1 outline-none focus:outline-none selection:bg-darkPrimary selection:text-lightPrimary text-darkPrimary"
            onChange={(e) =>
              setNewTimingRange({ ...newTimingRange, endTime: e.target.value })
            }
          />
        </section>
        <section className="flex flex-col gap-1 w-full h-full">
          <label htmlFor="price">Price</label>
          <input
            type="number"
            id="price"
            value={newTimingRange.price}
            className="rounded-lg h-full bg-lightPrimary px-2 py-1 outline-none focus:outline-none text-darkPrimary "
            onChange={(e) =>
              setNewTimingRange({
                ...newTimingRange,
                price: parseInt(e.target.value),
              })
            }
          />
        </section>
      </div>

      <button
        onClick={() => addTimingRange()}
        type="button"
        className={cn(
          "px-2 py-1 text-lightPrimary bg-darkPrimary w-full rounded-lg",
          buttonClassName
        )}
      >
        Add Timing Range
      </button>
      <section className="flex justify-between items-center w-full gap-2">
        <DropdownMenu
          data={incrementMinutes}
          setData={setIncrementMinutes}
          dataSet={[
            "Every 30 Minutes",
            "Every Hour",
            "Every 2 Hours",
            "Every 3 Hours",
          ]}
          defaultText="Increment"
          className={incrementClassName}
        />
        <button
          onClick={() => addCustomTimingRanges(defaultPrice)}
          type="button"
          className={cn(
            "px-2 py-1 text-lightPrimary bg-darkPrimary w-full h-full rounded-lg",
            buttonClassName
          )}
        >
          Add Default
        </button>
      </section>
      <button
        onClick={() => setTimingRanges([])}
        type="button"
        className="px-2 py-1 text-lightPrimary bg-capuut w-full rounded-lg"
      >
        Clear All
      </button>
    </div>
  );
};

export default TimingRanges;
