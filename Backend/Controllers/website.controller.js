console.log("✅ LOADED WEBSITE CONTROLLER");
import User from "../models/User.js";
import Website from "../models/website.model.js";
import generateResponse from "../Config/openrouter.js";
import { generateSlug } from "../utils/generateSlug.js";
import mongoose from "mongoose";

const masterPrompt = `
YOU ARE A PRINCIPAL FRONTEND ARCHITECT AND SENIOR UI/UX ENGINEER.
BUILD A HIGH-END, ULTRA-MODERN PORTFOLIO WEBSITE USING HTML, TAILWIND CSS AND JAVASCRIPT BASED ON THE USER REQUIREMENT.

--------------------------------------------------
USER REQUIREMENT:
{USER_PROMPT}
--------------------------------------------------

OUTPUT FORMAT RULES:
1. Return ONLY the complete, production-ready, standalone HTML code.
2. Include the Tailwind CSS CDN script in the <head>.
3. Do NOT wrap the code inside markdown code blocks (DO NOT use \`\`\`html or \`\`\`).
4. Start directly with <!DOCTYPE html> and end with </html>.
5. No explanations, no conversation, no markdown. Just pure HTML code string.
`;

const cleanAiCode = (code) => {
  if (typeof code !== "string") return code;
  
  let cleaned = code.trim();
  
  if (cleaned.includes("```html")) {
    cleaned = cleaned.split("```html")[1].split("```")[0].trim();
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\s*/, "").replace(/```$/, "").trim();
  }

  try {
    cleaned = cleaned.replace(/\\n/g, "\n")
                     .replace(/\\r/g, "\r")
                     .replace(/\\"/g, '"')
                     .replace(/\\'/g, "'")
                     .replace(/\\\\/g, '\\');
  } catch (e) {
    console.error("Error during code string cleaning:", e);
  }

  return cleaned;
};

// ✅ FIXED: CREATE WEBSITE CONTROLLER
export const generateWebsite = async (req, res) => {
  try {
    console.log("📩 Request received at /api/website/generate");
    console.log("📦 Request body:", JSON.stringify(req.body, null, 2));
    console.log("👤 User:", req.user?._id || "No user found");

    // ✅ Multiple field names support
    const prompt = req.body.prompt || req.body.message || req.body.text || req.body.content || req.body.query;
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: "Prompt is required. Please send 'prompt' field in request body.",
        received: req.body,
        expected: { prompt: "your website description" }
      });
    }

    // ✅ Auth check
    if (!req.user?._id) {
      return res.status(401).json({ 
        success: false,
        message: "Unauthorized - Please login first" 
      });
    }

    const initialUserCheck = await User.findById(req.user._id);
    if (!initialUserCheck) {
      return res.status(404).json({ 
        success: false,
        message: "User not found in database" 
      });
    }
    
    if (initialUserCheck.credits <= 0) {
      return res.status(400).json({ 
        success: false,
        message: "Insufficient credits. Please add credits to continue." 
      });
    }

    console.log("🤖 Calling AI with prompt:", prompt.substring(0, 100) + "...");
    
    let rawCode = await generateResponse(masterPrompt.replace("{USER_PROMPT}", prompt));
    rawCode = cleanAiCode(rawCode);

    if (!rawCode) {
      return res.status(500).json({ 
        success: false,
        message: "AI did not return valid website code" 
      });
    }

    let slug = generateSlug(prompt);
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const user = await User.findById(req.user._id).session(session);
      const [website] = await Website.create([{
        user: user._id,
        title: prompt.substring(0, 100),
        latestCode: rawCode,
        slug,
        isDeployed: false,
        deployed: false,
        deployUrl: null,
        conversation: [
          { role: "user", content: prompt },
          { role: "ai", content: "Website generated successfully." },
        ],
      }], { session });

      user.credits = Math.max(0, user.credits - 50);
      await user.save({ session });
      await session.commitTransaction();
      session.endSession();

      console.log("✅ Website generated successfully for user:", user._id);

      return res.status(200).json({
        success: true,
        message: "Website generated successfully",
        websiteId: website._id,
        remainingCredits: user.credits,
        website,
      });
    } catch (dbError) {
      await session.abortTransaction();
      session.endSession();
      console.error("❌ Database error:", dbError);
      throw dbError;
    }
  } catch (error) {
    console.error("❌ Generate website error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Internal Server Error", 
      error: error.message 
    });
  }
};

// ✅ FIXED: UPDATE WEBSITE CONTROLLER
export const updateWebsite = async (req, res) => {
  try {
    const { id } = req.params;
    const prompt = req.body.prompt || req.body.message || req.body.text || req.body.content;
    
    if (!prompt) {
      return res.status(400).json({ 
        success: false,
        message: "Prompt is required" 
      });
    }

    const website = await Website.findById(id);
    if (!website) {
      return res.status(404).json({ 
        success: false,
        message: "Website not found" 
      });
    }

    const updatePrompt = `
YOU ARE A SENIOR UI/UX ENGINEER. YOUR TASK IS TO MODIFY THE EXISTING HTML CODE BASED ON THE USER'S NEW REQUEST.

EXISTING CODE:
${website.latestCode}

USER'S NEW REQUEST:
{USER_PROMPT}

OUTPUT FORMAT RULES:
1. Return ONLY the complete, fully updated standalone HTML code.
2. Do NOT use markdown or backticks (\`\`\`html).
3. Do no talk or give explanations. Start directly with <!DOCTYPE html> and end with </html>.
`;

    let updatedCode = await generateResponse(updatePrompt.replace("{USER_PROMPT}", prompt));
    updatedCode = cleanAiCode(updatedCode);

    if (!updatedCode) {
      return res.status(500).json({ 
        success: false,
        message: "AI did not return valid code updates" 
      });
    }

    website.latestCode = updatedCode;
    if (!website.conversation) website.conversation = [];
    website.conversation.push(
      { role: "user", content: prompt },
      { role: "ai", content: `Website updated successfully according to: "${prompt}"` }
    );

    await website.save();
    
    return res.status(200).json({ 
      success: true,
      message: "Website updated successfully", 
      website 
    });
  } catch (error) {
    console.error("❌ Update website error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Internal Server Error", 
      error: error.message 
    });
  }
};

// GET WEBSITE BY ID
export const getWebsiteById = async (req, res) => {
  try {
    const website = await Website.findById(req.params.id);
    if (!website) {
      return res.status(404).json({ 
        success: false,
        message: "Website not found" 
      });
    }
    
    const response = {
      ...website._doc,
      isDeployed: website.isDeployed || website.deployed || false
    };
    
    return res.status(200).json({
      success: true,
      ...response
    });
  } catch (error) {
    console.error("❌ Get website error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Get Website Error", 
      error: error.message 
    });
  }
};

// GET ALL WEBSITES
export const getAll = async (req, res) => {
  try {
    const websites = await Website.find({ user: req.user._id }).sort({ createdAt: -1 });
    
    const formattedWebsites = websites.map(site => ({
      ...site._doc,
      isDeployed: site.isDeployed || site.deployed || false
    }));
    
    return res.status(200).json({ 
      success: true, 
      websites: formattedWebsites 
    });
  } catch (error) {
    console.error("❌ Get all websites error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to fetch websites", 
      error: error.message 
    });
  }
};

// DEPLOY WEBSITE
export const deploy = async (req, res) => {
  try {
    const { id } = req.params;
    const website = await Website.findById(id);
    if (!website) {
      return res.status(404).json({ 
        success: false,
        message: "Website not found" 
      });
    }

    if (website.isDeployed || website.deployed) {
      return res.status(400).json({ 
        success: false,
        message: "Website already deployed!",
        url: website.deployUrl,
        isDeployed: true
      });
    }

    if (!website.slug) {
      website.slug = website.title.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 60) + website._id.toString().slice(-5);
    }
    
    website.isDeployed = true;
    website.deployed = true;
    
    const frontendBase = process.env.FRONTEND_URL || "http://localhost:5173";
    website.deployUrl = `${frontendBase.replace(/\/$/, "")}/site/${website.slug}`;
    await website.save();

    return res.status(200).json({ 
      success: true,
      message: "Deployed successfully!", 
      url: website.deployUrl,
      isDeployed: true 
    });
  } catch (error) {
    console.error("❌ Deploy error:", error);
    return res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// GET BY SLUG
export const getBySlug = async (req, res) => {
  try {
    const website = await Website.findOne({ slug: req.params.slug });
    if (!website) {
      return res.status(404).json({ 
        success: false,
        message: "Website not found" 
      });
    }
    
    const response = {
      ...website._doc,
      isDeployed: website.isDeployed || website.deployed || false
    };
    
    return res.status(200).json({
      success: true,
      ...response
    });
  } catch (error) {
    console.error("❌ Get by slug error:", error);
    return res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};