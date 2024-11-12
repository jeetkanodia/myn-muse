import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../services/axios";
import CustomAudioPlayer from "./CustomAudioPlayer";
import CustomAudioPlayer2 from "./CustomAudioPlayer2";
import { Logo } from "./UserImage";

const ContextImageChat = () => {
  const messageEndRef = useRef(null);
  const [previewRecording, setPreviewRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);

  const textareaRef = useRef(null);
  const [messages, setMessages] = useState([]);

  const [currentMessage, setCurrentMessage] = useState("");

  const [step, setStep] = useState(0);
  const [questions, setQuestions] = useState([]);

  const { orderId } = useParams();
  console.log(orderId);

  useEffect(() => {
    axiosInstance
      .get("/vendor/getOrder/" + orderId)
      .then((res) => {
        console.log(res.data);
        let temp = [];
        for (let i = 0; i < res.data?.imageQuestions.length; i++) {
          if (res.data?.imageQuestions[i]?.status == "un_answered") {
            temp.push(res.data?.imageQuestions[i]);
          }
        }
        setQuestions(temp);
        let arr = [];
        res.data?.imageQuestions.forEach((question) => {
          if (question?.status == "un_answered") {
            arr.push({
              text: question?.question,
              user: false,
              image: question?.image,
            });
          }
        });
        //remove all the elements except one
        arr.splice(1, arr.length - 1);
        setMessages(arr);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  // Function to handle sending a message
  const handleSend = () => {
    if (previewRecording) {
      setPreviewRecording(false);
      handleSendVoice(audioUrl);
      return;
    }
    if (currentMessage.trim() === "") return;

    setMessages((prevMessages) => [
      ...prevMessages,
      { text: currentMessage, user: true, isQuestion: false },
    ]);

    axiosInstance
      .post("/editor/order/answer-image-question", {
        order_id: orderId,
        questionIndex: step,
        answer: currentMessage,
      })
      .then((res) => {
        console.log(res.data);
        // push next question to messages
        if (step < questions.length - 1) {
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              text: questions[step + 1]?.question,
              user: false,
              image: questions[step + 1]?.image,
            },
          ]);
        }
      })
      .catch((err) => {
        console.log(err);
      });

    setCurrentMessage("");

    if (step < questions.length - 1) {
      setStep(step + 1);
    }
  };

  const handleRemovePreview = () => {
    setPreviewRecording(false);
    setAudioUrl(null);
  };

  const handleSendVoice = async (url) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: url, user: true, isAudio: true },
    ]);

    setStep(step + 1);

    try {
      // Fetch the blob from the URL
      const response = await fetch(url);
      const blob = await response.blob();

      // Create a File object from the blob
      const file = new File([blob], "audio_recording.wav", {
        type: "audio/wav",
      });

      // Create FormData and append the file
      const formData = new FormData();
      formData.append("audio", file);
      formData.append("index", step);
      setAudioUrl(null);
    } catch (error) {
      console.error("Error while uploading file:", error);
    }
  };

  // Function to handle stopping the recording and saving the audio URL
  const handleStopRecording = async (url) => {
    console.log(url);
    setAudioUrl(url);
    setPreviewRecording(true);
    // handleSendVoice(url);
  };

  // Effect to scroll to the end of the messages list when messages are updated
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="w-full h-screen bg-[#F5F5F5] max-h-screen flex flex-col items-center md:px-[50px] pt-[90px]  px-[20px] md:py-[40px] py-[20px] md:gap-[50px] gap-[20px]">
      <div className="flex flex-col w-full h-full overflow-auto scrollbar-hidden">
        <div className="flex-grow mb-4 overflow-y-auto md:text-[16px] font-medium text-[12px] scrollbar-hidden">
          {messages.map((message, index) =>
            message?.user ? (
              <div
                key={index}
                className={`mb-[30px] ${
                  message?.user || message?.isAudio ? "text-right" : "text-left"
                }`}
              >
                {message.isAudio ? (
                  <div className="w-full flex justify-end">
                    <CustomAudioPlayer url={message.text} />
                  </div>
                ) : message.isImage ? (
                  <img
                    src={message.text}
                    alt="Uploaded image"
                    className="max-w-full max-h-[200px] rounded-lg hidden"
                  />
                ) : (
                  <div
                    className={
                      message.isQuestion &&
                      index > 0 &&
                      "flex flex-col justify-start w-fit"
                    }
                  >
                    <span
                      className={`inline-block px-4 py-2 rounded-lg md:max-w-[40vw] max-w-[80vw] ${
                        message.user
                          ? "bg-white text-[#8D8D8D] "
                          : "bg-[#EBEBEB] text-[#1A1A1A]"
                      }`}
                    >
                      {message.isQuestion ? (
                        <div className=" flex flex-col gap-[12px]">
                          {message?.text?.question}
                          <span className="text-[#8D8D8D]">
                            {message?.text?.answer}
                          </span>
                        </div>
                      ) : (
                        message.text
                      )}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div key={index} className={`mb-[30px] text-left`}>
                <div className={"flex flex-col justify-start w-fit"}>
                  <span className="inline-block px-4 py-2 rounded-lg md:max-w-[40vw] max-w-[80vw] bg-[#EBEBEB] text-[#1A1A1A]">
                    {message.text}
                  </span>
                </div>
                <div>
                  <img
                    src={message?.image?.mediaLink}
                    alt="Uploaded"
                    className="max-w-full max-h-[200px] rounded-lg mt-5"
                  />
                </div>
              </div>
            )
          )}

          <div ref={messageEndRef} />
        </div>
        {step < questions.length && (
          <div className="md:gap-[17px] gap-[8px] mb-[10px] justify-end flex items-end relative ">
            {previewRecording ? (
              <div className="flex w-full bg-[#4F4F4F] rounded-lg items-center justify-between pr-[18px]">
                <CustomAudioPlayer2 url={audioUrl} style={{ width: 1000 }} />
                <button onClick={handleRemovePreview}>
                  <svg
                    className="md:w-[35px] md:block hidden"
                    xmlns="http://www.w3.org/2000/svg"
                    width="35"
                    height="35"
                    viewBox="0 0 166 166"
                    fill="none"
                  >
                    <mask
                      id="mask0_859_1866"
                      maskUnits="userSpaceOnUse"
                      x="0"
                      y="0"
                      width="166"
                      height="166"
                    >
                      <rect width="166" height="166" fill="#D9D9D9" />
                    </mask>
                    <g mask="url(#mask0_859_1866)">
                      <path
                        d="M67.8369 117.581H74.7536V55.3314H67.8369V117.581ZM91.2464 117.581H98.163V55.3314H91.2464V117.581ZM41.5 138.331V41.4981H34.5833V34.5814H62.25V29.2607H103.75V34.5814H131.417V41.4981H124.5V138.331H41.5Z"
                        fill="white"
                      />
                    </g>
                  </svg>

                  <svg
                    className="md:hidden"
                    xmlns="http://www.w3.org/2000/svg"
                    width="17"
                    height="18"
                    viewBox="0 0 17 18"
                    fill="none"
                  >
                    <mask
                      id="mask0_863_3284"
                      maskUnits="userSpaceOnUse"
                      x="0"
                      y="0"
                      width="17"
                      height="18"
                    >
                      <rect y="0.5" width="17" height="17" fill="#D9D9D9" />
                    </mask>
                    <g mask="url(#mask0_863_3284)">
                      <path
                        d="M6.94724 12.541H7.65557V6.16598H6.94724V12.541ZM9.34459 12.541H10.0529V6.16598H9.34459V12.541ZM4.25008 14.666V4.74931H3.54175V4.04098H6.37508V3.49609H10.6251V4.04098H13.4584V4.74931H12.7501V14.666H4.25008Z"
                        fill="white"
                      />
                    </g>
                  </svg>
                </button>
              </div>
            ) : (
              <>
                <textarea
                  value={currentMessage}
                  ref={textareaRef}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  placeholder="Write the answer"
                  className="w-full px-6 pt-3 pb-2 flex items-center font-['Gilroy'] border-[0.5px] hide-scrollbar overflow-auto lg:text-base text-[14px] rounded-full focus:outline-none bg-[#FFFFFF] border-black text-primary"
                  style={{
                    minHeight: "48px",
                    maxHeight: "9rem",
                    overflowY: currentMessage.length > 0 ? "auto" : "hidden",
                    resize: "none",
                    fontFamily: "Gilroy",
                    textAlign: "left",
                  }}
                />
              </>
            )}
            <button
              onClick={handleSend}
              className="bg-primary text-secondary md:pl-4 rounded-full focus:outline-none md:h-[63px] h-[40px] md:w-[182px] w-[53px]"
            >
              <div className="flex gap-[10px] justify-center items-center">
                <h2 className="hidden md:block">Send</h2>
                <svg
                  className="w-[32px] md:w-[40px]"
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="41"
                  viewBox="0 0 40 41"
                  fill="none"
                >
                  <mask
                    id="mask0_181_579"
                    maskUnits="userSpaceOnUse"
                    x="0"
                    y="0"
                    width="40"
                    height="41"
                  >
                    <rect y="0.5" width="40" height="40" fill="#D9D9D9" />
                  </mask>
                  <g mask="url(#mask0_181_579)">
                    <path
                      d="M6.66663 31.3332V22.7436L16.4104 20.4998L6.66663 18.2561V9.6665L32.3716 20.4998L6.66663 31.3332Z"
                      fill="white"
                    />
                  </g>
                </svg>
              </div>
            </button>
          </div>
        )}

        <div className="flex items-center gap-1 md:gap-2 justify-center self-center">
          <Logo />
          <span className="text-[10px] md:text-[14px] font-['Gilroy'] text-[#B9B9B9]">
            End-to-end encrypted
          </span>
        </div>
      </div>
    </div>
  );
};

export default ContextImageChat;
