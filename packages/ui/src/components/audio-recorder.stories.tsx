import type { Meta, StoryObj } from '@storybook/react';
import { AudioRecorder } from './audio-recorder';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Button } from './button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Alert, AlertDescription } from './alert';
import { 
  Mic, 
  FileAudio, 
  Settings, 
  Info,
  Download,
  Upload,
  Headphones,
  Volume2,
  Activity,
  Waveform,
  Radio,
  Shield,
  Cpu,
  HardDrive,
  Clock,
  Filter
} from 'lucide-react';

const meta = {
  title: 'Advanced/AudioRecorder',
  component: AudioRecorder,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Advanced audio recording component with Web Audio API, real-time visualization, and multiple export formats.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    maxDuration: {
      control: { type: 'number', min: 60, max: 3600, step: 60 },
      description: 'Maximum recording duration in seconds'
    },
    sampleRate: {
      control: { type: 'select' },
      options: [8000, 16000, 22050, 44100, 48000],
      description: 'Audio sample rate in Hz'
    },
    bitRate: {
      control: { type: 'select' },
      options: [64000, 96000, 128000, 192000, 256000, 320000],
      description: 'Audio bit rate in bps'
    },
    enableNoiseReduction: {
      control: 'boolean',
      description: 'Enable noise reduction processing'
    },
    enableEchoCancellation: {
      control: 'boolean',
      description: 'Enable echo cancellation'
    },
    enableAutoGainControl: {
      control: 'boolean',
      description: 'Enable automatic gain control'
    },
    visualizationType: {
      control: { type: 'select' },
      options: ['waveform', 'frequency', 'both'],
      description: 'Type of audio visualization'
    },
    enableVoiceActivityDetection: {
      control: 'boolean',
      description: 'Enable voice activity detection'
    },
    silenceThreshold: {
      control: { type: 'number', min: 0, max: 100, step: 5 },
      description: 'Silence detection threshold'
    },
    autoSave: {
      control: 'boolean',
      description: 'Enable automatic saving'
    },
    saveInterval: {
      control: { type: 'number', min: 10, max: 120, step: 10 },
      description: 'Auto-save interval in seconds'
    }
  }
} satisfies Meta<typeof AudioRecorder>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  args: {
    maxDuration: 600,
    sampleRate: 44100,
    bitRate: 128000,
    enableNoiseReduction: true,
    enableEchoCancellation: true,
    enableAutoGainControl: true,
    exportFormats: ['wav', 'mp3', 'webm'],
    visualizationType: 'both'
  },
  render: (args) => (
    <div className="w-[800px]">
      <AudioRecorder {...args} />
    </div>
  )
};

// Professional Studio Recording
export const StudioRecording: Story = {
  args: {
    maxDuration: 3600,
    sampleRate: 48000,
    bitRate: 320000,
    enableNoiseReduction: true,
    enableEchoCancellation: true,
    enableAutoGainControl: false,
    exportFormats: ['wav', 'flac'],
    visualizationType: 'both',
    customStyles: {
      waveformColor: '#10b981',
      backgroundColor: '#030712',
      progressColor: '#0ea5e9'
    }
  },
  render: (args) => (
    <div className="w-[900px] space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5" />
            Professional Studio Recording
          </CardTitle>
          <CardDescription>
            High-quality audio recording with studio-grade settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">48 kHz</span>
            </div>
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">320 kbps</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Lossless</span>
            </div>
          </div>
        </CardContent>
      </Card>
      <AudioRecorder {...args} />
    </div>
  )
};

// Podcast Recording
export const PodcastRecording: Story = {
  args: {
    maxDuration: 7200,
    sampleRate: 44100,
    bitRate: 192000,
    enableNoiseReduction: true,
    enableEchoCancellation: true,
    enableAutoGainControl: true,
    exportFormats: ['mp3', 'wav'],
    visualizationType: 'waveform',
    enableVoiceActivityDetection: true,
    silenceThreshold: 30,
    silenceDuration: 2000,
    autoSave: true,
    saveInterval: 60
  },
  render: (args) => (
    <div className="w-[800px] space-y-4">
      <Alert>
        <Mic className="h-4 w-4" />
        <AlertDescription>
          Optimized for podcast recording with voice activity detection and auto-save enabled
        </AlertDescription>
      </Alert>
      <AudioRecorder {...args} />
    </div>
  )
};

// Voice Memo
export const VoiceMemo: Story = {
  args: {
    maxDuration: 300,
    sampleRate: 22050,
    bitRate: 64000,
    enableNoiseReduction: true,
    enableEchoCancellation: false,
    enableAutoGainControl: true,
    exportFormats: ['mp3'],
    visualizationType: 'waveform'
  },
  render: (args) => (
    <div className="w-[600px]">
      <AudioRecorder {...args} />
    </div>
  )
};

// Multi-track Recording Interface
export const MultiTrackInterface: Story = {
  render: () => {
    const [tracks, setTracks] = useState<any[]>([]);
    
    const handleRecordingComplete = (blob: Blob, metadata: any) => {
      setTracks(prev => [...prev, {
        id: Date.now(),
        blob,
        metadata,
        name: `Track ${prev.length + 1}`,
        muted: false,
        volume: 100
      }]);
    };
    
    return (
      <div className="w-[1000px] space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Multi-Track Recording Studio</CardTitle>
            <CardDescription>
              Record multiple audio tracks and mix them together
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="record" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="record">Record</TabsTrigger>
                <TabsTrigger value="tracks">Tracks ({tracks.length})</TabsTrigger>
                <TabsTrigger value="mix">Mix</TabsTrigger>
              </TabsList>
              
              <TabsContent value="record">
                <AudioRecorder
                  maxDuration={600}
                  sampleRate={44100}
                  bitRate={192000}
                  onRecordingComplete={handleRecordingComplete}
                />
              </TabsContent>
              
              <TabsContent value="tracks" className="space-y-2">
                {tracks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No tracks recorded yet. Go to Record tab to start.
                  </div>
                ) : (
                  tracks.map((track, index) => (
                    <Card key={track.id}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <FileAudio className="h-5 w-5" />
                          <div>
                            <p className="font-medium">{track.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Duration: {Math.floor(track.metadata.duration)}s
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant={track.muted ? 'secondary' : 'outline'}
                            onClick={() => {
                              setTracks(prev => prev.map(t => 
                                t.id === track.id ? {...t, muted: !t.muted} : t
                              ));
                            }}
                          >
                            {track.muted ? <Volume2 className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setTracks(prev => prev.filter(t => t.id !== track.id));
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
              
              <TabsContent value="mix">
                <div className="text-center py-8 text-muted-foreground">
                  Mix console coming soon...
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  }
};

// Live Streaming
export const LiveStreaming: Story = {
  args: {
    maxDuration: 0, // No limit for streaming
    sampleRate: 44100,
    bitRate: 128000,
    enableNoiseReduction: true,
    enableEchoCancellation: true,
    enableAutoGainControl: true,
    exportFormats: ['webm'],
    visualizationType: 'both',
    autoSave: true,
    saveInterval: 30
  },
  render: (args) => (
    <div className="w-[800px] space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-red-500 animate-pulse" />
            Live Streaming
          </CardTitle>
          <CardDescription>
            Broadcasting live with real-time audio processing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge variant="destructive" className="animate-pulse">LIVE</Badge>
            <span className="text-sm text-muted-foreground">0 listeners</span>
            <Button size="sm" variant="outline">
              <Upload className="h-4 w-4 mr-1" />
              Stream Settings
            </Button>
          </div>
        </CardContent>
      </Card>
      <AudioRecorder {...args} />
    </div>
  )
};

// Field Recording
export const FieldRecording: Story = {
  args: {
    maxDuration: 1800,
    sampleRate: 48000,
    bitRate: 256000,
    enableNoiseReduction: false, // Keep natural sound
    enableEchoCancellation: false,
    enableAutoGainControl: false,
    exportFormats: ['wav', 'flac'],
    visualizationType: 'frequency',
    customStyles: {
      waveformColor: '#f59e0b',
      backgroundColor: '#1e293b',
      progressColor: '#dc2626'
    }
  },
  render: (args) => (
    <div className="w-[800px] space-y-4">
      <Alert>
        <Activity className="h-4 w-4" />
        <AlertDescription>
          Field recording mode: All audio processing disabled for natural sound capture
        </AlertDescription>
      </Alert>
      <AudioRecorder {...args} />
    </div>
  )
};

// Music Production
export const MusicProduction: Story = {
  render: () => {
    const [bpm, setBpm] = useState(120);
    const [metronomeEnabled, setMetronomeEnabled] = useState(false);
    
    return (
      <div className="w-[900px] space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Music Production Studio</CardTitle>
            <CardDescription>
              Professional music recording with metronome and beat grid
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <input
                  type="number"
                  value={bpm}
                  onChange={(e) => setBpm(parseInt(e.target.value))}
                  className="w-20 px-2 py-1 border rounded"
                  min="60"
                  max="200"
                />
                <span className="text-sm">BPM</span>
              </div>
              <Button
                size="sm"
                variant={metronomeEnabled ? 'default' : 'outline'}
                onClick={() => setMetronomeEnabled(!metronomeEnabled)}
              >
                <Activity className="h-4 w-4 mr-1" />
                Metronome
              </Button>
              <Button size="sm" variant="outline">
                <Waveform className="h-4 w-4 mr-1" />
                Beat Grid
              </Button>
              <Button size="sm" variant="outline">
                <Filter className="h-4 w-4 mr-1" />
                Effects
              </Button>
            </div>
            {metronomeEnabled && (
              <Alert>
                <Activity className="h-4 w-4" />
                <AlertDescription>
                  Metronome active at {bpm} BPM
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
        <AudioRecorder
          maxDuration={600}
          sampleRate: 48000,
          bitRate: 320000,
          enableNoiseReduction: false,
          enableEchoCancellation: false,
          enableAutoGainControl: false,
          exportFormats: ['wav', 'flac'],
          visualizationType: 'both'
        />
      </div>
    );
  }
};

// Voice Command Training
export const VoiceCommandTraining: Story = {
  render: () => {
    const [commands, setCommands] = useState<string[]>([]);
    const [currentCommand, setCurrentCommand] = useState('');
    
    const trainingCommands = [
      'Turn on the lights',
      'Set timer for 5 minutes',
      'Play music',
      'What\'s the weather?',
      'Send message',
      'Open calendar'
    ];
    
    return (
      <div className="w-[800px] space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Voice Command Training</CardTitle>
            <CardDescription>
              Record voice commands for AI training
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Current Command:</p>
              <p className="text-2xl font-bold">
                {currentCommand || trainingCommands[commands.length] || 'Training Complete!'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {trainingCommands.map((cmd, index) => (
                <div
                  key={index}
                  className={`p-2 rounded border text-sm ${
                    commands.length > index 
                      ? 'bg-green-50 border-green-300 text-green-700'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  {cmd}
                  {commands.length > index && ' ✓'}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm">
              <span>Progress: {commands.length}/{trainingCommands.length}</span>
              <span>{Math.round((commands.length / trainingCommands.length) * 100)}% Complete</span>
            </div>
          </CardContent>
        </Card>
        <AudioRecorder
          maxDuration: 10,
          sampleRate: 16000,
          bitRate: 64000,
          enableNoiseReduction: true,
          enableEchoCancellation: true,
          enableAutoGainControl: true,
          exportFormats: ['wav'],
          visualizationType: 'waveform',
          enableVoiceActivityDetection: true,
          onRecordingComplete: (blob, metadata) => {
            setCommands(prev => [...prev, currentCommand || trainingCommands[commands.length]]);
            setCurrentCommand(trainingCommands[commands.length + 1] || '');
          }}
        />
      </div>
    );
  }
};

// Accessibility Features
export const AccessibilityFeatures: Story = {
  args: {
    maxDuration: 600,
    sampleRate: 44100,
    bitRate: 128000,
    enableNoiseReduction: true,
    enableEchoCancellation: true,
    enableAutoGainControl: true,
    exportFormats: ['wav', 'mp3', 'webm'],
    visualizationType: 'both',
    enableTranscription: true,
    enableMetadata: true
  },
  render: (args) => (
    <div className="w-[800px] space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Accessibility Features</CardTitle>
          <CardDescription>
            Enhanced recording with transcription and metadata support
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked />
              <span className="text-sm">Enable live transcription</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked />
              <span className="text-sm">Include timestamps in transcript</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked />
              <span className="text-sm">Generate audio descriptions</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked />
              <span className="text-sm">Keyboard navigation support</span>
            </label>
          </div>
        </CardContent>
      </Card>
      <AudioRecorder {...args} />
    </div>
  )
};

// Error States
export const ErrorStates: Story = {
  render: () => {
    const [showError, setShowError] = useState(false);
    
    return (
      <div className="w-[800px] space-y-4">
        <div className="flex gap-2">
          <Button onClick={() => setShowError(!showError)}>
            Toggle Error State
          </Button>
        </div>
        <AudioRecorder
          maxDuration: 600,
          onError={(error) => {
            console.error('Recording error:', error);
          }}
        />
        {showError && (
          <Alert variant="destructive">
            <AlertDescription>
              Microphone access denied. Please check your browser permissions.
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  }
};

// Mobile Optimized
export const MobileOptimized: Story = {
  args: {
    maxDuration: 180,
    sampleRate: 22050,
    bitRate: 64000,
    enableNoiseReduction: true,
    enableEchoCancellation: true,
    enableAutoGainControl: true,
    exportFormats: ['mp3'],
    visualizationType: 'waveform'
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1'
    }
  },
  render: (args) => (
    <div className="w-full max-w-[400px] mx-auto p-4">
      <AudioRecorder {...args} className="w-full" />
    </div>
  )
};

// Advanced Settings
export const AdvancedSettings: Story = {
  render: () => {
    const [settings, setSettings] = useState({
      sampleRate: 44100,
      bitRate: 128000,
      channels: 2,
      noiseReduction: true,
      echoCancellation: true,
      autoGainControl: true,
      voiceActivityDetection: false,
      silenceThreshold: 30,
      bufferSize: 4096,
      latency: 'balanced'
    });
    
    return (
      <div className="w-[900px] space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Advanced Audio Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Sample Rate</label>
                <select
                  value={settings.sampleRate}
                  onChange={(e) => setSettings({...settings, sampleRate: parseInt(e.target.value)})}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                >
                  <option value="8000">8 kHz (Telephone)</option>
                  <option value="16000">16 kHz (VoIP)</option>
                  <option value="22050">22.05 kHz (FM Radio)</option>
                  <option value="44100">44.1 kHz (CD Quality)</option>
                  <option value="48000">48 kHz (Professional)</option>
                  <option value="96000">96 kHz (Studio)</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Bit Rate</label>
                <select
                  value={settings.bitRate}
                  onChange={(e) => setSettings({...settings, bitRate: parseInt(e.target.value)})}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                >
                  <option value="64000">64 kbps</option>
                  <option value="96000">96 kbps</option>
                  <option value="128000">128 kbps</option>
                  <option value="192000">192 kbps</option>
                  <option value="256000">256 kbps</option>
                  <option value="320000">320 kbps</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Buffer Size</label>
                <select
                  value={settings.bufferSize}
                  onChange={(e) => setSettings({...settings, bufferSize: parseInt(e.target.value)})}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                >
                  <option value="256">256 (Ultra Low Latency)</option>
                  <option value="512">512 (Low Latency)</option>
                  <option value="1024">1024 (Balanced)</option>
                  <option value="2048">2048 (Standard)</option>
                  <option value="4096">4096 (High Quality)</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Latency Mode</label>
                <select
                  value={settings.latency}
                  onChange={(e) => setSettings({...settings, latency: e.target.value})}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                >
                  <option value="interactive">Interactive (Lowest)</option>
                  <option value="balanced">Balanced</option>
                  <option value="playback">Playback (Highest Quality)</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Estimated file size: ~{Math.round(settings.bitRate / 8000 * 60)} MB/min
              </p>
            </div>
          </CardContent>
        </Card>
        
        <AudioRecorder
          sampleRate={settings.sampleRate}
          bitRate={settings.bitRate}
          enableNoiseReduction={settings.noiseReduction}
          enableEchoCancellation={settings.echoCancellation}
          enableAutoGainControl={settings.autoGainControl}
          enableVoiceActivityDetection={settings.voiceActivityDetection}
          silenceThreshold={settings.silenceThreshold}
        />
      </div>
    );
  }
};