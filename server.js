import express from "express";
import dotenv from "dotenv";
import anchorRoutes from "./anchor_routes.js";

dotenv.config();

const app = express();
app.use(express.json());

app.use("/api/v1", anchorRoutes);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});