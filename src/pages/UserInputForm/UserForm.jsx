import { useEffect, useState } from "react";
import ChatBot from "./ChatBot.jsx";
import axiosInstance from "../../services/axios";
import { Link, useParams } from "react-router-dom";
import { Dropdown, Menu, Button } from "antd";
import { EllipsisOutlined } from "@ant-design/icons";
import { Logo } from "./UserImage";

const UserForm = () => {
  const { orderId: id } = useParams();
  const [OrderDetails, setOrderDetails] = useState(null);
  const [toOrderTracking, setToOrderTracking] = useState(false);
  useEffect(() => {
    axiosInstance.get("/vendor/getOrder/" + id).then((res) => {
      console.log(res.data);
      setOrderDetails(res.data);
      if (
        res.data?.userInputForm?.questionsCount ===
        res.data?.userInputForm?.answerCount
      ) {
        setToOrderTracking(true);
      }
    });
  }, [id]);
  return (
    <div className="flex md:flex-row flex-col font-['Gilroy'] h-screen min-h-screen  bg-[#EAEAEA]">
      <div
        className={`w-[384px] overflow-hidden hidden md:flex flex-col justify-between items-center bg-primary text-white`}
      >
        <div className="inline-flex flex-col items-start gap-[10px] px-[40px] py-[20px] w-ful">
          <div className="flex flex-col gap-[20px] justify-center items-center">
            <h1 className="text-[28px] leading-[40px] w-[197px] font-[Montas] mt-10 text-center">
              {location.pathname.includes("/revision")
                ? "Add Revisions"
                : OrderDetails?.product?.name}
            </h1>
            <div className="flex gap-2">
              <div className="font-['Gilroy'] flex gap-2 text-[10px] bg-[#454545] justify-center items-center py-2 px-4 rounded-full">
                {location.pathname.includes("/preview") ? (
                  <LockSvg />
                ) : (
                  <Logo />
                )}
                <span className="text-[14px] font-extralight text-white font-['Gilroy'] ">
                  Myn Conversations
                </span>
              </div>
            </div>
            <div className="w-80 border-[#EFEFEF] mt-5 border-0 border-b-[0.25px] border-opacity-35"></div>

            {toOrderTracking ? (
              <Link to={`/userform/order-tracking/${id}`}>
                <div className="font-['Gilroy'] text-[16px] flex gap-4 mt-10">
                  <span className="opacity-70">Order Tracking</span>{" "}
                  <Tick className="opacity-100" />
                </div>
              </Link>
            ) : (
              <Link to={`/userform/preview/${id}`}>
                <div className="font-['Gilroy'] text-[16px] flex gap-4 mt-10">
                  <span className="opacity-70">Preview Conversation</span>{" "}
                  <Tick className="opacity-100" />
                </div>
              </Link>
            )}

            <div className="font-['Gilroy']  text-[16px] flex gap-4">
              <span className="opacity-70">Get Assisted</span> <Tick />
            </div>
          </div>
        </div>

        <span className="h-[50%] w-[304px]">
          <img className="filterInvert" src="/images/Illustration.png" alt="" />
        </span>
      </div>

      <div className="w-full px-[20px] py-[16px] md:hidden bg-primary z-50 fixed top-0 flex justify-between">
        <div className="flex justify-between items-center w-full">
          <span className="text-[#F5F1E9] font-['Montas']  text-[14px] !font-normal leading-8 ">
            {OrderDetails?.product?.name}
          </span>
          <div className="flex gap-2">
            <div className="font-['Gilroy'] flex gap-2 text-[10px] bg-[#454545] justify-center items-center p-2 px-3 rounded-full">
              {" "}
              <LockSvg />{" "}
              <span className="text-[10px] font-light text-white font-['Gilroy']">
                Myn{" "}
                {location.pathname.includes("/preview")
                  ? "Conversations"
                  : "Present"}
              </span>
            </div>
            <VerticalDotsMenu
              className="ml-11"
              orderId={id}
              toOrderTracking={toOrderTracking}
            />
          </div>
        </div>
      </div>

      <div className="w-full h-full bg-[#EAEAEA] flex flex-col items-center">
        {OrderDetails && <ChatBot OrderDetails={OrderDetails} />}
      </div>
    </div>
  );
};

export default UserForm;

const VerticalDotsMenu = ({ orderId, toOrderTracking }) => {
  const menu = (
    <Menu>
      <Menu.Item key="1">
        {toOrderTracking ? (
          <Link to={`/userform/order-tracking/${orderId}`}>Order Tracking</Link>
        ) : (
          <Link to={`/userform/preview/${orderId}`}>Preview Conversation</Link>
        )}
      </Menu.Item>
      <Menu.Item key="2">Get Assisted</Menu.Item>
    </Menu>
  );

  return (
    <Dropdown overlay={menu} trigger={["click"]} className="text-white">
      <Button type="text" icon={<EllipsisOutlined rotate={90} />} />
    </Dropdown>
  );
};

const LockSvg = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="ml-1 w-3 h-3 md:w-4 md:h-4"
      viewBox="0 0 10 10"
      fill="none"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.99995 0.599976C4.443 0.599976 3.90885 0.821225 3.51503 1.21505C3.1212 1.60888 2.89995 2.14302 2.89995 2.69998V3.89998C2.58169 3.89998 2.27647 4.0264 2.05142 4.25145C1.82638 4.47649 1.69995 4.78172 1.69995 5.09998V7.79998C1.69995 8.11824 1.82638 8.42346 2.05142 8.6485C2.27647 8.87355 2.58169 8.99998 2.89995 8.99998H7.09995C7.41821 8.99998 7.72344 8.87355 7.94848 8.6485C8.17352 8.42346 8.29995 8.11824 8.29995 7.79998V5.09998C8.29995 4.78172 8.17352 4.47649 7.94848 4.25145C7.72344 4.0264 7.41821 3.89998 7.09995 3.89998V2.69998C7.09995 1.53998 6.15995 0.599976 4.99995 0.599976ZM6.49995 3.89998V2.69998C6.49995 2.30215 6.34192 1.92062 6.06061 1.63932C5.77931 1.35801 5.39778 1.19998 4.99995 1.19998C4.60213 1.19998 4.2206 1.35801 3.93929 1.63932C3.65799 1.92062 3.49995 2.30215 3.49995 2.69998V3.89998H6.49995Z"
        fill="#CDCDCD"
      />
    </svg>
  );
};
const Tick = () => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="20" height="20" rx="10" fill="#F74F09" />
      <path
        d="M7.15387 13.5L6.40002 12.7462L11.5693 7.57692H6.93849V6.5H13.4V12.9615H12.3231V8.33077L7.15387 13.5Z"
        fill="white"
      />
    </svg>
  );
};
