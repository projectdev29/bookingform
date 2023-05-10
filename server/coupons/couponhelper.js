const { find } = require("../database/mongodbhelper");

const validateCoupon = async (coupon, email) => {
  const couponFromDb = await find({ coupon: coupon }, "Coupons");
  if (!couponFromDb || couponFromDb == null) {
    return {
      error: "Invalid coupon.",
    };
  } else if (couponFromDb.isUsed) {
    return {
      error: "The coupon has already been used.",
    };
  }
  // else if (couponFromDb.email !== email) {
  //   return {
  //     error: "The coupon can only be applied for the assigned email address.",
  //   };
  // }
  // coupon is valid and can be applied
  return { isValid: true, discount: couponFromDb.discount };
};

module.exports = { validateCoupon };
