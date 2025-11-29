import { isEqual } from 'lodash-es';
import React, { useCallback } from 'react';
import { Checkbox, TableV2 } from '@harnessio/uicore';
import { Column, CellProps, Renderer } from 'react-table';
import cx from 'classnames';
import { IncidentsTableProps } from '@interfaces';
import { Incident } from '@services/server';
import { useStrings } from '@strings';
import * as CellRenderer from './CellRenderer';
import css from '../CommonTableStyles.module.scss';

interface SelectableIncidentsTableProps extends IncidentsTableProps {
  selectedIds?: Set<string>;
  onSelectionChange?: (selectedIds: Set<string>) => void;
  selectable?: boolean;
}

const IncidentListTable: React.FC<SelectableIncidentsTableProps> = props => {
  const { content, selectedIds = new Set(), onSelectionChange, selectable = false } = props;
  const { getString } = useStrings();

  const handleSelectAll = useCallback((checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      const allIds = new Set(content.map(incident => incident.identifier || '').filter(Boolean));
      onSelectionChange(allIds);
    } else {
      onSelectionChange(new Set());
    }
  }, [content, onSelectionChange]);

  const handleSelectRow = useCallback((incidentId: string, checked: boolean) => {
    if (!onSelectionChange) return;
    const newSelection = new Set(selectedIds);
    if (checked) {
      newSelection.add(incidentId);
    } else {
      newSelection.delete(incidentId);
    }
    onSelectionChange(newSelection);
  }, [selectedIds, onSelectionChange]);

  const allSelected = content.length > 0 && content.every(i => selectedIds.has(i.identifier || ''));
  const someSelected = content.some(i => selectedIds.has(i.identifier || '')) && !allSelected;

  const SelectAllHeader: Renderer<CellProps<Incident>> = () => (
    <Checkbox
      checked={allSelected}
      indeterminate={someSelected}
      onChange={(e: React.FormEvent<HTMLInputElement>) => handleSelectAll(e.currentTarget.checked)}
    />
  );

  const SelectRowCell: Renderer<CellProps<Incident>> = ({ row }) => (
    <Checkbox
      checked={selectedIds.has(row.original.identifier || '')}
      onChange={(e: React.FormEvent<HTMLInputElement>) => 
        handleSelectRow(row.original.identifier || '', e.currentTarget.checked)
      }
    />
  );

  const columns: Column<Incident>[] = React.useMemo(() => {
    const baseColumns: Column<Incident>[] = [
      {
        Header: getString('incident'),
        id: 'name',
        Cell: CellRenderer.IncidentsName,
        width: selectable ? '28%' : '30%'
      },
      {
        Header: getString('reportedBy'),
        id: 'reportedBy',
        Cell: CellRenderer.IncidentReportedBy,
        width: '16%'
      },
      {
        Header: getString('status'),
        id: 'status',
        Cell: CellRenderer.IncidentStatus,
        width: '10%'
      },
      {
        Header: getString('duration'),
        id: 'duration',
        Cell: CellRenderer.IncidentDuration,
        width: selectable ? '10%' : '11%'
      },
      {
        Header: 'Created By',
        id: 'createdBy',
        Cell: CellRenderer.IncidentCreatedBy,
        width: selectable ? '12%' : '13%'
      },
      {
        Header: 'Updated At',
        id: 'updatedAt',
        Cell: CellRenderer.IncidentUpdatedAt,
        width: selectable ? '12%' : '13%'
      },
      {
        Header: getString('links'),
        id: 'links',
        Cell: CellRenderer.IncidentLink,
        width: selectable ? '12%' : '13%'
      },
      {
        Header: '',
        id: 'cta',
        Cell: CellRenderer.IncidentCTA,
        width: selectable ? '8%' : '9%'
      }
    ];

    if (selectable) {
      return [
        {
          Header: SelectAllHeader,
          id: 'selection',
          Cell: SelectRowCell,
          width: '6%',
          disableSortBy: true
        },
        ...baseColumns
      ];
    }

    return baseColumns;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectable, selectedIds, allSelected, someSelected]);

  return <TableV2<Incident> columns={columns} data={content} className={cx(css.paginationFix)} />;
};

const MemoisedIncidentListTable = React.memo(IncidentListTable, (prev, current) => {
  return isEqual(prev, current);
});

export default MemoisedIncidentListTable;
