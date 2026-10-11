import express from 'express';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();


router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please upload an image file' });
  }

  const imageUrl = `/uploads/${req.file.filename}`;
  res.status(201).json({
    success: true,
    message: 'Image uploaded successfully using Multer',
    imageUrl,
    filename: req.file.filename,
    mimetype: req.file.mimetype,
    size: req.file.size,
  });
});

export default router;
