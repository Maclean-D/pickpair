import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card as CardType } from './types'
import { ImagePlus, X } from "lucide-react"

type PickTabProps = {
  cards: CardType[]
  addCard: (card: Omit<CardType, 'id'>) => void
  updateCard: (id: string, field: keyof CardType, value: string) => void
  removeCard: (id: string) => void
}

export function PickTab({ cards, addCard, updateCard, removeCard }: PickTabProps) {
  const [newCard, setNewCard] = useState<Omit<CardType, 'id'>>({ title: '', description: '', image: '' })

  const handleAddCard = () => {
    addCard(newCard)
    setNewCard({ title: '', description: '', image: '' })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pick</CardTitle>
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
                <Button variant="outline" size="icon" className="w-24 h-24 flex-shrink-0">
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
                  <Textarea
                    placeholder="Description"
                    value={card.description}
                    onChange={(e) => updateCard(card.id, "description", e.target.value)}
                  />
                  <Input
                    placeholder="Image URL"
                    value={card.image}
                    onChange={(e) => updateCard(card.id, "image", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
          <Button onClick={handleAddCard} className="w-full">Add Card</Button>
        </div>
      </CardContent>
    </Card>
  )
}