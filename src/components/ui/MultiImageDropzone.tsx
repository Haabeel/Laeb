"use client";

import { formatFileSize } from "@edgestore/react/utils";
import { IoIosCloudUpload, IoMdClose } from "react-icons/io";
import Image from "next/image";
import * as React from "react";
import { useDropzone, type DropzoneOptions } from "react-dropzone";
import { twMerge } from "tailwind-merge";
import { Dialog } from "@radix-ui/react-dialog";
import {
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "./dialog";

const variants = {
  base: "relative rounded-md h-full flex justify-center items-center flex-col cursor-pointer min-h-[150px] min-w-[200px] border border-dashed border-darkPrimary transition-colors duration-200 ease-in-out w-full",
  image:
    "border-0 p-0 w-full h-full relative shadow-md bg-slate-200 dark:bg-slate-900 rounded-md",
  active: "border-2",
  disabled:
    "bg-gray-200 border-gray-300 cursor-default pointer-events-none bg-opacity-30 dark:bg-gray-700",
  accept: "border border-blue-500 bg-blue-500 bg-opacity-10",
  reject: "border border-red-700 bg-red-700 bg-opacity-10",
};

export type FileState = {
  file: File | string;
  key: string; // used to identify the file in the progress callback
  progress: "PENDING" | "COMPLETE" | "ERROR" | number;
};

type InputProps = {
  className?: string;
  value?: FileState[];
  onChange?: (files: FileState[]) => void | Promise<void>;
  onFilesAdded?: (addedFiles: FileState[]) => void | Promise<void>;
  disabled?: boolean;
  dropzoneOptions?: Omit<DropzoneOptions, "disabled">;
};

const ERROR_MESSAGES = {
  fileTooLarge(maxSize: number) {
    return `The file is too large. Max size is ${formatFileSize(maxSize)}.`;
  },
  fileInvalidType() {
    return "Invalid file type.";
  },
  tooManyFiles(maxFiles: number) {
    return `You can only add ${maxFiles} file(s).`;
  },
  fileNotSupported() {
    return "The file is not supported.";
  },
};

const MultiImageDropzone = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { dropzoneOptions, value, className, disabled, onChange, onFilesAdded },
    ref
  ) => {
    const [customError, setCustomError] = React.useState<string>();

    const imageUrls = React.useMemo(() => {
      if (value) {
        return value.map((fileState) => {
          if (typeof fileState.file === "string") {
            // in case a url is passed in, use it to display the image
            return fileState.file;
          } else {
            // in case a file is passed in, create a base64 url to display the image
            return URL.createObjectURL(fileState.file);
          }
        });
      }
      return [];
    }, [value]);

    // dropzone configuration
    const {
      getRootProps,
      getInputProps,
      fileRejections,
      isFocused,
      isDragAccept,
      isDragReject,
    } = useDropzone({
      accept: { "image/*": [] },
      disabled,
      onDrop: (acceptedFiles) => {
        const files = acceptedFiles;
        setCustomError(undefined);
        if (
          dropzoneOptions?.maxFiles &&
          (value?.length ?? 0) + files.length > dropzoneOptions.maxFiles
        ) {
          setCustomError(ERROR_MESSAGES.tooManyFiles(dropzoneOptions.maxFiles));
          return;
        }
        if (files) {
          const addedFiles = files.map<FileState>((file) => ({
            file,
            key: Math.random().toString(36).slice(2),
            progress: "PENDING",
          }));
          void onFilesAdded?.(addedFiles);
          void onChange?.([...(value ?? []), ...addedFiles]);
        }
      },
      ...dropzoneOptions,
    });

    // styling
    const dropZoneClassName = React.useMemo(
      () =>
        twMerge(
          variants.base,
          isFocused && variants.active,
          disabled && variants.disabled,
          (isDragReject ?? fileRejections[0]) && variants.reject,
          isDragAccept && variants.accept,
          className
        ).trim(),
      [
        isFocused,
        fileRejections,
        isDragAccept,
        isDragReject,
        disabled,
        className,
      ]
    );

    // error validation messages
    const errorMessage = React.useMemo(() => {
      if (fileRejections[0]) {
        const { errors } = fileRejections[0];
        if (errors[0]?.code === "file-too-large") {
          return ERROR_MESSAGES.fileTooLarge(dropzoneOptions?.maxSize ?? 0);
        } else if (errors[0]?.code === "file-invalid-type") {
          return ERROR_MESSAGES.fileInvalidType();
        } else if (errors[0]?.code === "too-many-files") {
          return ERROR_MESSAGES.tooManyFiles(dropzoneOptions?.maxFiles ?? 0);
        } else {
          return ERROR_MESSAGES.fileNotSupported();
        }
      }
      return undefined;
    }, [fileRejections, dropzoneOptions]);

    return (
      <div className="w-full flex flex-col items-center gap-3 h-full">
        {(!value || value.length < (dropzoneOptions?.maxFiles ?? 0)) && (
          <div className="flex flex-col items-center h-full gap-2 w-full">
            {/* Dropzone */}
            {(!value || value.length < (dropzoneOptions?.maxFiles ?? 0)) && (
              <div
                {...getRootProps({
                  className: dropZoneClassName,
                })}
              >
                {/* Main File Input */}
                <input ref={ref} {...getInputProps()} />
                <div className="flex flex-col items-center justify-center text-xs text-darkPrimary">
                  <IoIosCloudUpload className="mb-2 h-7 w-7" />
                  <div className="text-center">
                    drag & drop to upload <br /> Up to 5 images of size 5mb each
                  </div>
                  <div className="mt-3">
                    <Button disabled={disabled}>select</Button>
                  </div>
                </div>
              </div>
            )}

            {/* Error Text */}

            <div className="mt-1 text-sm text-capuut">
              {customError ?? errorMessage}
            </div>
          </div>
        )}

        {/* Images */}
        {value && value.length > 0 && (
          <div className="flex flex-col h-full w-full items-center justify-between gap-2 rounded-md">
            {value?.map(({ file, progress }, index) => (
              <div
                key={index}
                className={`bg-darkPrimary rounded-md h-full flex items-center justify-center w-full`}
              >
                <Dialog>
                  <DialogTrigger asChild>
                    <button
                      type="button"
                      className={`text-white text-center bg-darkPrimary h-full w-full rounded-md px-2 py-1`}
                    >
                      {typeof file === "string"
                        ? file
                        : file.name.length > 30
                        ? file.name.slice(0, 25) + "..." + file.name.slice(-5)
                        : file.name}
                    </button>
                  </DialogTrigger>
                  <DialogContent className="flex flex-col items-center max-h-screen justify-center bg-darkPrimary border-transparent text-white">
                    <DialogHeader>Preview Image</DialogHeader>
                    <Image
                      className="h-full max-h-[80vh] w-full rounded-md object-cover"
                      src={imageUrls[index]}
                      alt={typeof file === "string" ? file : file.name}
                      height={1000}
                      width={1000}
                    />
                    {/* Remove Image Icon */}
                    {imageUrls[index] &&
                      !disabled &&
                      progress === "PENDING" && (
                        <DialogClose
                          className="w-full bg-capuut text-center text-white rounded-lg px-2 py-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            void onChange?.(
                              value.filter((_, i) => i !== index) ?? []
                            );
                          }}
                        >
                          Remove
                        </DialogClose>
                      )}
                  </DialogContent>
                </Dialog>
                {/* Progress Bar */}
                {typeof progress === "number" && (
                  <div className="absolute top-0 left-0 flex h-full w-full items-center justify-center rounded-md bg-black bg-opacity-70">
                    <CircleProgress progress={progress} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);
MultiImageDropzone.displayName = "MultiImageDropzone";

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  return (
    <button
      type="button"
      className={twMerge(
        // base
        "focus-visible:ring-ring inline-flex cursor-pointer items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50",
        // color
        "border border-gray-400 text-darkPrimary shadow hover:bg-darkPrimary hover:text-lightPrimary ",
        // size
        "h-6 rounded-md px-2 text-xs",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { MultiImageDropzone };

function CircleProgress({ progress }: { progress: number }) {
  const strokeWidth = 10;
  const radius = 50;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="relative h-16 w-16">
      <svg
        className="absolute top-0 left-0 -rotate-90 transform"
        width="100%"
        height="100%"
        viewBox={`0 0 ${(radius + strokeWidth) * 2} ${
          (radius + strokeWidth) * 2
        }`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="text-darkPrimary"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          cx={radius + strokeWidth}
          cy={radius + strokeWidth}
          r={radius}
        />
        <circle
          className="text-white transition-all duration-300 ease-in-out"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={((100 - progress) / 100) * circumference}
          strokeLinecap="round"
          fill="none"
          cx={radius + strokeWidth}
          cy={radius + strokeWidth}
          r={radius}
        />
      </svg>
      <div className="absolute top-0 left-0 flex h-full w-full items-center justify-center text-xs text-white">
        {Math.round(progress)}%
      </div>
    </div>
  );
}
