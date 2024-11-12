import React, { useEffect, useRef, useState } from "react";

import { message as MESSAGE } from "antd";
import { useParams } from "react-router-dom";
import axiosInstance from "../../services/axios";
import CustomAudioPlayer from "./CustomAudioPlayer";
import { Logo } from "./UserImage";

const ReAskChat = () => {
  const { orderId } = useParams();
  console.log(orderId);
  const textareaRef = useRef(null);
  const [previewRecording, setPreviewRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  // State to hold the messages
  const [messages, setMessages] = useState([]);
  // State to hold the current input message
  const [currentMessage, setCurrentMessage] = useState("");
  const [step, setStep] = useState(0);
  const [userResponses, setUserResponses] = useState({});
  const [reanswerIndexes, setReanswerIndexes] = useState([]);
  const [greet, setGreet] = useState(false);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    axiosInstance.get("/vendor/getOrder/" + orderId).then((res) => {
      console.log(res.data);
      setReanswerIndexes(res.data?.reAnswerIndex);
      let arr = [];
      for (let i = 0; i < res.data?.reAnswerIndex.length; i++) {
        let index = res.data?.reAnswerIndex[i]?.index;
        let questionData = res.data?.userInputForm?.questions[index];

        arr.push({
          ...questionData,
          index: index,
        });
      }
      console.log(arr);
      setQuestions(arr);
    });
  }, []);

  const messageEndRef = useRef(null);

  // Effect to add the first question when the component mounts
  useEffect(() => {
    setMessages([{ text: questions[0], user: false, isQuestion: true }]);
  }, [questions]);

  // Effect to automatically add the next question when the step changes, except for the initial mount
  useEffect(() => {
    if (step > 0 && step < questions.length) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: questions[step], user: false, isQuestion: true },
      ]);
    }
  }, [step]);

  // Function to handle sending a message
  const handleSend = async () => {
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

    try {
      const response = await axiosInstance.post("/vendor/order/upadateAnswer", {
        index: reanswerIndexes[step]?.index,
        answer: currentMessage,
        _id: orderId,
      });
      console.log(response.data);
    } catch (error) {
      console.log(error);
    }

    setUserResponses((prevResponses) => ({
      ...prevResponses,
      [questions[step]]: currentMessage,
    }));
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
    setUserResponses((prevResponses) => ({
      ...prevResponses,
      [questions[step]]: url,
    }));

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
    <div className="w-full bg-[#F5F5F5] h-screen min-h-screen flex flex-col items-center md:px-[50px] pt-20 px-[20px] md:py-[40px] py-[20px] md:gap-[50px] gap-[20px]">
      <div className="flex flex-col w-full bg-[#F5F5F5] h-full overflow-auto scrollbar-hidden">
        <div className="flex-grow mb-4 overflow-y-auto md:text-[16px] font-medium text-[12px] scrollbar-hidden">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-[30px] font-['Gilroy'] ${
                message.user || message.isAudio ? "text-right" : "text-left"
              }`}
            >
              {message.isAudio ? (
                <div className="w-full flex justify-end">
                  <CustomAudioPlayer url={message.text} />
                </div>
              ) : message.isImage ? (
                <img
                  src={message.text}
                  alt="Uploaded"
                  className="max-w-full max-h-[200px] rounded-lg hidden"
                />
              ) : (
                <div
                  className={
                    message.isQuestion &&
                    index > 0 &&
                    "flex flex-col justify-start w-fit font-['Gilroy']"
                  }
                >
                  <span
                    className={`inline-block px-4 py-2 rounded-lg md:max-w-[40vw] max-w-[80vw] font-['Gilroy'] ${
                      message.user
                        ? "bg-white text-[#8D8D8D] "
                        : "bg-[#EBEBEB] text-[#1A1A1A]"
                    }`}
                  >
                    {message.isQuestion ? (
                      <div className=" flex flex-col gap-[12px] font-['Gilroy']">
                        {message?.text?.question}
                        <span className="text-[#8D8D8D] font-['Gilroy']">
                          {message?.text?.answer?.ans}
                        </span>

                        <div className="w-full flex justify-between font-['Gilroy']">
                          <button
                            className="text-[#5750FB] font-['Gilroy']"
                            onClick={() =>
                              setCurrentMessage(message?.text?.answer?.ans)
                            }
                          >
                            Re Answer
                          </button>
                          <span
                            className="cursor-pointer"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                message?.text?.answer?.ans
                              );
                              MESSAGE.info("Copied to clipboard");
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              viewBox="0 0 18 18"
                              fill="none"
                            >
                              <mask
                                id="mask0_2704_4362"
                                maskUnits="userSpaceOnUse"
                                x="0"
                                y="0"
                                width="18"
                                height="18"
                              >
                                <rect width="18" height="18" fill="#D9D9D9" />
                              </mask>
                              <g mask="url(#mask0_2704_4362)">
                                <path
                                  d="M5.625 12.75V2.25H13.875V12.75H5.625ZM3.375 15V4.96163H4.125V14.25H11.1634V15H3.375Z"
                                  fill="#C6C6C6"
                                />
                              </g>
                            </svg>
                          </span>
                        </div>
                      </div>
                    ) : (
                      message.text
                    )}
                  </span>
                </div>
              )}
            </div>
          ))}

          <div className=""></div>
          <div ref={messageEndRef} />
        </div>
        {step < questions.length && (
          <div className="md:gap-[17px] gap-[8px] mb-[10px] justify-end flex items-end relative ">
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

export default ReAskChat;
