import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, S3_BUCKET_NAME } =
  process.env;

// Configure AWS S3 with v3
const s3 = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

// Helper function to get Content-Type based on file extension
const getContentType = (file) => {
  const ext = file.originalname.split(".").pop().toLowerCase();

  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "gif":
      return "image/gif";
    case "pdf":
      return "application/pdf";
    case "mp4":
      return "video/mp4";
    case "avi":
      return "video/avi";
    case "mov":
      return "video/quicktime";
    case "mkv":
      return "video/x-matroska";
    default:
      return "application/octet-stream"; // Default to binary stream for unknown types
  }
};

// Multer S3 Storage Configuration
const upload = multer({
  storage: multerS3({
    s3,
    bucket: S3_BUCKET_NAME,
    // Remove acl to avoid the "AccessControlListNotSupported" error
    key: (req, file, cb) => {
      const fileName = `uploads/${Date.now()}_${file.originalname}`; // Generate a unique file name
      cb(null, fileName);
    },
    contentType: (req, file, cb) => {
      const contentType = getContentType(file); // Get Content-Type based on file extension
      cb(null, contentType); // Set the Content-Type dynamically
    },
  }),
});

// Helper function to delete file from S3
const deleteFileFromS3 = async (fileKey) => {
  try {
    const deleteParams = {
      Bucket: S3_BUCKET_NAME,
      Key: fileKey, // The S3 key of the file to delete
    };
    await s3.send(new DeleteObjectCommand(deleteParams));
    // console.log(`File ${fileKey} deleted successfully from S3`);
  } catch (error) {
    //console.error("Error deleting file from S3", error);
    throw new Error("Failed to delete file from S3");
  }
};

export { upload, deleteFileFromS3 };