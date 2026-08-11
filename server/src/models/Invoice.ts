import { Schema, model, Document, Types } from 'mongoose';

export interface IInvoice extends Document {
  bookingId: Types.ObjectId;
  invoiceNo: string;
  date: Date;
  subtotal: number;
  gst: number;
  platformFee: number;
  securityDeposit: number;
  totalAmount: number;
  qrCode?: string; // base64 representation of QR
  pdfUrl?: string;  // link to uploaded invoice PDF
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true,
    },
    invoiceNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    gst: {
      type: Number,
      required: true,
    },
    platformFee: {
      type: Number,
      required: true,
    },
    securityDeposit: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    qrCode: {
      type: String,
    },
    pdfUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Invoice = model<IInvoice>('Invoice', InvoiceSchema);
