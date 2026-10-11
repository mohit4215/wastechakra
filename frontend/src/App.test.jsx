import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, test } from 'vitest'

import App from './App'

describe('App shell smoke tests', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  test('shows login page when unauthenticated', () => {
    render(<App />)
    expect(screen.getByText(/Command Portal Sign In/i)).toBeInTheDocument()
  })

  test('shows public citizen page when navigating to report route', async () => {
    window.history.pushState({}, '', '/#/report')
    render(<App />)
    expect(await screen.findByText(/Lodge Citizen Grievance/i)).toBeInTheDocument()
  })
})
