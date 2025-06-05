interface File {
  _id?: string;
  fileType: string;
  fileSize: Number;
  fileData: Buffer;
}

export type { File };
