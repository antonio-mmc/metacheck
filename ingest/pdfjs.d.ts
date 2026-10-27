declare module "pdfjs-dist/legacy/build/pdf.mjs" {
  export function getDocument(params: { data: Uint8Array; verbosity?: number }): {
    promise: Promise<{
      numPages: number;
      getPage(page: number): Promise<{
        getTextContent(): Promise<{ items: unknown[] }>;
      }>;
    }>;
  };
}
