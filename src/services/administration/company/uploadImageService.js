import axios from 'axios';

const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_UPLOAD_PRESET
UPLOAD_PRESET;

/**
 * @param {File} imageFile El archivo de imagen a subir.
 * @returns {Promise<string>} La URL segura de la imagen subida.
 */
export const uploadImageToCloudinary = async (imageFile) => {
  if (!imageFile) {
    throw new Error('No se ha proporcionado un archivo de imagen.');
  }

  const formData = new FormData();
  formData.append('file', imageFile);
  formData.append('upload_preset', UPLOAD_PRESET);

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      formData
    );
    return response.data.secure_url;
  } catch (error) {
    console.error('Error al subir la imagen a Cloudinary:', error);
    throw new Error('No se pudo subir la imagen. Inténtelo de nuevo.');
  }
};