import multer from 'multer';
import path from 'path';

// Configure storage - store in memory for S3 upload
const storage = multer.memoryStorage();

// File filter for images and CSV
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'text/csv', 'application/vnd.ms-excel'];
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.csv'];
  
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedMimes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, png, webp, gif) and CSV files are allowed'));
  }
};

// Configure multer
export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for CSV files
  },
});

export default uploadMiddleware;
