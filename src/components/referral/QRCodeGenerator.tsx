import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QrCode, Download, Share2, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QRCodeGeneratorProps {
  referralLink: string;
  referralCode: string;
}

/**
 * Générateur de QR Code pour le partage de liens de parrainage
 * Permet de personnaliser la taille, la couleur et de télécharger le QR code
 */
export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  referralLink,
  referralCode,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [size, setSize] = useState(256);
  const [foregroundColor, setForegroundColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [includeLogo, setIncludeLogo] = useState(true);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const generateQRCode = async () => {
    try {
      // Utiliser une API de génération de QR Code
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(referralLink)}&color=${foregroundColor.replace('#', '')}&bgcolor=${backgroundColor.replace('#', '')}`;
      
      const response = await fetch(qrApiUrl);
      if (!response.ok) throw new Error('Erreur lors de la génération du QR code');

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);

      // Afficher l'image dans le canvas
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);

        // Ajouter le logo si demandé
        if (includeLogo) {
          const logo = new Image();
          logo.onload = () => {
            const logoSize = size * 0.2;
            const logoX = (size - logoSize) / 2;
            const logoY = (size - logoSize) / 2;
            
            // Fond blanc pour le logo
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(logoX - 5, logoY - 5, logoSize + 10, logoSize + 10);
            
            ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
          };
          logo.src = '/payhuk-logo.png';
        }
      };
      img.src = imageUrl;

    } catch (error) {
      console.error('Erreur lors de la génération du QR code:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le QR code",
        variant: "destructive",
      });
    }
  };

  const downloadQRCode = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `payhuk-referral-${referralCode}.png`;
    link.href = canvas.toDataURL();
    link.click();

    toast({
      title: "Téléchargé !",
      description: "Le QR code a été téléchargé avec succès",
    });
  };

  const copyQRCodeAsImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob
          })
        ]);

        setCopied(true);
        toast({
          title: "Copié !",
          description: "Le QR code a été copié dans le presse-papier",
        });
        
        setTimeout(() => setCopied(false), 2000);
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le QR code",
        variant: "destructive",
      });
    }
  };

  const shareQRCode = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const file = new File([blob], `payhuk-referral-${referralCode}.png`, {
          type: 'image/png'
        });

        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'Rejoignez Payhuk',
            text: `Utilisez mon code de parrainage: ${referralCode}`,
            files: [file]
          });
        } else {
          // Fallback: télécharger le fichier
          downloadQRCode();
        }
      });
    } catch (error) {
      console.error('Erreur lors du partage:', error);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      generateQRCode();
    }
  }, [isOpen, size, foregroundColor, backgroundColor, includeLogo]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <QrCode className="h-4 w-4" />
          Générer QR Code
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Générateur de QR Code
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Options de personnalisation */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="size">Taille</Label>
              <Select value={size.toString()} onValueChange={(value) => setSize(Number(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="128">128x128 (Petit)</SelectItem>
                  <SelectItem value="256">256x256 (Moyen)</SelectItem>
                  <SelectItem value="512">512x512 (Grand)</SelectItem>
                  <SelectItem value="1024">1024x1024 (Très grand)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="foreground">Couleur du QR code</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={foregroundColor}
                  onChange={(e) => setForegroundColor(e.target.value)}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={foregroundColor}
                  onChange={(e) => setForegroundColor(e.target.value)}
                  placeholder="#000000"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="background">Couleur de fond</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  placeholder="#FFFFFF"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includeLogo"
                checked={includeLogo}
                onChange={(e) => setIncludeLogo(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="includeLogo">Inclure le logo Payhuk</Label>
            </div>

            <div className="pt-4 space-y-2">
              <Button onClick={downloadQRCode} className="w-full gap-2">
                <Download className="h-4 w-4" />
                Télécharger
              </Button>
              
              <Button 
                onClick={copyQRCodeAsImage} 
                variant="outline" 
                className="w-full gap-2"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copié !' : 'Copier'}
              </Button>
              
              <Button 
                onClick={shareQRCode} 
                variant="outline" 
                className="w-full gap-2"
              >
                <Share2 className="h-4 w-4" />
                Partager
              </Button>
            </div>
          </div>

          {/* Aperçu du QR code */}
          <div className="space-y-4">
            <Label>Aperçu</Label>
            <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
              <canvas
                ref={canvasRef}
                className="border border-gray-200 rounded"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>
            
            <div className="text-center text-sm text-muted-foreground">
              <p>Code de parrainage: <strong>{referralCode}</strong></p>
              <p className="truncate">Lien: {referralLink}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeGenerator;
