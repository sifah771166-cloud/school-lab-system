import React from 'react';
import { toast } from 'react-hot-toast';

export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) {
    toast.error('No data to export');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle values with commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  toast.success('Data exported successfully!');
};

export const printReport = (title, headersOrData, rows = null) => {
  const printWindow = window.open('', '_blank');
  
  // If rows is provided, headersOrData is headers array
  let tableHTML;
  if (rows) {
    const headers = headersOrData;
    tableHTML = `
      <table>
        <thead>
          <tr>
            ${headers.map(h => `<th>${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${rows.map(row => `
            <tr>
              ${row.map(cell => `<td>${cell}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } else {
    // headersOrData is HTML string
    tableHTML = headersOrData;
  }
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          padding: 20px;
          color: #2c3e50;
        }
        h1 { 
          text-align: center; 
          color: #667eea;
          margin-bottom: 10px;
        }
        .date {
          text-align: center;
          color: #7f8c8d;
          margin-bottom: 30px;
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 20px 0;
        }
        th, td { 
          border: 1px solid #ddd; 
          padding: 12px; 
          text-align: left;
        }
        th { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-weight: 600;
        }
        tr:nth-child(even) {
          background: #f8f9fa;
        }
        @media print {
          button { display: none; }
        }
        .print-btn {
          background: #667eea;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          margin: 20px auto;
          display: block;
        }
        .print-btn:hover {
          background: #5568d3;
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <p class="date">Tanggal: ${new Date().toLocaleDateString('id-ID', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      })}</p>
      ${tableHTML}
      <button class="print-btn" onclick="window.print()">🖨️ Print</button>
    </body>
    </html>
  `;
  
  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
