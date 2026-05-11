interface LoadingProps {
  isProcessing: boolean;
}

const glassStyle = {
  backdropFilter: 'blur(16px)',
  background: 'rgba(255, 255, 255, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
};

export function Loading({ isProcessing }: LoadingProps) {
  if (!isProcessing) return null;

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
      <div className="rounded-xl p-6" style={glassStyle}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5BDCE5] mx-auto"></div>
        <p className="mt-4 text-gray-700">Processing images...</p>
      </div>
    </div>
  );
}
