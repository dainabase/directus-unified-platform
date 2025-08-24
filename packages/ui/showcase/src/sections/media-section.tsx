import React, { useState } from 'react';
import { 
  Mic,
  Play,
  Pause,
  Square,
  Video,
  Crop,
  Code2,
  Type,
  Move,
  Layers,
  ArrowDown,
  Columns,
  List,
  Image,
  Music,
  Upload,
  Volume2
} from 'lucide-react';

export const MediaSection = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState('audio');

  const mediaComponents = [
    {
      id: 'audio',
      name: 'Audio Recorder',
      icon: Mic,
      description: 'Record and playback audio with waveform visualization',
      demo: (
        <div className="space-y-4">
          <div className="bg-gray-100 rounded-lg h-24 flex items-center justify-center">
            <div className="flex items-center gap-1">
              {[...Array(20)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-1 bg-gray-600 rounded-full transition-all ${isRecording ? 'animate-pulse' : ''}`}
                  style={{ height: `${Math.random() * 60 + 20}px` }}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-center gap-3">
            <button 
              onClick={() => setIsRecording(!isRecording)}
              className={`modern-button ${isRecording ? 'modern-button-secondary' : 'modern-button-primary'}`}
            >
              {isRecording ? <Square size={16} /> : <Mic size={16} />}
              {isRecording ? 'Stop' : 'Record'}
            </button>
            <button className="modern-button modern-button-ghost">
              <Play size={16} /> Play
            </button>
          </div>
        </div>
      )
    },
    {
      id: 'video',
      name: 'Video Player',
      icon: Video,
      description: 'Advanced video player with controls',
      demo: (
        <div className="bg-gray-900 rounded-lg aspect-video relative overflow-hidden">
          <div className="absolute inset-0 video-placeholder opacity-20"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center hover:bg-white/30 transition-all hover:scale-110"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 text-white" />
              ) : (
                <Play className="w-8 h-8 text-white ml-1" />
              )}
            </button>
          </div>
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
            <div className="bg-black/50 backdrop-blur rounded-full px-3 py-1">
              <span className="text-white text-sm font-medium">LIVE</span>
            </div>
            <div className="bg-black/50 backdrop-blur rounded-full px-3 py-1">
              <span className="text-white text-sm">HD</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent p-4">
            <div className="mb-2">
              <h4 className="text-white font-medium">Design System Tutorial</h4>
              <p className="text-white/70 text-sm">Building modern UI components</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-white hover:scale-110 transition-transform">
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>
              <div className="flex-1 h-1 bg-white/30 rounded-full cursor-pointer">
                <div className="w-1/3 h-1 bg-white rounded-full transition-all"></div>
              </div>
              <span className="text-white text-sm font-mono">1:23 / 4:56</span>
              <button className="text-white hover:scale-110 transition-transform">
                <Volume2 size={20} />
              </button>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'cropper',
      name: 'Image Cropper',
      icon: Crop,
      description: 'Crop and resize images with aspect ratio control',
      demo: (
        <div className="space-y-4">
          <div className="bg-gray-100 rounded-lg aspect-video relative overflow-hidden">
            <div className="absolute inset-4 border-2 border-dashed border-gray-400 rounded">
              <div className="absolute -top-1 -left-1 w-3 h-3 bg-gray-400 rounded-full"></div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gray-400 rounded-full"></div>
              <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-gray-400 rounded-full"></div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gray-400 rounded-full"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Image className="w-12 h-12 text-gray-400" />
            </div>
          </div>
          <div className="flex gap-2 justify-center">
            <button className="modern-button modern-button-secondary">16:9</button>
            <button className="modern-button modern-button-secondary">4:3</button>
            <button className="modern-button modern-button-secondary">1:1</button>
            <button className="modern-button modern-button-primary">
              <Crop size={16} /> Apply Crop
            </button>
          </div>
        </div>
      )
    },
    {
      id: 'code',
      name: 'Code Editor',
      icon: Code2,
      description: 'Syntax-highlighted code editor with language support',
      demo: (
        <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
            <span className="text-gray-500 text-xs ml-auto">TypeScript</span>
          </div>
          <pre className="text-gray-300">
            <span className="text-gray-100">const</span>{' '}
            <span className="text-gray-200">Component</span>{' = '}
            <span className="text-gray-300">{'() =>'}</span>{' {'}
            {'\n  '}
            <span className="text-gray-100">return</span>{' '}
            <span className="text-gray-500">{'<'}</span>
            <span className="text-gray-200">div</span>
            <span className="text-gray-500">{'>'}</span>
            <span className="text-gray-400">Hello World</span>
            <span className="text-gray-500">{'</'}</span>
            <span className="text-gray-200">div</span>
            <span className="text-gray-500">{'>'}</span>
            {'\n}'}
          </pre>
        </div>
      )
    },
    {
      id: 'rich-text',
      name: 'Rich Text Editor',
      icon: Type,
      description: 'WYSIWYG editor with formatting tools',
      demo: (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 p-2 flex gap-1">
            <button className="p-2 hover:bg-gray-200 rounded"><strong>B</strong></button>
            <button className="p-2 hover:bg-gray-200 rounded"><em>I</em></button>
            <button className="p-2 hover:bg-gray-200 rounded"><u>U</u></button>
            <div className="w-px bg-gray-300 mx-1"></div>
            <button className="p-2 hover:bg-gray-200 rounded">H1</button>
            <button className="p-2 hover:bg-gray-200 rounded">H2</button>
            <div className="w-px bg-gray-300 mx-1"></div>
            <button className="p-2 hover:bg-gray-200 rounded">•</button>
            <button className="p-2 hover:bg-gray-200 rounded">1.</button>
          </div>
          <div className="p-4" contentEditable>
            <h3 className="font-bold mb-2">Rich Text Editor</h3>
            <p>This is an example of <strong>bold text</strong>, <em>italic text</em>, and <u>underlined text</u>.</p>
          </div>
        </div>
      )
    },
    {
      id: 'drag-drop',
      name: 'Drag & Drop Grid',
      icon: Move,
      description: 'Draggable grid layout for dashboards',
      demo: (
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="bg-gray-100 rounded-lg p-4 cursor-move hover:bg-gray-200 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <Move className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">#{item}</span>
              </div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'infinite',
      name: 'Infinite Scroll',
      icon: ArrowDown,
      description: 'Load content as user scrolls',
      demo: (
        <div className="border border-gray-200 rounded-lg h-64 overflow-y-auto">
          <div className="p-4 space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-50 rounded p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Item {i + 1}</span>
                  <span className="text-sm text-gray-500">2 min ago</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Content preview...</p>
              </div>
            ))}
            <div className="text-center py-4">
              <div className="inline-flex items-center gap-2 text-gray-600">
                <ArrowDown className="w-4 h-4 animate-bounce" />
                <span className="text-sm">Loading more...</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'kanban',
      name: 'Kanban Board',
      icon: Columns,
      description: 'Drag-and-drop task management board',
      demo: (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="font-medium text-gray-700 mb-3">To Do</h4>
            <div className="space-y-2">
              <div className="bg-white p-2 rounded border border-gray-200 cursor-move">
                <span className="text-sm">Design UI mockups</span>
              </div>
              <div className="bg-white p-2 rounded border border-gray-200 cursor-move">
                <span className="text-sm">Review PR #123</span>
              </div>
            </div>
          </div>
          <div className="bg-gray-100 rounded-lg p-3">
            <h4 className="font-medium text-gray-700 mb-3">In Progress</h4>
            <div className="space-y-2">
              <div className="bg-white p-2 rounded border border-gray-300 cursor-move">
                <span className="text-sm">Implement auth</span>
              </div>
            </div>
          </div>
          <div className="bg-gray-200 rounded-lg p-3">
            <h4 className="font-medium text-gray-700 mb-3">Done</h4>
            <div className="space-y-2">
              <div className="bg-white p-2 rounded border border-gray-300 cursor-move">
                <span className="text-sm">Setup project</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'virtual',
      name: 'Virtual List',
      icon: List,
      description: 'Efficiently render large lists',
      demo: (
        <div className="border border-gray-200 rounded-lg">
          <div className="bg-gray-50 p-3 border-b border-gray-200">
            <span className="text-sm font-medium">Rendering 10 of 10,000 items</span>
          </div>
          <div className="h-48 overflow-hidden">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="p-3 border-b border-gray-100 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Virtual Item {i + 1}</span>
                  <span className="text-sm text-gray-500">ID: {1000 + i}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-gray-50 p-2 text-center text-xs text-gray-500">
            Scroll position: 0 / 10,000
          </div>
        </div>
      )
    }
  ];

  const activeComponent = mediaComponents.find(c => c.id === activeTab) || mediaComponents[0];

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 pb-4 border-b border-gray-200">
        {mediaComponents.map((component) => {
          const Icon = component.icon;
          return (
            <button
              key={component.id}
              onClick={() => setActiveTab(component.id)}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                ${activeTab === component.id 
                  ? 'bg-gray-900 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
                }
              `}
            >
              <Icon size={16} />
              {component.name}
            </button>
          );
        })}
      </div>

      {/* Active Component Display */}
      <div className="modern-card modern-animate" key={activeTab}>
        <div className="flex items-start gap-4 mb-6">
          <activeComponent.icon className="w-8 h-8 text-gray-700" />
          <div>
            <h3 className="modern-heading">{activeComponent.name}</h3>
            <p className="modern-body mt-1">{activeComponent.description}</p>
          </div>
        </div>
        
        <div className="modern-preview">
          {activeComponent.demo}
        </div>
      </div>

      {/* Additional Components */}
      <div className="grid grid-cols-2 gap-4">
        {/* Avatar Component */}
        <div className="modern-card">
          <h4 className="modern-subheading mb-4">Avatar Sizes</h4>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            <div className="w-10 h-10 bg-gray-400 rounded-full"></div>
            <div className="w-12 h-12 bg-gray-500 rounded-full"></div>
            <div className="w-16 h-16 bg-gray-600 rounded-full"></div>
          </div>
        </div>

        {/* File Upload */}
        <div className="modern-card">
          <h4 className="modern-subheading mb-4">File Upload</h4>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Drop files or click to upload</p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="modern-card text-center">
        <h4 className="modern-subheading">9 Media & Interactive Components</h4>
        <p className="modern-body mt-2">
          Rich media handling and interactive components for modern applications.
        </p>
      </div>
    </div>
  );
};