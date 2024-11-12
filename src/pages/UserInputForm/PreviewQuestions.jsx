import React, { useEffect, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import axiosInstance from "../../services/axios";
import { BarLoader } from "react-spinners";

const PreviewQuestions = () => {
  const [setFetching] = useOutletContext();
  const { orderId } = useParams();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [sets, setSets] = useState([]);
  const [selectedTab, setSelectedTab] = useState("questions");
  useEffect(() => {
    axiosInstance
      .get(`/order/viewForm/${orderId}`)
      .then((res) => {
        let quesArr = [];
        let setArr = [];
        for (let i = 0; i < res.data?.setDetails?.length; i++) {
          let temp =
            res.data?.setDetails[i]?.setName +
            " , " +
            res.data?.setDetails[i]?.description;

          setArr.push(temp);
        }
        for (let i = 0; i < res.data?.questions?.length; i++) {
          quesArr.push(res.data?.questions[i]?.question);
        }
        setQuestions(quesArr);
        setSets(setArr);
        setFetching(false);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex  items-center justify-center w-full min-w-[100vh] h-screen min-h-screen bg-[#EAEAEA]">
        <BarLoader height={2} color="#1E1E1E" speedMultiplier={0.75} />
      </div>
    );
  }
  return (
    <div className="flex mt-20 md:mt-16 items-center flex-col bg-[#EAEAEA] w-full h-screen min-h-screen">
      <div className="flex text-[12px] md:text-[18px] mt-4 gap-9 mb-4">
        <div
          onClick={() => setSelectedTab("questions")}
          className={`cursor-pointer font-medium font-['Gilroy'] pb-1 px-5 ${
            selectedTab === "questions" ? "border-b-[2px] border-[#F74F09]" : ""
          }`}
        >
          Questions
        </div>
        <div
          onClick={() => setSelectedTab("images")}
          className={`cursor-pointer font-medium font-['Gilroy'] pb-1 px-5 ${
            selectedTab === "images" ? "border-b-[2px] border-[#F74F09]" : ""
          } `}
        >
          Images
        </div>
      </div>
      <div className="flex flex-col justify-start self-start items-start mt-4">
        {selectedTab === "questions"
          ? questions.map((question, index) => (
              <div
                key={index}
                className="text-[12px] mb-4 font-['Gilroy'] md:text-[16px] px-7 text-justify bg-white p-4 rounded-xl mx-10 md:ml-20 ml-10"
              >
                {question}
              </div>
            ))
          : sets.map((set, index) => (
              <div className="text-[12px] mb-4 font-['Gilroy'] md:text-[16px] px-7 text-justify bg-white p-4 rounded-xl mx-10 ml-20">
                {set}
              </div>
            ))}
      </div>
    </div>
  );
};

export default PreviewQuestions;

const EyeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    className="w-[18px] h-[18px] md:w-[25px] md:h-[25px]"
    viewBox="0 0 18 18"
    fill="none"
  >
    <mask
      id="mask0_876_3416"
      style={{ maskType: "alpha" }}
      maskUnits="userSpaceOnUse"
      x="0"
      y="0"
      width="18"
      height="18"
    >
      <rect width="18" height="18" fill="#D9D9D9" />
    </mask>
    <g mask="url(#mask0_876_3416)">
      <path
        d="M9.00336 11.3653C9.76549 11.3653 10.4122 11.0986 10.9434 10.5651C11.4747 10.0316 11.7403 9.38375 11.7403 8.62162C11.7403 7.8595 11.4736 7.21281 10.9401 6.68156C10.4066 6.15031 9.75874 5.88469 8.99661 5.88469C8.23449 5.88469 7.5878 6.15144 7.05655 6.68494C6.5253 7.21844 6.25968 7.86625 6.25968 8.62838C6.25968 9.3905 6.52643 10.0372 7.05993 10.5684C7.59343 11.0997 8.24124 11.3653 9.00336 11.3653ZM8.99999 10.65C8.43749 10.65 7.95936 10.4531 7.56561 10.0594C7.17186 9.66563 6.97499 9.1875 6.97499 8.625C6.97499 8.0625 7.17186 7.58438 7.56561 7.19063C7.95936 6.79688 8.43749 6.6 8.99999 6.6C9.56249 6.6 10.0406 6.79688 10.4344 7.19063C10.8281 7.58438 11.025 8.0625 11.025 8.625C11.025 9.1875 10.8281 9.66563 10.4344 10.0594C10.0406 10.4531 9.56249 10.65 8.99999 10.65ZM9.00205 13.5C7.37755 13.5 5.89705 13.0579 4.56055 12.1738C3.22405 11.2897 2.22311 10.1068 1.55774 8.625C2.22311 7.14325 3.22336 5.96031 4.55849 5.07619C5.89361 4.19206 7.37343 3.75 8.99793 3.75C10.6224 3.75 12.1029 4.19206 13.4394 5.07619C14.7759 5.96031 15.7769 7.14325 16.4422 8.625C15.7769 10.1068 14.7766 11.2897 13.4415 12.1738C12.1064 13.0579 10.6266 13.5 9.00205 13.5Z"
        fill="#1C1B1F"
      />
    </g>
  </svg>
);
