package org.example.sellsight.user.application.port;

/**
 * Outbound port for avatar image storage. Adapter-agnostic — backed by
 * Cloudinary today, but could be S3/local FS without changing use cases.
 */
public interface AvatarStoragePort {

    /**
     * Upload raw image bytes for the given user. Returns the publicly
     * accessible secure URL of the stored asset.
     */
    String upload(String userId, byte[] bytes, String contentType);

    /**
     * Best-effort delete by previously returned URL. No-op if URL is null
     * or asset cannot be located.
     */
    void delete(String url);
}
