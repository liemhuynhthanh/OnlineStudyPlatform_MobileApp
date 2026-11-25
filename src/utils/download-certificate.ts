import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";
import { downloadCertificate } from "../api/services";

async function openPdf(file: File) {
  if (await File.canPreview(file)) {
    await File.preview(file, { title: "Chứng chỉ khóa học" });
    return;
  }
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, { dialogTitle: "Chứng chỉ khóa học", mimeType: "application/pdf" });
    return;
  }
  throw new Error("Thiết bị này không hỗ trợ mở tệp PDF.");
}

export async function downloadCertificatePdf(certificateId: string) {
  const data = await downloadCertificate(certificateId);
  const fileName = `certificate-${certificateId}.pdf`;

  if (Platform.OS === "web") {
    const blob = data as Blob;
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
    return;
  }

  const file = new File(Paths.cache, fileName);
  if (file.exists) file.delete();
  file.create();
  await file.write(data as Uint8Array);
  await openPdf(file);
}
