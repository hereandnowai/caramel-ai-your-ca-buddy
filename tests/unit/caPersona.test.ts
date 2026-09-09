import { describe, expect, it } from 'vitest'
import { CA_DISCLAIMER, CA_PERSONA_PROMPT } from '../../src/prompts/caPersona'

describe('CA persona', () => {
  it('names the supported topics and professional escalation boundary', () => {
    expect(CA_PERSONA_PROMPT).toMatch(/GST/i)
    expect(CA_PERSONA_PROMPT).toMatch(/TDS/i)
    expect(CA_PERSONA_PROMPT).toMatch(/ITR deadlines/i)
    expect(CA_PERSONA_PROMPT).toMatch(/audit basics/i)
    expect(CA_PERSONA_PROMPT).toMatch(/Chartered Accountant/i)
    expect(CA_DISCLAIMER).toMatch(/general information only/i)
  })
})