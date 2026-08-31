import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QrCodeProps {
  value: string;
  size?: number;
  darkColor?: string;
  lightColor?: string;
  radius?: number;
}

export function QrCode({ value, size = 88, darkColor = '#0b3d5c', lightColor = '#ffffff', radius = 6 }: QrCodeProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(value, {
      width: size * 2,
      margin: 1,
      color: { dark: darkColor, light: lightColor },
    }).then((url) => {
      if (!cancelled) setDataUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [value, size, darkColor, lightColor]);

  if (!dataUrl) {
    return <div style={{ width: size, height: size, background: lightColor, borderRadius: radius }} />;
  }

  return (
    <img
      src={dataUrl}
      alt="Scan to open your payment book"
      width={size}
      height={size}
      style={{ display: 'block', borderRadius: radius }}
    />
  );
}
