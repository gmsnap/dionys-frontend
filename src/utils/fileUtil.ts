export const uploadFile = async (uploadUrl: string, file: File) => {
    try {
        const uploadResponse = await fetch(uploadUrl, {
            method: "PUT",
            body: file,
            headers: {
                "Content-Type": file.type,
            },
        });

        if (!uploadResponse.ok) {
            throw new Error("Failed to upload the file.");
        }
    } catch (error) {
        console.error("File upload error:", error);
    }
};