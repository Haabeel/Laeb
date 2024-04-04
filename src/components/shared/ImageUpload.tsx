"use client";
import React, { useState } from "react";
import { SingleImageDropzone } from "../ui/SingleImageDropzone";

const ImageUpload = ({
  containerClassname,
}: {
  containerClassname?: string;
}) => {
  const [image, setImage] = useState<File>();

  return <div className="h-full w-full"></div>;
};

export default ImageUpload;
