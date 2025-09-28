export class FileUploadHelper {
    static createDocumentFormData(file: File, docType: string): FormData {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('docType', docType);
        return formData;
    }
}