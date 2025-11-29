import React from 'react';
import { render, screen } from '@testing-library/react';
import { getTimelinePropsBasedOnIncidentData } from './helper';
import { Incident, Timeline } from '@services/server';

// Mock dependencies
jest.mock('@strings', () => ({
  useStrings: () => ({
    getString: (key: string) => {
      const strings: Record<string, string> = {
        'reportedAn': 'reported an',
        'incident': 'Incident',
        'title': 'Title',
        'summary': 'Summary',
        'updated': 'updated',
        'severity': 'Severity',
        'status': 'Status',
        'keyMembers': 'Key Members',
        'incidentChannelCreated': 'Incident channel created',
        'addedMemberAutomatically': 'Added member automatically',
        'from': 'From',
        'to': 'To'
      };
      return strings[key] || key;
    }
  })
}));

jest.mock('@harnessio/uicore', () => ({
  Avatar: ({ src }: any) => <div data-testid="avatar" data-src={src}>Avatar</div>,
  Button: ({ children }: any) => <button>{children}</button>,
  Layout: {
    Horizontal: ({ children }: any) => <div data-testid="layout-horizontal">{children}</div>,
    Vertical: ({ children }: any) => <div data-testid="layout-vertical">{children}</div>
  },
  Text: ({ children }: any) => <span>{children}</span>
}));

jest.mock('@harnessio/icons', () => ({
  Icon: ({ name }: any) => <span data-testid={`icon-${name}`}>{name}</span>
}));

jest.mock('@harnessio/design-system', () => ({
  Color: { 
    PRIMARY_7: 'primary7', 
    GREY_800: 'grey800', 
    GREY_500: 'grey500' 
  },
  FontVariation: { 
    SMALL: 'small', 
    SMALL_BOLD: 'smallBold',
    SMALL_SEMI: 'smallSemi'
  }
}));

jest.mock('@components/SeverityBadge', () => ({ severity }: any) => (
  <span data-testid="severity-badge">{severity}</span>
));

jest.mock('@components/StatusBadge', () => ({ status }: any) => (
  <span data-testid="status-badge">{status}</span>
));

jest.mock('@images/slack.svg', () => 'slack-icon.svg');

jest.mock('@utils', () => ({
  generateSlackChannelLink: (domain: string, id: string) => `https://slack.com/${domain}/${id}`
}));

const createMockIncident = (overrides?: Partial<Incident>): Incident => ({
  id: 'test-id',
  identifier: 'test-identifier',
  name: 'Test Incident',
  severity: 'SEV1',
  status: 'Started',
  summary: 'Test summary',
  comment: '',
  active: true,
  ...overrides
});

const createMockTimeline = (overrides?: Partial<Timeline>): Timeline => ({
  id: 'timeline-1',
  type: 'Incident_Created',
  createdAt: 1700000000,
  updatedAt: 1700000000,
  userDetails: {
    name: 'Test User',
    userName: 'testuser',
    source: 'Web'
  },
  ...overrides
});

describe('getTimelinePropsBasedOnIncidentData', () => {
  describe('Source display', () => {
    it('should show "via Web" for Web source', () => {
      const incident = createMockIncident();
      const timeline = createMockTimeline({
        type: 'Incident_Created',
        userDetails: { name: 'Web User', userName: 'webuser', source: 'Web' }
      });

      const result = getTimelinePropsBasedOnIncidentData({ incident, timeline });
      const { container } = render(<>{result?.headerContent}</>);

      expect(container.textContent).toContain('via Web');
    });

    it('should show "via API" for API source', () => {
      const incident = createMockIncident();
      const timeline = createMockTimeline({
        type: 'Incident_Created',
        userDetails: { name: 'API User', userName: 'apiuser', source: 'API' }
      });

      const result = getTimelinePropsBasedOnIncidentData({ incident, timeline });
      const { container } = render(<>{result?.headerContent}</>);

      expect(container.textContent).toContain('via API');
    });

    it('should show "via Slack" for Slack source', () => {
      const incident = createMockIncident();
      const timeline = createMockTimeline({
        type: 'Incident_Created',
        userDetails: { name: 'Slack User', userName: 'slackuser', source: 'Slack' }
      });

      const result = getTimelinePropsBasedOnIncidentData({ incident, timeline });
      const { container } = render(<>{result?.headerContent}</>);

      expect(container.textContent).toContain('via Slack');
    });

    it('should default to "via Web" when source is not specified', () => {
      const incident = createMockIncident();
      const timeline = createMockTimeline({
        type: 'Incident_Created',
        userDetails: { name: 'Unknown User', userName: 'unknown' }
      });

      const result = getTimelinePropsBasedOnIncidentData({ incident, timeline });
      const { container } = render(<>{result?.headerContent}</>);

      expect(container.textContent).toContain('via Web');
    });
  });

  describe('Timeline types', () => {
    it('should handle Incident_Created type', () => {
      const incident = createMockIncident();
      const timeline = createMockTimeline({ type: 'Incident_Created' });

      const result = getTimelinePropsBasedOnIncidentData({ incident, timeline });

      expect(result).toBeDefined();
      expect(result?.icon).toBeDefined();
      expect(result?.headerContent).toBeDefined();
      expect(result?.bodyContent).toBeDefined();
    });

    it('should handle Status type', () => {
      const incident = createMockIncident();
      const timeline = createMockTimeline({
        type: 'Status',
        previousState: 'Started',
        currentState: 'Acknowledged'
      });

      const result = getTimelinePropsBasedOnIncidentData({ incident, timeline });
      render(<>{result?.bodyContent}</>);

      expect(screen.getAllByTestId('status-badge').length).toBe(2);
    });

    it('should handle Severity type', () => {
      const incident = createMockIncident();
      const timeline = createMockTimeline({
        type: 'Severity',
        previousState: 'SEV2',
        currentState: 'SEV1'
      });

      const result = getTimelinePropsBasedOnIncidentData({ incident, timeline });
      render(<>{result?.bodyContent}</>);

      expect(screen.getAllByTestId('severity-badge').length).toBe(2);
    });

    it('should handle Comment type', () => {
      const incident = createMockIncident();
      const timeline = createMockTimeline({
        type: 'Comment',
        currentState: 'This is a test comment'
      });

      const result = getTimelinePropsBasedOnIncidentData({ incident, timeline });
      const { container } = render(<>{result?.bodyContent}</>);

      expect(container.textContent).toContain('This is a test comment');
    });

    it('should handle Incident_Deleted type', () => {
      const incident = createMockIncident();
      const timeline = createMockTimeline({ type: 'Incident_Deleted' });

      const result = getTimelinePropsBasedOnIncidentData({ incident, timeline });
      const { container } = render(<>{result?.headerContent}</>);

      expect(container.textContent).toContain('deleted the incident');
    });

    it('should handle Incident_Acknowledged type', () => {
      const incident = createMockIncident();
      const timeline = createMockTimeline({ type: 'Incident_Acknowledged' });

      const result = getTimelinePropsBasedOnIncidentData({ incident, timeline });
      const { container } = render(<>{result?.headerContent}</>);

      expect(container.textContent).toContain('acknowledged the incident');
    });

    it('should handle Summary type', () => {
      const incident = createMockIncident();
      const timeline = createMockTimeline({
        type: 'Summary',
        previousState: 'Old summary',
        currentState: 'New summary'
      });

      const result = getTimelinePropsBasedOnIncidentData({ incident, timeline });
      const { container } = render(<>{result?.bodyContent}</>);

      expect(container.textContent).toContain('Old summary');
      expect(container.textContent).toContain('New summary');
    });
  });

  describe('Edge cases', () => {
    it('should return undefined when timeline is not provided', () => {
      const incident = createMockIncident();
      const result = getTimelinePropsBasedOnIncidentData({ 
        incident, 
        timeline: undefined as any 
      });

      expect(result).toBeUndefined();
    });

    it('should return undefined when incident is not provided', () => {
      const timeline = createMockTimeline();
      const result = getTimelinePropsBasedOnIncidentData({ 
        incident: undefined as any, 
        timeline 
      });

      expect(result).toBeUndefined();
    });

    it('should return undefined for unknown timeline type', () => {
      const incident = createMockIncident();
      const timeline = createMockTimeline({ type: 'UnknownType' as any });

      const result = getTimelinePropsBasedOnIncidentData({ incident, timeline });

      expect(result).toBeUndefined();
    });
  });
});
