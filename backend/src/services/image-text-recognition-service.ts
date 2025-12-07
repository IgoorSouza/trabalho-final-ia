import vision from "@google-cloud/vision";
import sharp from "sharp";
import { BadRequestException } from "../exceptions/bad-request-exception";
import path from "path";
import fs from "fs/promises";

const client = new vision.ImageAnnotatorClient();
const DEBUG_DIR = path.join(__dirname, "../../debug_images");

export async function extractTextFromImage(
  file: Express.Multer.File,
  resize: boolean,
  resizeWidth: number,
  grayscale: boolean,
  normalize: boolean,
  threshold: boolean,
  thresholdValue: number
) {
  await clearDebugDirectory();
  const fileId = file.originalname.split(".")[0];

  try {
    file.buffer = await preprocessBuffer(
      file.buffer,
      resize,
      resizeWidth,
      grayscale,
      normalize,
      threshold,
      thresholdValue,
      fileId
    );
  } catch (err: any) {
    console.error(`Preprocess failed for ${file.originalname}:`, err.message);
  }

  const [result] = await client.documentTextDetection({
    image: { content: file.buffer },
    imageContext: { languageHints: ["pt"] },
  });

  const fullTextAnnotation = result.fullTextAnnotation || {};
  const extractedText = fullTextAnnotation.text;

  if (!extractedText || extractedText.trim() === "") {
    throw new BadRequestException("The provided image does not have any text.");
  }

  return extractedText;
}

async function preprocessBuffer(
  buffer: Buffer,
  resize: boolean,
  resizeWidth: number,
  grayscale: boolean,
  normalize: boolean,
  threshold: boolean,
  thresholdValue: number,
  fileId: string
) {
  let image = sharp(buffer);
  await saveDebugImage(image.clone(), "00_original", fileId);

  if (resize && resizeWidth > 0) {
    image = image.resize({ width: resizeWidth, withoutEnlargement: true });
    await saveDebugImage(image.clone(), "01_resized", fileId);
  }

  if (grayscale) {
    image = image.grayscale();
    await saveDebugImage(image.clone(), "02_grayscale", fileId);
  }

  if (normalize) {
    image = image.normalize();
    await saveDebugImage(image.clone(), "03_normalized", fileId);
  }

  if (threshold && thresholdValue >= 0) {
    image = image.threshold(Math.min(255, thresholdValue));
    await saveDebugImage(image.clone(), "04_threshold", fileId);
  }

  return image.toBuffer();
}

async function saveDebugImage(
  image: sharp.Sharp,
  stepName: string,
  fileId: string
) {
  const filePath = path.join(DEBUG_DIR, `${fileId}_${stepName}.png`);

  try {
    await fs.mkdir(DEBUG_DIR, { recursive: true });
    await image.toFile(filePath);
  } catch (err) {
    console.error(`Error while saving image for step ${stepName}:`, err);
  }
}

async function clearDebugDirectory() {
  try {
    const files = await fs.readdir(DEBUG_DIR);

    for (const file of files) {
      const filePath = path.join(DEBUG_DIR, file);
      await fs.unlink(filePath);
    }
  } catch (error) {
    console.error("Error clearing debug directory:", error);
  }
}
