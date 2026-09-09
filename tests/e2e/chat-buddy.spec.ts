import { expect, test, type Page } from '@playwright/test'

interface GeminiMock {
  bodies: Record<string, unknown>[]
  releaseLoading: () => void
}

async function mockGemini(page: Page, answers: string[], delayed = false): Promise<GeminiMock> {
  const bodies: Record<string, unknown>[] = []
  let releaseLoading = () => {}
  const loadingGate = delayed
    ? new Promise<void>((resolve) => { releaseLoading = resolve })
    : Promise.resolve()

  await page.route(/generativelanguage\.googleapis\.com/, async (route) => {
    const body = JSON.parse(route.request().postData() ?? '{}') as Record<string, unknown>
    bodies.push(body)
    if (delayed) await loadingGate

    const answer = answers[Math.min(bodies.length - 1, answers.length - 1)]
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        candidates: [{
          content: { role: 'model', parts: [{ text: answer }] },
          finishReason: 'STOP',
        }],
      }),
    })
  })

  return { bodies, releaseLoading }
}

test.describe('CA Buddy acceptance flow', () => {
  test('shows the shell and an in-scope answer', async ({ page }) => {
    await mockGemini(page, ['GST returns depend on your filing frequency. Check the current due date and consult a CA for your exact case.'])
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'CA Buddy' })).toBeVisible()
    await expect(page.getByRole('log', { name: /conversation/i })).toBeVisible()
    await expect(page.getByText(/general information only/i)).toBeVisible()
    await page.getByRole('textbox', { name: /question/i }).fill('When is my next GST return due?')
    await page.getByRole('button', { name: /ask ca buddy/i }).click()

    await expect(page.getByText('When is my next GST return due?')).toBeVisible()
    await expect(page.getByText(/GST returns depend on your filing frequency/i)).toBeVisible()
  })

  test('shows the Chartered Accountant escalation response', async ({ page }) => {
    await mockGemini(page, ['This unusual cross-state case depends on facts I cannot verify. Please consult a Chartered Accountant.'])
    await page.goto('/')

    await page.getByRole('textbox', { name: /question/i }).fill('Does this apply to my unusual cross-state case?')
    await page.getByRole('button', { name: /ask ca buddy/i }).click()

    await expect(page.getByText(/consult a Chartered Accountant/i)).toBeVisible()
  })

  test('sends conversation context and clears it with New chat', async ({ page }) => {
    const mock = await mockGemini(page, ['First answer', 'Follow-up answer', 'Fresh answer'])
    await page.goto('/')
    const input = page.getByRole('textbox', { name: /question/i })

    await input.fill('First question')
    await page.getByRole('button', { name: /ask ca buddy/i }).click()
    await expect(page.getByText('First answer')).toBeVisible()
    await input.fill('Follow-up question')
    await page.getByRole('button', { name: /ask ca buddy/i }).click()
    await expect(page.getByText('Follow-up answer')).toBeVisible()
    expect(JSON.stringify(mock.bodies[1])).toContain('First question')

    await page.getByRole('button', { name: /new chat/i }).click()
    await expect(page.getByText('First question')).not.toBeVisible()
    await input.fill('Fresh question')
    await page.getByRole('button', { name: /ask ca buddy/i }).click()
    await expect(page.getByText('Fresh answer')).toBeVisible()
    expect(JSON.stringify(mock.bodies[2])).not.toContain('First question')
  })

  test('keeps loading visible and reports provider failure', async ({ page }) => {
    const mock = await mockGemini(page, ['Delayed answer'], true)
    await page.goto('/')
    await page.getByRole('textbox', { name: /question/i }).fill('Explain audit basics')
    await page.getByRole('button', { name: /ask ca buddy/i }).click()
    await expect(page.getByRole('status')).toContainText(/thinking/i)
    mock.releaseLoading()
    await expect(page.getByText('Delayed answer')).toBeVisible()

    await page.unroute(/generativelanguage\.googleapis\.com/)
    await page.route(/generativelanguage\.googleapis\.com/, (route) => route.abort())
    await page.getByRole('textbox', { name: /question/i }).fill('Try again')
    await page.getByRole('button', { name: /ask ca buddy/i }).click()
    await expect(page.getByRole('status')).toContainText(/couldn't get an answer/i)
  })
})