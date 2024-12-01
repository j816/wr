export const GPT_CONFIG = {
  model: 'gpt-4',
  temperature: 0.7,
  max_tokens: 2000,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
  systemMessage: {
    role: 'system',
    content: 'You are a helpful assistant.',
  },
  defaultErrorMessage: 'An error occurred while processing your request.',
  stream: false,
  n: 1,
  stop: null,
}; 