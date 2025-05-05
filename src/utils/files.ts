// src/utils/files.ts
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { saveAs } from 'file-saver';

export async function savePlatformFile(
  blob: Blob,
  fileName: string,
  mime: string
): Promise<void> {
  const platform = Capacitor.getPlatform();  
  if (platform === 'web') {
    // en navegador: lanzamos descarga con file-saver
    saveAs(blob, fileName);
  } else {
    // en iOS/Android: escribimos y compartimos
    const base64 = await new Promise<string>((res, rej) => {
      const reader = new FileReader();
      reader.onload = () => res((reader.result as string).split(',')[1]);
      reader.onerror = rej;
      reader.readAsDataURL(blob);
    });
    const written = await Filesystem.writeFile({
      path: fileName,
      data: base64,
      directory: Directory.Documents,
    });
    await Share.share({
      title: fileName,
      url: written.uri,
      dialogTitle: 'Compartir o abrir',
    });
  }
}
