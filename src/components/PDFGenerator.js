import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const HEADER = {
  company: 'SOFAAMY CO. LTD',
  tagline: 'Glass · Aluminium · Alucobond · Security Doors',
  address: 'Off Legon GIMPA Road, Achimota, Accra',
  phone: '+233 247 958 357 | +233 544 564 160',
};

export function generateQuotePDF(estimate) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(22);
  doc.setTextColor(27, 58, 45);
  doc.setFont('helvetica', 'bold');
  doc.text(HEADER.company, pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.text(HEADER.tagline, pageWidth / 2, 28, { align: 'center' });
  doc.text(HEADER.address, pageWidth / 2, 34, { align: 'center' });
  doc.text(HEADER.phone, pageWidth / 2, 40, { align: 'center' });

  const dateStr = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  doc.text(`Date: ${dateStr}`, pageWidth / 2, 48, { align: 'center' });

  doc.setDrawColor(201, 168, 76);
  doc.setLineWidth(0.5);
  doc.line(20, 54, pageWidth - 20, 54);

  doc.setFontSize(14);
  doc.setTextColor(27, 58, 45);
  doc.setFont('helvetica', 'bold');
  doc.text('Project Summary', 20, 64);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);
  doc.text(`Project: ${estimate.projectType || 'N/A'}`, 20, 72);
  if (estimate.glassType) {
    doc.text(`Glass: ${estimate.glassType} ${estimate.glassThickness || ''} — ${(estimate.totalGlassArea || 0).toFixed(2)} sqm`, 20, 78);
  }
  if (estimate.profileType && estimate.profileType !== 'None') {
    doc.text(`Profile: ${estimate.profileType}`, 20, 84);
  }

  const tableStart = 92;
  doc.autoTable({
    startY: tableStart,
    head: [['Description', 'Qty / Area', 'Unit Price (GHS)', 'Total (GHS)']],
    body: estimate.lines.map((l) => [
      l.description,
      typeof l.qtyOrArea === 'number' ? l.qtyOrArea : l.qtyOrArea,
      l.unitPrice.toFixed(2),
      l.total.toFixed(2),
    ]),
    theme: 'plain',
    headStyles: { fillColor: [27, 58, 45], textColor: 255 },
    margin: { left: 20, right: 20 },
  });

  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFont('helvetica', 'normal');
  doc.text(`Subtotal: GHS ${estimate.subtotal.toFixed(2)}`, 20, finalY);
  doc.text(`Installation & Accessories (10%): GHS ${estimate.installation.toFixed(2)}`, 20, finalY + 6);
  doc.text(`VAT (15%): GHS ${estimate.vat.toFixed(2)}`, 20, finalY + 12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(201, 168, 76);
  doc.setFontSize(12);
  doc.text(`TOTAL: GHS ${estimate.total.toFixed(2)}`, 20, finalY + 22);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(
    'To confirm this quote, contact our team on WhatsApp or visit our showroom. Valid for 7 days.',
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 15,
    { align: 'center' }
  );

  const filename = `sofaamy-estimate-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
  return filename;
}
