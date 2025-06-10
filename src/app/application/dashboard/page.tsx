'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts'
import { format } from 'date-fns'

type OverviewStats = {
  totalAccounts: number
  totalData: number
  totalLocations: number
}

type SubmissionByDate = {
  date: string
  count: number
}

type DataItem = {
  id: number
  timestamp: string
  account: { id: string; name: string }
  wqi: { [model: string]: { value: number; confidence: number } }
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1', '#a4de6c', '#d0ed57', '#fa8072', '#6a5acd', '#20b2aa']

export default function DashboardPage() {
  const [overview, setOverview] = useState<OverviewStats | null>(null)
  const [byDate, setByDate] = useState<SubmissionByDate[]>([])
  const [byCountry, setByCountry] = useState<{ country: string; count: number }[]>([])
  const [rawData, setRawData] = useState<DataItem[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewRes, dateRes, dataRes, countryRes] = await Promise.all([
          fetch('/api/stats/overview'),
          fetch('/api/stats/by-date'),
          fetch('/api/data'),
          fetch('/api/stats/by-country'),
        ])
        const overview = await overviewRes.json()
        const byDateRaw = await dateRes.json()
        const rawData = await dataRes.json()
        const countryData = await countryRes.json()

        const byDate = byDateRaw.map((d: any) => ({
          date: format(new Date(d.date), 'yyyy-MM-dd'),
          count: Number(d.count),
        }))

        setOverview(overview)
        setByDate(byDate)
        setRawData(rawData)
        setByCountry(countryData)
      } catch (err) {
        console.error('Dashboard fetch error:', err)
      }
    }

    fetchData()
  }, [])

  // Charts data processing
  const wqiSums: Record<string, { total: number; count: number }> = {}
  const dailyWQI: Record<string, { total: number; count: number }> = {}

  rawData.forEach((d) => {
    const date = format(new Date(d.timestamp), 'yyyy-MM-dd')
    for (const [model, val] of Object.entries(d.wqi)) {
      if (!wqiSums[model]) wqiSums[model] = { total: 0, count: 0 }
      wqiSums[model].total += val.value
      wqiSums[model].count += 1

      if (!dailyWQI[date]) dailyWQI[date] = { total: 0, count: 0 }
      dailyWQI[date].total += val.value
      dailyWQI[date].count += 1
    }
  })

  const wqiChartData = Object.entries(wqiSums).map(([model, stat]) => ({
    model,
    averageWQI: stat.total / stat.count,
  }))

  const modelUsage: Record<string, number> = {}
  rawData.forEach((d) => {
    for (const model of Object.keys(d.wqi)) {
      modelUsage[model] = (modelUsage[model] || 0) + 1
    }
  })
  const modelUsageData = Object.entries(modelUsage).map(([model, count]) => ({
    model,
    count,
  }))

  const userCounts: Record<string, { name: string; count: number }> = {}
  rawData.forEach((d) => {
    const { id, name } = d.account
    if (!userCounts[id]) userCounts[id] = { name, count: 0 }
    userCounts[id].count += 1
  })
  const userChartData = Object.values(userCounts).sort((a, b) => b.count - a.count).slice(0, 10)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 auto-rows-min">
      {/* Overview */}
      {overview && (
        <>
          <Card className="col-span-1"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Accounts</p><p className="text-2xl font-bold">{overview.totalAccounts}</p></CardContent></Card>
          <Card className="col-span-1"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Data Points</p><p className="text-2xl font-bold">{overview.totalData}</p></CardContent></Card>
          <Card className="col-span-1"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Locations</p><p className="text-2xl font-bold">{overview.totalLocations}</p></CardContent></Card>
        </>
      )}

      {/* Submissions Over Time */}
      <Card className="col-span-2">
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold mb-2">Data Submissions Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={byDate}>
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Users */}
      <Card className="col-span-1">
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold mb-2">Top Users by Submissions</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={userChartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* WQI by Model */}
      <Card className="col-span-1">
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold mb-2">Average WQI by Model</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={wqiChartData}>
              <XAxis dataKey="model" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="averageWQI" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Model Usage Distribution - 1 column */}
      <Card className="col-span-1">
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold mb-2">Model Usage Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
              data={modelUsageData}
              dataKey="count"
              nameKey="model"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ model, percent }) =>
                `${model} (${(percent * 100).toFixed(0)}%)`
              }
              >
              {modelUsageData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
              </Pie>
              <Tooltip
              formatter={(value: number, name: string) => [`${value}`, 'Submissions']}
              contentStyle={{ backgroundColor: '#fff', borderRadius: 8, border: '1px solid #eee' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Data by Country - 1 column */}
      <Card className="col-span-1">
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold mb-2">Data by Country</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
            <Pie
                data={byCountry}
                dataKey="count"
                nameKey="country"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ country }) => country}
              >
                {byCountry.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
    </div>
  )
}
