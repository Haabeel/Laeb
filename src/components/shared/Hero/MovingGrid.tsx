import { InfiniteMovingCards } from "@/components/ui/InfiniteMovingCards";
import React from "react";
import football from "@/assets/images/footballPitch.jpg";
import tennis from "@/assets/images/tennisPitch.jpg";
import swimming from "@/assets/images/swimmingPool.jpg";
import badminton from "@/assets/images/badminton.jpg";
import cricket from "@/assets/images/cricket.jpg";
import football2 from "@/assets/images/football.jpg";
import golf from "@/assets/images/golf.jpg";
import runningTrack from "@/assets/images/runningTrack.jpg";
import runningTrackAdults from "@/assets/images/runningTrackAdults.jpg";

const MovingGrid = () => {
  return (
    <div className={`flex flex-col flex-[2.5] gap-4 w-[90%]`}>
      <InfiniteMovingCards
        items={[
          { src: cricket.src },
          { src: swimming.src },
          { src: football.src },
          { src: golf.src },
          { src: runningTrack.src },
          { src: badminton.src },
          { src: runningTrackAdults.src },
          { src: football2.src },
          { src: tennis.src },
        ]}
        direction="left"
        speed="slow"
        className="ml-36 rounded-3xl"
      />
      <InfiniteMovingCards
        items={[
          { src: football2.src },
          { src: tennis.src },
          { src: swimming.src },
          { src: golf.src },
          { src: cricket.src },
          { src: badminton.src },
          { src: runningTrack.src },
          { src: football.src },
          { src: runningTrackAdults.src },
        ]}
        direction="left"
        speed="slow"
        className="ml-20 rounded-3xl"
      />
      <InfiniteMovingCards
        items={[
          { src: tennis.src },
          { src: runningTrack.src },
          { src: badminton.src },
          { src: swimming.src },
          { src: golf.src },
          { src: cricket.src },
          { src: football2.src },
          { src: football.src },
          { src: runningTrackAdults.src },
        ]}
        direction="left"
        speed="slow"
        className="ml-36 rounded-3xl"
      />
    </div>
  );
};

export default MovingGrid;
