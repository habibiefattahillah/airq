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
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<'1w' | '1m' | '1y' | 'all'>('1m')

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

        const byDate = byDateRaw.map((d: { date: string; count: number }) => ({
          date: format(new Date(d.date), 'yyyy-MM-dd'),
          count: Number(d.count),
        }))

        setOverview(overview)
        setByDate(byDate)
        setRawData(rawData)
        setByCountry(countryData)
      } catch (err) {
        console.error('Dashboard fetch error:', err)
      } finally {
        setLoading(false)
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

  // const wqiChartData = Object.entries(wqiSums).map(([model, stat]) => ({
  //   model,
  //   averageWQI: stat.total / stat.count,
  // }))

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

  // const userCounts: Record<string, { name: string; count: number }> = {}
  // rawData.forEach((d) => {
  //   const { id, name } = d.account
  //   if (!userCounts[id]) userCounts[id] = { name, count: 0 }
  //   userCounts[id].count += 1
  // })
  // const userChartData = Object.values(userCounts).sort((a, b) => b.count - a.count).slice(0, 10)
  // // Filter byDate according to timeframe
  const now = new Date()
  let filteredByDate = byDate
  if (timeframe !== 'all') {
    let startDate: Date
    if (timeframe === '1w') {
      startDate = new Date(now)
      startDate.setDate(now.getDate() - 6)
    } else if (timeframe === '1m') {
      startDate = new Date(now)
      startDate.setMonth(now.getMonth() - 1)
    } else if (timeframe === '1y') {
      startDate = new Date(now)
      startDate.setFullYear(now.getFullYear() - 1)
    } else {
      startDate = new Date(0)
    }
    filteredByDate = byDate.filter(d => new Date(d.date) >= startDate)
  }

  const wqiValueDist: Record<number, number> = {
    0: 0,
    1: 0,
    2: 0,
    3: 0,
    4: 0,
  }
  
  rawData.forEach((d) => {
    for (const modelData of Object.values(d.wqi)) {
      const value = Math.round(modelData.value)
      if (value >= 0 && value <= 4) {
        wqiValueDist[value] += 1
      }
    }
  })
  
  const wqiDistributionChartData = Object.entries(wqiValueDist).map(([value, count]) => ({
    value: Number(value),
    count,
  }))

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-lg text-muted-foreground">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 p-2 md:p-6 auto-rows-min">
      {/* Overview */}
      {overview && (
        <>
          <div className="grid grid-cols-3 gap-4 md:col-span-3">
          <Card className="col-span-1">
            <CardContent className="p-3 md:p-4">
              <p className="text-xs md:text-sm text-muted-foreground">Accounts</p>
              <p className="text-xl md:text-2xl font-bold">{overview.totalAccounts}</p>
            </CardContent>
          </Card>
          <Card className="col-span-1">
            <CardContent className="p-3 md:p-4">
              <p className="text-xs md:text-sm text-muted-foreground">Data Points</p>
              <p className="text-xl md:text-2xl font-bold">{overview.totalData}</p>
            </CardContent>
          </Card>
          <Card className="col-span-1">
            <CardContent className="p-3 md:p-4">
              <p className="text-xs md:text-sm text-muted-foreground">Locations</p>
              <p className="text-xl md:text-2xl font-bold">{overview.totalLocations}</p>
            </CardContent>
          </Card>
          </div>
        </>
      )}

      {/* Submissions Over Time */}
      <Card className="col-span-1 md:col-span-3">
        <CardContent className="p-3 md:p-4">
          <h2 className="text-base md:text-lg font-semibold mb-2">Data Submissions Over Time</h2>
          <div className="w-full h-[200px] md:h-[300px]">
            <div className="flex items-center gap-2 mb-2">
              {['1w', '1m', '1y', 'all'].map((range) => (
              <button
                key={range}
                className={`px-2 py-1 rounded text-xs border ${timeframe === range ? 'bg-blue-100 dark:bg-blue-600 border-blue-400 font-semibold' : 'border-gray-200'}`}
                onClick={() => setTimeframe(range as '1w' | '1m' | '1y' | 'all')}
              >
                {range === '1w' ? '1 Week' : range === '1m' ? '1 Month' : range === '1y' ? '1 Year' : 'All Time'}
              </button>
              ))}
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredByDate}>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Users */}
      {/* <Card className="col-span-1">
        <CardContent className="p-3 md:p-4">
          <h2 className="text-base md:text-lg font-semibold mb-2">Top Users by Submissions</h2>
          <div className="w-full h-[200px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userChartData}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card> */}

      {/* WQI Value Distribution */}
      <Card className="col-span-1">
        <CardContent className="p-3 md:p-4">
          <h2 className="text-base md:text-lg font-semibold mb-2">WQI Value Distribution</h2>
          <div className="w-full h-[200px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wqiDistributionChartData}>
                <XAxis dataKey="value" tick={{ fontSize: 10 }} label={{ value: 'WQI Value', position: 'insideBottom', offset: -5 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>


      {/* Model Usage Distribution*/}
      <Card className="col-span-1">
        <CardContent className="p-3 md:p-4">
          <h2 className="text-base md:text-lg font-semibold mb-2">Model Usage Distribution</h2>
          <div className="w-full h-[200px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={modelUsageData}
                  dataKey="count"
                  nameKey="model"
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  label={({ model, percent }) =>
                    `${model} (${(percent * 100).toFixed(0)}%)`
                  }
                >
                  {modelUsageData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value}`, 'Submissions']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: 8, border: '1px solid #eee' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* WQI by Model */}
      {/* <Card className="col-span-1">
        <CardContent className="p-3 md:p-4">
          <h2 className="text-base md:text-lg font-semibold mb-2">Average WQI by Model</h2>
          <div className="w-full h-[200px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wqiChartData}>
                <XAxis dataKey="model" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="averageWQI" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card> */}

      {/* Data by Country*/}
      <Card className="col-span-1">
        <CardContent className="p-3 md:p-4">
          <h2 className="text-base md:text-lg font-semibold mb-2">Data by Country</h2>
          <div className="w-full h-[200px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={byCountry}
                  dataKey="count"
                  nameKey="country"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label={({ country }) => country}
                >
                  {byCountry.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
