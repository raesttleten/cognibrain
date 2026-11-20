import { entryProfile } from './storage.js'

const SEPARATOR = ';'
const HEADER = ['Participante', 'Fecha', 'Hora', 'Juego', 'Métrica', 'Valor', 'Total', 'Unidad']

function pad(n) {
  return String(n).padStart(2, '0')
}

function splitDate(iso) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ['', '']
  return [
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  ]
}

function splitValue(value) {
  const text = String(value ?? '').trim()
  const ratio = text.match(/^(\d+)\s*\/\s*(\d+)$/)
  if (ratio) return [ratio[1], ratio[2], '']
  const unit = text.match(/^(\d+(?:[.,]\d+)?)\s*(ms|s)$/)
  if (unit) return [unit[1].replace('.', ','), '', unit[2]]
  if (text === '—') return ['', '', '']
  return [text, '', '']
}

function escapeCell(cell) {
  const text = String(cell)
  return /[";\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function historyToCsv(entries) {
  const rows = [HEADER]
  entries.forEach((entry) => {
    const [day, time] = splitDate(entry.date)
    entry.items.forEach((item) => {
      rows.push([entryProfile(entry), day, time, entry.gameTitle, item.label, ...splitValue(item.value)])
    })
  })
  return rows.map((row) => row.map(escapeCell).join(SEPARATOR)).join('\r\n')
}

export function downloadHistoryCsv(entries) {
  try {
    const blob = new Blob(['﻿', historyToCsv(entries)], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const [day] = splitDate(new Date().toISOString())
    const link = document.createElement('a')
    link.href = url
    link.download = `cognibrain-resultados-${day}.csv`
    document.body.appendChild(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    return true
  } catch {
    return false
  }
}
