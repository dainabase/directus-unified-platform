import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '../utils';
import { 
  Mic, 
  MicOff, 
  Pause, 
  Play, 
  Square, 
  Download, 
  Volume2,
  Settings,
  Trash2,
  RotateCcw,
  Save,
  Upload,
  Headphones,
  Activity
} from 'lucide-react';

export interface AudioRecorderProps {
  /** Maximum recording duration in seconds */
  maxDuration?: number;
  /** Audio quality (16000, 22050, 44100, 48000) */
  sampleRate?: number;
  /** Export format */
  exportFormat?: 'wav' | 'mp3' | 'webm' | 'ogg';
  /** Enable noise reduction */
  noiseReduction?: boolean;
  /** Enable echo cancellation */
  echoCancellation?: boolean;
  /** Enable auto gain control */
  autoGainControl?: boolean;
  /** Show waveform visualization */
  showWaveform?: boolean;
  /** Show frequency analyzer */
  showFrequencyAnalyzer?: boolean;
  /** Enable voice activation detection */
  voiceActivation?: boolean;
  /** Voice activation threshold (0-100) */
  voiceThreshold?: number;
  /** Custom class name */
  className?: string;
  /** Callback when recording starts */
  onRecordingStart?: () => void;
  /** Callback when recording stops */
  onRecordingStop?: (blob: Blob, duration: number) => void;
  /** Callback when recording is saved */
  onSave?: (blob: Blob, metadata: AudioMetadata) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
  /** Enable multiple tracks */
  multiTrack?: boolean;
  /** Show advanced controls */
  showAdvancedControls?: boolean;
  /** Enable real-time monitoring */
  monitoring?: boolean;
  /** Recording buffer size */
  bufferSize?: 256 | 512 | 1024 | 2048 | 4096;
}

export interface AudioMetadata {
  duration: number;
  sampleRate: number;
  format: string;
  size: number;
  timestamp: Date;
  peaks?: number[];
  averageVolume?: number;
}

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
  volume: number;
  peaks: number[];
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({
  maxDuration = 300, // 5 minutes default
  sampleRate = 44100,
  exportFormat = 'wav',
  noiseReduction = true,
  echoCancellation = true,
  autoGainControl = true,
  showWaveform = true,
  showFrequencyAnalyzer = false,
  voiceActivation = false,
  voiceThreshold = 30,
  className,
  onRecordingStart,
  onRecordingStop,
  onSave,
  onError,
  multiTrack = false,
  showAdvancedControls = false,
  monitoring = false,
  bufferSize = 2048
}) => {
  const [state, setState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    audioBlob: null,
    audioUrl: null,
    volume: 0,
    peaks: []
  });

  const [showSettings, setShowSettings] = useState(false);
  const [inputDevice, setInputDevice] = useState<string>('default');
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(monitoring);
  const [tracks, setTracks] = useState<Blob[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  // Initialize audio devices
  useEffect(() => {
    const getDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter(device => device.kind === 'audioinput');
        setAvailableDevices(audioInputs);
      } catch (err) {
        console.error('Error enumerating devices:', err);
      }
    };

    getDevices();

    // Listen for device changes
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
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Draw waveform visualization
  const drawWaveform = useCallback(() => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      if (showFrequencyAnalyzer) {
        analyser.getByteFrequencyData(dataArray);
        
        ctx.fillStyle = 'rgb(0, 0, 0)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          barHeight = (dataArray[i] / 255) * canvas.height;

          const r = barHeight + 25 * (i / bufferLength);
          const g = 250 * (i / bufferLength);
          const b = 50;

          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

          x += barWidth + 1;
        }
      } else {
        analyser.getByteTimeDomainData(dataArray);

        ctx.fillStyle = 'rgb(240, 240, 240)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgb(239, 68, 68)';
        ctx.beginPath();

        const sliceWidth = canvas.width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = v * canvas.height / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
      }

      // Calculate volume
      const average = dataArray.reduce((a, b) => a + b) / bufferLength;
      const normalizedVolume = (average / 255) * 100;
      
      setState(prev => ({
        ...prev,
        volume: normalizedVolume,
        peaks: [...prev.peaks.slice(-100), normalizedVolume]
      }));
    };

    draw();
  }, [showFrequencyAnalyzer]);

  // Start recording
  const startRecording = async () => {
    try {
      const constraints: MediaStreamConstraints = {
        audio: {
          deviceId: inputDevice !== 'default' ? { exact: inputDevice } : undefined,
          sampleRate,
          echoCancellation,
          noiseSuppression: noiseReduction,
          autoGainControl,
          channelCount: multiTrack ? 2 : 1
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Setup audio context for visualization
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate
      });
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = bufferSize;
      source.connect(analyserRef.current);

      // Setup MediaRecorder
      const mimeType = getMimeType(exportFormat);
      const options: MediaRecorderOptions = {
        mimeType,
        audioBitsPerSecond: sampleRate * 16
      };

      mediaRecorderRef.current = new MediaRecorder(stream, options);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        setState(prev => ({
          ...prev,
          audioBlob: blob,
          audioUrl: url,
          isRecording: false,
          isPaused: false
        }));

        if (onRecordingStop) {
          onRecordingStop(blob, state.duration);
        }
      };

      mediaRecorderRef.current.start(100); // Collect data every 100ms

      // Start timer
      timerRef.current = setInterval(() => {
        setState(prev => {
          const newDuration = prev.duration + 0.1;
          if (newDuration >= maxDuration) {
            stopRecording();
            return prev;
          }
          return { ...prev, duration: newDuration };
        });
      }, 100);

      setState(prev => ({
        ...prev,
        isRecording: true,
        isPaused: false,
        duration: 0,
        peaks: []
      }));

      if (showWaveform || showFrequencyAnalyzer) {
        drawWaveform();
      }

      onRecordingStart?.();
    } catch (error) {
      console.error('Error starting recording:', error);
      onError?.(error as Error);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    setState(prev => ({
      ...prev,
      isRecording: false,
      isPaused: false
    }));
  };

  // Pause/Resume recording
  const togglePause = () => {
    if (!mediaRecorderRef.current) return;

    if (state.isPaused) {
      mediaRecorderRef.current.resume();
      setState(prev => ({ ...prev, isPaused: false }));
    } else {
      mediaRecorderRef.current.pause();
      setState(prev => ({ ...prev, isPaused: true }));
    }
  };

  // Reset recording
  const resetRecording = () => {
    if (state.audioUrl) {
      URL.revokeObjectURL(state.audioUrl);
    }

    setState({
      isRecording: false,
      isPaused: false,
      duration: 0,
      audioBlob: null,
      audioUrl: null,
      volume: 0,
      peaks: []
    });

    setTracks([]);
  };

  // Save recording
  const saveRecording = () => {
    if (!state.audioBlob) return;

    const metadata: AudioMetadata = {
      duration: state.duration,
      sampleRate,
      format: exportFormat,
      size: state.audioBlob.size,
      timestamp: new Date(),
      peaks: state.peaks,
      averageVolume: state.peaks.reduce((a, b) => a + b, 0) / state.peaks.length
    };

    onSave?.(state.audioBlob, metadata);
  };

  // Download recording
  const downloadRecording = () => {
    if (!state.audioUrl || !state.audioBlob) return;

    const a = document.createElement('a');
    a.href = state.audioUrl;
    a.download = `recording-${Date.now()}.${exportFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Get MIME type for format
  const getMimeType = (format: string): string => {
    const mimeTypes: Record<string, string> = {
      wav: 'audio/wav',
      mp3: 'audio/mpeg',
      webm: 'audio/webm',
      ogg: 'audio/ogg'
    };
    return mimeTypes[format] || 'audio/webm';
  };

  // Format duration display
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn('audio-recorder', className)}>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Activity className="w-6 h-6 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Audio Recorder
            </h3>
          </div>
          
          {showAdvancedControls && (
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          )}
        </div>

        {/* Settings Panel */}
        {showSettings && showAdvancedControls && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Input Device
                </label>
                <select
                  value={inputDevice}
                  onChange={(e) => setInputDevice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  disabled={state.isRecording}
                >
                  <option value="default">Default Device</option>
                  {availableDevices.map(device => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Device ${device.deviceId.slice(0, 8)}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sample Rate
                </label>
                <select
                  value={sampleRate}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  disabled={state.isRecording}
                >
                  <option value={16000}>16 kHz</option>
                  <option value={22050}>22.05 kHz</option>
                  <option value={44100}>44.1 kHz</option>
                  <option value={48000}>48 kHz</option>
                </select>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="noise-reduction"
                  checked={noiseReduction}
                  className="w-4 h-4 text-red-600 rounded"
                  disabled={state.isRecording}
                />
                <label htmlFor="noise-reduction" className="text-sm text-gray-700 dark:text-gray-300">
                  Noise Reduction
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="echo-cancellation"
                  checked={echoCancellation}
                  className="w-4 h-4 text-red-600 rounded"
                  disabled={state.isRecording}
                />
                <label htmlFor="echo-cancellation" className="text-sm text-gray-700 dark:text-gray-300">
                  Echo Cancellation
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Waveform Visualization */}
        {(showWaveform || showFrequencyAnalyzer) && (
          <div className="mb-6">
            <canvas
              ref={canvasRef}
              width={600}
              height={150}
              className="w-full h-32 bg-gray-100 dark:bg-gray-800 rounded-lg"
            />
          </div>
        )}

        {/* Duration and Volume */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-4">
              <span className="text-2xl font-mono text-gray-900 dark:text-white">
                {formatDuration(state.duration)}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                / {formatDuration(maxDuration)}
              </span>
            </div>

            {state.isRecording && (
              <div className="flex items-center space-x-2">
                <Volume2 className="w-4 h-4 text-gray-500" />
                <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-red-500 transition-all duration-100"
                    style={{ width: `${state.volume}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 transition-all duration-100"
              style={{ width: `${(state.duration / maxDuration) * 100}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          {!state.isRecording && !state.audioBlob && (
            <button
              onClick={startRecording}
              className="p-4 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors shadow-lg hover:shadow-xl"
              aria-label="Start Recording"
            >
              <Mic className="w-6 h-6" />
            </button>
          )}

          {state.isRecording && (
            <>
              <button
                onClick={togglePause}
                className="p-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full transition-colors"
                aria-label={state.isPaused ? 'Resume' : 'Pause'}
              >
                {state.isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              </button>

              <button
                onClick={stopRecording}
                className="p-4 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors shadow-lg hover:shadow-xl"
                aria-label="Stop Recording"
              >
                <Square className="w-6 h-6" />
              </button>
            </>
          )}

          {state.audioBlob && !state.isRecording && (
            <>
              <button
                onClick={resetRecording}
                className="p-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full transition-colors"
                aria-label="Reset"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button
                onClick={startRecording}
                className="p-4 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors shadow-lg hover:shadow-xl"
                aria-label="New Recording"
              >
                <Mic className="w-6 h-6" />
              </button>

              {onSave && (
                <button
                  onClick={saveRecording}
                  className="p-3 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors"
                  aria-label="Save"
                >
                  <Save className="w-5 h-5" />
                </button>
              )}

              <button
                onClick={downloadRecording}
                className="p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors"
                aria-label="Download"
              >
                <Download className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Audio Player */}
        {state.audioUrl && (
          <div className="mt-6">
            <audio
              controls
              src={state.audioUrl}
              className="w-full"
            />
          </div>
        )}

        {/* Multi-track List */}
        {multiTrack && tracks.length > 0 && (
          <div className="mt-6 space-y-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tracks ({tracks.length})
            </h4>
            {tracks.map((track, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Track {index + 1}
                </span>
                <button
                  onClick={() => setTracks(tracks.filter((_, i) => i !== index))}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                  aria-label={`Delete Track ${index + 1}`}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Voice Activation Indicator */}
        {voiceActivation && state.isRecording && (
          <div className="mt-4 flex items-center justify-center space-x-2">
            <div className={cn(
              'w-3 h-3 rounded-full',
              state.volume > voiceThreshold ? 'bg-green-500' : 'bg-gray-300'
            )} />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Voice {state.volume > voiceThreshold ? 'Detected' : 'Not Detected'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioRecorder;
export { AudioRecorder };