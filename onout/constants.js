const dotenv = require('dotenv')

const {
  parsed: { ACCESS_CODE_PAYMENT_LINK, ACCESS_CODE },
} = dotenv.config();

module.exports = {
  accessCodePaymentLink: ACCESS_CODE_PAYMENT_LINK,
  accessCode: ACCESS_CODE,
}
