import React from 'react';

export function LoadingSkeleton() {
  return (
    <div className="w-full space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center mb-8">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-white/5 rounded-md" />
          <div className="h-4 w-72 bg-white/5 rounded-md" />
        </div>
        <div className="h-10 w-32 bg-white/5 rounded-lg" />
      </div>

      {/* Stats/Cards Row Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-[#111111] border border-white/5 rounded-xl p-6 flex flex-col justify-between">
            <div className="h-4 w-24 bg-white/10 rounded" />
            <div className="h-8 w-16 bg-white/10 rounded" />
          </div>
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div className="bg-[#111111] border border-white/5 rounded-xl p-6 mt-8 min-h-[400px]">
        <div className="space-y-4">
          <div className="h-6 w-1/4 bg-white/10 rounded mb-8" />
          
          {/* Table Rows Skeleton */}
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-4 border-b border-white/5 pb-4">
              <div className="h-10 w-10 bg-white/5 rounded-lg" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 w-3/4 bg-white/5 rounded" />
                <div className="h-3 w-1/2 bg-white/5 rounded" />
              </div>
              <div className="h-8 w-24 bg-white/5 rounded self-center" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
