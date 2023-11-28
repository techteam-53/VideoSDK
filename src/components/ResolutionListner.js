import { useMeeting, usePubSub } from "@videosdk.live/react-sdk";
import { useEffect, useRef } from "react";
import { useMeetingAppContext } from "../context/MeetingAppContext";
import useMediaStream from "../hooks/useMediaStream";

const ResolutionListner = () => {
  const mMeeting = useMeeting();

  const {
    selectedWebcamDevice,
    allowedVirtualBackground,
    useVirtualBackground,
    setWebCamResolution,
    webCamResolution,
  } = useMeetingAppContext();

  const selectedWebcamDeviceRef = useRef();
  const webCamResolutionRef = useRef();

  useEffect(() => {
    webCamResolutionRef.current = webCamResolution;
  }, [webCamResolution]);

  useEffect(() => {
    selectedWebcamDeviceRef.current = selectedWebcamDevice;
  }, [selectedWebcamDevice]);

  const useVirtualBackgroundRef = useRef();

  useEffect(() => {
    useVirtualBackgroundRef.current = useVirtualBackground;
  }, [useVirtualBackground]);

  const { getVideoTrack } = useMediaStream();

  const { publish } = usePubSub(
    `CHANGE_RESOLUTION_${mMeeting?.localParticipant?.id}`,
    {
      onMessageReceived: async ({ message }) => {
        if (webCamResolutionRef.current === message.resolutionValue) return;
        setWebCamResolution(message.resolutionValue);
        let customTrack;
        if (allowedVirtualBackground && useVirtualBackgroundRef.current) {
          customTrack = await getVideoTrack({
            webcamId: selectedWebcamDeviceRef.current.id,
            encoderConfig: message.resolutionValue,
            useVirtualBackground: useVirtualBackground,
          });
        } else {
          await mMeeting?.disableWebcam();
          customTrack = await getVideoTrack({
            webcamId: selectedWebcamDeviceRef.current.id,
            encoderConfig: message.resolutionValue,
          });
        }
        mMeeting.changeWebcam(customTrack);
      },
    }
  );

  useEffect(() => {
    publish(
      {
        resolution: "sd",
        resolutionValue: "h480p_w640p",
      },
      {
        persist: true,
      }
    );
  }, []);

  return <></>;
};

export default ResolutionListner;
