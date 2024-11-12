import React, { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

const AudioRecorder = ({ onStop, setRecording }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);
  const [duration, setDuration] = useState("00:00");
  const [time, setTime] = useState(0);
  const timerRef = useRef(null);
  const timeoutRef = useRef(null);
  useEffect(() => {
    if (waveformRef.current) {
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: "#A8DBA8",
        progressColor: "#3B8686",
        cursorColor: "transparent",
        height: 50,
        barWidth: 3,
        barRadius: 2,
        barGap: 2,
        responsive: true,
      });
    }

    return () => {
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (audioUrl && wavesurfer.current) {
      wavesurfer.current.load(audioUrl);
    }
  }, [audioUrl]);

  const handleStartRecording = async () => {
    setIsRecording(true);
    setRecording(true);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    setMediaRecorder(recorder);

    const audioChunks = [];
    recorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    recorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      onStop(url);
      setIsRecording(false);
      setRecording(false);
    };

    timerRef.current = setInterval(() => {
      setTime((prevTime) => prevTime + 1);
    }, 1000);

    recorder.start();
  };

  const handleStopRecording = () => {
    clearInterval(timerRef.current);
    timerRef.current = null;
    mediaRecorder.stop();
  };

  // const handleToggleRecording = () => {
  //   if (isRecording) {
  //     handleStopRecording();
  //   } else {
  //     handleStartRecording();
  //   }
  // };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  const handleMouseDown = () => {
    timeoutRef.current = setTimeout(() => {
      handleStartRecording();
    }, 500);
  };

  const handleMouseUp = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      if (!isRecording) {
        handleStartRecording();
      } else {
        handleStopRecording();
      }
    }
  };

  return (
    <div className="">
      <button onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}>
        {isRecording ? (
          <div className="w-full md:gap-[20px] gap-[10px] flex items-center ">
            <div className="absolute md:w-[120px] w-[50px] md:right-[120px] right-[60px] md:top-[-45px] top-[-12px] text-[#939393]">
              {/* <Lottie
                className="text-[#939393]"
                animationData={animationData}
                autoplay={true}
                loop={true}
              /> */}
            </div>
            <span className="text-[#939393] md:text-[16px] text-[12px] md:mb-2 mb-0 mt-0 md:mt-5">
              {" "}
              {formatTime(time)}
            </span>
            <span>
              <svg
                className="sm:w-[35px] w-[28px] md:block hidden mt-0 md:mt-5"
                xmlns="http://www.w3.org/2000/svg"
                width="35"
                height="35"
                viewBox="0 0 35 35"
                fill="none"
              >
                <mask
                  id="mask0_859_1875"
                  maskUnits="userSpaceOnUse"
                  x="0"
                  y="0"
                  width="35"
                  height="35"
                >
                  <rect width="35" height="35" fill="#D9D9D9" />
                </mask>
                <g mask="url(#mask0_859_1875)">
                  <path
                    d="M24.3991 19.5584L23.294 18.3975C23.4287 18.1188 23.539 17.7737 23.625 17.3625C23.7111 16.9512 23.7541 16.5109 23.7541 16.0416H25.2124C25.2124 16.7744 25.1386 17.4246 24.9908 17.9921C24.843 18.5597 24.6458 19.0817 24.3991 19.5584ZM19.3117 14.4542L13.5458 8.63218V7.2916C13.5458 6.46886 13.8263 5.77712 14.3872 5.21639C14.948 4.65542 15.6397 4.37494 16.4624 4.37494C17.2849 4.37494 17.9767 4.65542 18.5377 5.21639C19.0986 5.77712 19.3791 6.46886 19.3791 7.2916V14.1345C19.3791 14.1962 19.3721 14.2523 19.358 14.3029C19.3441 14.3535 19.3287 14.4039 19.3117 14.4542ZM15.7333 29.8958V24.8142C13.4486 24.586 11.5406 23.6394 10.0093 21.9745C8.47807 20.3095 7.71245 18.3319 7.71245 16.0416H9.17078C9.17078 18.059 9.88172 19.7786 11.3036 21.2005C12.7255 22.6223 14.4451 23.3333 16.4624 23.3333C17.5132 23.3333 18.4933 23.1262 19.4028 22.712C20.3126 22.2978 21.0992 21.729 21.7628 21.0054L22.8033 22.0459C22.0984 22.8106 21.266 23.4327 20.3059 23.9122C19.3458 24.392 18.3077 24.6927 17.1916 24.8142V29.8958H15.7333ZM29.0712 30.3781L2.8551 4.16166L3.88724 3.12988L30.1033 29.346L29.0712 30.3781Z"
                    fill="#9D9D9D"
                  />
                </g>
              </svg>

              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="sm:w-[35px] w-[28px] md:hidden block"
                viewBox="0 0 20 30"
                fill="none"
              >
                <mask
                  id="mask0_863_3523"
                  maskUnits="userSpaceOnUse"
                  x="0"
                  y="0"
                  width="17"
                  height="18"
                >
                  <rect y="0.5" width="17" height="17" fill="#D9D9D9" />
                </mask>
                <g mask="url(#mask0_863_3523)">
                  <path
                    d="M11.8509 9.99908L11.3142 9.43525C11.3796 9.29984 11.4332 9.13226 11.475 8.93251C11.5168 8.73276 11.5377 8.5189 11.5377 8.29094H12.246C12.246 8.64688 12.2101 8.96267 12.1383 9.23833C12.0666 9.51399 11.9708 9.76758 11.8509 9.99908ZM9.37991 7.51992L6.57933 4.69207V4.04094C6.57933 3.64132 6.71557 3.30533 6.98804 3.03298C7.2604 2.76051 7.59638 2.62427 7.996 2.62427C8.3955 2.62427 8.73149 2.76051 9.00396 3.03298C9.27643 3.30533 9.41267 3.64132 9.41267 4.04094V7.36462C9.41267 7.3946 9.40924 7.42187 9.4024 7.44643C9.39567 7.47098 9.38817 7.49548 9.37991 7.51992ZM7.64183 15.0201V12.5519C6.53211 12.4411 5.60538 11.9813 4.86163 11.1726C4.11788 10.3639 3.746 9.40338 3.746 8.29094H4.45433C4.45433 9.2708 4.79965 10.106 5.49027 10.7967C6.1809 11.4873 7.01614 11.8326 7.996 11.8326C8.50635 11.8326 8.98241 11.732 9.42418 11.5309C9.86606 11.3297 10.2481 11.0534 10.5704 10.7019L11.0758 11.2073C10.7335 11.5787 10.3291 11.8809 9.86281 12.1138C9.39649 12.3469 8.89228 12.4929 8.35017 12.5519V15.0201H7.64183ZM14.1203 15.2544L1.38672 2.52068L1.88804 2.01953L14.6216 14.7531L14.1203 15.2544Z"
                    fill="#9D9D9D"
                  />
                </g>
              </svg>
            </span>
          </div>
        ) : (
          <div className="w-full md:gap-[20px] gap-[10px] flex items-center mt-5">
            <svg
              className="w-[28px] h-[28px] md:block hidden"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 19 26"
              fill="none"
            >
              <path
                d="M9.5 14.9583C8.67726 14.9583 7.98552 14.6778 7.42479 14.1169C6.86382 13.5561 6.58333 12.8644 6.58333 12.0417V3.29167C6.58333 2.46892 6.86382 1.77719 7.42479 1.21646C7.98552 0.655487 8.67726 0.375 9.5 0.375C10.3227 0.375 11.0145 0.655487 11.5752 1.21646C12.1362 1.77719 12.4167 2.46892 12.4167 3.29167V12.0417C12.4167 12.8644 12.1362 13.5561 11.5752 14.1169C11.0145 14.6778 10.3227 14.9583 9.5 14.9583ZM8.77083 25.8958V20.7665C6.48611 20.557 4.57813 19.6231 3.04688 17.9647C1.51562 16.3063 0.75 14.332 0.75 12.0417H2.20833C2.20833 14.059 2.91927 15.7786 4.34115 17.2005C5.76302 18.6224 7.48264 19.3333 9.5 19.3333C11.5174 19.3333 13.237 18.6224 14.6589 17.2005C16.0807 15.7786 16.7917 14.059 16.7917 12.0417H18.25C18.25 14.332 17.4844 16.3063 15.9531 17.9647C14.4219 19.6231 12.5139 20.557 10.2292 20.7665V25.8958H8.77083Z"
                fill="#9D9D9D"
              />
            </svg>

            <svg
              className="md:hidden mt-5"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
            >
              <mask
                id="mask0_863_3405"
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width="17"
                height="18"
              >
                <rect y="0.5" width="17" height="17" fill="#D9D9D9" />
              </mask>
              <g mask="url(#mask0_863_3405)">
                <path
                  d="M8.5 9.70833C8.10038 9.70833 7.7644 9.5721 7.49204 9.29963C7.21957 9.02727 7.08333 8.69128 7.08333 8.29167V4.04167C7.08333 3.64205 7.21957 3.30606 7.49204 3.03371C7.7644 2.76124 8.10038 2.625 8.5 2.625C8.89962 2.625 9.2356 2.76124 9.50796 3.03371C9.78043 3.30606 9.91667 3.64205 9.91667 4.04167V8.29167C9.91667 8.69128 9.78043 9.02727 9.50796 9.29963C9.2356 9.5721 8.89962 9.70833 8.5 9.70833ZM8.14583 15.0208V12.5294C7.03611 12.4277 6.10938 11.9741 5.36563 11.1686C4.62187 10.3631 4.25 9.4041 4.25 8.29167H4.95833C4.95833 9.27153 5.30365 10.1068 5.99427 10.7974C6.6849 11.488 7.52014 11.8333 8.5 11.8333C9.47986 11.8333 10.3151 11.488 11.0057 10.7974C11.6964 10.1068 12.0417 9.27153 12.0417 8.29167H12.75C12.75 9.4041 12.3781 10.3631 11.6344 11.1686C10.8906 11.9741 9.96389 12.4277 8.85417 12.5294V15.0208H8.14583Z"
                  fill="#9D9D9D"
                />
              </g>
            </svg>
          </div>
        )}
      </button>
    </div>
  );
};

export default AudioRecorder;
