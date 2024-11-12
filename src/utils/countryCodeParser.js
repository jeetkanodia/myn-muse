import parsePhoneNumber from "libphonenumber-js/max";

export default function extractPhoneNumber(phoneNumber) {
  try {
    // console.log(phoneNumber);
    const parsedNumber = parsePhoneNumber(phoneNumber);
    const countryCode = parsedNumber.countryCallingCode;
    const number = parsedNumber.nationalNumber;
    return { countryCode, number };
  } catch (error) {
    // Handle parsing errors
    console.error("Invalid phone number:", error);
    return null;
  }
}
