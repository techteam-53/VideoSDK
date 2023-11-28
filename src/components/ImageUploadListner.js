import {
  useMeeting,
  useParticipant,
  usePubSub,
} from "@videosdk.live/react-sdk";
import { useEffect, useRef } from "react";

const ImageUploadListner = () => {
  const mMeeting = useMeeting();

  const { webcamStream } = useParticipant(mMeeting?.localParticipant?.id);

  const webcamStreamRef = useRef();

  useEffect(() => {
    webcamStreamRef.current = webcamStream;
  }, [webcamStream]);

  // publish image Transfer
  const { publish: imageUpload } = usePubSub("IMAGE_TRANSFER", {});

  function splitStringIntoChunks(str, chunkSize) {
    const chunks = [];
    let index = 0;

    while (index < str.length) {
      chunks.push(str.substring(index, index + chunkSize));
      index += chunkSize;
    }

    return chunks;
  }

  function uploadImage({ data }) {
    // Chunk size, you can change it according to your requirements
    const chunkSize = 500; // bits

    // Total Chunks
    const chunks = splitStringIntoChunks(data, chunkSize);

    // Random String
    const result = Math.random().toString(36).substring(2, 7);

    // Iterate chunk
    for (let i = 0; i < chunks.length; i++) {
      const element = chunks[i];

      // Payload
      const data = {
        index: i,
        totalChunk: chunks.length,
        chunkdata: element,
        id: result.toString(),
      };

      // publish on `IMAGE_TRANSFER` topic
      imageUpload({ data });
    }
  }
  // end publish image transfer

  const _handleOnImageCaptureMessageReceived = () => {
    try {
      const track = new MediaStream();
      track.addTrack(webcamStreamRef.current.track);

      const video = document.createElement("video");
      video.srcObject = track;
      video.playsInline = true;

      const canvas = document.createElement("canvas");
      canvas.id = "canvasId";

      video.addEventListener("loadeddata", async () => {
        const { videoWidth, videoHeight } = video;
        canvas.width = videoWidth;
        canvas.height = videoHeight;

        try {
          await video.play();
          document.body.appendChild(video);
          let ratio = 16 / 9;
          let x = (canvas.width - videoWidth * ratio) / 2;
          let y = (canvas.height - videoHeight * ratio) / 2;
          canvas.getContext("2d").clearRect(0, 0, x / 2, y / 2);
          canvas.getContext("2d").drawImage(video, 0, 0);

          const url = canvas.toDataURL("image/png");
          document.body.appendChild(canvas);

          uploadImage({ data: url });

          document.body.removeChild(canvas);
          document.body.removeChild(video);
        } catch (error) {
          console.log("error in video", error);
        }
      });
    } catch (err) {
      console.log("err on image capture", err);
    }
  };

  // subscribe image capture
  usePubSub(`IMAGE_CAPTURE_${mMeeting?.localParticipant?.id}`, {
    onMessageReceived: ({ message }) => {
      _handleOnImageCaptureMessageReceived({ message });
    },
  });
  // end of subscribe image capture

  return <></>;
};

export default ImageUploadListner;
