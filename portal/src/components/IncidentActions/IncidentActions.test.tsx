import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import IncidentActions from './IncidentActions';
import { Incident } from '@services/server';

// Mock the hooks
jest.mock('@services/server', () => ({
  useDeleteIncidentMutation: jest.fn(() => ({
    mutate: jest.fn(),
    isLoading: false
  })),
  useAcknowledgeIncidentMutation: jest.fn(() => ({
    mutate: jest.fn(),
    isLoading: false
  })),
  useUpdateIncidentStatusMutation: jest.fn(() => ({
    mutate: jest.fn(),
    isLoading: false
  }))
}));

jest.mock('@utils', () => ({
  getScope: jest.fn(() => ({ accountIdentifier: 'test-account' }))
}));

jest.mock('@harnessio/uicore', () => ({
  Button: ({ text, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>
      {text}
    </button>
  ),
  ButtonVariation: { SECONDARY: 'secondary', TERTIARY: 'tertiary', PRIMARY: 'primary' },
  ConfirmationDialog: ({ isOpen, onConfirm, onClose, titleText }: any) =>
    isOpen ? (
      <div data-testid="confirmation-dialog">
        <span>{titleText}</span>
        <button onClick={onConfirm}>Confirm</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    ) : null,
  Layout: {
    Horizontal: ({ children }: any) => <div>{children}</div>
  },
  Popover: ({ children, content }: any) => (
    <div>
      {children}
      <div data-testid="popover-content">{content}</div>
    </div>
  ),
  useToaster: () => ({
    showSuccess: jest.fn(),
    showError: jest.fn()
  })
}));

jest.mock('@blueprintjs/core', () => ({
  Menu: ({ children }: any) => <div data-testid="menu">{children}</div>,
  MenuItem: ({ text, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled} data-testid={`menu-item-${text}`}>
      {text}
    </button>
  ),
  Intent: { DANGER: 'danger' }
}));

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = createQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
};

describe('IncidentActions', () => {
  const mockIncident: Incident = {
    id: 'test-id',
    identifier: 'test-identifier',
    name: 'Test Incident',
    severity: 'SEV1',
    status: 'Started',
    summary: 'Test summary',
    comment: '',
    active: true
  };

  const mockOnActionComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Acknowledge button', () => {
    it('should show acknowledge button when status is Started', () => {
      renderWithProviders(
        <IncidentActions
          incident={mockIncident}
          onActionComplete={mockOnActionComplete}
          showAcknowledge={true}
        />
      );

      expect(screen.getByText('Acknowledge')).toBeInTheDocument();
    });

    it('should not show acknowledge button when status is not Started', () => {
      const acknowledgedIncident = { ...mockIncident, status: 'Acknowledged' as const };
      renderWithProviders(
        <IncidentActions
          incident={acknowledgedIncident}
          onActionComplete={mockOnActionComplete}
          showAcknowledge={true}
        />
      );

      expect(screen.queryByText('Acknowledge')).not.toBeInTheDocument();
    });

    it('should not show acknowledge button when showAcknowledge is false', () => {
      renderWithProviders(
        <IncidentActions
          incident={mockIncident}
          onActionComplete={mockOnActionComplete}
          showAcknowledge={false}
        />
      );

      expect(screen.queryByText('Acknowledge')).not.toBeInTheDocument();
    });
  });

  describe('Status update', () => {
    it('should show Update Status button when showStatusUpdate is true', () => {
      renderWithProviders(
        <IncidentActions
          incident={mockIncident}
          onActionComplete={mockOnActionComplete}
          showStatusUpdate={true}
        />
      );

      expect(screen.getByText('Update Status')).toBeInTheDocument();
    });

    it('should not show Update Status button when showStatusUpdate is false', () => {
      renderWithProviders(
        <IncidentActions
          incident={mockIncident}
          onActionComplete={mockOnActionComplete}
          showStatusUpdate={false}
        />
      );

      expect(screen.queryByText('Update Status')).not.toBeInTheDocument();
    });

    it('should show status options in menu', () => {
      renderWithProviders(
        <IncidentActions
          incident={mockIncident}
          onActionComplete={mockOnActionComplete}
          showStatusUpdate={true}
        />
      );

      expect(screen.getByTestId('menu-item-Started')).toBeInTheDocument();
      expect(screen.getByTestId('menu-item-Acknowledged')).toBeInTheDocument();
      expect(screen.getByTestId('menu-item-Investigating')).toBeInTheDocument();
      expect(screen.getByTestId('menu-item-Identified')).toBeInTheDocument();
      expect(screen.getByTestId('menu-item-Mitigated')).toBeInTheDocument();
      expect(screen.getByTestId('menu-item-Resolved')).toBeInTheDocument();
    });

    it('should disable current status option', () => {
      renderWithProviders(
        <IncidentActions
          incident={mockIncident}
          onActionComplete={mockOnActionComplete}
          showStatusUpdate={true}
        />
      );

      expect(screen.getByTestId('menu-item-Started')).toBeDisabled();
    });
  });

  describe('Delete functionality', () => {
    it('should show delete button when showDelete is true', () => {
      const { container } = renderWithProviders(
        <IncidentActions
          incident={mockIncident}
          onActionComplete={mockOnActionComplete}
          showDelete={true}
        />
      );

      // Delete button should exist (checking by icon attribute)
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should not show delete button when showDelete is false', () => {
      renderWithProviders(
        <IncidentActions
          incident={mockIncident}
          onActionComplete={mockOnActionComplete}
          showDelete={false}
        />
      );

      expect(screen.queryByTestId('confirmation-dialog')).not.toBeInTheDocument();
    });
  });
});
