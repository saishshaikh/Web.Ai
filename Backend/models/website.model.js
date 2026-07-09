import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    role: { 
      type: String, 
      enum: ["ai", "user", "assistant"], 
      required: true 
    },
    content: { 
      type: String, 
      required: true 
    },
  },
  { timestamps: true }
);

const websiteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      default: "Untitled Website",
    },

    latestCode: {
      type: String,
      default: "<html><body><h1>Your Website</h1></body></html>",
    },

    conversation: {
      type: [messageSchema],
      default: [],
    },

    // ✅ डिप्लॉयमेंट फ्लैग्स
    isDeployed: {
      type: Boolean,
      default: false,
    },

    deployed: {
      type: Boolean,
      default: false,
    },

    // ✅ सही फील्ड नाम - deployUrl (deployedUrl नहीं)
    deployUrl: {
      type: String,
      default: null,
    },

    // ✅ स्लग - required: false करें, ताकि क्रिएट हो सके
    slug: {
      type: String,
      unique: true,
      sparse: true, // ✅ यह allow करेगा कि कुछ डॉक्युमेंट्स में slug न हो
    },

    thumbnail: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// ✅ प्री-सेव हुक - स्लग जेनरेट करें
websiteSchema.pre("save", function () {
  if (!this.slug && this.title) {
    this.slug =
      this.title
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .slice(0, 50) +
      this._id.toString().slice(-5);
  }
});

// ✅ मॉडल को एक्सपोर्ट करें
const Website = mongoose.model("Website", websiteSchema);
export default Website;