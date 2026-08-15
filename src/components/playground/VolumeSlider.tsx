import { useState, type CSSProperties } from 'react'

const DEFAULT_VOLUME = 50

const containerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
}

const labelStyle: CSSProperties = {
  fontSize: '0.9rem',
  color: '#374151',
  maxWidth: '4ch',
  textAlign: 'left',
}

const valueStyle: CSSProperties = {
  fontSize: '0.9rem',
  fontVariantNumeric: 'tabular-nums',
  color: '#111827',
  paddingRight: '5.5rem',
}

const sliderContainerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '0.5rem',
  marginRight: '-3.5rem',
}

const inputStyle: CSSProperties = {
  width: '170px',
  accentColor: '#2563eb',
  flex: 1,
  paddingRight: '0.5rem',
}

const resetButtonStyle = (isHovered: boolean, disabled: boolean): CSSProperties => ({
  font: 'inherit',
  fontSize: '0.85rem',
  marginTop: '2.35rem',
  padding: '0.35rem 0.65rem',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  background: isHovered && !disabled ? '#f9fafb' : '#fff',
  cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.5 : 1,
})

export default function VolumeSlider() {
  const [volume, setVolume] = useState(DEFAULT_VOLUME)
  const [isResetHovered, setIsResetHovered] = useState(false)
  const isAtDefault = volume === DEFAULT_VOLUME

  return (
    <div style={containerStyle}>
      <label style={labelStyle} htmlFor="volume-slider">
        Volume
      </label>
  
      <div style={sliderContainerStyle}>
        <input
          id="volume-slider"
          type="range"
          min={0}
          max={100}
          step={1}
          value={volume}
          style={inputStyle}
          data-testid="volume-slider"
          onChange={(e) => setVolume(Number(e.target.value))}
        />
  
        <button
          type="button"
          style={resetButtonStyle(isResetHovered, isAtDefault)}
          data-testid="volume-reset"
          onClick={() => setVolume(DEFAULT_VOLUME)}
          onMouseEnter={() => setIsResetHovered(true)}
          onMouseLeave={() => setIsResetHovered(false)}
          disabled={isAtDefault}
        >
          Reset
        </button>
      </div>
  
      <span style={valueStyle} data-testid="volume-value">
        {volume}%
      </span>
    </div>
  )
}
