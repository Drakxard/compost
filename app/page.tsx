'use client'

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Camera, Upload, Download } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


type GPIOPin = {
  pin: string
  description: string
  state: boolean
}

type DeviceProps = {
  name: string
  gpios: GPIOPin[]
}

const Device: React.FC<DeviceProps> = ({ name, gpios }) => {
  const [pins, setPins] = useState(gpios)

  const handleToggle = (index: number) => {
    setPins(prevPins => 
      prevPins.map((pin, i) => 
        i === index ? { ...pin, state: !pin.state } : pin
      )
    )
    // Aquí iría la lógica para enviar el comando al dispositivo físico
    console.log(`Toggled ${name} pin ${pins[index].pin} to ${!pins[index].state}`)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>Control de GPIO</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pins.map((pin, index) => (
            <div key={pin.pin} className="flex items-center justify-between space-x-2">
              <Label htmlFor={`${name}-${pin.pin}`} className="flex flex-col">
                <span className="font-medium">{pin.pin}</span>
                <span className="text-sm text-muted-foreground">{pin.description}</span>
              </Label>
              <Switch
                id={`${name}-${pin.pin}`}
                checked={pin.state}
                onCheckedChange={() => handleToggle(index)}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function CompostControlPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [selectedReport, setSelectedReport] = useState('')
  const [photo, setPhoto] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [activeTab, setActiveTab] = useState("orangepi")

  const [orangePiGPIOs, setOrangePiGPIOs] = useState<GPIOPin[]>([
    { pin: "GPIO 229 (wPi 0)", description: "SDA.3", state: false },
    { pin: "GPIO 228 (wPi 1)", description: "SCL.3", state: false },
    { pin: "GPIO 73 (wPi 2)", description: "PC9", state: false },
    { pin: "GPIO 226 (wPi 3)", description: "TXD.5", state: false },
    { pin: "GPIO 227 (wPi 4)", description: "RXD.5", state: false },
    { pin: "GPIO 70 (wPi 5)", description: "PC6", state: false },
    { pin: "GPIO 75 (wPi 6)", description: "PC11", state: false },
    { pin: "GPIO 69 (wPi 7)", description: "PC5", state: false },
    { pin: "GPIO 72 (wPi 8)", description: "PC8", state: false },
    { pin: "GPIO 79 (wPi 9)", description: "PC15", state: false },
    { pin: "GPIO 78 (wPi 10)", description: "PC14", state: false },
    { pin: "GPIO 231 (wPi 11)", description: "MOSI.1", state: false },
    { pin: "GPIO 232 (wPi 12)", description: "MISO.1", state: false },
    { pin: "GPIO 230 (wPi 14)", description: "SCLK.1", state: false },
    { pin: "GPIO 233 (wPi 15)", description: "CE.1", state: false },
    { pin: "GPIO 65 (wPi 17)", description: "PC1", state: false },
    { pin: "GPIO 272 (wPi 18)", description: "PI16", state: false },
    { pin: "GPIO 262 (wPi 19)", description: "PI6", state: false },
    { pin: "GPIO 234 (wPi 20)", description: "PH10", state: false },
  ])

  const [arduinoGPIOs, setArduinoGPIOs] = useState<GPIOPin[]>([
    { pin: "D0 (RX)", description: "Comunicación serie (recepción)", state: false },
    { pin: "D1 (TX)", description: "Comunicación serie (transmisión)", state: false },
    { pin: "D2", description: "Digital I/O", state: false },
    { pin: "D3 (PWM)", description: "Digital I/O, PWM", state: false },
    { pin: "D4", description: "Digital I/O", state: false },
    { pin: "D5 (PWM)", description: "Digital I/O, PWM", state: false },
    { pin: "D6 (PWM)", description: "Digital I/O, PWM", state: false },
    { pin: "D7", description: "Digital I/O", state: false },
    { pin: "D8", description: "Digital I/O", state: false },
    { pin: "D9 (PWM)", description: "Digital I/O, PWM", state: false },
    { pin: "D10 (PWM, SS)", description: "Digital I/O, PWM, SPI SS", state: false },
    { pin: "D11 (PWM, MOSI)", description: "Digital I/O, PWM, SPI MOSI", state: false },
    { pin: "D12 (MISO)", description: "Digital I/O, SPI MISO", state: false },
    { pin: "D13 (SCK)", description: "Digital I/O, SPI SCK", state: false },
    { pin: "A0", description: "Analog Input", state: false },
    { pin: "A1", description: "Analog Input", state: false },
    { pin: "A2", description: "Analog Input", state: false },
    { pin: "A3", description: "Analog Input", state: false },
    { pin: "A4 (SDA)", description: "Analog Input, I2C SDA", state: false },
    { pin: "A5 (SCL)", description: "Analog Input, I2C SCL", state: false },
  ])

  const [esp8266GPIOs, setEsp8266GPIOs] = useState<GPIOPin[]>([
    { pin: "GPIO 0", description: "Salida controlada", state: false },
    { pin: "GPIO 1 (TX)", description: "Transmisión serie", state: false },
    { pin: "GPIO 2", description: "Entrada/Salida", state: false },
    { pin: "GPIO 4", description: "Control digital, I2C SDA", state: false },
    { pin: "GPIO 5", description: "Control digital, I2C SCL", state: false },
    { pin: "GPIO 12", description: "GPIO multifuncional, SPI MISO", state: false },
    { pin: "GPIO 13", description: "GPIO multifuncional, SPI MOSI", state: false },
    { pin: "GPIO 14", description: "GPIO multifuncional, SPI CLK", state: false },
    { pin: "GPIO 15", description: "GPIO multifuncional, SPI CS", state: false },
    { pin: "GPIO 16", description: "Despertar del modo suspensión", state: false },
  ])

  const [sensorData, setSensorData] = useState([
    { timestamp: 1678886400000, temperatura: 25, humedad: 60 },
    { timestamp: 1678890000000, temperatura: 26, humedad: 62 },
    { timestamp: 1678893600000, temperatura: 24, humedad: 58 },
    // ... more sensor data
  ]);


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
      console.log("Opening webcam on desktop")
    }
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result
        if (typeof result === 'string') {
          setPhoto(result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleConfirm = async () => {
    if (!photo) return

    try {
      const base64Image = photo.split(',')[1] // Remove the data:image/jpeg;base64, part

      const response = await fetch('/api/process-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x_api_key': 'API-PRIVADA-CLIENTE', // Se debe generar clase cliente
        },
        body: JSON.stringify({
          base64Image,
          prompt: "Analyze the image and choose how to justify it according to the image provided: Initial mesophilic phase Color: Mix of light brown and green. Texture: Large and visible fragments, such as leaves or food remains. Humidity: Humid material, without signs of advanced decomposition. Thermophilic phase Color: Dark brown. Texture: More uniform material but with some visible fragments such as wood or shells. Other signs: There may be visible steam or signs of heat. Cooling phase Color: Dark brown. Texture: Looser and grainier, some small fragments may be present. Condition: No signs of heat.Maturation Phase Color: Dark brown or black.Texture: Very loose and grainy, without visible fragments.Condition: Fully stabilized material.",
        }),
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const result = await response.json()
      setAnalysisResult(result.data)
    } catch (error) {
      console.error('Error:', error)
      setAnalysisResult('Error processing image')
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Panel de Control de Compost Autónomo</h1>
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

              {analysisResult && (
                <div className="mt-4 p-4 bg-black text-white rounded-lg">
                  <h3 className="font-bold mb-2">Resultado del análisis:</h3>
                  <p>{analysisResult}</p>
                </div>
              )}

   <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="orangepi">Orange Pi</TabsTrigger>
            <TabsTrigger value="arduino">Arduino</TabsTrigger>
            <TabsTrigger value="esp8266">ESP8266</TabsTrigger>
            <TabsTrigger value="sensordata">Datos Sensor</TabsTrigger>
          </TabsList>
          <TabsContent value="orangepi">
            <Device name="Orange Pi Zero 2" gpios={orangePiGPIOs} />
          </TabsContent>
          <TabsContent value="arduino">
            <Device name="Arduino UNO R3" gpios={arduinoGPIOs} />
          </TabsContent>
          <TabsContent value="esp8266">
            <Device name="ESP8266" gpios={esp8266GPIOs} />
          </TabsContent>
          <TabsContent value="sensordata">
            <Card>
              <CardHeader>
                <CardTitle>Datos del Sensor</CardTitle>
                <CardDescription>Lecturas de Temperatura y Humedad</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sensorData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="timestamp" reversed
                        tickFormatter={(timestamp) => {
                          const date = new Date(timestamp);
                          return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
                        }}
                      />
                      <YAxis 
                        yAxisId="left"
                        label={{ value: 'Temperatura (°C)', angle: -90, position: 'insideLeft' }}
                      />
                      <YAxis 
                        yAxisId="right" 
                        orientation="right"
                        label={{ value: 'Humedad (%)', angle: 90, position: 'insideRight' }}
                      />
                      <Tooltip 
                        labelFormatter={(timestamp) => new Date(timestamp).toLocaleString()}
                        formatter={(value, name) => [
                          `${value}${name === "temperatura" ? "°C" : "%"}`,
                          name === "temperatura" ? "Temperatura" : "Humedad"
                        ]}
                      />
                      <Legend />
                      <Line 
                        yAxisId="left" 
                        type="monotone" 
                        dataKey="temperatura" 
                        name="Temperatura"
                        stroke="#8884d8" 
                        activeDot={{ r: 8 }} 
                        dot={false}
                      />
                      <Line 
                        yAxisId="right" 
                        type="monotone" 
                        dataKey="humedad" 
                        name="Humedad"
                        stroke="#82ca9d" 
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}