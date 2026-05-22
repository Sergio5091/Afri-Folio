const express = require("express");
const authenticate = require("../middleware/authenticate");
const { uploadProjectImg } = require("../config/upload");
const {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  uploadProjectImage,
} = require("../controllers/projectsController");

const router = express.Router();
router.use(authenticate);

router.get("/", getProjects);
router.post("/", createProject);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);
router.post("/:id/image", uploadProjectImg.single("image"), uploadProjectImage);

module.exports = router;
