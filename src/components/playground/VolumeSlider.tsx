import { useState } from 'react'

const DEFAULT_VOLUME = 50

export default function VolumeSlider() {
  const [volume, setVolume] = useState(DEFAULT_VOLUME)

  return (
    <div className="widget-slider">
      <label className="widget-slider__label" htmlFor="volume-slider">
        Volume
      </label>
      <input
        id="volume-slider"
        type="range"
        min={0}
        max={100}
        step={1}
        value={volume}
        data-testid="volume-slider"
        onChange={(e) => setVolume(Number(e.target.value))}
      />
      <span className="widget-slider__value" data-testid="volume-value">
        {volume}%
      </span>
      <button
        type="button"
        className="widget-slider__reset"
        data-testid="volume-reset"
        onClick={() => setVolume(DEFAULT_VOLUME)}
        disabled={volume === DEFAULT_VOLUME}
      >
        Reset
      </button>
    </div>
  )
}
