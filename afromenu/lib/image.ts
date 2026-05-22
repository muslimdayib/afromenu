/**
 * Client-side image compression and scaling utility.
 * Protects mobile devices from crashes by resizing uploads to a maximum width.
 */
export function resizeImage(file: File, maxWidth: number = 800): Promise<File> {
  return new Promise((resolve, reject) => {
    // If it's not an image, resolve immediately with original file
    if (!file.type.startsWith("image/")) {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // If the image is already smaller than the max width, don't up-scale it, just compress
        if (width > maxWidth) {
          const ratio = maxWidth / width;
          width = maxWidth;
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return resolve(file); // Fallback to original file
        }

        // Draw and compress image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve(file); // Fallback
            }
            // Create a new File from the blob
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(resizedFile);
          },
          file.type,
          0.85 // Image quality compression factor (85%)
        );
      };
      img.onerror = () => {
        resolve(file); // Fallback on image load error
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      resolve(file); // Fallback on reader error
    };
    reader.readAsDataURL(file);
  });
}
