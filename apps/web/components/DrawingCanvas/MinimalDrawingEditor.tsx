'use client';

import React from 'react';

export default function MinimalDrawingEditor() {
  return (
    <div className="flex h-full bg-gray-100">
      <div className="w-16 bg-slate-800">
        <p className="text-white p-2">Tools</p>
      </div>
      <div className="flex-1 bg-white">
        <p className="p-4">Canvas Area</p>
      </div>
      <div className="w-80 bg-slate-100">
        <p className="p-2">Properties</p>
      </div>
    </div>
  );
}