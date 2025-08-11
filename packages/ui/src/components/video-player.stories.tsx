import type { Meta, StoryObj } from '@storybook/react';
import { VideoPlayer } from './video-player';

const meta = {
  title: 'Media/VideoPlayer',
  component: VideoPlayer,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Advanced video player with full controls, playlists, and accessibility features.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    sources: {
      description: 'Video sources with quality options'
    },
    autoPlay: {
      control: 'boolean',
      description: 'Auto-play video on load'
    },
    loop: {
      control: 'boolean',
      description: 'Loop video playback'
    },
    muted: {
      control: 'boolean',
      description: 'Start muted'
    },
    controls: {
      control: 'boolean',
      description: 'Show controls'
    },
    customControls: {
      control: 'boolean',
      description: 'Use custom controls instead of native'
    },
    theme: {
      control: 'select',
      options: ['light', 'dark', 'auto'],
      description: 'Player theme'
    },
    showDownload: {
      control: 'boolean',
      description: 'Show download button'
    },
    showShare: {
      control: 'boolean',
      description: 'Show share button'
    }
  }
} satisfies Meta<typeof VideoPlayer>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample video sources
const sampleSources = [
  {
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    type: 'video/mp4',
    quality: '720p' as const,
    label: 'HD 720p'
  },
  {
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    type: 'video/mp4',
    quality: '480p' as const,
    label: 'SD 480p'
  },
  {
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    type: 'video/mp4',
    quality: '360p' as const,
    label: 'SD 360p'
  }
];

const sampleSubtitles = [
  {
    src: '/subtitles/en.vtt',
    srclang: 'en',
    label: 'English',
    default: true
  },
  {
    src: '/subtitles/fr.vtt',
    srclang: 'fr',
    label: 'Français'
  },
  {
    src: '/subtitles/es.vtt',
    srclang: 'es',
    label: 'Español'
  }
];

const sampleChapters = [
  {
    title: 'Introduction',
    startTime: 0,
    endTime: 60
  },
  {
    title: 'Main Content',
    startTime: 60,
    endTime: 300
  },
  {
    title: 'Conclusion',
    startTime: 300
  }
];

const samplePlaylist = [
  {
    id: '1',
    title: 'Big Buck Bunny',
    thumbnail: 'https://peach.blender.org/wp-content/uploads/bbb-splash.png',
    duration: 596,
    sources: sampleSources
  },
  {
    id: '2',
    title: 'Sintel',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Sintel_poster.jpg/220px-Sintel_poster.jpg',
    duration: 888,
    sources: [{
      src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      type: 'video/mp4',
      quality: '720p' as const
    }]
  },
  {
    id: '3',
    title: 'Tears of Steel',
    thumbnail: 'https://mango.blender.org/wp-content/gallery/production-stills/06.jpg',
    duration: 734,
    sources: [{
      src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      type: 'video/mp4',
      quality: '720p' as const
    }]
  }
];

export const Default: Story = {
  args: {
    sources: sampleSources,
    poster: 'https://peach.blender.org/wp-content/uploads/bbb-splash.png',
    width: 800,
    height: 450
  }
};

export const BasicPlayer: Story = {
  args: {
    sources: [{
      src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      type: 'video/mp4'
    }],
    poster: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg',
    customControls: false,
    width: 640,
    height: 360
  }
};

export const WithSubtitles: Story = {
  args: {
    sources: sampleSources,
    subtitles: sampleSubtitles,
    poster: 'https://peach.blender.org/wp-content/uploads/bbb-splash.png',
    width: 800,
    height: 450
  }
};

export const WithChapters: Story = {
  args: {
    sources: sampleSources,
    chapters: sampleChapters,
    poster: 'https://peach.blender.org/wp-content/uploads/bbb-splash.png',
    width: 800,
    height: 450
  }
};

export const WithPlaylist: Story = {
  args: {
    sources: samplePlaylist[0].sources,
    playlist: samplePlaylist,
    currentPlaylistIndex: 0,
    poster: samplePlaylist[0].thumbnail,
    width: 900,
    height: 506
  }
};

export const LiveStream: Story = {
  args: {
    sources: [{
      src: 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8',
      type: 'application/x-mpegURL'
    }],
    poster: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800',
    width: 800,
    height: 450
  }
};

export const MultipleQualities: Story = {
  args: {
    sources: [
      {
        src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        type: 'video/mp4',
        quality: '1080p' as const,
        label: 'Full HD 1080p'
      },
      {
        src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        type: 'video/mp4',
        quality: '720p' as const,
        label: 'HD 720p'
      },
      {
        src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        type: 'video/mp4',
        quality: '480p' as const,
        label: 'SD 480p'
      },
      {
        src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        type: 'video/mp4',
        quality: '360p' as const,
        label: 'SD 360p'
      }
    ],
    poster: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg',
    width: 800,
    height: 450
  }
};

export const AudioOnly: Story = {
  args: {
    sources: [{
      src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      type: 'audio/mp3'
    }],
    poster: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    width: 600,
    height: 100
  }
};

export const WithDownloadAndShare: Story = {
  args: {
    sources: sampleSources,
    poster: 'https://peach.blender.org/wp-content/uploads/bbb-splash.png',
    showDownload: true,
    showShare: true,
    width: 800,
    height: 450
  }
};

export const AutoplayMuted: Story = {
  args: {
    sources: [{
      src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      type: 'video/mp4'
    }],
    poster: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg',
    autoPlay: true,
    muted: true,
    width: 800,
    height: 450
  }
};

export const LightTheme: Story = {
  args: {
    sources: sampleSources,
    poster: 'https://peach.blender.org/wp-content/uploads/bbb-splash.png',
    theme: 'light',
    width: 800,
    height: 450
  }
};

export const MobileResponsive: Story = {
  args: {
    sources: [{
      src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      type: 'video/mp4'
    }],
    poster: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerFun.jpg',
    width: '100%',
    height: 'auto'
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1'
    }
  }
};

export const FullFeatures: Story = {
  args: {
    sources: [
      {
        src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        type: 'video/mp4',
        quality: '1080p' as const,
        label: 'Full HD 1080p'
      },
      {
        src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        type: 'video/mp4',
        quality: '720p' as const,
        label: 'HD 720p'
      }
    ],
    poster: 'https://peach.blender.org/wp-content/uploads/bbb-splash.png',
    subtitles: sampleSubtitles,
    chapters: sampleChapters,
    playlist: samplePlaylist,
    showDownload: true,
    showShare: true,
    width: 900,
    height: 506,
    onPlay: () => console.log('Video playing'),
    onPause: () => console.log('Video paused'),
    onEnded: () => console.log('Video ended'),
    onTimeUpdate: (current, duration) => console.log(`Time: ${current}/${duration}`),
    onVolumeChange: (volume) => console.log(`Volume: ${volume}`),
    onPlaybackRateChange: (rate) => console.log(`Playback rate: ${rate}x`),
    onQualityChange: (quality) => console.log(`Quality: ${quality}`),
    onSubtitleChange: (lang) => console.log(`Subtitle: ${lang}`),
    onPlaylistItemChange: (index) => console.log(`Playlist item: ${index}`)
  }
};

export const InteractivePlayground: Story = {
  args: {
    sources: sampleSources,
    poster: 'https://peach.blender.org/wp-content/uploads/bbb-splash.png',
    width: 800,
    height: 450,
    controls: true,
    customControls: true,
    autoPlay: false,
    loop: false,
    muted: false,
    showDownload: true,
    showShare: true,
    theme: 'dark'
  },
  render: (args) => {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Video Player Playground</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Interact with the controls to test all features. Use keyboard shortcuts:
          </p>
          <ul className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            <li>• Space/K: Play/Pause</li>
            <li>• ←/→: Skip 10s</li>
            <li>• ↑/↓: Volume</li>
            <li>• F: Fullscreen</li>
            <li>• M: Mute</li>
            <li>• P: Picture-in-Picture</li>
            <li>• C: Toggle Subtitles</li>
          </ul>
        </div>
        <VideoPlayer {...args} />
      </div>
    );
  }
};