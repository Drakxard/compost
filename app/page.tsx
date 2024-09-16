'use client'

import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Camera, Upload, Download } from 'lucide-react'

export default function CompostApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [selectedReport, setSelectedReport] = useState('')
  const [photo, setPhoto] = useState<string | null>(null)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleLogin = () => {
    setIsLoggedIn(true)
  }

  const handlePhotoCapture = () => {
    setIsCameraOpen(true)
  }

  const simulatePhotoCapture = () => {
    setPhoto('/placeholder.svg?height=300&width=300')
    setIsCameraOpen(false)
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setPhoto(URL.createObjectURL(file))
    }
  }

  const handleConfirm = async () => {
    console.log('Confirming photo:', photo)
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
                <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={handlePhotoCapture}>
                      <Camera className="mr-2 h-4 w-4" /> Tomar Foto
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Capturar Foto</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-64 h-64 bg-gray-200 flex items-center justify-center">
                        <Camera size={48} />
                      </div>
                      <Button onClick={simulatePhotoCapture}>Capturar</Button>
                    </div>
                  </DialogContent>
                </Dialog>
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
              </div>

              {photo && (
                <div className="mt-4 space-y-4">
                  <div className="relative w-64 h-64 mx-auto bg-gray-100 rounded-lg overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <img 
                        src={photo} 
                        alt="Foto seleccionada" 
                        className="w-full h-full object-cover"
                        style={{
                          objectPosition: 'center',
                          objectFit: 'cover',
                        }}
                      />
                    </div>
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