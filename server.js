import express from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import cors from "cors";
import authRouter from "./routes/auth.js";
import podcastRouter from "./routes/podcast.js";
import { uploadAudio } from "./aws.js";
import multer, { memoryStorage } from "multer";
const storage = memoryStorage();
const upload = multer({ storage });

import usersRouter from "./routes/users.js";
import uploadRouter from "./routes/uploadAudio.js";
import recordingRouter from "./routes/recording.js";
import favoriteRouter from "./routes/favorite.js";
import tagRouter from "./routes/tag.js";
import podcastTagRouter from "./routes/podcastTag.js";

import cookieParser from "cookie-parser";
import connectDB from "./db.js";
import authorization from "./authorization.js";
import { Podcast } from "./models/podcast.js";
import { Recording } from "./models/recording.js";

export const privateKey = process.env.PRIVATE_KEY;
const app = express();
const port = process.env.PORT || 8080;
connectDB();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", authRouter);
app.use("/podcast", podcastRouter);
// app.use("/upload", uploadRouter);
app.use("/recording", recordingRouter);
app.use("/favorite", favoriteRouter);
app.use("/tag", tagRouter);
app.use("/podcast-tag", podcastTagRouter);
app.use("/users", usersRouter);

app.post("/uploadClip", upload.single("file"), async (req, res) => {
  const filename = crypto.randomBytes(32).toString("hex");
  const bucketname = "sound-bits";
  const file = req.file.buffer;
  const token = req.cookies.token;
  const { podcastId } = req.body;

  try {
    const link = await uploadAudio(filename, bucketname, file);
    const user = jwt.verify(token, privateKey);
    await Recording.create({
      url: link,
      podcastId: podcastId,
      title: filename,
      userId: user._id,
    });
    res.json(link);
  } catch (error) {
    console.error(error);
    res.status(500).json("error");
  }
});

app.post("/profile/:username", authorization, async (req, res) => {
  console.log("Token is valid.");
  res.sendStatus(200);
});

app.listen(port, () =>
  console.log(`Server running on http://localhost:${port}`)
);
