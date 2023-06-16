"use client";
import Dropzone from "react-dropzone";
import ReactPlayer from "react-player";
import { useState, useEffect } from "react";

import { ThreeDots } from "react-loader-spinner";

import { CgTrash } from "react-icons/cg";
import { RiHistoryFill } from "react-icons/ri";
import { AiOutlineEye } from "react-icons/ai";

import toast, { Toaster } from "react-hot-toast";

interface Transcription {
  name: string;
  size: number;
  type: string;
  transcription: string;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);

  const [formData, setFormData] = useState<FormData | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);

  const [loading, setLoading] = useState(false);

  // Callback function to handle file drop
  const handleFileDrop = (acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0];
    console.log(uploadedFile);
    setFile(uploadedFile);

    const data = new FormData();
    data.append("file", uploadedFile);
    data.append("model", "whisper-1");
    setFormData(data);
  };

  const generateTranscription = async () => {
    setLoading(true);
    setTranscription(null);

    try {
      // Make POST request to the Server API
      const result = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const json = await result.json(); // -> { transcription: "TRANSCRIPTION_TEXT_HERE" }
      setTranscription(json.transcription);

      // Create a new transcription item
      const newTranscription: Transcription = {
        name: file!.name,
        size: file!.size,
        type: file!.type,
        transcription: json.transcription,
      };

      // Add it to the existing array of transcriptions
      const updatedTranscriptions = [...transcriptions, newTranscription];
      setTranscriptions(updatedTranscriptions);

      // Store the new array of transcriptions to local storage with name "history"
      localStorage.setItem("history", JSON.stringify(updatedTranscriptions));
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  };

  const handleReset = () => {
    setFile(null);
    setFormData(null);
    setTranscription(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) {
      // less than 1KB
      return bytes + " bytes";
    } else if (bytes < 1048576) {
      // less than 1MB
      return (bytes / 1024).toFixed(2) + " KB"; // convert to KB with 2 decimal places
    } else {
      return (bytes / 1048576).toFixed(2) + " MB"; // convert to MB with 2 decimal places
    }
  };

  const showToast = (transcription: string) => {
    toast(transcription, {
      duration: 6000,
      icon: "🏆",
      style: {
        padding: "16px 32px",
        background: "#000000",
        color: "#ffffff",
      },
    });
  };

  const removeTranscription = (index: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this transcription?"
    );

    if (confirmDelete) {
      const newTranscriptions = [...transcriptions];
      // newTranscriptions.splice(index, 1); // -> Normally, we do this.

      // But our list display in reverse order so we use the below way
      newTranscriptions.splice(transcriptions.length - 1 - index, 1);
      setTranscriptions(newTranscriptions);

      // Save new list to the local storage
      localStorage.setItem("history", JSON.stringify(newTranscriptions));
    }
  };

  useEffect(() => {
    // Load history data from the local storage
    const history = localStorage.getItem("history");

    if (history) {
      setTranscriptions(JSON.parse(history));
    }
  }, []);

  return (
    <main className="bg-gray-100 min-h-screen">
      <Toaster />

      <div className="py-10">
        {/* Transcriber Container */}
        <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Transcribe Audio
          </h1>

          {/* Dropzone */}
          <Dropzone onDrop={handleFileDrop}>
            {({ getRootProps, getInputProps }) => (
              <div
                className="border-4 border-dashed border-gray-400 p-4 rounded-md text-center cursor-pointer"
                {...getRootProps()}
              >
                <input {...getInputProps()} accept="audio/*" />
                {file ? (
                  <div className="flex items-center justify-center">
                    <ReactPlayer
                      url={URL.createObjectURL(file)}
                      controls
                      width="100%"
                      height="100%"
                      className="react-player"
                    />
                  </div>
                ) : (
                  <p className="text-gray-500 text-lg">
                    Drag and drop your audio file here, or click to select a
                    file
                  </p>
                )}
              </div>
            )}
          </Dropzone>

          {/* Buttons */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex justify-center">
              <button
                disabled={loading || !file}
                onClick={generateTranscription}
                className="flex items-center justify-center w-32 py-2 rounded bg-black hover:scale-105 hover:duration-300 text-white font-bold"
              >
                {loading ? (
                  <ThreeDots
                    height="25"
                    width="25"
                    radius="5"
                    color="#ffffff"
                    ariaLabel="three-dots-loading"
                    wrapperStyle={{}}
                    visible={true}
                  />
                ) : (
                  "Transcribe"
                )}
              </button>

              {transcription && (
                <button
                  onClick={handleReset}
                  className="ml-4 bg-gray-300 w-32 py-2 rounded hover:scale-105 hover:duration-300 hover:cursor-pointer font-bold"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Transcription here */}
          <div className="mt-6">
            <p className="text-md text-black">{transcription}</p>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="py-10">
        <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow text-gray-800">
          <h1 className="text-lg font-bold mb-6 flex items-center">
            <RiHistoryFill className="mr-2 w-6 h-6" />
            History
          </h1>

          <table className="table-auto w-full text-sm">
            <thead>
              <tr className="text-left border-b-2 border-gray-200">
                <th className="py-2">Name</th>
                <th>Size</th>
                <th>Type</th>
                <th className="text-right">Transcription</th>
              </tr>
            </thead>
            <tbody className="text-left text-gray-500">
              {transcriptions
                .slice(0)
                .reverse()
                .map((t, index) => (
                  <tr key={index}>
                    <td className="py-2">{t.name}</td>
                    <td>{formatFileSize(t.size)}</td>
                    <td>{t.type}</td>
                    <td className="flex items-center justify-end py-2">
                      <AiOutlineEye
                        onClick={() => showToast(t.transcription)}
                        className="text-black w-4 h-4 hover:cursor-pointer hover:text-green-500"
                      />
                      <CgTrash
                        onClick={() => removeTranscription(index)}
                        className="text-black ml-4 w-4 h-4 hover:cursor-pointer hover:text-red-500"
                      />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
