import { createContext, useContext, useState } from "react";
import { VirtualBackgroundProcessor } from "@videosdk.live/videosdk-media-processor-web";
import { participantModes } from "../utils/common";
import useIsMobile from "../hooks/useIsMobile";

export const MeetingAppContext = createContext();

export const useMeetingAppContext = () => useContext(MeetingAppContext);

export const MeetingAppProvider = ({
  children,
  selectedMic,
  selectedWebcam,
  initialMicOn,
  initialWebcamOn,
  topbarEnabled,
  participantMode,
  initialSpeakerOn,
}) => {
  const isMobile = useIsMobile();

  const [sideBarMode, setSideBarMode] = useState(null);
  const [selectedWebcamDevice, setSelectedWebcamDevice] =
    useState(selectedWebcam);
  const [selectedMicDevice, setSelectedMicDevice] = useState(selectedMic);
  const [raisedHandsParticipants, setRaisedHandsParticipants] = useState([]);
  const [useVirtualBackground, setUseVirtualBackground] = useState(
    participantMode !== participantModes.CLIENT && !isMobile
  );
  const [webCamResolution, setWebCamResolution] = useState("h480p_w640p");
  const [participantLeftReason, setParticipantLeftReason] = useState(null);
  const [cameraFacingMode, setCameraFacingMode] = useState({
    facingMode: "front",
  });
  const [meetingMode, setMeetingMode] = useState(null);
  const [muteSpeaker, setMuteSpeaker] = useState(initialSpeakerOn);
  const [selectedOutputDevice, setSelectedOutputDevice] = useState(selectedMic);

  const videoProcessor = new VirtualBackgroundProcessor();

  const isAgent =
    !!participantMode && participantMode !== participantModes.CLIENT;

  return (
    <MeetingAppContext.Provider
      value={{
        // default options
        initialMicOn,
        initialWebcamOn,
        participantMode,

        allowedVirtualBackground: false, //isAgent && !isMobile,

        maintainVideoAspectRatio: isAgent,
        maintainLandscapeVideoAspectRatio: true,
        canRemoveOtherParticipant: isAgent,

        // states
        sideBarMode,
        selectedWebcamDevice,
        selectedMicDevice,
        raisedHandsParticipants,
        useVirtualBackground,
        participantLeftReason,
        meetingMode,
        muteSpeaker,
        selectedOutputDevice,
        webCamResolution,
        cameraFacingMode,

        // setters
        setSideBarMode,
        setSelectedMicDevice,
        setSelectedWebcamDevice,
        setRaisedHandsParticipants,
        setUseVirtualBackground,
        setParticipantLeftReason,
        setMeetingMode,
        setMuteSpeaker,
        setSelectedOutputDevice,
        setWebCamResolution,
        setCameraFacingMode,

        videoProcessor,
      }}
    >
      {children}
    </MeetingAppContext.Provider>
  );
};
