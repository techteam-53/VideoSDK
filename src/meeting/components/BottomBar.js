import {
  Constants,
  createScreenShareVideoTrack,
  useMeeting,
  usePubSub,
} from "@videosdk.live/react-sdk";
import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import {
  ClipboardIcon,
  CheckIcon,
  ChevronDownIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import recordingBlink from "../../static/animations/recording-blink.json";
import useIsRecording from "../../hooks/useIsRecording";
import RecordingIcon from "../../icons/Bottombar/RecordingIcon";
import MicOnIcon from "../../icons/Bottombar/MicOnIcon";
import MicOffIcon from "../../icons/Bottombar/MicOffIcon";
import WebcamOnIcon from "../../icons/Bottombar/WebcamOnIcon";
import WebcamOffIcon from "../../icons/Bottombar/WebcamOffIcon";
import ScreenShareIcon from "../../icons/Bottombar/ScreenShareIcon";
import ChatIcon from "../../icons/Bottombar/ChatIcon";
import ParticipantsIcon from "../../icons/Bottombar/ParticipantsIcon";
import EndIcon from "../../icons/Bottombar/EndIcon";
import RaiseHandIcon from "../../icons/Bottombar/RaiseHandIcon";
import { OutlinedButton } from "../../components/buttons/OutlinedButton";
import useIsTab from "../../hooks/useIsTab";
import useIsMobile from "../../hooks/useIsMobile";
import { MobileIconButton } from "../../components/buttons/MobileIconButton";
import {
  meetingModes,
  participantModes,
  sideBarModes,
} from "../../utils/common";
import { Dialog, Popover, Transition } from "@headlessui/react";
import { useMeetingAppContext } from "../../context/MeetingAppContext";
import useMediaStream from "../../hooks/useMediaStream";
import { toast } from "react-toastify";
import { nameTructed, trimSnackBarText } from "../../utils/helper";
import OutlineIconTextButton from "../../components/buttons/OutlineIconTextButton";
import SpeakerIcon from "../../icons/Bottombar/SpeakerIcon";
import SpeakerOffIcon from "../../icons/Bottombar/SpeakerOffIcon";
import useCustomTrack from "../../utils/useCustomTrack";

const MicBTN = () => {
  const { selectedMicDevice, setSelectedMicDevice } = useMeetingAppContext();
  const { getCustomAudioTrack } = useCustomTrack();
  const mMeeting = useMeeting();
  const [mics, setMics] = useState([]);
  const localMicOn = mMeeting?.localMicOn;
  const changeMic = mMeeting?.changeMic;

  const getMics = async (mGetMics) => {
    const mics = await mGetMics();

    const micArr = mics.filter(
      (d) => d.deviceId !== "default" && d.deviceId !== "communications"
    );

    const newMics = new Map();

    micArr.map((device) => {
      if (!newMics.has(device.deviceId)) {
        newMics.set(device.deviceId, device);
      }
    });

    micArr && micArr?.length && setMics(newMics);
  };

  const mouseOver = false;

  let bgColor = localMicOn ? "bg-gray-750" : "bg-white";
  let borderColor = localMicOn && "#ffffff33";
  let isFocused = localMicOn;
  let focusIconColor = localMicOn && "white";
  let Icon = localMicOn ? MicOnIcon : MicOffIcon;
  const iconSize = 24 * 1;

  return (
    <>
      <Popover className="relative">
        {({ close }) => (
          <>
            <Popover.Button
              className={`flex items-center justify-center  rounded-lg ${
                bgColor ? `${bgColor}` : isFocused ? "bg-white" : "bg-gray-750"
              } ${
                mouseOver
                  ? "border-2 border-transparent border-solid"
                  : borderColor
                  ? `border-2 border-[${borderColor}] border-solid`
                  : bgColor
                  ? "border-2 border-transparent border-solid"
                  : "border-2 border-solid border-[#ffffff33]"
              } md:m-2 m-1`}
            >
              <button
                className={`cursor-pointer flex items-center justify-center`}
                onClick={(e) => {
                  e.stopPropagation();
                  mMeeting.toggleMic();
                }}
              >
                <div className="flex items-center justify-center p-1 m-1 rounded-lg">
                  <Icon
                    style={{
                      color: isFocused ? focusIconColor || "#1C1F2E" : "#fff",
                      height: iconSize,
                      width: iconSize,
                    }}
                    fillcolor={isFocused ? focusIconColor || "#1C1F2E" : "#fff"}
                  />
                </div>
              </button>
              <button
                className="mr-1"
                onClick={(e) => {
                  getMics(mMeeting.getMics);
                }}
              >
                <ChevronDownIcon
                  className="h-4 w-4"
                  style={{
                    color: mMeeting.localMicOn ? "white" : "black",
                  }}
                />
              </button>
            </Popover.Button>
            {mics.size > 0 && (
              <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
              >
                <Popover.Panel
                  style={{ zIndex: 9999 }}
                  className="absolute md:left-1/2 left-full bottom-full  mt-0 w-80 max-w-md -translate-x-1/2 transform px-4 sm:px-0 pb-2"
                >
                  <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                    <div className={" bg-gray-750 py-1"}>
                      <div>
                        <div className="flex items-center p-3 pb-0">
                          <p className="ml-3 text-sm text-gray-900">
                            {"MICROPHONE"}
                          </p>
                        </div>
                        <div className="flex flex-col">
                          {[...mics.values()].map(
                            ({ deviceId, label }, index) => {
                              return (
                                <div
                                  className={`px-3 py-1 my-1 pl-6 text-white text-left ${
                                    deviceId === selectedMicDevice.deviceId &&
                                    "bg-gray-150"
                                  }`}
                                >
                                  <button
                                    className={`flex flex-1 w-full ${
                                      deviceId === selectedMicDevice.deviceId &&
                                      "bg-gray-150"
                                    }`}
                                    key={`mics_${deviceId}`}
                                    onClick={async () => {
                                      setSelectedMicDevice({
                                        deviceId,
                                        label,
                                      });
                                      try {
                                        const stream =
                                          await getCustomAudioTrack({
                                            selectMicDeviceId:
                                              selectedMicDevice.id,
                                            encoderConfig: "speech_standard",
                                            useNoiseSuppression: true,
                                          });

                                        changeMic(stream);
                                      } catch (error) {
                                        console.log(error);
                                      }
                                      setTimeout(() => {
                                        close();
                                      }, 200);
                                    }}
                                  >
                                    {label || `Mic ${index + 1}`}
                                  </button>
                                </div>
                              );
                            }
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Popover.Panel>
              </Transition>
            )}
          </>
        )}
      </Popover>
    </>
  );
};

const OutputMicBTN = () => {
  const { selectedOutputDevice, setSelectedOutputDevice } =
    useMeetingAppContext();
  const [outputmics, setOutputMics] = useState([]);

  const { muteSpeaker, setMuteSpeaker } = useMeetingAppContext();

  const getOutputDevices = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const outputMics = devices.filter(
      (d) =>
        d.kind === "audiooutput" &&
        d.deviceId !== "default" &&
        d.deviceId !== "communications"
    );

    const outputs = new Map();

    outputMics.map((device) => {
      if (!outputs.has(device.deviceId)) {
        outputs.set(device.deviceId, device);
      }
    });

    outputMics && outputMics?.length && setOutputMics(outputs);
  };

  let bgColor = muteSpeaker ? "bg-gray-750" : "bg-white";
  let borderColor = muteSpeaker && "#ffffff33";
  let isFocused = muteSpeaker;
  let focusIconColor = muteSpeaker && "white";
  let Icon = muteSpeaker ? SpeakerIcon : SpeakerOffIcon;
  const iconSize = 24 * 1;

  return (
    <Popover className="relative">
      {({ close }) => (
        <>
          <Popover.Button
            className={`flex items-center justify-center  rounded-lg ${
              bgColor ? `${bgColor}` : isFocused ? "bg-white" : "bg-gray-750"
            } ${
              borderColor
                ? `border-2 border-[${borderColor}] border-solid`
                : bgColor
                ? "border-2 border-transparent border-solid"
                : "border-2 border-solid border-[#ffffff33]"
            } md:m-2 m-1`}
          >
            <button
              className={`cursor-pointer flex items-center justify-center`}
              onClick={(e) => {
                e.stopPropagation();
                setMuteSpeaker(!muteSpeaker);
              }}
            >
              <div className="flex items-center justify-center p-1 m-1 rounded-lg">
                <Icon
                  style={{
                    color: isFocused ? focusIconColor || "#1C1F2E" : "#fff",
                    height: iconSize,
                    width: iconSize,
                  }}
                  fillcolor={isFocused ? focusIconColor || "#1C1F2E" : "#fff"}
                />
              </div>
            </button>
            <button
              className="mr-1"
              onClick={(e) => {
                getOutputDevices();
              }}
            >
              <ChevronDownIcon
                className="h-4 w-4"
                style={{
                  color: muteSpeaker ? "white" : "black",
                }}
              />
            </button>
          </Popover.Button>
          {outputmics && (
            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel
                style={{ zIndex: 9999 }}
                className="absolute left-1/2 bottom-full  mt-0 w-72 -translate-x-1/2 transform px-4 sm:px-0 pb-2"
              >
                <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className={" bg-gray-750 py-1"}>
                    <div>
                      <div className="flex items-center p-3 pb-0">
                        <p className="ml-3 text-sm text-gray-900">
                          {"SPEAKER"}
                        </p>
                      </div>
                      <div className="flex flex-col">
                        {[...outputmics.values()].map(
                          ({ deviceId, label }, index) => {
                            return (
                              <div
                                className={`px-3 py-1 my-1 pl-6 text-white text-left ${
                                  deviceId === selectedOutputDevice.id &&
                                  "bg-gray-150"
                                }`}
                              >
                                <button
                                  className={`flex flex-1 w-full ${
                                    deviceId === selectedOutputDevice.id &&
                                    "bg-gray-150"
                                  }`}
                                  key={`mics_${deviceId}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setSelectedOutputDevice({
                                      id: deviceId,
                                    });

                                    setTimeout(() => {
                                      close();
                                    }, 200);
                                  }}
                                >
                                  {label || `Mic ${index + 1}`}
                                </button>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Popover.Panel>
            </Transition>
          )}
        </>
      )}
    </Popover>
  );
};

const WebCamBTN = ({ isMobile }) => {
  const { selectedWebcamDevice, setSelectedWebcamDevice } =
    useMeetingAppContext();
  const mMeeting = useMeeting();
  const [webcams, setWebcams] = useState([]);

  const localWebcamOn = mMeeting?.localWebcamOn;
  const changeWebcam = mMeeting?.changeWebcam;
  const disableWebcam = mMeeting?.disableWebcam;

  const getWebcams = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const webcams = devices.filter(
      (d) =>
        d.kind === "videoinput" &&
        d.deviceId !== "default" &&
        d.deviceId !== "communications"
    );

    webcams && webcams?.length && setWebcams(webcams);
  };

  const { getVideoTrack } = useMediaStream();
  const {
    useVirtualBackground,
    setUseVirtualBackground,
    allowedVirtualBackground,
    setCameraFacingMode,
  } = useMeetingAppContext();

  let bgColor = localWebcamOn ? "bg-gray-750" : "bg-white";
  let borderColor = localWebcamOn && "#ffffff33";
  let isFocused = localWebcamOn;
  let focusIconColor = localWebcamOn && "white";
  let Icon = localWebcamOn ? WebcamOnIcon : WebcamOffIcon;
  const iconSize = 24 * 1;

  const { publish: switchCameraPublish } = usePubSub(
    `SWITCH_PARTICIPANT_CAMERA_${mMeeting?.localParticipant?.id}`,
    {
      onMessageReceived: async ({ message }) => {
        setCameraFacingMode({
          facingMode: message.facingMode,
        });
      },
    }
  );

  return (
    <Popover className="relative">
      {({ close }) => (
        <>
          <Popover.Button
            className={`flex items-center justify-center  rounded-lg ${
              bgColor ? `${bgColor}` : isFocused ? "bg-white" : "bg-gray-750"
            } ${
              borderColor
                ? `border-2 border-[${borderColor}] border-solid`
                : bgColor
                ? "border-2 border-transparent border-solid"
                : "border-2 border-solid border-[#ffffff33]"
            } md:m-2 m-1`}
          >
            <button
              className={`cursor-pointer flex items-center justify-center`}
              onClick={async (e) => {
                e.stopPropagation();
                let track;
                if (!localWebcamOn) {
                  if (allowedVirtualBackground && useVirtualBackground) {
                    track = await getVideoTrack({
                      webcamId: selectedWebcamDevice.id,
                      useVirtualBackground: useVirtualBackground,
                    });
                  } else {
                    track = await getVideoTrack({
                      webcamId: selectedWebcamDevice.id,
                    });
                  }
                }
                mMeeting.toggleWebcam(track);
              }}
            >
              <div className="flex items-center justify-center p-1 m-1 rounded-lg">
                <Icon
                  style={{
                    color: isFocused ? focusIconColor || "#1C1F2E" : "#fff",
                    height: iconSize,
                    width: iconSize,
                  }}
                  fillcolor={isFocused ? focusIconColor || "#1C1F2E" : "#fff"}
                />
              </div>
            </button>
            <button
              className="mr-1"
              onClick={(e) => {
                getWebcams(mMeeting?.getWebcams);
              }}
            >
              <ChevronDownIcon
                className="h-4 w-4"
                style={{
                  color: localWebcamOn ? "white" : "black",
                }}
              />
            </button>
          </Popover.Button>
          {webcams.length > 0 && (
            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel
                style={{ zIndex: 9999 }}
                className="absolute left-1/2 bottom-full  mt-0 w-72 -translate-x-1/2 transform px-4 sm:px-0 pb-2"
              >
                <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className={" bg-gray-750 py-1"}>
                    <div>
                      <div className="flex items-center p-3 pb-0">
                        <p className="ml-3 text-sm text-gray-900">{"WEBCAM"}</p>
                      </div>
                      <div className="flex flex-col">
                        {webcams.map(({ deviceId, label }, index) => (
                          <div
                            className={`px-3 py-1 my-1 pl-6 text-white text-left ${
                              deviceId === selectedWebcamDevice.id &&
                              "bg-gray-150"
                            }`}
                          >
                            <button
                              className={`flex flex-1 w-full ${
                                deviceId === selectedWebcamDevice.id &&
                                "bg-gray-150"
                              }`}
                              key={`output_webcams_${deviceId}`}
                              onClick={async () => {
                                setSelectedWebcamDevice({
                                  id: deviceId,
                                  label,
                                });
                                const facingMode =
                                  label.toLowerCase().includes("front") ||
                                  label.toLowerCase().includes("back");
                                const value =
                                  label.toLowerCase().match(/\bfront\b/i) ||
                                  label.toLowerCase().match(/\bback\b/i);

                                if (facingMode) {
                                  switchCameraPublish(
                                    {
                                      facingMode: value[0],
                                      isChangeWebcam: false,
                                    },
                                    {
                                      persist: true,
                                    }
                                  );
                                }

                                if (
                                  allowedVirtualBackground &&
                                  useVirtualBackground
                                ) {
                                  const track = await getVideoTrack({
                                    webcamId: deviceId,
                                    useVirtualBackground: useVirtualBackground,
                                  });
                                  changeWebcam(track);
                                } else {
                                  await disableWebcam();
                                  let customTrack = await getVideoTrack({
                                    webcamId: deviceId,
                                  });

                                  changeWebcam(customTrack);
                                }
                                setTimeout(() => {
                                  close();
                                }, 200);
                              }}
                            >
                              {label || `Webcam ${index + 1}`}
                            </button>
                          </div>
                        ))}
                      </div>
                      {allowedVirtualBackground && !isMobile && (
                        <button
                          className="flex items-center p-3"
                          onClick={async () => {
                            const track = await getVideoTrack({
                              useVirtualBackground: !useVirtualBackground,
                            });
                            setUseVirtualBackground(!useVirtualBackground);
                            changeWebcam(track);
                            setTimeout(() => {
                              close();
                            }, 200);
                          }}
                        >
                          {useVirtualBackground ? (
                            <CheckCircleIcon className="h-5 w-5 text-green-150" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-[1px] border-gray-500 " />
                          )}

                          <p className="ml-3 text-sm text-gray-900">
                            {"Virtual Background"}
                          </p>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </Popover.Panel>
            </Transition>
          )}
        </>
      )}
    </Popover>
  );
};

export function BottomBar({ bottomBarHeight }) {
  const { sideBarMode, setSideBarMode, participantMode } =
    useMeetingAppContext();

  const RaiseHandBTN = ({ isMobile, isTab }) => {
    const { publish } = usePubSub("RAISE_HAND");
    const RaiseHand = () => {
      publish("Raise Hand");
    };

    return isMobile || isTab ? (
      <MobileIconButton
        id="RaiseHandBTN"
        tooltipTitle={"Raise hand"}
        Icon={RaiseHandIcon}
        onClick={RaiseHand}
        buttonText={"Raise Hand"}
      />
    ) : (
      <OutlinedButton
        onClick={RaiseHand}
        tooltip={"Raise Hand"}
        Icon={RaiseHandIcon}
      />
    );
  };

  const RecordingBTN = ({ isMobile, isTab }) => {
    const { startRecording, stopRecording, recordingState } = useMeeting();
    const defaultOptions = {
      loop: true,
      autoplay: true,
      animationData: recordingBlink,
      rendererSettings: {
        preserveAspectRatio: "xMidYMid slice",
      },
      height: 64,
      width: 160,
    };

    const isRecording = useIsRecording();
    const isRecordingRef = useRef(isRecording);

    useEffect(() => {
      isRecordingRef.current = isRecording;
    }, [isRecording]);

    const config = {
      layout: {
        type: "GRID",
        priority: "SPEAKER",
        gridSize: 4,
      },
      quality: "high",
    };

    const _handleClick = () => {
      const isRecording = isRecordingRef.current;

      if (isRecording) {
        stopRecording();
      } else {
        startRecording(null, null, config);
      }
    };

    return isMobile || isTab ? (
      <MobileIconButton
        Icon={RecordingIcon}
        onClick={_handleClick}
        isFocused={isRecording}
        buttonText={
          recordingState === Constants.recordingEvents.RECORDING_STARTED
            ? "Stop Recording"
            : recordingState === Constants.recordingEvents.RECORDING_STARTING
            ? "Starting Recording"
            : recordingState === Constants.recordingEvents.RECORDING_STOPPED
            ? "Start Recording"
            : recordingState === Constants.recordingEvents.RECORDING_STOPPING
            ? "Stopping Recording"
            : "Start Recording"
        }
        tooltip={
          recordingState === Constants.recordingEvents.RECORDING_STARTED
            ? "Stop Recording"
            : recordingState === Constants.recordingEvents.RECORDING_STARTING
            ? "Starting Recording"
            : recordingState === Constants.recordingEvents.RECORDING_STOPPED
            ? "Start Recording"
            : recordingState === Constants.recordingEvents.RECORDING_STOPPING
            ? "Stopping Recording"
            : "Start Recording"
        }
        lottieOption={isRecording ? defaultOptions : null}
      />
    ) : (
      <OutlinedButton
        Icon={RecordingIcon}
        onClick={_handleClick}
        isFocused={isRecording}
        tooltip={
          recordingState === Constants.recordingEvents.RECORDING_STARTED
            ? "Stop Recording"
            : recordingState === Constants.recordingEvents.RECORDING_STARTING
            ? "Starting Recording"
            : recordingState === Constants.recordingEvents.RECORDING_STOPPED
            ? "Start Recording"
            : recordingState === Constants.recordingEvents.RECORDING_STOPPING
            ? "Stopping Recording"
            : "Start Recording"
        }
        lottieOption={isRecording ? defaultOptions : null}
      />
    );
  };

  const ScreenShareModeBTN = ({ isMobile }) => {
    const { publish } = usePubSub(`CHANGE_MODE`, {});

    const { meetingMode } = useMeetingAppContext();

    return (
      <OutlineIconTextButton
        onClick={() => {
          publish(
            {
              mode:
                meetingMode === meetingModes.SCREEN_SHARE
                  ? meetingModes.CONFERENCE
                  : meetingModes.SCREEN_SHARE,
            },
            {
              persist: true,
            }
          );
        }}
        isFocused={meetingMode === meetingModes.SCREEN_SHARE}
        buttonText={
          meetingMode === meetingModes.SCREEN_SHARE
            ? "Stop screen share mode"
            : "Screen share mode"
        }
        tooltip={
          meetingMode === meetingModes.SCREEN_SHARE
            ? "Stop screen share mode"
            : "Screen share mode"
        }
        disabled={isMobile ? true : false}
      />
    );
  };

  const EndBTN = () => {
    const { end, localParticipant } = useMeeting();

    return (
      <OutlineIconTextButton
        onClick={() => {
          toast(
            `${trimSnackBarText(
              nameTructed(localParticipant.displayName, 15)
            )} end the meeting.`,
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
          end();
        }}
        buttonText={"End Meeting"}
        tooltip={"End Meeting"}
      />
    );
  };

  const ScreenShareBTN = ({ isMobile, isTab }) => {
    const { localScreenShareOn, toggleScreenShare, presenterId } = useMeeting();

    return isMobile || isTab ? (
      <MobileIconButton
        id="screen-share-btn"
        tooltipTitle={
          presenterId
            ? localScreenShareOn
              ? "Stop Presenting"
              : null
            : "Present Screen"
        }
        buttonText={
          presenterId
            ? localScreenShareOn
              ? "Stop Presenting"
              : null
            : "Present Screen"
        }
        isFocused={localScreenShareOn}
        Icon={ScreenShareIcon}
        onClick={async () => {
          let customTrack = await createScreenShareVideoTrack({
            optimizationMode: "text",
            encoderConfig: "h720p_15fps",
          });
          toggleScreenShare(customTrack);
        }}
        disabled={
          presenterId
            ? localScreenShareOn
              ? false
              : true
            : isMobile
            ? true
            : false
        }
      />
    ) : (
      <OutlinedButton
        Icon={ScreenShareIcon}
        onClick={async () => {
          let customTrack = await createScreenShareVideoTrack({
            optimizationMode: "text",
            encoderConfig: "h720p_15fps",
          });
          toggleScreenShare(customTrack);
        }}
        isFocused={localScreenShareOn}
        tooltip={
          presenterId
            ? localScreenShareOn
              ? "Stop Presenting"
              : null
            : "Present Screen"
        }
        disabled={presenterId ? (localScreenShareOn ? false : true) : false}
      />
    );
  };

  const LeaveBTN = () => {
    const { leave, localParticipant } = useMeeting();

    return (
      <OutlinedButton
        Icon={EndIcon}
        bgColor="bg-red-150"
        onClick={() => {
          toast(
            `${trimSnackBarText(
              nameTructed(localParticipant.displayName, 15)
            )} left the meeting.`,
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

          leave();
        }}
        tooltip="Leave Meeting"
      />
    );
  };

  const ChatBTN = ({ isMobile, isTab }) => {
    return isMobile || isTab ? (
      <MobileIconButton
        tooltipTitle={"Chat"}
        buttonText={"Chat"}
        Icon={ChatIcon}
        isFocused={sideBarMode === sideBarModes.CHAT}
        onClick={() => {
          setSideBarMode((s) =>
            s === sideBarModes.CHAT ? null : sideBarModes.CHAT
          );
        }}
      />
    ) : (
      <OutlinedButton
        Icon={ChatIcon}
        onClick={() => {
          setSideBarMode((s) =>
            s === sideBarModes.CHAT ? null : sideBarModes.CHAT
          );
        }}
        isFocused={sideBarMode === "CHAT"}
        tooltip="View Chat"
      />
    );
  };

  const ParticipantsBTN = ({ isMobile, isTab }) => {
    const { participants } = useMeeting();
    return isMobile || isTab ? (
      <MobileIconButton
        tooltipTitle={"Participants"}
        isFocused={sideBarMode === sideBarModes.PARTICIPANTS}
        buttonText={"Participants"}
        disabledOpacity={1}
        Icon={ParticipantsIcon}
        onClick={() => {
          setSideBarMode((s) =>
            s === sideBarModes.PARTICIPANTS ? null : sideBarModes.PARTICIPANTS
          );
        }}
        badge={`${new Map(participants)?.size}`}
      />
    ) : (
      <OutlinedButton
        Icon={ParticipantsIcon}
        onClick={() => {
          setSideBarMode((s) =>
            s === sideBarModes.PARTICIPANTS ? null : sideBarModes.PARTICIPANTS
          );
        }}
        isFocused={sideBarMode === sideBarModes.PARTICIPANTS}
        tooltip={"Participants"}
        badge={`${new Map(participants)?.size}`}
      />
    );
  };

  const MeetingIdCopyBTN = () => {
    const { meetingId } = useMeeting();
    const [isCopied, setIsCopied] = useState(false);
    return (
      <div className="flex items-center justify-center lg:ml-0 ml-4">
        <div className="flex border-2 border-gray-850 p-2 rounded-md items-center justify-center">
          <h1 className="text-white text-base ">{meetingId}</h1>
          <button
            className="ml-2"
            onClick={() => {
              navigator.clipboard.writeText(meetingId);
              setIsCopied(true);
              setTimeout(() => {
                setIsCopied(false);
              }, 3000);
            }}
          >
            {isCopied ? (
              <CheckIcon className="h-5 w-5 text-green-550" />
            ) : (
              <ClipboardIcon className="h-5 w-5 text-white" />
            )}
          </button>
        </div>
      </div>
    );
  };

  const tollTipEl = useRef();
  const isMobile = useIsMobile();
  const isTab = useIsTab();
  const [open, setOpen] = useState(false);

  const handleClickFAB = () => {
    setOpen(true);
  };

  const handleCloseFAB = () => {
    setOpen(false);
  };

  const BottomBarButtonTypes = useMemo(
    () => ({
      END_CALL: "END_CALL",
      CHAT: "CHAT",
      PARTICIPANTS: "PARTICIPANTS",
      SCREEN_SHARE: "SCREEN_SHARE",
      WEBCAM: "WEBCAM",
      MIC: "MIC",
      RAISE_HAND: "RAISE_HAND",
      RECORDING: "RECORDING",
      MEETING_ID_COPY: "MEETING_ID_COPY",
      SCREEN_SHARE_MODE_BUTTON: "SCREEN_SHARE_MODE_BUTTON",
      END_MEETING: "END_MEETING",
      SPEAKER: "SPEAKER",
    }),
    []
  );

  const otherFeatures = [
    { icon: BottomBarButtonTypes.RAISE_HAND },
    { icon: BottomBarButtonTypes.SCREEN_SHARE },
    { icon: BottomBarButtonTypes.CHAT },
    { icon: BottomBarButtonTypes.RECORDING },
    { icon: BottomBarButtonTypes.PARTICIPANTS },
    { icon: BottomBarButtonTypes.MEETING_ID_COPY },
    { icon: BottomBarButtonTypes.SCREEN_SHARE_MODE_BUTTON },
    { icon: BottomBarButtonTypes.END_MEETING },
  ];

  function getBrowserName(userAgent) {
    // The order matters here, and this may report false positives for unlisted browsers.

    if (userAgent.includes("Firefox")) {
      // "Mozilla/5.0 (X11; Linux i686; rv:104.0) Gecko/20100101 Firefox/104.0"
      return "Mozilla Firefox";
    } else if (userAgent.includes("SamsungBrowser")) {
      // "Mozilla/5.0 (Linux; Android 9; SAMSUNG SM-G955F Build/PPR1.180610.011) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/9.4 Chrome/67.0.3396.87 Mobile Safari/537.36"
      return "Samsung Internet";
    } else if (userAgent.includes("Opera") || userAgent.includes("OPR")) {
      // "Mozilla/5.0 (Macintosh; Intel Mac OS X 12_5_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36 OPR/90.0.4480.54"
      return "Opera";
    } else if (userAgent.includes("Edge")) {
      // "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 Edge/16.16299"
      return "Microsoft Edge (Legacy)";
    } else if (userAgent.includes("Edg")) {
      // "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36 Edg/104.0.1293.70"
      return "Microsoft Edge (Chromium)";
    } else if (userAgent.includes("Chrome")) {
      // "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36"
      return "Google Chrome or Chromium";
    } else if (userAgent.includes("Safari")) {
      // "Mozilla/5.0 (iPhone; CPU iPhone OS 15_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.6 Mobile/15E148 Safari/604.1"
      return "Apple Safari";
    } else {
      return "unknown";
    }
  }

  const browserName = getBrowserName(navigator.userAgent);

  // if (
  //   browserName !== "Google Chrome or Chromium" ||
  //   browserName !== "Microsoft Edge (Legacy)" ||
  //   browserName !== "Opera"
  // ) {
  //   // remove recording button
  //   otherFeatures.splice(3, 1);
  // }

  if (participantMode !== participantModes.AGENT) {
    // remove recording button
    otherFeatures.splice(3, 1);
  }

  return isMobile || isTab ? (
    <div
      className="flex items-center justify-center"
      style={{ height: bottomBarHeight }}
    >
      <LeaveBTN />
      <MicBTN />
      <WebCamBTN isMobile={isMobile} />
      {(browserName === "Google Chrome or Chromium" ||
        browserName === "Microsoft Edge (Legacy)" ||
        browserName === "Opera") && <OutputMicBTN />}
      <OutlinedButton Icon={EllipsisHorizontalIcon} onClick={handleClickFAB} />
      <Transition appear show={Boolean(open)} as={Fragment}>
        <Dialog
          as="div"
          className="relative"
          style={{ zIndex: 9999 }}
          onClose={handleCloseFAB}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="translate-y-full opacity-0 scale-95"
            enterTo="translate-y-0 opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="translate-y-0 opacity-100 scale-100"
            leaveTo="translate-y-full opacity-0 scale-95"
          >
            <div className="fixed inset-0 overflow-y-hidden">
              <div className="flex h-full items-end justify-end text-center">
                <Dialog.Panel className="w-screen transform overflow-hidden bg-gray-800 shadow-xl transition-all">
                  <div className="grid container bg-gray-800 py-6">
                    <div className="grid grid-cols-12 gap-2">
                      {otherFeatures.map(({ icon }) => {
                        return (
                          <div
                            className={`grid items-center justify-center  ${
                              icon === BottomBarButtonTypes.MEETING_ID_COPY ||
                              icon ===
                                BottomBarButtonTypes.SCREEN_SHARE_MODE_BUTTON
                                ? "col-span-7 sm:col-span-5 md:col-span-3 lg:col-sapn-2"
                                : "col-span-4 sm:col-span-3 md:col-span-2"
                            }`}
                          >
                            {icon === BottomBarButtonTypes.RAISE_HAND ? (
                              <RaiseHandBTN isMobile={isMobile} isTab={isTab} />
                            ) : icon === BottomBarButtonTypes.SCREEN_SHARE ? (
                              <ScreenShareBTN
                                isMobile={isMobile}
                                isTab={isTab}
                              />
                            ) : icon === BottomBarButtonTypes.CHAT ? (
                              <ChatBTN isMobile={isMobile} isTab={isTab} />
                            ) : icon === BottomBarButtonTypes.PARTICIPANTS ? (
                              <ParticipantsBTN
                                isMobile={isMobile}
                                isTab={isTab}
                              />
                            ) : icon === BottomBarButtonTypes.RECORDING ? (
                              <RecordingBTN isMobile={isMobile} isTab={isTab} />
                            ) : icon ===
                              BottomBarButtonTypes.MEETING_ID_COPY ? (
                              <MeetingIdCopyBTN
                                isMobile={isMobile}
                                isTab={isTab}
                              />
                            ) : icon ===
                                BottomBarButtonTypes.SCREEN_SHARE_MODE_BUTTON &&
                              participantMode === participantModes.AGENT ? (
                              <ScreenShareModeBTN isMobile={isMobile} />
                            ) : icon === BottomBarButtonTypes.END_MEETING &&
                              participantMode === participantModes.AGENT ? (
                              <EndBTN />
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Dialog.Panel>
              </div>
            </div>
          </Transition.Child>
        </Dialog>
      </Transition>
    </div>
  ) : (
    <div className="md:flex lg:px-2 xl:px-6 pb-2 px-2 hidden">
      <MeetingIdCopyBTN />

      <div className="flex flex-1 items-center justify-center" ref={tollTipEl}>
        {participantMode === participantModes.AGENT && (
          <RecordingBTN isTab={isTab} isMobile={isMobile} />
        )}
        <RaiseHandBTN isMobile={isMobile} isTab={isTab} />
        <MicBTN />

        <WebCamBTN />
        {(browserName === "Google Chrome or Chromium" ||
          browserName === "Microsoft Edge (Legacy)" ||
          browserName === "Opera") && <OutputMicBTN />}
        <ScreenShareBTN isMobile={isMobile} isTab={isTab} />
        {participantMode === participantModes.AGENT && (
          <>
            <ScreenShareModeBTN />
            <EndBTN />
          </>
        )}

        <LeaveBTN />
      </div>

      <div className="flex items-center justify-center">
        <ChatBTN isMobile={isMobile} isTab={isTab} />
        <ParticipantsBTN isMobile={isMobile} isTab={isTab} />
      </div>
    </div>
  );
}
