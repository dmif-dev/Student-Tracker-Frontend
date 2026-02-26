import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ExportOptions {
  filename: string;
  format: 'pdf' | 'excel' | 'csv';
  data: any[];
  columns: { header: string; key: string }[];
  title?: string;
  orientation?: 'portrait' | 'landscape';
  includeHeaders?: boolean;
  includeTimestamps?: boolean;
}

export interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  config: ExportOptions;
}

export const exportTemplates: ExportTemplate[] = [
  {
    id: 'student-list',
    name: 'Student List',
    description: 'Basic student information export',
    config: {
      filename: 'students',
      format: 'excel',
      data: [],
      columns: [
        { header: 'Name', key: 'name' },
        { header: 'Email', key: 'email' },
        { header: 'Registration', key: 'registrationNumber' },
        { header: 'Program', key: 'program' },
        { header: 'Track', key: 'track' },
        { header: 'Mentor', key: 'mentor' },
        { header: 'Status', key: 'status' },
        { header: 'Progress', key: 'progress' }
      ],
      title: 'Student List Report'
    }
  },
  {
    id: 'outcome-report',
    name: 'Outcomes Report',
    description: 'Detailed outcomes with student information',
    config: {
      filename: 'outcomes',
      format: 'pdf',
      data: [],
      columns: [
        { header: 'Type', key: 'type' },
        { header: 'Title', key: 'title' },
        { header: 'Student', key: 'student' },
        { header: 'Status', key: 'status' },
        { header: 'Date', key: 'date' },
        { header: 'Mentor', key: 'mentor' }
      ],
      title: 'Outcomes Report',
      orientation: 'landscape'
    }
  }
];

export class ExportService {
  static async exportToExcel(data: any[], columns: { header: string; key: string }[], filename: string) {
    const worksheet = XLSX.utils.json_to_sheet(data.map(item => {
      const row: any = {};
      columns.forEach(col => {
        row[col.header] = item[col.key];
      });
      return row;
    }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    
    // Auto-size columns
    const maxWidth = 50;
    const wscols = columns.map(() => ({ wch: maxWidth }));
    worksheet['!cols'] = wscols;

    XLSX.writeFile(workbook, `${filename}.xlsx`);
  }

  static async exportToCSV(data: any[], columns: { header: string; key: string }[], filename: string) {
    const headers = columns.map(col => col.header).join(',');
    const rows = data.map(item => 
      columns.map(col => {
        const value = item[col.key];
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      }).join(',')
    );
    
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  static async exportToPDF(data: any[], columns: { header: string; key: string }[], options: {
    filename: string;
    title?: string;
    orientation?: 'portrait' | 'landscape';
  }) {
    const doc = new jsPDF({
      orientation: options.orientation || 'portrait',
      unit: 'pt'
    });

    // Add title
    if (options.title) {
      doc.setFontSize(16);
      doc.text(options.title, 40, 40);
    }

    // Add timestamp
    doc.setFontSize(8);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 40, 60);

    // Prepare table data
    const tableHeaders = columns.map(col => col.header);
    const tableData = data.map(item => 
      columns.map(col => String(item[col.key] || ''))
    );

    // Generate table
    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
      startY: options.title ? 70 : 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: 40 }
    });

    doc.save(`${options.filename}.pdf`);
  }

  static async exportData(options: ExportOptions) {
    const { filename, format, data, columns, title, orientation } = options;

    switch (format) {
      case 'excel':
        await this.exportToExcel(data, columns, filename);
        break;
      case 'csv':
        await this.exportToCSV(data, columns, filename);
        break;
      case 'pdf':
        await this.exportToPDF(data, columns, { filename, title, orientation });
        break;
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  static async scheduleExport(
    templateId: string,
    schedule: 'daily' | 'weekly' | 'monthly',
    recipients: string[]
  ) {
    // In real app, this would call an API to schedule recurring exports
    console.log('Scheduling export:', { templateId, schedule, recipients });
    
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      id: Date.now().toString(),
      templateId,
      schedule,
      recipients,
      createdAt: new Date().toISOString()
    };
  }
}