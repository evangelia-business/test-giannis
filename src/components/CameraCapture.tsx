'use client'

import { useRef, useState, useCallback } from 'react'

interface CameraCaptureProps {
  onCapture: (dataUrl: string, file: File) => void
}

export default function CameraCapture({ onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')

  const startCamera = useCallback(async (facing: 'user' | 'environment' = facingMode) => {
    try {
      if (stream) {
        stream.getTracks().forEach(t => t.stop())
      }
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 960 } },
      })
      setStream(s)
      setError(null)
      setPreview(null)
      if (videoRef.current) {
        videoRef.current.srcObject = s
      }
    } catch {
      setError('Camera access denied. Please allow camera access and try again.')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop())
      setStream(null)
    }
  }, [stream])

  const takePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
    setPreview(dataUrl)
    stopCamera()

    // Convert to File
    canvas.toBlob(blob => {
      if (!blob) return
      const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' })
      onCapture(dataUrl, file)
    }, 'image/jpeg', 0.85)
  }, [stopCamera, onCapture])

  const retake = useCallback(() => {
    setPreview(null)
    startCamera(facingMode)
  }, [startCamera, facingMode])

  const flipCamera = useCallback(() => {
    const next = facingMode === 'environment' ? 'user' : 'environment'
    setFacingMode(next)
    startCamera(next)
  }, [facingMode, startCamera])

  // File upload fallback
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreview(url)
    stopCamera()
    onCapture(url, file)
  }, [stopCamera, onCapture])

  return (
    <div className="space-y-3">
      {/* Preview */}
      {preview ? (
        <div className="relative rounded-xl overflow-hidden bg-black aspect-[4/3]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Captured photo" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={retake}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/90 text-stone-900 text-sm font-medium px-4 py-1.5 rounded-full shadow hover:bg-white transition"
          >
            Retake
          </button>
        </div>
      ) : stream ? (
        <div className="relative rounded-xl overflow-hidden bg-black aspect-[4/3]">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-3 inset-x-3 flex items-center justify-between">
            <button
              type="button"
              onClick={flipCamera}
              className="bg-white/80 rounded-full p-2 hover:bg-white transition"
              aria-label="Flip camera"
            >
              🔄
            </button>
            <button
              type="button"
              onClick={takePhoto}
              className="bg-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition border-4 border-stone-200"
              aria-label="Take photo"
            >
              <span className="w-10 h-10 bg-stone-900 rounded-full block" />
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="bg-white/80 rounded-full p-2 hover:bg-white transition text-sm"
              aria-label="Close camera"
            >
              ✕
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-stone-200 aspect-[4/3] flex flex-col items-center justify-center gap-3 bg-stone-50">
          <span className="text-4xl">📷</span>
          <p className="text-sm text-stone-400">No photo taken yet</p>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      {!stream && !preview && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => startCamera(facingMode)}
            className="flex-1 rounded-lg bg-stone-900 text-white py-2 text-sm font-medium hover:bg-stone-700 active:scale-95 transition"
          >
            Open Camera
          </button>
          <label className="flex-1 rounded-lg border border-stone-200 bg-white text-stone-700 py-2 text-sm font-medium text-center cursor-pointer hover:bg-stone-50 active:scale-95 transition">
            Upload Photo
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
