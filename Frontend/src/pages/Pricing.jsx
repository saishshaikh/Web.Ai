import React, { useState, useMemo } from "react";
import { Check } from "lucide-react";
import axios from "axios";
import { useSelector } from "react-redux";
import { serverUrl } from "../App";

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);
  const { userData } = useSelector((state) => state.user);

  const plans = useMemo(
    () => [
      {
        key: "free",
        name: "Free",
        price: 0,
        description: "Explore GenWeb.ai",
        features: [
          "AI Website Generation",
          "Responsive HTML",
          "Basic Animations",
        ],
        buttonText: "Get Started",
        popular: false,
      },
      {
        key: "pro",
        name: "Pro",
        price: isYearly ? 3990 : 499,
        description: "For serious creators",
        features: [
          "Everything in Free",
          "Faster Generation",
          "Custom Domain",
          "Priority Support",
          "Remove Watermark",
        ],
        buttonText: "Upgrade to Pro",
        popular: true,
      },
      {
        key: "enterprise",
        name: "Enterprise",
        price: isYearly ? 11990 : 1499,
        description: "For agencies",
        features: [
          "Everything in Pro",
          "Unlimited Projects",
          "Team Collaboration",
          "API Access",
        ],
        buttonText: "Upgrade to Enterprise",
        popular: false,
      },
    ],
    [isYearly]
  );

  const handlePayment = async (plan) => {
    if (plan.key === "free") return;

    try {
      // Create Razorpay Order
      const { data } = await axios.post(
        `${serverUrl}/api/billing/create-order`,
        {
          planType: plan.key,
        },
        {
          withCredentials: true,
        }
      );

      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "GenWeb AI",
        description: `${plan.name} Plan`,
        order_id: data.order.id,

        handler: async function (response) {
          try {
            await axios.post(
              `${serverUrl}/api/user/upgrade-plan`,
              {
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
                planType: plan.key,
              },
              {
                withCredentials: true,
              }
            );

            alert("🎉 Payment Successful");
            window.location.reload();
          } catch (err) {
            console.log(err);
            alert("Payment verification failed");
          }
        },

        theme: {
          color: "#4F46E5",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.log(error);
      alert("Unable to start payment");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white py-20 px-6">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-5xl font-bold text-center mb-14">
          Simple, Transparent Pricing
        </h1>

        <div className="grid md:grid-cols-3 gap-8">

          {plans.map((plan) => (
            <div
              key={plan.key}
              className={`rounded-3xl p-8 border ${
                plan.popular
                  ? "border-indigo-500 bg-zinc-900"
                  : "border-zinc-800 bg-zinc-950"
              }`}
            >
              <h2 className="text-2xl font-bold">{plan.name}</h2>

              <div className="mt-5">
                <span className="text-5xl font-bold">
                  ₹{plan.price}
                </span>

                <span className="text-zinc-400"> /month</span>
              </div>

              <p className="text-zinc-400 mt-4">
                {plan.description}
              </p>

              <ul className="mt-8 space-y-4">

                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">

                    <Check
                      size={18}
                      className="text-indigo-500 mr-2"
                    />

                    {feature}

                  </li>
                ))}

              </ul>

              <button
                onClick={() => handlePayment(plan)}
                className={`mt-10 w-full py-4 rounded-xl font-semibold transition ${
                  plan.popular
                    ? "bg-indigo-600 hover:bg-indigo-700"
                    : "bg-white text-black hover:bg-gray-200"
                }`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
};

export default Pricing;