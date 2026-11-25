import { File } from "expo-file-system";

export function createAvatarFormData(uri: string | Blob, fileName: string): FormData {
  const formData = new FormData();
  if (typeof uri === "string") formData.append("avatar", new File(uri) as unknown as Blob, fileName);
  else formData.append("avatar", uri, fileName);
  return formData;
}
