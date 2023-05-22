import env from 'dotenv';

const {
  parsed: { ACCESS_CODE_PAYMENT_LINK, ACCESS_CODE },
} = env.config();

export default {
  accessCodePaymentLink: ACCESS_CODE_PAYMENT_LINK,
  accessCode: ACCESS_CODE,
};
