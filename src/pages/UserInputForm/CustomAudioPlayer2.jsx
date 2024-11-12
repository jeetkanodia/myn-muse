import React, { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

const CustomAudioPlayer2 = ({ url }) => {
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState("00:00");

  useEffect(() => {
    if (waveformRef.current) {
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: "#7D7D7D",
        progressColor: "#FFFFFF",
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
    <div className="flex items-center bg-[#bebebe] text-black px-[20px] rounded-full shadow-md md:w-full w-[236px] md:h-[63px] h-[41px]">
      <button onClick={handlePlayPause} className="mr-2">
        {isPlaying ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="35"
            height="35"
            viewBox="0 0 35 35"
            fill="none"
          >
            <mask
              id="mask0_833_2979"
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width="35"
              height="35"
            >
              <rect width="35" height="35" fill="#D9D9D9" />
            </mask>
            <g mask="url(#mask0_833_2979)">
              <path
                d="M20.4167 26.25V8.75H25.5208V26.25H20.4167ZM9.47916 26.25V8.75H14.5833V26.25H9.47916Z"
                fill="white"
              />
            </g>
          </svg>
        ) : (
          <div className="flex justify-center items-center pl-[3px] w-[33px] h-[33px] rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="35"
              height="35"
              viewBox="0 0 35 35"
              fill="none"
            >
              <mask
                id="mask0_841_4016"
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width="35"
                height="35"
              >
                <rect width="35" height="35" fill="#D9D9D9" />
              </mask>
              <g mask="url(#mask0_841_4016)">
                <path
                  d="M13.125 25.0718V9.92773L25.0159 17.4998L13.125 25.0718Z"
                  fill="white"
                />
              </g>
            </svg>
          </div>
        )}
      </button>
      <div ref={waveformRef} className="flex-grow mx-2"></div>
      <span className="text-secondary md:text-[16px] text-[12px]">
        {duration}
      </span>
    </div>
  );
};

export default CustomAudioPlayer2;
