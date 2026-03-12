'use client';

import { CSSProperties } from 'react';
import { useVirtualScroll } from '@/hooks/useVirtualScroll';

interface VirtualTableProps {
  data: any[];
  columns: { header: string; accessor: string }[];
  rowHeight?: number;
  containerHeight?: number;
}

export default function VirtualTable({
  data,
  columns,
  rowHeight = 50,
  containerHeight = 500
}: VirtualTableProps) {
  const { containerRef, visibleItems, totalHeight } = useVirtualScroll({
    itemCount: data.length,
    itemHeight: rowHeight,
    containerHeight,
    overscan: 5
  });

  // If no data, show empty state
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-gray-500">No data to display</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-auto"
      style={{ height: containerHeight }}
    >
      <div style={{ height: totalHeight, position: 'relative' as const }}>
        {/* Header (fixed) */}
        <div className="sticky top-0 bg-gray-50 border-b border-gray-200 flex z-10">
          {columns.map((col, i) => (
            <div
              key={i}
              className="flex-1 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {col.header}
            </div>
          ))}
        </div>

        {/* Virtualized rows */}
        {visibleItems.map(({ index, style }) => {
          const item = data[index];
          // Ensure style has the correct type for React.CSSProperties
          const rowStyle: CSSProperties = {
            position: 'absolute',
            top: style.top,
            left: 0,
            right: 0,
            height: style.height,
            display: 'flex',
            width: '100%',
            borderBottom: '1px solid #f3f4f6'
          };

          return (
            <div
              key={index}
              style={rowStyle}
              className="hover:bg-gray-50"
            >
              {columns.map((col, i) => (
                <div key={i} className="flex-1 px-6 py-3 text-sm text-gray-900 truncate">
                  {item[col.accessor] || '-'}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
