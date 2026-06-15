import { storage } from '../firebaseConfig';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

export const getImageUrl = (originalUrl: string | undefined): string => {
  if (!originalUrl) return '';
  
  if (originalUrl.startsWith('data:')) {
    return originalUrl;
  }

  return originalUrl;
};

/**
 * Uploads a Base64 string to Firebase Storage and returns the public URL.
 */
export const uploadImageToFirebase = async (base64Str: string, path: string): Promise<string> => {
    try {
        const storageRef = ref(storage, path);
        await uploadString(storageRef, base64Str, 'data_url');
        const downloadURL = await getDownloadURL(storageRef);
        return downloadURL;
    } catch (error) {
        console.error("Image upload failed:", error);
        throw new Error("Failed to upload image");
    }
};

/**
 * Aggressive compression specifically for Evidence/Proof images.
 * Reduced size for faster uploads/downloads.
 */
export const processEvidenceForUpload = async (base64Str: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 500; 
      let width = img.width;
      let height = img.height;

      if (width > MAX_WIDTH) {
        height *= MAX_WIDTH / width;
        width = MAX_WIDTH;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'medium'; 
        ctx.drawImage(img, 0, 0, width, height);
      }
      
      // Evidence needs to be readable but small
      resolve(canvas.toDataURL('image/webp', 0.5));
    };
  });
};

/**
 * ULTRA-EFFICIENT IMAGE PROCESSING
 * Target: 15KB - 30KB per image (Smaller than Amazon/Flipkart)
 * Quality: 50% (Clear on Mobile, Low Data)
 * 
 * @param input - Source image (File or Base64 string)
 * @returns Processed Base64 Image (Square, White BG, WebP)
 */
export const processImageForUpload = async (input: File | string): Promise<string> => {
  let src: string = '';
  let isObjectUrl = false;
  
  try {
      let sourceImage: HTMLImageElement | ImageBitmap;

      // 1. MEMORY EFFICIENT DECODING (CRITICAL FOR MOBILE)
      // If it's a File, use createImageBitmap to decode it off the main thread
      // and resize it *during* the decode phase. This prevents the browser from
      // ever loading the full 10MB+ image into RAM, preventing OOM crashes.
      if (input instanceof File && 'createImageBitmap' in window) {
          // Decode AND resize simultaneously to prevent massive uncompressed bitmaps in RAM
          // A 4000x3000 JPEG becomes a 48MB uncompressed bitmap if not resized during decode!
          sourceImage = await createImageBitmap(input, {
              resizeWidth: 800, // Safe max width
              resizeQuality: 'medium'
          });
      } else {
          // Fallback for strings (Base64) or older browsers
          if (input instanceof File) {
              src = URL.createObjectURL(input);
              isObjectUrl = true;
          } else {
              src = input;
          }
          
          sourceImage = await new Promise((resolve, reject) => {
              const img = new Image();
              img.src = src;
              img.onload = () => resolve(img);
              img.onerror = reject;
          });
      }

      // 2. RESIZE FOR PROCESSING (If still too large)
      // Resize for processing if it's too huge (>600px)
      if (sourceImage.width > 600 || sourceImage.height > 600) {
          const tempCanvas = document.createElement('canvas');
          const MAX_PROC_SIZE = 500; // Reduced to 500px for Mobile Stability (Prevents Browser Crash)
          let w = sourceImage.width;
          let h = sourceImage.height;
          
          if (w > h) {
              if (w > MAX_PROC_SIZE) {
                  h *= MAX_PROC_SIZE / w;
                  w = MAX_PROC_SIZE;
              }
          } else {
              if (h > MAX_PROC_SIZE) {
                  w *= MAX_PROC_SIZE / h;
                  h = MAX_PROC_SIZE;
              }
          }
          tempCanvas.width = w;
          tempCanvas.height = h;
          const tCtx = tempCanvas.getContext('2d');
          if (tCtx) {
              tCtx.drawImage(sourceImage, 0, 0, w, h);
              // Update source image reference to the smaller canvas version
              const newSrc = tempCanvas.toDataURL('image/jpeg', 0.8);
              sourceImage = await new Promise((resolve) => {
                  const i = new Image();
                  i.src = newSrc;
                  i.onload = () => resolve(i);
              });
          }
      }

      return new Promise((resolve) => {
          const canvas = document.createElement('canvas');
          
          // SIZE: 600px is perfect for Mobile Grids (2x Density of 300px column)
          const TARGET_SIZE = 600; 
          canvas.width = TARGET_SIZE;
          canvas.height = TARGET_SIZE;
          
          const ctx = canvas.getContext('2d');
          if (ctx) {
              // 1. Fill with PURE WHITE Background
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(0, 0, TARGET_SIZE, TARGET_SIZE);
              
              // 2. Calculate "Contain" fit (Keep aspect ratio, add padding)
              let width = (sourceImage as any).width;
              let height = (sourceImage as any).height;
              
              // Add padding so product isn't touching edges
              const PADDING = 40; 
              const AVAILABLE_SIZE = TARGET_SIZE - (PADDING * 2);

              const scale = Math.min(AVAILABLE_SIZE / width, AVAILABLE_SIZE / height);
              const nw = width * scale;
              const nh = height * scale;
              const nx = (TARGET_SIZE - nw) / 2;
              const ny = (TARGET_SIZE - nh) / 2;

              // 3. Draw the image with High Smoothing
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high'; 

              ctx.drawImage(sourceImage as any, nx, ny, nw, nh);
          }
          
          // COMPRESSION MAGIC:
          // 0.5 (50%) Quality with White Background = ~15KB to 30KB
          // On mobile screens, 50% WebP is visually indistinguishable from 80% JPEG.
          resolve(canvas.toDataURL('image/webp', 0.8)); // Increased quality slightly for studio base
      });

  } catch (error) {
      console.error("Image processing error", error);
      return typeof input === 'string' ? input : ''; // Fail safe
  } finally {
      if (isObjectUrl && src) {
          URL.revokeObjectURL(src);
      }
  }
};