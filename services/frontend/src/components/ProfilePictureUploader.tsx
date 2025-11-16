import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { X, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ProfilePicDropzone() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return;
    const f = acceptedFiles[0];

    if (!["image/png", "image/jpeg"].includes(f.type)) {
      toast.error("Only .png or .jpeg files are allowed.");
      return;
    }
    if (f.size > 2 * 1024 * 1024) {
      toast.error("File size must not exceed 2MB.");
      return;
    }

    setFile(f);
    setLoading(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
      setTimeout(() => setLoading(false), 400); // simulate loading
    };
    reader.readAsDataURL(f);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpeg", ".jpg"],
    },
  });

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        {...getRootProps()}
        className={`relative flex items-center justify-center w-36 h-36 border-2 border-dashed rounded-full cursor-pointer transition-colors overflow-hidden ${
          isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
        }`}
      >
        <input {...getInputProps()} />
        {preview ? (
          <>
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            {loading && (
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center text-white font-semibold text-sm">
                Uploading...
              </div>
            )}
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow"
            >
              <X size={16} />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-500 text-sm text-center px-2">
            <UploadCloud size={32} className="mb-1" />
            {isDragActive ? "Drop here..." : "Drag & drop or click"}
          </div>
        )}
      </div>

      {file && !loading && (
        <Button type="button" variant="default">
          Save
        </Button>
      )}
    </div>
  );
}
