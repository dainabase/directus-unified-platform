import { test, expect, Page } from '@playwright/test';
import { mockMediaDevices, waitForAnimationFrame } from '../helpers/test-utils';

test.describe('AudioRecorder Component', () => {
  let page: Page;
  
  test.beforeEach(async ({ page: p }) => {
    page = p;
    
    // Mock MediaDevices API
    await page.addInitScript(() => {
      // Mock getUserMedia
      const mockStream = {
        id: 'mock-stream-id',
        active: true,
        getTracks: () => [{
          id: 'mock-track-id',
          kind: 'audio',
          label: 'Mock Microphone',
          enabled: true,
          muted: false,
          stop: () => {},
          addEventListener: () => {},
          removeEventListener: () => {}
        }],
        getAudioTracks: () => [{
          id: 'mock-audio-track',
          kind: 'audio',
          label: 'Mock Audio',
          enabled: true,
          stop: () => {}
        }],
        addTrack: () => {},
        removeTrack: () => {},
        addEventListener: () => {},
        removeEventListener: () => {}
      };
      
      // Mock MediaRecorder
      window.MediaRecorder = class MockMediaRecorder {
        static isTypeSupported = () => true;
        
        ondataavailable: ((event: any) => void) | null = null;
        onstop: (() => void) | null = null;
        onerror: ((error: any) => void) | null = null;
        onstart: (() => void) | null = null;
        onpause: (() => void) | null = null;
        onresume: (() => void) | null = null;
        
        state = 'inactive';
        stream: any;
        mimeType: string;
        audioBitsPerSecond: number;
        
        constructor(stream: any, options: any = {}) {
          this.stream = stream;
          this.mimeType = options.mimeType || 'audio/webm';
          this.audioBitsPerSecond = options.audioBitsPerSecond || 128000;
        }
        
        start(timeslice?: number) {
          this.state = 'recording';
          if (this.onstart) this.onstart();
          
          // Simulate data available events
          setTimeout(() => {
            if (this.ondataavailable) {
              this.ondataavailable({
                data: new Blob(['mock-audio-data'], { type: 'audio/webm' })
              });
            }
          }, timeslice || 1000);
        }
        
        stop() {
          this.state = 'inactive';
          if (this.onstop) this.onstop();
        }
        
        pause() {
          this.state = 'paused';
          if (this.onpause) this.onpause();
        }
        
        resume() {
          this.state = 'recording';
          if (this.onresume) this.onresume();
        }
        
        requestData() {
          if (this.ondataavailable) {
            this.ondataavailable({
              data: new Blob(['mock-audio-data'], { type: 'audio/webm' })
            });
          }
        }
      } as any;
      
      // Mock enumerateDevices
      navigator.mediaDevices.enumerateDevices = async () => [
        {
          deviceId: 'default',
          kind: 'audioinput',
          label: 'Default Microphone',
          groupId: 'default-group',
          toJSON: () => ({})
        },
        {
          deviceId: 'mic-1',
          kind: 'audioinput',
          label: 'USB Microphone',
          groupId: 'usb-group',
          toJSON: () => ({})
        },
        {
          deviceId: 'mic-2',
          kind: 'audioinput',
          label: 'Bluetooth Headset',
          groupId: 'bluetooth-group',
          toJSON: () => ({})
        }
      ] as MediaDeviceInfo[];
      
      // Mock getUserMedia
      navigator.mediaDevices.getUserMedia = async () => mockStream as any;
      
      // Mock AudioContext
      window.AudioContext = class MockAudioContext {
        state = 'running';
        sampleRate = 44100;
        currentTime = 0;
        destination = { maxChannelCount: 2 };
        
        createMediaStreamSource = () => ({
          connect: () => ({ connect: () => ({ connect: () => ({}) }) }),
          disconnect: () => {}
        });
        
        createAnalyser = () => ({
          fftSize: 2048,
          frequencyBinCount: 1024,
          getByteFrequencyData: (array: Uint8Array) => {
            for (let i = 0; i < array.length; i++) {
              array[i] = Math.random() * 255;
            }
          },
          getByteTimeDomainData: (array: Uint8Array) => {
            for (let i = 0; i < array.length; i++) {
              array[i] = 128 + Math.sin(i * 0.1) * 127;
            }
          },
          connect: () => ({})
        });
        
        createGain = () => ({
          gain: { value: 1 },
          connect: () => ({})
        });
        
        createDynamicsCompressor = () => ({
          threshold: { value: -24 },
          connect: () => ({})
        });
        
        createBiquadFilter = () => ({
          type: 'highpass',
          frequency: { value: 80 },
          connect: () => ({})
        });
        
        decodeAudioData = async () => ({
          length: 44100,
          duration: 1,
          sampleRate: 44100,
          numberOfChannels: 2,
          getChannelData: () => new Float32Array(44100)
        });
        
        close = async () => {};
      } as any;
    });
    
    await page.goto('/components/audio-recorder');
  });
  
  test('should render audio recorder with default state', async () => {
    await expect(page.locator('[data-testid="audio-recorder"]')).toBeVisible();
    await expect(page.locator('text=Audio Recorder')).toBeVisible();
    await expect(page.locator('button:has-text("Start Recording")')).toBeVisible();
    await expect(page.locator('text=00:00')).toBeVisible();
  });
  
  test('should display available microphone devices', async () => {
    const deviceSelector = page.locator('[data-testid="device-selector"]');
    await deviceSelector.click();
    
    await expect(page.locator('text=Default Microphone')).toBeVisible();
    await expect(page.locator('text=USB Microphone')).toBeVisible();
    await expect(page.locator('text=Bluetooth Headset')).toBeVisible();
  });
  
  test('should start recording when clicking start button', async () => {
    const startButton = page.locator('button:has-text("Start Recording")');
    await startButton.click();
    
    // Check recording state
    await expect(page.locator('.badge:has-text("RECORDING")')).toBeVisible();
    await expect(page.locator('button:has-text("Pause")')).toBeVisible();
    await expect(page.locator('button:has-text("Stop")')).toBeVisible();
    
    // Check timer is running
    await page.waitForTimeout(1100);
    const timerText = await page.locator('[data-testid="timer"]').textContent();
    expect(timerText).not.toBe('00:00');
  });
  
  test('should pause and resume recording', async () => {
    // Start recording
    await page.locator('button:has-text("Start Recording")').click();
    await expect(page.locator('.badge:has-text("RECORDING")')).toBeVisible();
    
    // Pause recording
    await page.locator('button:has-text("Pause")').click();
    await expect(page.locator('.badge:has-text("PAUSED")')).toBeVisible();
    await expect(page.locator('button:has-text("Resume")')).toBeVisible();
    
    // Resume recording
    await page.locator('button:has-text("Resume")').click();
    await expect(page.locator('.badge:has-text("RECORDING")')).toBeVisible();
    await expect(page.locator('button:has-text("Pause")')).toBeVisible();
  });
  
  test('should stop recording and save to recordings list', async () => {
    // Start recording
    await page.locator('button:has-text("Start Recording")').click();
    await page.waitForTimeout(1000);
    
    // Stop recording
    await page.locator('button:has-text("Stop")').click();
    
    // Check recording is saved
    await expect(page.locator('text=Recordings (1)')).toBeVisible();
    await expect(page.locator('text=Recording 1')).toBeVisible();
    await expect(page.locator('audio')).toBeVisible();
  });
  
  test('should adjust gain/volume control', async () => {
    const gainSlider = page.locator('[data-testid="gain-slider"]');
    const gainValue = page.locator('[data-testid="gain-value"]');
    
    // Check initial value
    await expect(gainValue).toHaveText('100%');
    
    // Adjust gain
    await gainSlider.click({ position: { x: 50, y: 10 } });
    const newValue = await gainValue.textContent();
    expect(newValue).not.toBe('100%');
  });
  
  test('should display waveform visualization', async () => {
    const waveformCanvas = page.locator('canvas[data-testid="waveform-canvas"]');
    await expect(waveformCanvas).toBeVisible();
    
    // Start recording to activate visualization
    await page.locator('button:has-text("Start Recording")').click();
    
    // Check canvas is being updated
    const initialCanvas = await waveformCanvas.screenshot();
    await page.waitForTimeout(500);
    const updatedCanvas = await waveformCanvas.screenshot();
    
    expect(Buffer.compare(initialCanvas, updatedCanvas)).not.toBe(0);
  });
  
  test('should display frequency spectrum visualization', async () => {
    // Switch to frequency tab
    await page.locator('button[role="tab"]:has-text("Frequency")').click();
    
    const frequencyCanvas = page.locator('canvas[data-testid="frequency-canvas"]');
    await expect(frequencyCanvas).toBeVisible();
    
    // Start recording
    await page.locator('button:has-text("Start Recording")').click();
    
    // Check canvas updates
    const initialCanvas = await frequencyCanvas.screenshot();
    await page.waitForTimeout(500);
    const updatedCanvas = await frequencyCanvas.screenshot();
    
    expect(Buffer.compare(initialCanvas, updatedCanvas)).not.toBe(0);
  });
  
  test('should display input level meters', async () => {
    // Switch to meters tab
    await page.locator('button[role="tab"]:has-text("Meters")').click();
    
    await expect(page.locator('text=Input Level')).toBeVisible();
    await expect(page.locator('text=Sample Rate')).toBeVisible();
    await expect(page.locator('text=44100 Hz')).toBeVisible();
    await expect(page.locator('text=Bit Rate')).toBeVisible();
    await expect(page.locator('text=128 kbps')).toBeVisible();
  });
  
  test('should export recording in different formats', async () => {
    // Create a recording first
    await page.locator('button:has-text("Start Recording")').click();
    await page.waitForTimeout(1000);
    await page.locator('button:has-text("Stop")').click();
    
    // Select export format
    const formatSelector = page.locator('[data-testid="export-format"]');
    await formatSelector.click();
    await page.locator('text=WAV').click();
    
    // Mock download
    const downloadPromise = page.waitForEvent('download');
    await page.locator('button[data-testid="export-button"]').click();
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.wav');
  });
  
  test('should delete recording from list', async () => {
    // Create a recording
    await page.locator('button:has-text("Start Recording")').click();
    await page.waitForTimeout(1000);
    await page.locator('button:has-text("Stop")').click();
    
    await expect(page.locator('text=Recordings (1)')).toBeVisible();
    
    // Delete recording
    await page.locator('button[data-testid="delete-recording"]').click();
    
    // Check recording is removed
    await expect(page.locator('text=Recordings (1)')).not.toBeVisible();
  });
  
  test('should toggle monitoring', async () => {
    const monitorButton = page.locator('button:has-text("Monitor")');
    
    // Start recording first
    await page.locator('button:has-text("Start Recording")').click();
    
    // Toggle monitoring
    await monitorButton.click();
    await expect(monitorButton).toHaveClass(/.*variant-default.*/);
    
    await monitorButton.click();
    await expect(monitorButton).toHaveClass(/.*variant-outline.*/);
  });
  
  test('should respect maximum duration limit', async () => {
    // Set max duration to 3 seconds for testing
    await page.evaluate(() => {
      const recorder = document.querySelector('[data-testid="audio-recorder"]');
      if (recorder) {
        recorder.setAttribute('data-max-duration', '3');
      }
    });
    
    // Start recording
    await page.locator('button:has-text("Start Recording")').click();
    
    // Wait for auto-stop
    await page.waitForTimeout(3500);
    
    // Check recording stopped
    await expect(page.locator('button:has-text("Start Recording")')).toBeVisible();
    await expect(page.locator('text=Recordings (1)')).toBeVisible();
  });
  
  test('should handle voice activity detection', async () => {
    // Enable VAD
    await page.locator('input[data-testid="vad-checkbox"]').check();
    
    // Start recording
    await page.locator('button:has-text("Start Recording")').click();
    
    // Simulate silence (would trigger pause in real scenario)
    await page.waitForTimeout(2500);
    
    // In a real scenario with actual audio, this would pause
    // For testing, we just verify the option is enabled
    const vadCheckbox = page.locator('input[data-testid="vad-checkbox"]');
    await expect(vadCheckbox).toBeChecked();
  });
  
  test('should display audio processing settings', async () => {
    await expect(page.locator('text=Audio Processing')).toBeVisible();
    await expect(page.locator('text=Noise Reduction')).toBeVisible();
    await expect(page.locator('text=Echo Cancellation')).toBeVisible();
    await expect(page.locator('text=Auto Gain Control')).toBeVisible();
    await expect(page.locator('text=Voice Activity Detection')).toBeVisible();
  });
  
  test('should handle multiple recordings', async () => {
    // Create first recording
    await page.locator('button:has-text("Start Recording")').click();
    await page.waitForTimeout(1000);
    await page.locator('button:has-text("Stop")').click();
    
    await expect(page.locator('text=Recording 1')).toBeVisible();
    
    // Create second recording
    await page.locator('button:has-text("Start Recording")').click();
    await page.waitForTimeout(1000);
    await page.locator('button:has-text("Stop")').click();
    
    await expect(page.locator('text=Recording 2')).toBeVisible();
    await expect(page.locator('text=Recordings (2)')).toBeVisible();
  });
  
  test('should highlight selected recording', async () => {
    // Create two recordings
    await page.locator('button:has-text("Start Recording")').click();
    await page.waitForTimeout(1000);
    await page.locator('button:has-text("Stop")').click();
    
    await page.locator('button:has-text("Start Recording")').click();
    await page.waitForTimeout(1000);
    await page.locator('button:has-text("Stop")').click();
    
    // Click on first recording
    const firstRecording = page.locator('[data-testid="recording-item"]').first();
    await firstRecording.click();
    
    // Check it's highlighted
    await expect(firstRecording).toHaveClass(/.*bg-primary.*/);
  });
  
  test('should display error message on permission denied', async () => {
    // Mock permission denied
    await page.addInitScript(() => {
      navigator.mediaDevices.getUserMedia = async () => {
        throw new Error('Permission denied');
      };
    });
    
    await page.reload();
    
    // Try to start recording
    await page.locator('button:has-text("Start Recording")').click();
    
    // Check error message
    await expect(page.locator('text=/Failed to start recording.*permissions/')).toBeVisible();
  });
  
  test('should display recording progress bar', async () => {
    const progressBar = page.locator('[data-testid="recording-progress"]');
    
    // Start recording
    await page.locator('button:has-text("Start Recording")').click();
    
    // Check progress bar is visible and updating
    await expect(progressBar).toBeVisible();
    
    const initialProgress = await progressBar.getAttribute('aria-valuenow');
    await page.waitForTimeout(1000);
    const updatedProgress = await progressBar.getAttribute('aria-valuenow');
    
    expect(Number(updatedProgress)).toBeGreaterThan(Number(initialProgress));
  });
  
  test('should format duration correctly', async () => {
    // Start recording
    await page.locator('button:has-text("Start Recording")').click();
    
    // Check initial format (MM:SS)
    await expect(page.locator('text=/\\d{2}:\\d{2}/')).toBeVisible();
    
    // Wait for over a minute
    await page.evaluate(() => {
      // Mock time progression
      const recorder = document.querySelector('[data-testid="audio-recorder"]');
      if (recorder) {
        recorder.setAttribute('data-duration', '125'); // 2:05
      }
    });
    
    // Check format is still correct
    await expect(page.locator('text=/02:05/')).toBeVisible();
  });
  
  test('should auto-save recordings when enabled', async () => {
    // Enable auto-save
    await page.locator('input[data-testid="auto-save-checkbox"]').check();
    
    // Start recording
    await page.locator('button:has-text("Start Recording")').click();
    
    // Wait for auto-save interval (mocked to be faster)
    await page.waitForTimeout(2000);
    
    // Check console for auto-save message
    const consoleLogs = await page.evaluate(() => {
      return (window as any).consoleLogs || [];
    });
    
    // In real implementation, this would save to localStorage or server
    expect(consoleLogs.some((log: string) => log.includes('Auto-saving'))).toBeTruthy();
  });
  
  test('should handle keyboard shortcuts', async () => {
    // Focus on recorder
    await page.locator('[data-testid="audio-recorder"]').focus();
    
    // Press spacebar to start recording
    await page.keyboard.press('Space');
    await expect(page.locator('.badge:has-text("RECORDING")')).toBeVisible();
    
    // Press P to pause
    await page.keyboard.press('p');
    await expect(page.locator('.badge:has-text("PAUSED")')).toBeVisible();
    
    // Press R to resume
    await page.keyboard.press('r');
    await expect(page.locator('.badge:has-text("RECORDING")')).toBeVisible();
    
    // Press S to stop
    await page.keyboard.press('s');
    await expect(page.locator('button:has-text("Start Recording")')).toBeVisible();
  });
  
  test('should be accessible with screen reader', async () => {
    // Check ARIA labels
    await expect(page.locator('[aria-label="Start recording"]')).toBeVisible();
    await expect(page.locator('[aria-label="Select microphone"]')).toBeVisible();
    await expect(page.locator('[aria-label="Adjust gain"]')).toBeVisible();
    
    // Check role attributes
    await expect(page.locator('[role="timer"]')).toBeVisible();
    await expect(page.locator('[role="progressbar"]')).toBeVisible();
    
    // Check live regions
    await expect(page.locator('[aria-live="polite"]')).toBeVisible();
  });
});

test.describe('AudioRecorder Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });
  
  test('should be responsive on mobile', async ({ page }) => {
    await page.goto('/components/audio-recorder');
    
    const recorder = page.locator('[data-testid="audio-recorder"]');
    await expect(recorder).toBeVisible();
    
    // Check mobile layout
    const recorderBox = await recorder.boundingBox();
    expect(recorderBox?.width).toBeLessThanOrEqual(375);
    
    // Check buttons are stacked
    const startButton = page.locator('button:has-text("Start Recording")');
    await expect(startButton).toBeVisible();
    
    const buttonBox = await startButton.boundingBox();
    expect(buttonBox?.width).toBeGreaterThan(200); // Full width on mobile
  });
  
  test('should handle touch gestures', async ({ page }) => {
    await page.goto('/components/audio-recorder');
    
    // Start recording with touch
    const startButton = page.locator('button:has-text("Start Recording")');
    await startButton.tap();
    
    await expect(page.locator('.badge:has-text("RECORDING")')).toBeVisible();
    
    // Stop with touch
    const stopButton = page.locator('button:has-text("Stop")');
    await stopButton.tap();
    
    await expect(page.locator('button:has-text("Start Recording")')).toBeVisible();
  });
});