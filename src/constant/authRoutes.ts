const baseRoute = "/auth";
export const authBaseRoute = baseRoute;
const resetPasswordBaseUrl = `${baseRoute}/reset-password`;
const baseRegisterRoute = `${baseRoute}/register`;
export const publicRoute = "lot-detail";

export const authRoutes = {
  index: baseRoute,
  checkMail: `${baseRoute}/check-mail`,
  emailVerification: `${baseRoute}/email-verification`,
  forgotPassword: `${baseRoute}/forgot-password`,
  login: `${baseRoute}/login`,
  otpVerification: `${baseRoute}/otp-verification`,
  register: {
    index: baseRegisterRoute,
    thankYou: `${baseRegisterRoute}/thank-you`,
  },
  resetPassword: {
    index: resetPasswordBaseUrl,
    businessStaff: `${resetPasswordBaseUrl}/business-staff`,
  },
};
