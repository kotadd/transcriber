import { NextResponse } from "next/server";

import axios from "axios";
import FormData from "form-data";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as Blob;
  console.log(file);

  // Convert file to Buffer
  const buffer = Buffer.from(await file.arrayBuffer());

  // Create form data
  const form = new FormData();
  form.append("file", buffer, file.name);
  form.append("model", "whisper-1");

  // Call Whisper API to transcribe the audio
  try {
    const { data } = await axios.post(
      "https://api.openai.com/v1/audio/transcriptions",
      form,
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );
    // -> data = { text: "TRANSCRIPTION_TEXT_HERE" }

    return NextResponse.json({ transcription: data.text }, { status: 200 });
  } catch (error) {
    // Show error in the server terminal
    console.log(error.response);

    // Response error message to the client
    return NextResponse.json(
      { error: error.response.data.error.message },
      { status: 500 }
    );
  }
}
