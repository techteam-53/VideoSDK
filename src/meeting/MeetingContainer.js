import React, { useState, useEffect, useRef, createRef } from "react";
import { Constants, useMeeting, usePubSub } from "@videosdk.live/react-sdk";
import { BottomBar } from "./components/BottomBar";
import { SidebarConatiner } from "../components/sidebar/SidebarContainer";
import MemorizedParticipantView from "./components/ParticipantView";
import { PresenterView } from "../components/PresenterView";
import { nameTructed, trimSnackBarText } from "../utils/helper";
import WaitingToJoinScreen from "../components/screens/WaitingToJoinScreen";
import ConfirmBox from "../components/ConfirmBox";
import useIsMobile from "../hooks/useIsMobile";
import useIsTab from "../hooks/useIsTab";
import { useMediaQuery } from "react-responsive";
import { toast } from "react-toastify";
import { useMeetingAppContext } from "../context/MeetingAppContext";
import useRaisedHandParticipants from "../hooks/useRaisedHandParticipants";
import useMediaStream from "../hooks/useMediaStream";
import { meetingLeftReasons, meetingModes } from "../utils/common";
import ResolutionListner from "../components/ResolutionListner";
import { ScreenShareView } from "../components/ScreenShareView";
import ModeListner from "../components/ModeListner";
import useCustomTrack from "../utils/useCustomTrack";
import SwitchCameraListner from "../components/SwitchCameraListner";
import ImageUploadListner from "../components/ImageUploadListner";

export function MeetingContainer({ onMeetingLeave }) {
  const bottomBarHeight = 60;

  const [containerHeight, setContainerHeight] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const {
    sideBarMode,
    initialMicOn,
    initialWebcamOn,
    selectedWebcamDevice,
    selectedMicDevice,
    useVirtualBackground,
    allowedVirtualBackground,
    participantLeftReason,
    setParticipantLeftReason,
    meetingMode,
  } = useMeetingAppContext();

  const [meetingErrorVisible, setMeetingErrorVisible] = useState(false);
  const [meetingError, setMeetingError] = useState(false);
  const [localParticipantAllowedJoin, setLocalParticipantAllowedJoin] =
    useState(null);

  const mMeetingRef = useRef();
  const containerRef = createRef();
  const containerHeightRef = useRef();
  const containerWidthRef = useRef();
  const selectedWebcamDeviceRef = useRef();
  const selectedMicDeviceRef = useRef();

  useEffect(() => {
    selectedWebcamDeviceRef.current = selectedWebcamDevice;
  }, [selectedWebcamDevice]);

  useEffect(() => {
    selectedMicDeviceRef.current = selectedMicDevice;
  }, [selectedMicDevice]);

  useEffect(() => {
    containerHeightRef.current = containerHeight;
    containerWidthRef.current = containerWidth;
  }, [containerHeight, containerWidth]);

  const isMobile = useIsMobile();
  const isTab = useIsTab();
  const isLGDesktop = useMediaQuery({ minWidth: 1024, maxWidth: 1439 });
  const isXLDesktop = useMediaQuery({ minWidth: 1440 });
  const { getCustomAudioTrack } = useCustomTrack();

  const sideBarContainerWidth = isXLDesktop
    ? 400
    : isLGDesktop
    ? 360
    : isTab
    ? 320
    : isMobile
    ? 280
    : 240;

  useEffect(() => {
    containerRef.current?.offsetHeight &&
      setContainerHeight(containerRef.current.offsetHeight);
    containerRef.current?.offsetWidth &&
      setContainerWidth(containerRef.current.offsetWidth);

    window.addEventListener("resize", ({ target }) => {
      containerRef.current?.offsetHeight &&
        setContainerHeight(containerRef.current.offsetHeight);
      containerRef.current?.offsetWidth &&
        setContainerWidth(containerRef.current.offsetWidth);
    });
  }, []);

  const _handleOnRecordingStateChanged = ({ status }) => {
    if (
      status === Constants.recordingEvents.RECORDING_STARTED ||
      status === Constants.recordingEvents.RECORDING_STOPPED
    ) {
      toast(
        `${
          status === Constants.recordingEvents.RECORDING_STARTED
            ? "Meeting recording is started"
            : "Meeting recording is stopped."
        }`,
        {
          position: "bottom-left",
          autoClose: 4000,
          hideProgressBar: true,
          closeButton: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        }
      );
    }
  };

  function onParticipantJoined(participant) {
    // Change quality to low, med or high based on resolution
    participant && participant.setQuality("high");
  }

  const { getVideoTrack } = useMediaStream();

  async function onMeetingJoined() {
    const { muteMic, changeMic, changeWebcam, disableWebcam } =
      mMeetingRef.current;

    if (initialWebcamOn) {
      await new Promise((resolve) => {
        let track;
        disableWebcam();
        setTimeout(async () => {
          if (allowedVirtualBackground && useVirtualBackground) {
            track = await getVideoTrack({
              webcamId: selectedWebcamDeviceRef.current.id,
              useVirtualBackground: useVirtualBackground,
            });
          } else {
            track = await getVideoTrack({
              webcamId: selectedWebcamDeviceRef.current.id,
            });
          }
          changeWebcam(track);

          resolve();
        }, 500);
      });
    }

    if (initialMicOn && selectedMicDevice.id) {
      await new Promise((resolve) => {
        muteMic();
        setTimeout(async () => {
          try {
            const stream = await getCustomAudioTrack({
              selectMicDeviceId: selectedMicDeviceRef.current.id,
              encoderConfig: "speech_standard",
              useNoiseSuppression: true,
            });
            changeMic(stream);
          } catch (error) {
            console.log(error);
          }
          resolve();
        }, 500);
      });
    }
    setLocalParticipantAllowedJoin(true);
  }
  function onMeetingLeft() {
    onMeetingLeave();
  }

  const _handleOnError = (data) => {
    const { code, message } = data;

    const joiningErrCodes = [
      4001, 4002, 4003, 4004, 4005, 4006, 4007, 4008, 4009, 4010,
    ];

    const isJoiningError = joiningErrCodes.findIndex((c) => c === code) !== -1;
    const isCriticalError = `${code}`.startsWith("500");

    new Audio(
      isCriticalError
        ? `https://static.videosdk.live/prebuilt/notification_critical_err.mp3`
        : `https://static.videosdk.live/prebuilt/notification_err.mp3`
    ).play();

    setMeetingErrorVisible(true);
    setMeetingError({
      code,
      message: isJoiningError ? "Unable to join meeting!" : message,
    });
  };

  function onParticipantLeft(participant) {
    toast(
      `${trimSnackBarText(nameTructed(participant.displayName, 15))} ${
        participantLeftReason === meetingLeftReasons.TAB_BROWSER_CLOSED
          ? "left because of tab closed."
          : "left the meeting."
      }`,
      {
        position: "bottom-left",
        autoClose: 4000,
        hideProgressBar: true,
        closeButton: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      }
    );
  }

  function _handleOnMeetingStateChanged(data) {
    const { state } = data;

    toast(
      `${
        state === "CONNECTED"
          ? "Meeting is connected"
          : state === "CONNECTING"
          ? "Meeting is connecting"
          : state === "FAILED"
          ? "Meeting connection failed"
          : state === "DISCONNECTED"
          ? "Meeting connection disconnected abruptly"
          : state === "CLOSING"
          ? "Meeting is closing"
          : state === "CLOSED"
          ? "Meeting connection closed"
          : ""
      }`,
      {
        position: "bottom-left",
        autoClose: 5000,
        type: (state === "FAILED" || state === "DISCONNECTED") && "warning",
        hideProgressBar: true,
        closeButton: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      }
    );
  }

  const mMeeting = useMeeting({
    onParticipantJoined,
    onParticipantLeft,
    onMeetingJoined,
    onMeetingLeft,
    onMeetingStateChanged: _handleOnMeetingStateChanged,
    onError: _handleOnError,
    onRecordingStateChanged: _handleOnRecordingStateChanged,
  });

  const isPresenting = mMeeting.presenterId ? true : false;

  useEffect(() => {
    mMeetingRef.current = mMeeting;
  }, [mMeeting]);

  const { participantRaisedHand } = useRaisedHandParticipants();

  usePubSub("RAISE_HAND", {
    onMessageReceived: (data) => {
      const localParticipantId = mMeeting?.localParticipant?.id;

      const { senderId, senderName } = data;

      const isLocal = senderId === localParticipantId;

      new Audio(
        `https://static.videosdk.live/prebuilt/notification.mp3`
      ).play();

      toast(`${isLocal ? "You" : nameTructed(senderName, 15)} raised hand 🖐🏼`, {
        position: "bottom-left",
        autoClose: 4000,
        hideProgressBar: true,
        closeButton: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });

      participantRaisedHand(senderId);
    },
  });

  usePubSub("CHAT", {
    onMessageReceived: (data) => {
      const localParticipantId = mMeeting?.localParticipant?.id;

      const { senderId, senderName, message } = data;

      const isLocal = senderId === localParticipantId;

      if (!isLocal) {
        new Audio(
          `https://static.videosdk.live/prebuilt/notification.mp3`
        ).play();

        toast(
          `${trimSnackBarText(
            `${nameTructed(senderName, 15)} says: ${message}`
          )}`,
          {
            position: "bottom-left",
            autoClose: 4000,
            hideProgressBar: true,
            closeButton: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          }
        );
      }
    },
  });

  useEffect(() => {
    window.addEventListener("beforeunload", (event) => {
      setParticipantLeftReason(meetingLeftReasons.TAB_BROWSER_CLOSED);
      console.log("participant left because of tab closed");
      event.preventDefault();
      event.returnValue = "";
    });
  }, []);

  return (
    <div className="fixed inset-0">
      <div
        ref={containerRef}
        className={`h-full w-full flex flex-col bg-gray-800 `}
      >
        {typeof localParticipantAllowedJoin === "boolean" ? (
          localParticipantAllowedJoin ? (
            <>
              <ImageUploadListner />
              <ResolutionListner />
              <ModeListner />
              <SwitchCameraListner />
              <div
                className={` flex flex-1 ${
                  isPresenting && isMobile ? "flex-col md:flex-row" : "flex-row"
                } bg-gray-800 `}
              >
                {isPresenting && isMobile ? (
                  <div
                    className={`flex flex-1 ${
                      isPresenting && isMobile ? "flex-col" : "flex-row"
                    } `}
                  >
                    <div className={`flex flex-1`}>
                      {isPresenting ? (
                        <PresenterView
                          height={containerHeight - bottomBarHeight}
                        />
                      ) : null}
                    </div>
                    {meetingMode === meetingModes.SCREEN_SHARE &&
                    !isPresenting ? (
                      <div className={`flex flex-1`}>
                        <ScreenShareView
                          height={containerHeight - bottomBarHeight}
                        />
                      </div>
                    ) : meetingMode === meetingModes.SCREEN_SHARE ? null : (
                      <div className={`flex h-1/3 md:flex-1`}>
                        <MemorizedParticipantView
                          isPresenting={isPresenting}
                          sideBarMode={sideBarMode}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {isPresenting ? (
                      <PresenterView
                        height={containerHeight - bottomBarHeight}
                      />
                    ) : null}
                    {meetingMode === meetingModes.SCREEN_SHARE &&
                    !isPresenting ? (
                      <ScreenShareView
                        height={containerHeight - bottomBarHeight}
                      />
                    ) : meetingMode === meetingModes.SCREEN_SHARE ? null : (
                      <MemorizedParticipantView
                        isPresenting={isPresenting}
                        sideBarMode={sideBarMode}
                      />
                    )}
                  </>
                )}

                <div>
                  <SidebarConatiner
                    height={containerHeight - bottomBarHeight}
                    sideBarContainerWidth={sideBarContainerWidth}
                  />
                </div>
              </div>

              <BottomBar bottomBarHeight={bottomBarHeight} />
            </>
          ) : (
            <></>
          )
        ) : (
          !mMeeting.isMeetingJoined && <WaitingToJoinScreen />
        )}
        <ConfirmBox
          open={meetingErrorVisible}
          successText="OKAY"
          onSuccess={() => {
            setMeetingErrorVisible(false);
          }}
          title={`Error Code: ${meetingError.code}`}
          subTitle={meetingError.message}
        />
      </div>
    </div>
  );
}
