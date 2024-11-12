import { Link, useParams } from "react-router-dom";
import ImageUploader from "./ImageUploader.jsx";
import { useEffect, useState } from "react";
import axiosInstance from "../../services/axios";
import { Button } from "antd";
import AudioRecorder from "./AudioRecorder.jsx";
import { BarLoader } from "react-spinners";
const UploadImages = ({
  setAllowOrderTracking,
  allowOrderTracking,
  setFlagArray,
  flagArray,
}) => {
  const [loading, setLoading] = useState(true);
  const [setNames, setSetNames] = useState([]);
  const [setDetails, setSetDetails] = useState({});
  const [setImageCounts, setSetImageCounts] = useState([]);
  const [recall, setRecall] = useState(false);
  const [images, setImages] = useState([]);
  const { orderId } = useParams();
  const [limit, setLimit] = useState(0);
  const handleSubmitAll = (setname, images) => {
    console.log("submitting all");
  };

  useEffect(() => {
    setLoading(true);
    axiosInstance
      .get(`/order/viewForm/${orderId}`)
      .then((res) => {
        console.log(res.data);
        console.log("hi");

        let set = new Set();
        let temp = 0;
        for (let i = 0; i < res.data?.setDetails?.length; i++) {
          temp += res.data?.setDetails[i]?.range?.lowerLimit;
        }
        console.log("limi", temp);
        setLimit(temp);
        console.log(res.data?.imageCount);

        if (res.data?.imageCount >= temp) {
          setAllowOrderTracking(true);
        }
        res.data.questions.map((item) => {
          set.add(item.setName);
        });

        let arr = Array.from(set);
        setSetNames(arr);
        // set the size of the flag array to the number of sets

        setFlagArray(new Array(arr.length).fill(false));

        setImages(res.data.images);
        console.log(arr);
        let newArr = new Array(arr.length).fill(0);
        setSetImageCounts(newArr);
        console.log(newArr);
        let obj = {};
        for (let i = 0; i < res.data.setDetails.length; i++) {
          // console.log(res.data.setDetails[i]);
          // obj.push(res.data.setDetails[i].setName, res.data.setDetails[i]);
          obj[res.data.setDetails[i].setName] = res.data.setDetails[i];
        }
        console.log(obj);
        setSetDetails(obj);
        setLoading(false);
      })
      .then((err) => {
        console.log(err);
      });
  }, [recall]);

  useEffect(() => {
    console.log(setImageCounts);
    let sum = 0;
    for (let i = 0; i < setImageCounts.length; i++) {
      sum += setImageCounts[i];
    }
    if (sum >= limit) {
      setAllowOrderTracking(true);
    } else {
      setAllowOrderTracking(false);
    }
  }, [setImageCounts, allowOrderTracking]);

  if (loading) {
    return (
      <div className="flex  items-center justify-center w-full min-w-[100vh] h-screen min-h-screen bg-[#EAEAEA]">
        <BarLoader height={2} color="#1E1E1E" speedMultiplier={0.75} />
      </div>
    );
  }
  return (
    <>
      <div className="w-full md:h-[95vh] flex flex-col md:justify-between items-start gap-[34px] bg-[#EAEAEA]  h-full md:p-[50px] p-[20px] overflow-hidden">
        <div className="flex flex-col md:gap-[40px] gap-[20px] md:max-h-screen overflow-auto scrollbar-hidden h-screen">
          <div className="py-[14px] px-[20px] bg-white md:w-[403px] w-[281px]  gilory rounded-[10px] md:text-[16px] text-[12px] font-medium">
            That was a great conversation. I loved hearing your memories and ho
          </div>
          <div className="flex md:gap-[34px] gap-[20px] flex-wrap w-full">
            {setNames.map((setName, idx) => {
              return (
                <ImageUploader
                  setFlagArray={setFlagArray}
                  flagIndex={idx}
                  flagArray={flagArray}
                  setAllowOrderTracking={setAllowOrderTracking}
                  setSetImageCounts={setSetImageCounts}
                  index={idx}
                  setRecall={setRecall}
                  serverImages={images}
                  key={idx}
                  setName={setName}
                  orderId={orderId}
                  handleSubmitAll={handleSubmitAll}
                  setDetails={setDetails[setName]}
                />
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default UploadImages;
