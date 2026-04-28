-- User avatar URL (Cloudinary secure_url)
ALTER TABLE users
    ADD COLUMN avatar_url VARCHAR(512);
