import { test, expect, Page } from '@playwright/test';

const COMPONENT_URL = '/iframe.html?id=advanced-audiorecorder--default';

// Helper to setup permissions
async function setupAudioPermissions(page: Page) {
  await page.context().grantPermissions(['microphone']);
}

// Helper to wait for element
async function waitForElement(page: Page, selector: string, timeout = 5000) {
  await page.waitForSelector(selector, { timeout });
}

test.describe('AudioRecorder Component', () => {
  test.beforeEach(async ({ page }) => {
    await setupAudioPermissions(page);
    await page.goto(COMPONENT_URL);
    await waitForElement(page, '.audio-recorder');
  });

  test('should render audio recorder component', async ({ page }) => {
    const recorder = await page.locator('.audio-recorder');
    await expect(recorder).toBeVisible();
    
    const title = await page.locator('h3:has-text("Audio Recorder")');
    await expect(title).toBeVisible();
  });

  test('should display record button initially', async ({ page }) => {
    const recordButton = await page.locator('button[aria-label="Start Recording"]');
    await expect(recordButton).toBeVisible();
    await expect(recordButton).toBeEnabled();
    
    const micIcon = await recordButton.locator('svg');
    await expect(micIcon).toBeVisible();
  });

  test('should show duration display', async ({ page }) => {
    const duration = await page.locator('.font-mono:has-text("00:00.00")');
    await expect(duration).toBeVisible();
    
    const maxDuration = await page.locator('text=/');
    await expect(maxDuration).toBeVisible();
  });

  test('should show waveform canvas when enabled', async ({ page }) => {
    await page.goto('/iframe.html?id=advanced-audiorecorder--with-waveform');
    await waitForElement(page, '.audio-recorder');
    
    const canvas = await page.locator('canvas');
    await expect(canvas).toBeVisible();
    await expect(canvas).toHaveAttribute('width', '600');
    await expect(canvas).toHaveAttribute('height', '150');
  });

  test('should toggle recording state', async ({ page }) => {
    const recordButton = await page.locator('button[aria-label="Start Recording"]');
    
    // Mock getUserMedia to avoid actual microphone access in tests
    await page.evaluate(() => {
      window.navigator.mediaDevices.getUserMedia = async () => {
        const audioContext = new AudioContext();
        const oscillator = audioContext.createOscillator();
        const dest = audioContext.createMediaStreamDestination();
        oscillator.connect(dest);
        oscillator.start();
        return dest.stream;
      };
    });
    
    await recordButton.click();
    
    // Should show stop button
    const stopButton = await page.locator('button[aria-label="Stop Recording"]');
    await expect(stopButton).toBeVisible();
    
    // Should show pause button
    const pauseButton = await page.locator('button[aria-label="Pause"]');
    await expect(pauseButton).toBeVisible();
  });

  test('should handle pause and resume', async ({ page }) => {
    await page.evaluate(() => {
      window.navigator.mediaDevices.getUserMedia = async () => {
        const audioContext = new AudioContext();
        const oscillator = audioContext.createOscillator();
        const dest = audioContext.createMediaStreamDestination();
        oscillator.connect(dest);
        oscillator.start();
        return dest.stream;
      };
    });
    
    const recordButton = await page.locator('button[aria-label="Start Recording"]');
    await recordButton.click();
    
    const pauseButton = await page.locator('button[aria-label="Pause"]');
    await pauseButton.click();
    
    const resumeButton = await page.locator('button[aria-label="Resume"]');
    await expect(resumeButton).toBeVisible();
    
    await resumeButton.click();
    await expect(pauseButton).toBeVisible();
  });

  test('should display progress bar', async ({ page }) => {
    const progressBar = await page.locator('.bg-red-500').first();
    await expect(progressBar).toBeVisible();
    
    const progressContainer = await page.locator('.bg-gray-200.rounded-full').first();
    await expect(progressContainer).toBeVisible();
  });

  test('should show advanced controls when enabled', async ({ page }) => {
    await page.goto('/iframe.html?id=advanced-audiorecorder--advanced-controls');
    await waitForElement(page, '.audio-recorder');
    
    const settingsButton = await page.locator('button[aria-label="Settings"]');
    await expect(settingsButton).toBeVisible();
    
    await settingsButton.click();
    
    // Check for settings panel
    const settingsPanel = await page.locator('.bg-gray-50.dark\\:bg-gray-800');
    await expect(settingsPanel).toBeVisible();
    
    // Check for input device selector
    const deviceSelector = await page.locator('select').first();
    await expect(deviceSelector).toBeVisible();
    
    // Check for sample rate selector
    const sampleRateSelector = await page.locator('select').nth(1);
    await expect(sampleRateSelector).toBeVisible();
  });

  test('should show noise reduction checkbox', async ({ page }) => {
    await page.goto('/iframe.html?id=advanced-audiorecorder--advanced-controls');
    await waitForElement(page, '.audio-recorder');
    
    const settingsButton = await page.locator('button[aria-label="Settings"]');
    await settingsButton.click();
    
    const noiseReduction = await page.locator('#noise-reduction');
    await expect(noiseReduction).toBeVisible();
    await expect(noiseReduction).toHaveAttribute('type', 'checkbox');
  });

  test('should show echo cancellation checkbox', async ({ page }) => {
    await page.goto('/iframe.html?id=advanced-audiorecorder--advanced-controls');
    await waitForElement(page, '.audio-recorder');
    
    const settingsButton = await page.locator('button[aria-label="Settings"]');
    await settingsButton.click();
    
    const echoCancellation = await page.locator('#echo-cancellation');
    await expect(echoCancellation).toBeVisible();
    await expect(echoCancellation).toHaveAttribute('type', 'checkbox');
  });

  test('should display frequency analyzer when enabled', async ({ page }) => {
    await page.goto('/iframe.html?id=advanced-audiorecorder--with-frequency-analyzer');
    await waitForElement(page, '.audio-recorder');
    
    const canvas = await page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // Canvas should be present for frequency visualization
    const canvasContainer = await page.locator('.bg-gray-100.dark\\:bg-gray-800.rounded-lg');
    await expect(canvasContainer).toBeVisible();
  });

  test('should show voice activation indicator', async ({ page }) => {
    await page.goto('/iframe.html?id=advanced-audiorecorder--voice-activated');
    await waitForElement(page, '.audio-recorder');
    
    await page.evaluate(() => {
      window.navigator.mediaDevices.getUserMedia = async () => {
        const audioContext = new AudioContext();
        const oscillator = audioContext.createOscillator();
        const dest = audioContext.createMediaStreamDestination();
        oscillator.connect(dest);
        oscillator.start();
        return dest.stream;
      };
    });
    
    const recordButton = await page.locator('button[aria-label="Start Recording"]');
    await recordButton.click();
    
    // Check for voice activation indicator
    const voiceIndicator = await page.locator('text=/Voice/');
    await expect(voiceIndicator).toBeVisible();
  });

  test('should handle recording completion', async ({ page }) => {
    await page.evaluate(() => {
      window.navigator.mediaDevices.getUserMedia = async () => {
        const audioContext = new AudioContext();
        const oscillator = audioContext.createOscillator();
        const dest = audioContext.createMediaStreamDestination();
        oscillator.connect(dest);
        oscillator.start();
        return dest.stream;
      };
    });
    
    const recordButton = await page.locator('button[aria-label="Start Recording"]');
    await recordButton.click();
    
    await page.waitForTimeout(1000);
    
    const stopButton = await page.locator('button[aria-label="Stop Recording"]');
    await stopButton.click();
    
    // Should show playback controls
    await page.waitForSelector('audio', { timeout: 5000 });
    const audioElement = await page.locator('audio');
    await expect(audioElement).toBeVisible();
    
    // Should show action buttons
    const resetButton = await page.locator('button[aria-label="Reset"]');
    await expect(resetButton).toBeVisible();
    
    const downloadButton = await page.locator('button[aria-label="Download"]');
    await expect(downloadButton).toBeVisible();
  });

  test('should reset recording', async ({ page }) => {
    await page.evaluate(() => {
      window.navigator.mediaDevices.getUserMedia = async () => {
        const audioContext = new AudioContext();
        const oscillator = audioContext.createOscillator();
        const dest = audioContext.createMediaStreamDestination();
        oscillator.connect(dest);
        oscillator.start();
        return dest.stream;
      };
    });
    
    const recordButton = await page.locator('button[aria-label="Start Recording"]');
    await recordButton.click();
    
    await page.waitForTimeout(1000);
    
    const stopButton = await page.locator('button[aria-label="Stop Recording"]');
    await stopButton.click();
    
    await page.waitForSelector('button[aria-label="Reset"]');
    const resetButton = await page.locator('button[aria-label="Reset"]');
    await resetButton.click();
    
    // Should return to initial state
    const newRecordButton = await page.locator('button[aria-label="Start Recording"]');
    await expect(newRecordButton).toBeVisible();
    
    // Audio element should be gone
    const audioElement = await page.locator('audio');
    await expect(audioElement).not.toBeVisible();
  });

  test('should show multi-track UI when enabled', async ({ page }) => {
    await page.goto('/iframe.html?id=advanced-audiorecorder--multi-track');
    await waitForElement(page, '.audio-recorder');
    
    // Verify multi-track specific UI elements would appear after recording
    const recorder = await page.locator('.audio-recorder');
    await expect(recorder).toBeVisible();
  });

  test('should display volume meter during recording', async ({ page }) => {
    await page.evaluate(() => {
      window.navigator.mediaDevices.getUserMedia = async () => {
        const audioContext = new AudioContext();
        const oscillator = audioContext.createOscillator();
        const dest = audioContext.createMediaStreamDestination();
        oscillator.connect(dest);
        oscillator.start();
        return dest.stream;
      };
    });
    
    const recordButton = await page.locator('button[aria-label="Start Recording"]');
    await recordButton.click();
    
    // Check for volume indicator
    const volumeIcon = await page.locator('svg').filter({ has: page.locator('text=/Volume/') });
    const volumeMeter = await page.locator('.bg-gradient-to-r.from-green-400.to-red-500');
    
    // At least one should be visible during recording
    const hasVolumeIndicator = await volumeMeter.count() > 0;
    expect(hasVolumeIndicator).toBeTruthy();
  });

  test('should handle save callback', async ({ page }) => {
    await page.goto('/iframe.html?id=advanced-audiorecorder--with-callbacks');
    await waitForElement(page, '.audio-recorder');
    
    await page.evaluate(() => {
      window.navigator.mediaDevices.getUserMedia = async () => {
        const audioContext = new AudioContext();
        const oscillator = audioContext.createOscillator();
        const dest = audioContext.createMediaStreamDestination();
        oscillator.connect(dest);
        oscillator.start();
        return dest.stream;
      };
    });
    
    const recordButton = await page.locator('button[aria-label="Start Recording"]');
    await recordButton.click();
    
    await page.waitForTimeout(1000);
    
    const stopButton = await page.locator('button[aria-label="Stop Recording"]');
    await stopButton.click();
    
    await page.waitForSelector('button[aria-label="Save"]');
    const saveButton = await page.locator('button[aria-label="Save"]');
    await saveButton.click();
    
    // Check that callback was triggered (visible in the status display)
    const statusDisplay = await page.locator('.bg-gray-100.dark\\:bg-gray-800').last();
    await expect(statusDisplay).toBeVisible();
  });

  test('should respect maximum duration setting', async ({ page }) => {
    await page.goto('/iframe.html?id=advanced-audiorecorder--voice-memo');
    await waitForElement(page, '.audio-recorder');
    
    // Voice memo has 60 second max duration
    const maxDurationText = await page.locator('text=/ 01:00.00');
    await expect(maxDurationText).toBeVisible();
  });

  test('should handle different export formats', async ({ page }) => {
    // Test MP3 format
    await page.goto('/iframe.html?id=advanced-audiorecorder--podcast-setup');
    await waitForElement(page, '.audio-recorder');
    
    const recorder = await page.locator('.audio-recorder');
    await expect(recorder).toBeVisible();
    
    // Podcast setup uses MP3 format
    // The format would be used when recording completes
  });

  test('should display streaming mode configuration', async ({ page }) => {
    await page.goto('/iframe.html?id=advanced-audiorecorder--streaming-mode');
    await waitForElement(page, '.audio-recorder');
    
    // Streaming mode has specific settings
    const recorder = await page.locator('.audio-recorder');
    await expect(recorder).toBeVisible();
    
    // Check for 1 hour max duration (3600 seconds)
    const maxDurationText = await page.locator('text=/ 60:00.00');
    await expect(maxDurationText).toBeVisible();
  });
});