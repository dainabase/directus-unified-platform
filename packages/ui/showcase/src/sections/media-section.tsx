import React, { useState, useRef } from 'react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  Button,
  Badge,
  Progress,
  ScrollArea,
  Separator,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Label,
  Input,
  Toggle,
  Slider,
} from '../components';
import {
  Image as ImageIcon,
  Video,
  Mic,
  MicOff,
  Upload,
  FileImage,
  FileVideo,
  FileAudio,
  File,
  X,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Maximize,
  Camera,
  User,
  Users,
  Star,
  Heart,
  Download,
  Share2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Grid,
  Layers,
  Film,
  Music,
  Headphones,
  Radio,
  Podcast,
  Plus,
  Check,
  Cloud,
  HardDrive,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Settings,
  Mail,
} from 'lucide-react';

export const MediaSection: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(30);
  const [volume, setVolume] = useState(70);
  const [carouselAutoplay, setCarouselAutoplay] = useState(true);
  const [avatarSize, setAvatarSize] = useState('default');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileNames = Array.from(files).map(file => file.name);
      setUploadedFiles(prev => [...prev, ...fileNames]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const imageGallery = [
    { id: 1, title: 'Mountain Landscape', src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4', tags: ['nature', 'landscape'] },
    { id: 2, title: 'City Skyline', src: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000', tags: ['urban', 'city'] },
    { id: 3, title: 'Ocean Sunset', src: 'https://images.unsplash.com/photo-1439405326854-014607f694d7', tags: ['nature', 'ocean'] },
    { id: 4, title: 'Forest Path', src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e', tags: ['nature', 'forest'] },
    { id: 5, title: 'Desert Dunes', src: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35', tags: ['nature', 'desert'] },
  ];

  const teamMembers = [
    { name: 'Alice Johnson', role: 'Product Designer', avatar: 'AJ', status: 'online' },
    { name: 'Bob Smith', role: 'Developer', avatar: 'BS', status: 'offline' },
    { name: 'Carol White', role: 'Marketing Manager', avatar: 'CW', status: 'online' },
    { name: 'David Brown', role: 'Data Analyst', avatar: 'DB', status: 'away' },
  ];

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Film className="w-8 h-8" />
          Media Components
        </h2>
        <p className="text-muted-foreground mt-2">
          Rich media components for images, videos, audio, avatars, and file uploads with advanced features.
        </p>
      </div>

      {/* Avatar Section */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Avatars
          </h3>
          
          {/* Avatar Showcase */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Basic Avatars */}
            <Card>
              <CardHeader>
                <CardTitle>Avatar Sizes</CardTitle>
                <CardDescription>Different size variants</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>XS</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>SM</AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>MD</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-14 w-14">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>LG</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>XL</AvatarFallback>
                  </Avatar>
                </div>
              </CardContent>
            </Card>

            {/* Avatar with Status */}
            <Card>
              <CardHeader>
                <CardTitle>With Status Indicators</CardTitle>
                <CardDescription>Online status badges</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src="https://github.com/shadcn.png" />
                      <AvatarFallback>ON</AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full" />
                  </div>
                  <div className="relative">
                    <Avatar>
                      <AvatarFallback>AW</AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-yellow-500 border-2 border-white rounded-full" />
                  </div>
                  <div className="relative">
                    <Avatar>
                      <AvatarFallback>OF</AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-gray-400 border-2 border-white rounded-full" />
                  </div>
                  <div className="relative">
                    <Avatar>
                      <AvatarFallback>BU</AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-red-500 border-2 border-white rounded-full" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Avatar Groups */}
            <Card>
              <CardHeader>
                <CardTitle>Avatar Groups</CardTitle>
                <CardDescription>Stacked avatars for teams</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex -space-x-4">
                  {teamMembers.map((member, i) => (
                    <Avatar key={i} className="border-2 border-background">
                      <AvatarFallback>{member.avatar}</AvatarFallback>
                    </Avatar>
                  ))}
                  <Avatar className="border-2 border-background">
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      +5
                    </AvatarFallback>
                  </Avatar>
                </div>
              </CardContent>
            </Card>

            {/* Interactive Avatar Card */}
            <Card>
              <CardHeader>
                <CardTitle>User Profile Card</CardTitle>
                <CardDescription>Complete profile component</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-semibold">Jane Doe</h4>
                    <p className="text-sm text-muted-foreground">jane.doe@example.com</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">Pro</Badge>
                      <Badge variant="outline">Verified</Badge>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" className="flex-1">
                    <User className="w-4 h-4 mr-1" />
                    View Profile
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Mail className="w-4 h-4 mr-1" />
                    Message
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Avatar Customization */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Avatar Customization</CardTitle>
                <CardDescription>Dynamic avatar options</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Label className="w-24">Size:</Label>
                    <Select value={avatarSize} onValueChange={setAvatarSize}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                        <SelectItem value="xlarge">Extra Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-4">
                    <Label className="w-24">Shape:</Label>
                    <div className="flex gap-2">
                      <Toggle pressed={true}>Circle</Toggle>
                      <Toggle>Square</Toggle>
                      <Toggle>Rounded</Toggle>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Label className="w-24">Preview:</Label>
                    <Avatar className={
                      avatarSize === 'small' ? 'h-8 w-8' :
                      avatarSize === 'large' ? 'h-16 w-16' :
                      avatarSize === 'xlarge' ? 'h-24 w-24' : ''
                    }>
                      <AvatarImage src="https://github.com/shadcn.png" />
                      <AvatarFallback>PR</AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Image Components */}
        <div>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Images & Gallery
          </h3>
          
          <div className="grid gap-6 md:grid-cols-2">
            {/* Image Gallery */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Interactive Image Gallery</CardTitle>
                <CardDescription>Browse, zoom, and manage images</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="grid">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="grid">Grid View</TabsTrigger>
                    <TabsTrigger value="carousel">Carousel View</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="grid" className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      {imageGallery.map((image, index) => (
                        <div
                          key={image.id}
                          className={`relative group cursor-pointer rounded-lg overflow-hidden ${
                            selectedImage === index ? 'ring-2 ring-primary' : ''
                          }`}
                          onClick={() => setSelectedImage(index)}
                        >
                          <img
                            src={image.src + '?auto=format&fit=crop&w=300&q=80'}
                            alt={image.title}
                            className="w-full h-32 object-cover transition-transform group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button size="icon" variant="secondary" className="h-8 w-8">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="secondary" className="h-8 w-8">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Selected Image Preview */}
                    <div className="border rounded-lg p-4">
                      <img
                        src={imageGallery[selectedImage].src + '?auto=format&fit=crop&w=800&q=80'}
                        alt={imageGallery[selectedImage].title}
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      <div className="mt-4 flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{imageGallery[selectedImage].title}</h4>
                          <div className="flex gap-2 mt-1">
                            {imageGallery[selectedImage].tags.map(tag => (
                              <Badge key={tag} variant="secondary">{tag}</Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="icon" variant="outline">
                            <ZoomIn className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="outline">
                            <RotateCw className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="outline">
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="carousel">
                    <Carousel className="w-full max-w-xl mx-auto">
                      <CarouselContent>
                        {imageGallery.map((image) => (
                          <CarouselItem key={image.id}>
                            <div className="p-1">
                              <Card>
                                <CardContent className="p-0">
                                  <img
                                    src={image.src + '?auto=format&fit=crop&w=600&q=80'}
                                    alt={image.title}
                                    className="w-full h-80 object-cover rounded-lg"
                                  />
                                  <div className="p-4">
                                    <h4 className="font-semibold">{image.title}</h4>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious />
                      <CarouselNext />
                    </Carousel>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Image Upload Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Image Upload with Preview</CardTitle>
                <CardDescription>Drag & drop or click to upload</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Plus className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Drag & drop images here, or click to select
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, GIF up to 10MB
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Image Editor Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Image Editor</CardTitle>
                <CardDescription>Basic editing controls</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Brightness</Label>
                  <Slider defaultValue={[50]} max={100} step={1} />
                </div>
                <div className="space-y-2">
                  <Label>Contrast</Label>
                  <Slider defaultValue={[50]} max={100} step={1} />
                </div>
                <div className="space-y-2">
                  <Label>Saturation</Label>
                  <Slider defaultValue={[50]} max={100} step={1} />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <RotateCw className="w-4 h-4 mr-1" />
                    Rotate
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Grid className="w-4 h-4 mr-1" />
                    Crop
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Video Components */}
        <div>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Video className="w-5 h-5" />
            Video Player
          </h3>
          
          <Card>
            <CardHeader>
              <CardTitle>Custom Video Player</CardTitle>
              <CardDescription>Advanced video controls and features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Video Placeholder */}
                <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-center">
                      <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">Video Player Demo</p>
                      <p className="text-sm opacity-75">Click play to start</p>
                    </div>
                  </div>
                  
                  {/* Overlay Controls */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="space-y-2">
                      {/* Progress Bar */}
                      <div className="flex items-center gap-2 text-white text-xs">
                        <span>1:23</span>
                        <div className="flex-1">
                          <Progress value={progress} className="h-1" />
                        </div>
                        <span>4:56</span>
                      </div>
                      
                      {/* Control Buttons */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-white hover:bg-white/20"
                            onClick={() => setIsPlaying(!isPlaying)}
                          >
                            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>
                          <Button size="icon" variant="ghost" className="text-white hover:bg-white/20">
                            <SkipBack className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="text-white hover:bg-white/20">
                            <SkipForward className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-white hover:bg-white/20"
                            onClick={() => setIsMuted(!isMuted)}
                          >
                            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                          </Button>
                          <div className="w-20">
                            <Slider
                              value={[volume]}
                              max={100}
                              step={1}
                              className="cursor-pointer"
                              onValueChange={(value) => setVolume(value[0])}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="icon" variant="ghost" className="text-white hover:bg-white/20">
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="text-white hover:bg-white/20">
                            <Maximize className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Video Info */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Sample Video Title</h4>
                    <p className="text-sm text-muted-foreground">1.2M views • 2 days ago</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Heart className="w-4 h-4 mr-1" />
                      Like
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4 mr-1" />
                      Share
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Audio Components */}
        <div>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Headphones className="w-5 h-5" />
            Audio Components
          </h3>
          
          <div className="grid gap-6 md:grid-cols-2">
            {/* Audio Player */}
            <Card>
              <CardHeader>
                <CardTitle>Audio Player</CardTitle>
                <CardDescription>Music and podcast player</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Music className="w-10 h-10 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">Awesome Track</h4>
                      <p className="text-sm text-muted-foreground">Artist Name</p>
                      <p className="text-xs text-muted-foreground">Album • 2024</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Progress value={45} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>2:14</span>
                      <span>5:02</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center gap-4">
                    <Button size="icon" variant="ghost">
                      <SkipBack className="h-4 w-4" />
                    </Button>
                    <Button size="icon" className="h-10 w-10">
                      <Play className="h-5 w-5" />
                    </Button>
                    <Button size="icon" variant="ghost">
                      <SkipForward className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Audio Recorder */}
            <Card>
              <CardHeader>
                <CardTitle>Audio Recorder</CardTitle>
                <CardDescription>Record and playback audio</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
                    {isRecording ? (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-sm font-medium">Recording... 0:12</span>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Mic className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Ready to record</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-center gap-2">
                    <Button
                      variant={isRecording ? "destructive" : "default"}
                      onClick={() => setIsRecording(!isRecording)}
                    >
                      {isRecording ? (
                        <>
                          <MicOff className="w-4 h-4 mr-2" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <Mic className="w-4 h-4 mr-2" />
                          Start Recording
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {/* Recording List */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <FileAudio className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Recording_001.mp3</span>
                      </div>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <Play className="h-3 w-3" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Podcast Player */}
            <Card>
              <CardHeader>
                <CardTitle>Podcast Player</CardTitle>
                <CardDescription>Episode player with chapters</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Podcast className="w-8 h-8 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">Tech Talk Episode 42</h4>
                      <p className="text-xs text-muted-foreground">The Future of AI</p>
                      <div className="flex items-center gap-4 mt-1">
                        <Badge variant="secondary">Technology</Badge>
                        <span className="text-xs text-muted-foreground">45 min</span>
                      </div>
                    </div>
                  </div>
                  
                  <ScrollArea className="h-24 rounded border p-2">
                    <div className="space-y-1">
                      <div className="text-xs py-1 px-2 hover:bg-muted rounded cursor-pointer">
                        00:00 - Introduction
                      </div>
                      <div className="text-xs py-1 px-2 hover:bg-muted rounded cursor-pointer bg-primary/10">
                        05:23 - Current AI Landscape
                      </div>
                      <div className="text-xs py-1 px-2 hover:bg-muted rounded cursor-pointer">
                        15:42 - Machine Learning Basics
                      </div>
                      <div className="text-xs py-1 px-2 hover:bg-muted rounded cursor-pointer">
                        28:15 - Future Predictions
                      </div>
                      <div className="text-xs py-1 px-2 hover:bg-muted rounded cursor-pointer">
                        40:30 - Q&A Session
                      </div>
                    </div>
                  </ScrollArea>
                  
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Radio className="w-4 h-4 mr-1" />
                      Subscribe
                    </Button>
                    <Button size="sm" className="flex-1">
                      <Play className="w-4 h-4 mr-1" />
                      Play Episode
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Audio Visualizer */}
            <Card>
              <CardHeader>
                <CardTitle>Audio Visualizer</CardTitle>
                <CardDescription>Waveform visualization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-32 flex items-end justify-center gap-1">
                    {Array.from({ length: 30 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-primary rounded-t transition-all duration-300"
                        style={{
                          height: `${Math.random() * 100}%`,
                          opacity: 0.3 + Math.random() * 0.7
                        }}
                      />
                    ))}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">Now Playing</p>
                    <p className="text-xs text-muted-foreground">Electronic Beats - DJ Mix</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* File Upload Section */}
        <div>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            File Upload
          </h3>
          
          <Card>
            <CardHeader>
              <CardTitle>Advanced File Upload</CardTitle>
              <CardDescription>Drag & drop with progress tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Drop Zone */}
                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                  <Cloud className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h4 className="font-semibold mb-2">Drop files here or click to browse</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Support for multiple file types • Max 100MB per file
                  </p>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Select Files
                  </Button>
                </div>
                
                {/* Upload Queue */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Upload Queue</h4>
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                        <FileImage className="w-8 h-8 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{file}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={Math.random() * 100} className="h-1 flex-1" />
                            <span className="text-xs text-muted-foreground">
                              {Math.floor(Math.random() * 100)}%
                            </span>
                          </div>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Storage Info */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Storage Used</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={35} className="w-32 h-2" />
                    <span className="text-sm font-medium">3.5 GB / 10 GB</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Carousel Section */}
        <div>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Carousel
          </h3>
          
          <Card>
            <CardHeader>
              <CardTitle>Advanced Carousel</CardTitle>
              <CardDescription>Multiple configuration options</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Carousel Controls */}
                <div className="flex items-center gap-4">
                  <Toggle
                    pressed={carouselAutoplay}
                    onPressedChange={setCarouselAutoplay}
                  >
                    {carouselAutoplay ? 'Autoplay On' : 'Autoplay Off'}
                  </Toggle>
                  <Select defaultValue="3s">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2s">2 seconds</SelectItem>
                      <SelectItem value="3s">3 seconds</SelectItem>
                      <SelectItem value="5s">5 seconds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Main Carousel */}
                <Carousel className="w-full">
                  <CarouselContent>
                    {Array.from({ length: 6 }).map((_, index) => (
                      <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                        <div className="p-1">
                          <Card>
                            <CardContent className="flex aspect-square items-center justify-center p-6">
                              <div className="text-center">
                                <div className="text-4xl font-semibold mb-2">{index + 1}</div>
                                <p className="text-sm text-muted-foreground">
                                  Slide {index + 1} Content
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
                
                {/* Carousel Indicators */}
                <div className="flex justify-center gap-2">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <button
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === 0 ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};