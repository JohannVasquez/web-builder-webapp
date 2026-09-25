import { useState, useCallback, type ReactElement } from 'react';
import Cropper from 'react-easy-crop';
import type { Area, Point } from 'react-easy-crop';
import { Button } from '@/shared/ui/button';
import { getCroppedImg } from '../application/cropImage';
import { RotateCw, Loader2 } from 'lucide-react';
import { Label } from '@/shared/ui/label';

export interface ImageCropperProps {
  readonly imageSrc: string;
  readonly onCropComplete: (croppedFile: File) => void;
  readonly onCancel: () => void;
  readonly onSkip: () => void;
}

const ASPECT_RATIOS = [
  { label: 'Libre', value: undefined },
  { label: 'Cuadrado', value: 1 / 1 },
  { label: 'Apaisado (4:3)', value: 4 / 3 },
  { label: 'Apaisado (16:9)', value: 16 / 9 },
  { label: 'Vertical (3:4)', value: 3 / 4 },
  { label: 'Vertical (9:16)', value: 9 / 16 },
];

export function ImageCropper({
  imageSrc,
  onCropComplete,
  onCancel,
  onSkip,
}: ImageCropperProps): ReactElement {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropCompleteHandler = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleSave = async (): Promise<void> => {
    if (croppedAreaPixels === null) return;
    setIsProcessing(true);
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
      onCropComplete(croppedImage);
    } catch (e) {
      console.error(e);
      // Could add toast here
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="relative flex-1">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={aspect}
          onCropChange={setCrop}
          onCropComplete={onCropCompleteHandler}
          onZoomChange={setZoom}
          onRotationChange={setRotation}
        />
      </div>

      <div className="flex flex-col gap-4 border-t bg-background p-4 shadow-lg sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Label className="mr-2">Proporción:</Label>
          {ASPECT_RATIOS.map((ratio) => (
            <Button
              key={ratio.label}
              type="button"
              variant={aspect === ratio.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAspect(ratio.value)}
            >
              {ratio.label}
            </Button>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setRotation((r) => r + 90)}
            aria-label="Girar 90 grados"
          >
            <RotateCw className="size-4" />
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isProcessing}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onSkip}
            disabled={isProcessing}
          >
            Subir sin recortar
          </Button>
          <Button type="button" onClick={() => void handleSave()} disabled={isProcessing}>
            {isProcessing && <Loader2 className="mr-2 size-4 animate-spin" />}
            Guardar recorte
          </Button>
        </div>
      </div>
    </div>
  );
}
