"use client"

import { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Mic, MicOff } from 'lucide-react'

export function SmallNeubrutalistMicrophone() {
  const [isRecording, setIsRecording] = useState(false)
  const [isHandsFree, setIsHandsFree] = useState(false)
  const [isPushing, setIsPushing] = useState(false)
  const [filePath, setFilePath] = useState<string | null>(null)
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const audioChunks = useRef<Blob[]>([])

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorder.current = new MediaRecorder(stream)
      
      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data)
      }

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' })
        const audioUrl = URL.createObjectURL(audioBlob)
        setFilePath(audioUrl)
        audioChunks.current = []
      }

      mediaRecorder.current.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error accessing microphone:', error)
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.stop()
      setIsRecording(false)
    }
  }, [])

  const handleRecordingToggle = () => {
    if (isHandsFree) {
      if (isRecording) {
        stopRecording()
      } else {
        startRecording()
      }
    }
  }

  const handleMouseDown = () => {
    setIsPushing(true)
    if (!isHandsFree) {
      startRecording()
    }
  }

  const handleMouseUp = () => {
    setIsPushing(false)
    if (!isHandsFree) {
      stopRecording()
    }
  }

  const handleHandsFreeToggle = (checked: boolean) => {
    setIsHandsFree(checked)
    if (!checked && isRecording) {
      stopRecording()
    }
  }

  useEffect(() => {
    const handleMouseUpGlobal = () => {
      if (isPushing && !isHandsFree) {
        setIsPushing(false)
        stopRecording()
      }
    }

    document.addEventListener('mouseup', handleMouseUpGlobal)
    return () => {
      document.removeEventListener('mouseup', handleMouseUpGlobal)
    }
  }, [isPushing, isHandsFree, stopRecording])

  return (
    <div className="flex flex-col items-start space-y-4 p-4 bg-white">
      <div className="flex items-center space-x-4">
        <Button
          className={`h-10 w-10 p-0 rounded-md transition-all duration-200 ease-in-out 
                      ${isRecording ? 'bg-black text-white' : 'bg-white text-black'} 
                      border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                      ${isPushing ? 'translate-x-1 translate-y-1 shadow-[0px_0px_0px_0px_rgba(0,0,0,1)]' : ''}
                      hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
                      active:translate-x-1 active:translate-y-1 active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)]`}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onClick={handleRecordingToggle}
          aria-label={isRecording ? "Stop Recording" : "Start Recording"}
        >
          {isRecording ? (
            <MicOff className={`w-5 h-5 ${isPushing ? 'animate-pulse' : ''}`} />
          ) : (
            <Mic className={`w-5 h-5 ${isPushing ? 'animate-pulse' : ''}`} />
          )}
        </Button>
        <div className="flex items-center space-x-2 text-black">
          <Switch
            id="hands-free-mode"
            checked={isHandsFree}
            onCheckedChange={handleHandsFreeToggle}
            className="data-[state=checked]:bg-black"
          />
          <Label htmlFor="hands-free-mode" className="text-sm">Hands-free</Label>
        </div>
      </div>
      {filePath && (
        <div className="w-full mt-2 p-2 bg-gray-100 border-2 border-black rounded-md">
          <p className="text-black text-xs break-all">Recording: {filePath}</p>
        </div>
      )}
    </div>
  )
}