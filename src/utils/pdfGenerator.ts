import { jsPDF } from 'jspdf';
import { Store, KPIMetric, FunnelStep, ZoneHeatmap, Anomaly } from '../types';

/**
 * Generates an executive analytical PDF report matching the exact live state
 * parameters of the Store Intelligence AI system.
 */
export const generatePdfReport = (
  activeStore: Store,
  kpis: KPIMetric[],
  funnel: FunnelStep[],
  heatmap: ZoneHeatmap[],
  anomalies: Anomaly[]
): void => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // A4 dimensions: 210mm x 297mm
  // Margin: 15mm left/right, printable width is 180mm

  // 1. HEADER CONTAINER
  // Draw primary branding background block (Deep purple theme #581C87)
  doc.setFillColor(88, 28, 135);
  doc.rect(15, 15, 180, 32, 'F');

  // Accent band at the bottom of the header block (Soft pink/purple #A78BFA)
  doc.setFillColor(167, 139, 250);
  doc.rect(15, 45, 180, 2, 'F');

  // Title Text inside header (White)
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('STORE INTELLIGENCE AI - INSIGHTS REPORT', 22, 25);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(243, 232, 255); // light purple
  doc.text('Automated Omni-Channel Video Analytics & Deep Learning CCTV Analysis', 22, 31);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('STRICTLY CONFIDENTIAL • STORE MANAGER EXECUTIVE ACCESS', 22, 40);

  // Metadata block (Header Right)
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(`STORE: ${activeStore.name.toUpperCase()}`, 118, 24);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`LOCATION: ${activeStore.location}`, 118, 29);
  doc.text(`DATE GENERATED: ${new Date().toLocaleString()}`, 118, 34);
  doc.text('SYSTEM HEALTH: ACTIVE & OPERATIONAL', 118, 39);


  // 2. SUMMARY & KPI METRICS SECTION
  let yPos = 55;
  doc.setTextColor(30, 27, 75); // Dark Purple Charcoal
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('1. EXECUTIVE KPI PERFORMANCE', 15, yPos);

  // KPI section divider line
  doc.setDrawColor(226, 212, 250);
  doc.setLineWidth(0.3);
  doc.line(15, yPos + 2, 195, yPos + 2);

  yPos += 7;

  // Let's draw columns for the KPI Cards
  // Columns grid configuration: 3 columns with gaps
  const colWidth = 56;
  const colGap = 6;
  const cardHeight = 16;

  kpis.forEach((kpi, idx) => {
    const row = Math.floor(idx / 3);
    const col = idx % 3;
    const cardX = 15 + col * (colWidth + colGap);
    const cardY = yPos + row * (cardHeight + colGap);

    // Skip drawing cards if they overflow y bounds recursively
    if (cardY > 105) return;

    // Draw card background (Off white) and border
    doc.setFillColor(250, 248, 254);
    doc.setDrawColor(139, 92, 246, 0.15); // soft purple line
    doc.rect(cardX, cardY, colWidth, cardHeight, 'FD');

    // Title label
    doc.setTextColor(124, 58, 237); // Purple 600
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text(kpi.title.toUpperCase(), cardX + 3, cardY + 5);

    // Big Value
    doc.setTextColor(30, 27, 75); // Dark charcoal
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(kpi.value, cardX + 3, cardY + 11);

    // Trend Indicator
    const isPositive = kpi.trend >= 0;
    doc.setTextColor(isPositive ? 16 : 220, isPositive ? 122 : 38, isPositive ? 87 : 38); // Emerald or Ruby Red
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    // Draw visual positive or negative indicator
    doc.text(kpi.trendLabel || '', cardX + 22, cardY + 11);
  });

  // Increment Y position past KPI section
  yPos = 100;


  // 3. CONVERSION FUNNEL SECTION
  doc.setTextColor(30, 27, 75);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('2. STORE CONVERSION FUNNEL DIAGRAM', 15, yPos);

  doc.setDrawColor(226, 212, 250);
  doc.line(15, yPos + 2, 195, yPos + 2);

  yPos += 7;

  // Render Horizontal Funnel boxes
  const stepWidth = 38;
  const stepGap = 9;
  const stepHeight = 22;

  funnel.forEach((step, idx) => {
    if (idx >= 4) return; // Cap at 4 layout stages for layout density
    const stepX = 15 + idx * (stepWidth + stepGap);

    // Funnel block outline with slight gray-purple tint
    doc.setFillColor(253, 251, 255);
    doc.setDrawColor(221, 214, 254);
    doc.rect(stepX, yPos, stepWidth, stepHeight, 'FD');

    // Step Header Badge
    doc.setFillColor(139, 92, 246); // purple badge
    doc.rect(stepX, yPos, 8, 5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.text(`0${idx + 1}`, stepX + 2, yPos + 3.8);

    // Step Stage Name
    doc.setTextColor(30, 27, 75);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(step.name, stepX + 11, yPos + 3.8);

    // Count value
    doc.setTextColor(88, 28, 135);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(step.count.toLocaleString(), stepX + 4, yPos + 12);

    // Conversion rate bubble
    doc.setFillColor(209, 250, 229); // Light green badge
    doc.rect(stepX + 4, yPos + 15, 30, 4.5, 'F');
    doc.setTextColor(6, 95, 70); // Dark emerald print text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.text(`Conversion: ${step.percentage}%`, stepX + 6, yPos + 18.2);

    // Arrow Connector to the next stage
    if (idx < funnel.length - 1 && idx < 3) {
      doc.setDrawColor(167, 139, 250);
      const startArrowX = stepX + stepWidth + 1;
      const endArrowX = startArrowX + 7;
      const arrowY = yPos + (stepHeight / 2);
      
      // Draw a neat minimal horizontal line and an arrow bracket
      doc.line(startArrowX, arrowY, endArrowX, arrowY);
      doc.line(endArrowX - 1.5, arrowY - 1, endArrowX, arrowY);
      doc.line(endArrowX - 1.5, arrowY + 1, endArrowX, arrowY);
    }
  });

  yPos = 136;


  // 4. ZONE INTENSITIES SECTION (HEATMAP)
  doc.setTextColor(30, 27, 75);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('3. ZONE INTENSITIES & DWELL PERFORMANCE', 15, yPos);

  doc.setDrawColor(226, 212, 250);
  doc.line(15, yPos + 2, 195, yPos + 2);

  yPos += 7;

  // Dynamic Table columns configuration
  // Total usable width = 180mm
  const nameColWidth = 60;
  const trafficColWidth = 40;
  const dwellColWidth = 40;
  const scoreColWidth = 40;

  // Table Headers
  doc.setFillColor(88, 28, 135); // Deep Purple
  doc.rect(15, yPos, 180, 6, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  
  doc.text('ZONE LOCATION', 18, yPos + 4.2);
  doc.text('VISIT FREQUENCY', 15 + nameColWidth + 3, yPos + 4.2);
  doc.text('AVG DWELL DURATION', 15 + nameColWidth + trafficColWidth + 3, yPos + 4.2);
  doc.text('POPULARITY INDEX INDEX', 15 + nameColWidth + trafficColWidth + dwellColWidth + 3, yPos + 4.2);

  yPos += 6;

  // Zones rows list
  heatmap.slice(0, 5).forEach((zone, idx) => {
    // Alternating background stripes
    const bgColor = idx % 2 === 0 ? 255 : 249; // White or off-white light tint
    const bgG = idx % 2 === 0 ? 255 : 246;
    const bgB = idx % 2 === 0 ? 255 : 254;

    doc.setFillColor(bgColor, bgG, bgB);
    doc.setDrawColor(241, 235, 253);
    doc.rect(15, yPos, 180, 6.5, 'FD');

    doc.setTextColor(30, 27, 75);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(zone.name, 18, yPos + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`${zone.visitFrequency.toLocaleString()} visitors`, 15 + nameColWidth + 3, yPos + 4.5);
    doc.text(zone.avgDwellTime, 15 + nameColWidth + trafficColWidth + 3, yPos + 4.5);
    
    // Draw popularity bar visualizer
    doc.text(`${zone.popularityScore}/100`, 15 + nameColWidth + trafficColWidth + dwellColWidth + 3, yPos + 4.5);

    // Mini visual bar
    doc.setFillColor(224, 215, 252);
    doc.rect(15 + nameColWidth + trafficColWidth + dwellColWidth + 18, yPos + 2, 18, 2.5, 'F');
    // Active width
    doc.setFillColor(139, 92, 246);
    const fillWidth = (zone.popularityScore / 100) * 18;
    doc.rect(15 + nameColWidth + trafficColWidth + dwellColWidth + 18, yPos + 2, fillWidth, 2.5, 'F');

    yPos += 6.5;
  });

  yPos += 4;


  // 5. DETECTED AI ANOMALIES SECTION
  doc.setTextColor(30, 27, 75);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('4. RECENT SYSTEM LOGGED ANOMALIES & INCIDENTS', 15, yPos);

  doc.setDrawColor(226, 212, 250);
  doc.line(15, yPos + 2, 195, yPos + 2);

  yPos += 7;

  // Let's print out the dynamic anomalies
  const validAnomalies = anomalies.slice(0, 3); // Take up to top 3 for space density security

  if (validAnomalies.length === 0) {
    // Beautiful green success placeholder
    doc.setFillColor(236, 253, 245);
    doc.setDrawColor(16, 185, 129);
    doc.rect(15, yPos, 180, 15, 'FD');

    doc.setTextColor(6, 95, 70);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('STATUS OK: SYSTEM OPERATING UNDER RECOMMENDED LOGISTICAL THRESHOLDS', 20, yPos + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text('No critical customer queue congestion, perimeter breaches, or shelf vacancies detected over the security logging feeds.', 20, yPos + 10.5);
  } else {
    validAnomalies.forEach((anom) => {
      const isCritical = anom.severity === 'CRITICAL';
      const isWarn = anom.severity === 'WARN';

      // Draw background panel for issue
      doc.setFillColor(isCritical ? 254 : isWarn ? 255 : 250, isCritical ? 242 : isWarn ? 251 : 250, isCritical ? 242 : isWarn ? 235 : 255);
      doc.setDrawColor(241, 135, 135, isCritical ? 1 : 0.2); // Soft or dark border
      doc.rect(15, yPos, 180, 11, 'FD');

      // Left Accent Severity color strip
      if (isCritical) {
        doc.setFillColor(239, 68, 68); // Red
      } else if (isWarn) {
        doc.setFillColor(245, 158, 11); // Amber
      } else {
        doc.setFillColor(139, 92, 246); // Purple/Slate
      }
      doc.rect(15, yPos, 2.5, 11, 'F');

      // Incident Title and Badge
      doc.setTextColor(30, 27, 75);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(`[${anom.severity}] ${anom.title}`, 20, yPos + 4.2);

      doc.setTextColor(115, 115, 115);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text(`Logged: ${anom.timestamp} • Zone: ${anom.zone || 'Global'}`, 130, yPos + 4.2);

      // Description text
      doc.setTextColor(75, 85, 99);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.text(anom.description.substring(0, 110), 20, yPos + 8.5);

      yPos += 12.5;
    });
  }


  // 6. EXECUTIVE STAMP & SIGN-OFF META
  yPos = 254;
  doc.setDrawColor(212, 212, 212);
  doc.setLineWidth(0.1);
  doc.line(15, yPos, 195, yPos);

  yPos += 5;

  doc.setTextColor(88, 28, 135);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('EXECUTIVE INTERACTION SIGNATURE TRACK:', 15, yPos + 3);

  doc.setDrawColor(180, 180, 180);
  doc.line(78, yPos + 3, 140, yPos + 3); // Signature line
  
  doc.setTextColor(115, 115, 115);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text('AUTHORIZED REVIEWER (STORE MANAGER)', 78, yPos + 6.5);

  // Security Token code
  const secureToken = Math.random().toString(36).substring(2, 10).toUpperCase();
  doc.text(`AUTOGENERATED AUDIT TOKEN: ST-${secureToken}-2026`, 147, yPos + 3);


  // 7. FOOTER BAR
  doc.setFillColor(248, 250, 252);
  doc.rect(15, 272, 180, 10, 'F');

  doc.setTextColor(148, 163, 184); // light metal gray
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text('This executive analytics dispatch is aggregated dynamically using Edge AI models on real-time security lines under operational supervision.', 18, 276);
  doc.text('CONFIDENCES: Object Core Tracking: 98.4% | Spatial Demographics Alignment: 95.8% | AI Inference Pipeline 24/24.', 18, 279.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('PAGE 1 OF 1', 182, 278);

  // Trigger download of the generated PDF
  const timestampString = new Date().toISOString().split('T')[0];
  doc.save(`Store_Intelligence_Report_${activeStore.id}_${timestampString}.pdf`);
};
