import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { Cropper } from "react-cropper";
import "cropperjs/dist/cropper.css";
import { usePubSub } from "@videosdk.live/react-sdk";

const ImageCapturePreviewDialog = ({ open, setOpen }) => {
  const [imageSrc, setImageSrc] = useState(null);

  const imagesMessages = {};

  // subscribe imageTransfer
  const generateImage = (messages) => {
    // Getting src of image
    const srcImage = messages
      .sort((a, b) => parseInt(a.index) - parseInt(b.index))
      .map(({ chunkdata }) => chunkdata)
      .join("");

    // Setting src of image
    setImageSrc(srcImage);
  };

  usePubSub(`IMAGE_TRANSFER`, {
    onMessageReceived: ({ message }) => {
      const { id, index, totalChunk } = message.data;

      // If you select multiple images, then it will store images on basis of id in imagesMessages object
      if (imagesMessages[id]) {
        imagesMessages[id].push(message.data);
      } else {
        imagesMessages[id] = [message.data];
      }

      // Check whether the index of chunk and totalChunk is same, it means it is last chunk or not
      if (index + 1 === totalChunk) {
        generateImage(imagesMessages[id]);
      }
    },
  });

  // end subscribe imageTransfer

  const [cropData, setCropData] = useState("#");
  const [cropper, setCropper] = useState();
  const [cropButtonClicked, setCropButtonClicked] = useState(false);

  const getCropData = () => {
    if (typeof cropper !== "undefined") {
      setCropData(cropper.getCroppedCanvas().toDataURL());
    }
  };

  return (
    <>
      <Transition appear show={open} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => {}}>
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

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center  text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel
                  style={{
                    maxHeight: `calc(100vh - 150px)`,
                  }}
                  className="w-9/12 transform relative overflow-y-auto rounded bg-gray-750 p-4 text-left align-middle flex flex-col items-center shadow-xl transition-all"
                >
                  <Dialog.Title className="text-base font-medium  text-white w-full ">
                    Preview
                  </Dialog.Title>
                  <div className="flex mt-8 items-center justify-center h-full w-full">
                    {imageSrc ? (
                      <img src={imageSrc} width={300} height={300} />
                    ) : (
                      <div width={300} height={300}>
                        <p className=" text-white  text-center">
                          Loading Image...
                        </p>
                      </div>
                    )}

                    <Cropper
                      className="ml-4"
                      style={{
                        height: "33.33%",
                        width: "33.33%",
                        objectFit: "contain",
                      }}
                      zoomTo={0.5}
                      initialAspectRatio={1}
                      preview=".img-preview"
                      src={imageSrc}
                      viewMode={1}
                      minCropBoxHeight={10}
                      minCropBoxWidth={10}
                      background={false}
                      responsive={true}
                      autoCropArea={1}
                      checkOrientation={false} // https://github.com/fengyuanchen/cropperjs/issues/671
                      onInitialized={(instance) => {
                        setCropper(instance);
                      }}
                      guides={true}
                      crossOrigin="anonymous"
                    />
                  </div>

                  <div className="flex items-end justify-end w-full mt-6">
                    <button
                      className="bg-white text-black px-3 py-2 rounded"
                      style={{ float: "right" }}
                      onClick={() => {
                        setCropButtonClicked(true);
                        getCropData();
                      }}
                    >
                      Crop Image
                    </button>
                  </div>
                  {cropData && cropButtonClicked && (
                    <div className="flex flex-col w-full">
                      <span className="text-white font-semibold">
                        After Crop Image
                      </span>
                      <img
                        className="object-contain h-1/3 w-1/3 mt-3"
                        src={cropData}
                        alt="cropped"
                      />
                    </div>
                  )}

                  <div className="mt-6 flex w-full  justify-end gap-5">
                    <button
                      type="button"
                      className="rounded border border-white bg-transparent px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
                      onClick={() => {
                        setOpen(false);
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="rounded border border-white bg-transparent px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
                      onClick={() => {
                        setOpen(false);
                      }}
                    >
                      Upload
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default ImageCapturePreviewDialog;
