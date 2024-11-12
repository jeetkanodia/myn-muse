import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Flipbook from "./dflip";
import axiosInstance from "../../services/axios";
import { Logo } from "./UserImage";

const ReviewReq = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);
  const handleRequestRevision = () => {
    axiosInstance
      .post("/order/userForm/markRevision", {
        order_id: orderId,
      })
      .then((res) => {
        console.log(res);
        navigate("/userform/revision/" + orderId);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleApprove = async () => {
    try {
      const approveResponse = await axiosInstance.post(
        "/order/userForm/approveCopy",
        {
          order_id: orderId,
        }
      );
      console.log("Order approved:", approveResponse.data);

      if (orderData && orderData.method === "ete") {
        try {
          const assignPrinterResponse = await axiosInstance.get(
            `/assign-printer/${orderId}`
          );
          console.log("Printer assigned:", assignPrinterResponse.data);
        } catch (printerError) {
          console.error("Error assigning printer:", printerError);
        }
      }

      if (orderData && orderData.method === "ete") {
        navigate(`/userform/ship-address/${orderId}`);
      } else {
        navigate(`/userform/order-tracking/${orderId}`);
      }
    } catch (error) {
      console.error("Error in handleApprove:", error);
    }
  };

  useEffect(() => {
    axiosInstance.get("/vendor/getOrder/" + orderId).then((res) => {
      console.log(res.data);
      setOrderData(res.data);
    });
  }, [orderId]);

  return (
    <div className="w-full h-screen flex flex-col md:justify-between items-start gap-[34px] bg-[#EAEAEA] md:p-[50px] p-[20px] overflow-hidden">
      <div className="md:max-h-screen overflow-auto scrollbar-hidden h-screen z-10 absolute  w-full top-0 left-0 flex justify-center items-center">
        <div className="flex flex-col h-full py-[80px] overflow-y-auto w-full items-center scrollbar-hidden">
          <div className="w-[70%]">
            {orderData && (
              <Flipbook
                source={orderData.orderLayouts.map(
                  (page) => page?.image?.mediaLink
                )}
              />
            )}
          </div>

          <div className="flex flex-col items-center sticky bottom-0  text-[#FFFF] mt-auto w-full justify-center">
            <div className="flex items-center gap-[22px]">
              <div
                className="cursor-pointer md:px-[30px] px-[12px] md:py-[12px] py-[6px] bg-[#EAEAEA] w-fit rounded-full md:text-[20px] border border-primary text-[16px] text-primary font-medium font-['Gilroy']"
                onClick={handleRequestRevision}
              >
                Request Changes
              </div>
              <div
                className="cursor-pointer md:px-[65px] px-[45px]  md:py-[12px] py-[6px] text-white bg-primary w-fit rounded-full md:text-[20px] text-[16px] font-medium font-['Gilroy']"
                onClick={handleApprove}
              >
                Approve
              </div>
            </div>
            <div className="flex items-center gap-1 md:gap-2 justify-center mt-4 self-center">
              <Logo />
              <span className="text-[10px] md:text-[14px] font-['Gilroy'] text-[#B9B9B9]">
                End-to-end encrypted
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewReq;
