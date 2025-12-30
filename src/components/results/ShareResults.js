import React, { useState } from "react";
import { Button } from "../../components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import { Share2, Copy, Check } from "lucide-react";

// Custom Telegram Icon SVG Component
const TelegramIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 10l-4 4 6 6 4-16-18 7 4 2 2 6 3-4" />
  </svg>
);

// Custom WhatsApp Icon SVG Component
const WhatsAppIcon = (props) => (
    <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
)

export default function ShareResults({ productName }) {
  const [copied, setCopied] = useState(false);
  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `Check out these AI insights for the ${productName} from ProductSense!`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOptions = [
    {
      name: "Copy Link",
      icon: copied ? Check : Copy,
      action: copyToClipboard,
      color: "text-gray-300",
    },
    {
      name: "Telegram",
      icon: TelegramIcon,
      action: () => window.open(`tg://msg_url?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(shareText)}`, '_blank'),
      color: "text-sky-400",
    },
    {
      name: "WhatsApp",
      icon: WhatsAppIcon,
      action: () => window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + pageUrl)}`, '_blank'),
      color: "text-green-400",
    }
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 bg-gray-800 border-gray-700 text-white hover:bg-gray-700">
          <Share2 className="w-4 h-4" />
          Share
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2 bg-gray-800 border-gray-700">
        <div className="flex flex-col gap-1">
          {shareOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Button
                key={option.name}
                variant="ghost"
                className="w-full justify-start gap-3 px-3 text-gray-300 hover:bg-gray-700 hover:text-white"
                onClick={option.action}
              >
                <Icon className={`w-5 h-5 ${option.color}`} />
                <span>{option.name}</span>
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}