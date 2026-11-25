export function avatarMimeType(fileName: string): string {
  const extension = fileName.split(".").pop()?.toLowerCase();
  if (extension === "jpg" || extension === "jpeg") return "image/jpeg";
  if (extension === "png") return "image/png";
  if (extension === "webp") return "image/webp";
  if (extension === "gif") return "image/gif";
  return "application/octet-stream";
}

export function createAvatarFormData(uri: string | Blob, fileName: string): FormData {
  const formData = new FormData();
  if (typeof uri === "string") formData.append("avatar", { uri, name: fileName, type: avatarMimeType(fileName) } as unknown as Blob);
  else formData.append("avatar", uri, fileName);
  return formData;
}
