package org.example.sellsight.user.infrastructure.storage;

import com.cloudinary.Cloudinary;
import com.cloudinary.Transformation;
import com.cloudinary.utils.ObjectUtils;
import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.user.application.port.AvatarStoragePort;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;

/**
 * Cloudinary-backed avatar storage. Uploads to a per-user public_id under
 * the `sellsight/avatars/` folder, applying a square 512x512 face-aware
 * crop on upload so the stored asset is already optimized for display.
 */
@Slf4j
@Component
public class CloudinaryAvatarAdapter implements AvatarStoragePort {

    private static final String FOLDER = "sellsight/avatars";
    private static final int OUTPUT_SIZE = 512;

    private final Cloudinary cloudinary;

    public CloudinaryAvatarAdapter(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    @Override
    public String upload(String userId, byte[] bytes, String contentType) {
        try {
            Map<String, Object> params = ObjectUtils.asMap(
                    "public_id", userId,
                    "folder", FOLDER,
                    "overwrite", true,
                    "invalidate", true,
                    "resource_type", "image",
                    "transformation", new Transformation()
                            .width(OUTPUT_SIZE)
                            .height(OUTPUT_SIZE)
                            .gravity("face")
                            .crop("fill")
                            .quality("auto")
                            .fetchFormat("auto")
            );
            @SuppressWarnings("unchecked")
            Map<String, Object> result = cloudinary.uploader().upload(bytes, params);
            Object url = result.get("secure_url");
            if (url == null) {
                throw new IllegalStateException("Cloudinary upload returned no secure_url");
            }
            return url.toString();
        } catch (IOException ex) {
            log.error("Cloudinary avatar upload failed for user {}", userId, ex);
            throw new RuntimeException("Failed to upload avatar", ex);
        }
    }

    @Override
    public void delete(String url) {
        if (url == null || url.isBlank()) {
            return;
        }
        String publicId = extractPublicId(url);
        if (publicId == null) {
            return;
        }
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.asMap("invalidate", true));
        } catch (IOException ex) {
            log.warn("Cloudinary avatar delete failed for {}: {}", publicId, ex.getMessage());
        }
    }

    /**
     * Cloudinary URLs look like:
     *   https://res.cloudinary.com/<cloud>/image/upload/v1234/sellsight/avatars/<userId>.jpg
     * Extract the path segment after `/upload/(vNNN/)?` and strip the extension.
     */
    private String extractPublicId(String url) {
        int uploadIdx = url.indexOf("/upload/");
        if (uploadIdx < 0) return null;
        String tail = url.substring(uploadIdx + "/upload/".length());
        if (tail.startsWith("v") && tail.contains("/")) {
            tail = tail.substring(tail.indexOf('/') + 1);
        }
        int dot = tail.lastIndexOf('.');
        return dot > 0 ? tail.substring(0, dot) : tail;
    }
}
