interface LoadingSpinnerProps {
  message?: string;
  className?: string;
}

export function LoadingSpinner({
  message = "読み込み中...",
  className = ""
}: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center min-h-[60vh] p-8 ${className}`}>
      <div className="relative">
        {/* Glow effect background */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute w-48 h-48 md:w-56 md:h-56 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
        </div>

        {/* Gopher GIF with floating animation */}
        <div className="relative z-10 animate-bounce-slow">
          <div className="relative">
            <img
              src="/Gopher.gif"
              alt="Loading Gopher"
              className="w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-2xl filter brightness-110"
            />
            {/* Subtle rotation glow */}
            <div className="absolute inset-0 w-32 h-32 md:w-40 md:h-40 bg-blue-400/20 rounded-full blur-xl -z-10 animate-pulse" />
          </div>
        </div>

        {/* Pulsing ring effects */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="absolute w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-blue-400/40 animate-ping [animation-duration:2s]" />
          <div className="absolute w-36 h-36 md:w-44 md:h-44 rounded-full border-2 border-blue-500/30 animate-pulse [animation-duration:2s] [animation-delay:0.5s]" />
        </div>
      </div>

      {/* Loading text with fade animation */}
      <div className="mt-10 space-y-3">
        <p className="text-lg md:text-xl font-semibold text-gray-700 dark:text-gray-200 animate-pulse">
          {message}
        </p>
        {/* Animated dots with staggered animation */}
        <div className="flex justify-center items-center space-x-2">
          <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.4s] shadow-lg shadow-blue-500/50" />
          <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.2s] shadow-lg shadow-blue-500/50" />
          <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce shadow-lg shadow-blue-500/50" />
        </div>
      </div>
    </div>
  );
}


