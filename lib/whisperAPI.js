import axios from "axios";
import FormData from "form-data";
import fs from "fs";
// import dotenv from "dotenv";
// dotenv.config();
const api_key = process.env.OPENAI_API_KEY;

export async function whisperApi(req, res) {
  try {
    const filePath = req.file.path;
    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath));
    formData.append("model", "whisper-1");

    const response = await axios.post("https://api.openai.com/v1/audio/transcriptions", formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${api_key}`,
      },
    });
    fs.unlinkSync(filePath);

    return res.status(200).json({
      success: true,
      message: "Audio transcribed successfully",
      transcript: response.data.text,
    });
  } catch (error) {
    console.log(error);
  }
}

// transcribeAudio("./audio.webm");
