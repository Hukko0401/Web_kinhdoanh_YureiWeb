import { Component, forwardRef } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
import { COUNTRIES, PREFERRED_COUNTRIES, CountryOption } from '../../shared/country-codes'

@Component({
  selector: 'app-phone-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './phone-input.html',
  styleUrl: './phone-input.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PhoneInput),
      multi: true
    }
  ]
})
export class PhoneInput implements ControlValueAccessor {
  countries = COUNTRIES
  preferred = COUNTRIES.filter(c => PREFERRED_COUNTRIES.includes(c.iso2))
  others = COUNTRIES.filter(c => !PREFERRED_COUNTRIES.includes(c.iso2))

  selectedCountry: CountryOption = this.countries.find(c => c.iso2 === 'VN') || this.countries[0]
  localNumber = ''
  dropdownOpen = false

  private onChange: (value: string) => void = () => {}
  private onTouched: () => void = () => {}

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen
  }

  selectCountry(country: CountryOption) {
    this.selectedCountry = country
    this.dropdownOpen = false
    this.emitValue()
  }

  onLocalNumberChange(value: string) {
    this.localNumber = value.replace(/\D/g, '')
    this.emitValue()
  }

  private emitValue() {
    // Trả ra dạng E.164-like: +84933498894
    const fullNumber = this.localNumber ? `${this.selectedCountry.dialCode}${this.localNumber}` : ''
    this.onChange(fullNumber)
    this.onTouched()
  }

  writeValue(value: string): void {
    if (!value) {
      this.localNumber = ''
      return
    }
    // Cố gắng tách dial code khỏi số khi load giá trị có sẵn
    const match = this.countries.find(c => value.startsWith(c.dialCode))
    if (match) {
      this.selectedCountry = match
      this.localNumber = value.slice(match.dialCode.length)
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn
  }
}