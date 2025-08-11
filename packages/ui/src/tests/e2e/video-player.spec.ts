import { test, expect } from '@playwright/test';

test.describe('VideoPlayer Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/iframe.html?args=&id=media-videoplayer--default&viewMode=story');
    await page.waitForSelector('video', { state: 'visible' });
  });

  test('should render video element with correct attributes', async ({ page }) => {
    const video = page.locator('video');
    await expect(video).toBeVisible();
    
    // Check video attributes
    const poster = await video.getAttribute('poster');
    expect(poster).toBeTruthy();
    
    // Check video sources
    const sources = await video.locator('source').count();
    expect(sources).toBeGreaterThan(0);
  });

  test('should toggle play/pause on click', async ({ page }) => {
    const video = page.locator('video');
    const playButton = page.locator('[aria-label="Play"], [aria-label="Pause"]').first();
    
    // Initially paused
    await expect(playButton).toHaveAttribute('aria-label', 'Play');
    
    // Click to play
    await playButton.click();
    await expect(playButton).toHaveAttribute('aria-label', 'Pause');
    
    // Click to pause
    await playButton.click();
    await expect(playButton).toHaveAttribute('aria-label', 'Play');
  });

  test('should control volume', async ({ page }) => {
    const volumeButton = page.locator('[aria-label="Mute"], [aria-label="Unmute"]').first();
    const volumeSlider = page.locator('input[type="range"][aria-label="Volume"]');
    
    // Hover to show volume slider
    await volumeButton.hover();
    await page.waitForTimeout(100);
    
    // Check volume slider exists
    await expect(volumeSlider).toBeVisible();
    
    // Click mute button
    await volumeButton.click();
    await expect(volumeButton).toHaveAttribute('aria-label', 'Unmute');
    
    // Click unmute
    await volumeButton.click();
    await expect(volumeButton).toHaveAttribute('aria-label', 'Mute');
  });

  test('should handle fullscreen toggle', async ({ page }) => {
    const fullscreenButton = page.locator('[aria-label="Fullscreen"], [aria-label="Exit Fullscreen"]').first();
    
    // Check fullscreen button exists
    await expect(fullscreenButton).toBeVisible();
    await expect(fullscreenButton).toHaveAttribute('aria-label', 'Fullscreen');
    
    // Note: Actual fullscreen API might not work in test environment
    // Just verify button exists and is clickable
    await fullscreenButton.click();
  });

  test('should show/hide controls on hover', async ({ page }) => {
    const container = page.locator('.group').first();
    const controls = page.locator('.absolute.inset-0').first();
    
    // Controls should be visible initially
    await expect(controls).toHaveCSS('opacity', '1');
    
    // Move mouse away and wait
    await page.mouse.move(0, 0);
    await page.waitForTimeout(3500);
    
    // Move mouse back to show controls
    await container.hover();
    await expect(controls).toHaveCSS('opacity', '1');
  });

  test('should display progress bar and time', async ({ page }) => {
    const progressBar = page.locator('.relative.h-1.bg-white\\/20').first();
    const currentTime = page.locator('span').filter({ hasText: /^\d+:\d+$/ }).first();
    const duration = page.locator('span').filter({ hasText: /^\d+:\d+$/ }).last();
    
    await expect(progressBar).toBeVisible();
    await expect(currentTime).toBeVisible();
    await expect(duration).toBeVisible();
    
    // Check time format
    await expect(currentTime).toHaveText(/^\d+:\d+$/);
    await expect(duration).toHaveText(/^\d+:\d+$/);
  });

  test('should handle skip forward/backward', async ({ page }) => {
    const skipBackward = page.locator('[aria-label="Skip Backward"]');
    const skipForward = page.locator('[aria-label="Skip Forward"]');
    
    await expect(skipBackward).toBeVisible();
    await expect(skipForward).toBeVisible();
    
    // Test skip buttons are clickable
    await skipBackward.click();
    await skipForward.click();
  });

  test('should show settings menu', async ({ page }) => {
    const settingsButton = page.locator('[aria-label="Settings"]');
    
    await expect(settingsButton).toBeVisible();
    await settingsButton.click();
    
    // Check settings menu appears
    const settingsMenu = page.locator('.absolute.bottom-full').filter({ hasText: 'Speed' });
    await expect(settingsMenu).toBeVisible();
    
    // Check playback speed options
    await expect(settingsMenu.locator('button', { hasText: '1x' })).toBeVisible();
    await expect(settingsMenu.locator('button', { hasText: '1.5x' })).toBeVisible();
    await expect(settingsMenu.locator('button', { hasText: '2x' })).toBeVisible();
  });

  test('should handle Picture-in-Picture button', async ({ page }) => {
    const pipButton = page.locator('[aria-label="Picture in Picture"]');
    
    await expect(pipButton).toBeVisible();
    
    // Check if PiP is supported (button should be enabled/disabled accordingly)
    const isDisabled = await pipButton.isDisabled();
    if (!isDisabled) {
      await pipButton.click();
      // Note: Actual PiP might not work in test environment
    }
  });

  test('should handle keyboard shortcuts', async ({ page }) => {
    const playButton = page.locator('[aria-label="Play"], [aria-label="Pause"]').first();
    
    // Test spacebar for play/pause
    await page.keyboard.press('Space');
    await expect(playButton).toHaveAttribute('aria-label', 'Pause');
    
    await page.keyboard.press('Space');
    await expect(playButton).toHaveAttribute('aria-label', 'Play');
    
    // Test arrow keys
    await page.keyboard.press('ArrowRight'); // Skip forward
    await page.keyboard.press('ArrowLeft');  // Skip backward
    await page.keyboard.press('ArrowUp');    // Volume up
    await page.keyboard.press('ArrowDown');  // Volume down
    
    // Test other shortcuts
    await page.keyboard.press('m'); // Mute
    await page.keyboard.press('f'); // Fullscreen
  });

  test('should display video with subtitles', async ({ page }) => {
    await page.goto('/iframe.html?args=&id=media-videoplayer--with-subtitles&viewMode=story');
    
    const subtitlesButton = page.locator('[aria-label="Subtitles"]');
    await expect(subtitlesButton).toBeVisible();
    
    // Click to show subtitle menu
    await subtitlesButton.click();
    
    const subtitleMenu = page.locator('.absolute.bottom-full').filter({ hasText: 'Off' });
    await expect(subtitleMenu).toBeVisible();
    
    // Check subtitle options
    await expect(subtitleMenu.locator('button', { hasText: 'English' })).toBeVisible();
    await expect(subtitleMenu.locator('button', { hasText: 'Français' })).toBeVisible();
    await expect(subtitleMenu.locator('button', { hasText: 'Español' })).toBeVisible();
  });

  test('should display chapters', async ({ page }) => {
    await page.goto('/iframe.html?args=&id=media-videoplayer--with-chapters&viewMode=story');
    
    // Check chapter markers on progress bar
    const chapterMarkers = page.locator('.absolute.top-1\\/2.-translate-y-1\\/2.w-1.h-3.bg-white\\/50');
    const markerCount = await chapterMarkers.count();
    expect(markerCount).toBeGreaterThan(0);
    
    // Check chapter title display
    const chapterTitle = page.locator('.text-sm.font-medium').first();
    await expect(chapterTitle).toBeVisible();
  });

  test('should handle playlist navigation', async ({ page }) => {
    await page.goto('/iframe.html?args=&id=media-videoplayer--with-playlist&viewMode=story');
    
    const prevButton = page.locator('[aria-label="Previous"]');
    const nextButton = page.locator('[aria-label="Next"]');
    
    // Initially on first item, prev should be disabled
    await expect(prevButton).toBeDisabled();
    await expect(nextButton).toBeEnabled();
    
    // Click next
    await nextButton.click();
    await page.waitForTimeout(500);
    
    // Now both should be enabled
    await expect(prevButton).toBeEnabled();
    await expect(nextButton).toBeEnabled();
  });

  test('should handle quality selection', async ({ page }) => {
    await page.goto('/iframe.html?args=&id=media-videoplayer--multiple-qualities&viewMode=story');
    
    const settingsButton = page.locator('[aria-label="Settings"]');
    await settingsButton.click();
    
    const settingsMenu = page.locator('.absolute.bottom-full').last();
    await expect(settingsMenu).toBeVisible();
    
    // Check quality options
    await expect(settingsMenu.locator('button', { hasText: 'Auto' })).toBeVisible();
    await expect(settingsMenu.locator('button', { hasText: '1080p' })).toBeVisible();
    await expect(settingsMenu.locator('button', { hasText: '720p' })).toBeVisible();
    await expect(settingsMenu.locator('button', { hasText: '480p' })).toBeVisible();
    
    // Select a quality
    await settingsMenu.locator('button', { hasText: '720p' }).click();
  });

  test('should show download and share buttons', async ({ page }) => {
    await page.goto('/iframe.html?args=&id=media-videoplayer--with-download-and-share&viewMode=story');
    
    const downloadButton = page.locator('[aria-label="Download"]');
    const shareButton = page.locator('[aria-label="Share"]');
    
    await expect(downloadButton).toBeVisible();
    await expect(shareButton).toBeVisible();
  });

  test('should handle autoplay with muted', async ({ page }) => {
    await page.goto('/iframe.html?args=&id=media-videoplayer--autoplay-muted&viewMode=story');
    
    // Video should start playing automatically
    const playButton = page.locator('[aria-label="Play"], [aria-label="Pause"]').first();
    await expect(playButton).toHaveAttribute('aria-label', 'Pause');
    
    // Should be muted
    const muteButton = page.locator('[aria-label="Mute"], [aria-label="Unmute"]').first();
    await expect(muteButton).toHaveAttribute('aria-label', 'Unmute');
  });

  test('should support light theme', async ({ page }) => {
    await page.goto('/iframe.html?args=&id=media-videoplayer--light-theme&viewMode=story');
    
    const container = page.locator('.relative.group').first();
    await expect(container).toHaveClass(/bg-white/);
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/iframe.html?args=&id=media-videoplayer--mobile-responsive&viewMode=story');
    
    const video = page.locator('video');
    await expect(video).toBeVisible();
    
    // Check controls are accessible on mobile
    const playButton = page.locator('[aria-label="Play"], [aria-label="Pause"]').first();
    await expect(playButton).toBeVisible();
    
    // Controls should be appropriately sized for mobile
    const container = page.locator('.relative.group').first();
    const containerWidth = await container.boundingBox();
    expect(containerWidth?.width).toBeLessThanOrEqual(375);
  });

  test('should track all events in full features mode', async ({ page }) => {
    await page.goto('/iframe.html?args=&id=media-videoplayer--full-features&viewMode=story');
    
    // Set up console log monitoring
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'log') {
        consoleLogs.push(msg.text());
      }
    });
    
    // Test various interactions
    const playButton = page.locator('[aria-label="Play"], [aria-label="Pause"]').first();
    await playButton.click();
    await page.waitForTimeout(500);
    
    // Check if events were logged
    expect(consoleLogs.some(log => log.includes('playing'))).toBeTruthy();
    
    // Test pause
    await playButton.click();
    await page.waitForTimeout(100);
    
    // Test volume change
    const volumeSlider = page.locator('input[type="range"][aria-label="Volume"]');
    const volumeButton = page.locator('[aria-label="Mute"], [aria-label="Unmute"]').first();
    await volumeButton.hover();
    await volumeSlider.fill('0.5');
    
    // Test settings
    const settingsButton = page.locator('[aria-label="Settings"]');
    await settingsButton.click();
    
    const speedButton = page.locator('button', { hasText: '1.5x' });
    await speedButton.click();
  });

  test('should display interactive playground with instructions', async ({ page }) => {
    await page.goto('/iframe.html?args=&id=media-videoplayer--interactive-playground&viewMode=story');
    
    // Check instructions are visible
    const instructions = page.locator('.p-4.bg-gray-100');
    await expect(instructions).toBeVisible();
    await expect(instructions).toContainText('Video Player Playground');
    await expect(instructions).toContainText('Space/K: Play/Pause');
    
    // Check video player is rendered
    const video = page.locator('video');
    await expect(video).toBeVisible();
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Test with invalid source
    await page.goto('/iframe.html?args=&id=media-videoplayer--default&viewMode=story');
    
    // Override video source with invalid URL
    await page.evaluate(() => {
      const video = document.querySelector('video');
      if (video) {
        video.src = 'invalid-url.mp4';
        video.load();
      }
    });
    
    // Video should handle error without crashing
    const video = page.locator('video');
    await expect(video).toBeVisible();
  });
});