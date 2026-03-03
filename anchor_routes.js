import express from "express";
import { anchorShipment } from "./anchor.js";

const router = express.Router();

// Route + Controller merged here
router.post("/api/anchor", async (req, res) => {
  try {
    const result = await anchorShipment(req.body);

    return res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {

    console.error("Anchor error:", error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;