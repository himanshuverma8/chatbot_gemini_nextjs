declare module 'pdf-parse' {
  import { Buffer } from 'buffer';

  interface PDFInfo {
    numpages: number;
    numrender: number;
    info: any;
    metadata: any;
    version: string;
  }

  interface PDFResult {
    text: string;
    info: PDFInfo;
    metadata: any;
  }

  function pdfParse(
    dataBuffer: Buffer | Uint8Array,
    options?: any
  ): Promise<PDFResult>;

  export = pdfParse;
}
