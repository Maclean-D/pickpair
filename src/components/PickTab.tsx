import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card as CardType } from './types'
import { ImagePlus, X, Download, Upload } from "lucide-react"
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

type PickTabProps = {
  cards: CardType[]
  addCard: (card: Omit<CardType, 'id' | 'elo'>) => void
  updateCard: (id: string, field: keyof CardType, value: string) => void
  removeCard: (id: string) => void
}

export function PickTab({ cards, addCard, updateCard, removeCard }: PickTabProps) {
  const [newCard, setNewCard] = useState<Omit<CardType, 'id' | 'elo'>>({ title: '', description: '', image: '' })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const importInputRef = useRef<HTMLInputElement>(null)

  const handleAddCard = () => {
    addCard(newCard)
    setNewCard({ title: '', description: '', image: '' })
  }

  const handleImageUpload = (id: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
      fileInputRef.current.onchange = (event) => {
        const file = (event.target as HTMLInputElement).files?.[0]
        if (file) {
          const reader = new FileReader()
          reader.onload = (e) => {
            const imageDataUrl = e.target?.result as string
            updateCard(id, "image", imageDataUrl)
          }
          reader.readAsDataURL(file)
        }
      }
    }
  }

  const handleExport = async () => {
    const zip = new JSZip();
    
    cards.forEach((card, index) => {
      const cardData = {
        title: card.title,
        description: card.description,
        image: card.image
      };
      zip.file(`card_${index}.json`, JSON.stringify(cardData));
      
      if (card.image && card.image.startsWith('data:image')) {
        const imageData = atob(card.image.split(',')[1]);
        const arrayBuffer = new ArrayBuffer(imageData.length);
        const uintArray = new Uint8Array(arrayBuffer);
        for (let i = 0; i < imageData.length; i++) {
          uintArray[i] = imageData.charCodeAt(i);
        }
        zip.file(`image_${index}.png`, arrayBuffer, {base64: true});
      }
    });
    
    const content = await zip.generateAsync({type: "blob"});
    saveAs(content, "cards_export.zip");
  };

  const handleImport = async (file: File) => {
    try {
      const content = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(content);
      const importedCards: Omit<CardType, 'id' | 'elo'>[] = [];

      const cardFiles = Object.keys(zip.files).filter(name => name.endsWith('.json'));
      
      for (const cardFile of cardFiles) {
        const cardData = JSON.parse(await zip.files[cardFile].async('text'));
        const cardIndex = cardFile.match(/card_(\d+)\.json/)?.[1];
        
        if (cardIndex) {
          const imageFile = Object.keys(zip.files).find(name => name.endsWith(`image_${cardIndex}.png`));
          if (imageFile && zip.files[imageFile]) {
            const imageBlob = await zip.files[imageFile].async('blob');
            cardData.image = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(imageBlob);
            });
          }
        }
        
        importedCards.push(cardData);
      }

      // Add imported cards
      importedCards.forEach(card => addCard(card));
      console.log(`Imported ${importedCards.length} cards`);
    } catch (error) {
      console.error('Error importing cards:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Options</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {cards.map((card) => (
            <Card key={card.id} className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => removeCard(card.id)}
              >
                <X className="h-4 w-4" />
              </Button>
              <CardContent className="flex space-x-4 pt-6">
                <Button
                  variant="outline"
                  size="icon"
                  className="w-24 h-24 flex-shrink-0"
                  onClick={() => handleImageUpload(card.id)}
                >
                  {card.image ? (
                    <img src={card.image} alt={card.title} className="w-full h-full object-cover" />
                  ) : (
                    <ImagePlus className="h-8 w-8" />
                  )}
                </Button>
                <div className="flex-1 space-y-2">
                  <Input
                    placeholder="Title"
                    value={card.title}
                    onChange={(e) => updateCard(card.id, "title", e.target.value)}
                  />
                  <Input
                    placeholder="Description"
                    value={card.description}
                    onChange={(e) => updateCard(card.id, "description", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
          <div className="flex space-x-2">
            <Button onClick={handleAddCard} className="flex-1">Add Option</Button>
            <Button onClick={handleExport} className="flex-grow-0">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => importInputRef.current?.click()} className="flex-grow-0">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
          </div>
        </div>
        <input
          type="file"
          ref={importInputRef}
          style={{ display: 'none' }}
          accept=".zip"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleImport(file);
            }
          }}
        />
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              // Existing image upload logic
              // This should be handled by the handleImageUpload function
            }
          }}
        />
      </CardContent>
    </Card>
  )
}