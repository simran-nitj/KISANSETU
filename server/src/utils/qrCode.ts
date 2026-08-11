import QRCode from 'qrcode';

/**
 * Generate a Base64 Data URL for a QR Code containing specified text.
 */
export const generateQRCode = async (text: string): Promise<string> => {
  try {
    const dataUrl = await QRCode.toDataURL(text, {
      color: {
        dark: '#2E7D32', // Green Theme
        light: '#FFFFFF',
      },
      width: 250,
      margin: 2,
    });
    return dataUrl;
  } catch (error) {
    console.error('QR code generation failed:', error);
    throw new Error('QR code generation failed');
  }
};
