// lib/upload-service.ts
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ;
const UPLOAD_PRESET = "suredeal-presets";

export const UploadService = {
  /**
   * @param file - On web, this is a File object from an input field
   */
  async uploadMedia(file: File | Blob, type: "image" | "video"): Promise<string> {
    const formData = new FormData();
    
    // Web handles the file object metadata automatically
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const resourceType = type === "image" ? "image" : "video";
    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;

    try {
      const response = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
        // Headers: Do NOT set Content-Type; the browser will set it with the correct boundary
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      
      return data.secure_url;
    } catch (error) {
      console.error("Cloudinary Web Upload Error:", error);
      throw error;
    }
  },
};