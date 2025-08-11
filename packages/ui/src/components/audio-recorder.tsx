'use client';

import * as React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '../lib/utils';
import { Button } from './button';
import { Slider } from './slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Progress } from './progress';
import { Badge } from './badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { 
  Mic, 
  MicOff, 
  Pause, 
  Play, 
  Square, 
  Download, 
  Settings,
  Volume2,
  VolumeX,
  Clock,
  Waveform,
  Headphones,
  FileAudio,
  Trash2,
  Save,
  Upload,
  RefreshCw,
  Activity,
  Radio,
  Cpu,
  HardDrive
} from 'lucide-react';

// Types and Interfaces
export interface AudioRecorderProps {
  className?: string;
  maxDuration?: number; // in seconds
  sampleRate?: number;
  bitRate?: number;
  enableNoiseReduction?: boolean;
  enableEchoCancellation?: boolean;
  enableAutoGainControl?: boolean;
  exportFormats?: AudioFormat[];
  visualizationType?: 'waveform' | 'frequency' | 'both';
  onRecordingComplete?: (blob: Blob, metadata: RecordingMetadata) => void;
  onError?: (error: Error) => void;
  autoSave?: boolean;
  saveInterval?: number; // in seconds
  enableVoiceActivityDetection?: boolean;
  silenceThreshold?: number;
  silenceDuration?: number; // in milliseconds
  enableTranscription?: boolean;
  enableMetadata?: boolean;
  customStyles?: AudioRecorderStyles;
}

export type AudioFormat = 'wav' | 'mp3' | 'ogg' | 'webm' | 'flac';

export interface RecordingMetadata {
  duration: number;
  sampleRate: number;
  channels: number;
  format: AudioFormat;
  size: number;
  timestamp: Date;
  peaks?: number[];
  transcription?: string;
}

export interface AudioRecorderStyles {
  waveformColor?: string;
  backgroundColor?: string;
  progressColor?: string;
  peakColor?: string;
}

interface Recording {
  id: string;
  blob: Blob;
  url: string;
  metadata: RecordingMetadata;
  name: string;
  createdAt: Date;
}

// Audio Processor for advanced features
class AudioProcessor {
  private audioContext: AudioContext | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private analyser: AnalyserNode | null = null;
  private gainNode: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private filter: BiquadFilterNode | null = null;
  
  constructor() {
    if (typeof window !== 'undefined' && window.AudioContext) {
      this.audioContext = new AudioContext();
    }
  }
  
  async initialize(stream: MediaStream): Promise<void> {
    if (!this.audioContext) throw new Error('AudioContext not available');
    
    this.source = this.audioContext.createMediaStreamSource(stream);
    this.analyser = this.audioContext.createAnalyser();
    this.gainNode = this.audioContext.createGain();
    this.compressor = this.audioContext.createDynamicsCompressor();
    this.filter = this.audioContext.createBiquadFilter();
    
    // Configure nodes
    this.analyser.fftSize = 2048;
    this.filter.type = 'highpass';
    this.filter.frequency.value = 80; // Remove low frequency noise
    
    // Connect nodes
    this.source
      .connect(this.filter)
      .connect(this.compressor)
      .connect(this.gainNode)
      .connect(this.analyser);
  }
  
  getFrequencyData(): Uint8Array {
    if (!this.analyser) return new Uint8Array(0);
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }
  
  getWaveformData(): Uint8Array {
    if (!this.analyser) return new Uint8Array(0);
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteTimeDomainData(dataArray);
    return dataArray;
  }
  
  setGain(value: number): void {
    if (this.gainNode) {
      this.gainNode.gain.value = value;
    }
  }
  
  detectSilence(threshold: number = 30): boolean {
    const data = this.getFrequencyData();
    const average = data.reduce((a, b) => a + b, 0) / data.length;
    return average < threshold;
  }
  
  cleanup(): void {
    if (this.source) this.source.disconnect();
    if (this.audioContext) this.audioContext.close();
  }
}

// Main Component
export const AudioRecorder = React.forwardRef<HTMLDivElement, AudioRecorderProps>(
  (
    {
      className,
      maxDuration = 600, // 10 minutes
      sampleRate = 44100,
      bitRate = 128000,
      enableNoiseReduction = true,
      enableEchoCancellation = true,
      enableAutoGainControl = true,
      exportFormats = ['wav', 'mp3', 'webm'],
      visualizationType = 'both',
      onRecordingComplete,
      onError,
      autoSave = false,
      saveInterval = 30,
      enableVoiceActivityDetection = false,
      silenceThreshold = 30,
      silenceDuration = 2000,
      enableTranscription = false,
      enableMetadata = true,
      customStyles = {},
      ...props
    },
    ref
  ) => {
    // State Management
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [duration, setDuration] = useState(0);
    const [recordings, setRecordings] = useState<Recording[]>([]);
    const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
    const [inputLevel, setInputLevel] = useState(0);
    const [selectedFormat, setSelectedFormat] = useState<AudioFormat>(exportFormats[0]);
    const [gain, setGain] = useState(1);
    const [isMonitoring, setIsMonitoring] = useState(false);
    const [deviceId, setDeviceId] = useState<string>('default');
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [visualizationData, setVisualizationData] = useState<number[]>([]);
    const [frequencyData, setFrequencyData] = useState<number[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    
    // Refs
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const frequencyCanvasRef = useRef<HTMLCanvasElement>(null);
    const audioProcessorRef = useRef<AudioProcessor | null>(null);
    const animationRef = useRef<number | null>(null);
    const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
    
    // Get available audio devices
    useEffect(() => {
      const getDevices = async () => {
        try {
          const deviceList = await navigator.mediaDevices.enumerateDevices();
          const audioInputs = deviceList.filter(device => device.kind === 'audioinput');
          setDevices(audioInputs);
        } catch (error) {
          console.error('Error getting devices:', error);
        }
      };
      
      getDevices();
      navigator.mediaDevices.addEventListener('devicechange', getDevices);
      
      return () => {
        navigator.mediaDevices.removeEventListener('devicechange', getDevices);
      };
    }, []);
    
    // Cleanup on unmount
    useEffect(() => {
      return () => {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        if (timerRef.current) clearInterval(timerRef.current);
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
        if (autoSaveIntervalRef.current) clearInterval(autoSaveIntervalRef.current);
        if (audioProcessorRef.current) audioProcessorRef.current.cleanup();
      };
    }, []);
    
    // Visualization Loop
    const startVisualization = useCallback(() => {
      if (!audioProcessorRef.current) return;
      
      const draw = () => {
        if (!isRecording || isPaused) {
          animationRef.current = null;
          return;
        }
        
        // Get waveform data
        const waveformData = audioProcessorRef.current!.getWaveformData();
        const normalizedData = Array.from(waveformData).map(value => value / 255);
        setVisualizationData(normalizedData);
        
        // Get frequency data
        const freqData = audioProcessorRef.current!.getFrequencyData();
        const normalizedFreq = Array.from(freqData).map(value => value / 255);
        setFrequencyData(normalizedFreq);
        
        // Calculate input level
        const average = normalizedData.reduce((a, b) => a + Math.abs(b - 0.5), 0) / normalizedData.length;
        setInputLevel(average * 200);
        
        // Voice Activity Detection
        if (enableVoiceActivityDetection) {
          const isSilent = audioProcessorRef.current!.detectSilence(silenceThreshold);
          
          if (isSilent && !silenceTimeoutRef.current) {
            silenceTimeoutRef.current = setTimeout(() => {
              handlePause();
              silenceTimeoutRef.current = null;
            }, silenceDuration);
          } else if (!isSilent && silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
            silenceTimeoutRef.current = null;
          }
        }
        
        animationRef.current = requestAnimationFrame(draw);
      };
      
      draw();
    }, [isRecording, isPaused, enableVoiceActivityDetection, silenceThreshold, silenceDuration]);
    
    // Draw waveform on canvas
    useEffect(() => {
      if (!canvasRef.current || visualizationData.length === 0) return;
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const width = canvas.width;
      const height = canvas.height;
      
      ctx.fillStyle = customStyles.backgroundColor || '#0f172a';
      ctx.fillRect(0, 0, width, height);
      
      ctx.lineWidth = 2;
      ctx.strokeStyle = customStyles.waveformColor || '#3b82f6';
      ctx.beginPath();
      
      const sliceWidth = width / visualizationData.length;
      let x = 0;
      
      for (let i = 0; i < visualizationData.length; i++) {
        const v = visualizationData[i];
        const y = v * height;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        
        x += sliceWidth;
      }
      
      ctx.stroke();
    }, [visualizationData, customStyles]);
    
    // Draw frequency spectrum
    useEffect(() => {
      if (!frequencyCanvasRef.current || frequencyData.length === 0) return;
      
      const canvas = frequencyCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const width = canvas.width;
      const height = canvas.height;
      
      ctx.fillStyle = customStyles.backgroundColor || '#0f172a';
      ctx.fillRect(0, 0, width, height);
      
      const barWidth = (width / frequencyData.length) * 2.5;
      let barHeight;
      let x = 0;
      
      for (let i = 0; i < frequencyData.length; i++) {
        barHeight = frequencyData[i] * height;
        
        const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
        gradient.addColorStop(0, '#3b82f6');
        gradient.addColorStop(0.5, '#8b5cf6');
        gradient.addColorStop(1, '#ec4899');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, height - barHeight, barWidth, barHeight);
        
        x += barWidth + 1;
      }
    }, [frequencyData, customStyles]);
    
    // Start Recording
    const handleStartRecording = async () => {
      try {
        setErrorMessage('');
        
        // Request permissions and get stream
        const constraints: MediaStreamConstraints = {
          audio: {
            deviceId: deviceId !== 'default' ? { exact: deviceId } : undefined,
            sampleRate,
            echoCancellation: enableEchoCancellation,
            noiseSuppression: enableNoiseReduction,
            autoGainControl: enableAutoGainControl,
            channelCount: 2,
          }
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;
        
        // Initialize audio processor
        audioProcessorRef.current = new AudioProcessor();
        await audioProcessorRef.current.initialize(stream);
        audioProcessorRef.current.setGain(gain);
        
        // Setup MediaRecorder
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm';
        
        const recorder = new MediaRecorder(stream, {
          mimeType,
          audioBitsPerSecond: bitRate,
        });
        
        mediaRecorderRef.current = recorder;
        chunksRef.current = [];
        
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunksRef.current.push(event.data);
          }
        };
        
        recorder.onstop = handleRecordingComplete;
        
        recorder.start(1000); // Collect data every second
        setIsRecording(true);
        setIsPaused(false);
        setDuration(0);
        
        // Start timer
        const startTime = Date.now();
        timerRef.current = setInterval(() => {
          const elapsed = Math.floor((Date.now() - startTime) / 1000);
          setDuration(elapsed);
          
          if (elapsed >= maxDuration) {
            handleStopRecording();
          }
        }, 100);
        
        // Start visualization
        startVisualization();
        
        // Auto-save if enabled
        if (autoSave) {
          autoSaveIntervalRef.current = setInterval(() => {
            handleAutoSave();
          }, saveInterval * 1000);
        }
        
      } catch (error) {
        console.error('Error starting recording:', error);
        setErrorMessage('Failed to start recording. Please check microphone permissions.');
        if (onError) onError(error as Error);
      }
    };
    
    // Pause Recording
    const handlePause = () => {
      if (mediaRecorderRef.current && isRecording && !isPaused) {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    };
    
    // Resume Recording
    const handleResume = () => {
      if (mediaRecorderRef.current && isRecording && isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
        
        const startTime = Date.now() - (duration * 1000);
        timerRef.current = setInterval(() => {
          const elapsed = Math.floor((Date.now() - startTime) / 1000);
          setDuration(elapsed);
          
          if (elapsed >= maxDuration) {
            handleStopRecording();
          }
        }, 100);
        
        startVisualization();
      }
    };
    
    // Stop Recording
    const handleStopRecording = () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        setIsPaused(false);
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        
        if (autoSaveIntervalRef.current) {
          clearInterval(autoSaveIntervalRef.current);
          autoSaveIntervalRef.current = null;
        }
        
        if (audioProcessorRef.current) {
          audioProcessorRef.current.cleanup();
          audioProcessorRef.current = null;
        }
      }
    };
    
    // Handle Recording Complete
    const handleRecordingComplete = () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      const url = URL.createObjectURL(blob);
      
      const metadata: RecordingMetadata = {
        duration,
        sampleRate,
        channels: 2,
        format: 'webm' as AudioFormat,
        size: blob.size,
        timestamp: new Date(),
        peaks: visualizationData,
      };
      
      const recording: Recording = {
        id: Date.now().toString(),
        blob,
        url,
        metadata,
        name: `Recording ${recordings.length + 1}`,
        createdAt: new Date(),
      };
      
      setRecordings(prev => [...prev, recording]);
      setSelectedRecording(recording);
      
      if (onRecordingComplete) {
        onRecordingComplete(blob, metadata);
      }
    };
    
    // Auto-save functionality
    const handleAutoSave = () => {
      if (chunksRef.current.length > 0) {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        
        // Save to localStorage or send to server
        console.log('Auto-saving recording...', blob.size, 'bytes');
      }
    };
    
    // Export Recording
    const handleExport = async (recording: Recording, format: AudioFormat) => {
      setIsProcessing(true);
      
      try {
        let exportBlob: Blob;
        
        if (format === 'wav') {
          exportBlob = await convertToWav(recording.blob);
        } else if (format === 'mp3') {
          // For MP3, you would need a library like lamejs
          // This is a placeholder
          exportBlob = recording.blob;
        } else {
          exportBlob = recording.blob;
        }
        
        const url = URL.createObjectURL(exportBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${recording.name}.${format}`;
        a.click();
        URL.revokeObjectURL(url);
        
      } catch (error) {
        console.error('Export error:', error);
        setErrorMessage('Failed to export recording');
      } finally {
        setIsProcessing(false);
      }
    };
    
    // Convert to WAV format
    const convertToWav = async (blob: Blob): Promise<Blob> => {
      // This is a simplified WAV conversion
      // In production, you'd use a proper audio processing library
      const audioContext = new AudioContext();
      const arrayBuffer = await blob.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      const length = audioBuffer.length * audioBuffer.numberOfChannels * 2;
      const buffer = new ArrayBuffer(44 + length);
      const view = new DataView(buffer);
      
      // WAV header
      const writeString = (offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      };
      
      writeString(0, 'RIFF');
      view.setUint32(4, 36 + length, true);
      writeString(8, 'WAVE');
      writeString(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, audioBuffer.numberOfChannels, true);
      view.setUint32(24, audioBuffer.sampleRate, true);
      view.setUint32(28, audioBuffer.sampleRate * 4, true);
      view.setUint16(32, 4, true);
      view.setUint16(34, 16, true);
      writeString(36, 'data');
      view.setUint32(40, length, true);
      
      // Write audio data
      let offset = 44;
      for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
        const channelData = audioBuffer.getChannelData(i);
        for (let j = 0; j < channelData.length; j++) {
          const sample = Math.max(-1, Math.min(1, channelData[j]));
          view.setInt16(offset, sample * 0x7FFF, true);
          offset += 2;
        }
      }
      
      return new Blob([buffer], { type: 'audio/wav' });
    };
    
    // Delete Recording
    const handleDeleteRecording = (id: string) => {
      setRecordings(prev => prev.filter(r => r.id !== id));
      if (selectedRecording?.id === id) {
        setSelectedRecording(null);
      }
    };
    
    // Format duration display
    const formatDuration = (seconds: number): string => {
      const hrs = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      
      if (hrs > 0) {
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      }
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    
    // Format file size
    const formatFileSize = (bytes: number): string => {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };
    
    return (
      <div
        ref={ref}
        className={cn('w-full space-y-4', className)}
        {...props}
      >
        {/* Main Recorder Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Radio className="h-5 w-5" />
                Audio Recorder
              </span>
              {isRecording && (
                <Badge variant={isPaused ? 'secondary' : 'destructive'} className="animate-pulse">
                  {isPaused ? 'PAUSED' : 'RECORDING'}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Device Selection */}
            <div className="flex items-center gap-4">
              <Select value={deviceId} onValueChange={setDeviceId} disabled={isRecording}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select microphone" />
                </SelectTrigger>
                <SelectContent>
                  {devices.map(device => (
                    <SelectItem key={device.deviceId} value={device.deviceId}>
                      {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                <Slider
                  value={[gain * 100]}
                  onValueChange={([value]) => {
                    const newGain = value / 100;
                    setGain(newGain);
                    if (audioProcessorRef.current) {
                      audioProcessorRef.current.setGain(newGain);
                    }
                  }}
                  max={200}
                  step={10}
                  className="w-[100px]"
                  disabled={!isRecording}
                />
                <span className="text-sm w-12">{Math.round(gain * 100)}%</span>
              </div>
              
              <Button
                variant={isMonitoring ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIsMonitoring(!isMonitoring)}
                disabled={!isRecording}
              >
                <Headphones className="h-4 w-4 mr-1" />
                Monitor
              </Button>
            </div>
            
            {/* Visualization */}
            <Tabs defaultValue="waveform" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="waveform">Waveform</TabsTrigger>
                <TabsTrigger value="frequency">Frequency</TabsTrigger>
                <TabsTrigger value="meters">Meters</TabsTrigger>
              </TabsList>
              
              <TabsContent value="waveform" className="space-y-2">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={200}
                  className="w-full h-32 bg-slate-900 rounded-lg"
                />
              </TabsContent>
              
              <TabsContent value="frequency" className="space-y-2">
                <canvas
                  ref={frequencyCanvasRef}
                  width={800}
                  height={200}
                  className="w-full h-32 bg-slate-900 rounded-lg"
                />
              </TabsContent>
              
              <TabsContent value="meters" className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Input Level</span>
                    <span>{Math.round(inputLevel)}%</span>
                  </div>
                  <Progress value={inputLevel} className="h-2" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Sample Rate</p>
                    <p className="font-mono">{sampleRate} Hz</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Bit Rate</p>
                    <p className="font-mono">{bitRate / 1000} kbps</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Channels</p>
                    <p className="font-mono">Stereo (2)</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Format</p>
                    <p className="font-mono">WebM Opus</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            {/* Duration and Controls */}
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="text-4xl font-mono font-bold">
                  {formatDuration(duration)}
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-2">
                {!isRecording ? (
                  <Button
                    size="lg"
                    variant="destructive"
                    onClick={handleStartRecording}
                    className="px-8"
                  >
                    <Mic className="h-5 w-5 mr-2" />
                    Start Recording
                  </Button>
                ) : (
                  <>
                    {isPaused ? (
                      <Button
                        size="lg"
                        variant="default"
                        onClick={handleResume}
                      >
                        <Play className="h-5 w-5 mr-2" />
                        Resume
                      </Button>
                    ) : (
                      <Button
                        size="lg"
                        variant="secondary"
                        onClick={handlePause}
                      >
                        <Pause className="h-5 w-5 mr-2" />
                        Pause
                      </Button>
                    )}
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={handleStopRecording}
                    >
                      <Square className="h-5 w-5 mr-2" />
                      Stop
                    </Button>
                  </>
                )}
              </div>
              
              {maxDuration && (
                <div className="space-y-1">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Recording Progress</span>
                    <span>{formatDuration(maxDuration - duration)} remaining</span>
                  </div>
                  <Progress value={(duration / maxDuration) * 100} className="h-1" />
                </div>
              )}
            </div>
            
            {/* Settings */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Audio Processing
                </h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={enableNoiseReduction}
                    className="rounded"
                    disabled
                  />
                  <span className="text-sm">Noise Reduction</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={enableEchoCancellation}
                    className="rounded"
                    disabled
                  />
                  <span className="text-sm">Echo Cancellation</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={enableAutoGainControl}
                    className="rounded"
                    disabled
                  />
                  <span className="text-sm">Auto Gain Control</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={enableVoiceActivityDetection}
                    className="rounded"
                    disabled
                  />
                  <span className="text-sm">Voice Activity Detection</span>
                </label>
              </div>
            </div>
            
            {/* Error Message */}
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
                {errorMessage}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Recordings List */}
        {recordings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileAudio className="h-5 w-5" />
                Recordings ({recordings.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {recordings.map(recording => (
                <div
                  key={recording.id}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer',
                    selectedRecording?.id === recording.id
                      ? 'bg-primary/10 border-primary'
                      : 'hover:bg-muted'
                  )}
                  onClick={() => setSelectedRecording(recording)}
                >
                  <div className="flex items-center gap-3">
                    <FileAudio className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{recording.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDuration(recording.metadata.duration)} • {formatFileSize(recording.metadata.size)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <audio
                      src={recording.url}
                      controls
                      className="h-8"
                      onClick={(e) => e.stopPropagation()}
                    />
                    
                    <Select
                      value={selectedFormat}
                      onValueChange={setSelectedFormat}
                      onClick={(e: any) => e.stopPropagation()}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {exportFormats.map(format => (
                          <SelectItem key={format} value={format}>
                            {format.toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExport(recording, selectedFormat);
                      }}
                      disabled={isProcessing}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRecording(recording.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }
);

AudioRecorder.displayName = 'AudioRecorder';

export default AudioRecorder;