import React, { useState, useRef } from 'react';
import { withErrorBoundary } from 'react-error-boundary';
import {
  Button,
  ButtonVariation,
  Card,
  Container,
  Layout,
  Text,
  TextInput,
  useToaster,
  Dialog
} from '@harnessio/uicore';
import { Color, FontVariation } from '@harnessio/design-system';
import { Icon } from '@harnessio/icons';
import { Fallback } from '@errors';
import { Evidence as EvidenceType } from '@services/server/types/Evidence';
import {
  useGetEvidence,
  useUploadEvidence,
  useAddTextEvidence,
  useDeleteEvidence,
  useExportEvidenceZip
} from '@services/server/hooks/useEvidenceMutations';
import { useQueryClient } from '@tanstack/react-query';
import { getScope } from '@utils';
import moment from 'moment';
import css from './Evidence.module.scss';

export interface EvidenceProps {
  incidentId: string;
  incidentIdentifier: string;
}

const Evidence: React.FC<EvidenceProps> = ({ incidentId, incidentIdentifier }) => {
  const { showSuccess, showError } = useToaster();
  const queryClient = useQueryClient();
  const scope = getScope();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isTextDialogOpen, setIsTextDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDescription, setFileDescription] = useState('');
  const [textContent, setTextContent] = useState('');
  const [textFilename, setTextFilename] = useState('');
  const [textDescription, setTextDescription] = useState('');

  // Fetch evidence
  const { data: evidenceList = [], isLoading, refetch } = useGetEvidence(incidentId, {
    enabled: !!incidentId
  });

  // Upload mutation
  const { mutate: uploadEvidence, isLoading: isUploading } = useUploadEvidence({
    onSuccess: () => {
      showSuccess('Evidence uploaded successfully');
      setIsUploadDialogOpen(false);
      setSelectedFile(null);
      setFileDescription('');
      queryClient.invalidateQueries(['evidence', incidentId]);
    },
    onError: () => {
      showError('Failed to upload evidence');
    }
  });

  // Add text mutation
  const { mutate: addTextEvidence, isLoading: isAddingText } = useAddTextEvidence({
    onSuccess: () => {
      showSuccess('Text evidence added successfully');
      setIsTextDialogOpen(false);
      setTextContent('');
      setTextFilename('');
      setTextDescription('');
      queryClient.invalidateQueries(['evidence', incidentId]);
    },
    onError: () => {
      showError('Failed to add text evidence');
    }
  });

  // Delete mutation
  const { mutate: deleteEvidence } = useDeleteEvidence({
    onSuccess: () => {
      showSuccess('Evidence deleted successfully');
      queryClient.invalidateQueries(['evidence', incidentId]);
    },
    onError: () => {
      showError('Failed to delete evidence');
    }
  });

  // Export ZIP mutation
  const { mutate: exportZip, isLoading: isExporting } = useExportEvidenceZip({
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `incident-${incidentIdentifier}-${moment().format('YYYYMMDD')}-evidence.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showSuccess('Evidence exported successfully');
    },
    onError: () => {
      showError('Failed to export evidence');
    }
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setIsUploadDialogOpen(true);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    uploadEvidence({
      incidentId,
      file: selectedFile,
      description: fileDescription,
      accountIdentifier: scope.accountIdentifier,
      orgIdentifier: scope.orgIdentifier,
      projectIdentifier: scope.projectIdentifier
    });
  };

  const handleAddText = () => {
    if (!textContent.trim()) {
      showError('Text content is required');
      return;
    }

    addTextEvidence({
      incidentId,
      textContent,
      filename: textFilename || `text-evidence-${Date.now()}.txt`,
      description: textDescription,
      accountIdentifier: scope.accountIdentifier,
      orgIdentifier: scope.orgIdentifier,
      projectIdentifier: scope.projectIdentifier
    });
  };

  const handleDownload = (evidence: EvidenceType) => {
    window.open(evidence.downloadUrl, '_blank');
  };

  const handleDelete = (evidenceId: string) => {
    if (confirm('Are you sure you want to delete this evidence?')) {
      deleteEvidence(evidenceId);
    }
  };

  const handleExportAll = () => {
    if (evidenceList.length === 0) {
      showError('No evidence to export');
      return;
    }
    exportZip({ incidentId, incidentIdentifier });
  };

  const getFileIcon = (evidenceType: string) => {
    switch (evidenceType) {
      case 'IMAGE':
        return 'main-file-image';
      case 'DOCUMENT':
        return 'main-file-doc';
      case 'VIDEO':
        return 'main-video';
      case 'AUDIO':
        return 'main-volume-up';
      case 'TEXT':
        return 'main-notes';
      default:
        return 'main-file';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Container className={css.evidenceContainer}>
      <Card>
        <Layout.Vertical spacing="medium">
          {/* Header */}
          <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Text color={Color.GREY_900} font={{ variation: FontVariation.CARD_TITLE }}>
              Evidence ({evidenceList.length})
            </Text>
            <Layout.Horizontal spacing="small">
              <input
                ref={fileInputRef}
                type="file"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
              />
              <Button
                variation={ButtonVariation.SECONDARY}
                size="small"
                text="Upload File"
                icon="upload-box"
                onClick={() => fileInputRef.current?.click()}
              />
              <Button
                variation={ButtonVariation.SECONDARY}
                size="small"
                text="Add Text"
                icon="add"
                onClick={() => setIsTextDialogOpen(true)}
              />
              {evidenceList.length > 0 && (
                <Button
                  variation={ButtonVariation.SECONDARY}
                  size="small"
                  text="Export All"
                  icon="download-box"
                  onClick={handleExportAll}
                  loading={isExporting}
                  disabled={isExporting}
                />
              )}
            </Layout.Horizontal>
          </Layout.Horizontal>

          {/* Evidence List */}
          {isLoading ? (
            <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'center' }} padding="large">
              <Text>Loading evidence...</Text>
            </Layout.Horizontal>
          ) : evidenceList.length === 0 ? (
            <Layout.Vertical 
              flex={{ alignItems: 'center', justifyContent: 'center' }} 
              padding="xlarge"
              style={{ backgroundColor: '#f3f3fa', borderRadius: '8px' }}
            >
              <Icon name="main-folder-open" size={48} color={Color.GREY_400} />
              <Text color={Color.GREY_600} margin={{ top: 'medium' }}>
                No evidence added yet
              </Text>
              <Text color={Color.GREY_500} font={{ size: 'small' }}>
                Upload files or add text to document this incident
              </Text>
            </Layout.Vertical>
          ) : (
            <Layout.Vertical spacing="small">
              {evidenceList.map((evidence) => (
                <div key={evidence.id} className={css.evidenceItem}>
                  <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'space-between' }} padding="medium">
                    <Layout.Horizontal spacing="medium" flex={{ alignItems: 'center' }}>
                      <Icon name={getFileIcon(evidence.evidenceType)} size={24} color={Color.PRIMARY_7} />
                      <Layout.Vertical spacing="xsmall">
                        <Text color={Color.GREY_900} font={{ weight: 'semi-bold' }}>
                          {evidence.filename}
                        </Text>
                        <Layout.Horizontal spacing="medium">
                          <Text color={Color.GREY_500} font={{ size: 'small' }}>
                            {formatFileSize(evidence.fileSize)}
                          </Text>
                          <Text color={Color.GREY_500} font={{ size: 'small' }}>
                            {moment(evidence.createdAt).format('MMM D, YYYY h:mm A')}
                          </Text>
                          <Text color={Color.GREY_500} font={{ size: 'small' }}>
                            by {evidence.createdBy.name || evidence.createdBy.userName}
                          </Text>
                        </Layout.Horizontal>
                        {evidence.description && (
                          <Text color={Color.GREY_600} font={{ size: 'small' }}>
                            {evidence.description}
                          </Text>
                        )}
                      </Layout.Vertical>
                    </Layout.Horizontal>
                    <Layout.Horizontal spacing="small">
                      <Button
                        variation={ButtonVariation.ICON}
                        icon="download"
                        iconProps={{ size: 16 }}
                        onClick={() => handleDownload(evidence)}
                        tooltip="Download"
                      />
                      <Button
                        variation={ButtonVariation.ICON}
                        icon="main-trash"
                        iconProps={{ size: 16, color: Color.RED_500 }}
                        onClick={() => handleDelete(evidence.id)}
                        tooltip="Delete"
                      />
                    </Layout.Horizontal>
                  </Layout.Horizontal>
                </div>
              ))}
            </Layout.Vertical>
          )}
        </Layout.Vertical>
      </Card>

      {/* Upload Dialog */}
      <Dialog
        isOpen={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        title="Upload Evidence"
        style={{ width: 500 }}
      >
        <Layout.Vertical spacing="medium" padding="large">
          {selectedFile && (
            <>
              <Layout.Vertical spacing="xsmall">
                <Text color={Color.GREY_700} font={{ size: 'small', weight: 'semi-bold' }}>
                  File
                </Text>
                <Text color={Color.GREY_900}>{selectedFile.name}</Text>
                <Text color={Color.GREY_500} font={{ size: 'small' }}>
                  {formatFileSize(selectedFile.size)}
                </Text>
              </Layout.Vertical>
              <TextInput
                label="Description (optional)"
                placeholder="Add a description for this evidence"
                value={fileDescription}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFileDescription(e.target.value)}
              />
              <Layout.Horizontal spacing="small" flex={{ justifyContent: 'flex-end' }}>
                <Button
                  variation={ButtonVariation.SECONDARY}
                  text="Cancel"
                  onClick={() => {
                    setIsUploadDialogOpen(false);
                    setSelectedFile(null);
                    setFileDescription('');
                  }}
                />
                <Button
                  variation={ButtonVariation.PRIMARY}
                  text="Upload"
                  onClick={handleUpload}
                  loading={isUploading}
                  disabled={isUploading}
                />
              </Layout.Horizontal>
            </>
          )}
        </Layout.Vertical>
      </Dialog>

      {/* Add Text Dialog */}
      <Dialog
        isOpen={isTextDialogOpen}
        onClose={() => setIsTextDialogOpen(false)}
        title="Add Text Evidence"
        style={{ width: 600 }}
      >
        <Layout.Vertical spacing="medium" padding="large">
          <TextInput
            label="Filename (optional)"
            placeholder="evidence.txt"
            value={textFilename}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTextFilename(e.target.value)}
          />
          <Layout.Vertical spacing="xsmall">
            <Text color={Color.GREY_700} font={{ size: 'small', weight: 'semi-bold' }}>
              Text Content *
            </Text>
            <textarea
              className={css.textArea}
              placeholder="Enter text content, logs, or notes..."
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              rows={8}
            />
          </Layout.Vertical>
          <TextInput
            label="Description (optional)"
            placeholder="Add a description for this evidence"
            value={textDescription}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTextDescription(e.target.value)}
          />
          <Layout.Horizontal spacing="small" flex={{ justifyContent: 'flex-end' }}>
            <Button
              variation={ButtonVariation.SECONDARY}
              text="Cancel"
              onClick={() => {
                setIsTextDialogOpen(false);
                setTextContent('');
                setTextFilename('');
                setTextDescription('');
              }}
            />
            <Button
              variation={ButtonVariation.PRIMARY}
              text="Add"
              onClick={handleAddText}
              loading={isAddingText}
              disabled={isAddingText || !textContent.trim()}
            />
          </Layout.Horizontal>
        </Layout.Vertical>
      </Dialog>
    </Container>
  );
};

export default withErrorBoundary(Evidence, {
  FallbackComponent: Fallback,
  onError: (error) => {
    console.error('Evidence component error:', error);
  }
});
