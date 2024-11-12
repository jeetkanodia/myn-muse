import { EllipsisOutlined } from "@ant-design/icons";
import { Button, Dropdown, Menu, message } from "antd";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../services/axios";

import { BarLoader } from "react-spinners";
import { Logo } from "./UserImage";
const AddressInside = ({
  country,
  setCountry,
  state,
  setState,
  city,
  setCity,
  street,
  setStreet,
  pincode,
  setPincode,
  setDisabled,
}) => {
  const { orderId } = useParams();

  useEffect(() => {
    if (pincode && country && state && city && street) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [pincode, country, state, city, street]);

  return (
    <div className="flex flex-col md:gap-[25px] gap-[35px] bg-[#EAEAEA] md:max-h-screen overflow-y-auto scrollbar-hidden z-10 absolute  w-full top-0 left-0 md:p-[50px] pt-12 p-[30px]">
      <div className="flex flex-col md:gap-[30px] gap-[20px] text-[#1A1A1A] md:text-[16px] text-[12px] font-medium w-fit">
        <div className="px-[20px] md:mt-10 mt-0 py-[14px] w-fit rounded-[10px] text-[#1A1A1A] font-['Gilroy'] bg-[#FFFFFF]">
          Great ! Your Magazine is ready and ready to ship, <br /> Please fill
          in the required details.
        </div>
      </div>

      <form action="" className="md:w-[433px] ml-4 self-end mr-3">
        <div className="flex gap-[20px] md:w-full w-fit flex-col text-primary font-medium items-center justify-center">
          <div className="flex flex-col gap-[8px] md:w-full w-[301px] ">
            <textarea
              placeholder="Street"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              className="md:p-[12px] p-[10px] rounded-[8px] bg-[#F5F5F5] focus:outline-none resize-none self-stretch w-full text-[12px] md:text-[16px] font-['Gilroy']"
            />
          </div>
          <div className="flex gap-[20px]">
            <div className="flex flex-col gap-[8px]">
              <input
                type="Country"
                placeholder="Country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="md:p-[12px] p-[10px] rounded-[8px] bg-[#F5F5F5] focus:outline-none w-[140.5px] md:w-[205px]  text-[12px] md:text-[16px] font-['Gilroy']"
              />
            </div>

            <div className="flex flex-col gap-[8px]">
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="Pincode"
                className="md:p-[12px] p-[10px] rounded-[8px] bg-[#F5F5F5] focus:outline-none w-[140.5px] md:w-[205px]  text-[12px] md:text-[16px]   font-['Gilroy']"
              />
            </div>
          </div>

          <div className="flex gap-[20px] items-center justify-center">
            <div className="flex flex-col gap-[8px]">
              <input
                type="State"
                placeholder="State"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="md:p-[12px] p-[10px] rounded-[8px] bg-[#F5F5F5] focus:outline-none w-[140.5px] md:w-[205px]  text-[12px] md:text-[16px]   font-['Gilroy']"
              />
            </div>

            <div className="flex flex-col gap-[8px]">
              <input
                type="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                className="md:p-[12px] p-[10px] rounded-[8px] bg-[#F5F5F5] focus:outline-none w-[140.5px] md:w-[205px]  text-[12px] md:text-[16px]  font-['Gilroy']"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

const Address = () => {
  const location = useLocation();
  const { orderId } = useParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allowOrderTracking, setAllowOrderTracking] = useState(false);
  const [pincode, setPincode] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [street, setStreet] = useState("");
  const navigate = useNavigate();
  const [disabled, setDisabled] = useState(true);
  const handleDone = () => {
    if (!pincode || !country || !state || !city || !street) {
      message.error("Please fill all the fields");
      return;
    }
    let customerAddress = {
      pincode,
      country,
      state,
      city,
      street,
    };
    setLoading(true);
    axiosInstance
      .post("/order/userForm/addCustomerAddress", {
        order_id: orderId,
        customerAddress,
      })
      .then((res) => {
        console.log(res.data);
        setLoading(false);

        navigate("/userform/order-tracking/" + orderId);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };
  useEffect(() => {
    axiosInstance.get("/vendor/getOrder/" + orderId).then((res) => {
      setOrderDetails(res.data);
      console.log(res.data);
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
    <div className="flex md:flex-row flex-col font-['Gilroy'] h-screen relative bg-[#EAEAEA] ">
      <div
        className={`w-[384px] h-screen overflow-hidden hidden md:flex flex-col justify-between items-center bg-primary text-white `}
      >
        <div className="inline-flex flex-col items-start gap-[10px] px-[40px] py-[20px] w-ful">
          <div className="flex flex-col gap-[20px] justify-center items-center text-white">
            <h1 className="text-[30px] leading-[40px] w-[197px] font-[Montas] mt-10 text-center">
              {orderDetails?.product?.name}
            </h1>
            <div className="flex gap-2">
              <div className="font-['Gilroy'] flex gap-2 text-[10px] bg-[#454545] justify-center items-center py-2 px-4 rounded-full">
                <LockSvg />
                <span className="text-[14px] font-extralight text-white font-['Gilroy'] ">
                  Myn Present
                </span>
              </div>
            </div>
            <div className="w-80 border-[#EFEFEF] mt-5 border-0 border-b-[0.25px] border-opacity-35"></div>

            <Link to={`/userform/preview/${orderId}`}>
              <div className="font-['Gilroy'] text-[16px] flex gap-4 mt-10">
                <span className="opacity-70">Preview Conversation</span>{" "}
                <Tick className="opacity-100" />
              </div>
            </Link>
            <div className="font-['Gilroy']  text-[16px] flex gap-4">
              <span className="opacity-70">Get Assisted</span> <Tick />
            </div>
          </div>
        </div>
        <span className="h-[50%] w-[304px]">
          <img className="filterInvert" src="/images/Illustration.png" alt="" />
        </span>
      </div>

      <div className="w-full px-[20px] py-[16px] md:hidden bg-primary flex justify-between">
        <div className="flex justify-between items-center w-full">
          <span className="text-[#F5F1E9] font-['Montas'] text-[14px] !font-normal leading-8 ">
            {orderDetails?.product?.name}
          </span>
          <div className="flex gap-2">
            <div className="font-['Gilroy'] flex gap-2 text-[10px] bg-[#454545] justify-center items-center p-2 rounded-full">
              {" "}
              <LockSvg />{" "}
              <span className="text-[10px] !font-normal text-white font-['Gilroy'] pr-2">
                Myn Present
              </span>
            </div>
            <VerticalDotsMenu className="ml-11" orderId={orderId} />
          </div>
        </div>
      </div>

      <div className="w-full h-full flex flex-col items-center overflow-y-hidden justify-between relative bg-[#EAEAEA]">
        <AddressInside
          country={country}
          setCountry={setCountry}
          state={state}
          setState={setState}
          city={city}
          setCity={setCity}
          street={street}
          setStreet={setStreet}
          pincode={pincode}
          setPincode={setPincode}
          setDisabled={setDisabled}
        />
        <div
          className={`md:gap-[17px] gap-[8px] justify-end flex flex-col items-end w-full absolute bottom-[20px] md:px-[40px] px-[20px]`}
        >
          <button
            disabled={disabled}
            className={`bg-primary text-white pl-4  rounded-full focus:outline-none md:h-[55px] h-[40px] md:w-[200px] w-[90vw] ${
              disabled ? "opacity-50" : ""
            }`}
            onClick={handleDone}
          >
            <div className="flex gap-[10px] justify-center items-center">
              <svg
                className="w-[25px] md:w-[35px]"
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
          <div className="flex items-center gap-1 md:gap-2 justify-center self-center bg-[#EAEAEA] w-full">
            <Logo />
            <span className="text-[10px] md:text-[14px] font-['Gilroy'] bg-[#EAEAEA] text-[#B9B9B9]">
              End-to-end encrypted
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Address;

const VerticalDotsMenu = ({ orderId }) => {
  const menu = (
    <Menu>
      <Menu.Item key="1">
        <Link to={`/userform/preview/${orderId}`}>Preview Conversation</Link>
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
