import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Request } from 'express';
import { existsSync, mkdirSync, readFileSync, unlinkSync } from 'fs';

// =============================================================================
// Configuration Constants
// =============================================================================

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const ALLOWED_MIMETYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/jpg',
];

// Magic bytes signatures for file type verification
const MAGIC_BYTES: Record<string, number[][]> = {
  'image/jpeg': [
    [0xff, 0xd8, 0xff], // JPEG SOI marker
  ],
  'image/png': [
    [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], // PNG signature
  ],
  'image/webp': [
    [0x52, 0x49, 0x46, 0x46], // RIFF header (WebP starts with RIFF)
  ],
};

// Dangerous file signatures to reject
const DANGEROUS_SIGNATURES: number[][] = [
  [0x4d, 0x5a], // MZ - Windows executable
  [0x7f, 0x45, 0x4c, 0x46], // ELF - Linux executable
  [0x50, 0x4b, 0x03, 0x04], // ZIP archive
  [0x50, 0x4b, 0x05, 0x06], // ZIP archive (empty)
  [0x50, 0x4b, 0x07, 0x08], // ZIP archive (spanned)
  [0x25, 0x50, 0x44, 0x46], // PDF
  [0x3c, 0x73, 0x63, 0x72, 0x69, 0x70, 0x74], // <script (HTML/JS injection)
  [0x3c, 0x3f, 0x70, 0x68, 0x70], // <?php
];

// =============================================================================
// Helper Functions
// =============================================================================

function ensureUploadsDir(): string {
  const dir = join(__dirname, '..', '..', 'uploads');
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function generateSecureFilename(originalName: string): string {
  // Sanitize original name - remove special characters
  const sanitized = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const ext = extname(sanitized).toLowerCase() || '.jpg';

  // Generate cryptographically secure random string
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const unique = `${timestamp}-${random}`;

  return `${unique}${ext}`;
}

/**
 * Verify file content matches expected image type by checking magic bytes
 */
function verifyMagicBytes(filePath: string, mimetype: string): boolean {
  try {
    const buffer = readFileSync(filePath);
    if (buffer.length < 8) {
      return false; // File too small to be valid
    }

    const signatures = MAGIC_BYTES[mimetype] || MAGIC_BYTES['image/jpeg'];

    for (const signature of signatures) {
      let matches = true;
      for (let i = 0; i < signature.length; i++) {
        if (buffer[i] !== signature[i]) {
          matches = false;
          break;
        }
      }
      if (matches) {
        return true;
      }
    }

    // Special case for WebP - need to check for WEBP marker after RIFF
    if (mimetype === 'image/webp') {
      // RIFF....WEBP format
      if (buffer.length >= 12) {
        const webpMarker = buffer.slice(8, 12).toString('ascii');
        if (webpMarker === 'WEBP') {
          return true;
        }
      }
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Check for dangerous/malicious file signatures
 */
function isDangerousFile(filePath: string): boolean {
  try {
    const buffer = readFileSync(filePath);
    if (buffer.length < 8) {
      return false;
    }

    for (const signature of DANGEROUS_SIGNATURES) {
      let matches = true;
      for (let i = 0; i < signature.length && i < buffer.length; i++) {
        if (buffer[i] !== signature[i]) {
          matches = false;
          break;
        }
      }
      if (matches) {
        return true;
      }
    }

    // Check for embedded scripts in first 1KB
    const headerContent = buffer.slice(0, 1024).toString('utf8', 0, 1024);
    const dangerousPatterns = [
      '<script',
      '<?php',
      '<%',
      'javascript:',
      'vbscript:',
      'onload=',
      'onerror=',
    ];

    for (const pattern of dangerousPatterns) {
      if (headerContent.toLowerCase().includes(pattern)) {
        return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Safely delete a file
 */
function safeDeleteFile(filePath: string): void {
  try {
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }
  } catch {
    // Ignore deletion errors
  }
}

/**
 * Validate file extension
 */
function isValidExtension(filename: string): boolean {
  const ext = extname(filename).toLowerCase();
  return ALLOWED_EXTENSIONS.includes(ext);
}

// =============================================================================
// Controller
// =============================================================================

@UseGuards(JwtAuthGuard)
@Controller('upload')
export class UploadController {
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const dir = ensureUploadsDir();
          cb(null, dir);
        },
        filename: (_req, file, cb) => {
          cb(null, generateSecureFilename(file.originalname));
        },
      }),
      fileFilter: (_req, file, cb) => {
        // Check MIME type
        if (!ALLOWED_MIMETYPES.includes(file.mimetype)) {
          return cb(
            new BadRequestException(
              `Invalid file type. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`,
            ),
            false,
          );
        }

        // Check extension
        if (!isValidExtension(file.originalname)) {
          return cb(
            new BadRequestException(
              `Invalid file extension. Allowed extensions: ${ALLOWED_EXTENSIONS.join(', ')}`,
            ),
            false,
          );
        }

        cb(null, true);
      },
      limits: {
        fileSize: MAX_FILE_SIZE,
        files: 1,
      },
    }),
  )
  uploadFile(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Req() req: Request,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const filePath = file.path;

    try {
      // Security Check 1: Verify file size (double-check)
      if (file.size > MAX_FILE_SIZE) {
        safeDeleteFile(filePath);
        throw new BadRequestException(
          `File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
        );
      }

      // Security Check 2: Verify magic bytes match declared MIME type
      if (!verifyMagicBytes(filePath, file.mimetype)) {
        safeDeleteFile(filePath);
        throw new BadRequestException(
          'File content does not match declared file type. Potential security risk detected.',
        );
      }

      // Security Check 3: Check for malicious content
      if (isDangerousFile(filePath)) {
        safeDeleteFile(filePath);
        throw new BadRequestException(
          'File contains potentially dangerous content and has been rejected.',
        );
      }

      // Build response URL
      const host =
        process.env.APP_PUBLIC_URL ||
        process.env.BASE_URL ||
        `${req.protocol}://${req.get('host')}`;
      const url = `${host}/uploads/${file.filename}`;

      return {
        success: true,
        data: {
          url,
          filename: file.filename,
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
        },
      };
    } catch (error) {
      // Ensure file is deleted on any error
      safeDeleteFile(filePath);
      throw error;
    }
  }
}
