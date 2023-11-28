import { createCameraVideoTrack } from "@videosdk.live/react-sdk";
import { useMeetingAppContext } from "../context/MeetingAppContext";
import { useEffect, useRef } from "react";

const useMediaStream = () => {
  const {
    selectedWebcamDevice,
    webCamResolution,
    videoProcessor,
    allowedVirtualBackground,
  } = useMeetingAppContext();

  const webcamResolutionRef = useRef();

  useEffect(() => {
    webcamResolutionRef.current = webCamResolution;
  }, [webCamResolution]);

  const getVideoTrack = async ({
    webcamId,
    useVirtualBackground,
    encoderConfig,
    facingMode,
  }) => {
    try {
      const track = await createCameraVideoTrack({
        cameraId: webcamId ? webcamId : selectedWebcamDevice.id,
        encoderConfig: encoderConfig
          ? encoderConfig
          : webcamResolutionRef.current,
        facingMode: facingMode,
        optimizationMode: "motion",
        multiStream: false,
      });
      if (allowedVirtualBackground) {
        if (useVirtualBackground) {
          if (!videoProcessor.ready) {
            await videoProcessor.init();
          }
          try {
            const processedStream = await videoProcessor.start(track, {
              type: "image",
              imageUrl:
                "https://cdn.videosdk.live/virtual-background/wall-with-pot.jpeg",
            });
            return processedStream;
          } catch (error) {
            console.log(error);
          }
        } else {
          if (videoProcessor.processorRunning) {
            videoProcessor.stop();
          }
        }
      }

      return track;
    } catch (error) {
      return null;
    }
  };

  return { getVideoTrack };
};

export default useMediaStream;
