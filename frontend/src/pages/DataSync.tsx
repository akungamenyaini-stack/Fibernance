import React, { useRef, useState } from 'react';
import { useConfirmImport, useExportData, useImportPreview } from '../api/data_sync';
import type { ImportPreview, ImportResult } from '../api/data_sync';

const DataSync: React.FC = () => {
  const [exportType, setExportType] = useState<'inventory' | 'orders' | 'both'>('both');
  const [importType, setImportType] = useState<'inventory' | 'orders' | 'both'>('both');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportMutation = useExportData();
  const previewMutation = useImportPreview();
  const confirmMutation = useConfirmImport();

  const downloadJson = (payload: unknown, filename: string) => {
    const jsonString = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    try {
      const data = await exportMutation.mutateAsync(exportType);
      downloadJson(data, `fibernance_${exportType}_${new Date().toISOString().split('T')[0]}.json`);
      alert('Data export completed.');
    } catch (error: any) {
      alert(`Export failed: ${error.message}`);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImportPreview(null);
    }
  };

  const handlePreviewImport = async () => {
    if (!selectedFile) {
      alert('Select a file before loading the preview.');
      return;
    }

    try {
      const preview = await previewMutation.mutateAsync({
        file: selectedFile,
        importType,
      });
      setImportPreview(preview);
      setShowPreviewModal(true);
    } catch (error: any) {
      alert(`Preview failed: ${error.response?.data?.detail || error.message}`);
    }
  };

  const createBackupAndDownload = async () => {
    try {
      const backupData = await exportMutation.mutateAsync('both');
      downloadJson(
        backupData,
        `fibernance_backup_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`
      );
      return true;
    } catch (error) {
      console.error('Backup export failed:', error);
      return false;
    }
  };

  const handleConfirmImport = async () => {
    if (!selectedFile) {
      alert('Select a file before importing.');
      return;
    }

    const confirmed = window.confirm(
      'This action replaces existing records with the imported file. Continue?'
    );

    if (!confirmed) {
      return;
    }

    try {
      alert('Creating a backup before import.');
      const backupSuccess = await createBackupAndDownload();

      if (!backupSuccess) {
        alert('Backup could not be created. Import will continue without a downloaded backup file.');
      }

      const result = await confirmMutation.mutateAsync({
        file: selectedFile,
        importType,
      });

      setImportResult({
        ...result,
        backup_created: backupSuccess,
      } as ImportResult);
      setShowPreviewModal(false);
      setShowResultModal(true);
      setSelectedFile(null);
      setImportPreview(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      alert(`Import failed: ${error.response?.data?.detail || error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-white animate-fade-slide-up">
      <div className="border-b border-gray-200 px-4 py-6 lg:px-8 lg:py-12">
        <h1 className="text-2xl font-serif font-semibold text-black lg:text-4xl">Data Sync</h1>
        <p className="mt-2 text-sm text-gray-600">
          Export backups, review incoming files, and restore structured data with a controlled workflow.
        </p>
      </div>

      <div className="px-4 py-8 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="panel p-6 lg:p-8">
            <p className="section-label">Export</p>
            <h2 className="mt-2 text-2xl font-serif font-semibold text-black">Download Structured Data</h2>
            <p className="mt-2 text-sm text-gray-600">
              Export inventory, orders, or both into a timestamped JSON snapshot.
            </p>

            <div className="mt-8 space-y-4">
              <label className="section-label block">Export Scope</label>
              <div className="space-y-3">
                {(['inventory', 'orders', 'both'] as const).map((type) => (
                  <label
                    key={type}
                    className="flex items-center gap-3 border border-gray-200 px-4 py-4 rounded-none text-sm text-black"
                  >
                    <input
                      type="radio"
                      name="exportType"
                      value={type}
                      checked={exportType === type}
                      onChange={(event) => setExportType(event.target.value as typeof type)}
                      className="h-4 w-4"
                    />
                    <span className="font-medium">
                      {type === 'inventory' && 'Inventory only'}
                      {type === 'orders' && 'Orders only'}
                      {type === 'both' && 'Inventory and orders'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-8 border-t border-gray-200 pt-8">
              <button
                type="button"
                onClick={handleExport}
                disabled={exportMutation.isPending}
                className="btn-primary w-full py-3 text-xs uppercase tracking-wide"
              >
                {exportMutation.isPending ? 'Exporting' : 'Export Data'}
              </button>
            </div>
          </section>

          <section className="panel p-6 lg:p-8">
            <p className="section-label">Import</p>
            <h2 className="mt-2 text-2xl font-serif font-semibold text-black">Review and Restore</h2>
            <p className="mt-2 text-sm text-gray-600">
              Load a JSON file, inspect the impact, and confirm the replacement flow deliberately.
            </p>

            <div className="mt-8 space-y-4">
              <label className="section-label block">Import Scope</label>
              <div className="space-y-3">
                {(['inventory', 'orders', 'both'] as const).map((type) => (
                  <label
                    key={type}
                    className="flex items-center gap-3 border border-gray-200 px-4 py-4 rounded-none text-sm text-black"
                  >
                    <input
                      type="radio"
                      name="importType"
                      value={type}
                      checked={importType === type}
                      onChange={(event) => setImportType(event.target.value as typeof type)}
                      className="h-4 w-4"
                    />
                    <span className="font-medium">
                      {type === 'inventory' && 'Inventory only'}
                      {type === 'orders' && 'Orders only'}
                      {type === 'both' && 'Inventory and orders'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <label className="section-label block">JSON File</label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="mt-2 text-sm"
              />
              {selectedFile && (
                <p className="mt-3 text-xs uppercase tracking-wide text-gray-500">
                  Selected file: {selectedFile.name}
                </p>
              )}
            </div>

            <div className="mt-8 flex flex-col gap-3 border-t border-gray-200 pt-8">
              <button
                type="button"
                onClick={handlePreviewImport}
                disabled={!selectedFile || previewMutation.isPending}
                className="btn-primary w-full py-3 text-xs uppercase tracking-wide"
              >
                {previewMutation.isPending ? 'Loading Preview' : 'Preview Changes'}
              </button>
              <p className="text-xs text-gray-500">
                A preview is required before any import can be confirmed.
              </p>
            </div>
          </section>
        </div>
      </div>

      {showPreviewModal && importPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto border border-gray-200 bg-white rounded-none">
            <div className="sticky top-0 border-b border-gray-200 bg-white px-6 py-5">
              <p className="section-label">Import Preview</p>
              <h3 className="mt-2 text-2xl font-serif font-semibold text-black">Review Structural Impact</h3>
              <p className="mt-2 text-sm text-gray-600">Confirm what will be added or replaced before continuing.</p>
            </div>

            <div className="space-y-6 p-6">
              <div className="border border-red-200 bg-red-50 p-4 rounded-none">
                <p className="status-badge status-badge-danger">Destructive Change</p>
                <div className="mt-4 space-y-2 text-sm text-gray-800">
                  <p>Records to delete: <span className="font-semibold">{importPreview.records_to_delete}</span></p>
                  <p>Records to add: <span className="font-semibold">{importPreview.records_to_add}</span></p>
                </div>
              </div>

              <div>
                <p className="section-label">Affected Items</p>
                <div className="mt-3 max-h-40 space-y-2 overflow-y-auto border border-gray-200 bg-gray-50 p-4 rounded-none">
                  {importPreview.affected_items.slice(0, 10).map((item, index) => (
                    <p key={index} className="text-sm font-mono text-gray-700">
                      {item}
                    </p>
                  ))}
                  {importPreview.affected_items.length > 10 && (
                    <p className="text-sm text-gray-500">
                      {importPreview.affected_items.length - 10} additional items are hidden from this preview.
                    </p>
                  )}
                </div>
              </div>

              {Object.keys(importPreview.preview_sample).length > 0 && (
                <div>
                  <p className="section-label">Sample Payload</p>
                  <pre className="mt-3 max-h-48 overflow-x-auto border border-gray-200 bg-gray-50 p-4 text-xs text-gray-700 rounded-none">
                    {JSON.stringify(importPreview.preview_sample, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 flex gap-3 border-t border-gray-200 bg-white px-6 py-4">
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="btn-secondary flex-1 py-3 text-xs uppercase tracking-wide"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={confirmMutation.isPending}
                className="btn-primary flex-1 py-3 text-xs uppercase tracking-wide"
              >
                {confirmMutation.isPending ? 'Importing' : 'Confirm Import'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showResultModal && importResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-lg border border-gray-200 bg-white rounded-none">
            <div className="border-b border-gray-200 px-6 py-5">
              <p className={`status-badge ${importResult.success ? 'status-badge-success' : 'status-badge-danger'}`}>
                {importResult.success ? 'Import Complete' : 'Import Failed'}
              </p>
              <h3 className="mt-3 text-2xl font-serif font-semibold text-black">Import Result</h3>
            </div>

            <div className="space-y-4 p-6">
              <p className="text-sm text-gray-800">{importResult.message}</p>

              {importResult.backup_created && (
                <div className="border border-gray-200 bg-gray-50 p-4 rounded-none">
                  <p className="section-label">Backup</p>
                  <p className="mt-2 text-sm text-gray-700">
                    A backup file was downloaded before the import was applied.
                  </p>
                </div>
              )}

              {importResult.success && (
                <div className="border border-green-200 bg-green-50 p-4 rounded-none">
                  <p className="status-badge status-badge-success">Applied</p>
                  <div className="mt-4 space-y-2 text-sm text-gray-800">
                    {importResult.accounts_added > 0 && <p>Accounts added: {importResult.accounts_added}</p>}
                    {importResult.accounts_deleted > 0 && <p>Accounts deleted: {importResult.accounts_deleted}</p>}
                    {importResult.orders_added > 0 && <p>Orders added: {importResult.orders_added}</p>}
                    {importResult.orders_deleted > 0 && <p>Orders deleted: {importResult.orders_deleted}</p>}
                  </div>
                </div>
              )}

              {importResult.errors.length > 0 && (
                <div className="border border-red-200 bg-red-50 p-4 rounded-none">
                  <p className="status-badge status-badge-danger">Errors</p>
                  <div className="mt-4 space-y-1 text-sm text-gray-800">
                    {importResult.errors.map((error, index) => (
                      <p key={index}>{error}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 bg-white px-6 py-4">
              <button
                type="button"
                onClick={() => {
                  setShowResultModal(false);
                  setImportResult(null);
                  window.location.reload();
                }}
                className="btn-primary w-full py-3 text-xs uppercase tracking-wide"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataSync;