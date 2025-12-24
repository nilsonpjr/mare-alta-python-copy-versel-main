
import boto3
from botocore.client import Config

# Credentials provided by user
# TODO: Move these to environment variables for production security
ENDPOINT_URL = "https://vrikuvzrnpzxianctycs.storage.supabase.co/storage/v1/s3"
ACCESS_KEY = "acb5603c6fd3b7c3bbe8b4fc453fb45e"
SECRET_KEY = "64233ab38016796f0de91e214d140a7b063939129bed4806bcb9b10faab8c812"
REGION = "us-east-2"
BUCKET_NAME = "images"
PROJECT_ID = "vrikuvzrnpzxianctycs"

def get_s3_client():
    return boto3.client(
        's3',
        endpoint_url=ENDPOINT_URL,
        aws_access_key_id=ACCESS_KEY,
        aws_secret_access_key=SECRET_KEY,
        region_name=REGION,
        config=Config(signature_version='s3v4')
    )

def upload_file_to_storage(file_obj, filename, content_type):
    """
    Uploads a file-like object to Supabase Storage via S3 protocol.
    Returns the public URL of the uploaded file.
    """
    s3 = get_s3_client()
    try:
        s3.upload_fileobj(
            file_obj,
            BUCKET_NAME,
            filename,
            ExtraArgs={'ContentType': content_type}
        )
        # Construct Public URL
        # Standard Supabase Storage Public URL pattern
        public_url = f"https://{PROJECT_ID}.supabase.co/storage/v1/object/public/{BUCKET_NAME}/{filename}"
        return public_url
    except Exception as e:
        print(f"S3 Upload Error: {e}")
        raise e
