import fs from "fs";
import path from "node:path";

/**
 * Reads a JSON file and returns a typed fallback when the file is missing or empty.
 *
 * @template T Expected JSON shape.
 * @param filePath Absolute path to the JSON file.
 * @param fallback Value returned when the file cannot be read.
 * @returns Parsed JSON data with the requested type.
 */
export function readJsonFile<T>(filePath: string, fallback: T): T {
    try {
        if (!fs.existsSync(filePath)) {
            return fallback;
        }

        let fileData = fs.readFileSync(filePath, "utf-8");
        fileData = fileData.replace(/^\uFEFF/, "");

        if (!fileData.trim()) {
            return fallback;
        }

        return JSON.parse(fileData) as T;
    } catch (error) {
        console.error(`Failed to read JSON file ${filePath}:`, error);
        return fallback;
    }
}

/**
 * Writes typed data into a JSON file and creates the target directory when needed.
 *
 * @template T Serializable data shape.
 * @param filePath Absolute path to the JSON file.
 * @param data Data that should be persisted.
 */
export function writeJsonFile<T>(filePath: string, data: T): void {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}
