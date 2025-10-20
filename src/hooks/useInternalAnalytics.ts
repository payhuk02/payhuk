import { useState, useEffect } from 'react';
import { usePixels } from './usePixels';
import { useAuth } from '@/contexts/AuthContext';

export const useInternalAnalytics = () => {
  const { user } = useAuth();
  const { pixels, createPixel, trackEvent } = usePixels();
  const [internalPixelId, setInternalPixelId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    // Check if internal analytics pixel already exists
    const internalPixel = pixels.find(p => 
      p.pixel_type === 'custom' && 
      p.pixel_name === 'Internal Analytics' &&
      p.pixel_id === 'internal-analytics'
    );

    if (internalPixel) {
      setInternalPixelId(internalPixel.id);
    } else {
      // Create internal analytics pixel if it doesn't exist
      createInternalPixel();
    }
  }, [user, pixels]);

  const createInternalPixel = async () => {
    if (!user) return;

    const success = await createPixel({
      pixel_type: 'custom',
      pixel_id: 'internal-analytics',
      pixel_name: 'Internal Analytics',
      pixel_code: '// Internal analytics pixel for tracking user interactions',
      is_active: true,
    });

    if (success) {
      // Refresh pixels to get the new ID
      setTimeout(() => {
        const newInternalPixel = pixels.find(p => 
          p.pixel_type === 'custom' && 
          p.pixel_name === 'Internal Analytics' &&
          p.pixel_id === 'internal-analytics'
        );
        if (newInternalPixel) {
          setInternalPixelId(newInternalPixel.id);
        }
      }, 1000);
    }
  };

  const trackInternalEvent = async (
    eventType: 'pageview' | 'add_to_cart' | 'purchase' | 'lead',
    eventData?: {
      product_id?: string;
      product_name?: string;
      action?: string;
      tab?: string;
      [key: string]: any;
    }
  ) => {
    if (!internalPixelId) {
      console.warn('Internal analytics pixel not ready yet');
      return false;
    }

    return trackEvent(internalPixelId, eventType, eventData);
  };

  return {
    internalPixelId,
    trackInternalEvent,
    isReady: !!internalPixelId,
  };
};
