import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'
import i18n from '../i18n'

describe('App boot', () => {
  beforeEach(async () => {
    localStorage.clear()
    await i18n.changeLanguage('fr')
  })

  it('renders the dashboard and starts empty (no sample festivals)', async () => {
    render(<App />)
    // Brand title in the header
    expect(await screen.findAllByText('Festival Wristband')).not.toHaveLength(0)
    // Empty-state call to action should be present on first run
    expect(await screen.findByText('Ajouter un festival')).toBeInTheDocument()
    // No festivals seeded
    const raw = localStorage.getItem('festival-wristband-data')
    const data = raw ? JSON.parse(raw) : { festivals: [] }
    expect(data.festivals).toHaveLength(0)
  })
})
