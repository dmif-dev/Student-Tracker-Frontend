// packages/web/services/fileHandlerService.ts

import { apiClient } from '../utils/apiClient';

/**
 * Service to handle file operations like downloading and previewing
 * Interacts directly with the backend API
 */
class FileHandlerServiceClass {
  
  /**
   * Download a file
   */
  async downloadFile(document: any): Promise<void> {
    try {
      const blobData = await apiClient.getBlob(`documents/${document.id}/download`);
      
      const blob = new Blob([blobData], { type: document.fileType });
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.fileName || `${document.title}.${this.getFileExtension(document.fileType)}`;
      
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  }

  /**
   * Get file extension from MIME type
   */
  private getFileExtension(mimeType: string): string {
    const extensions: Record<string, string> = {
      'application/pdf': 'pdf',
      'application/msword': 'doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'text/plain': 'txt',
      'text/html': 'html',
      'image/jpeg': 'jpg',
      'image/png': 'png',
    };
    
    return extensions[mimeType] || 'bin';
  }

  /**
   * Get a preview URL for a document
   */
  async getPreviewUrl(document: any): Promise<string> {
    try {
      // Fetch actual preview from backend
      const blobData = await apiClient.getBlob(`documents/${document.id}/view`);
      const blob = new Blob([blobData], { type: document.fileType });
      return window.URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error getting content from API:', error);
      
      if (document.fileType.includes('word') || document.fileType.includes('document')) {
        // For Word docs, create an HTML preview that explains how to view
        const htmlContent = this.createWordPreviewHTML(document);
        const blob = new Blob([htmlContent], { type: 'text/html' });
        return window.URL.createObjectURL(blob);
      }
      
      // Default fallback
      const htmlContent = this.createGenericPreviewHTML(document);
      const blob = new Blob([htmlContent], { type: 'text/html' });
      return window.URL.createObjectURL(blob);
    }
  }

  /**
   * Create a helpful HTML preview for Word documents
   */
  private createWordPreviewHTML(document: any): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
    <meta charset="UTF-8">
    <title>${document.title} - Word Document Preview</title>
    <style>
        body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; 
        margin: 0; 
        padding: 20px; 
        background: #f5f5f5;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        }
        .container {
        max-width: 600px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        padding: 40px;
        text-align: center;
        }
        .icon {
        width: 80px;
        height: 80px;
        background: #e6f0ff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 24px;
        }
        .icon svg {
        width: 40px;
        height: 40px;
        fill: #2563eb;
        }
        h1 {
        font-size: 24px;
        color: #1a1a1a;
        margin-bottom: 8px;
        }
        .filename {
        color: #666;
        font-size: 14px;
        margin-bottom: 24px;
        word-break: break-all;
        }
        .info {
        background: #f8f9fa;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 24px;
        text-align: left;
        }
        .info p {
        margin: 8px 0;
        color: #444;
        font-size: 14px;
        }
        .info strong {
        color: #1a1a1a;
        display: inline-block;
        width: 100px;
        }
        .button {
        display: inline-flex;
        align-items: center;
        padding: 12px 24px;
        background: #2563eb;
        color: white;
        text-decoration: none;
        border-radius: 8px;
        font-weight: 500;
        transition: background 0.2s;
        border: none;
        cursor: pointer;
        font-size: 16px;
        }
        .button:hover {
        background: #1d4ed8;
        }
        .note {
        margin-top: 24px;
        color: #888;
        font-size: 12px;
        }
    </style>
    </head>
    <body>
    <div class="container">
        <div class="icon">
        <svg viewBox="0 0 24 24">
            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
        </svg>
        </div>
        
        <h1>${document.title}</h1>
        <div class="filename">${document.fileName}</div>
        
        <div class="info">
        <p><strong>Type:</strong> Microsoft Word Document</p>
        <p><strong>Size:</strong> ${this.formatFileSize(document.fileSize)}</p>
        <p><strong>Uploaded:</strong> ${new Date(document.createdAt || Date.now()).toLocaleDateString()}</p>
        </div>
        
        <p style="margin-bottom: 24px; color: #666;">
        Word documents cannot be previewed directly in the browser. 
        Please download the file to view its content.
        </p>
        
        <div>
        <button onclick="window.parent.downloadFile()" class="button">
            <svg style="width: 18px; height: 18px; margin-right: 8px;" viewBox="0 0 24 24">
            <path fill="currentColor" d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
            </svg>
            Download Document
        </button>
        </div>
        
        <div class="note">
        After downloading, open the file with Microsoft Word or compatible software.
        </div>
    </div>

    <script>
        function downloadFile() {
        window.parent.postMessage('download', '*');
        }
    </script>
    </body>
    </html>
    `;
  }

  /**
   * Create a generic preview HTML
   */
  private createGenericPreviewHTML(document: any): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
    <meta charset="UTF-8">
    <title>${document.title} - Preview</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; text-align: center; }
        .message { color: #666; margin: 40px; }
    </style>
    </head>
    <body>
    <h1>${document.title}</h1>
    <p class="message">Preview not available for this file type or there was an error loading it.</p>
    <p>Please download the file to view its content.</p>
    </body>
    </html>
    `;
  }

  // Add formatFileSize helper
  private formatFileSize(bytes: number): string {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}

export const FileHandlerService = new FileHandlerServiceClass();