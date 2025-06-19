'use client';

export default function TestUIPage() {
  return (
    <div className="min-h-screen bg-blue-500 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-6">
          Tailwind CSS テスト
        </h1>
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            スタイルテスト
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-red-100 p-4 rounded">
              <p className="text-red-800">赤色のボックス</p>
            </div>
            <div className="bg-green-100 p-4 rounded">
              <p className="text-green-800">緑色のボックス</p>
            </div>
            <div className="bg-blue-100 p-4 rounded">
              <p className="text-blue-800">青色のボックス</p>
            </div>
            <div className="bg-yellow-100 p-4 rounded">
              <p className="text-yellow-800">黄色のボックス</p>
            </div>
          </div>
          <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
            テストボタン
          </button>
        </div>
      </div>
    </div>
  );
}