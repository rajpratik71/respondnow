import { Incident } from '@services/server';

/**
 * Convert incidents data to CSV format
 */
export function incidentsToCSV(incidents: Incident[]): string {
  if (!incidents || incidents.length === 0) {
    return '';
  }

  // Define CSV headers
  const headers = [
    'ID',
    'Name',
    'Severity',
    'Status',
    'Type',
    'Summary',
    'Description',
    'Created By',
    'Created At',
    'Updated At',
    'Incident URL',
    'Tags'
  ];

  // Convert incidents to CSV rows
  const rows = incidents.map(incident => {
    const createdAt = incident.createdAt 
      ? new Date(incident.createdAt * 1000).toISOString() 
      : '';
    const updatedAt = incident.updatedAt 
      ? new Date(incident.updatedAt * 1000).toISOString() 
      : '';
    const createdBy = incident.createdBy?.name || incident.createdBy?.userName || '';
    const tags = incident.tags?.join('; ') || '';

    return [
      incident.identifier || '',
      escapeCsvValue(incident.name || ''),
      incident.severity || '',
      incident.status || '',
      incident.type || '',
      escapeCsvValue(incident.summary || ''),
      escapeCsvValue(incident.description || ''),
      escapeCsvValue(createdBy),
      createdAt,
      updatedAt,
      incident.incidentUrl || '',
      escapeCsvValue(tags)
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Escape CSV values that contain commas, quotes, or newlines
 */
export function escapeCsvValue(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Export incidents to CSV file
 */
export function exportIncidentsToCSV(incidents: Incident[], filename?: string): void {
  const csvContent = incidentsToCSV(incidents);
  const defaultFilename = `incidents_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csvContent, filename || defaultFilename);
}

/**
 * Format incident data for PDF export
 */
export function formatIncidentForPDF(incident: Incident): {
  title: string;
  sections: { label: string; value: string }[];
  timeline: { date: string; event: string; user: string }[];
} {
  const createdAt = incident.createdAt 
    ? new Date(incident.createdAt * 1000).toLocaleString() 
    : 'N/A';
  const updatedAt = incident.updatedAt 
    ? new Date(incident.updatedAt * 1000).toLocaleString() 
    : 'N/A';

  const sections = [
    { label: 'Incident ID', value: incident.identifier || 'N/A' },
    { label: 'Severity', value: incident.severity || 'N/A' },
    { label: 'Status', value: incident.status || 'N/A' },
    { label: 'Type', value: incident.type || 'N/A' },
    { label: 'Summary', value: incident.summary || 'N/A' },
    { label: 'Description', value: incident.description || 'N/A' },
    { label: 'Created By', value: incident.createdBy?.name || incident.createdBy?.userName || 'N/A' },
    { label: 'Created At', value: createdAt },
    { label: 'Updated At', value: updatedAt },
    { label: 'Tags', value: incident.tags?.join(', ') || 'N/A' },
    { label: 'Incident URL', value: incident.incidentUrl || 'N/A' }
  ];

  // Format timeline
  const timeline = (incident.timelines || []).map(t => ({
    date: t.createdAt ? new Date(t.createdAt * 1000).toLocaleString() : '',
    event: t.type?.replace(/_/g, ' ') || '',
    user: t.userDetails?.name || t.userDetails?.userName || 'System'
  }));

  // Add key members
  if (incident.roles && incident.roles.length > 0) {
    const members = incident.roles
      .map(r => `${r.userDetails?.name || r.userDetails?.userName} (${r.roleType})`)
      .join(', ');
    sections.push({ label: 'Key Members', value: members });
  }

  return {
    title: incident.name || 'Incident Report',
    sections,
    timeline
  };
}

/**
 * Generate and download PDF for an incident
 * Uses dynamic import to load jsPDF only when needed
 */
export async function exportIncidentToPDF(incident: Incident): Promise<void> {
  // Dynamically import jsPDF to reduce bundle size
  const { default: jsPDF } = await import('jspdf');
  
  const data = formatIncidentForPDF(incident);
  const doc = new jsPDF();
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = 20;

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(data.title, margin, yPosition);
  yPosition += 10;

  // Subtitle with date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(`Generated on ${new Date().toLocaleString()}`, margin, yPosition);
  yPosition += 15;

  // Reset text color
  doc.setTextColor(0);

  // Sections
  doc.setFontSize(12);
  data.sections.forEach(section => {
    // Check if we need a new page
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.text(`${section.label}:`, margin, yPosition);
    
    doc.setFont('helvetica', 'normal');
    const valueLines = doc.splitTextToSize(section.value, contentWidth - 50);
    doc.text(valueLines, margin + 50, yPosition);
    
    yPosition += Math.max(valueLines.length * 5, 8);
  });

  // Timeline section
  if (data.timeline.length > 0) {
    yPosition += 10;
    
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Timeline', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    data.timeline.forEach(item => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFont('helvetica', 'normal');
      doc.text(`${item.date} - ${item.event} by ${item.user}`, margin, yPosition);
      yPosition += 6;
    });
  }

  // Download the PDF
  const filename = `incident_${incident.identifier || 'report'}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}
