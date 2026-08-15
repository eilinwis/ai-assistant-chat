import { useRef, useState } from 'react'
import heroPoster from '../../assets/hero.png'

const SAMPLE_VIDEO_SRC =
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm'

export default function VideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)

  function togglePlay() {
    const video = videoRef.current
    if (!video) return
    if (isPlaying) {
      video.pause()
      setIsPlaying(false)
    } else {
      void video.play().catch(() => undefined)
      setIsPlaying(true)
    }
  }

  function toggleMute() {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setIsMuted(video.muted)
  }

  return (
    <div className="widget-video">
      <video
        ref={videoRef}
        className="widget-video__player"
        data-testid="video-player"
        poster={heroPoster}
        muted={isMuted}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onEnded={() => setIsPlaying(false)}
      >
        <source src={SAMPLE_VIDEO_SRC} type="video/webm" />
      </video>
      <div className="widget-video__controls">
        <button
          type="button"
          className="widget-video__play"
          data-testid="video-play-button"
          aria-pressed={isPlaying}
          onClick={togglePlay}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button
          type="button"
          className="widget-video__mute"
          data-testid="video-mute-button"
          aria-pressed={isMuted}
          onClick={toggleMute}
        >
          {isMuted ? 'Unmute' : 'Mute'}
        </button>
        <span className="widget-video__time" data-testid="video-time">
          {currentTime.toFixed(1)}s
        </span>
      </div>
    </div>
  )
}
