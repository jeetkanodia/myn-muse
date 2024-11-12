import React, { useState, useEffect, useRef } from "react";
import AudioRecorder from "./AudioRecorder.jsx";
import CustomAudioPlayer from "./CustomAudioPlayer.jsx";
import { Helmet } from "react-helmet";

import { Link, Router, useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../services/axios";
import { Button, message, Modal, Popconfirm } from "antd";
import { CloseOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import CustomAudioPlayer2 from "./CustomAudioPlayer2.jsx";
import Loader from "./Loader.jsx";
import { BarLoader } from "react-spinners";
import { Logo } from "./UserImage";

const ChatBot = ({ OrderDetails }) => {
  const [messageApi, contextHolder] = message.useMessage();
  console.log(OrderDetails);

  const [messages, setMessages] = useState([]);
  const [recording, setRecording] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [setNames, setSetNames] = useState([]);
  const [setDetails, setSetDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentMessage, setCurrentMessage] = useState("");
  const [step, setStep] = useState(0);
  const [userResponses, setUserResponses] = useState({});
  const { orderId } = useParams();
  const [previewRecording, setPreviewRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [skipPop, setSkipPop] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [rows, setRows] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [redirectTimer, setRedirectTimer] = useState(null);
  const [condition, setCondition] = useState(false);
  const [timer, setTimer] = useState(5);
  const textareaRef = useRef(null);
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to allow shrinking

      // // 48 on mobile, 64 on desktop

      // if (currentMessage.length < 1) {
      //   if (window.innerWidth <= 768) {
      //     textareaRef.current.style.height = "48px";
      //   } else {
      //     textareaRef.current.style.height = "64px";
      //   }
      // }

      const lineHeight = parseInt(
        getComputedStyle(textareaRef.current).lineHeight,
        10
      );
      const maxHeight = lineHeight * 4; // Max height for 4 rows

      // Adjust height based on scrollHeight but don't exceed maxHeight
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        maxHeight
      )}px`;
    }
  }, [
    // currentMessage,
    textareaRef.current?.scrollHeight,
    textareaRef.current?.clientHeight,
    textareaRef.current?.clientWidth,
    textareaRef.current?.scrollWidth,
  ]);
  useEffect(() => {
    if (condition) {
      setIsModalOpen(true);

      const timer = setTimeout(() => {
        navigate(`/userform/upload-images/${orderId}`);
      }, 3500);
      setRedirectTimer(timer);
    }
  }, [condition]);

  const handleCancel = () => {
    clearTimeout(redirectTimer);
    setIsModalOpen(false);
  };

  console.log(orderId);
  const buttonRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyPress = async (event) => {
      if (event.key === "Enter") {
        console.log("Enter key pressed");
        buttonRef.current.click();
      }
    };

    // Add event listener
    document.addEventListener("keydown", handleKeyPress);

    // Remove event listener on cleanup
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  // useEffect(() => {
  //   // Function to handle clicks outside the div
  //   const handleClickOutside = (event) => {
  //     if (
  //       textareaRef.current &&
  //       !textareaRef.current.contains(event.target) &&
  //       buttonRef.current &&
  //       !buttonRef.current.contains(event.target) &&
  //       editIndex
  //     ) {
  //       console.log("Clicked outside textarea");
  //       setEditIndex(null);
  //       setCurrentMessage("");
  //     }
  //   };

  //   // Add event listener
  //   document.addEventListener("click", handleClickOutside);

  //   // Cleanup event listener on component unmount
  //   return () => {
  //     document.removeEventListener("click", handleClickOutside);
  //   };
  // }, [editIndex]);

  useEffect(() => {
    axiosInstance
      .get(`/order/viewForm/${orderId}`)
      .then((res) => {
        console.log(res.data);
        // take questions belonging to set name 'xyz' and set it to questions
        let questionArray = [];
        let setNameArray = [];
        let messageArray = [];
        let count = 0;
        for (let i = 0; i < res.data.questions.length; i++) {
          if (
            res.data.questions[i].answer.ans !== "" &&
            res.data.questions[i].isAudio
          ) {
            messageArray.push({
              text: res.data.questions[i].question,
              user: false,
            });
            messageArray.push({
              text: res.data.questions[i].answer.mediaLink,
              user: true,
              isAudio: true,
            });
            count++;
          } else if (res.data.questions[i].answer.ans !== "") {
            messageArray.push({
              text: res.data.questions[i].question,
              user: false,
            });
            messageArray.push({
              text: res.data.questions[i].answer.ans,
              user: true,
            });
            count++;
          }
          questionArray.push(res.data.questions[i].question);
          setNameArray.push(res.data.questions[i].setName);
        }

        console.log(questionArray);
        console.log(setNameArray);
        setQuestions(questionArray);
        setSetNames(setNameArray);

        // Add the first question when the component mounts
        if (count === 0) {
          setMessages([{ text: questionArray[0], user: false }]);
        } else {
          setMessages(messageArray);
          setStep(count);
        }
        let obj = {};
        for (let i = 0; i < res.data.setDetails.length; i++) {
          // console.log(res.data.setDetails[i]);
          // obj.push(res.data.setDetails[i].setName, res.data.setDetails[i]);
          obj[res.data.setDetails[i].setName] = res.data.setDetails[i];
        }
        console.log(obj);
        setSetDetails(obj);
        // let temp = [];
        // for (let i = 0; i < questionArray.length; i++) {
        //   temp.push({ text: questionArray[i], user: false });
        // }
        // setMessages(temp);
        setLoading(false);
      })
      .then((err) => {
        console.log(err);
      });
  }, []);

  const messageEndRef = useRef(null);
  const calculateRows = () => {
    if (!textareaRef.current) return 1;

    const textareaWidth = textareaRef.current.clientWidth;
    const averageCharWidth = 10; // Approximate average character width in pixels
    const charsPerLine = Math.floor(textareaWidth / averageCharWidth);
    const numRows = Math.ceil(currentMessage.length / charsPerLine);
    // console.log(numRows);
    return Math.max(numRows + 1, 2); // Ensure at least 2 row
  };

  useEffect(() => {
    console.log(rows);
    setRows(calculateRows());
  }, [currentMessage, textareaRef.current?.clientWidth]);

  useEffect(() => {
    // Automatically add the next question when the step changes, except for the initial mount
    if (step > 0 && step < questions.length) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: questions[step], user: false },
      ]);
    }
  }, [step]);

  const handleEditMessage = (index, e) => {
    setEditIndex(index);
    if (messages[index].text === "Question Skipped") {
      setCurrentMessage("");
    } else {
      setCurrentMessage(messages[index].text);
    }
    // stop propogation
    e.stopPropagation();
  };

  const handleSend = async () => {
    if (previewRecording) {
      setPreviewRecording(false);
      await handleSendVoice(audioUrl);
      if (step + 1 === questions.length) {
        setCondition(true);
      }
      setStep((prevStep) => prevStep + 1);
      return;
    }
    if (currentMessage.length === 0) {
      return;
    } else {
      if (editIndex !== null) {
        console.log("Editing message at index", editIndex);
        const res = await axiosInstance.post("/vendor/order/upadateAnswer", {
          index: editIndex / 2,
          answer: currentMessage,
          _id: orderId,
        });
        console.log(res);
        // messageApi
        //   .config({
        //     contentBg: "#000000",
        //   })
        //   .open({
        //     type: "success",
        //     content: "Answer Edited Successfully",
        //     className: "rounded-[10px]",
        //   });
        const updatedMessages = messages.map((msg, index) =>
          index === editIndex ? { ...msg, text: currentMessage } : msg
        );
        setMessages(updatedMessages);
        setEditIndex(null);
        // if (step + 1 === questions.length) {
        //   navigate(`/userform/upload-images/${orderId}`);
        // } else {
        //   setStep(step + 1);
        // }
      } else {
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: currentMessage, user: true },
        ]);
        console.log(userResponses);
        setUserResponses((prevResponses) => ({
          ...prevResponses,
          [step]: currentMessage,
        }));

        await handleSendToServer();

        if (step + 1 === questions.length) {
          setCondition(true);
        }
        setStep((prevStep) => prevStep + 1);
      }
      setCurrentMessage("");
    }
  };

  const handleSendToServer = async () => {
    if (previewRecording) {
      setPreviewRecording(false);
      handleSendVoice(audioUrl);
      return;
    }

    let msg = currentMessage;
    if (currentMessage === "") {
      msg = "Question Skipped";
    }
    axiosInstance
      .post("/vendor/order/upadateAnswer", {
        index: step,
        answer: msg,
        _id: orderId,
      })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
        message.error("Error submitting answer");
      });
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
      formData.append("_id", orderId);
      // Send the FormData to the backend
      const uploadResponse = await axiosInstance.post(
        "/vendor/order/upadateAnswer",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (uploadResponse.ok) {
        const result = await uploadResponse.json();
        console.log("File uploaded successfully:", result);
      } else {
        console.error("File upload failed:", uploadResponse.statusText);
      }
      setAudioUrl(null);
    } catch (error) {
      console.error("Error while uploading file:", error);
    }
  };

  const handleStopRecording = async (url) => {
    console.log(url);
    setAudioUrl(url);
    setPreviewRecording(true);
    // handleSendVoice(url);
  };

  const handleRemovePreview = () => {
    setAudioUrl(null);
    setPreviewRecording(false);
  };

  const handleSkipPop = () => {
    setSkipPop(true);
  };

  const cancelSkip = () => {
    setSkipPop(false);
  };

  const handleSkip = () => {
    setSkipPop(false);

    setCurrentMessage("Question Skipped");
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: "Question Skipped", user: true },
    ]);
    setUserResponses((prevResponses) => ({
      ...prevResponses,
      [step]: "Question Skipped",
    }));

    handleSendToServer();

    setCurrentMessage("");
    setStep((prevStep) => prevStep + 1);
  };

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const [showPopUpAbove, setShowPopUpAbove] = useState(false);
  const popUpRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (step > 1) {
      setShowPopUpAbove(true);
    } else {
      setShowPopUpAbove(false);
    }
  }, [step]);

  if (loading) {
    return (
      <div className="flex  items-center justify-center w-full min-w-[100vh] h-screen min-h-screen bg-[#EAEAEA]">
        <BarLoader height={2} color="#1E1E1E" speedMultiplier={0.75} />
      </div>
    );
  }

  if (isModalOpen) {
    return (
      <div className="bg-[#EAEAEA] flex-col h-full w-full flex items-center justify-center p-4">
        <h1 className="text-[#8D8D8D] text-center font-['Gilroy'] text-[12px] md:text-[18px] mt-64 gap-2 flex flex-col items-center justify-center p-16">
          <Loader />
          Whoa! That was a nostalgic conversation. Lets move to images now :D
        </h1>
        <div className="flex mt-auto mb-4 gap-5">
          <button
            className="border border-primary rounded-full p-2 px-16"
            onClick={handleCancel}
          >
            Back
          </button>
          <button
            className="bg-primary rounded-full p-2 px-16"
            onClick={() => {
              clearTimeout(redirectTimer);
              navigate(`/userform/upload-images/${orderId}`);
            }}
          >
            <SendIcon />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#F5F5F5] font-['Gilroy'] flex flex-col items-center md:px-[50px] px-[20px] md:py-[40px]  pb-0 md:pb-0 md:gap-[50px] gap-[20px]">
      <div className="flex flex-col w-full h-full overflow-auto scrollbar-hidden mt-[85px] md:mt-4">
        {contextHolder}
        <div className="flex-grow mb-4 overflow-y-auto md:text-[20px] text-[14px] scrollbar-hidden">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`md:mb-[30px] mb-[20px] font-['Gilroy'] ${
                message.user ? "text-right self-end" : "text-left"
              } ${editIndex && editIndex < index ? "opacity-25" : ""}`}
            >
              {message.isAudio ? (
                <div className="flex justify-end h-[72px] w-full">
                  <CustomAudioPlayer url={message.text} />
                </div>
              ) : (
                <>
                  <span
                    className={`inline-block px-4 py-2 gilory rounded-lg md:text-[16px] text-[14px] ${
                      message.text === "Question Skipped"
                        ? "text-[#8D8D8D] opacity-100 font-medium gilory"
                        : " gilory"
                    } ${
                      message.user
                        ? " text-[#8D8D8D] opacity-100  bg-[#FFFFFF] gilory"
                        : " text-[#1A1A1A] bg-[#EBEBEB] gilory"
                    }  ${
                      editIndex === index
                        ? "border-primary border-[1px] border-dashed"
                        : ""
                    }`}
                  >
                    <div
                      className={
                        message.text === "Question Skipped"
                          ? "flex gap-[10px] text-[#1A1A1A] gilory"
                          : message.user
                          ? "flex gap-[10px] items-end md:max-w-[50vw] max-w-[70vw] text-left gilory "
                          : "flex gap-[10px] items-start flex-col md:max-w-[50vw] max-w-[70vw] text-left gilory"
                      }
                    >
                      {editIndex == index
                        ? message.text === "Question Skipped"
                          ? "This question has been skipped!"
                          : currentMessage
                        : message.text.replace(/\$\{.*?\}/g, "")}{" "}
                      {!message.user &&
                        index === messages.length - 1 &&
                        currentMessage.length == 0 &&
                        !previewRecording &&
                        !recording && (
                          <div className="relative">
                            <button
                              ref={triggerRef}
                              onClick={handleSkipPop}
                              className="text-[#bfbfbf] font-medium underline text-[12px] gilroy"
                            >
                              Skip Question
                            </button>

                            {skipPop && (
                              <span
                                className={
                                  "flex flex-col gap-[10px] items-center absolute  z-50 w-[170px] sm:w-[250px] py-[10px] px-[17px] bg-[#A4A4A4] opacity-100 rounded-[10px] text-center text-white" +
                                  (showPopUpAbove
                                    ? " bottom-1 left-[115%]"
                                    : "top-1 left-[115%]")
                                }
                              >
                                <span className="text-white gilroy">
                                  Are you sure you want to skip this question?
                                </span>
                                <div className="flex gap-[10px] ">
                                  <button
                                    className="py-[2px] px-[18px] rounded-full text-primary bg-white"
                                    onClick={handleSkip}
                                  >
                                    <span className="text-[#A4A4A4]">Skip</span>
                                  </button>
                                  <button
                                    white
                                    className="text-white border bg-[#A4A4A4] border-white rounded-full py-[2px] px-[18px]"
                                    onClick={cancelSkip}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </span>
                            )}
                          </div>
                        )}
                      {editIndex !== index && (
                        <span
                          onClick={(e) => {
                            if (editIndex >= index || !editIndex) {
                              // to add: give this divs ref to the function called

                              handleEditMessage(index, e);
                            }
                          }}
                          className={
                            message.text === "Question Skipped"
                              ? "text-[#F74F09] cursor-pointer gilroy font-medium opacity-100"
                              : "hidden"
                          }
                        >
                          Click here to Answer :)
                        </span>
                      )}
                      {message.user &&
                      message.text !== "Question Skipped" &&
                      OrderDetails?.status < 3 ? (
                        <div className="rounded-full cursor-pointer">
                          {editIndex === index ? (
                            <CloseOutlined
                              className="text-[#A4A4A4]"
                              onClick={() => {
                                setEditIndex(null);

                                setCurrentMessage("");
                              }}
                            />
                          ) : (
                            <>
                              <EditOutlined
                                className="text-[#A4A4A4]"
                                onClick={(e) => {
                                  if (editIndex >= index || !editIndex) {
                                    handleEditMessage(index, e);
                                  }
                                }}
                              />
                            </>
                          )}
                        </div>
                      ) : (
                        <></>
                      )}
                    </div>
                  </span>
                </>
              )}
            </div>
          ))}
          <div ref={messageEndRef} />
        </div>
        {step < questions.length || editIndex ? (
          <div className="md:gap-[17px] gap-[8px] mb-[10px] justify-end flex items-end relative">
            {previewRecording ? (
              <div className="flex w-full bg-[#bebebe] rounded-full items-center justify-between pr-[18px] mb-2 md:mb-0">
                <CustomAudioPlayer2 url={audioUrl} style={{ width: 1000 }} />
                <button onClick={handleRemovePreview} className="">
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
                <Helmet>
                  <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
                  />
                </Helmet>
                <textarea
                  value={currentMessage}
                  ref={textareaRef}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  placeholder={
                    recording ? "" : "Let's talk about your memories"
                  }
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
                {/* // 1.15 // 0.5 text area paddings */}
                {currentMessage.length <= 0 && (
                  <div className="absolute bottom-3 sm:bottom-4 lg:right-[200px] md:right-[175px] right-[70px]">
                    <AudioRecorder
                      onStop={handleStopRecording}
                      setRecording={setRecording}
                    />
                  </div>
                )}
              </>
            )}
            <button
              onClick={handleSend}
              ref={buttonRef}
              className={
                "!bg-primary text-white mb-2 md:mb-0 md:pl-2 rounded-full focus:outline-none md:h-[63px] h-[40px] md:w-[182px] w-[53px] " +
                (currentMessage.length === 0 && !previewRecording
                  ? " opacity-60"
                  : "")
              }
            >
              <div className="flex gap-[10px] justify-center items-center">
                <h2 className="hidden md:block mb-1">
                  {editIndex ? "Edit" : "Send"}
                </h2>
                <svg
                  className="w-[25px] md:w-[40px] self-center"
                  xmlns="http://www.w3.org/2000/svg"
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
        ) : (
          <div className="md:gap-[17px] gap-[8px] mb-[10px] flex justify-end  w-full">
            <Link to={`/userform/upload-images/${orderId}`}>
              <button className="bg-primary text-white md:pl-4 rounded-full focus:outline-none md:h-[63px] h-[40px] md:w-[182px] w-[45px] ">
                <div className="flex gap-[10px] justify-center items-center">
                  <h2 className="hidden md:block">Images</h2>
                  <svg
                    className="w-[32px] md:w-[36px] h-[32px] md:h-[32px]"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 40 41"
                    fill="none"
                  >
                    <mask
                      id="mask0_181_579"
                      maskUnits="userSpaceOnUse"
                      x="0"
                      y="0"
                    >
                      <rect y="0.5" width="40" height="40" fill="#D9D9D9" />
                    </mask>
                    <g mask="url(#mask0_181_579)">
                      <path
                        d="M6.66663 31.3332V22.7436L16.4104 20.4998L6.66663 18.2561V9.6665L32.3716 20.4998L6.66663 31.3332Z"
                        fill="none"
                        style={{ fill: "var(--secondary-color)" }}
                      />
                    </g>
                  </svg>
                </div>
              </button>
            </Link>
          </div>
        )}
        <div className="flex items-center  gap-1 md:gap-2 justify-center self-center bg-[#F5F5F5] w-full pb-4">
          <Logo />
          <span className="text-[10px] md:text-[14px] font-['Gilroy'] text-[#B9B9B9]">
            End-to-end encrypted
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;

const SendIcon = (props) => (
  <svg
    width="30"
    height="30"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g id="send">
      <mask
        id="mask0_750_8"
        style={{ maskType: "alpha" }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="24"
        height="24"
      >
        <rect
          id="Bounding box"
          x="0.359985"
          y="0.47998"
          width="23.04"
          height="23.04"
          fill="#D9D9D9"
        />
      </mask>
      <g mask="url(#mask0_750_8)">
        <path
          id="send_2"
          d="M4.20007 18.2398V13.2922L9.81247 11.9998L4.20007 10.7074V5.75977L19.0062 11.9998L4.20007 18.2398Z"
          fill="#F5F1E9"
        />
      </g>
    </g>
  </svg>
);
