import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
}

export function FileUploader({ onFilesSelected, accept }: FileUploaderProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFilesSelected(acceptedFiles);
    },
    [onFilesSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept
      ? {
          [accept.includes("image") ? "image/*" : "application/*"]: accept.split(","),
        }
      : undefined,
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
        ${isDragActive ? "border-primary bg-primary/10" : "border-border"}`}
    >
      <input {...getInputProps()} />
      <div className="space-y-2">
        <div className="flex justify-center">
          <Button type="button" variant="outline">
            Select File
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">{isDragActive ? "Drop the file here" : "Drag and drop a file here, or click to select file"}</p>
      </div>
    </div>
  );
}
