import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Facebook, 
  Twitter, 
  MessageCircle, 
  Send, 
  Mail, 
  Share2,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface SocialShareProps {
  referralLink: string;
  referralCode: string;
  onShare?: (platform: string) => void;
}

/**
 * Composant de partage sur les réseaux sociaux pour les liens de parrainage
 * Inclut Facebook, Twitter, WhatsApp, Telegram, Email et copie de lien
 */
export const SocialShare: React.FC<SocialShareProps> = ({
  referralLink,
  referralCode,
  onShare,
}) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const shareMessage = `🚀 Rejoignez Payhuk, la plateforme e-commerce africaine ! 

💎 Utilisez mon code de parrainage "${referralCode}" pour obtenir des avantages exclusifs

🛒 Vendez et achetez en toute sécurité avec nos solutions de paiement locales

🔗 Lien: ${referralLink}

#Payhuk #Ecommerce #Afrique #Parrainage`;

  const shareData = {
    title: 'Rejoignez Payhuk - Plateforme E-commerce Africaine',
    text: shareMessage,
    url: referralLink,
  };

  const shareButtons = [
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      action: () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}&quote=${encodeURIComponent(shareMessage)}`;
        window.open(url, '_blank', 'width=600,height=400');
        onShare?.('facebook');
      }
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'bg-sky-500 hover:bg-sky-600',
      action: () => {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`;
        window.open(url, '_blank', 'width=600,height=400');
        onShare?.('twitter');
      }
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-600 hover:bg-green-700',
      action: () => {
        const url = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
        window.open(url, '_blank');
        onShare?.('whatsapp');
      }
    },
    {
      name: 'Telegram',
      icon: Send,
      color: 'bg-blue-500 hover:bg-blue-600',
      action: () => {
        const url = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareMessage)}`;
        window.open(url, '_blank', 'width=600,height=400');
        onShare?.('telegram');
      }
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'bg-gray-600 hover:bg-gray-700',
      action: () => {
        const subject = 'Rejoignez Payhuk - Plateforme E-commerce Africaine';
        const body = shareMessage;
        const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(url);
        onShare?.('email');
      }
    }
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast({
        title: "Lien copié !",
        description: "Le lien de parrainage a été copié dans votre presse-papier.",
      });
      onShare?.('copy');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le lien.",
        variant: "destructive",
      });
    }
  };

  const shareNative = async () => {
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        onShare?.('native');
      } else {
        // Fallback: copier le lien
        await copyToClipboard();
      }
    } catch (error) {
      console.error('Erreur lors du partage:', error);
    }
  };

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(shareMessage);
      toast({
        title: "Message copié !",
        description: "Le message de parrainage a été copié dans votre presse-papier.",
      });
      onShare?.('message');
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le message.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Partager votre lien de parrainage
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Boutons de partage sur réseaux sociaux */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {shareButtons.map((button) => (
            <Button
              key={button.name}
              onClick={button.action}
              className={`${button.color} text-white gap-2`}
              variant="default"
            >
              <button.icon className="h-4 w-4" />
              {button.name}
            </Button>
          ))}
        </div>

        {/* Actions supplémentaires */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={copyToClipboard}
            variant="outline"
            className="gap-2"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copié !' : 'Copier le lien'}
          </Button>

          <Button
            onClick={copyMessage}
            variant="outline"
            className="gap-2"
          >
            <Copy className="h-4 w-4" />
            Copier le message
          </Button>

          {navigator.share && (
            <Button
              onClick={shareNative}
              variant="outline"
              className="gap-2"
            >
              <Share2 className="h-4 w-4" />
              Partager
            </Button>
          )}
        </div>

        {/* Aperçu du message */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Aperçu du message :</h4>
          <p className="text-sm text-gray-700 whitespace-pre-line">{shareMessage}</p>
        </div>

        {/* Statistiques de partage (optionnel) */}
        <div className="text-center text-sm text-muted-foreground">
          <p>💡 <strong>Astuce :</strong> Plus vous partagez, plus vous gagnez !</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SocialShare;
