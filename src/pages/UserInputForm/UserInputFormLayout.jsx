import React, { useEffect, useState } from "react";
import { Outlet, useParams } from "react-router-dom";
import axiosInstance from "../../services/axios";
import { BarLoader } from "react-spinners";

const UserInputFormLayout = () => {
  const { orderId: id } = useParams();
  const [loading, setLoading] = useState(true);
  const [vendorId, setVendorId] = useState(null);

  const [OrderDetails, setOrderDetails] = useState(null);
  const [vendorData, setVendorData] = useState(null);
  const [styles, setStyles] = useState({
    primaryColor: "#FFE72E",
    secondaryColor: "#1A1A1A",
    tertiaryColor: "#FFFFFF",
    primaryFont: "Montas",
    secondaryFont: "Gilroy",
    theme: 3,
    Hero: 1,
    Cards: 1,
  });

  function isColorLight(hex) {
    if (hex === "#FFE72E") {
      return true;
    }
    // Convert hex to RGB
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Determine if color is light or dark
    return luminance > 0.5;
  }

  useEffect(() => {
    // Determine textColor based on theme
    const textColor =
      styles.theme === 1 || styles.theme === 2
        ? styles.primaryColor
        : styles.secondaryColor;
    const filledBg =
      styles.theme === 4 ? styles.tertiaryColor : styles.secondaryColor;
    const bgColor =
      styles.theme === 1 || styles.theme === 2
        ? styles.secondaryColor
        : styles.tertiaryColor;

    const mainBg =
      styles.theme === 4 ? styles.secondaryColor : styles.primaryColor;

    // Update CSS variables dynamically
    document.documentElement.style.setProperty("--primary-color", "#1E1E1E");
    document.documentElement.style.setProperty("--secondary-color", "white");
    document.documentElement.style.setProperty(
      "--tertiary-color",
      styles.tertiaryColor
    );
    document.documentElement.style.setProperty(
      "--primary-font",
      styles.primaryFont
    );
    document.documentElement.style.setProperty(
      "--secondary-font",
      styles.secondaryFont
    );
    document.documentElement.style.setProperty("--text-color", textColor);
    document.documentElement.style.setProperty("--filled-color", filledBg);
    document.documentElement.style.setProperty("--bg-color", bgColor);
    document.documentElement.style.setProperty("--main-bg", mainBg);
    document.documentElement.style.setProperty(
      "--is-light",
      isColorLight("#FFFFFF") ? "invert(1)" : "invert(1)"
    );
  }, [styles]);

  useEffect(() => {
    axiosInstance.get("/vendor/getOrder/" + id).then((res) => {
      console.log(res.data?.vendorId?._id);
      console.log(res.data);
      setOrderDetails(res.data);
      setVendorId(res.data?.vendorId?._id);
    });
  }, [id]);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await axiosInstance.get(
          "/getVendorDetailsById/" + vendorId
        );
        setVendorData(res.data?.data);
        console.log(res.data?.data);

        /*
        primaryColor: "#FFE72E",
    secondaryColor: "#1A1A1A",
    tertiaryColor: "#FFFFFF",
    primaryFont: "Montas",
    secondaryFont: "Gilroy",
    theme: 3, */

        setStyles({
          primaryColor: "#1E1E1E" || "#FFE72E",
          secondaryColor: "#FFF" || "#1A1A1A",
          tertiaryColor: res.data?.data?.color?.tertiary || "#FFFFFF",
          primaryFont: res.data?.data?.font?.primary || "Montas",
          secondaryFont: res.data?.data?.font?.secondary || "Gilroy",
          theme: res.data?.data?.color?.themeName || 3,
        });
        setLoading(false);
      } catch (error) {
        console.error("Something Went Wrong", error);
        setLoading(false);
      }
    };

    if (vendorId) {
      fetchDetails();
    }
  }, [vendorId]);

  if (loading) {
    return (
      <div className="flex  items-center justify-center w-full min-w-[100vh] h-screen min-h-screen bg-[#EAEAEA]">
        <BarLoader height={2} color="#1E1E1E" speedMultiplier={0.75} />
      </div>
    );
  }
  return (
    <div>
      <Outlet />
    </div>
  );
};

export default UserInputFormLayout;
