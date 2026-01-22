//cloudinary에 이미지를 업로드 하는 함수

export const uploadImageToCloudinaryForChatting = async (
  folder,
  fileBuffer
) => {
  const uploadResult = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: folder },
      (error, result) => (error ? reject(error) : resolve(result))
    );

    stream.end(fileBuffer);
  });

  const imageUrl = uploadResult.secure_url;
  const finalContent = "사진을 보냈습니다.";

  return { imageUrl, finalContent };
};
