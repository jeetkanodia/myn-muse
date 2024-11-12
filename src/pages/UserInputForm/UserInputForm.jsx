import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import axiosInstance from "../../services/axios";
import { BarLoader } from "react-spinners";
import OrderPopUp from "../../components/Orders/OrderPopUp";

const UserInputForm = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [loading, setLoading] = useState(true);
  const [vendorId, setVendorId] = useState(null);
  const [popupData, setPopupData] = useState(null);
  const [popupVisible, setPopupVisible] = useState(false);
  const [OrderDetails, setOrderDetails] = useState(null);
  const [vendorData, setVendorData] = useState(null);
  const [error, setError] = useState(null); // State to track errors

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { width } = windowSize;
  const isMobile = width < 768;
  const { orderId: id } = useParams();



  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const res = await axiosInstance.get(`/getoneorder/${id}`);
        console.log("Order", res.data.order);

        let limit = 0;
        for (let i = 0; i < res.data.order?.userInputForm?.setDetails?.length; i++) {
          limit += res.data.order?.userInputForm?.setDetails[i]?.range?.lowerLimit;
        }
        console.log(limit);

        if (
          res.data.order?.userInputForm?.answerCount ===
          res.data.order?.userInputForm?.questionsCount &&
          res.data.order?.userInputForm?.imageCount >= limit
        ) {
          location.href = `/userform/order-tracking/${id}`;
        }

        setOrderDetails(res.data.order);
        setVendorData(res.data?.order.vendorId);
      } catch (error) {
         // Set the error state to display it later
        if (error.response && error.response.status === 400) {
          console.log("400 error occurred, calling the fallback API...");
          setPopupData(error.response.data);
          setPopupVisible(true);
        } else {
          setError(error);
          console.error("Error fetching order details:", error);
        }
      } finally {
        setLoading(false); // Stop loading once data is fetched or an error occurs
      }
    };

    if (id) {
      fetchOrderDetails(); // Call the API when the orderId is available
    }
  }, [id]);

  // useEffect(() => {
  //   axiosInstance.get("/getoneorder/" + id).then((res) => {
  //     console.log(res.data?.vendorId?._id);
  //     console.log("order is:", res.data);
  //     let limit = 0;
  //     for (let i = 0; i < res.data?.userInputForm?.setDetails?.length; i++) {
  //       limit += res.data?.userInputForm?.setDetails[i]?.range?.lowerLimit;
  //     }
  //     console.log(limit);

  //     if (
  //       res.data?.userInputForm?.answerCount ===
  //         res.data?.userInputForm?.questionsCount &&
  //       res.data?.userInputForm?.imageCount >= limit
  //     ) {
  //       location.href = `/userform/order-tracking/${id}`;
  //     }

  //     setOrderDetails(res.data);

  //     setVendorData(res.data?.order.vendorId?._id);
  //   });
  // }, [id]);

  // useEffect(() => {
  //   const fetchDetails = async () => {
  //     try {
  //       const res = await axiosInstance.get(
  //         "/getVendorDetailsById/" + vendorId
  //       );
  //       setVendorData(res.data?.data);
  //       console.log(res.data?.data);

  //       setLoading(false);
  //     } catch (error) {
  //       console.error("Something Went Wrong", error);
  //       setLoading(false);
  //     }
  //   };

  //   if (vendorId) {
  //     fetchDetails();
  //   }
  // }, [vendorId]);

  

  if (loading) {
    return (
      <div className="flex  items-center justify-center w-full min-w-[100vh] h-screen min-h-screen bg-[#EAEAEA]">
        <BarLoader height={2} color="#1E1E1E" speedMultiplier={0.75} />
      </div>
    );
  }

  return (
    <div>
    {error && <div>Error: {error.message}</div>}
    {!error && (
    <div>
      <motion.div
        initial={{ height: "100vh" }}
        exit={{
          width: isMobile ? "100vw" : 380,
          height: isMobile ? 0 : "100vh",
          opacity: isMobile ? 0 : 1,
        }}
        transition={{ duration: 0.4 }}
        className="sm:p-[80px] p-[40px] w-full min-h-screen relative font-['Gilroy'] bg-primary sm:block hidden overflow-y-hidden"
      >
        <motion.div
          exit={{ opacity: 0, display: "hidden" }}
          transition={{ duration: 0.2 }}
          className="flex sm:flex-row flex-col-reverse gap-[20px] justify-between items-start text-secondary"
        >
          <div className="flex flex-col md:gap-[50px] gap-[20px]">
            <div className="flex flex-col gap-[20px]">
              <h1 className="md:text-[50px] sm:text-[30px] text-[12px] text-start md:leading-80 font-['Montas']">
                {OrderDetails?.theme?.name} <br /> {OrderDetails?.product?.name}{" "}
                Form
              </h1>
              <h2 className="md:text-[32px] sm:text-[20px] text-[12px] text-start font-semibold md:leading-[32px]">
                {OrderDetails?.customersDetails?.name}
              </h2>
            </div>

            <div className="flex flex-col gap-[14px]">
              <Link
                className="flex w-[276px] sm:py-[11px] py-[8px] justify-between p-4 items-center gap-[5px] bg-secondary sm:rounded-[10px] rounded-lg"
                to={`/userform/preview/${id}`}
              >
                <h3 className="md:text-[20px] text-[12px] text-mainBg font-medium md:leading-[30px]">
                  Preview Questions
                </h3>

                <span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <mask
                      id="mask0_832_1605"
                      maskUnits="userSpaceOnUse"
                      x="0"
                      y="0"
                      width="20"
                      height="20"
                    >
                      <rect width="20" height="20" fill="#D9D9D9" />
                    </mask>
                    <g mask="url(#mask0_832_1605)">
                      <path
                        d="M6.67141 17.7561L5.78516 16.8698L12.6554 9.99962L5.78516 3.12941L6.67141 2.24316L14.4279 9.99962L6.67141 17.7561Z"
                        fill="none"
                        className="fill-current"
                        style={{ fill: "var(--main-bg)" }}
                      />
                    </g>
                  </svg>
                </span>
              </Link>
              <Link
                className="flex w-[276px] sm:py-[11px] py-[8px]  justify-between p-4 items-center gap-[5px] bg-secondary sm:rounded-[10px] rounded-lg"
                to={`/userform/question/${id}`}
              >
                <h3 className="md:text-[20px] text-[12px] text-mainBg font-medium md:leading-[30px]">
                  Fill your Memories
                </h3>

                <span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <mask
                      id="mask0_832_1605"
                      maskUnits="userSpaceOnUse"
                      x="0"
                      y="0"
                      width="20"
                      height="20"
                    >
                      <rect width="20" height="20" fill="#D9D9D9" />
                    </mask>
                    <g mask="url(#mask0_832_1605)">
                      <path
                        d="M6.67141 17.7561L5.78516 16.8698L12.6554 9.99962L5.78516 3.12941L6.67141 2.24316L14.4279 9.99962L6.67141 17.7561Z"
                        fill="none"
                        className="fill-current"
                        style={{ fill: "var(--main-bg)" }}
                      />
                    </g>
                  </svg>
                </span>
              </Link>

              {OrderDetails?.imageTags?.length > 0 && (
                <Link
                  className="flex w-[276px] sm:py-[11px] py-[8px]  justify-between p-4 items-center gap-[5px] bg-secondary sm:rounded-[10px] rounded-lg"
                  to={`/userform/tag-images/${id}`}
                >
                  <h3 className="md:text-[20px] text-[12px] text-mainBg font-medium md:leading-[30px]">
                    Tags
                  </h3>

                  <span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                    >
                      <mask
                        id="mask0_832_1605"
                        maskUnits="userSpaceOnUse"
                        x="0"
                        y="0"
                        width="20"
                        height="20"
                      >
                        <rect width="20" height="20" fill="#D9D9D9" />
                      </mask>
                      <g mask="url(#mask0_832_1605)">
                        <path
                          d="M6.67141 17.7561L5.78516 16.8698L12.6554 9.99962L5.78516 3.12941L6.67141 2.24316L14.4279 9.99962L6.67141 17.7561Z"
                          fill="none"
                          className="fill-current"
                          style={{ fill: "var(--main-bg)" }}
                        />
                      </g>
                    </svg>
                  </span>
                </Link>
              )}

              {OrderDetails?.reAnswerIndex > 0 && (
                <Link
                  className="flex w-[276px] sm:py-[11px] py-[8px]  justify-between p-4 items-center gap-[5px] bg-secondary sm:rounded-[10px] rounded-lg"
                  to={`/userform/re-ask/${id}`}
                >
                  <h3 className="md:text-[20px] text-[12px] text-mainBg font-medium md:leading-[30px]">
                    Re ask
                  </h3>

                  <span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                    >
                      <mask
                        id="mask0_832_1605"
                        maskUnits="userSpaceOnUse"
                        x="0"
                        y="0"
                        width="20"
                        height="20"
                      >
                        <rect width="20" height="20" fill="#D9D9D9" />
                      </mask>
                      <g mask="url(#mask0_832_1605)">
                        <path
                          d="M6.67141 17.7561L5.78516 16.8698L12.6554 9.99962L5.78516 3.12941L6.67141 2.24316L14.4279 9.99962L6.67141 17.7561Z"
                          fill="none"
                          className="fill-current"
                          style={{ fill: "var(--main-bg)" }}
                        />
                      </g>
                    </svg>
                  </span>
                </Link>
              )}
              {OrderDetails?.imageQuestions?.length > 0 && (
                <Link
                  className="flex w-[276px] sm:py-[11px] py-[8px]  justify-between p-4 items-center gap-[5px] bg-secondary sm:rounded-[10px] rounded-lg"
                  to={`/userform/context-image/${id}`}
                >
                  <h3 className="md:text-[20px] text-[12px] text-mainBg font-medium md:leading-[30px]">
                    Image Context
                  </h3>

                  <span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                    >
                      <mask
                        id="mask0_832_1605"
                        maskUnits="userSpaceOnUse"
                        x="0"
                        y="0"
                        width="20"
                        height="20"
                      >
                        <rect width="20" height="20" fill="#D9D9D9" />
                      </mask>
                      <g mask="url(#mask0_832_1605)">
                        <path
                          d="M6.67141 17.7561L5.78516 16.8698L12.6554 9.99962L5.78516 3.12941L6.67141 2.24316L14.4279 9.99962L6.67141 17.7561Z"
                          fill="none"
                          className="fill-current"
                          style={{ fill: "var(--main-bg)" }}
                        />
                      </g>
                    </svg>
                  </span>
                </Link>
              )}
            </div>
          </div>

          <div className="flex justify-center items-center gap-[20px]">
            <div className="sm:h-[78px] h-[39px] sm:w-[78px] w-[39px] rounded-full bg-filledBg shrink-0">
              <img
                src={vendorData?.logo?.mediaLink}
                className="w-full h-full object-cover rounded-full"
                alt=""
              />
            </div>
            <h1 className="md:text-[32px] sm:text-[24px] text-[12px] font-semibold md:leading-[32px]">
              {vendorData?.brandName}
            </h1>
          </div>
        </motion.div>

        <motion.div
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="absolute bottom-0 right-0 md:right-[40px] sm:left-auto flex items-center sm:h-[51%] md:h-[71%] overflow-hidden"
        >
          <div className="max-w-[500px] xs:w-200px xs:h-100px">
            <img
              className="w-full h-auto lg:w-full sm:w-[400px] sm:mt-10 filterInvert"
              src="/images/UserInput.svg"
              alt="Illustration"
            />
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ width: "100vw", height: "100vh" }}
        exit={{
          width: isMobile ? "100vw" : 360,
          height: isMobile ? 71 : "100vh",
          backgroundColor: "#5750FB",
        }}
        transition={{ duration: 0.3 }}
        className=" h-screen overflow-hidden sm:hidden flex flex-col justify-between items-center bg-primary"
      >
        <motion.div
          exit={{
            opacity: 0,
          }}
          className="inline-flex flex-col text-secondary items-center gap-[20px] px-[40px] py-[60px] w-full"
        >
          <div className="flex gap-[8px] items-center">
            <div className="h-[39px] w-[39px] bg-secondary rounded-full">
              <img
                src={vendorData?.parent?.logo?.mediaLink}
                className="w-full h-full rounded-full object-cover"
                alt=""
              />
            </div>
            <h1 className="text-[14px] font-semibold">
              {vendorData?.parent?.brandName}
            </h1>
          </div>

          <div className="flex flex-col items-center gap-[20px]">
            <div className="flex flex-col items-center gap-[5px]">
              <h1 className="text-[20px] leading-[32px] font-[Montas] text-center">
                {OrderDetails?.theme?.name} <br /> {OrderDetails?.product?.name}{" "}
              </h1>
              <h2 className="md:text-[20px] text-[12px] font-semibold">
                {OrderDetails?.customersDetails?.name}
              </h2>
            </div>

            <div className="flex flex-col gap-[8px]">
              <Link
                to={"/userform/preview/" + id}
                className="flex sm:px-[40px] sm:py-[11px] py-[8px]  justify-between px-2 w-[170px] items-center gap-[6px] bg-secondary  sm:rounded-[5px] rounded-lg"
              >
                <h3 className="text-[14px] text-primary font-medium md:leading-[30px]">
                  Preview Questions
                </h3>

                <span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="11"
                    height="10"
                    viewBox="0 0 11 10"
                    fill="none"
                  >
                    <mask
                      id="mask0_863_2958"
                      maskUnits="userSpaceOnUse"
                      x="0"
                      y="0"
                      width="11"
                      height="10"
                    >
                      <rect x="0.5" width="10" height="10" fill="#D9D9D9" />
                    </mask>
                    <g mask="url(#mask0_863_2958)">
                      <path
                        d="M3.8357 8.87755L3.39258 8.43443L6.82768 4.99932L3.39258 1.56422L3.8357 1.12109L7.71393 4.99932L3.8357 8.87755Z"
                        fill="none"
                        style={{ fill: "var(--primary-color)" }}
                      />
                    </g>
                  </svg>
                </span>
              </Link>
              <Link
                to={"/userform/question/" + id}
                className="flex sm:px-[40px] sm:py-[11px] py-[8px] justify-between  px-2 w-[170px] items-center gap-[6px] bg-secondary sm:rounded-[5px] rounded-lg"
              >
                <h3 className="text-[14px] text-primary font-medium md:leading-[30px]">
                  Fill your Memories
                </h3>

                <span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="11"
                    height="10"
                    viewBox="0 0 11 10"
                    fill="none"
                  >
                    <mask
                      id="mask0_863_2958"
                      maskUnits="userSpaceOnUse"
                      x="0"
                      y="0"
                      width="11"
                      height="10"
                    >
                      <rect x="0.5" width="10" height="10" fill="#D9D9D9" />
                    </mask>
                    <g mask="url(#mask0_863_2958)">
                      <path
                        d="M3.8357 8.87755L3.39258 8.43443L6.82768 4.99932L3.39258 1.56422L3.8357 1.12109L7.71393 4.99932L3.8357 8.87755Z"
                        fill="none"
                        style={{ fill: "var(--primary-color)" }}
                      />
                    </g>
                  </svg>
                </span>
              </Link>
              {OrderDetails?.imageTags?.length > 0 && (
                <Link
                  to={"/userform/tag-images/" + id}
                  className="flex sm:px-[40px] sm:py-[11px] py-[8px] justify-between  px-2 w-[170px]  items-center gap-[6px] bg-secondary   sm:rounded-[5px] rounded-lg"
                >
                  <h3 className="text-[14px] text-primary font-medium md:leading-[30px]">
                    Tags
                  </h3>

                  <span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="11"
                      height="10"
                      viewBox="0 0 11 10"
                      fill="none"
                    >
                      <mask
                        id="mask0_863_2958"
                        maskUnits="userSpaceOnUse"
                        x="0"
                        y="0"
                        width="11"
                        height="10"
                      >
                        <rect x="0.5" width="10" height="10" fill="#D9D9D9" />
                      </mask>
                      <g mask="url(#mask0_863_2958)">
                        <path
                          d="M3.8357 8.87755L3.39258 8.43443L6.82768 4.99932L3.39258 1.56422L3.8357 1.12109L7.71393 4.99932L3.8357 8.87755Z"
                          fill="none"
                          style={{ fill: "var(--primary-color)" }}
                        />
                      </g>
                    </svg>
                  </span>
                </Link>
              )}
              {OrderDetails?.reAnswerIndex > 0 && (
                <Link
                  to={"/userform/re-ask/" + id}
                  className="flex sm:px-[40px] sm:py-[11px] py-[8px] justify-between items-center  px-2 w-[170px]  gap-[6px] bg-secondary sm:rounded-[5px] rounded-lg"
                >
                  <h3 className="text-[14px] text-primary font-medium md:leading-[30px]">
                    Re ask
                  </h3>

                  <span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="11"
                      height="10"
                      viewBox="0 0 11 10"
                      fill="none"
                    >
                      <mask
                        id="mask0_863_2958"
                        maskUnits="userSpaceOnUse"
                        x="0"
                        y="0"
                        width="11"
                        height="10"
                      >
                        <rect x="0.5" width="10" height="10" fill="#D9D9D9" />
                      </mask>
                      <g mask="url(#mask0_863_2958)">
                        <path
                          d="M3.8357 8.87755L3.39258 8.43443L6.82768 4.99932L3.39258 1.56422L3.8357 1.12109L7.71393 4.99932L3.8357 8.87755Z"
                          fill="none"
                          style={{ fill: "var(--primary-color)" }}
                        />
                      </g>
                    </svg>
                  </span>
                </Link>
              )}
              {OrderDetails?.imageQuestions?.length > 0 && (
                <Link
                  to={"/userform/context-image/" + id}
                  className="flex sm:px-[40px] sm:py-[11px] py-[8px] justify-between   px-2 w-[170px]  items-center gap-[6px] bg-secondary sm:rounded-[5px] rounded-lg"
                >
                  <h3 className="text-[14px] text-primary font-medium md:leading-[30px]">
                    Image Context
                  </h3>

                  <span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="11"
                      height="10"
                      viewBox="0 0 11 10"
                      fill="none"
                    >
                      <mask
                        id="mask0_863_2958"
                        maskUnits="userSpaceOnUse"
                        x="0"
                        y="0"
                        width="11"
                        height="10"
                      >
                        <rect x="0.5" width="10" height="10" fill="#D9D9D9" />
                      </mask>
                      <g mask="url(#mask0_863_2958)">
                        <path
                          d="M3.8357 8.87755L3.39258 8.43443L6.82768 4.99932L3.39258 1.56422L3.8357 1.12109L7.71393 4.99932L3.8357 8.87755Z"
                          fill="none"
                          style={{ fill: "var(--primary-color)" }}
                        />
                      </g>
                    </svg>
                  </span>
                </Link>
              )}
            </div>
          </div>
        </motion.div>

        <span className="w-[140vw]">
          <img
            className="w-full filterInvert"
            src="/images/Illustration.png"
            alt=""
          />
        </span>
      </motion.div>
      {popupVisible && <OrderPopUp order={popupData} />}
    </div>
    )}
    </div>
  );
};

export default UserInputForm;
