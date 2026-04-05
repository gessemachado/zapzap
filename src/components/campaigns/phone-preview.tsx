'use client'

type Props = {
  message: string
  imageUrl?: string
  flyerUrl?: string
  flyerSlug?: string
}

export default function PhonePreview({ message, imageUrl, flyerUrl, flyerSlug }: Props) {
  const now = new Date()
  const time = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="flex flex-col items-center">
      {/* Phone shell */}
      <div className="relative w-[260px] h-[520px] bg-[#0d0d0d] rounded-[40px] border-4 border-[#353534] shadow-2xl overflow-hidden flex flex-col">
        {/* Status bar */}
        <div className="bg-[#0d0d0d] flex items-center justify-between px-6 pt-3 pb-1.5 flex-shrink-0">
          <span className="text-white text-[10px] font-medium">{time}</span>
          <div className="w-16 h-4 bg-[#1c1b1b] rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-2" />
          <div className="flex items-center gap-0.5">
            <div className="w-3 h-3 relative">
              <svg viewBox="0 0 24 24" fill="white" className="w-3 h-3 opacity-80">
                <path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.56 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" />
              </svg>
            </div>
          </div>
        </div>

        {/* WhatsApp header */}
        <div className="bg-[#1f2c34] px-4 py-2.5 flex items-center gap-3 flex-shrink-0">
          <div className="w-7 h-7 rounded-full bg-[#25D366]/30 flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4 opacity-60">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
            </svg>
          </div>
          <div>
            <p className="text-white text-xs font-semibold leading-none">Sua empresa</p>
            <p className="text-[#8696a0] text-[9px] mt-0.5">online</p>
          </div>
        </div>

        {/* Chat area */}
        <div
          className="flex-1 overflow-y-auto px-3 py-3 space-y-1"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #ffffff08 1px, transparent 0)',
            backgroundSize: '20px 20px',
            backgroundColor: '#0b141a',
          }}
        >
          {/* Message bubble */}
          <div className="flex justify-end">
            <div className="bg-[#005c4b] rounded-tl-xl rounded-tr-sm rounded-bl-xl rounded-br-xl max-w-[85%] overflow-hidden shadow-sm">
              {/* Image */}
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="Produto"
                  className="w-full object-cover max-h-32"
                />
              )}

              {/* Flyer placeholder */}
              {!imageUrl && flyerUrl && (
                <div className="w-full h-24 bg-[#004035] flex flex-col items-center justify-center px-3">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth={1.5} className="w-6 h-6 mb-1">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18M9 21V9" />
                  </svg>
                  <span className="text-[#25D366] text-[9px]">Folheto promocional</span>
                </div>
              )}

              <div className="px-2.5 py-1.5">
                {message ? (
                  <p className="text-white text-[11px] leading-relaxed whitespace-pre-wrap break-words">
                    {message}
                  </p>
                ) : (
                  <p className="text-[#8696a0] text-[11px] italic">Digite uma mensagem...</p>
                )}

                {/* Flyer link */}
                {flyerUrl && (
                  <div className="mt-1.5 bg-[#004035] rounded-lg px-2 py-1.5">
                    <p className="text-[#4FF07F] text-[9px] font-medium truncate">
                      {flyerSlug ? `zapzap.app/f/${flyerSlug}` : 'link do folheto'}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-end gap-1 mt-0.5">
                  <span className="text-[#8696a0] text-[9px]">{time}</span>
                  <svg viewBox="0 0 24 24" fill="#53bdeb" className="w-3 h-3">
                    <path d="M1 12l5 5L18 4M7 12l5 5L22 4" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Input bar */}
        <div className="bg-[#1f2c34] px-2 py-2 flex items-center gap-2 flex-shrink-0">
          <div className="flex-1 bg-[#2a3942] rounded-full px-3 py-1.5">
            <span className="text-[#8696a0] text-[9px]">Mensagem</span>
          </div>
          <div className="w-7 h-7 rounded-full bg-[#25D366] flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="white" className="w-3.5 h-3.5">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </div>
        </div>
      </div>

      <p className="text-xs text-[#3c4a3d] mt-3">Prévia da mensagem</p>
    </div>
  )
}
