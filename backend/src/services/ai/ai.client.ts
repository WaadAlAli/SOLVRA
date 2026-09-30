import { InferenceClient } from '@huggingface/inference'

const token = process.env.HUGGINGFACE_API_KEY

const AI_REQUEST_TIMEOUT_MS = 30_000

const fetchWithTimeout: typeof fetch = (input, init) => {
  const timeoutSignal = AbortSignal.timeout(AI_REQUEST_TIMEOUT_MS)
  const signal = init?.signal

  return fetch(input, {
    ...init,
    signal: signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal,
  })
}

if (!token) {
  throw new Error('HUGGINGFACE_API_KEY is not defined')
}

export const hfClient = new InferenceClient(token, {
  fetch: fetchWithTimeout,
})
