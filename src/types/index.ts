export interface Conversation {
  id:              string
  source:          'json' | 'sheets'
  phone:           string
  customerName:    string
  archetype:       string
  outcome:         string
  outcomeDetail:   string
  timestamp:       string
  messageCount:    number
  lastMessageText: string
  firstMessageAt:  string
  lastMessageAt:   string
}

export interface Message {
  engagementId:  string
  timestamp:     string
  direction:     'sent' | 'received'
  customerName:  string | null
  phone:         string
  text:          string
  senderOwnerId: string | null
}

export interface ConversationsApiResponse {
  conversations: Conversation[]
  total:         number
  page:          number
  limit:         number
  totalPages:    number
}

export interface ConversationApiResponse {
  messages:     Message[]
  phone:        string
  customerName: string
  date:         string
  messageCount: number
}
