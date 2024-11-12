import React, { useEffect, useRef, useState } from "react";
import Slider from "react-slick";

import {
  CloseOutlined,
  DeleteFilled,
  PlusOutlined,
  ReloadOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { Button, message, Modal } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../services/axios";

const Revision = () => {
  const { orderId } = useParams();
  const [data, setData] = useState([]);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [selectedLayout, setSelectedLayout] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [index, setIndex] = useState(0);
  const [fetchData, setfetchData] = useState(false);

  useEffect(() => {
    axiosInstance.get("/vendor/getOrder/" + orderId).then((res) => {
      console.log(res.data);
      console.log(res.data?.orderLayouts);
      setOrderData(res.data);
      setData(res.data?.orderLayouts);
    });
  }, [fetchData]);

  useEffect(() => {
    axiosInstance.get("/vendor/getOrder/" + orderId).then((res) => {
      console.log(res.data);
      console.log(res.data?.orderLayouts);
      setOrderData(res.data);
      setData(res.data?.orderLayouts);
    });
  }, []);

  const handleImageDivClick = (layout) => {
    setSelectedLayout(layout);
    setOpen(true);
  };

  const handleContinue = () => {
    axiosInstance
      .post("/order/userForm/submitRevision", {
        order_id: orderId,
      })
      .then((res) => {
        console.log(res.data);

        navigate("/userform/order-tracking/" + orderId);
      })
      .catch((err) => {
        message.error("Failed to submit revision");
      });
  };

  return (
    <div className="max-w-[10px] w-[10px] h-screen flex flex-col items-center bg-[#EAEAEA] pt-28">
      <div className="flex flex-col overflow-hidden scrollbar-hidden justify-center items-center">
        {/* <div className="text-[28px] md:text-[40px] text-primary font-['Montas'] md:hidden">
          Request Changes
        </div> */}
        {/* <div className="text-[16px] md:text-[32px] text-primary font-['Gilroy'] md:hidden">
          {orderData?.theme?.name} {orderData?.product?.name}
        </div> */}
        <div className="flex flex-wrap flex-col md:gap-[20px] gap-[16px] mt-0 md:mt-10">
          <div className="mt-5">
            <CenterMode
              images={data}
              setIndex={setIndex}
              handleImageDivClick={handleImageDivClick}
            />
          </div>
          <div className="w-full  flex justify-center items-center">
            {data[index]?.revision ? <SelectedIcon /> : <NotSelectedIcon />}
          </div>
        </div>
      </div>

      <div
        className={`md:gap-[17px] gap-[8px] justify-end flex flex-col items-end w-[90%] absolute bottom-[20px]`}
      >
        <button
          onClick={handleContinue}
          className={`bg-primary text-secondary pl-4 rounded-full focus:outline-none md:h-[63px] h-[40px] md:w-[291px] w-[90vw]`}
        >
          <div className="flex gap-[10px] justify-center items-center">
            <h2 className="text-[12px] md:text-[16px]">Submit Revisions</h2>
            <svg
              className="w-[25px] md:w-[32px]"
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
        <div className="flex items-center gap-1 md:gap-2 justify-center self-center">
          <Logo />
          <span className="text-[10px] md:text-[14px] font-['Gilroy'] text-[#B9B9B9]">
            End-to-end encrypted
          </span>
        </div>
      </div>
      <RevisionPopup
        setfetchData={setfetchData}
        open={open}
        setOpen={setOpen}
        selectedLayout={selectedLayout}
        setSelectedLayout={setSelectedLayout}
      />
    </div>
  );
};

export default Revision;

const RevisionPopup = ({
  setfetchData,
  open,
  setOpen,
  selectedLayout,
  setSelectedLayout,
}) => {
  const [images, setImages] = useState([]);
  const [revision, setRevision] = useState("");
  const [deleteSrcs, setDeleteSrcs] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [replaceImages, setReplaceImages] = useState([]); // array of objects with oldSrc and newSrc with new image file

  // useEffect to reset the states when the popup is closed
  useEffect(() => {
    if (!open) {
      setImages([]);
      setRevision("");
      setDeleteSrcs([]);
      setNewImages([]);
      setNewFiles([]);
      setReplaceImages([]);
    }
  }, [open]);

  useEffect(() => {
    if (!selectedLayout?.jsonFile?.mediaLink) return;

    const fetchJsonData = async () => {
      try {
        const response = await fetch(selectedLayout.jsonFile.mediaLink);
        const jsonData = await response.json();

        const imageSrcs = jsonData.objects
          .filter((obj) => obj.name === "img")
          .map((obj) => obj.src);

        setImages(imageSrcs); // Update the state with the image sources
        console.log("Images:", imageSrcs);

        // set the replaceImages state with the oldSrc and newSrc
        for (const src of imageSrcs) {
          setReplaceImages((prev) => [
            ...prev,
            { oldSrc: src, newSrc: "", file: "" },
          ]);
        }
      } catch (error) {
        console.error("Error fetching JSON data:", error);
      }
    };

    fetchJsonData();
  }, [selectedLayout]);

  const handleAddImages = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = "image/*";
    input.click();

    input.onchange = (e) => {
      const files = e.target.files;
      if (files.length === 0) return;

      const fileSrcs = Array.from(files).map((file) =>
        URL.createObjectURL(file)
      );

      // Update the states with the new files and their URLs
      setNewImages((prev) => [...prev, ...fileSrcs]);
      setNewFiles((prev) => [...prev, ...files]);

      console.log("New Images:", newImages);
      console.log("New Files:", newFiles);
    };
  };

  const handleReplaceImage = (imgSrc, index) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.click();

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const newSrc = URL.createObjectURL(file);

      // Update the replaceImages state with the new image file
      setReplaceImages((prev) =>
        prev.map((obj, i) => (i === index ? { ...obj, newSrc, file } : obj))
      );
    };
  };

  const handleSubmit = async () => {
    const layoutId = selectedLayout?._id;
    if (!layoutId) return;
    // call all the apis one by one
    // 1. Upload the new images
    // 2. upload text revision
    // 3. Send Delete request for the images that were deleted
    // 4. Send the replace images to the server

    try {
      // 1. Upload the new images
      for (const file of newFiles) {
        const formData = new FormData();
        formData.append("photo", file);
        formData.append("layoutId", layoutId);
        const response = await axiosInstance.post(
          "/vendor/order/addImageRevision",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        console.log("Image uploaded successfully:", response.data);
      }

      // 2. Upload the text revision
      if (revision) {
        const response = await axiosInstance.post(
          "/vendor/order/addGenricRevision",
          {
            layoutId,
            revision,
          }
        );
        console.log("Text revision added successfully:", response.data);
      }

      // 3. Send Delete request for the images that were deleted
      for (const src of deleteSrcs) {
        const response = await axiosInstance.post(
          "/vendor/order/deleteImageRevision",
          {
            layoutId,
            oldSrc: src,
          }
        );
        console.log("Image deleted successfully:", response.data);
      }

      // 4. Send the replace images to the server
      for (const { oldSrc, newSrc, file } of replaceImages) {
        if (newSrc == "") continue;

        const formData = new FormData();
        formData.append("photo", file);
        formData.append("layoutId", layoutId);
        formData.append("oldSrc", oldSrc);
        const response = await axiosInstance.post(
          "/vendor/order/changeImageRevision",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        console.log("Image replaced successfully:", response.data);
      }
    } catch (error) {
      console.error("Error uploading files:", error);
    } finally {
      setfetchData((prev) => !prev);
      setOpen(false);
      setSelectedLayout(null);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={() => {
        setOpen(false);
        setSelectedLayout(null);
      }}
      footer={null}
    >
      <h1 className="bg- text-black font-['Gilroy'] text-xl font-normal text-center mb-4">
        Add Revisions
      </h1>
      <div className="flex gap-4 flex-wrap">
        {images.map((imgSrc, index) => (
          <div className="p-2 rounded-xl inline-block bg-[#F3F3F3]">
            <img
              key={index}
              src={replaceImages[index]?.newSrc || imgSrc}
              alt="image"
              className={
                "w-[130px] h-[130px] object-cover rounded-lg bg-primary" +
                (deleteSrcs.includes(imgSrc)
                  ? " filter grayscale opacity-50"
                  : "")
              }
            />
            <div className="flex justify-around mt-2">
              <ReloadOutlined
                className="text-xl"
                onClick={() => handleReplaceImage(imgSrc, index)}
              />

              {deleteSrcs.includes(imgSrc) ? (
                <CloseOutlined
                  className="text-xl"
                  onClick={() => {
                    setDeleteSrcs((prev) =>
                      prev.filter((src) => src !== imgSrc)
                    );
                  }}
                />
              ) : (
                <DeleteFilled
                  className="text-xl"
                  onClick={() => {
                    setDeleteSrcs((prev) => [...prev, imgSrc]);
                  }}
                />
              )}
            </div>
          </div>
        ))}
        {
          // Display the new images that were added
          newImages.map((imgSrc, index) => (
            <div className="p-2 rounded-xl inline-block bg-[#F3F3F3] border-[1px] border-[#F74F09]">
              <img
                key={index}
                src={imgSrc}
                alt="image"
                className="w-[130px] h-[130px] object-cover rounded-lg bg-primary"
              />
              <div className="flex justify-around mt-2">
                <CloseOutlined
                  className="text-xl"
                  onClick={() => {
                    setNewImages((prev) =>
                      prev.filter((src) => src !== imgSrc)
                    );
                    setNewFiles((prev) =>
                      prev.filter((file) => file.name !== imgSrc)
                    );
                  }}
                />
              </div>
            </div>
          ))
        }
        {/* Add New image div after all images */}
        <div
          className="w-[145px] h-[175px] rounded-xl bg-[#F3F3F3] flex justify-center items-center cursor-pointer"
          onClick={handleAddImages}
        >
          <BackupIcon />
        </div>
      </div>

      {/* make a line div separtor here */}
      <div className="w-full h-[0.5px] bg-[#DCDCDC] my-2 mt-4"></div>

      <div className="flex">
        <textarea
          placeholder="We'll make it perfect for you...."
          name=""
          id=""
          value={revision}
          onChange={(e) => setRevision(e.target.value)}
          className="bg-[#F2F2F2] w-full mt-3 rounded-full p-2 text-black"
        />
      </div>
      <div className="flex justify-end items-center">
        <Button
          className="mt-3 mx-2 h-[30px] rounded-full
            text-black border-[1px] border-black 
          "
          onClick={() => {
            setOpen(false);
            setSelectedLayout(null);
          }}
        >
          Close
        </Button>
        <Button
          className="mt-3 mx-2 h-[30px] rounded-full
            bg-primary text-white
          "
          onClick={handleSubmit}
        >
          Save
        </Button>
      </div>
    </Modal>
  );
};

const DraggableCarousel = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragStart, setDragStart] = useState(null); // Tracks where the drag starts
  const [dragDistance, setDragDistance] = useState(0); // Tracks the distance dragged

  const carouselRef = useRef(null);

  const handleDragStart = (e) => {
    setDragStart(e.clientX || e.touches[0].clientX); // Capture starting point of the drag
  };

  const handleDragMove = (e) => {
    const clientX = e.clientX || e.touches[0].clientX;
    if (dragStart !== null) {
      setDragDistance(clientX - dragStart); // Update drag distance based on movement
    }
  };

  const handleDragEnd = () => {
    if (dragDistance > 100) {
      // Swipe right
      setCurrentIndex((prevIndex) =>
        prevIndex === 0 ? images.length - 1 : prevIndex - 1
      );
    } else if (dragDistance < -100) {
      // Swipe left
      setCurrentIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }
    // Reset drag state
    setDragDistance(0);
    setDragStart(null);
  };

  return (
    <div className="relative w-full h-[400px] flex items-center justify-center">
      {/* Carousel Wrapper */}
      <div
        className="relative w-[80%] h-full overflow-hidden flex items-center cursor-grab active:cursor-grabbing"
        ref={carouselRef}
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
      >
        {/* Images */}
        <div
          className="flex transition-transform ease-in-out duration-500"
          style={{
            transform: `translateX(calc(-${
              currentIndex * 100
            }% + ${dragDistance}px))`,
          }}
        >
          {images.map((image, index) => (
            <div
              key={index}
              className={
                "relative rounded-lg w-full flex-none h-[400px] transition-transform duration-500 ease-in-out"
              }
            >
              <img
                src={image}
                alt={`Slide ${index}`}
                className="object-cover w-full h-full rounded-lg"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Show previous image partially */}
      <div className="absolute left-0 transform translate-x-[30%] z-10">
        <div className="relative w-[20px] h-[400px] rounded-lg">
          <img
            src={
              images[currentIndex === 0 ? images.length - 1 : currentIndex - 1]
            }
            alt="Previous"
            className="object-cover w-full h-full opacity-70 rounded-lg"
          />
        </div>
      </div>

      {/* Show next image partially */}
      <div className="absolute right-0 transform -translate-x-[30%] z-10">
        <div className="relative w-[20px] h-[400px] rounded-lg">
          <img
            src={images[(currentIndex + 1) % images.length]}
            alt="Next"
            className="object-cover w-full h-full opacity-70 rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};

import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import { Logo } from "./UserImage";

function CenterMode({ images, setIndex, handleImageDivClick }) {
  const settings = {
    className: "center",
    centerMode: true,
    infinite: true,
    centerPadding: "0px",
    slidesToShow: 3,
    speed: 500,
    focusOnSelect: true,
    afterChange: (index) => {
      setIndex(index);
      console.log(index);
    },
  };
  return (
    <div className="slider-container max-w-[45vh] md:max-w-[100vh] min-w-[45vh]">
      <Slider {...settings}>
        {images.map((layout, index) => (
          <div
            key={index}
            className="slide rounded-xl bg-gray-100"
            onClick={() => handleImageDivClick(layout)}
          >
            <img
              src={layout?.image?.mediaLink}
              alt="image"
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
        ))}
      </Slider>
    </div>
  );
}

const NotSelectedIcon = () => {
  return (
    <svg
      width="31"
      height="31"
      viewBox="0 0 31 31"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="Group 14233">
        <path
          id="change_circle"
          d="M15.8366 23.8131L18.8463 20.8106L15.8366 17.8081L15.0528 18.5919L16.7812 20.3203C15.8133 20.3251 14.9531 20.2112 14.2006 19.9787C13.4483 19.7464 12.8454 19.4035 12.3919 18.95C11.9271 18.4852 11.5773 17.958 11.3425 17.3684C11.1077 16.7786 10.9903 16.1888 10.9903 15.599C10.9903 15.2449 11.0292 14.8907 11.1069 14.5365C11.1846 14.1824 11.2988 13.8466 11.4494 13.5294L10.6034 12.7794C10.3614 13.22 10.181 13.6765 10.0625 14.149C9.94396 14.6215 9.88469 15.1025 9.88469 15.5919C9.88469 16.3346 10.0289 17.0675 10.3172 17.7906C10.6057 18.5139 11.0321 19.1616 11.5962 19.7337C12.1602 20.3058 12.9014 20.7309 13.8197 21.009C14.738 21.287 15.6811 21.4283 16.6491 21.4331L15.0528 23.0294L15.8366 23.8131ZM20.9206 18.4044C21.1627 17.9637 21.343 17.5072 21.4616 17.0347C21.5801 16.5622 21.6394 16.0812 21.6394 15.5919C21.6394 14.8516 21.4964 14.1163 21.2103 13.3859C20.9243 12.6555 20.4952 12.0078 19.9231 11.4428C19.3671 10.8707 18.6271 10.4469 17.7031 10.1712C16.7794 9.89561 15.8367 9.7578 14.875 9.7578L16.4712 8.15436L15.6875 7.37061L12.6778 10.3731L15.6875 13.3756L16.4712 12.5919L14.7356 10.8562C15.6988 10.8562 16.5601 10.9736 17.3197 11.2084C18.0793 11.4432 18.6858 11.788 19.1394 12.2428C19.5927 12.6974 19.9384 13.2202 20.1766 13.8112C20.4147 14.4025 20.5338 14.9936 20.5338 15.5847C20.5338 15.9388 20.4949 16.293 20.4172 16.6472C20.3395 17.0013 20.2252 17.3371 20.0744 17.6544L20.9206 18.4044ZM15.7541 26.8419C14.1984 26.8419 12.7358 26.5467 11.3663 25.9562C9.99687 25.3658 8.80562 24.5646 7.7925 23.5525C6.77938 22.5404 5.9774 21.3502 5.38656 19.9819C4.79552 18.6137 4.5 17.1518 4.5 15.5959C4.5 14.0403 4.79521 12.5777 5.38562 11.2081C5.97604 9.83873 6.77729 8.64748 7.78938 7.63436C8.80146 6.62123 9.99167 5.81925 11.36 5.22842C12.7281 4.63738 14.1901 4.34186 15.7459 4.34186C17.3016 4.34186 18.7642 4.63707 20.1338 5.22748C21.5031 5.8179 22.6944 6.61915 23.7075 7.63123C24.7206 8.64332 25.5226 9.83353 26.1134 11.2019C26.7045 12.57 27 14.032 27 15.5878C27 17.1434 26.7048 18.606 26.1144 19.9756C25.524 21.345 24.7227 22.5362 23.7106 23.5494C22.6985 24.5625 21.5083 25.3645 20.14 25.9553C18.7719 26.5463 17.3099 26.8419 15.7541 26.8419Z"
          fill="#4E4E4E"
        />
      </g>
    </svg>
  );
};
const SelectedIcon = () => {
  return (
    <svg
      width="31"
      height="31"
      viewBox="0 0 31 31"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="verified">
        <mask
          id="mask0_731_2267"
          style={{ maskType: "alpha" }}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="31"
          height="31"
        >
          <rect
            id="Bounding box"
            x="0.5"
            y="0.341858"
            width="30"
            height="30"
            fill="#D9D9D9"
          />
        </mask>
        <g mask="url(#mask0_731_2267)">
          <path
            id="verified_2"
            d="M11.7786 26.8803L9.69199 23.3613L5.72105 22.5053L6.11043 18.4091L3.43262 15.3419L6.11043 12.2747L5.72105 8.17847L9.69199 7.32253L11.7786 3.80347L15.4998 5.37565L19.2211 3.80347L21.3076 7.32253L25.2786 8.17847L24.8892 12.2747L27.567 15.3419L24.8892 18.4091L25.2786 22.5053L21.3076 23.3613L19.2211 26.8803L15.4998 25.3082L11.7786 26.8803ZM14.1873 18.9141L20.3845 12.7169L19.4998 11.8178L14.1873 17.1303L11.4998 14.4572L10.6151 15.3419L14.1873 18.9141Z"
            fill="#F74F09"
          />
        </g>
      </g>
    </svg>
  );
};
const BackupIcon = () => (
  <svg
    width="50"
    height="50"
    viewBox="0 0 25 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g id="backup">
      <mask
        id="mask0_867_2993"
        style={{ maskType: "alpha" }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="25"
        height="24"
      >
        <rect id="Bounding box" x="0.5" width="24" height="24" fill="#D9D9D9" />
      </mask>
      <g mask="url(#mask0_867_2993)">
        <path
          id="backup_2"
          d="M11.5 20H7C5.48333 20 4.1875 19.475 3.1125 18.425C2.0375 17.375 1.5 16.0917 1.5 14.575C1.5 13.275 1.89167 12.1167 2.675 11.1C3.45833 10.0833 4.48333 9.43333 5.75 9.15C6.16667 7.61667 7 6.375 8.25 5.425C9.5 4.475 10.9167 4 12.5 4C14.45 4 16.1042 4.67917 17.4625 6.0375C18.8208 7.39583 19.5 9.05 19.5 11C20.65 11.1333 21.6042 11.6292 22.3625 12.4875C23.1208 13.3458 23.5 14.35 23.5 15.5C23.5 16.75 23.0625 17.8125 22.1875 18.6875C21.3125 19.5625 20.25 20 19 20H13.5V12.85L15.1 14.4L16.5 13L12.5 9L8.5 13L9.9 14.4L11.5 12.85V20Z"
          fill="#C4C4C4"
        />
      </g>
    </g>
  </svg>
);
