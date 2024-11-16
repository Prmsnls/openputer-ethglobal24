import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Smile, Share, Trash2, DollarSign, Star } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import html2canvas from 'html2canvas';
import { NOUNS_SVG } from '../constants/nouns';

interface Image {
  url: string;
  timestamp: string;
  isLoading?: boolean;
  smileCount: number;
  smileScore?: number;
  hasWon?: boolean;
  isNounish: boolean;
}

interface ImageGridProps {
  images: Array<{
    url: string;
    timestamp: string;
    isLoading?: boolean;
    smileCount: number;
    smileScore?: number;
    hasWon?: boolean;
    isNounish: boolean;
  }>;
  authenticated: boolean;
  userId?: string;
  onSmileBack: (imageUrl: string) => void;
  onDelete: (imageUrl: string, userId: string) => void;
  shimmerStyle: string;
}

export const ImageGrid = ({ 
  images, 
  authenticated, 
  userId, 
  onSmileBack, 
  onDelete, 
  shimmerStyle 
}: ImageGridProps) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);

  const handleShare = (image: Image) => {
    setSelectedImage(image);
    setIsShareModalOpen(true);
  };

  const shareOnTwitter = async () => {
    if (!selectedImage) return;
    
    const sharePreview = document.getElementById('share-preview');
    if (!sharePreview) return;

    try {
      const canvas = await html2canvas(sharePreview, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true,
        width: 400,
        height: 500,
      });

      const link = document.createElement('a');
      link.download = 'my-smile-score.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      
    } catch (error) {
      console.error('Error generating share image:', error);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <Card key={index} className="p-3 border-[3px] border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className={`relative ${image.isLoading ? shimmerStyle : ''}`}>
              <img
                src={image.url}
                alt="Captured smile"
                className="w-full h-[280px] object-cover rounded-lg mb-3 border-2 border-black"
              />
              {(image.isNounish) && (
                <div 
                  className="absolute top-2 w-12 h-12 scale-75"
                  style={{
                    left: '20%',
                    transform: 'translateX(-50%) scale(0.75)',
                    transformOrigin: 'center top'
                  }}
                  dangerouslySetInnerHTML={{ __html: NOUNS_SVG }}
                />
              )}
              <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded-full border-2 border-black shadow-sm">
                <div className="flex items-center gap-1">
                  <span className="font-bold">
                    {image.isLoading ? '?/5' : `${image.smileScore ?? 0}/5`}
                  </span>
                  {(image.smileScore ?? 0) > 3 && (
                    <Star className="h-4 w-4 text-green-600" />
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {new Date(image.timestamp).toLocaleString()}
              </p>
              <div className="flex gap-2">
                {authenticated ? (
                  <Button 
                    variant="outline" 
                    onClick={() => onSmileBack(image.url)}
                    className="bg-[#FFD700] border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] h-8 flex items-center gap-1 px-2"
                  >
                    <Smile className="h-4 w-4" />
                    <span>{image.smileCount || 0}</span>
                  </Button>
                ) : (
                  <div className="bg-[#FFD700] border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] h-8 flex items-center gap-1 px-2">
                    <Smile className="h-4 w-4" />
                    <span>{image.smileCount || 0}</span>
                  </div>
                )}
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => handleShare(image)}
                  className="bg-[#90EE90] border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-2 h-8 w-8"
                >
                  <Share className="h-4 w-4" />
                </Button>
                {authenticated && userId && image.url.includes(`${userId}/`) && (
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => onDelete(image.url, userId)}
                    className="bg-[#FFB6C1] border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-2 h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            {image.isLoading ? (
              <div className="mt-2 text-center">Analyzing smile... ⏳</div>
            ) : (
              <div className="mt-2 text-center">
                <div className="flex items-center justify-center gap-2">
                  <span className="font-medium">
                    Smile Score: {image.isLoading ? '?/5' : `${image.smileScore ?? 0}/5`}
                  </span>
                  {(image.smileScore ?? 0) > 3 && (
                    <span className="inline-flex items-center bg-green-100 px-2 py-1 rounded-full text-sm">
                      <DollarSign className="h-3 w-3 text-green-600 mr-1" />
                      <span className="text-green-600 font-medium">Winner!</span>
                    </span>
                  )}
                </div>
                {image.hasWon && (
                  <p className="text-green-600 font-bold mt-1">
                    🎉 0.001 <img src="https://cryptologos.cc/logos/usd-coin-usdc-logo.png" alt="USDC" className="inline h-4 w-4" /> awarded! 🎉
                  </p>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>

      <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
        <DialogContent className="sm:max-w-[400px] bg-white p-6 rounded-[32px]">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-black">
              Share Your Smile! 😊
            </DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="space-y-4">
              <div 
                id="share-preview" 
                className="bg-white p-4 rounded-[24px] border-[3px] border-black"
              >
                <div className="relative rounded-[20px] overflow-hidden border-[3px] border-black">
                  <img
                    src={selectedImage.url}
                    alt="Share preview"
                    className="w-full aspect-[4/3] object-cover"
                    crossOrigin="anonymous"
                  />
                  <div className="absolute top-3 right-3 bg-white rounded-full px-3 py-1 border-2 border-black flex items-center gap-1">
                    <span className="font-black text-lg">5/5</span>
                    <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  </div>
                </div>

                {selectedImage.hasWon && (
                  <div className="mt-3 bg-[#E7FFE7] rounded-[16px] p-3 border-2 border-black">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-[#00A308] text-xl font-black">$</span>
                      <span className="text-[#00A308] text-xl font-black">Won 0.001 USDC!</span>
                      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="12" fill="#2775CA"/>
                        <path d="M12 4.5c-4.14 0-7.5 3.36-7.5 7.5 0 4.14 3.36 7.5 7.5 7.5 4.14 0 7.5-3.36 7.5-7.5 0-4.14-3.36-7.5-7.5-7.5zm0 13.5c-3.315 0-6-2.685-6-6s2.685-6 6-6 6 2.685 6 6-2.685 6-6 6z" fill="white"/>
                        <path d="M13.5 14.25c0-.825-.675-1.5-1.5-1.5v-1.5c.825 0 1.5-.675 1.5-1.5h1.5c0 .825.675 1.5 1.5 1.5v1.5c-.825 0-1.5.675-1.5 1.5h-1.5z" fill="white"/>
                      </svg>
                    </div>
                  </div>
                )}
              </div>

              <Button
                onClick={shareOnTwitter}
                className="w-full bg-[#2B9FE9] hover:bg-[#2B9FE9]/90 text-white font-bold py-4 px-4 rounded-[16px] border-2 border-black"
              >
                <div className="flex items-center justify-center gap-2">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Save Screenshot
                </div>
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};