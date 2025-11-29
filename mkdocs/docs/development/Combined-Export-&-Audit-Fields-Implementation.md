# Combined Export & Audit Fields Implementation

## ✅ Status: Backend Complete | Frontend In Progress

---

## 🎯 Features Implemented

### 1. **Combined Export (PDF + Evidence ZIP)** ✅

**Backend:**
- ✅ New endpoint: `GET /api/incident/export/combined/{incidentId}`
- ✅ Creates single ZIP file containing:
  - `incident-{id}.pdf` (PDF with timeline)
  - `001-filename.ext`, `002-file2.ext` (all evidence files)
  - `MANIFEST.txt` (evidence metadata and creators)
- ✅ Filename format: `incident-{id}-{date}-complete.zip`

**Frontend:**
- ✅ Hook added: `useExportCombinedMutation`
- ⏳ Need to update incident details page UI button

---

## 📂 Files Modified/Created

### Backend Files
```
server/src/main/java/io/respondnow/
├── controller/ExportController.java
│   └── Added: exportIncidentWithEvidence() endpoint
├── service/export/ExportService.java
│   └── Added: exportIncidentWithEvidence() interface method
└── service/export/ExportServiceImpl.java
    └── Added: exportIncidentWithEvidence() implementation
```

### Frontend Files
```
portal/src/services/server/hooks/useExportIncidentsMutation.ts
└── Added: 
    - ExportSingleParams interface
    - exportCombined() function  
    - useExportCombinedMutation() hook
```

---

## 🔧 Backend Implementation Details

### Combined Export Endpoint

**Request:**
```http
GET /api/incident/export/combined/{incidentId}?accountIdentifier=xxx&orgIdentifier=yyy&projectIdentifier=zzz
Authorization: Bearer {token}
```

**Response:**
```
Content-Type: application/octet-stream
Content-Disposition: attachment; filename="incident-INC-123-20241128-complete.zip"

ZIP Contents:
├── incident-INC-123.pdf          (Full incident PDF with timeline)
├── 001-screenshot.png            (Evidence file 1)
├── 002-error-logs.txt            (Evidence file 2)
├── 003-database-dump.sql         (Evidence file 3)
└── MANIFEST.txt                  (Evidence metadata)
```

**MANIFEST.txt Example:**
```
INCIDENT EVIDENCE MANIFEST
========================

Incident ID: INC-123
Incident Name: Production Database Outage
Export Date: 2024-11-28 23:10:45
Total Evidence Files: 3

Evidence List:
=============

1. screenshot.png
   File: 001-screenshot.png
   Type: IMAGE
   Size: 125000 bytes
   Description: Error screenshot at 3:45 PM
   Created: 2024-11-28 15:45:30 by John Doe

2. error-logs.txt
   File: 002-error-logs.txt
   Type: TEXT
   Size: 5000 bytes
   Created: 2024-11-28 15:50:12 by Jane Smith

3. database-dump.sql
   File: 003-database-dump.sql
   Type: DOCUMENT
   Size: 250000 bytes
   Description: Database state at time of incident
   Created: 2024-11-28 16:00:00 by Admin User
```

---

## 🌐 Frontend Hook Usage

### Combined Export Hook

```typescript
import { useExportCombinedMutation, downloadBlob } from '@services/server';

const { mutate: exportCombined, isLoading } = useExportCombinedMutation(
  {
    incidentId: incident.identifier,
    queryParams: {
      accountIdentifier: 'default_account_id',
      orgIdentifier: 'org_123',
      projectIdentifier: 'proj_456'
    }
  },
  {
    onSuccess: (blob) => {
      const filename = `incident-${incident.identifier}-${Date.now()}-complete.zip`;
      downloadBlob(blob, filename);
      showSuccess('Incident exported with evidence');
    },
    onError: () => {
      showError('Failed to export incident');
    }
  }
);

// Trigger export
<Button 
  text="Export Complete Incident" 
  icon="download-box"
  onClick={() => exportCombined()}
  loading={isLoading}
/>
```

---

## ⏳ Remaining Work

### 2. **Update Incident Details Page** ⏳

**File:** `/portal/src/views/IncidentDetails/IncidentDetails.tsx`

**Changes Needed:**
1. Import `useExportCombinedMutation`
2. Replace "Export PDF" button with "Export Complete" button  
3. Add audit information section showing:
   - Created By (name/username)
   - Created At (formatted date)
   - Updated By (name/username)
   - Updated At (formatted date)

**Example UI Addition:**
```tsx
{/* Audit Information */}
<Card>
  <Layout.Vertical spacing="small">
    <Text font={{ variation: FontVariation.CARD_TITLE }}>
      Audit Information
    </Text>
    <Layout.Horizontal spacing="large">
      <Layout.Vertical spacing="xsmall">
        <Text color={Color.GREY_500} font={{ size: 'small' }}>Created By</Text>
        <Text>{incidentData.createdBy?.name || incidentData.createdBy?.userName}</Text>
      </Layout.Vertical>
      <Layout.Vertical spacing="xsmall">
        <Text color={Color.GREY_500} font={{ size: 'small' }}>Created At</Text>
        <Text>{moment(incidentData.createdAt).format('MMM D, YYYY h:mm A')}</Text>
      </Layout.Vertical>
      {incidentData.updatedBy && (
        <>
          <Layout.Vertical spacing="xsmall">
            <Text color={Color.GREY_500} font={{ size: 'small' }}>Updated By</Text>
            <Text>{incidentData.updatedBy?.name || incidentData.updatedBy?.userName}</Text>
          </Layout.Vertical>
          <Layout.Vertical spacing="xsmall">
            <Text color={Color.GREY_500} font={{ size: 'small' }}>Updated At</Text>
            <Text>{moment(incidentData.updatedAt).format('MMM D, YYYY h:mm A')}</Text>
          </Layout.Vertical>
        </>
      )}
    </Layout.Horizontal>
  </Layout.Vertical>
</Card>
```

---

### 3. **Add Audit Columns to Incidents List** ⏳

**File:** `/portal/src/tables/Incidents/ListIncidentsTable.tsx`

**Changes Needed:**
Add columns to the table:
1. **Created By** column
2. **Updated At** column

**Example Column Definitions:**
```tsx
{
  Header: 'Created By',
  accessor: 'createdBy',
  Cell: ({ row }: any) => {
    const createdBy = row.original.createdBy;
    return createdBy?.name || createdBy?.userName || '-';
  },
  width: '10%'
},
{
  Header: 'Updated At',
  accessor: 'updatedAt',
  Cell: ({ row }: any) => {
    return row.original.updatedAt 
      ? moment(row.original.updatedAt).format('MMM D, YYYY h:mm A')
      : '-';
  },
  width: '12%'
}
```

---

## 🚀 Deployment Steps

### 1. **Rebuild Backend**

```bash
cd /home/pratira/public/respondnow/server
mvn clean package -DskipTests
```

### 2. **Restart Backend Container**

```bash
cd /home/pratira/public/respondnow/deploy/docker-compose
docker-compose restart respondnow-server
```

### 3. **Verify Backend**

```bash
# Check logs
docker logs respondnow-server --tail 50

# Look for:
# "Mapped {[/incident/export/combined/{incidentId}],...}" 
```

### 4. **Complete Frontend Changes**

After implementing the remaining UI changes:

```bash
cd /home/pratira/public/respondnow/portal
yarn build

cd /home/pratira/public/respondnow/deploy/docker-compose
docker-compose restart respondnow-portal
```

---

## 🧪 Testing

### Test Combined Export

1. **Navigate to Incident Details**
   - Open any incident with evidence attached

2. **Click "Export Complete Incident"**
   - Button should show loading state
   - ZIP file should download
   - Filename: `incident-{id}-{date}-complete.zip`

3. **Verify ZIP Contents**
   - Extract ZIP file
   - Check for:
     - ✅ `incident-{id}.pdf` exists and is valid PDF
     - ✅ All evidence files present with `001-`, `002-` prefixes
     - ✅ `MANIFEST.txt` contains correct metadata
     - ✅ All files can be opened

4. **Test Without Evidence**
   - Try exporting incident with no evidence
   - Should still get ZIP with PDF only

5. **Verify MANIFEST**
   - Open `MANIFEST.txt`
   - Check for:
     - Incident details
     - Evidence list with descriptions
     - Creator names
     - File sizes and types

---

## 📊 API Examples

### cURL Test

```bash
# Get your JWT token first
TOKEN="your-jwt-token-here"

# Export combined
curl -X GET \
  "http://localhost:8191/api/incident/export/combined/INC-123?accountIdentifier=default_account_id" \
  -H "Authorization: Bearer $TOKEN" \
  --output incident-complete.zip

# Verify ZIP
unzip -l incident-complete.zip
```

---

## 📝 Summary

### ✅ Completed
1. **Backend Combined Export**
   - New endpoint `/api/incident/export/combined/{incidentId}`
   - ZIP creation with PDF + Evidence + Manifest
   - GridFS integration for evidence retrieval
   - Audit information in manifest

2. **Frontend Hook**
   - `useExportCombinedMutation` hook created
   - `ExportSingleParams` interface defined
   - Ready for UI integration

### ⏳ Pending
1. **Incident Details Page**
   - Replace "Export PDF" with "Export Complete" button
   - Add audit information card/section

2. **Incidents List Table**
   - Add "Created By" column
   - Add "Updated At" column

3. **Testing**
   - End-to-end testing of combined export
   - UI audit fields display verification

---

## 🎯 Next Steps

1. **Rebuild backend** to load new endpoint
2. **Update IncidentDetails.tsx** with combined export button
3. **Add audit info card** to incident details
4. **Update ListIncidentsTable.tsx** with audit columns  
5. **Test E2E** functionality
6. **Document** final implementation

---

## 🔗 Related Files

- Evidence Management: `/EVIDENCE_MANAGEMENT_IMPLEMENTATION.md`
- PDF Export: `/mkdocs/docs/development/PDF-Export-Implementation-Complete-E2E.md`

---

**Implementation Date:** November 28, 2024  
**Status:** Backend Ready | Frontend Needs UI Updates  
**Ready for:** Backend Rebuild & Testing
