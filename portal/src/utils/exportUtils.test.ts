import { incidentsToCSV, formatIncidentForPDF } from '@utils';
import { Incident } from '@services/server';

// Mock jsPDF
jest.mock('jspdf', () => {
  return {
    default: jest.fn().mockImplementation(() => ({
      internal: { pageSize: { getWidth: () => 210 } },
      setFontSize: jest.fn(),
      setFont: jest.fn(),
      setTextColor: jest.fn(),
      text: jest.fn(),
      splitTextToSize: jest.fn((text: string) => [text]),
      addPage: jest.fn(),
      save: jest.fn()
    }))
  };
});

const createMockIncident = (overrides?: Partial<Incident>): Incident => ({
  id: 'test-id',
  identifier: 'INC-123',
  name: 'Test Incident',
  severity: 'SEV1',
  status: 'Started',
  summary: 'Test summary',
  description: 'Test description',
  type: 'Availability',
  comment: '',
  active: true,
  createdAt: 1700000000,
  updatedAt: 1700001000,
  createdBy: {
    name: 'John Doe',
    userName: 'johndoe',
    source: 'Web'
  },
  tags: ['production', 'critical'],
  incidentUrl: 'https://example.com/runbook',
  ...overrides
});

describe('exportUtils', () => {
  describe('incidentsToCSV', () => {
    it('should return empty string for empty array', () => {
      const result = incidentsToCSV([]);
      expect(result).toBe('');
    });

    it('should return empty string for undefined', () => {
      const result = incidentsToCSV(undefined as any);
      expect(result).toBe('');
    });

    it('should generate CSV with headers', () => {
      const incidents = [createMockIncident()];
      const result = incidentsToCSV(incidents);
      
      const lines = result.split('\n');
      expect(lines[0]).toContain('ID');
      expect(lines[0]).toContain('Name');
      expect(lines[0]).toContain('Severity');
      expect(lines[0]).toContain('Status');
    });

    it('should include incident data in CSV', () => {
      const incident = createMockIncident();
      const result = incidentsToCSV([incident]);
      
      expect(result).toContain('INC-123');
      expect(result).toContain('Test Incident');
      expect(result).toContain('SEV1');
      expect(result).toContain('Started');
    });

    it('should handle multiple incidents', () => {
      const incidents = [
        createMockIncident({ identifier: 'INC-001' }),
        createMockIncident({ identifier: 'INC-002' }),
        createMockIncident({ identifier: 'INC-003' })
      ];
      const result = incidentsToCSV(incidents);
      
      const lines = result.split('\n');
      expect(lines.length).toBe(4); // 1 header + 3 data rows
    });

    it('should escape values with commas', () => {
      const incident = createMockIncident({
        summary: 'Summary with, comma'
      });
      const result = incidentsToCSV([incident]);
      
      expect(result).toContain('"Summary with, comma"');
    });

    it('should escape values with quotes', () => {
      const incident = createMockIncident({
        summary: 'Summary with "quotes"'
      });
      const result = incidentsToCSV([incident]);
      
      expect(result).toContain('"Summary with ""quotes"""');
    });

    it('should handle missing optional fields', () => {
      const incident = createMockIncident({
        description: undefined,
        tags: undefined,
        incidentUrl: undefined
      });
      const result = incidentsToCSV([incident]);
      
      expect(result).toBeDefined();
      expect(result.split('\n').length).toBe(2);
    });

    it('should format dates as ISO strings', () => {
      const incident = createMockIncident({
        createdAt: 1700000000
      });
      const result = incidentsToCSV([incident]);
      
      expect(result).toContain('2023-11-14');
    });

    it('should join tags with semicolons', () => {
      const incident = createMockIncident({
        tags: ['tag1', 'tag2', 'tag3']
      });
      const result = incidentsToCSV([incident]);
      
      expect(result).toContain('tag1; tag2; tag3');
    });
  });

  describe('formatIncidentForPDF', () => {
    it('should format incident title', () => {
      const incident = createMockIncident({ name: 'My Incident' });
      const result = formatIncidentForPDF(incident);
      
      expect(result.title).toBe('My Incident');
    });

    it('should include all required sections', () => {
      const incident = createMockIncident();
      const result = formatIncidentForPDF(incident);
      
      const labels = result.sections.map(s => s.label);
      expect(labels).toContain('Incident ID');
      expect(labels).toContain('Severity');
      expect(labels).toContain('Status');
      expect(labels).toContain('Summary');
      expect(labels).toContain('Created By');
    });

    it('should format timeline entries', () => {
      const incident = createMockIncident({
        timelines: [
          {
            id: '1',
            type: 'Incident_Created',
            createdAt: 1700000000,
            userDetails: { name: 'John Doe' }
          }
        ]
      });
      const result = formatIncidentForPDF(incident);
      
      expect(result.timeline.length).toBe(1);
      expect(result.timeline[0].event).toBe('Incident Created');
      expect(result.timeline[0].user).toBe('John Doe');
    });

    it('should handle missing timeline', () => {
      const incident = createMockIncident({
        timelines: undefined
      });
      const result = formatIncidentForPDF(incident);
      
      expect(result.timeline).toEqual([]);
    });

    it('should include key members if present', () => {
      const incident = createMockIncident({
        roles: [
          {
            roleType: 'Incident_Commander',
            userDetails: { name: 'Jane Doe' }
          }
        ]
      });
      const result = formatIncidentForPDF(incident);
      
      const membersSection = result.sections.find(s => s.label === 'Key Members');
      expect(membersSection).toBeDefined();
      expect(membersSection?.value).toContain('Jane Doe');
      expect(membersSection?.value).toContain('Incident Commander');
    });

    it('should handle N/A for missing values', () => {
      const incident = createMockIncident({
        summary: undefined,
        description: undefined
      });
      const result = formatIncidentForPDF(incident);
      
      const summarySection = result.sections.find(s => s.label === 'Summary');
      expect(summarySection?.value).toBe('N/A');
    });
  });
});
