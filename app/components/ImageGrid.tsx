import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Smile, Share, Trash2, DollarSign } from "lucide-react";

interface Image {
  url: string;
  timestamp: string;
  isLoading?: boolean;
  smileCount: number;
  smileScore?: number;
  hasWon?: boolean;
}

interface ImageGridProps {
  images: Array<{
    url: string;
    timestamp: string;
    isLoading?: boolean;
    smileCount: number;
    smileScore?: number;
    hasWon?: boolean;
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
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {images.map((image, index) => (
        <Card key={index} className="p-3 border-[3px] border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className={`relative ${image.isLoading ? shimmerStyle : ''}`}>
            <img
              src={image.url}
              alt="Captured smile"
              className="w-full h-[280px] object-cover rounded-lg mb-3 border-2 border-black"
            />
            <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded-full border-2 border-black shadow-sm">
              <div className="flex items-center gap-1">
                <span className="font-bold">
                  {image.isLoading ? '?/5' : `${image.smileScore ?? 0}/5`}
                </span>
                {(image.smileScore ?? 0) > 3 && (
                  <DollarSign className="h-4 w-4 text-green-600" />
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
  );
};