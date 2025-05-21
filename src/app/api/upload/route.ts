import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import PDFParser from 'pdf2json';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    // Adjust key 'file' if your client sends differently
    const uploadedFile = formData.get('file');

    if (!uploadedFile || !(uploadedFile instanceof File)) {
      return NextResponse.json({ error: 'No valid file uploaded' }, { status: 400 });
    }

    // Generate a unique filename
    const fileName = `${uuidv4()}.pdf`;
    const tempFilePath = `/tmp/${fileName}`;

    // Save uploaded file to temp path
    const buffer = Buffer.from(await uploadedFile.arrayBuffer());
    await fs.writeFile(tempFilePath, buffer);

    // Wrap pdf2json parsing into a promise
    const parsedText = await new Promise<string>((resolve, reject) => {
      const pdfParser = new (PDFParser as any)(null, 1);

      pdfParser.on('pdfParser_dataError', (errData: any) => {
        reject(errData.parserError);
      });

      pdfParser.on('pdfParser_dataReady', () => {
        const text = pdfParser.getRawTextContent();
        resolve(text);
      });

      pdfParser.loadPDF(tempFilePath);
    });

    // Optionally delete temp file (clean up)
    await fs.unlink(tempFilePath);

    return NextResponse.json({ text: parsedText, fileName });
  } catch (error) {
    console.error('PDF upload error:', error);
    return NextResponse.json({ error: 'Failed to parse PDF' }, { status: 500 });
  }
}
