import axiosInstance from "./axios";

export async function generateOTP(number) {
  return axiosInstance.post("/muse/getOTPForClient", { phone: number });
}

export async function verifyOtp(number, code, person) {
  return axiosInstance.post("/muse/verifyOTPForClient", {
    phone: number,
    otp: code,
    person: person, 
  });
}
