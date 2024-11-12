import { message } from "antd";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../services/axios";
import { Logo } from "./UserImage";

const TagImages = () => {
  const [images, setImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [tags, setTags] = useState([]);
  const [tagIndex, setTagIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [viewMore, setViewMore] = useState(false);
  const { orderId } = useParams();
  const navigate = useNavigate();
  console.log(orderId);
  useEffect(() => {
    axiosInstance.get(`/vendor/getOrder/${orderId}`).then((res) => {
      console.log("hi", res.data);

      let arr = [];
      for (let i = 0; i < res.data?.userInputForm?.images?.length; i++) {
        // push each element of this image array to arr
        arr.push(...res.data?.userInputForm?.images[i].image);
      }
      setImages(arr);
      setFilteredImages(arr.slice(0, 3));
      setTags(res.data?.imageTags);
      console.log(arr);
    });
  }, []);

  const handleContinue = () => {
    if (!selectedImage) {
      message.error("Please select an image to continue");
      return;
    }
    if (tagIndex < tags.length) {
      axiosInstance
        .post("/vendor/order/imageTag/addImge", {
          order_id: orderId,
          tag_id: tags[tagIndex]._id,
          name: selectedImage?.name,
          mediaLink: selectedImage?.mediaLink,
        })
        .then((res) => {
          console.log(res.data);
          setTagIndex(tagIndex + 1);
        });
      setSelectedImage(null);
    } else {
      message.success("All tags are completed");
    }
  };

  const handleViewMore = () => {
    setViewMore(!viewMore);
    if (viewMore) {
      setFilteredImages(images.slice(0, 3));
    } else {
      setFilteredImages(images);
    }
  };

  return (
    <div className="w-full items-start gap-[34px] bg-[#F5F5F5] md:p-[50px] p-[20px] flex flex-col min-h-screen h-screen md:gap-[40px] max-h-screen overflow-auto scrollbar-hidden">
      <div className="py-[14px] mt-16 md:mt-0 px-[20px] bg-[#FFFFFF] rounded-[10px] md:text-[16px] text-[12px] w-fit font-medium text-[#1A1A1A] font-['Gilroy']">
        {tags[tagIndex]?.name}
      </div>

      <div className="py-[14px] px-[20px] bg-[#FFFFFF] rounded-[10px] md:text-[16px] text-[12px] w-fit font-medium text-[#1A1A1A] font-['Gilroy']">
        {tags[tagIndex]?.question}
      </div>

      <div className="flex flex-wrap md:gap-[20px] gap-[9px] max-w-[90%] ml-4">
        {filteredImages &&
          filteredImages.map((img, index) => (
            <div
              key={index}
              className={`md:w-[211px] w-[160px] md:h-[229px] h-[170px] bg-[#3E3E3E] rounded-[4px] cursor-pointer ${
                selectedImage === img ? "border-[2px] border-[#F74F09]" : ""
              }`}
              onClick={() => setSelectedImage(img)}
            >
              <img
                src={img?.mediaLink}
                className="w-full h-full object-contain"
                alt={img?.name}
              />
            </div>
          ))}
        <div className="rounded-[10px] text-right w-full">
          <span
            className="cursor-pointer bg-white font-['Gilroy'] text-[12px] md:text-[16px] rounded-xl text-[#F74F09] px-[10px] py-[5px] border border-[#F74F09]"
            onClick={handleViewMore}
          >
            {viewMore ? "View Less" : "View More"}...
          </span>
        </div>
      </div>
      <div className="bg-inherit fixed  bottom-0 w-full p-5 flex flex-col">
        <button
          className="w-[90%] mr-12 md:w-40 bg-black text-white text-[14px] md:text-[16px] font-['Gilroy'] rounded-full py-2 px-4 md:py-3 md:px-6"
          type="primary"
          onClick={() => {
            tagIndex < tags.length
              ? handleContinue()
              : navigate(`/userform/order-tracking/${orderId}`);
          }}
        >
          {tagIndex < tags.length ? "Next" : "Order Tracking"}
        </button>
        <div className="flex items-center gap-1 md:gap-2 justify-center md:justify-start pt-3 bg-[#F5F5F5] w-full">
          <Logo />
          <span className="text-[10px] md:text-[14px] font-['Gilroy'] text-[#B9B9B9]">
            End-to-end encrypted
          </span>
        </div>
      </div>
    </div>
  );
};

export default TagImages;
