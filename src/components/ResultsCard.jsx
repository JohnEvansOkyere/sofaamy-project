import { useState } from 'react';
import { generateQuotePDF } from './PDFGenerator';

const WHATSAPP_NUMBER = '233247958357';

function buildWhatsAppMessage(estimate) {
  const lines = [
    `Project: ${estimate.projectType}`,
    `Glass: ${estimate.glassType || 'N/A'} ${estimate.glassThickness || ''} — ${(estimate.totalGlassArea || 0).toFixed(2)} sqm`,
  ];
  if (estimate.profileType && estimate.profileType !== 'None') {
    lines.push(`Profile: ${estimate.profileType}`);
  }
  if (estimate.includeAlucobond && estimate.alucobondArea) {
    lines.push(`Alucobond: ${estimate.alucobondArea} sqm`);
  }
  if (estimate.includeSecurityDoor && estimate.securityDoorQuantity) {
    lines.push(`Security doors: ${estimate.securityDoorQuantity}`);
  }
  lines.push(`Estimated Total: GHS ${estimate.total.toFixed(2)}`);
  const body = [
    'Hi Sofaamy Team, I used your online estimator and got a quote for my project. Here are the details:',
    '',
    lines.join('\n'),
    '',
    "I'd like to confirm this quote. Please advise on availability.",
  ].join('\n');
  return encodeURIComponent(body);
}

export default function ResultsCard({ estimate, onNewEstimate }) {
  const [pdfSuccess, setPdfSuccess] = useState(false);
  if (!estimate || !estimate.lines?.length) return null;

  const whatsAppUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${buildWhatsAppMessage(estimate)}`;

  const handleDownloadPDF = () => {
    generateQuotePDF(estimate);
    setPdfSuccess(true);
    setTimeout(() => setPdfSuccess(false), 3000);
  };

  return (
    <div className="mt-8 space-y-6">
      <div className="rounded-xl border-2 border-primary/20 bg-white shadow-card-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-primary text-white">
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Qty / Area</th>
                <th className="px-4 py-3 font-medium">Unit Price (GHS)</th>
                <th className="px-4 py-3 font-medium text-right">Total (GHS)</th>
              </tr>
            </thead>
            <tbody>
              {estimate.lines.map((line, i) => (
                <tr key={i} className="border-t border-primary/10">
                  <td className="px-4 py-3 text-charcoal">{line.description}</td>
                  <td className="px-4 py-3 text-charcoal">{line.qtyOrArea}</td>
                  <td className="px-4 py-3 text-charcoal">{line.unitPrice.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-medium">{line.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 bg-background border-t border-primary/20 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-charcoal/80">Subtotal</span>
            <span>GHS {estimate.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-charcoal/80">Installation & Accessories (10%)</span>
            <span>GHS {estimate.installation.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-charcoal/80">VAT (15%)</span>
            <span>GHS {estimate.vat.toFixed(2)}</span>
          </div>
        </div>
        <div className="px-4 py-4 border-t-2 border-accent bg-accent/5">
          <div className="flex justify-between items-center">
            <span className="font-display font-bold text-lg text-charcoal">TOTAL</span>
            <span className="font-display font-bold text-xl text-accent">GHS {estimate.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-charcoal/60">
        Indicative estimate only. Final pricing subject to site assessment and current stock availability. Prices in GHS.
      </p>

      <div className="flex flex-col gap-4">
        <a
          href={whatsAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-4 px-6 rounded-xl bg-accent text-charcoal font-display font-bold text-lg text-center hover:bg-accent/90 transition-all shadow-lg hover:shadow-xl ring-2 ring-accent/30 hover:ring-accent/50"
        >
          💬 Send to Sofaamy on WhatsApp
        </a>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleDownloadPDF}
            className="flex-1 py-3.5 px-6 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-all shadow-md"
          >
            📄 Download PDF Quote
          </button>
          <button
            type="button"
            onClick={onNewEstimate}
            className="py-3.5 px-6 rounded-lg border-2 border-primary/40 text-primary font-medium hover:bg-primary/5 transition-colors"
          >
            🔄 New Estimate
          </button>
        </div>
        {pdfSuccess && (
          <p className="text-sm text-primary font-medium text-center">Quote downloaded successfully.</p>
        )}
      </div>
    </div>
  );
}
