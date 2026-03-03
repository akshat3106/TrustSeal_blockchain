import express from "express";
import { Snapshot, Blockchain } from "./anchor.js";

const router = express.Router();

router.post("/store", async (req, res) => {
  try {
    const result = await Snapshot(req.body);

    return res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error("Snapshot error:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


router.post("/anchor", async (req, res) => {
  try {
    const result = await Blockchain(req.body);

    return res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error("Anchor error:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;