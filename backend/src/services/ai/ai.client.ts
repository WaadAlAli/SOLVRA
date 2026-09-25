import { InferenceClient } from '@huggingface/inference'

const token = process.env.HUGGINGFACE_API_KEY

if (!token) {
  throw new Error('HUGGINGFACE_API_KEY is not defined')
}

export const hfClient = new InferenceClient(token)