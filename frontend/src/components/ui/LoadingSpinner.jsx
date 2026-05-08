export default function LoadingSpinner({ size = 'md' }) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-4',
    lg: 'h-12 w-12 border-4',
  }[size];

  return (
    <div className="flex justify-center items-center py-8">
      <div className={`animate-spin rounded-full ${sizeClasses} border-t-indigo-600 border-gray-200`} />
    </div>
  );
}