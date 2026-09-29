const express = require("express");
const authenticate = require("../middleware/authenticate");
const {
  uploadAvatar: uploadAvatarConfig,
  uploadLogo: uploadLogoConfig,
  uploadGalleryImg,
} = require("../config/upload");
const { uploadAvatar, uploadLogo, uploadImage } = require("../controllers/uploadController");

const router = express.Router();

router.use(authenticate);

/**
 * POST /api/upload/avatar
 * Champ form-data : "avatar" (fichier image)
 */
router.post(
  "/avatar",
  uploadAvatarConfig.single("avatar"),
  uploadAvatar
);

/**
 * POST /api/upload/logo
 * Champ form-data : "logo" (fichier image)
 */
router.post(
  "/logo",
  uploadLogoConfig.single("logo"),
  uploadLogo
);

/**
 * POST /api/upload/image
 * Champ form-data : "image" (fichier image)
 */
router.post("/image", uploadGalleryImg.single("image"), uploadImage);

module.exports = router;
