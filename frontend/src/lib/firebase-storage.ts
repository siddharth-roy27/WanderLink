import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/lib/firebase';

/**
 * Upload image to Firebase Storage
 * @param file - File to upload
 * @param folder - Folder path (e.g., 'trips', 'profiles')
 * @returns Download URL of uploaded file
 */
export const uploadImage = async (file: File, folder: string = 'uploads'): Promise<string> => {
  try {
    // Create unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;
    const storagePath = `${folder}/${filename}`;
    
    const storageRef = ref(storage, storagePath);
    
    // Upload file
    await uploadBytes(storageRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

/**
 * Upload multiple images
 * @param files - Array of files to upload
 * @param folder - Folder path
 * @returns Array of download URLs
 */
export const uploadMultipleImages = async (
  files: File[],
  folder: string = 'uploads'
): Promise<string[]> => {
  try {
    const uploadPromises = files.map(file => uploadImage(file, folder));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw error;
  }
};

/**
 * Delete file from Firebase Storage
 * @param url - File URL to delete
 */
export const deleteFile = async (url: string): Promise<void> => {
  try {
    const fileRef = ref(storage, url);
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

/**
 * Get file reference from URL
 * @param url - File URL
 * @returns Storage reference
 */
export const getFileRef = (url: string) => {
  return ref(storage, url);
};
