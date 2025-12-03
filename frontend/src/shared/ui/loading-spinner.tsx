interface LoadingSpinnerProps {
  message?: string;
  className?: string;
}

export function LoadingSpinner({
  message = "読み込み中...",
  className = ""
}: LoadingSpinnerProps) {
  return (
    <div className={`max-w-md mx-auto p-4 text-center ${className}`}>
      <p>{message}</p>
    </div>
  );
}


