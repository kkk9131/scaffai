import { useState } from 'react';
import { FileDown, FileImage, FileText, Building2, FileSpreadsheet, ChevronRight } from 'lucide-react';
import { Sidebar } from '../components/layout/Sidebar';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

type OutputType = 'drawing' | 'text' | 'jwcad' | 'archicad' | 'estimate';
type FileFormat = 'svg' | 'png' | 'csv' | 'txt' | 'dxf' | 'ifc' | 'gdl' | 'pdf';

export default function Output() {
  const [selectedType, setSelectedType] = useState<OutputType>('drawing');
  const [selectedFormat, setSelectedFormat] = useState<FileFormat>('svg');

  const outputTypes = [
    { id: 'drawing', label: '図面出力', icon: FileImage, formats: ['svg', 'png'] },
    { id: 'text', label: 'テキスト出力', icon: FileText, formats: ['csv', 'txt'] },
    { id: 'jwcad', label: 'Jw_cad出力', icon: FileDown, formats: ['dxf'] },
    { id: 'archicad', label: 'ArchiCAD出力', icon: Building2, formats: ['ifc', 'gdl'] },
    { id: 'estimate', label: '見積書出力', icon: FileSpreadsheet, formats: ['pdf'] },
  ] as const;

  const formatLabels: Record<FileFormat, string> = {
    svg: 'SVG図面',
    png: 'PNG画像',
    csv: 'CSVデータ',
    txt: 'テキストファイル',
    dxf: 'DXFファイル',
    ifc: 'IFCファイル',
    gdl: 'GDLファイル',
    pdf: 'PDFファイル',
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      {/* Left Sidebar - Output Type Selection */}
      <div className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
        <div className="p-4">
          <Link 
            to="/dashboard" 
            className="block mb-6 font-bold text-lg text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-500 transition-colors"
          >
            ScaffAI
          </Link>
          
          <h2 className="text-lg font-semibold mb-4">出力タイプ</h2>
          <div className="space-y-2">
            {outputTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => {
                  setSelectedType(type.id);
                  setSelectedFormat(type.formats[0]);
                }}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                  selectedType === type.id
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                    : "hover:bg-slate-50 dark:hover:bg-slate-700/50"
                )}
              >
                <type.icon className="w-5 h-5" />
                <span>{type.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Preview Area */}
        <div className="flex-1 p-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 h-full">
            <div className="h-full flex items-center justify-center text-slate-400">
              プレビュー
            </div>
          </div>
        </div>

        {/* Bottom Panel - Format Selection and Actions */}
        <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">出力形式:</label>
              <div className="flex gap-2">
                {outputTypes
                  .find(type => type.id === selectedType)
                  ?.formats.map(format => (
                    <button
                      key={format}
                      onClick={() => setSelectedFormat(format)}
                      className={cn(
                        "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                        selectedFormat === format
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                      )}
                    >
                      {formatLabels[format]}
                    </button>
                  ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <FileDown className="w-4 h-4" />
                <span>保存</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <ChevronRight className="w-4 h-4" />
                <span>共有リンク作成</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}