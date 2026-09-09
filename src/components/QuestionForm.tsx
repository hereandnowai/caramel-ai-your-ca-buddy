import { useState, type FormEvent } from 'react'

interface QuestionFormProps {
  disabled: boolean
  onSubmit: (question: string) => void
}

export function QuestionForm({ disabled, onSubmit }: QuestionFormProps) {
  const [question, setQuestion] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedQuestion = question.trim()
    if (!trimmedQuestion || disabled) return
    onSubmit(trimmedQuestion)
    setQuestion('')
  }

  return (
    <form className="question-form" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor="question-input">Your question</label>
      <textarea
        id="question-input"
        name="question"
        value={question}
        onChange={(event) => setQuestion(event.target.value)}
        placeholder="Ask about GST, TDS, ITR deadlines..."
        rows={1}
        disabled={disabled}
        aria-describedby="question-hint"
      />
      <button className="send-button" type="submit" disabled={disabled || !question.trim()}>
        <span>Ask CA Buddy</span>
        <span aria-hidden="true">-&gt;</span>
      </button>
      <span className="question-form__hint" id="question-hint">Keep it general. Sensitive records do not belong here.</span>
    </form>
  )
}
