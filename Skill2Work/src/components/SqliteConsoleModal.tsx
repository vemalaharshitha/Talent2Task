import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Play, 
  Download, 
  RotateCcw, 
  Terminal, 
  AlertCircle,
  Table as TableIcon
} from 'lucide-react';
import { sqliteManager } from '../db/sqliteManager';
import { useLanguage } from '../i18n/LanguageContext';

interface SqliteConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_QUERIES = [
  { label: 'View All Jobs', sql: 'SELECT id, title, category, payout_amount, landmark_area, status FROM jobs ORDER BY created_at DESC;' },
  { label: 'View All Users', sql: 'SELECT id, role, name, phone, skills, preferred_language FROM users;' },
  { label: 'Claimed Gigs with Seekers', sql: 'SELECT j.title, j.payout_amount, s.name as seeker_name, s.phone as seeker_phone FROM jobs j JOIN users s ON j.claimed_by = s.id WHERE j.status = "CLAIMED";' },
  { label: 'Category Summary', sql: 'SELECT category, COUNT(*) as count, AVG(payout_amount) as avg_payout FROM jobs GROUP BY category;' },
  { label: 'Inspect SQLite Schema', sql: 'SELECT type, name, sql FROM sqlite_master WHERE type="table";' }
];

export const SqliteConsoleModal: React.FC<SqliteConsoleModalProps> = ({
  isOpen,
  onClose
}) => {
  const { t } = useLanguage();
  const [sqlQuery, setSqlQuery] = useState(PRESET_QUERIES[0].sql);
  const [queryResults, setQueryResults] = useState<{ columns: string[]; values: any[][] }[] | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [execTimeMs, setExecTimeMs] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleExecute = () => {
    setErrorMsg(null);
    try {
      const startTime = performance.now();
      const results = sqliteManager.executeRawSQL(sqlQuery.trim());
      const duration = performance.now() - startTime;
      setExecTimeMs(Math.round(duration * 100) / 100);
      setQueryResults(results);
    } catch (err: any) {
      setErrorMsg(err.message || String(err));
      setQueryResults(null);
    }
  };

  const handleExportSqlite = () => {
    const binary = sqliteManager.exportDatabaseBinary();
    if (!binary) return;
    const blob = new Blob([binary as any], { type: 'application/x-sqlite3' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `talent2task_vellore_${new Date().toISOString().substring(0, 10)}.sqlite`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetData = () => {
    if (window.confirm('Reset SQLite database to initial Vellore seed data?')) {
      sqliteManager.resetDatabase();
      handleExecute();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      
      <div 
        className="glass-panel w-full max-w-4xl max-h-[92vh] rounded-3xl border border-slate-200 shadow-2xl bg-white overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-lg font-bold text-slate-900">
                  {t.sqlConsoleTitle}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-50 text-sky-700 border border-sky-200">
                  {t.sqlEngineBadge}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {t.sqlConsoleSubtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs font-mono">
          
          {/* Quick Presets */}
          <div className="space-y-1.5 font-sans">
            <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">{t.presetQueriesLabel}</div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {PRESET_QUERIES.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSqlQuery(preset.sql);
                  }}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 text-xs whitespace-nowrap transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* SQL Editor Area */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-slate-600 font-sans text-xs">
              <span className="flex items-center gap-1 font-semibold">
                <Terminal className="w-3.5 h-3.5 text-sky-500" />
                <span>SQL Query Editor</span>
              </span>
              <span className="text-[11px] text-slate-400">Supports SELECT, INSERT, UPDATE, DELETE, CREATE</span>
            </div>

            <div className="relative">
              <textarea
                rows={4}
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                className="w-full p-3.5 bg-slate-900 border border-slate-800 rounded-2xl text-sky-300 font-mono text-xs focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 resize-none shadow-inner"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 font-sans">
            <div className="flex items-center gap-2">
              <button
                onClick={handleExecute}
                className="px-4 py-2 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-sky-500/20 transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{t.executeBtn}</span>
              </button>

              <button
                onClick={handleResetData}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-xs border border-slate-200 flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-sky-600" />
                <span>{t.resetBtn}</span>
              </button>
            </div>

            <button
              onClick={handleExportSqlite}
              className="px-3 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 font-semibold rounded-xl text-xs border border-sky-200 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-sky-600" />
              <span>{t.exportBtn}</span>
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2 font-mono text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Query Results Table */}
          {queryResults && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-slate-600 font-sans text-xs">
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <TableIcon className="w-3.5 h-3.5 text-sky-500" />
                  <span>Query Results ({queryResults[0]?.values.length || 0} {t.rowsReturned})</span>
                </span>
                {execTimeMs !== null && (
                  <span className="text-[11px] text-sky-600 font-mono font-bold">
                    ⚡ {execTimeMs} ms
                  </span>
                )}
              </div>

              {queryResults.length > 0 && queryResults[0].values.length > 0 ? (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 max-h-64 shadow-xs bg-white">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-slate-800">
                      <tr>
                        {queryResults[0].columns.map((col, idx) => (
                          <th key={idx} className="p-2.5 font-bold whitespace-nowrap">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {queryResults[0].values.map((row, rowIdx) => (
                        <tr key={rowIdx} className="hover:bg-slate-50">
                          {row.map((cell, cellIdx) => (
                            <td key={cellIdx} className="p-2.5 text-slate-700 whitespace-nowrap max-w-xs truncate">
                              {cell === null ? (
                                <span className="text-slate-400 italic">NULL</span>
                              ) : typeof cell === 'object' ? (
                                JSON.stringify(cell)
                              ) : (
                                String(cell)
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-slate-500 font-sans">
                  {t.noResults}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
