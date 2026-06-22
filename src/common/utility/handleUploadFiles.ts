import { toast } from 'sonner';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/heic', 'image/heif', 'image/webp', 'image/jpg'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function handleUploadFiles(
  files: File[],
): Promise<{ id: string; file: File; thumbnail: string }[]> {
  const sheets: { id: string; file: File; thumbnail: string }[] = [];

  try {
    for (const file of files) {
      if (!ACCEPTED_TYPES.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|heic|heif|webp)$/i)) {
        toast.error(`${file.name} is not a supported image format. Please use JPG, PNG, HEIC, or WebP.`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} exceeds 10MB limit.`);
        continue;
      }

      const thumbnail = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const maxWidth = 400;
            const scaleFactor = maxWidth / img.width;
            canvas.width = maxWidth;
            canvas.height = img.height * scaleFactor;
            ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', 0.8));
          };
          img.onerror = reject;
          img.src = e.target?.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      sheets.push({
        id: `sheet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        thumbnail,
      });
    }
  } catch (error) {
    toast.error('Failed to process images. Please try again.');
  }

  return sheets;
}
