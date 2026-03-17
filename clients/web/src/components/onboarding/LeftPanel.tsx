export default function LeftPanel() {
  return (
    <div className="relative w-[500px] h-[982px] border border-[#000000] bg-[#ffffff] shrink-0">
      {/* SelfServe wordmark */}
      <div className="absolute" style={{ width: '96px', height: '32px', top: '767.5px', left: '49px' }}>
        <span style={{
          fontFamily: 'Satoshi Variable, sans-serif',
          fontWeight: 700,
          fontSize: '24px',
          lineHeight: '32px',
          letterSpacing: '-1.13px',
          color: '#000000',
        }}>
          SelfServe
        </span>
      </div>
      {/* Lorem ipsum text */}
      <div className="absolute" style={{ width: '394px', height: '98px', top: '823.5px', left: '49px' }}>
        <p style={{
          fontFamily: 'Satoshi Variable, sans-serif',
          fontWeight: 500,
          fontStyle: 'italic',
          fontSize: '20px',
          lineHeight: '32.5px',
        }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec risus nunc, ullamcorper vitae risus vel, tristique vehicula lectus.
        </p>
      </div>
    </div>
  )
}