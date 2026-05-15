"use client";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, Image } from "lucide-react";

interface Props { onFile: (file: File) => void; loading: boolean; }

export default function UploadZone({ onFile, loading }: Props) {
  const [fileName, setFileName] = useState<string | null>(null);

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) { setFileName(accepted[0].name); onFile(accepted[0]); }
  }, [onFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { "application/pdf": [".pdf"], "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"] },
    maxFiles: 1, disabled: loading,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
        isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/40"
      } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-4">
        <div className="p-4 bg-blue-100 rounded-full">
          <Upload className="w-10 h-10 text-blue-600" />
        </div>
        {fileName ? (
          <div className="flex items-center gap-2 text-blue-700 font-semibold text-lg">
            <FileText className="w-5 h-5" /> {fileName}
          </div>
        ) : (
          <>
            <p className="text-xl font-semibold text-gray-700">
              {isDragActive ? "Drop your document here" : "Drop your medical bill or denial letter"}
            </p>
            <p className="text-gray-500 text-sm">PDF, JPG, or PNG — medical bill, EOB, or denial letter</p>
            <div className="flex gap-4 mt-2">
              <span className="flex items-center gap-1 text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-600"><FileText className="w-3 h-3" /> PDF</span>
              <span className="flex items-center gap-1 text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-600"><Image className="w-3 h-3" /> JPG</span>
              <span className="flex items-center gap-1 text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-600"><Image className="w-3 h-3" /> PNG</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
