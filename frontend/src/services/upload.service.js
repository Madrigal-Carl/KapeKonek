import api from "@/api/axios";

export async function getUploadSignature({ type }) {
    const response = await api.post("/uploads/signature", { type });
    return response.data;
}

// Uploads to Cloudinary. When an onProgress callback is provided it is
// invoked with (loadedBytes, totalBytes) as the request uploads.
export async function uploadToCloudinary(file, type, onProgress) {
    const { url, apiKey, timestamp, signature, folder, useFilename, uniqueFilename } =
        await getUploadSignature({ type });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);
    formData.append("folder", folder);
    formData.append("use_filename", useFilename);
    formData.append("unique_filename", uniqueFilename);

    return await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", url);

        if (typeof onProgress === "function") {
            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    onProgress(event.loaded, event.total);
                }
            };
        }

        xhr.onload = () => {
            let data;
            try {
                data = JSON.parse(xhr.responseText);
            } catch {
                return reject(new Error("Upload failed"));
            }

            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(data);
            } else {
                reject(new Error(data?.error?.message || "Upload failed"));
            }
        };

        xhr.onerror = () => reject(new Error("Upload failed"));

        xhr.send(formData);
    });
}
