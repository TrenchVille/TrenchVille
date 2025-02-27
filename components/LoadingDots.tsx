export const LoadingDots = () => {
  return (
    <div className="flex space-x-1">
      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
      <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-75"></div>
      <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-150"></div>
    </div>
  )
}
