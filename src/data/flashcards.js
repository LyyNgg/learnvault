import { uuid } from '../lib/utils'

export const DECKS = [
  {
    name: 'Metrics Fundamentals',
    cards: [
      {
        id: uuid(),
        question: 'What is the difference between DAU and MAU, and when would you use each?',
        answer: 'DAU (Daily Active Users) measures engagement on a daily basis — best for high-frequency apps like messaging or social.\nMAU (Monthly Active Users) suits lower-frequency products like finance or e-commerce.\nDAU/MAU ratio = stickiness. Aim for >50% for engagement-heavy products.',
      },
      {
        id: uuid(),
        question: 'What is a North Star Metric and how do you choose one?',
        answer: 'A North Star Metric captures the core value your product delivers to customers. It should:\n• Reflect user value (not just business value)\n• Be leading, not lagging\n• Be actionable — one team decision should move it\nExamples: Spotify → time spent listening; Airbnb → nights booked.',
      },
      {
        id: uuid(),
        question: 'When would you prioritise retention over acquisition?',
        answer: 'When the product has found PMF but churn is high — acquiring more users into a leaky bucket destroys LTV.\nRetention first when: CAC is high, market is saturated, NPS is low, or cohort retention curves haven\'t flattened.',
      },
    ],
  },
  {
    name: 'Product Sense',
    cards: [
      {
        id: uuid(),
        question: 'Walk me through the CIRCLES framework for product design.',
        answer: 'C — Comprehend the situation\nI — Identify the customer\nR — Report customer needs\nC — Cut through prioritisation\nL — List solutions\nE — Evaluate trade-offs\nS — Summarise recommendation\n\nUse it to give structured answers to open-ended product design questions.',
      },
      {
        id: uuid(),
        question: 'How do you prioritise features when resources are limited?',
        answer: 'Common frameworks:\n• RICE: Reach × Impact × Confidence ÷ Effort\n• MoSCoW: Must/Should/Could/Won\'t\n• Impact vs Effort 2×2 matrix\n\nAlways anchor prioritisation to the product\'s North Star and current company stage.',
      },
    ],
  },
]
