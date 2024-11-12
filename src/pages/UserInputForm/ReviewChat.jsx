import { message } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axiosInstance from "../../services/axios";
import CustomAudioPlayer from "./CustomAudioPlayer";
import { Logo } from "./UserImage";

const ReviewChat = () => {
  const [previewRecording, setPreviewRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const { orderId } = useParams();
  const textareaRef = useRef(null);
  console.log(orderId);
  const [feedbackId, setFeedbackId] = useState("");
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [step, setStep] = useState(0);
  const [userResponses, setUserResponses] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const [greet, setGreet] = useState(false);
  const questions = [
    "Okay so us know how you feel about the product",
    "Add Image/video of the product (it would be great if you include yourself in the image)",
  ];

  const messageEndRef = useRef(null);

  useEffect(() => {
    setMessages([{ text: questions[0], user: false, isQuestion: true }]);
  }, []);

  useEffect(() => {
    if (step > 0 && step < questions.length) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: questions[step], user: false, isQuestion: true },
      ]);
    }
  }, [step]);

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
    setUserResponses((prevResponses) => ({
      ...prevResponses,
      [questions[step]]: currentMessage,
    }));

    axiosInstance
      .post("/feedback/addFeedBack", {
        description: currentMessage,
        order_id: orderId,
      })
      .then((res) => {
        console.log(res);
        message.success("Feedback added successfully");
        setFeedbackId(res.data._id);
      })
      .catch((err) => {
        console.log(err);
        message.error("Failed to add feedback");
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

  const uploadFilesToApi = async (files) => {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("photo", files[i]);
    }
    formData.append("feedback_id", feedbackId);
    if (feedbackId === "") {
      message.error("Please add feedback first");
      return;
    }
    try {
      const response = await axiosInstance.post(
        "/feedback/uploadImages",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(response);
      message.success("Images uploaded successfully");
    } catch (error) {
      console.error("Error while uploading file:", error);
      message.error("Failed to upload images");
    }
  };

  // Function to handle file upload
  const handleUpload = (files) => {
    setGreet(true);
    // Convert FileList to array
    const filesArray = Array.from(files);
    uploadFilesToApi(files);
    // Iterate through the array and handle each file
    filesArray.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const fileUrl = reader.result;
        setUploadedFiles((prevFiles) => [...prevFiles, fileUrl]);
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: fileUrl, user: true, isImage: true }, // Adjust isImage or isVideo based on file type
        ]);
        setUserResponses((prevResponses) => ({
          ...prevResponses,
          [questions[step]]: fileUrl,
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  // Effect to scroll to the end of the messages list when messages are updated
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="bg-[#F5F5F5] w-full h-screen min-h-screen flex flex-col pt-20 items-center md:px-[50px] px-[20px] md:py-[40px] py-[20px] md:gap-[50px] gap-[20px]">
      <div className="flex flex-col w-full h-full overflow-auto scrollbar-hidden">
        <div className="flex-grow mb-4 overflow-y-auto md:text-[16px] font-medium text-[12px] scrollbar-hidden">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-[30px] ${
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
                    "flex flex-col justify-start "
                  }
                >
                  <span
                    className={`inline-block px-4 py-2 rounded-lg w-fit ${
                      message.user
                        ? "bg-white text-[#8D8D8D]"
                        : " bg-[#EBEBEB] text-[#1A1A1A]"
                    } `}
                  >
                    {message.text}
                  </span>

                  {message.isQuestion && index > 0 && (
                    <div className="ml-auto">
                      {step === 1 && (
                        <label className="ml-5 cursor-pointer">
                          <input
                            type="file"
                            accept="image/*, video/*"
                            onChange={(e) => handleUpload(e.target.files)}
                            className="hidden"
                            multiple
                          />
                          <span className="bg-white flex justify-center items-center md:p-[20px] py-[14px] md:py-[20px] md:w-[378px] w-[223px] text-[#F74F09] border-dotted border-[2px] border-[#F74F09] rounded-[10px]">
                            <div className="w-full flex gap-[6px] justify-center items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="#F74F09"
                              >
                                <mask
                                  id="mask0_946_1597"
                                  maskUnits="userSpaceOnUse"
                                  x="0"
                                  y="0"
                                  width="24"
                                  height="24"
                                >
                                  <rect width="24" height="24" fill="#F74F09" />
                                </mask>
                                <g mask="url(#mask0_946_1597)">
                                  <path
                                    d="M11.498 19.0039H6.49805C5.25055 19.0039 4.18871 18.5687 3.31255 17.6982C2.43621 16.8277 1.99805 15.7687 1.99805 14.5212C1.99805 13.375 2.38971 12.3577 3.17305 11.4694C3.95638 10.5809 4.93013 10.1039 6.0943 10.0384C6.31863 8.58207 6.98846 7.37891 8.1038 6.42891C9.21913 5.47891 10.5172 5.00391 11.998 5.00391C13.666 5.00391 15.083 5.58691 16.249 6.75291C17.415 7.91891 17.998 9.33591 17.998 11.0039V12.0039H18.6135C19.5712 12.0347 20.3747 12.3863 21.024 13.0587C21.6734 13.7312 21.998 14.5462 21.998 15.5039C21.998 16.4847 21.6599 17.3132 20.9835 17.9894C20.3074 18.6657 19.4789 19.0039 18.498 19.0039H12.498V11.5847L14.598 13.6732L15.3058 12.9847L11.998 9.67691L8.6903 12.9847L9.39805 13.6732L11.498 11.5847V19.0039Z"
                                    fill="#F74F09"
                                  />
                                </g>
                              </svg>

                              <h1>Upload Image / Video</h1>
                            </div>
                          </span>
                        </label>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          <div className="flex w-full justify-end">
            <div className="md:w-[40vw] flex flex-wrap gap-4 justify-end">
              {uploadedFiles.map((fileUrl, index) => (
                <div
                  key={index}
                  className="md:w-[152px] w-[116px] md:h-[164px] h-[125px] object-cover"
                >
                  <img
                    src={fileUrl}
                    alt={`Uploaded ${index}`}
                    className="w-full h-full"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="">
            {greet && (
              <div className="md:px-[20px] md:py-[14px] px-4 py-2 mt-[20px] bg-[#EBEBEB] text-[#1A1A1A] font-medium rounded-lg md:text-[16px] text-[12px] md:max-w-[441px] max-w-[301px] leading-[20px]">
                Thank You for your memories! See you again soon!
              </div>
            )}
          </div>
          <div ref={messageEndRef} />
        </div>
        {step < questions.length && (
          <div className="md:gap-[17px] gap-[8px] mb-[10px] justify-end flex items-end relative ">
            <>
              <textarea
                value={currentMessage}
                ref={textareaRef}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder={"Leave us a message here..."}
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
            {greet ? (
              <Link
                to={`/userform/order-tracking/${orderId}`}
                className="flex gap-0"
              >
                <button
                  onClick={handleSend}
                  className="bg-primary text-secondary md:pl-4 rounded-full focus:outline-none md:h-[63px] h-[40px] md:w-[182px] w-[53px]"
                >
                  <div className="flex gap-[10px] justify-center items-center">
                    <h2 className="hidden md:block">Save</h2>
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
              </Link>
            ) : (
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
            )}
          </div>
        )}

        <div className="flex items-center  gap-1 md:gap-2 justify-center self-center bg-[#F5F5F5] w-full ">
          <Logo />
          <span className="text-[10px] md:text-[14px] font-['Gilroy'] text-[#B9B9B9]">
            End-to-end encrypted
          </span>
        </div>
      </div>
    </div>
  );
};

export default ReviewChat;
