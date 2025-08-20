import React from 'react';
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  AspectRatio,
  Badge
} from '../components';

export const MediaSection = () => {
  const images = [
    'https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80',
    'https://images.unsplash.com/photo-1540553016722-983e48a2cd10?w=800&dpr=2&q=80',
    'https://images.unsplash.com/photo-1471897488648-5eae4ac6686b?w=800&dpr=2&q=80',
    'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&dpr=2&q=80',
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&dpr=2&q=80'
  ];

  const teamMembers = [
    { name: 'Alice Johnson', role: 'CEO', avatar: 'AJ' },
    { name: 'Bob Smith', role: 'CTO', avatar: 'BS' },
    { name: 'Carol Williams', role: 'Designer', avatar: 'CW' },
    { name: 'David Brown', role: 'Developer', avatar: 'DB' }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-6">Media Components</h2>
        <p className="text-muted-foreground mb-8">
          Components for displaying images, videos, avatars, and other media content with various layouts and styles.
        </p>
      </div>

      {/* Avatars */}
      <Card>
        <CardHeader>
          <CardTitle>Avatars</CardTitle>
          <CardDescription>User avatars with different sizes and states</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Sizes */}
          <div>
            <h4 className="text-sm font-medium mb-4">Sizes</h4>
            <div className="flex items-center gap-4">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                <AvatarFallback>SM</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                <AvatarFallback>MD</AvatarFallback>
              </Avatar>
              <Avatar className="h-16 w-16">
                <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                <AvatarFallback>LG</AvatarFallback>
              </Avatar>
              <Avatar className="h-24 w-24">
                <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                <AvatarFallback>XL</AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Avatar with Fallback */}
          <div>
            <h4 className="text-sm font-medium mb-4">With Fallback</h4>
            <div className="flex items-center gap-4">
              {teamMembers.map((member) => (
                <div key={member.name} className="flex flex-col items-center gap-2">
                  <Avatar>
                    <AvatarFallback>{member.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <p className="text-sm font-medium">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Avatar Groups */}
          <div>
            <h4 className="text-sm font-medium mb-4">Avatar Stack</h4>
            <div className="flex -space-x-4">
              {teamMembers.slice(0, 3).map((member, i) => (
                <Avatar key={i} className="border-2 border-background">
                  <AvatarFallback>{member.avatar}</AvatarFallback>
                </Avatar>
              ))}
              <Avatar className="border-2 border-background">
                <AvatarFallback>+5</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Carousel */}
      <Card>
        <CardHeader>
          <CardTitle>Carousel</CardTitle>
          <CardDescription>Image carousel with navigation controls</CardDescription>
        </CardHeader>
        <CardContent>
          <Carousel className="w-full max-w-2xl mx-auto">
            <CarouselContent>
              {images.map((src, index) => (
                <CarouselItem key={index}>
                  <div className="p-1">
                    <Card>
                      <CardContent className="flex aspect-video items-center justify-center p-0">
                        <img
                          src={src}
                          alt={`Slide ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>

          {/* Carousel with Multiple Items */}
          <div className="mt-8">
            <h4 className="text-sm font-medium mb-4">Multiple Items View</h4>
            <Carousel className="w-full max-w-2xl mx-auto">
              <CarouselContent className="-ml-2 md:-ml-4">
                {images.map((src, index) => (
                  <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                    <div className="p-1">
                      <Card>
                        <CardContent className="flex aspect-square items-center justify-center p-0">
                          <img
                            src={src}
                            alt={`Item ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </CardContent>
      </Card>

      {/* Aspect Ratio */}
      <Card>
        <CardHeader>
          <CardTitle>Aspect Ratio</CardTitle>
          <CardDescription>Maintain consistent aspect ratios for media content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-2">16:9</h4>
              <AspectRatio ratio={16 / 9} className="bg-muted">
                <img
                  src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
                  alt="Photo"
                  className="rounded-md object-cover w-full h-full"
                />
              </AspectRatio>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Square (1:1)</h4>
              <AspectRatio ratio={1} className="bg-muted">
                <img
                  src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
                  alt="Photo"
                  className="rounded-md object-cover w-full h-full"
                />
              </AspectRatio>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">4:3</h4>
              <AspectRatio ratio={4 / 3} className="bg-muted">
                <img
                  src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
                  alt="Photo"
                  className="rounded-md object-cover w-full h-full"
                />
              </AspectRatio>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image Gallery */}
      <Card>
        <CardHeader>
          <CardTitle>Image Gallery</CardTitle>
          <CardDescription>Grid layout for image collections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((src, index) => (
              <div key={index} className="relative group cursor-pointer">
                <AspectRatio ratio={1}>
                  <img
                    src={src}
                    alt={`Gallery ${index + 1}`}
                    className="rounded-lg object-cover w-full h-full transition-transform group-hover:scale-105"
                  />
                </AspectRatio>
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <Badge variant="secondary">View</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Media Cards */}
      <Card>
        <CardHeader>
          <CardTitle>Media Cards</CardTitle>
          <CardDescription>Cards with integrated media content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="overflow-hidden">
              <AspectRatio ratio={16 / 9}>
                <img
                  src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
                  alt="Card media"
                  className="object-cover w-full h-full"
                />
              </AspectRatio>
              <CardHeader>
                <CardTitle>Beautiful Landscape</CardTitle>
                <CardDescription>Stunning nature photography</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Explore the beauty of natural landscapes captured in high resolution.
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">John Doe</CardTitle>
                    <CardDescription>Professional Photographer</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <AspectRatio ratio={16 / 9}>
                <img
                  src="https://images.unsplash.com/photo-1540553016722-983e48a2cd10?w=800&dpr=2&q=80"
                  alt="User content"
                  className="object-cover w-full h-full"
                />
              </AspectRatio>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">
                  Award-winning photography from around the world.
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
