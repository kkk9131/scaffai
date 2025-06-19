'use client';

export default function TestComponent() {
  return (
    <div className="bg-red-500 text-white p-4 m-4 rounded">
      <h1 className="text-2xl font-bold">テストコンポーネント</h1>
      <p className="mt-2">このテキストが赤い背景に白い文字で表示されるはずです。</p>
      <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        テストボタン
      </button>
    </div>
  );
}