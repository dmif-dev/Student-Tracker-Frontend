"use client";

import React from "react";
import LoaderOne from "@/components/ui/loader-one";
import { Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
    value?: string;
    onChange: (url?: string) => void;
    error?: boolean;
}

import { apiClient } from "@/utils/apiClient";

export function ImageUpload({ value, onChange, error }: ImageUploadProps) {
    const [isUploading, setIsUploading] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            uploadFile(file);
        }
    };

    const uploadFile = async (file: File) => {
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            // using the document upload endpoint since it handles files
            const response = await apiClient.post<any>('documents/upload', formData);
            if (response && response.fileUrl) {
                onChange(response.fileUrl);
            } else if (response && response.url) {
                onChange(response.url);
            }
        } catch (error) {
            console.error("Upload failed", error);
        } finally {
            setIsUploading(false);
        }
    };

    const removeImage = () => {
        onChange(undefined);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith("image/")) {
            uploadFile(file);
        }
    };

    return (
        <div className="space-y-4">
            {value ? (
                <div className="relative group w-full aspect-video md:w-64 rounded-lg overflow-hidden border bg-muted">
                    <img src={value} alt="Upload preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="h-9 w-9"
                            onClick={removeImage}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            ) : (
                <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex flex-col items-center justify-center w-full aspect-video md:w-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${error ? "border-red-500 bg-red-50/10" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
                        }`}
                >
                    {isUploading ? (
                        <div className="flex flex-col items-center gap-2">
                            <LoaderOne />
                            <p className="text-xs text-muted-foreground font-medium">Uploading...</p>
                        </div>
                    ) : (
                        <>
                            <div className="p-3 rounded-full bg-primary/10 mb-3">
                                <Upload className="h-6 w-6 text-primary" />
                            </div>
                            <p className="text-sm font-semibold">Click to browse</p>
                            <p className="text-xs text-muted-foreground mt-1">or drag and drop JPG, PNG</p>
                        </>
                    )}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                    />
                </div>
            )}
        </div>
    );
}
