import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../services/axios";
import { BarLoader } from "react-spinners";

const OrderTrackingWeb = () => {
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [thumbnail, setThumbnail] = useState(null);
  const { orderId } = useParams();
  const [currentStatus, setCurrentStatus] = useState([]);
  const [infoNeeded, setInfoNeeded] = useState(false);

  const navigate = useNavigate();

  const handleInfoNeeded = () => {
    if (infoNeeded) {
      for (let i = 0; i < orderData?.imageQuestions.length; i++) {
        if (orderData?.imageQuestions[i]?.status == "un_answered") {
          navigate("/userform/context-image/" + orderId);
          return;
        }
      }

      for (let i = 0; i < orderData?.imageTags.length; i++) {
        if (orderData?.imageTags[i]?.image?.mediaLink == "") {
          navigate("/userform/tag-images/" + orderId);
          return;
        }
      }
      for (let i = 0; i < orderData?.reAnswerIndex.length; i++) {
        if (orderData?.reAnswerIndex[i]?.status == "un_answered") {
          navigate("/userform/re-ask/" + orderId);
          return;
        }
      }
    }
  };

  useEffect(() => {
    axiosInstance.get("/vendor/getOrder/" + orderId).then((res) => {
      console.log(res.data);
      // 3 is not done, 2 is current , 1 is done
      if (res.data?.serviceType == "ete") {
        let arr = [
          { status: "Myn Conversation", date: "", icon: <Lock />, current: 3 },
          {
            status: "In Progress",
            date: "",
            icon: <HourglassIcon />,
            current: 3,
          },
          {
            status: "Approval Pending",
            date: "",
            icon: <ApprovalIcon />,
            current: 3,
          },
          {
            status: "Under Printing",
            date: "",
            icon: <UnderPrintingIcon />,
            current: 3,
          },
          { status: "Shipped", date: "", icon: <ShippedIcon />, current: 3 },
          {
            status: "Delivered",
            date: "",
            icon: <DeliveredIcon />,
            current: 3,
          },
        ];
        if (res.data?.status <= 2) {
          arr[0].current = 2;
        } else if (res.data?.status == 3) {
          arr[0].current = 1;
          arr[1].current = 2;
        } else if (res.data?.status == 4) {
          arr[0].current = 1;
          arr[1].current = 1;
          arr[2].current = 2;
        } else if (res.data?.status < 9) {
          arr[0].current = 1;
          arr[1].current = 1;
          arr[2].current = 1;
          arr[3].current = 2;
        } else if (res.data?.status == 9) {
          arr[0].current = 1;
          arr[1].current = 1;
          arr[2].current = 1;
          arr[3].current = 1;
          arr[4].current = 2;
        } else {
          arr[0].current = 1;
          arr[1].current = 1;
          arr[2].current = 1;
          arr[3].current = 1;
          arr[4].current = 1;
          arr[5].current = 2;
        }
        console.log(arr);
        setCurrentStatus(arr);
      } else {
        let arr = [
          { status: "Myn Conversation", date: "", icon: <Lock />, current: 3 },
          {
            status: "In Progress",
            date: "",
            icon: <HourglassIcon />,
            current: 3,
          },
          {
            status: "Approval Pending",
            date: "",
            icon: <ApprovalIcon />,
            current: 3,
          },
          { status: "Approved", date: "", icon: <ShippedIcon />, current: 3 },
        ];

        if (res.data?.status <= 2) {
          arr[0].current = 2;
        } else if (res.data?.status == 3) {
          arr[0].current = 1;
          arr[1].current = 2;
        } else if (res.data?.status == 4) {
          arr[0].current = 1;
          arr[1].current = 1;
          arr[2].current = 2;
        } else {
          arr[0].current = 1;
          arr[1].current = 1;
          arr[2].current = 1;
          arr[3].current = 2;
        }
        console.log(arr);

        setCurrentStatus(arr);
      }

      // set thumbnail
      let index = 0;
      for (let i = 0; i < res.data?.product?.images?.length; i++) {
        if (res.data?.product?.images[i].thumbnail == true) {
          index = i;
          break;
        }
      }
      setThumbnail(res.data?.product?.images[index].mediaLink);

      // set info needed
      if (res.data?.status == 3) {
        let temp = false;
        for (let i = 0; i < res.data?.imageQuestions?.length; i++) {
          if (res.data?.imageQuestions[i]?.status == "un_answered") {
            temp = true;
            break;
          }
        }
        for (let i = 0; i < res.data?.imageTags?.length; i++) {
          if (res.data?.imageTags[i]?.image?.mediaLink == "") {
            temp = true;
            break;
          }
        }
        for (let i = 0; i < res.data?.reAnswerIndex?.length; i++) {
          if (res.data?.reAnswerIndex[i]?.status == "un_answered") {
            temp = true;
            break;
          }
        }

        setInfoNeeded(temp);
        console.log(temp);
      } else {
        setInfoNeeded(false);
      }

      setOrderData(res.data);
      setLoading(false);
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
    <div className="w-full h-screen min-h-screen flex flex-col justify-center items-center bg-[#EAEAEA]  overflow-hidden">
      <div className="flex flex-col md:max-h-screen scrollbar-hidden">
        <div className="flex flex-col md:flex-row gap-7 items-center justify-center font-['Gilroy']">
          <div className="h-[200px] w-[200px] md:h-[350px] md:w-[350px] md:ml-8 mr-0 md:mr-20 rounded-xl">
            <img
              src={thumbnail ? thumbnail : "https://via.placeholder.com/200"}
              alt="Product Thubnail"
              className="h-full w-full object-cover rounded-xl"
            />
          </div>

          <div className="flex md:flex-row flex-col gap-[40px] md:mr-8  md:gap-[4.8vw] md:w-auto w-full justify-center md:items-start items-center">
            <div className="flex flex-col items-center">
              {currentStatus.map((elem, idx) => {
                return (
                  <Link
                    onClick={handleInfoNeeded}
                    key={idx}
                    to={
                      elem.current == 2
                        ? elem.status === "Myn Conversation"
                          ? "/userform/question/" + orderId
                          : elem.status === "In Progress"
                          ? ""
                          : elem.status === "Approval Pending"
                          ? "/userform/review-request/" + orderId
                          : ""
                        : ""
                    }
                  >
                    <div
                      key={idx}
                      className={`md:px-[2vw] px-[30px] md:py-[1.3vw] py-[12px] flex gap-[5.6vw] justify-between items-center ${
                        elem.current == 2
                          ? "bg-primary md:w-[31.3vw] w-[320px] rounded-lg cursor-pointer"
                          : elem.current == 1
                          ? " bg-[#434343] md:w-[29.4vw] w-[280px] cursor-default"
                          : "bg-[#D1D1D1] md:w-[29.4vw] w-[280px] cursor-default"
                      } ${idx === 0 && "rounded-t-lg"} ${
                        idx === currentStatus.length - 1 && "rounded-b-lg"
                      }`}
                    >
                      <div className="flex gap-[20px] items-center">
                        <div
                          className={`h-[40px] w-[40px] rounded-full bg-[#E7E7E680] ${
                            elem.current != 3 ? "" : "opacity-40"
                          }`}
                        >
                          {elem?.status == "Delivered" && elem.current == 2 ? (
                            <DeliveredIconOrange />
                          ) : (
                            elem.icon
                          )}
                        </div>
                        <div className="flex gap-[6px] md:text-[1.1vw] text-[12px] font-medium justify-between">
                          <div className="w-full">
                            <h1
                              className={`text-[12px] opacity-100 font-['Gilroy'] ${
                                elem.current != 3
                                  ? "text-[#F5F1E9]"
                                  : " text-[#7D7D7D] opacity-40"
                              }`}
                            >
                              {elem.status === "In Progress"
                                ? elem.current == 2
                                  ? infoNeeded
                                    ? "Info Needed"
                                    : elem.status
                                  : elem.status
                                : elem.status}
                            </h1>
                            <span className="text-textColor opacity-50 font-normal">
                              {elem.date}
                            </span>
                          </div>
                        </div>
                      </div>
                      {elem.current != 3 ? (
                        <span>
                          {elem?.status == "In Progress" ? (
                            elem.current == 2 ? (
                              infoNeeded ? (
                                <LinkSvg />
                              ) : (
                                <ClockSvg />
                              )
                            ) : (
                              <TickSvg />
                            )
                          ) : elem?.status == "Approval Pending" ? (
                            elem.current == 2 ? (
                              <LinkSvg />
                            ) : (
                              <TickSvg />
                            )
                          ) : elem?.status == "Under Printing" ? (
                            elem.current == 2 ? (
                              <ClockSvg />
                            ) : (
                              <TickSvg />
                            )
                          ) : (
                            <TickSvg />
                          )}
                        </span>
                      ) : (
                        <span>
                          <ToDoSvg />
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingWeb;

const Lock = (props) => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle
      cx="20"
      cy="20"
      r="18.5"
      transform="matrix(-1 0 0 1 40 0)"
      fill="#EFEFEF"
      stroke="#EFEFEF"
      strokeWidth="3"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M20 12.125C18.9557 12.125 17.9542 12.5398 17.2158 13.2783C16.4773 14.0167 16.0625 15.0182 16.0625 16.0625V18.3125C15.4658 18.3125 14.8935 18.5496 14.4715 18.9715C14.0496 19.3935 13.8125 19.9658 13.8125 20.5625V25.625C13.8125 26.2217 14.0496 26.794 14.4715 27.216C14.8935 27.6379 15.4658 27.875 16.0625 27.875H23.9375C24.5342 27.875 25.1065 27.6379 25.5285 27.216C25.9504 26.794 26.1875 26.2217 26.1875 25.625V20.5625C26.1875 19.9658 25.9504 19.3935 25.5285 18.9715C25.1065 18.5496 24.5342 18.3125 23.9375 18.3125V16.0625C23.9375 13.8875 22.175 12.125 20 12.125ZM22.8125 18.3125V16.0625C22.8125 15.3166 22.5162 14.6012 21.9887 14.0738C21.4613 13.5463 20.7459 13.25 20 13.25C19.2541 13.25 18.5387 13.5463 18.0113 14.0738C17.4838 14.6012 17.1875 15.3166 17.1875 16.0625V18.3125H22.8125Z"
      fill="black"
    />
  </svg>
);

const HourglassIcon = (props) => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g id="Group 72">
      <circle
        id="Ellipse 8"
        cx="20"
        cy="20"
        r="18.5"
        transform="matrix(-1 0 0 1 40 0)"
        fill="#EFEFEF"
        stroke="#EFEFEF"
        strokeWidth="3"
      />
      <g id="hourglass_top">
        <mask
          id="mask0_720_2205"
          style={{ maskType: "alpha" }}
          maskUnits="userSpaceOnUse"
          x="11"
          y="11"
          width="18"
          height="18"
        >
          <rect
            id="Bounding box"
            x="11"
            y="11"
            width="18"
            height="18"
            fill="white"
          />
        </mask>
        <g mask="url(#mask0_720_2205)">
          <path
            id="hourglass_top_2"
            d="M16.8558 26H23.1442V23.75C23.1442 22.8673 22.8409 22.113 22.2341 21.487C21.6274 20.8611 20.8827 20.5481 20 20.5481C19.1173 20.5481 18.3726 20.8611 17.7659 21.487C17.1591 22.113 16.8558 22.8673 16.8558 23.75V26ZM14.75 26.75V26H16.1058V23.75C16.1058 22.824 16.3897 22.0026 16.9574 21.2858C17.5252 20.569 18.2529 20.1404 19.1404 20C18.2529 19.85 17.5252 19.419 16.9574 18.707C16.3897 17.995 16.1058 17.176 16.1058 16.25V14H14.75V13.25H25.25V14H23.8942V16.25C23.8942 17.176 23.6104 17.995 23.0426 18.707C22.4748 19.419 21.7471 19.85 20.8596 20C21.7471 20.1404 22.4748 20.569 23.0426 21.2858C23.6104 22.0026 23.8942 22.824 23.8942 23.75V26H25.25V26.75H14.75Z"
            fill="black"
          />
        </g>
      </g>
    </g>
  </svg>
);

const ApprovalIcon = (props) => (
  <svg
    width="41"
    height="40"
    viewBox="0 0 41 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle
      cx="20"
      cy="20"
      r="20"
      transform="matrix(-1 0 0 1 40.5 0)"
      fill="#EFEFEF"
    />
    <mask
      id="mask0_720_2699"
      style={{ maskType: "alpha" }}
      maskUnits="userSpaceOnUse"
      x="12"
      y="11"
      width="18"
      height="18"
    >
      <rect x="12" y="11" width="18" height="18" fill="#D9D9D9" />
    </mask>
    <g mask="url(#mask0_720_2699)">
      <path
        d="M17.0192 25.8528V19.9424H18.3995C18.4774 19.9424 18.5565 19.9505 18.6367 19.9668C18.717 19.9832 18.796 20.0038 18.8739 20.0288L23.7289 21.823C23.9279 21.8952 24.0901 22.0185 24.2156 22.193C24.3411 22.3676 24.4039 22.5568 24.4039 22.7605C24.4039 22.9605 24.336 23.1226 24.2004 23.2467C24.0649 23.3707 23.9049 23.4327 23.7202 23.4327H22.2851C22.1265 23.4327 21.9787 23.4236 21.8417 23.4053C21.7045 23.3871 21.5653 23.351 21.4239 23.2972L20.1519 22.8211L19.9226 23.4659L21.3808 23.9722C21.5115 24.0183 21.6524 24.0505 21.8034 24.0687C21.9543 24.087 22.1038 24.0961 22.2519 24.0961H26.7547C27.1259 24.0961 27.447 24.2242 27.7183 24.4805C27.9894 24.7367 28.125 25.0557 28.125 25.4375L22.5116 27.4278L17.0192 25.8528ZM13.2692 27.125V19.9424H15.8942V27.125H13.2692ZM21.6937 19.2875L18.773 16.3668L19.575 15.5836L21.6937 17.7023L25.95 13.4648L26.7332 14.248L21.6937 19.2875Z"
        fill="#1C1B1F"
      />
    </g>
  </svg>
);

const UnderPrintingIcon = (props) => (
  <svg
    width="41"
    height="40"
    viewBox="0 0 41 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle
      cx="20"
      cy="20"
      r="20"
      transform="matrix(-1 0 0 1 40.5 0)"
      fill="#EFEFEF"
    />
    <mask
      id="mask0_720_2712"
      style={{ maskType: "alpha" }}
      maskUnits="userSpaceOnUse"
      x="11"
      y="11"
      width="19"
      height="18"
    >
      <rect x="11.5" y="11" width="18" height="18" fill="#D9D9D9" />
    </mask>
    <g mask="url(#mask0_720_2712)">
      <path
        d="M16.375 23.75V13.25H26.875V23.75H16.375ZM14.125 26V15.9615H14.875V25.25H24.1635V26H14.125ZM21.625 14V18.5866L23.125 17.6923L24.625 18.5866V14H21.625Z"
        fill="black"
      />
    </g>
  </svg>
);

const ShippedIcon = (props) => (
  <svg
    width="41"
    height="40"
    viewBox="0 0 41 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle
      cx="20"
      cy="20"
      r="20"
      transform="matrix(-1 0 0 1 40.5 0)"
      fill="#EFEFEF"
    />
    <mask
      id="mask0_720_2725"
      style={{ maskType: "alpha" }}
      maskUnits="userSpaceOnUse"
      x="11"
      y="11"
      width="19"
      height="18"
    >
      <rect x="11.5" y="11" width="18" height="18" fill="#D9D9D9" />
    </mask>
    <g mask="url(#mask0_720_2725)">
      <path
        d="M15.7661 25.3365C15.2203 25.3365 14.7575 25.1458 14.3777 24.7644C13.9979 24.383 13.808 23.9199 13.808 23.375H12.7695V14.75H23.9042V17.4615H25.6349L28.2311 20.9519V23.375H27.0196C27.0196 23.9199 26.8285 24.383 26.4465 24.7644C26.0644 25.1458 25.6004 25.3365 25.0546 25.3365C24.5088 25.3365 24.046 25.1458 23.6662 24.7644C23.2864 24.383 23.0964 23.9199 23.0964 23.375H17.7311C17.7311 23.9231 17.54 24.387 17.158 24.7668C16.7759 25.1466 16.312 25.3365 15.7661 25.3365ZM15.7695 24.5865C16.107 24.5865 16.3933 24.469 16.6284 24.2339C16.8635 23.9988 16.9811 23.7125 16.9811 23.375C16.9811 23.0375 16.8635 22.7512 16.6284 22.5161C16.3933 22.281 16.107 22.1635 15.7695 22.1635C15.432 22.1635 15.1457 22.281 14.9106 22.5161C14.6755 22.7512 14.558 23.0375 14.558 23.375C14.558 23.7125 14.6755 23.9988 14.9106 24.2339C15.1457 24.469 15.432 24.5865 15.7695 24.5865ZM25.058 24.5865C25.3955 24.5865 25.6818 24.469 25.9169 24.2339C26.152 23.9988 26.2695 23.7125 26.2695 23.375C26.2695 23.0375 26.152 22.7512 25.9169 22.5161C25.6818 22.281 25.3955 22.1635 25.058 22.1635C24.7205 22.1635 24.4342 22.281 24.1991 22.5161C23.964 22.7512 23.8465 23.0375 23.8465 23.375C23.8465 23.7125 23.964 23.9988 24.1991 24.2339C24.4342 24.469 24.7205 24.5865 25.058 24.5865ZM23.9042 21.125H27.4378L25.2311 18.2115H23.9042V21.125Z"
        fill="black"
      />
    </g>
  </svg>
);

const DeliveredIcon = (props) => (
  <svg
    width="41"
    height="40"
    viewBox="0 0 41 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g id="Group 74">
      <g id="Group 73">
        <circle
          id="Ellipse 8"
          cx="20"
          cy="20"
          r="18.5"
          transform="matrix(-1 0 0 1 40.5 0)"
          fill="#EFEFEF"
          stroke="#EFEFEF"
          strokeWidth="3"
        />
        <g id="package_2">
          <mask
            id="mask0_720_2738"
            style={{ maskType: "alpha" }}
            maskUnits="userSpaceOnUse"
            x="11"
            y="11"
            width="19"
            height="18"
          >
            <rect
              id="Bounding box"
              x="11.5"
              y="11"
              width="18"
              height="18"
              fill="#D9D9D9"
            />
          </mask>
          <g mask="url(#mask0_720_2738)">
            <path
              id="package_2_2"
              d="M19.75 27.2938V20.4312L13.75 16.9625V22.9813C13.75 23.2563 13.8156 23.5063 13.9469 23.7313C14.0781 23.9563 14.2625 24.1375 14.5 24.275L19.75 27.2938ZM21.25 27.2938L26.5 24.275C26.7375 24.1375 26.9219 23.9563 27.0531 23.7313C27.1844 23.5063 27.25 23.2563 27.25 22.9813V16.9625L21.25 20.4312V27.2938ZM24.2313 16.9812L26.4438 15.6875L21.25 12.7063C21.0125 12.5688 20.7625 12.5 20.5 12.5C20.2375 12.5 19.9875 12.5688 19.75 12.7063L18.2688 13.55L24.2313 16.9812ZM20.5 19.1375L22.7313 17.8625L16.7875 14.4125L14.5375 15.7063L20.5 19.1375Z"
              fill="black"
            />
          </g>
        </g>
      </g>
    </g>
  </svg>
);

const DeliveredIconOrange = (props) => (
  <svg
    width="41"
    height="40"
    viewBox="0 0 41 40"
    fill="#F74F09"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g id="Group 74">
      <g id="Group 73">
        <circle
          id="Ellipse 8"
          cx="20"
          cy="20"
          r="18.5"
          transform="matrix(-1 0 0 1 40.5 0)"
          fill="#EFEFEF"
          stroke="#EFEFEF"
          strokeWidth="3"
        />
        <g id="package_2">
          <mask
            id="mask0_720_2738"
            style={{ maskType: "alpha" }}
            maskUnits="userSpaceOnUse"
            x="11"
            y="11"
            width="19"
            height="18"
          >
            <rect
              id="Bounding box"
              x="11.5"
              y="11"
              width="18"
              height="18"
              fill="#D9D9D9"
            />
          </mask>
          <g mask="url(#mask0_720_2738)">
            <path
              id="package_2_2"
              d="M19.75 27.2938V20.4312L13.75 16.9625V22.9813C13.75 23.2563 13.8156 23.5063 13.9469 23.7313C14.0781 23.9563 14.2625 24.1375 14.5 24.275L19.75 27.2938ZM21.25 27.2938L26.5 24.275C26.7375 24.1375 26.9219 23.9563 27.0531 23.7313C27.1844 23.5063 27.25 23.2563 27.25 22.9813V16.9625L21.25 20.4312V27.2938ZM24.2313 16.9812L26.4438 15.6875L21.25 12.7063C21.0125 12.5688 20.7625 12.5 20.5 12.5C20.2375 12.5 19.9875 12.5688 19.75 12.7063L18.2688 13.55L24.2313 16.9812ZM20.5 19.1375L22.7313 17.8625L16.7875 14.4125L14.5375 15.7063L20.5 19.1375Z"
              fill="#F74F09"
            />
          </g>
        </g>
      </g>
    </g>
  </svg>
);

const LinkSvg = (props) => (
  <svg
    width="21"
    height="20"
    viewBox="0 0 21 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="0.5" width="20" height="20" rx="10" fill="#F74F09" />
    <path
      d="M7.73999 13.9L6.89999 13.06L12.66 7.29998H7.49999V6.09998H14.7V13.3H13.5V8.13998L7.73999 13.9Z"
      fill="white"
    />
  </svg>
);

const TickSvg = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className=" h-3 w-3 md:w-4 md:h-4"
    viewBox="0 0 21 21"
    fill="none"
    {...props}
  >
    <path
      d="M9.09909 14.9554L17.0919 7.00392L16.2075 6.12413L9.09909 13.1958L5.53766 9.65279L4.6533 10.5326L9.09909 14.9554ZM0.851562 20.5401V0.649414H20.8456V20.5401H0.851562Z"
      fill="#FCFCFC"
    />
  </svg>
);

const ToDoSvg = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 30 30"
    fill="none"
    className="opacity-40 h-4 w-4 md:w-6 md:h-6"
  >
    <mask
      id="mask0_863_1958"
      maskUnits="userSpaceOnUse"
      x="0"
      y="0"
      width="30"
      height="30"
    >
      <rect width="30" height="30" fill="#D9D9D9" />
    </mask>
    <g mask="url(#mask0_863_1958)">
      <path
        d="M14.9515 25C12.4132 25 10.2005 24.171 8.3134 22.5131C6.42632 20.8554 5.33454 18.7677 5.03809 16.25H6.30246C6.64225 18.4006 7.62184 20.1883 9.24121 21.6131C10.8606 23.0377 12.764 23.75 14.9515 23.75C17.389 23.75 19.4567 22.901 21.1546 21.2031C22.8526 19.5052 23.7015 17.4375 23.7015 15C23.7015 12.5625 22.8526 10.4948 21.1546 8.79688C19.4567 7.09896 17.389 6.25 14.9515 6.25C13.6582 6.25 12.4427 6.52323 11.305 7.06969C10.167 7.61615 9.16298 8.36854 8.29277 9.32688H11.394V10.5769H6.20152V5.38469H7.45152V8.37031C8.41798 7.30927 9.55059 6.48229 10.8493 5.88938C12.1483 5.29646 13.5157 5 14.9515 5C16.3378 5 17.637 5.26083 18.8493 5.7825C20.0616 6.30417 21.1209 7.01813 22.0271 7.92438C22.9334 8.83063 23.6474 9.8899 24.169 11.1022C24.6907 12.3145 24.9515 13.6137 24.9515 15C24.9515 16.3863 24.6907 17.6855 24.169 18.8978C23.6474 20.1101 22.9334 21.1694 22.0271 22.0756C21.1209 22.9819 20.0616 23.6958 18.8493 24.2175C17.637 24.7392 16.3378 25 14.9515 25ZM18.9565 19.8172L14.3987 15.2597V8.75H15.6487V14.7403L19.8409 18.9328L18.9565 19.8172Z"
        fill="black"
      />
    </g>
  </svg>
);

const ClockSvg = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g id="clock_loader_60">
      <mask
        id="mask0_720_1939"
        style={{ maskType: "alpha" }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="18"
        height="18"
      >
        <rect id="Bounding box" width="18" height="18" fill="#D9D9D9" />
      </mask>
      <g mask="url(#mask0_720_1939)">
        <path
          id="clock_loader_60_2"
          d="M9.00244 15.75C8.06906 15.75 7.1915 15.5729 6.36975 15.2186C5.54813 14.8644 4.83337 14.3836 4.2255 13.7764C3.61763 13.1691 3.13644 12.455 2.78194 11.634C2.42731 10.8131 2.25 9.93594 2.25 9.00244C2.25 8.06906 2.42712 7.1915 2.78137 6.36975C3.13562 5.54812 3.61637 4.83337 4.22362 4.2255C4.83087 3.61762 5.545 3.13644 6.366 2.78194C7.18687 2.42731 8.06406 2.25 8.99756 2.25C9.93094 2.25 10.8085 2.42713 11.6303 2.78138C12.4519 3.13563 13.1666 3.61638 13.7745 4.22363C14.3824 4.83088 14.8636 5.545 15.2181 6.366C15.5727 7.18688 15.75 8.06406 15.75 8.99756C15.75 9.93094 15.5729 10.8085 15.2186 11.6302C14.8644 12.4519 14.3836 13.1666 13.7764 13.7745C13.1691 14.3824 12.455 14.8636 11.634 15.2181C10.8131 15.5727 9.93594 15.75 9.00244 15.75ZM4.75575 13.2418L9 9V3C7.325 3 5.90625 3.58125 4.74375 4.74375C3.58125 5.90625 3 7.325 3 9C3 9.8 3.15238 10.5664 3.45713 11.2991C3.762 12.0317 4.19488 12.6793 4.75575 13.2418Z"
          fill="white"
        />
      </g>
    </g>
  </svg>
);
