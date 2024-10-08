"use client"

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card as CardType } from './types'
import { Play, SkipForward, Undo } from "lucide-react"
import { Progress } from "@/components/ui/progress"

type PairTabProps = {
  cards: CardType[]
  updateElo: (winnerId: string, loserId: string) => void
  setActiveTab: (tab: string) => void
  addIndividualPick: (name: string, cardTitle: string) => void
  setCurrentUser: (name: string) => void
}

export function PairTab({ cards, updateElo, setActiveTab, addIndividualPick, setCurrentUser }: PairTabProps) {
  const [name, setName] = useState('')
  const [nameSubmitted, setNameSubmitted] = useState(false)
  const [comparisons, setComparisons] = useState<[CardType, CardType][]>([])
  const [comparisonIndex, setComparisonIndex] = useState(0)
  const [currentPair, setCurrentPair] = useState<[CardType, CardType] | null>(null)
  const [isPortrait, setIsPortrait] = useState(false)
  const [comparisonHistory, setComparisonHistory] = useState<[CardType, CardType, CardType | null][]>([]);

  const filteredCards = useMemo(() => {
    return cards.filter(card => card.title.toLowerCase() !== name.toLowerCase());
  }, [cards, name]);

  const calculateComparisons = (cardCount: number) => {
    // Adjust this number to control how many comparisons each user makes
    const comparisonsPerCard = 5; // This means each card will appear 5 times
    return cardCount * comparisonsPerCard / 2;
  };

  useEffect(() => {
    if (!nameSubmitted) return;

    const totalComparisons = calculateComparisons(filteredCards.length);
    let allPairs: [CardType, CardType][] = [];
    
    // Generate all possible pairs
    for (let i = 0; i < filteredCards.length; i++) {
      for (let j = i + 1; j < filteredCards.length; j++) {
        allPairs.push([filteredCards[i], filteredCards[j]]);
      }
    }

    // Shuffle all pairs
    allPairs = shuffleArray(allPairs);

    // Select pairs ensuring each card appears an equal number of times
    const selectedPairs: [CardType, CardType][] = [];
    const cardAppearances: Record<string, number> = {};
    filteredCards.forEach(card => cardAppearances[card.id] = 0);

    while (selectedPairs.length < totalComparisons && allPairs.length > 0) {
      const pair = allPairs.pop()!;
      const [card1, card2] = pair;
      if (cardAppearances[card1.id] < 5 && cardAppearances[card2.id] < 5) {
        selectedPairs.push(pair);
        cardAppearances[card1.id]++;
        cardAppearances[card2.id]++;
      }
    }

    setComparisons(selectedPairs);
    setComparisonIndex(0);

    const checkOrientation = () => setIsPortrait(window.innerHeight > window.innerWidth);
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, [filteredCards, nameSubmitted]);

  useEffect(() => {
    if (comparisons.length > 0) {
      // Fix the type mismatch by explicitly creating a tuple
      const shuffledPair = shuffleArray([...comparisons[comparisonIndex]]);
      setCurrentPair([shuffledPair[0], shuffledPair[1]]);
    }
  }, [comparisonIndex, comparisons]);

  const handleChoice = (chosenCard: CardType | null) => {
    if (!currentPair) return;
    
    const [card1, card2] = currentPair;
    setComparisonHistory(prev => [...prev, [card1, card2, chosenCard]]);
    
    if (chosenCard) {
      const otherCard = chosenCard.id === card1.id ? card2 : card1;

      addIndividualPick(name, chosenCard.title || 'Untitled');
      updateElo(chosenCard.id, otherCard.id);
    }
    
    if (comparisonIndex + 1 >= comparisons.length) {
      setActiveTab("results");
    } else {
      setComparisonIndex(prevIndex => prevIndex + 1);
    }
  };

  const handleUndo = () => {
    if (comparisonHistory.length === 0) return;

    const lastComparison = comparisonHistory[comparisonHistory.length - 1];
    const [card1, card2, chosenCard] = lastComparison;

    if (chosenCard) {
      const otherCard = chosenCard.id === card1.id ? card2 : card1;
      // Reverse the Elo update
      updateElo(otherCard.id, chosenCard.id);
      // Remove the individual pick
      addIndividualPick(name, '');  // Assuming empty string removes the last pick
    }

    setComparisonIndex(prevIndex => prevIndex - 1);
    setComparisonHistory(prev => prev.slice(0, -1));
    setCurrentPair([card1, card2]);
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setNameSubmitted(true);
      setCurrentUser(name.trim());
    }
  };

  if (!nameSubmitted) {
    return (
      <form onSubmit={handleNameSubmit} className="space-y-4">
        <h2 className="text-2xl font-bold">Enter Your Name</h2>
        <p className="text-sm text-muted-foreground mb-4">
          This helps prevent voting for yourself and allows for personalized results.
        </p>
        <div className="flex space-x-2">
          <Input
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-grow"
          />
          <Button type="submit">
            <Play className="h-4 w-4 mr-2" />
            Start
          </Button>
        </div>
      </form>
    );
  }

  if (!currentPair) return null;

  const [card1, card2] = currentPair;

  const progressPercentage = (comparisonIndex / comparisons.length) * 100;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] relative"> {/* Add relative positioning */}
      <div className="flex flex-col space-y-4 mb-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            Pick Your Preference, {name}
          </h2>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleUndo} disabled={comparisonHistory.length === 0}>
              <Undo className="h-4 w-4 mr-2" />
              Undo
            </Button>
            <Button variant="outline" onClick={() => handleChoice(null)}>
              <SkipForward className="h-4 w-4 mr-2" />
              Skip
            </Button>
          </div>
        </div>
        <Progress value={progressPercentage} className="w-full" />
      </div>
      <div className={`flex-grow flex ${isPortrait ? 'flex-col' : 'flex-row'} gap-4 overflow-hidden perspective-1000 relative z-10`}>
        {[card1, card2].map((card, index) => (
          <Card 
            key={card.id} 
            className={`cursor-pointer overflow-hidden flex-1 flex flex-col transition-all duration-300 ease-in-out hover:scale-105 z-20 ${
              index === 0 ? 'hover:-rotate-3' : 'hover:rotate-3'
            }`}
            style={{ transformStyle: 'preserve-3d' }}
            onClick={() => handleChoice(card)}
          >
            {card.image && (
              <div className="flex-grow relative">
                <img 
                  src={card.image} 
                  alt={card.title} 
                  className="absolute inset-0 w-full h-full object-contain"
                />
              </div>
            )}
            <CardContent className="p-4 flex-shrink-0">
              <div className="overflow-y-auto max-h-32"> {/* Allow scrolling for long content */}
                {card.title && <CardTitle className="mb-2 text-xl">{card.title}</CardTitle>}
                {card.description && <p className="text-base">{card.description}</p>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}