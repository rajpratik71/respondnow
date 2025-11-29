import React from 'react';
import { render, screen } from '@testing-library/react';
import { IncidentReportedBy, IncidentCTA, IncidentLink } from './CellRenderer';
import { Incident } from '@services/server';

// Mock dependencies
jest.mock('@strings', () => ({
  useStrings: () => ({
    getString: (key: string) => {
      const strings: Record<string, string> = {
        'abbv.na': 'N/A',
        'viewChannel': 'View Channel'
      };
      return strings[key] || key;
    }
  })
}));

jest.mock('@harnessio/uicore', () => ({
  Avatar: ({ src, name }: any) => (
    <div data-testid="avatar" data-src={src} data-name={name}>
      Avatar
    </div>
  ),
  Button: ({ text, onClick, disabled, icon, rightIcon }: any) => (
    <button onClick={onClick} disabled={disabled} data-testid="button">
      {icon}
      {typeof text === 'string' ? text : text}
      {rightIcon}
    </button>
  ),
  ButtonSize: { SMALL: 'small' },
  ButtonVariation: { SECONDARY: 'secondary' },
  Container: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Layout: {
    Horizontal: ({ children }: any) => <div>{children}</div>,
    Vertical: ({ children }: any) => <div>{children}</div>
  },
  Text: ({ children }: any) => <span>{children}</span>
}));

jest.mock('@harnessio/icons', () => ({
  Icon: ({ name }: any) => <span data-testid={`icon-${name}`}>{name}</span>
}));

jest.mock('@harnessio/design-system', () => ({
  Color: { GREY_700: 'grey700', GREY_400: 'grey400', PRIMARY_7: 'primary7' },
  FontVariation: { SMALL: 'small', TINY: 'tiny', SMALL_BOLD: 'smallBold' }
}));

jest.mock('@utils', () => ({
  generateSlackChannelLink: (domain: string, id: string) => `https://slack.com/${domain}/${id}`,
  getDetailedTime: (timestamp: number) => new Date(timestamp).toISOString()
}));

jest.mock('@images/slack.svg', () => 'slack-icon.svg');
jest.mock('@images/slack-mono.svg', () => 'slack-mono-icon.svg');

const createMockRow = (incident: Partial<Incident>) => ({
  original: {
    id: 'test-id',
    identifier: 'test-identifier',
    name: 'Test Incident',
    severity: 'SEV1' as const,
    status: 'Started' as const,
    summary: 'Test summary',
    comment: '',
    active: true,
    ...incident
  }
});

describe('CellRenderer', () => {
  describe('IncidentReportedBy', () => {
    it('should display user name with Web source when created from browser', () => {
      const row = createMockRow({
        createdBy: {
          name: 'John Doe',
          userName: 'johndoe',
          source: 'Web'
        },
        createdAt: 1700000000
      });

      const result = IncidentReportedBy({ row } as any);
      render(<>{result}</>);

      expect(screen.getByText('John Doe, via Web')).toBeInTheDocument();
      expect(screen.getByTestId('icon-globe')).toBeInTheDocument();
    });

    it('should display user name with API source when created from API', () => {
      const row = createMockRow({
        createdBy: {
          name: 'API User',
          userName: 'apiuser',
          source: 'API'
        },
        createdAt: 1700000000
      });

      const result = IncidentReportedBy({ row } as any);
      render(<>{result}</>);

      expect(screen.getByText('API User, via API')).toBeInTheDocument();
      expect(screen.getByTestId('icon-globe')).toBeInTheDocument();
    });

    it('should display user name with Slack source and Slack icon when created from Slack', () => {
      const row = createMockRow({
        createdBy: {
          name: 'Slack User',
          userName: 'slackuser',
          source: 'Slack'
        },
        createdAt: 1700000000
      });

      const result = IncidentReportedBy({ row } as any);
      render(<>{result}</>);

      expect(screen.getByText('Slack User, via Slack')).toBeInTheDocument();
      expect(screen.getByTestId('avatar')).toBeInTheDocument();
    });

    it('should default to Web source when source is not specified', () => {
      const row = createMockRow({
        createdBy: {
          name: 'Unknown User',
          userName: 'unknown'
        },
        createdAt: 1700000000
      });

      const result = IncidentReportedBy({ row } as any);
      render(<>{result}</>);

      expect(screen.getByText('Unknown User, via Web')).toBeInTheDocument();
    });

    it('should display N/A when createdBy is not available', () => {
      const row = createMockRow({
        createdBy: undefined,
        createdAt: 1700000000
      });

      const result = IncidentReportedBy({ row } as any);
      render(<>{result}</>);

      expect(screen.getByText('N/A')).toBeInTheDocument();
    });

    it('should use userName when name is not available', () => {
      const row = createMockRow({
        createdBy: {
          userName: 'johndoe',
          source: 'Web'
        },
        createdAt: 1700000000
      });

      const result = IncidentReportedBy({ row } as any);
      render(<>{result}</>);

      expect(screen.getByText('johndoe, via Web')).toBeInTheDocument();
    });
  });

  describe('IncidentCTA', () => {
    it('should show View Channel button when Slack is configured', () => {
      const row = createMockRow({
        incidentChannel: {
          slack: {
            teamDomain: 'test-team'
          }
        },
        channels: [{ id: 'C123456', name: 'incident-channel' }]
      });

      const result = IncidentCTA({ row } as any);
      render(<>{result}</>);

      expect(screen.getByText('View Channel')).toBeInTheDocument();
    });

    it('should show View URL button when incidentUrl is available and no Slack', () => {
      const row = createMockRow({
        incidentUrl: 'https://example.com/incident',
        incidentChannel: undefined,
        channels: undefined
      });

      const result = IncidentCTA({ row } as any);
      render(<>{result}</>);

      expect(screen.getByText('View URL')).toBeInTheDocument();
    });

    it('should not render any button when neither Slack nor incidentUrl is available', () => {
      const row = createMockRow({
        incidentChannel: undefined,
        channels: undefined,
        incidentUrl: undefined
      });

      const { container } = render(<IncidentCTA row={row} />);

      expect(container.firstChild).toBeNull();
    });

    it('should prefer Slack button over incidentUrl when both are available', () => {
      const row = createMockRow({
        incidentChannel: {
          slack: {
            teamDomain: 'test-team'
          }
        },
        channels: [{ id: 'C123456', name: 'incident-channel' }],
        incidentUrl: 'https://example.com/incident'
      });

      const result = IncidentCTA({ row } as any);
      render(<>{result}</>);

      expect(screen.getByText('View Channel')).toBeInTheDocument();
      expect(screen.queryByText('View URL')).not.toBeInTheDocument();
    });

    it('should not show Slack button when teamDomain is missing', () => {
      const row = createMockRow({
        incidentChannel: {
          slack: {}
        },
        channels: [{ id: 'C123456', name: 'incident-channel' }],
        incidentUrl: 'https://example.com/incident'
      });

      const result = IncidentCTA({ row } as any);
      render(<>{result}</>);

      expect(screen.queryByText('View Channel')).not.toBeInTheDocument();
      expect(screen.getByText('View URL')).toBeInTheDocument();
    });

    it('should not show Slack button when channel id is missing', () => {
      const row = createMockRow({
        incidentChannel: {
          slack: {
            teamDomain: 'test-team'
          }
        },
        channels: [],
        incidentUrl: 'https://example.com/incident'
      });

      const result = IncidentCTA({ row } as any);
      render(<>{result}</>);

      expect(screen.queryByText('View Channel')).not.toBeInTheDocument();
      expect(screen.getByText('View URL')).toBeInTheDocument();
    });
  });

  describe('IncidentLink', () => {
    it('should display incident URL as a clickable hyperlink', () => {
      const row = createMockRow({
        incidentUrl: 'https://example.com/incident'
      });

      const result = IncidentLink({ row } as any);
      render(<>{result}</>);

      expect(screen.getByText('https://example.com/incident')).toBeInTheDocument();
      expect(screen.getByTestId('icon-link')).toBeInTheDocument();
      expect(screen.getByTestId('icon-share')).toBeInTheDocument();
    });

    it('should truncate long URLs', () => {
      const longUrl = 'https://example.com/very/long/path/to/incident/details/page';
      const row = createMockRow({
        incidentUrl: longUrl
      });

      const result = IncidentLink({ row } as any);
      render(<>{result}</>);

      // URL should be truncated to 30 chars + '...'
      expect(screen.getByText('https://example.com/very/long/...')).toBeInTheDocument();
    });

    it('should show full URL in title attribute', () => {
      const longUrl = 'https://example.com/very/long/path/to/incident/details/page';
      const row = createMockRow({
        incidentUrl: longUrl
      });

      const result = IncidentLink({ row } as any);
      render(<>{result}</>);

      const linkText = screen.getByText('https://example.com/very/long/...');
      expect(linkText).toHaveAttribute('title', longUrl);
    });

    it('should not render anything when incidentUrl is not provided', () => {
      const row = createMockRow({
        incidentUrl: undefined
      });

      const result = IncidentLink({ row } as any);
      const { container } = render(<>{result}</>);

      expect(container.firstChild).toBeNull();
    });

    it('should not render anything when incidentUrl is empty string', () => {
      const row = createMockRow({
        incidentUrl: ''
      });

      const result = IncidentLink({ row } as any);
      const { container } = render(<>{result}</>);

      expect(container.firstChild).toBeNull();
    });

    it('should have clickable styling', () => {
      const row = createMockRow({
        incidentUrl: 'https://example.com/incident'
      });

      const result = IncidentLink({ row } as any);
      render(<>{result}</>);

      const linkText = screen.getByText('https://example.com/incident');
      expect(linkText).toHaveStyle({ textDecoration: 'underline' });
    });
  });
});
