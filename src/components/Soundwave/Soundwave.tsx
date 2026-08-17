"use client"

const Soundwave = () => {
  return (
    <div className="flex items-end gap-1 h-32">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="w-2 bg-orange-500 rounded-full"
          style={{
            height: `${25 + i * 10}%`,
            animation: "bounce 1s infinite ease-in-out",
            animationDelay: `${i * 0.1}s`,
            animationFillMode: "both"
          }}
        />
      ))}
      <style>{`
        @keyframes bounce {
          0%,
          100% {
            transform: scaleY(0.3);
          }
          50% {
            transform: scaleY(1);
          }
        }
      `}</style>
    </div>
  )
}

export default Soundwave
