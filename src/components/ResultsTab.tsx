import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Card as CardType } from './types'

type ResultsTabProps = {
  cards: CardType[]
  overallWins: Record<string, number>
}

export function ResultsTab({ cards, overallWins }: ResultsTabProps) {
  const sortedCards = [...cards].sort((a, b) => (overallWins[b.id] || 0) - (overallWins[a.id] || 0))

  return (
    <div className="space-y-4">
      {sortedCards.map((card, index) => (
        <Card key={card.id}>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <span className="text-2xl font-bold">{index + 1}</span>
              <div>
                {card.title && <CardTitle>{card.title}</CardTitle>}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xl">🏆</span>
              <span className="text-xl font-bold">{overallWins[card.id] || 0}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}