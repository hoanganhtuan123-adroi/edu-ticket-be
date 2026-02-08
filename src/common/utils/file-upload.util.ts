// import { promises as fs } from 'fs';
// import path from 'path';
// import { v4 as uuidv4 } from 'uuid';

// export interface FileUploadResult {
//   filename: string;
//   originalName: string;
//   size: number;
//   mimetype: string;
//   url: string;
// }

// export interface UploadedFile {
//   fieldname: string;
//   originalname: string;
//   encoding: string;
//   mimetype: string;
//   size: number;
//   destination: string;
//   filename: string;
//   path: string;
//   buffer: Buffer;
// }

// export class FileUploadUtil {
//   private static readonly UPLOAD_DIR = 'uploads';
//   private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
//   private static readonly CHUNK_SIZE = 1024 * 1024; // 1MB chunks
//   private static readonly ALLOWED_MIME_TYPES = [
//     'image/jpeg',
//     'image/jpg',
//     'image/png',
//     'image/gif',
//     'image/webp',
//   ];

//   /**
//    * Upload file with chunking support
//    */
//   static async uploadFile(
//     file: UploadedFile,
//     subfolder: string = 'events'
//   ): Promise<FileUploadResult> {
//     try {
//       // Validate file
//       this.validateFile(file);

//       // Create upload directory if not exists
//       const cwd = process.cwd();
//       if (!cwd) {
//         throw new Error('Current working directory is not available');
//       }

//       if (!subfolder) {
//         throw new Error('Subfolder is not provided');
//       }

//       const uploadDir = path.join(cwd, this.UPLOAD_DIR, subfolder);
//       await fs.mkdir(uploadDir, { recursive: true });

//       // Generate unique filename
//       const fileExtension = path.extname(file.originalname);
//       const filename = `${uuidv4()}${fileExtension}`;
//       const filePath = path.join(uploadDir, filename);

//       // Write file in chunks
//       await this.writeFileInChunks(file.buffer, filePath);

//       // Generate URL
//       const relativePath = path.join(this.UPLOAD_DIR, subfolder, filename);
//       const url = `/${relativePath.replace(/\\/g, '/')}`;

//       return {
//         filename,
//         originalName: file.originalname,
//         size: file.size,
//         mimetype: file.mimetype,
//         url,
//       };
//     } catch (error) {
//       throw new Error(`File upload failed: ${error.message}`);
//     }
//   }

//   /**
//    * Move uploaded file from temp location to final destination
//    */
//   static async moveUploadedFile(
//     tempPath: string,
//     originalName: string,
//     subfolder: string = 'events'
//   ): Promise<FileUploadResult> {
//     try {
//       // Debug logging
//       console.log('moveUploadedFile called with:', {
//         tempPath,
//         originalName,
//         subfolder
//       });

//       // Validate inputs
//       if (!tempPath) {
//         throw new Error('Temp file path is not provided');
//       }

//       if (!originalName) {
//         throw new Error('Original file name is not provided');
//       }

//       if (!subfolder) {
//         throw new Error('Subfolder is not provided');
//       }

//       // Create upload directory if not exists
//       const cwd = process.cwd();
//       console.log('Current working directory:', cwd);

//       if (!cwd) {
//         throw new Error('Current working directory is not available');
//       }

//       console.log('UPLOAD_DIR constant:', this.UPLOAD_DIR);
//       console.log('All path.join parameters:', cwd, this.UPLOAD_DIR, subfolder);

//       const uploadDir = path.join(cwd, this.UPLOAD_DIR, subfolder);
//       console.log('Upload directory path:', uploadDir);

//       await fs.mkdir(uploadDir, { recursive: true });

//       // Generate unique filename
//       const fileExtension = path.extname(originalName);
//       const filename = `${uuidv4()}${fileExtension}`;
//       const finalPath = path.join(uploadDir, filename);

//       // Move file from temp location to final destination
//       await fs.rename(tempPath, finalPath);

//       // Generate URL
//       const relativePath = path.join(this.UPLOAD_DIR, subfolder, filename);
//       const url = `/${relativePath.replace(/\\/g, '/')}`;

//       // Get file stats
//       const stats = await fs.stat(finalPath);

//       // Detect actual file type
//       let mimetype = 'application/octet-stream';
//       // Use extension-based detection since file-type package is not available
//       const ext = path.extname(originalName).toLowerCase();
//       const mimeMap: { [key: string]: string } = {
//         '.jpg': 'image/jpeg',
//         '.jpeg': 'image/jpeg',
//         '.png': 'image/png',
//         '.gif': 'image/gif',
//         '.webp': 'image/webp',
//       };
//       mimetype = mimeMap[ext] || 'application/octet-stream';

//       return {
//         filename,
//         originalName,
//         size: stats.size,
//         mimetype,
//         url,
//       };
//     } catch (error) {
//       throw new Error(`File move failed: ${error.message}`);
//     }
//   }

//   /**
//    * Delete file
//    */
//   static async deleteFile(filePath: string): Promise<void> {
//     try {
//       const fullPath = path.join(process.cwd(), filePath);
//       await fs.unlink(fullPath);
//     } catch (error) {
//       // Don't throw error if file doesn't exist
//       if (error.code !== 'ENOENT') {
//         throw new Error(`File deletion failed: ${error.message}`);
//       }
//     }
//   }

//   /**
//    * Validate file before upload
//    */
//   private static validateFile(file: UploadedFile): void {
//     if (!file) {
//       throw new Error('No file provided');
//     }

//     // Check file size
//     if (file.size > this.MAX_FILE_SIZE) {
//       throw new Error(`File size exceeds limit of ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`);
//     }

//     // Check file type
//     if (!this.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
//       throw new Error(`File type ${file.mimetype} is not allowed`);
//     }
//   }

//   /**
//    * Write file in chunks to handle large files
//    */
//   private static async writeFileInChunks(buffer: Buffer, filePath: string): Promise<void> {
//     const fileHandle = await fs.open(filePath, 'w');

//     try {
//       let offset = 0;

//       while (offset < buffer.length) {
//         const chunk = buffer.slice(offset, offset + this.CHUNK_SIZE);
//         await fileHandle.write(chunk, 0, chunk.length, offset);
//         offset += this.CHUNK_SIZE;
//       }
//     } finally {
//       await fileHandle.close();
//     }
//   }

//   /**
//    * Get file info
//    */
//   static async getFileInfo(filePath: string): Promise<{
//     size: number;
//     exists: boolean;
//     mimetype?: string;
//   }> {
//     try {
//       const fullPath = path.join(process.cwd(), filePath);
//       const stats = await fs.stat(fullPath);

//       return {
//         size: stats.size,
//         exists: true,
//       };
//     } catch (error) {
//       return {
//         size: 0,
//         exists: false,
//       };
//     }
//   }

//   /**
//    * Clean up old files (optional utility)
//    */
//   static async cleanupOldFiles(
//     directory: string,
//     maxAge: number = 7 * 24 * 60 * 60 * 1000 // 7 days
//   ): Promise<void> {
//     try {
//       const dirPath = path.join(process.cwd(), this.UPLOAD_DIR, directory);
//       const files = await fs.readdir(dirPath);
//       const now = Date.now();

//       for (const file of files) {
//         const filePath = path.join(dirPath, file);
//         const stats = await fs.stat(filePath);

//         if (now - stats.mtime.getTime() > maxAge) {
//           await fs.unlink(filePath);
//         }
//       }
//     } catch (error) {
//       // Ignore cleanup errors
//     }
//   }
// }

import * as path from 'path';
import * as fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

export interface FileUploadResult {
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
  url: string;
}

export class FileUploadUtil {
  private static readonly UPLOAD_DIR = 'uploads';

  // Mapping extension sang mimetype
  private static readonly MIME_MAP: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
  };

  /**
   * Di chuyển file đã upload từ thư mục temp sang thư mục đích
   */
  static async moveUploadedFile(
    tempPath: string,
    originalName: string,
    subfolder: string = 'events',
  ): Promise<FileUploadResult> {
    try {
      if (!tempPath || !originalName) {
        throw new Error('Thiếu thông tin đường dẫn file hoặc tên file gốc');
      }

      const cwd = process.cwd();
      // Resolve đường dẫn đích tuyệt đối
      const targetDir = path.join(cwd, this.UPLOAD_DIR, subfolder);

      // Tạo thư mục nếu chưa tồn tại
      await fs.mkdir(targetDir, { recursive: true });

      // Tạo tên file mới (uuid + ext)
      const fileExtension = path.extname(originalName).toLowerCase();
      const filename = `${uuidv4()}${fileExtension}`;
      const finalPath = path.join(targetDir, filename);

      // Đảm bảo đường dẫn temp là tuyệt đối để tránh lỗi
      const absoluteTempPath = path.isAbsolute(tempPath)
        ? tempPath
        : path.join(cwd, tempPath);

      // Move file (fs.rename sẽ di chuyển file, file ở temp sẽ tự mất)
      await fs.rename(absoluteTempPath, finalPath);

      // Lấy thông tin file sau khi move
      const stats = await fs.stat(finalPath);
      const mimetype =
        this.MIME_MAP[fileExtension] || 'application/octet-stream';

      // Tạo URL (Sử dụng posix để đảm bảo dấu '/' thay vì '\' trên Windows)
      // Kết quả: /uploads/events/banners/filename.png
      const relativeUrl = path.posix.join(this.UPLOAD_DIR, subfolder, filename);

      return {
        filename,
        originalName,
        size: stats.size,
        mimetype,
        url: `/${relativeUrl}`, // Đảm bảo bắt đầu bằng /
      };
    } catch (error) {
      console.error('Lỗi di chuyển file:', error);
      throw new Error(`Không thể lưu file: ${error.message}`);
    }
  }

  /**
   * Xóa file (dùng khi update ảnh mới cần xóa ảnh cũ hoặc cleanup lỗi)
   */
  static async deleteFile(filePath: string): Promise<void> {
    try {
      if (!filePath) return;

      // Xử lý trường hợp filePath là URL (bỏ dấu / ở đầu nếu có)
      const relativePath = filePath.startsWith('/')
        ? filePath.substring(1)
        : filePath;
      const fullPath = path.join(process.cwd(), relativePath);

      await fs.unlink(fullPath);
    } catch (error) {
      // Bỏ qua lỗi nếu file không tồn tại (ENOENT)
      if (error.code !== 'ENOENT') {
        console.error(`Lỗi xóa file ${filePath}:`, error.message);
      }
    }
  }
}