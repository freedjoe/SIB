import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, X, FileText, Image, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Document {
  id: string;
  title: string;
  description?: string;
  filename: string;
  type: "document" | "photo";
  url: string;
  created_at: string;
  filesize?: number;
}

interface DocumentsAndPhotosTabProps {
  documents: Document[];
  onAddDocument: (file: File, type: "document" | "photo", title: string, description?: string) => Promise<void>;
  onRemoveDocument: (documentId: string) => Promise<void>;
  onPrevious?: () => void;
  onNext?: () => void;
}

export const DocumentsAndPhotosTab: React.FC<DocumentsAndPhotosTabProps> = ({ documents, onAddDocument, onRemoveDocument, onPrevious, onNext }) => {
  const { toast } = useToast();
  const [uploadType, setUploadType] = useState<"document" | "photo" | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !uploadType || !title) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill all required fields and select a file.",
      });
      return;
    }

    try {
      await onAddDocument(selectedFile, uploadType, title, description);
      setTitle("");
      setDescription("");
      setSelectedFile(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const openUploadDialog = (type: "document" | "photo") => {
    setUploadType(type);
    setIsDialogOpen(true);
  };

  const documents_only = documents.filter((doc) => doc.type === "document");
  const photos_only = documents.filter((doc) => doc.type === "photo");

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Documents & Photos</CardTitle>
          <CardDescription>Upload and manage documents and photos for this operation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Documents</h3>
              <Button variant="outline" onClick={() => openUploadDialog("document")}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </div>

            {documents_only.length === 0 ? (
              <div className="border border-dashed p-8 text-center rounded-lg">
                <FileText className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-gray-500">No documents attached to this operation</p>
                <Button variant="link" onClick={() => openUploadDialog("document")}>
                  Upload your first document
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documents_only.map((doc) => (
                  <div key={doc.id} className="border rounded-lg p-4 flex justify-between items-start">
                    <div className="flex items-start space-x-3">
                      <FileText className="h-10 w-10 text-blue-500 shrink-0 mt-1" />
                      <div>
                        <h4 className="font-medium">{doc.title}</h4>
                        {doc.description && <p className="text-sm text-gray-500">{doc.description}</p>}
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(doc.created_at).toLocaleDateString()} • {doc.filename} •
                          {doc.filesize && ` ${(doc.filesize / 1024 / 1024).toFixed(2)} MB`}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" asChild>
                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                          View
                        </a>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onRemoveDocument(doc.id)}>
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Photos</h3>
              <Button variant="outline" onClick={() => openUploadDialog("photo")}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Photo
              </Button>
            </div>

            {photos_only.length === 0 ? (
              <div className="border border-dashed p-8 text-center rounded-lg">
                <Image className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-gray-500">No photos attached to this operation</p>
                <Button variant="link" onClick={() => openUploadDialog("photo")}>
                  Upload your first photo
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {photos_only.map((photo) => (
                  <div key={photo.id} className="border rounded-lg overflow-hidden">
                    <div className="aspect-video relative">
                      <img src={photo.url} alt={photo.title} className="w-full h-full object-cover" />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1"
                        onClick={() => onRemoveDocument(photo.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="p-3">
                      <h4 className="font-medium text-sm truncate">{photo.title}</h4>
                      {photo.description && <p className="text-xs text-gray-500 truncate">{photo.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onPrevious}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button onClick={onNext}>
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{uploadType === "document" ? "Upload Document" : "Upload Photo"}</DialogTitle>
            <DialogDescription>
              {uploadType === "document" ? "Upload a document related to this operation" : "Upload a photo of the operation site or progress"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title*</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter a title for this file" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a brief description..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="file">File*</Label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept={uploadType === "photo" ? "image/*" : undefined}
                        onChange={handleFileSelect}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    {uploadType === "photo" ? "PNG, JPG, JPEG up to 10MB" : "PDF, DOC, DOCX, XLS, XLSX up to 10MB"}
                  </p>
                </div>
              </div>
              {selectedFile && <p className="text-sm text-green-600 mt-2">Selected file: {selectedFile.name}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpload}>Upload</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
