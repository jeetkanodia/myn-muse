import React, { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

const CustomAudioPlayer = ({ url }) => {
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState("00:00");

  useEffect(() => {
    if (waveformRef.current) {
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: "#C1CAD0",
        progressColor: "var(--primary-color)",
        cursorColor: "transparent",
        height: 50,
        barWidth: 3,
        barRadius: 2,
        barGap: 7,
        responsive: true,
      });

      wavesurfer.current.load(url);

      wavesurfer.current.on("ready", () => {
        const totalSeconds = wavesurfer.current.getDuration();
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);
        setDuration(
          `${minutes < 10 ? "0" : ""}${minutes}:${
            seconds < 10 ? "0" : ""
          }${seconds}`
        );
      });

      wavesurfer.current.on("finish", () => {
        setIsPlaying(false);
      });
    }

    return () => {
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
      }
    };
  }, [url]);

  const handlePlayPause = () => {
    if (wavesurfer.current) {
      setIsPlaying(!isPlaying);
      wavesurfer.current.playPause();
    }
  };

  return (
    <div className="flex items-center bg-white text-black px-[20px] rounded-lg shadow-md md:w-[368px] w-[236px] md:h-[63px] h-[52px]">
      <button onClick={handlePlayPause} className="mr-2">
        {isPlaying ? (
          <div className="flex justify-center items-center bg-primary w-[33px] h-[33px] rounded-full">
            <svg
              fill="black"
              stroke="white"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                className=""
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 9v6m4-6v6"
              ></path>
            </svg>
          </div>
        ) : (
          <div className="flex justify-center items-center bg-primary pl-[3px] w-[33px] h-[33px] rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="10"
              height="12"
              viewBox="0 0 10 12"
              fill="white"
            >
              <path d="M0.923096 11.1921V0.807617L9.07685 5.99987L0.923096 11.1921Z" />
            </svg>
          </div>
        )}
      </button>
      <div ref={waveformRef} className="flex-grow mx-2"></div>
      <span className="text-[10px] md:text-[12px]">{duration}</span>
    </div>
  );
};

export default CustomAudioPlayer;
