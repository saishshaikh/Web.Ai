import razorpay from "../Config/razorpay.js";
import { PLANS } from "../Config/plan.js";

import User from "../models/User.js";
export const billing = async (req, res) => {
  try {
    const { planType } = req.body;
    const plan = PLANS[planType];

    if (!plan || plan.price <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid paid plan",
      });
    }

    const order = await razorpay.orders.create({
      amount: plan.price * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: { plan: planType },
    });

    return res.status(200).json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID,
      order,
      plan,
    });
  } catch (error) {
    console.error("Billing Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Payment verify karne ke liye (Naya function)

export const verifyPayment = async (req, res) => {
  try {
    const { paymentId, orderId, signature, planType } = req.body;
    
    // 1. Signature verify karein (Safety ke liye)
    // 2. Database mein User dhundein
    const user = await User.findById(req.user.id); 
    if (!user) return res.status(404).json({ message: "User not found" });

    // 3. User ka plan update karein
    user.plan = planType; 
    user.isPremium = true; 
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Plan upgraded successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};