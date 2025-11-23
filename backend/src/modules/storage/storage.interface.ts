export interface StorageAdapter {
  /**
   * Save a file to storage
   * @param file - The file to upload
   * @param filename - The filename to use
   * @returns The URL where the file can be accessed
   */
  saveFile(file: Express.Multer.File, filename: string): Promise<string>;

  /**
   * Get the file path or URL for a given filename
   * @param filename - The filename to retrieve
   * @returns The full path or URL to the file
   */
  getFilePath(filename: string): Promise<string>;

  /**
   * Delete a file from storage
   * @param filename - The filename to delete
   */
  deleteFile(filename: string): Promise<void>;

  /**
   * Check if a file exists in storage
   * @param filename - The filename to check
   * @returns True if the file exists, false otherwise
   */
  fileExists(filename: string): Promise<boolean>;
}
