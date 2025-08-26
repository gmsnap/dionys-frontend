import imageCompression from "browser-image-compression";

export const compressImage = async (file: File) => {
    // Only compress if it's an image
    if (file.type.startsWith("image/")) {
        const options = {
            maxSizeMB: 0.8,
            maxWidthOrHeight: 1080,
            useWebWorker: true
        };
        return await imageCompression(file, options);
    }

    return file;
}

export const uploadFile = async (uploadUrl: string, file: File) => {
    try {
        const uploadFile: File = await compressImage(file);

        const uploadResponse = await fetch(uploadUrl, {
            method: "PUT",
            body: uploadFile,
            headers: {
                "Content-Type": uploadFile.type,
            },
        });

        if (!uploadResponse.ok) {
            throw new Error("Failed to upload the file.");
        }
    } catch (error) {
        console.error("File upload error:", error);
    }
};