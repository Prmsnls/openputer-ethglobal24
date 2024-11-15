"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, Smile, Share, Trash2 } from "lucide-react";
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Image {
  url: string;
  timestamp: string;
  isLoading?: boolean;
  smileCount: number;
}

const App = () => {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [uploadStatus, setUploadStatus] = useState<string>('');

  useEffect(() => {
    const storedUserId = window.localStorage.getItem('userId') || `user_${Math.random().toString(36).substr(2, 9)}`;
    setUserId(storedUserId);
    
    if (!window.localStorage.getItem('userId')) {
      window.localStorage.setItem('userId', storedUserId);
    }
    
    initCamera();
    loadExistingPhotos();
  }, []);

  const initCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.style.transform = 'scaleX(-1)';
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Unable to access camera. Please ensure you have granted camera permissions.");
    }
  };

  const uploadImage = async (blob: Blob) => {
    const fileName = `${userId}/${Date.now()}.jpg`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('smiles')
      .upload(fileName, blob);

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('smiles')
      .getPublicUrl(fileName);

    return { url: publicUrl };
  };

  const compressImage = async (blob: Blob): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(blob);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Compression failed'));
          },
          'image/jpeg',
          0.6  // Compression quality (0.6 = 60% quality)
        );
      };
      img.onerror = reject;
    });
  };

  const capturePhoto = async () => {
    setLoading(true);
    setUploadStatus('Capturing smile...');
    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (!context) return;

      context.translate(canvas.width, 0);
      context.scale(-1, 1);
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      setUploadStatus('Processing image...');
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        }, 'image/jpeg', 0.8);
      });
      
      const compressedBlob = await compressImage(blob);
      setUploadStatus('Keep smiling...');
      const uploadResult = await uploadImage(compressedBlob);
      
      const newImage = {
        url: uploadResult.url,
        timestamp: new Date().toISOString(),
        isLoading: true,
        smileCount: 0
      };
      setImages(prev => [newImage, ...prev]);

      // Insert into Supabase database
      const { error } = await supabase
        .from('photos')
        .insert({
          user_id: userId,
          image_url: uploadResult.url,
          timestamp: new Date().toISOString()
        });

      if (error) throw error;

      setImages(prev => prev.map(img => 
        img.url === newImage.url ? { ...img, isLoading: false } : img
      ));

      setUploadStatus('All set! 🎉');
      setTimeout(() => {
        setUploadStatus('');
        setLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Error processing photo:', error);
      alert('Failed to process photo. Please try again.');
      setUploadStatus('');
      setLoading(false);
    }
  };

  const loadExistingPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('image_url, timestamp, smile_count')
        .order('smile_count', { ascending: false })
        .order('timestamp', { ascending: false });

      if (error) throw error;

      const photos = data.map(photo => ({
        url: photo.image_url,
        timestamp: photo.timestamp,
        smileCount: photo.smile_count || 0
      }));
      
      setImages(photos);
    } catch (error) {
      console.error('Error loading photos:', error);
    }
  };

  const handleSmileBack = async (imageUrl: string) => {
    try {
      // First get the current smile count
      const { data: currentData, error: fetchError } = await supabase
        .from('photos')
        .select('smile_count')
        .eq('image_url', imageUrl)
        .single();

      if (fetchError) throw fetchError;

      // Then update with the incremented value
      const { error: updateError } = await supabase
        .from('photos')
        .update({ smile_count: (currentData.smile_count || 0) + 1 })
        .eq('image_url', imageUrl);

      if (updateError) throw updateError;

      // Update UI
      setImages(prev => prev.map(img => 
        img.url === imageUrl 
          ? { ...img, smileCount: (img.smileCount || 0) + 1 }
          : img
      ));
    } catch (error) {
      console.error('Error updating smile count:', error);
      alert('Failed to smile back. Please try again.');
    }
  };

  const deletePhoto = async (imageUrl: string) => {
    try {
      // Delete from Supabase database
      const { error: dbError } = await supabase
        .from('photos')
        .delete()
        .match({ user_id: userId, image_url: imageUrl });

      if (dbError) throw dbError;

      // Delete from storage
      const fileName = imageUrl.split('/').pop(); // Get filename from URL
      const { error: storageError } = await supabase.storage
        .from('smiles')
        .remove([`${userId}/${fileName}`]);

      if (storageError) throw storageError;

      // Update UI
      setImages(prev => prev.filter(img => img.url !== imageUrl));
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Failed to delete photo. Please try again.');
    }
  };

  const shimmerStyle = `
    relative
    overflow-hidden
    before:absolute
    before:inset-0
    before:-translate-x-full
    before:animate-[shimmer_2s_infinite]
    before:bg-gradient-to-r
    before:from-transparent
    before:via-white/60
    before:to-transparent
  `;

  return (
    <div className="bg-yellow-100 min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-[1200px]">
        <div className="bg-white border-[3px] border-black p-4 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-8">
          <h1 className="text-2xl font-bold text-center">
            Ssup?
          </h1>
        </div>

        <div className="relative mb-6 max-w-[480px] mx-auto">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full border-[3px] border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-black"
          />
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="text-center mb-8">
          <Button
            onClick={capturePhoto}
            disabled={loading}
            className="bg-[#90EE90] hover:bg-[#7CDF7C] text-black font-bold px-6 py-3 border-[3px] border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <Camera className="mr-2" />
            Capture Smile!
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <Card key={index} className="p-3 border-[3px] border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className={`relative ${image.isLoading ? shimmerStyle : ''}`}>
                <img
                  src={image.url}
                  alt="Captured smile"
                  className="w-full h-auto rounded-lg mb-3 border-2 border-black"
                />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {new Date(image.timestamp).toLocaleString()}
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => handleSmileBack(image.url)}
                    className="bg-[#FFD700] border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] h-8 flex items-center gap-1 px-2"
                  >
                    <Smile className="h-4 w-4" />
                    <span>{image.smileCount || 0}</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="bg-[#90EE90] border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-2 h-8 w-8"
                  >
                    <Share className="h-4 w-4" />
                  </Button>
                  {image.url.includes(`${userId}/`) && (
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => deletePhoto(image.url)}
                      className="bg-[#FFB6C1] border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-2 h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {loading && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-loading-overlay z-50">
          <Card className="p-8 bg-white">
            <div className="animate-bounce text-4xl mb-4">📸</div>
            <p className="font-bold">{uploadStatus}</p>
          </Card>
        </div>
      )}
    </div>
  );
};

export default App;