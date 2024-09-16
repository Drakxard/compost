'use client'

import React, { useRef, useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"

export default function CameraCapture() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const photoRef = useRef<HTMLImageElement>(null)
  const [streaming, setStreaming] = useState(false)
  const [width] = useState(320)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then((stream) => {
        video.srcObject = stream
        video.play()
      })
      .catch((err) => {
        console.log("Ocurrió un error: " + err)
      })

    video.addEventListener('canplay', (ev) => {
      if (!streaming) {
        setHeight(video.videoHeight / (video.videoWidth / width))
        
        if (video) {
          video.setAttribute('width', width.toString())
          video.setAttribute('height', height.toString())
        }
        if (canvasRef.current) {
          canvasRef.current.setAttribute('width', width.toString())
          canvasRef.current.setAttribute('height', height.toString())
        }
        setStreaming(true)
      }
    }, false)
  }, [width, height, streaming])

  const takePicture = () => {
    const canvas = canvasRef.current
    const video = videoRef.current
    const photo = photoRef.current
    if (canvas && video && photo) {
      const context = canvas.getContext('2d')
      if (context) {
        canvas.width = width
        canvas.height = height
        context.drawImage(video, 0, 0, width, height)
        const data = canvas.toDataURL('image/png')
        photo.setAttribute('src', data)
      }
    }
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <video ref={videoRef} className="border border-gray-300 rounded-lg">Video stream not available.</video>
      <Button onClick={takePicture}>Tomar Foto</Button>
      <canvas ref={canvasRef} className="hidden"></canvas>
      <div className="mt-4">
        <img ref={photoRef} alt="La captura aparecerá en este cuadro." className="border border-gray-300 rounded-lg" />
      </div>
    </div>
  )
}