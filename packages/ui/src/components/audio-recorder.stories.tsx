import type { Meta, StoryObj } from '@storybook/react';
import { AudioRecorder } from './audio-recorder';
import { useState } from 'react';

const meta = {
  title: 'Advanced/AudioRecorder',
  component: AudioRecorder,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Advanced audio recorder with Web Audio API, waveform visualization, and multiple export formats.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    maxDuration: {
      control: { type: 'number', min: 10, max: 600, step: 10 },
      description: 'Maximum recording duration in seconds'
    },
    sampleRate: {
      control: { type: 'select' },
      options: [16000, 22050, 44100, 48000],
      description: 'Audio sample rate in Hz'
    },
    exportFormat: {
      control: { type: 'select' },
      options: ['wav', 'mp3', 'webm', 'ogg'],
      description: 'Export format for the recording'
    },
    noiseReduction: {
      control: 'boolean',
      description: 'Enable noise reduction'
    },
    echoCancellation: {
      control: 'boolean',
      description: 'Enable echo cancellation'
    },
    autoGainControl: {
      control: 'boolean',
      description: 'Enable automatic gain control'
    },
    showWaveform: {
      control: 'boolean',
      description: 'Show waveform visualization'
    },
    showFrequencyAnalyzer: {
      control: 'boolean',
      description: 'Show frequency analyzer instead of waveform'
    },
    voiceActivation: {
      control: 'boolean',
      description: 'Enable voice activation detection'
    },
    voiceThreshold: {
      control: { type: 'range', min: 0, max: 100, step: 5 },
      description: 'Voice activation threshold'
    },
    multiTrack: {
      control: 'boolean',
      description: 'Enable multi-track recording'
    },
    showAdvancedControls: {
      control: 'boolean',
      description: 'Show advanced controls and settings'
    },
    monitoring: {
      control: 'boolean',
      description: 'Enable real-time monitoring'
    },
    bufferSize: {
      control: { type: 'select' },
      options: [256, 512, 1024, 2048, 4096],
      description: 'Audio buffer size for processing'
    }
  }
} satisfies Meta<typeof AudioRecorder>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic recorder
export const Default: Story = {
  args: {
    maxDuration: 300,
    sampleRate: 44100,
    exportFormat: 'wav',
    showWaveform: true
  }
};

// With waveform visualization
export const WithWaveform: Story = {
  args: {
    maxDuration: 120,
    sampleRate: 44100,
    exportFormat: 'wav',
    showWaveform: true,
    noiseReduction: true,
    echoCancellation: true,
    autoGainControl: true
  }
};

// With frequency analyzer
export const WithFrequencyAnalyzer: Story = {
  args: {
    maxDuration: 180,
    sampleRate: 48000,
    exportFormat: 'wav',
    showWaveform: true,
    showFrequencyAnalyzer: true,
    noiseReduction: true
  }
};

// Voice activation mode
export const VoiceActivated: Story = {
  args: {
    maxDuration: 300,
    sampleRate: 44100,
    exportFormat: 'mp3',
    showWaveform: true,
    voiceActivation: true,
    voiceThreshold: 30,
    noiseReduction: true,
    echoCancellation: true
  }
};

// Advanced controls
export const AdvancedControls: Story = {
  args: {
    maxDuration: 600,
    sampleRate: 48000,
    exportFormat: 'wav',
    showWaveform: true,
    showAdvancedControls: true,
    noiseReduction: true,
    echoCancellation: true,
    autoGainControl: true,
    monitoring: true,
    bufferSize: 2048
  }
};

// Multi-track recording
export const MultiTrack: Story = {
  args: {
    maxDuration: 300,
    sampleRate: 44100,
    exportFormat: 'wav',
    showWaveform: true,
    multiTrack: true,
    showAdvancedControls: true
  }
};

// High quality recording
export const HighQuality: Story = {
  args: {
    maxDuration: 600,
    sampleRate: 48000,
    exportFormat: 'wav',
    showWaveform: true,
    showFrequencyAnalyzer: false,
    noiseReduction: true,
    echoCancellation: true,
    autoGainControl: true,
    bufferSize: 4096
  }
};

// Podcast recording setup
export const PodcastSetup: Story = {
  args: {
    maxDuration: 3600, // 1 hour
    sampleRate: 44100,
    exportFormat: 'mp3',
    showWaveform: true,
    noiseReduction: true,
    echoCancellation: true,
    autoGainControl: true,
    showAdvancedControls: true,
    monitoring: true
  }
};

// Voice memo
export const VoiceMemo: Story = {
  args: {
    maxDuration: 60,
    sampleRate: 22050,
    exportFormat: 'mp3',
    showWaveform: false,
    noiseReduction: true,
    autoGainControl: true
  }
};

// Music recording
export const MusicRecording: Story = {
  args: {
    maxDuration: 600,
    sampleRate: 48000,
    exportFormat: 'wav',
    showWaveform: true,
    showFrequencyAnalyzer: true,
    noiseReduction: false, // Keep original sound
    echoCancellation: false,
    autoGainControl: false,
    multiTrack: true,
    showAdvancedControls: true,
    monitoring: true,
    bufferSize: 512
  }
};

// Interactive example with callbacks
export const WithCallbacks: Story = {
  render: function Component(args) {
    const [recordingState, setRecordingState] = useState<string>('idle');
    const [recordingData, setRecordingData] = useState<any>(null);

    return (
      <div className="space-y-4">
        <AudioRecorder
          {...args}
          onRecordingStart={() => {
            setRecordingState('recording');
            console.log('Recording started');
          }}
          onRecordingStop={(blob, duration) => {
            setRecordingState('stopped');
            console.log('Recording stopped', { blob, duration });
          }}
          onSave={(blob, metadata) => {
            setRecordingData(metadata);
            console.log('Recording saved', { blob, metadata });
          }}
          onError={(error) => {
            setRecordingState('error');
            console.error('Recording error', error);
          }}
        />
        
        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            State: <span className="font-mono">{recordingState}</span>
          </p>
          {recordingData && (
            <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
              <p>Duration: {recordingData.duration.toFixed(2)}s</p>
              <p>Sample Rate: {recordingData.sampleRate}Hz</p>
              <p>Format: {recordingData.format}</p>
              <p>Size: {(recordingData.size / 1024).toFixed(2)}KB</p>
              <p>Average Volume: {recordingData.averageVolume?.toFixed(2)}%</p>
            </div>
          )}
        </div>
      </div>
    );
  },
  args: {
    maxDuration: 120,
    sampleRate: 44100,
    exportFormat: 'wav',
    showWaveform: true,
    showAdvancedControls: true,
    noiseReduction: true
  }
};

// Minimal UI
export const MinimalUI: Story = {
  args: {
    maxDuration: 300,
    sampleRate: 44100,
    exportFormat: 'mp3',
    showWaveform: false,
    showFrequencyAnalyzer: false,
    showAdvancedControls: false
  }
};

// Streaming mode simulation
export const StreamingMode: Story = {
  args: {
    maxDuration: 3600,
    sampleRate: 16000, // Lower for streaming
    exportFormat: 'webm',
    showWaveform: true,
    voiceActivation: true,
    voiceThreshold: 25,
    noiseReduction: true,
    echoCancellation: true,
    bufferSize: 256 // Small buffer for low latency
  }
};

// Interview recording
export const InterviewRecording: Story = {
  args: {
    maxDuration: 1800, // 30 minutes
    sampleRate: 44100,
    exportFormat: 'mp3',
    showWaveform: true,
    noiseReduction: true,
    echoCancellation: true,
    autoGainControl: true,
    multiTrack: true,
    showAdvancedControls: true,
    monitoring: true
  }
};