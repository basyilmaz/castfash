import { Injectable, Logger } from '@nestjs/common';
import { join, extname, basename } from 'path';
import { existsSync, mkdirSync, unlinkSync, statSync } from 'fs';

/**
 * Image Processing Service
 * Handles image optimization, resizing, and format conversion
 *
 * Uses Sharp library for high-performance image processing
 * Falls back to basic file handling if Sharp is not available
 */

interface ProcessedImage {
  originalPath: string;
  optimizedPath: string;
  thumbnailPath?: string;
  webpPath?: string;
  originalSize: number;
  optimizedSize: number;
  savings: number; // percentage
  format: string;
  width?: number;
  height?: number;
}

interface ResizeOptions {
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  quality?: number;
}

interface OptimizeOptions {
  quality?: number;
  convertToWebP?: boolean;
  generateThumbnail?: boolean;
  thumbnailSize?: number;
  maxWidth?: number;
  maxHeight?: number;
}

@Injectable()
export class ImageService {
  private readonly logger = new Logger(ImageService.name);
  private sharp: any = null;
  private isSharpAvailable = false;

  constructor() {
    this.initializeSharp();
  }

  private async initializeSharp(): Promise<void> {
    try {
      // Dynamic import to avoid crash if sharp is not installed
      this.sharp = await import('sharp');
      this.isSharpAvailable = true;
      this.logger.log('✅ Sharp image processing library loaded');
    } catch (error) {
      this.logger.warn(
        '⚠️ Sharp not available. Image optimization disabled. Install with: npm install sharp',
      );
      this.isSharpAvailable = false;
    }
  }

  /**
   * Check if Sharp is available for image processing
   */
  isAvailable(): boolean {
    return this.isSharpAvailable;
  }

  /**
   * Get image metadata
   */
  async getMetadata(imagePath: string): Promise<{
    width?: number;
    height?: number;
    format?: string;
    size: number;
  }> {
    const stats = statSync(imagePath);

    if (!this.isSharpAvailable) {
      return { size: stats.size };
    }

    try {
      const metadata = await this.sharp.default(imagePath).metadata();
      return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: stats.size,
      };
    } catch (error: any) {
      this.logger.warn(
        `Could not get metadata for ${imagePath}: ${error.message}`,
      );
      return { size: stats.size };
    }
  }

  /**
   * Optimize an image - reduce file size while maintaining quality
   */
  async optimize(
    inputPath: string,
    outputPath?: string,
    options: OptimizeOptions = {},
  ): Promise<ProcessedImage> {
    const {
      quality = 80,
      convertToWebP = false,
      generateThumbnail = false,
      thumbnailSize = 200,
      maxWidth = 2048,
      maxHeight = 2048,
    } = options;

    const originalStats = statSync(inputPath);
    const originalSize = originalStats.size;

    // If Sharp is not available, just return original file info
    if (!this.isSharpAvailable) {
      return {
        originalPath: inputPath,
        optimizedPath: inputPath,
        originalSize,
        optimizedSize: originalSize,
        savings: 0,
        format: extname(inputPath).slice(1),
      };
    }

    try {
      const ext = extname(inputPath).toLowerCase();
      const baseName = basename(inputPath, ext);
      const dir = outputPath ? join(outputPath, '..') : join(inputPath, '..');

      // Ensure output directory exists
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }

      // Determine output format
      const outputExt = convertToWebP ? '.webp' : ext;
      const optimizedPath =
        outputPath || join(dir, `${baseName}_optimized${outputExt}`);

      // Process image
      let pipeline = this.sharp.default(inputPath);

      // Get metadata for dimension-aware processing
      const metadata = await pipeline.metadata();

      // Resize if larger than max dimensions
      if (metadata.width && metadata.height) {
        if (metadata.width > maxWidth || metadata.height > maxHeight) {
          pipeline = pipeline.resize({
            width: Math.min(metadata.width, maxWidth),
            height: Math.min(metadata.height, maxHeight),
            fit: 'inside',
            withoutEnlargement: true,
          });
        }
      }

      // Apply format-specific optimization
      if (convertToWebP || outputExt === '.webp') {
        pipeline = pipeline.webp({ quality });
      } else if (ext === '.jpg' || ext === '.jpeg') {
        pipeline = pipeline.jpeg({ quality, mozjpeg: true });
      } else if (ext === '.png') {
        pipeline = pipeline.png({ quality, compressionLevel: 9 });
      }

      // Save optimized image
      await pipeline.toFile(optimizedPath);

      const optimizedStats = statSync(optimizedPath);
      const optimizedSize = optimizedStats.size;
      const savings = Math.round((1 - optimizedSize / originalSize) * 100);

      const result: ProcessedImage = {
        originalPath: inputPath,
        optimizedPath,
        originalSize,
        optimizedSize,
        savings: Math.max(0, savings),
        format: outputExt.slice(1),
        width: metadata.width,
        height: metadata.height,
      };

      // Generate thumbnail if requested
      if (generateThumbnail) {
        const thumbnailPath = join(dir, `${baseName}_thumb${outputExt}`);
        await this.sharp
          .default(inputPath)
          .resize(thumbnailSize, thumbnailSize, { fit: 'cover' })
          .webp({ quality: 70 })
          .toFile(thumbnailPath.replace(outputExt, '.webp'));

        result.thumbnailPath = thumbnailPath.replace(outputExt, '.webp');
      }

      // Generate WebP version if original is not WebP
      if (!convertToWebP && ext !== '.webp') {
        const webpPath = join(dir, `${baseName}.webp`);
        await this.sharp.default(inputPath).webp({ quality }).toFile(webpPath);

        result.webpPath = webpPath;
      }

      this.logger.debug(
        `Optimized ${basename(inputPath)}: ${originalSize} → ${optimizedSize} bytes (${savings}% savings)`,
      );

      return result;
    } catch (error: any) {
      this.logger.error(`Image optimization failed: ${error.message}`);
      return {
        originalPath: inputPath,
        optimizedPath: inputPath,
        originalSize,
        optimizedSize: originalSize,
        savings: 0,
        format: extname(inputPath).slice(1),
      };
    }
  }

  /**
   * Resize an image
   */
  async resize(
    inputPath: string,
    outputPath: string,
    options: ResizeOptions = {},
  ): Promise<string> {
    const { width, height, fit = 'cover', quality = 85 } = options;

    if (!this.isSharpAvailable) {
      this.logger.warn('Sharp not available, returning original image');
      return inputPath;
    }

    try {
      await this.sharp
        .default(inputPath)
        .resize({
          width,
          height,
          fit,
          withoutEnlargement: true,
        })
        .jpeg({ quality })
        .toFile(outputPath);

      return outputPath;
    } catch (error: any) {
      this.logger.error(`Resize failed: ${error.message}`);
      return inputPath;
    }
  }

  /**
   * Convert image to WebP format
   */
  async toWebP(inputPath: string, quality: number = 80): Promise<string> {
    if (!this.isSharpAvailable) {
      return inputPath;
    }

    const ext = extname(inputPath);
    const outputPath = inputPath.replace(ext, '.webp');

    try {
      await this.sharp.default(inputPath).webp({ quality }).toFile(outputPath);

      return outputPath;
    } catch (error: any) {
      this.logger.error(`WebP conversion failed: ${error.message}`);
      return inputPath;
    }
  }

  /**
   * Generate thumbnail
   */
  async createThumbnail(
    inputPath: string,
    size: number = 200,
    format: 'webp' | 'jpeg' = 'webp',
  ): Promise<string> {
    if (!this.isSharpAvailable) {
      return inputPath;
    }

    const ext = extname(inputPath);
    const baseName = basename(inputPath, ext);
    const dir = join(inputPath, '..');
    const outputPath = join(dir, `${baseName}_thumb.${format}`);

    try {
      let pipeline = this.sharp
        .default(inputPath)
        .resize(size, size, { fit: 'cover' });

      if (format === 'webp') {
        pipeline = pipeline.webp({ quality: 75 });
      } else {
        pipeline = pipeline.jpeg({ quality: 75 });
      }

      await pipeline.toFile(outputPath);
      return outputPath;
    } catch (error: any) {
      this.logger.error(`Thumbnail creation failed: ${error.message}`);
      return inputPath;
    }
  }

  /**
   * Process uploaded image with full optimization pipeline
   */
  async processUploadedImage(
    inputPath: string,
    options: OptimizeOptions = {},
  ): Promise<ProcessedImage> {
    const defaults: OptimizeOptions = {
      quality: 85,
      convertToWebP: false,
      generateThumbnail: true,
      thumbnailSize: 200,
      maxWidth: 2048,
      maxHeight: 2048,
    };

    return this.optimize(inputPath, undefined, { ...defaults, ...options });
  }

  /**
   * Delete an image and its variants (thumbnail, webp)
   */
  async deleteWithVariants(imagePath: string): Promise<void> {
    const ext = extname(imagePath);
    const baseName = basename(imagePath, ext);
    const dir = join(imagePath, '..');

    const variants = [
      imagePath,
      join(dir, `${baseName}_optimized${ext}`),
      join(dir, `${baseName}_thumb.webp`),
      join(dir, `${baseName}.webp`),
    ];

    for (const variant of variants) {
      try {
        if (existsSync(variant)) {
          unlinkSync(variant);
          this.logger.debug(`Deleted: ${variant}`);
        }
      } catch (error: any) {
        this.logger.warn(`Could not delete ${variant}: ${error.message}`);
      }
    }
  }
}
