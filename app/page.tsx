'use client'

import Image from 'next/image';
import './globals.css';
import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, Upload, Download } from 'lucide-react'

export default function CompostApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [selectedReport, setSelectedReport] = useState('')
  const [photo, setPhoto] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent))
  }, [])

  const handleLogin = () => {
    setIsLoggedIn(true)
  }

  const handlePhotoCapture = () => {
    if (isMobile && cameraInputRef.current) {
      cameraInputRef.current.click()
    } else {
      // Aquí iría la lógica para abrir la cámara web en desktop
      console.log("Abriendo cámara web en desktop")
    }
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhoto(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleConfirm = async () => {
    console.log('Confirming photo:', photo)
    // Aquí puedes agregar la lógica para enviar la foto al servidor o procesarla
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader className="flex flex-col items-center space-y-4">
          <CardTitle className="text-2xl font-bold text-center">Aplicación de Compost</CardTitle>
          {!isLoggedIn && (
            <Button onClick={handleLogin} className="w-full sm:w-auto">
              Ingresar
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoggedIn && (
            <>
              <div className="flex space-x-2">
                <Select value={selectedReport} onValueChange={setSelectedReport}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Seleccionar informe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ultimo">Último informe</SelectItem>
                    <SelectItem value="2">Informe 2</SelectItem>
                    <SelectItem value="3">Informe 3</SelectItem>
                    <SelectItem value="custom">Escoger fecha</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => {/* Lógica para descargar informe */}}>
                  <Download className="mr-2 h-4 w-4" /> Descargar Informe
                </Button>
              </div>

              <div className="flex justify-center space-x-4">
                <Button onClick={handlePhotoCapture}>
                  <Camera className="mr-2 h-4 w-4" /> Tomar Foto
                </Button>
                <Button onClick={() => fileInputRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" /> Subir Foto
                </Button>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  ref={fileInputRef}
                />
                <Input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  ref={cameraInputRef}
                />
              </div>

              {photo && (
                <div className="mt-4 space-y-4">
                  <div className="relative w-64 h-64 mx-auto bg-gray-100 rounded-lg overflow-hidden">
                    <Image 
                      src={photo} 
                      alt="Foto seleccionada" 
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                  <Button onClick={handleConfirm} className="w-full">Confirmar</Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}