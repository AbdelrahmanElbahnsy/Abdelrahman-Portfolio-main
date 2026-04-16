export const uploadImage = async (file) => {
  if (!file) return "";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "portfolio_upload");

  try {
    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dygonnm8i/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();

    if (!data.secure_url) {
      throw new Error("Upload failed");
    }

    return data.secure_url;
  } catch (err) {
    console.error("Cloudinary Error:", err);
    throw err;
  }
};