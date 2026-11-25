export function createAvatarFormData(uri: string | Blob, fileName: string): FormData {
  const formData = new FormData();
  if (typeof uri === "string") formData.append("avatar", uri);
  else formData.append("avatar", uri, fileName);
  return formData;
}
