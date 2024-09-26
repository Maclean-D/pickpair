"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Card as CardType } from './types'
import { useMemo } from 'react'

type ResultsTabProps = {
  cards: CardType[]
  individualPicks: Record<string, string[]>
  eloHistory: Record<string, Record<string, number[]>>
}

export function ResultsTab({ cards, individualPicks, eloHistory }: ResultsTabProps) {
  const initialElo = useMemo(() => {
    return Math.max(400, Math.round(1000 / Math.sqrt(cards.length || 1)));
  }, [cards.length]);

  const calculateAverageElo = (cardId: string) => {
    const userElos = Object.values(eloHistory[cardId]);
    if (userElos.length === 0) return initialElo; // Use initialElo instead of hardcoded 400
    const sum = userElos.reduce((acc, elos) => acc + (elos.at(-1) ?? initialElo), 0);
    return sum / userElos.length;
  };

  const getHighestEloItem = (userName: string): string => {
    let highestElo = -Infinity;
    let highestEloItem = "No pick";

    Object.entries(eloHistory).forEach(([cardId, userElos]) => {
      const userElo = userElos[userName]?.at(-1) ?? initialElo;
      if (userElo > highestElo) {
        highestElo = userElo;
        highestEloItem = cards.find(card => card.id === cardId)?.title ?? "Unknown";
      }
    });

    return highestEloItem;
  };

  const sortedCards = [...cards].sort((a, b) => calculateAverageElo(b.id) - calculateAverageElo(a.id));

  const chartData = sortedCards.map(card => ({
    title: card.title,
    elo: Math.round(calculateAverageElo(card.id))
  }));

  const chartConfig = {
    elo: {
      label: "Average Elo Rating",
      color: "hsl(var(--primary))",
    },
    label: {
      color: "hsl(var(--background))",
    },
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Average Elo Ratings</CardTitle>
          <CardDescription>Average Elo rating for each option across all users</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{
                right: 16,
                left: 16,
                bottom: 16,
              }}
              width={600}
              height={400}
            >
              <CartesianGrid horizontal={false} />
              <YAxis
                dataKey="title"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                width={120}
              />
              <XAxis type="number" hide />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Bar
                dataKey="elo"
                fill="var(--primary)"
                radius={4}
              >
                <LabelList
                  dataKey="elo"
                  position="right"
                  offset={8}
                  className="fill-foreground"
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Individual Highest Rated Picks</CardTitle>
          <CardDescription>Each user&apos;s highest rated item based on Elo</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {Object.keys(individualPicks).map((name) => (
              <li key={name} className="flex justify-between items-center">
                <span className="font-medium">{name}</span>
                <span>{getHighestEloItem(name)}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}