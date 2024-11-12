import { StarFilled, StarOutlined } from "@ant-design/icons";
import { message } from "antd";
import imageCompression from "browser-image-compression";
import { useEffect, useRef, useState } from "react";
import axiosInstance from "../../services/axios";

const ImageUploader = ({
  setFlagArray,
  flagIndex,
  flagArray,
  setAllowOrderTracking,
  setSetImageCounts,
  index,
  setName,
  orderId,
  serverImages,
  setDetails,
  setRecall,
}) => {
  console.log(setDetails);
  const [images, setImages] = useState([
    { mediaLink: "", isUploaded: false, isFavorite: false, id: "" },
  ]);

  const [uploaded, setUploaded] = useState(false);
  const [viewAll, setViewAll] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [files, setFiles] = useState([{}]);
  const [countFavorite, setCountFavorite] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [timer, setTimer] = useState(0);
  const fileInputRef = useRef(null);
  const [stopFlag, setStopFlag] = useState(false);

  const stopFlagRef = useRef(stopFlag);

  useEffect(() => {
    setSetImageCounts((prev) =>
      prev.map((item, i) => (i === index ? images.length : item))
    );
  }, [files]);

  useEffect(() => {
    stopFlagRef.current = stopFlag;
  }, [stopFlag]);

  useEffect(() => {
    if (isUploading) {
      setAllowOrderTracking(false);
    }
  }, [isUploading]);

  const handleSetImages = (img) => {
    let arr = [];
    img.map((item) => {
      if (item.setName === setName) {
        for (let i = 0; i < item.image.length; i++) {
          arr.push({
            mediaLink: item.image[i].mediaLink,
            isUploaded: true,
            isFavorite: item.image[i].favourite,
            id: item.image[i]._id,
          });
          if (item.image[i].favourite) {
            setCountFavorite((prev) => prev + 1);
          }
        }
      }
    });
    setImages(arr);
    setFiles(arr);
    if (arr.length < 1) return;
    setUploaded(true);
  };

  useEffect(() => {
    if (serverImages) {
      handleSetImages(serverImages);
    }
  }, []);

  const resizeAndAppendImage = async (file, ratio = 1) => {
    const options = {
      maxSizeMB: ratio,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };
    console.log("originalFile instanceof Blob", file instanceof Blob); // true
    console.log(`originalFile size ${file.size / 1024 / 1024} MB`);

    try {
      const compressedFile = await imageCompression(file, options);
      console.log(
        "compressedFile instanceof Blob",
        compressedFile instanceof Blob
      ); // true
      console.log(
        `compressedFile size ${compressedFile.size / 1024 / 1024} MB`
      ); // smaller than maxSizeMB

      return { blob: compressedFile };
    } catch (error) {
      console.log(error);
    }
  };

  const uploadImage = async (file, isFavorite) => {
    const resizedBlob = await resizeAndAppendImage(file);
    const resizedThumbnailBlob = await resizeAndAppendImage(file, 0.1);
    const resizedImage = new File([resizedBlob.blob], file.name, {
      type: file.type,
    });
    const resizedThumbnail = new File(
      [resizedThumbnailBlob.blob],
      "thumbnail",
      {
        type: file.type,
      }
    );
    const formData = new FormData();
    formData.append("photo", resizedImage);
    //formData.append("photo", resizedThumbnail);
    formData.append("order_id", orderId);
    formData.append("setName", setName);
    formData.append("isFavaurite", isFavorite);

    try {
      const res = await axiosInstance.post(
        "/vendor/order/uploadImage",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      handleSetImages(res.data.userInputForm.images);
    } catch (err) {
      console.log(err);
    }
  };

  const apiUpload = async () => {
    setViewAll(false);
    setIsUploading(true);
    setFlagArray((prev) =>
      prev.map((item, i) => (i === flagIndex ? true : item))
    );
    let count = 0;
    for (let i = 0; i < files.length; i++) {
      if (!files[i].isUploaded) count++;
    }
    let progress = 0;
    for (let i = 0; i < files.length; i++) {
      if (files[i].isUploaded) continue;
      await uploadImage(files[i].file, files[i].isFavorite);
      progress++;
      // convert to int
      setProgress(Math.round((progress / count) * 100));
      // setProgress((progress / count) * 100);
      setFiles((prevFiles) =>
        prevFiles.map((file, index) =>
          index === i ? { ...file, isUploaded: true } : file
        )
      );
      setImages((prevImages) =>
        prevImages.map((image, index) =>
          index === i ? { ...image, isUploaded: true } : image
        )
      );
    }
    setProgress(0);
    setIsUploading(false);
    setFlagArray((prev) =>
      prev.map((item, i) => (i === flagIndex ? false : item))
    );
  };

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      setFiles((prevFiles) => [
        ...prevFiles,
        { file: file, isUploaded: false, isFavorite: false, id: "" },
      ]);
    }

    let arr = [];
    files.map((file) => {
      arr.push({
        mediaLink: URL.createObjectURL(file),
        isUploaded: false,
        isFavorite: false,
      });
    });

    // append the new images to the existing images
    setImages((prevImages) => [...prevImages, ...arr]);
    setViewAll(true);
    setUploaded(true);
  };

  const handleDivClick = () => {
    fileInputRef.current.click();
    if (images.length > 0) setViewAll(true);
  };

  const handleTimeOutUpload = () => {
    let count = 0;
    for (let i = 0; i < files.length; i++) {
      if (!files[i].isUploaded) count++;
    }
    if (count === 0) return;

    setTimer(5);
    let seconds = 0;
    const intervalId = setInterval(() => {
      seconds++;
      setTimer((prev) => prev - 1);
      if (stopFlagRef.current) {
        clearInterval(intervalId);
        setTimer(0);
        setStopFlag(false);
        setRecall((prev) => !prev);
        return;
      }
      if (seconds >= 5) {
        clearInterval(intervalId);
        setTimer(0);
        apiUpload();
      }
    }, 1000);
  };

  const handleFavPop = () => {
    setIsFavorite(true);
  };

  const handleViewAll = () => {
    if (countFavorite == 0) {
      message.error("Please select atleast one image as favorite");
      return;
    }
    if (viewAll) {
      handleTimeOutUpload();
    }

    setViewAll(!viewAll);
  };

  const handleImageDelete = (index) => {
    if (images.length <= 1) {
      setViewAll(false);
      setUploaded(false);
    }
    if (images[index].isUploaded === true) {
      // call api to delete image
      axiosInstance
        .post("/vendor/order/deleteImage", {
          order_id: orderId,
          setName: setName,
          image_id: images[index].id,
        })
        .then((res) => {})
        .catch((err) => console.log(err));
    }

    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const toggleFavorite = (index) => {
    if (images[index].isFavorite === true) setCountFavorite((prev) => prev - 1);
    else setCountFavorite((prev) => prev + 1);
    if (images[index].isUploaded === true) {
      axiosInstance
        .post("/vendor/order/userFormImages/setUnsetFavourite", {
          order_id: orderId,
          setName: setName,
          image_id: images[index].id,
        })
        .then((res) => {
          console.log(res.data);
        })
        .catch((err) => console.log(err));
    }
    setImages((prevImages) =>
      prevImages.map((image, i) =>
        i === index ? { ...image, isFavorite: !image.isFavorite } : image
      )
    );
    setFiles((prevFiles) =>
      prevFiles.map((file, i) =>
        i === index ? { ...file, isFavorite: !file.isFavorite } : file
      )
    );
  };

  const handlePropogation = (event) => {
    event.stopPropagation();
  };

  const handleStopTimer = () => {
    setStopFlag(true);
  };

  return (
    <div className="rounded-[10px] border border-primary overflow-hidden gilory self-end">
      <div
        onClick={!uploaded && handleDivClick}
        className={`md:px-[40px] px-[20px] md:py-[24px] py-[14px] bg-[#F5F5F5] cursor-pointer shadow-md text-center md:w-[340px] md:min-h-[230px] w-[300px] flex flex-col justify-start items-start md:gap-[12px] gap-[6px]`}
      >
        <span className="w-full flex ">
          {setDetails ? (
            <>
              <img
                src={setDetails.image.mediaLink}
                alt="seticon"
                className="w-[36px] h-[36px] md:w-[52px] md:h-[52px] rounded-full object-cover"
              />
            </>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="52"
              height="52"
              viewBox="0 0 52 52"
              fill="none"
            >
              <mask
                id="mask0_216_4285"
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width="52"
                height="52"
              >
                <rect width="52" height="52" fill="#5750FB" />
              </mask>
              <g mask="url(#mask0_216_4285)">
                <path
                  d="M13.4252 37.8831C15.2669 36.5582 17.221 35.5104 19.2877 34.7398C21.3543 33.9688 23.5918 33.5833 26 33.5833C28.4083 33.5833 30.6457 33.9688 32.7123 34.7398C34.779 35.5104 36.7331 36.5582 38.5748 37.8831C40.0055 36.4025 41.1562 34.654 42.0268 32.6376C42.8978 30.6208 43.3333 28.4083 43.3333 26C43.3333 21.1972 41.6451 17.1076 38.2688 13.7313C34.8924 10.3549 30.8028 8.66667 26 8.66667C21.1972 8.66667 17.1076 10.3549 13.7313 13.7313C10.3549 17.1076 8.66667 21.1972 8.66667 26C8.66667 28.4083 9.10217 30.6208 9.97317 32.6376C10.8438 34.654 11.9945 36.4025 13.4252 37.8831ZM26 27.0833C24.1749 27.0833 22.6353 26.4563 21.3812 25.2021C20.1271 23.948 19.5 22.4084 19.5 20.5833C19.5 18.7583 20.1271 17.2187 21.3812 15.9645C22.6353 14.7104 24.1749 14.0833 26 14.0833C27.8251 14.0833 29.3647 14.7104 30.6188 15.9645C31.8729 17.2187 32.5 18.7583 32.5 20.5833C32.5 22.4084 31.8729 23.948 30.6188 25.2021C29.3647 26.4563 27.8251 27.0833 26 27.0833ZM26 45.5C23.2805 45.5 20.7346 44.9937 18.3625 43.9812C15.9904 42.9686 13.9264 41.5847 12.1707 39.8293C10.4153 38.0736 9.03139 36.0096 8.01883 33.6375C7.00628 31.2654 6.5 28.7195 6.5 26C6.5 23.2805 7.00628 20.7346 8.01883 18.3625C9.03139 15.9904 10.4153 13.9264 12.1707 12.1707C13.9264 10.4153 15.9904 9.03139 18.3625 8.01883C20.7346 7.00628 23.2805 6.5 26 6.5C28.7195 6.5 31.2654 7.00628 33.6375 8.01883C36.0096 9.03139 38.0736 10.4153 39.8293 12.1707C41.5847 13.9264 42.9686 15.9904 43.9812 18.3625C44.9937 20.7346 45.5 23.2805 45.5 26C45.5 28.7195 44.9937 31.2654 43.9812 33.6375C42.9686 36.0096 41.5847 38.0736 39.8293 39.8293C38.0736 41.5847 36.0096 42.9686 33.6375 43.9812C31.2654 44.9937 28.7195 45.5 26 45.5Z"
                  fill="#5750FB"
                />
              </g>
            </svg>
          )}
        </span>
        <h2 className="md:text-[24px] text-[14px] text-[#1A1A1A] font-medium text-left font-['Gilroy']">
          {setName ? setName : "SETNAME"} Images
        </h2>
        <p className="text-[#8D8D8D] md:text-[16px] text-[12px] text-start font-['Gilroy']">
          Upload images about {setDetails?.description}
        </p>

        <p className="md:text-[16px] font-medium text-[12px] text-[#1A1A1A] text-start font-['Gilroy']">
          {images.length === 0 ? (
            `Select ${setDetails?.range?.lowerLimit} to ${setDetails?.range?.upperLimit} images`
          ) : (
            <span className="flex items-center gap-[6px] font-['Gilroy']">
              {images.length >= setDetails?.range?.lowerLimit
                ? images.length + " Images uploaded"
                : images.length +
                  "/" +
                  setDetails?.range?.lowerLimit +
                  " Images uploaded"}
              <span>
                <svg
                  className="text-[#F74F09]"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="#F74F09"
                >
                  <mask
                    id="mask0_841_3595"
                    maskUnits="userSpaceOnUse"
                    x="0"
                    y="0"
                    width="16"
                    height="16"
                  >
                    <rect width="16" height="16" fill="#D9D9D9" />
                  </mask>
                  <g mask="url(#mask0_841_3595)">
                    <path
                      d="M7.041 10.6052L11.3052 6.341L10.8333 5.86917L7.041 9.6615L5.141 7.7615L4.66917 8.23333L7.041 10.6052ZM8.00217 14C7.1725 14 6.39244 13.8426 5.662 13.5277C4.93167 13.2128 4.29633 12.7854 3.756 12.2457C3.21567 11.7059 2.78794 11.0711 2.47283 10.3413C2.15761 9.61167 2 8.83194 2 8.00217C2 7.1725 2.15744 6.39244 2.47233 5.662C2.78722 4.93167 3.21456 4.29633 3.75433 3.756C4.29411 3.21567 4.92889 2.78794 5.65867 2.47283C6.38833 2.15761 7.16806 2 7.99783 2C8.8275 2 9.60756 2.15744 10.338 2.47233C11.0683 2.78722 11.7037 3.21456 12.244 3.75433C12.7843 4.29411 13.2121 4.92889 13.5272 5.65867C13.8424 6.38833 14 7.16806 14 7.99783C14 8.8275 13.8426 9.60756 13.5277 10.338C13.2128 11.0683 12.7854 11.7037 12.2457 12.244C11.7059 12.7843 11.0711 13.2121 10.3413 13.5272C9.61167 13.8424 8.83194 14 8.00217 14Z"
                      fill="#F74F09"
                    />
                  </g>
                </svg>
              </span>
            </span>
          )}
        </p>
      </div>

      {timer > 0 ? (
        <div className="bg-primary p-5 h-[70px] rounded-b-lg flex justify-center items-center relative">
          <div
            className="absolute top-0 left-0 h-full"
            style={{
              width: `${(5 - timer) * 20}%`,
              background: "#F3F3F378",
              transition: "1s",
            }}
          />
          <div className="flex justify-between w-full">
            <h1 className="text-secondary font-semibold">
              Saving Images in {timer} sec
            </h1>
            <span className="cursor-pointer" onClick={handleStopTimer}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="30"
                height="30"
                viewBox="0 0 30 30"
                fill="none"
              >
                <mask
                  id="mask0_863_3711"
                  maskUnits="userSpaceOnUse"
                  x="0"
                  y="0"
                  width="30"
                  height="30"
                >
                  <rect width="30" height="30" fill="white" />
                </mask>
                <g mask="url(#mask0_863_3711)">
                  <path
                    d="M10.5 20.3847L15 15.8847L19.5 20.3847L20.3847 19.5L15.8847 15L20.3847 10.5L19.5 9.61531L15 14.1153L10.5 9.61531L9.61531 10.5L14.1153 15L9.61531 19.5L10.5 20.3847ZM15.0041 26.25C13.4484 26.25 11.9858 25.9548 10.6163 25.3644C9.24687 24.774 8.05562 23.9727 7.0425 22.9606C6.02938 21.9485 5.2274 20.7583 4.63656 19.39C4.04552 18.0219 3.75 16.5599 3.75 15.0041C3.75 13.4484 4.04521 11.9858 4.63562 10.6162C5.22604 9.24687 6.02729 8.05562 7.03938 7.0425C8.05146 6.02937 9.24167 5.2274 10.61 4.63656C11.9781 4.04552 13.4401 3.75 14.9959 3.75C16.5516 3.75 18.0142 4.04521 19.3838 4.63563C20.7531 5.22604 21.9444 6.02729 22.9575 7.03938C23.9706 8.05146 24.7726 9.24167 25.3634 10.61C25.9545 11.9781 26.25 13.4401 26.25 14.9959C26.25 16.5516 25.9548 18.0142 25.3644 19.3837C24.774 20.7531 23.9727 21.9444 22.9606 22.9575C21.9485 23.9706 20.7583 24.7726 19.39 25.3634C18.0219 25.9545 16.5599 26.25 15.0041 26.25Z"
                    fill="white"
                  />
                </g>
              </svg>
            </span>
          </div>
        </div>
      ) : isUploading ? (
        <div className="bg-primary p-5 h-[70px] rounded-b-lg flex justify-center items-center relative">
          <div
            className="absolute top-0 left-0 h-full"
            style={{
              width: `${(5 - timer) * 20}%`,
              background: "#F3F3F378",
              transition: "1s",
            }}
          />
          <h1 className="text-secondary font-semibold flex justify-between w-full">
            <div className="mr-auto">Images being Uploaded</div>{" "}
            <div className="ml-auto">{progress}%</div>
          </h1>
        </div>
      ) : (
        <div className="bg-primary md:px-[30px] px-[20px] py-[14px] h-[70px] rounded-b-lg cursor-pointer flex justify-center items-center">
          {uploaded ? (
            <div className="flex justify-between w-full items-center">
              <div className="flex justify-between w-[194px]">
                {images.slice(0, 3).map((image, index) => (
                  <div
                    key={index}
                    className="w-[55px] h-[50px] rounded-md overflow-hidden"
                  >
                    <img
                      src={image.mediaLink}
                      alt={`upload-${index}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>

              <span
                className="text-secondary text-[12px] font-medium opacity-50 underline"
                onClick={handleViewAll}
              >
                View all
              </span>
            </div>
          ) : (
            <div
              className="flex justify-between items-center w-full h-full"
              onClick={handleDivClick}
            >
              <div>
                <h1 className="text-[14px] md:text-[16px] font-['Gilroy'] text-white font-semibold">
                  Upload Images
                </h1>
                <p className="font-['Gilroy'] text-white text-[12px] md:text-[14px] opacity-50">
                  (Png, Jpg, Heic)
                </p>
              </div>

              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="41"
                  viewBox="0 0 40 41"
                  fill="none"
                >
                  <mask
                    id="mask0_216_4298"
                    maskUnits="userSpaceOnUse"
                    x="0"
                    y="0"
                    width="40"
                    height="41"
                  >
                    <rect y="0.5" width="40" height="40" fill="#D9D9D9" />
                  </mask>
                  <g mask="url(#mask0_216_4298)">
                    <path
                      d="M5 32.1668V8.8335H15.9937L19.3271 12.1668H35V32.1668H5ZM19.1667 27.5514H20.8333V19.7181L24.3654 23.2502L25.545 22.0706L20 16.526L14.5192 22.0064L15.6987 23.186L19.1667 19.7181V27.5514Z"
                      fill="white"
                    />
                  </g>
                </svg>
              </span>
            </div>
          )}
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageUpload}
        ref={fileInputRef}
        className="hidden"
      />

      {viewAll && (
        <div
          className="absolute top-0 w-screen h-full md:pl-[350px] right-0 z-20 bg-opacity-55 bg-black flex justify-center items-center"
          onClick={handleViewAll}
        >
          <div
            className="bg-white flex flex-col gap-[20px] mt-10 md:max-w-[600px] max-w-[336px] min-w-[336px] md:min-w-[600px] max-h-[70vh] min-h-[70vh] overflow-y-auto rounded-[10px] relative"
            onClick={handlePropogation}
          >
            {isFavorite && countFavorite == 0 ? (
              <div className="w-[80%] mx-[5px] h-fit bg-[#FFFFFF] rounded-[10px] text-center md:py-[14px] py-[12px] md:text-[16px] text-[12px] text-[#F3A107] font-semibold absolute md:top-[-75px] top-[-55px]"></div>
            ) : null}
            <h1 className="w-full text-center text-white font-['Gilroy'] md:text-[20px] text-[14px] bg-primary py-[24px] font-light sticky ">
              <span className="font-['Gilroy'] font-light">
                Mark your favorite images
              </span>
            </h1>
            <div className="flex md:gap-[20px] gap-[18px] flex-wrap  md:px-[40px] px-[20px] md:py-[24px]">
              {images.map((image, index) => (
                <div
                  onClick={() => toggleFavorite(index)}
                  key={index}
                  className="bg-[#F3F3F3] p-[8px] rounded-[5px] flex flex-col md:gap-[10px] gap-[4px] items-center"
                >
                  <div className="relative md:w-[134px] w-[61px] md:h-[132px] h-[60px] rounded-[5px] overflow-hidden">
                    <img
                      src={image.mediaLink}
                      alt={`upload-${index}`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex md:gap-[18px] gap-[8px]">
                    <span>
                      {image.isFavorite ? (
                        <StarFilled className="text-primary md:text-xl text-sm mt-3 md:mt-2" />
                      ) : (
                        <StarOutlined className="text-primary md:text-xl text-sm mt-3 md:mt-2" />
                      )}
                    </span>
                    <span
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleImageDelete(index);
                      }}
                    >
                      <svg
                        className="md:w-[35px] w-[20px]"
                        xmlns="http://www.w3.org/2000/svg"
                        width="35"
                        height="35"
                        viewBox="0 0 35 35"
                        fill="none"
                      >
                        <mask
                          id="mask0_216_4693"
                          maskUnits="userSpaceOnUse"
                          x="0"
                          y="0"
                          width="35"
                          height="35"
                        >
                          <rect
                            x="0.5"
                            y="0.5"
                            width="34"
                            height="34"
                            fill="#D9D9D9"
                          />
                        </mask>
                        <g mask="url(#mask0_216_4693)">
                          <path
                            d="M14.394 24.5834H15.8107V11.8334H14.394V24.5834ZM19.1887 24.5834H20.6054V11.8334H19.1887V24.5834ZM8.99967 28.8334V9.00009H7.58301V7.58342H13.2497V6.49365H21.7497V7.58342H27.4163V9.00009H25.9997V28.8334H8.99967Z"
                            fill="#C4C4C4"
                          />
                        </g>
                      </svg>
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center items-center sticky bottom-0 left-0 bg-white w-full px-3 pb-5 mt-auto">
              <div className="w-full flex pt-[14px] items-center ">
                <div
                  className="flex gap-[8px] items-center cursor-pointer ml-4 md:ml-7 pb-1 border-t-0 border border-r-0 border-l-0 border-b-[#8D8D8D]"
                  onClick={handleDivClick}
                >
                  <h1 className="text-[12px] md:text-[14px] w-fit gilroy font-normal text-[#8D8D8D]">
                    Upload more Images
                  </h1>
                  <span>
                    <svg
                      className="md:w-[23px] w-[17px]"
                      xmlns="http://www.w3.org/2000/svg"
                      width="23"
                      height="23"
                      viewBox="0 0 23 23"
                      fill="none"
                    >
                      <mask
                        maskUnits="userSpaceOnUse"
                        id="mask0_216_4738"
                        x="0"
                        y="0"
                        width="23"
                        height="23"
                      >
                        <rect
                          x="0.5"
                          y="0.5"
                          width="22"
                          height="22"
                          fill="#D9D9D9"
                        />
                      </mask>
                      <g mask="url(#mask0_216_4738)">
                        <path
                          d="M3.25 17.9168V5.0835H9.29656L11.1299 6.91683H19.75V17.9168H3.25ZM11.0417 15.3784H11.9583V11.07L13.901 13.0127L14.5498 12.3639L11.5 9.31437L8.48554 12.3286L9.13431 12.9774L11.0417 11.07V15.3784Z"
                          fill="#8D8D8D"
                        />
                      </g>
                    </svg>
                  </span>
                </div>
              </div>
              <div className="pt-[14px] ml-6">
                <div
                  onClick={
                    countFavorite > 0
                      ? () => apiUpload()
                      : () => {
                          message.error("Select atleast one favorite image");
                          handleFavPop();
                        }
                  }
                  type="primary"
                  className="md:py-[10px] py-[6px] md:px-[30px] cursor-pointer px-[12px] bg-primary rounded-lg md:text-[16px] text-[14px] text-secondary font-medium"
                >
                  Save
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
