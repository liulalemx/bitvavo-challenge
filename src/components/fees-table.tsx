import { useMemo, useState } from "react"
import rawData from "../../data/cleaned_data_large.json"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChevronUp, ArrowUp, ArrowDown, ChevronsUpDown } from "lucide-react"

type FeeSide = Record<string, number | null | undefined>

interface Entry {
  symbol: string
  source: string
  datetime: string
  fees?: {
    maker?: FeeSide
    taker?: FeeSide
  }
}

const NOTIONALS = ["100", "500", "1000"] as const

function parseDate(value: string | undefined | null): Date | null {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

function getLatestBySymbolSource(raw: Entry[]): Entry[] {
  const map = new Map<string, Entry>()
  for (const entry of raw) {
    const key = `${entry.symbol}||${entry.source}`
    const dt = parseDate(entry.datetime)
    if (!map.has(key)) {
      map.set(key, entry)
    } else {
      const prev = map.get(key)!
      const prevDt = parseDate(prev.datetime)
      if (
        (dt && !prevDt) ||
        (dt && prevDt && dt.getTime() > prevDt.getTime())
      ) {
        map.set(key, entry)
      }
    }
  }
  return Array.from(map.values())
}

function FeesTable() {
  const data = rawData as unknown as Entry[]

  const [notional, setNotional] = useState<(typeof NOTIONALS)[number]>("100")
  const [query, setQuery] = useState<string>("")
  const [sortBy, setSortBy] = useState<{
    field: "symbol" | "source" | "maker" | "taker"
    dir: "asc" | "desc"
  }>({
    field: "symbol",
    dir: "asc",
  })

  const latest = useMemo(() => getLatestBySymbolSource(data), [data])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return latest
    return latest.filter((r) => {
      return (
        (r.symbol || "").toLowerCase().includes(q) ||
        (r.source || "").toLowerCase().includes(q)
      )
    })
  }, [latest, query])

  const sorted = useMemo(() => {
    const arr = [...filtered]
    const dir = sortBy.dir === "asc" ? 1 : -1

    const getFee = (row: Entry, which: "maker" | "taker"): number | null => {
      const fee = row.fees?.[which]?.[notional as string]
      return typeof fee === "number" ? fee : null
    }

    arr.sort((a, b) => {
      if (sortBy.field === "symbol") {
        return dir * a.symbol.localeCompare(b.symbol)
      }
      if (sortBy.field === "source") {
        return dir * a.source.localeCompare(b.source)
      }
      if (sortBy.field === "maker") {
        const va = getFee(a, "maker")
        const vb = getFee(b, "maker")
        if (va === null && vb === null) return 0
        if (va === null) return 1
        if (vb === null) return -1
        return dir * (va - vb)
      }
      if (sortBy.field === "taker") {
        const va = getFee(a, "taker")
        const vb = getFee(b, "taker")
        if (va === null && vb === null) return 0
        if (va === null) return 1
        if (vb === null) return -1
        return dir * (va - vb)
      }
      return 0
    })

    return arr
  }, [filtered, sortBy, notional])

  function toggleSort(field: "symbol" | "source" | "maker" | "taker") {
    setSortBy((s) => {
      if (s.field === field) {
        return { field, dir: s.dir === "asc" ? "desc" : "asc" }
      }
      return { field, dir: "asc" }
    })
  }

  const formatFee = (val: number | null | undefined) =>
    val === null || val === undefined ? "—" : Number(val).toLocaleString()

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search symbol or source"
              className="w-full sm:w-64"
            />

            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-600">Notional:</div>
              <Select
                onValueChange={(v) =>
                  setNotional(v as (typeof NOTIONALS)[number])
                }
                defaultValue={notional}
              >
                <SelectTrigger className="w-28">
                  <SelectValue placeholder={notional} />
                </SelectTrigger>
                <SelectContent>
                  {NOTIONALS.map((n) => (
                    <SelectItem key={n} value={n}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-500">
              Showing <strong>{sorted.length}</strong>
            </div>
            <Button variant="ghost" size="sm">
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => toggleSort("symbol")}
                  >
                    <div className="flex items-center gap-2">
                      Symbol
                      {sortBy.field === "symbol" ? (
                        sortBy.dir === "asc" ? (
                          <ArrowUp size={12} />
                        ) : (
                          <ArrowDown size={12} />
                        )
                      ) : (
                        <ChevronsUpDown size={12} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => toggleSort("source")}
                  >
                    <div className="flex items-center gap-2">
                      Source
                      {sortBy.field === "source" ? (
                        sortBy.dir === "asc" ? (
                          <ArrowUp size={12} />
                        ) : (
                          <ArrowDown size={12} />
                        )
                      ) : (
                        <ChevronUp size={12} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-right cursor-pointer"
                    onClick={() => toggleSort("maker")}
                  >
                    <div className="flex items-center justify-end gap-2">
                      Maker ({notional})
                      {sortBy.field === "maker" ? (
                        sortBy.dir === "asc" ? (
                          <ArrowUp size={12} />
                        ) : (
                          <ArrowDown size={12} />
                        )
                      ) : (
                        <ChevronsUpDown size={12} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="text-right cursor-pointer"
                    onClick={() => toggleSort("taker")}
                  >
                    <div className="flex items-center justify-end gap-2">
                      Taker ({notional})
                      {sortBy.field === "taker" ? (
                        sortBy.dir === "asc" ? (
                          <ArrowUp size={12} />
                        ) : (
                          <ArrowDown size={12} />
                        )
                      ) : (
                        <ChevronsUpDown size={12} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Last updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((row, idx) => {
                  const maker = row.fees?.maker?.[notional as string] ?? null
                  const taker = row.fees?.taker?.[notional as string] ?? null
                  const dt = parseDate(row.datetime)
                  return (
                    <TableRow key={`${row.symbol}-${row.source}-${idx}`}>
                      <TableCell>{row.symbol}</TableCell>
                      <TableCell>{row.source}</TableCell>
                      <TableCell className="text-right">
                        {formatFee(maker)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatFee(taker)}
                      </TableCell>
                      <TableCell className="text-right text-sm text-gray-500">
                        {dt
                          ? dt.toISOString().slice(0, 19).replace("T", " ")
                          : "—"}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default FeesTable
