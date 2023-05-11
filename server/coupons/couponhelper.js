const { find, updateCoupon } = require("../database/mongodbhelper");

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

const markCouponAsUsed = async (coupon) => {
  try {
    const couponFromDb = await find({ coupon: coupon }, "Coupons");
    if (!couponFromDb || couponFromDb == null) {
      return {
        result: "no op",
      };
    } else if (couponFromDb.isUsed) {
      return {
        result: "The coupon has already been used.",
      };
    }
    let updatedCoupon = {
      ...couponFromDb,
      isUsed: true,
    };
    await updateCoupon(updatedCoupon, updatedCoupon._id, "Coupons");
    return { result: "success" };
  } catch (err) {
    console.log("error in marking coupon as used: ");
    console.log(err);
    return {
      result: err,
    };
  }
};

module.exports = { validateCoupon, markCouponAsUsed };
