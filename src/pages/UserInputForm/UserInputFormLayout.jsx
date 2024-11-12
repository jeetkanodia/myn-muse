import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { BarLoader } from "react-spinners";

const UserInputFormLayout = () => {
  const styles = {
    primaryColor: "#1E1E1E",
    secondaryColor: "#FFFFFF",
    tertiaryColor: "#FFE72E",
    primaryFont: "Montas",
    secondaryFont: "Gilroy",
    theme: 3,
  };

  // Function to check if the color is light
  function isColorLight(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
  }

  useEffect(() => {
    // Determine textColor based on the theme
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

    // Set CSS variables with static values
    document.documentElement.style.setProperty(
      "--primary-color",
      styles.primaryColor
    );
    document.documentElement.style.setProperty(
      "--secondary-color",
      styles.secondaryColor
    );
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
      isColorLight(styles.primaryColor) ? "invert(1)" : "invert(0)"
    );
  }, []);

  return (
    <div>
      <Outlet />
    </div>
  );
};

export default UserInputFormLayout;
