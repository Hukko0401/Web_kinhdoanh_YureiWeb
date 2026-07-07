// shared/country-codes.ts
import * as countryCodesData from 'country-codes-list'


export interface CountryOption {
  iso2: string
  name: string
  dialCode: string
  flag: string // emoji
}

function isoToFlagEmoji(iso2: string): string {
  return iso2
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
}

const raw = countryCodesData.customList(
  'countryCode',
  '{countryNameEn}|{countryCallingCode}'
)

export const COUNTRIES: CountryOption[] = Object.entries(raw)
  .map(([iso2, value]) => {
    const [name, dialCode] = (value as string).split('|')
    return { iso2, name, dialCode: `+${dialCode}`, flag: isoToFlagEmoji(iso2) }
  })
  .sort((a, b) => a.name.localeCompare(b.name))

export const PREFERRED_COUNTRIES = ['VN', 'US', 'JP', 'KR', 'CN']