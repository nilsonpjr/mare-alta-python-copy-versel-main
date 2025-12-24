
import { api } from './api';

// This service now uploads to the Python Backend, which then proxies to Supabase S3
// This avoids exposing S3 credentials in the frontend.

export const uploadImage = async (file: File, path: string) => {
    const formData = new FormData();
    formData.append('file', file);

    // We ignore 'path' here because the backend generates a safe UUID filename
    // If you want to support folders, you'd need to send 'path' as a query param or form field to the backend.

    try {
        const response = await api.post('/upload/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data.url;
    } catch (error) {
        console.error('Upload failed:', error);
        throw error;
    }
};

export const supabase = null; // Deprecated client access
