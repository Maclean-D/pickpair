"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Card as CardType } from './types'

type ResultsTabProps = {
  cards: CardType[]
  overallWins: Record<string, number>
  individualPicks: Record<string, string[]>
}

export function ResultsTab({ cards, overallWins, individualPicks }: ResultsTabProps) {
  const sortedCards = [...cards].sort((a, b) => (overallWins[b.id] || 0) - (overallWins[a.id] || 0))

  const chartData = sortedCards.map(card => ({
    title: card.title,
    votes: overallWins[card.id] || 0
  }))

  const chartConfig = {
    votes: {
      label: "Votes",
      color: "hsl(var(--primary))",
    },
    label: {
      color: "hsl(var(--background))",
    },
  }

  const getOverallPick = (picks: string[]): string => {
    if (picks.length === 0) return "No pick";
    return picks[picks.length - 1];
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Voting Overview</CardTitle>
          <CardDescription>Total votes for each option</CardDescription>
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
                dataKey="votes"
                fill="var(--primary)"
                radius={4}
              >
                <LabelList
                  dataKey="votes"
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
          <CardTitle>Individual Picks</CardTitle>
          <CardDescription>What individual people picked</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {Object.entries(individualPicks).map(([name, picks]) => (
              <li key={name} className="flex justify-between items-center">
                <span className="font-medium">{name}</span>
                <span>{getOverallPick(picks)}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}