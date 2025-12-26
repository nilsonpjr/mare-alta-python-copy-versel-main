from database import engine, Base
import models  # Import models to register them with Base

# Create missing tables
print("Creating missing tables...")
Base.metadata.create_all(bind=engine)
print("Tables created successfully.")
