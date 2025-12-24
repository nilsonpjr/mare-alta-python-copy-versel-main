
from fastapi import APIRouter, UploadFile, File, HTTPException
from services.storage_service import upload_file_to_storage
import uuid

router = APIRouter(prefix="/api/upload", tags=["Upload"])

@router.post("/", response_model=dict)
async def upload_image(file: UploadFile = File(...)):
    """
    Uploads an image to Supabase Storage and returns the public URL.
    """
    try:
        # Validate file type (optional but good practice)
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Only image files are allowed.")

        # Generate unique filename to prevent collisions
        file_ext = file.filename.split(".")[-1]
        if not file_ext:
            file_ext = "jpg" # Default fallback
            
        filename = f"{uuid.uuid4()}.{file_ext}"
        
        # Determine content type
        content_type = file.content_type or "application/octet-stream"
        
        # Upload
        url = upload_file_to_storage(file.file, filename, content_type)
        
        return {"url": url}
    except Exception as e:
        print(f"Upload failed: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
