import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface InvoicePDFData {
  invoiceNo: string;
  date: Date;
  farmerName: string;
  farmerPhone: string;
  customerName: string;
  customerPhone: string;
  equipmentName: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  rate: number;
  subtotal: number;
  gst: number;
  platformFee: number;
  securityDeposit: number;
  totalAmount: number;
}

export const generateInvoicePDF = (data: InvoicePDFData): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // Ensure invoices output folder exists
      const uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'invoices');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const fileName = `invoice-${data.invoiceNo}.pdf`;
      const filePath = path.join(uploadsDir, fileName);
      const doc = new PDFDocument({ margin: 50 });

      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      // --- PDF CONTENT ---
      
      // Header Banner
      doc.rect(0, 0, 612, 100).fill('#2E7D32'); // Green Theme
      doc.fillColor('#FFFFFF').fontSize(24).text('KISAN SETU INVOICE', 50, 40, { align: 'left' });
      doc.fontSize(10).text('Connecting Farmers, Renting Better', 50, 70);

      // Invoice metadata
      doc.fillColor('#FFFFFF').fontSize(10).text(`Invoice No: ${data.invoiceNo}`, 400, 40, { align: 'right' });
      doc.text(`Date: ${new Date(data.date).toLocaleDateString()}`, 400, 55, { align: 'right' });

      // Spacing below header
      doc.y = 130;
      doc.fillColor('#333333');

      // Parties block
      doc.fontSize(12).text('FROM (Equipment Owner)', 50, 130, { underline: true });
      doc.fontSize(10).text(`Name: ${data.farmerName}`, 50, 150);
      doc.text(`Phone: ${data.farmerPhone}`, 50, 165);

      doc.fontSize(12).text('TO (Customer Farmer)', 350, 130, { underline: true });
      doc.fontSize(10).text(`Name: ${data.customerName}`, 350, 150);
      doc.text(`Phone: ${data.customerPhone}`, 350, 165);

      // Horizontal line
      doc.moveTo(50, 200).lineTo(560, 200).stroke('#CCCCCC');

      // Rental detail block
      doc.fontSize(12).text('RENTAL DETAILS', 50, 220, { underline: true });
      doc.fontSize(10).text(`Equipment: ${data.equipmentName}`, 50, 240);
      doc.text(`Rental Period: ${data.startDate} to ${data.endDate} (${data.durationDays} days)`, 50, 255);
      doc.text(`Daily Rate: INR ${data.rate.toFixed(2)}`, 50, 270);

      // Table details
      doc.rect(50, 300, 510, 20).fill('#E8F5E9');
      doc.fillColor('#2E7D32').fontSize(10);
      doc.text('Description', 60, 305);
      doc.text('Amount (INR)', 450, 305, { align: 'right', width: 100 });

      doc.fillColor('#333333');
      doc.y = 330;

      // Base Subtotal row
      doc.text(`Rental Fee subtotal (${data.durationDays} Days @ INR ${data.rate.toFixed(2)})`, 60, doc.y);
      doc.text(`INR ${data.subtotal.toFixed(2)}`, 450, doc.y, { align: 'right', width: 100 });

      // Security Deposit
      doc.y += 20;
      doc.text('Security Deposit (Refundable)', 60, doc.y);
      doc.text(`INR ${data.securityDeposit.toFixed(2)}`, 450, doc.y, { align: 'right', width: 100 });

      // Platform Fee
      doc.y += 20;
      doc.text('Platform Service Fee', 60, doc.y);
      doc.text(`INR ${data.platformFee.toFixed(2)}`, 450, doc.y, { align: 'right', width: 100 });

      // GST
      doc.y += 20;
      doc.text('GST (18% on Platform Fee)', 60, doc.y);
      doc.text(`INR ${data.gst.toFixed(2)}`, 450, doc.y, { align: 'right', width: 100 });

      // Horizontal line
      doc.moveTo(50, doc.y + 25).lineTo(560, doc.y + 25).stroke('#CCCCCC');

      // Grand Total
      doc.y += 35;
      doc.fontSize(14).fillColor('#2E7D32').text('GRAND TOTAL', 60, doc.y);
      doc.text(`INR ${data.totalAmount.toFixed(2)}`, 450, doc.y, { align: 'right', width: 100 });

      // Footer notice
      doc.fontSize(8).fillColor('#777777').text('Thank you for renting with Kisan Setu! Keep this receipt for verification.', 50, 500, { align: 'center' });
      doc.text('This is a computer generated invoice and requires no signature.', 50, 515, { align: 'center' });

      doc.end();

      writeStream.on('finish', () => {
        // Return relative path for client hosting
        resolve(`/uploads/invoices/${fileName}`);
      });

      writeStream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};
