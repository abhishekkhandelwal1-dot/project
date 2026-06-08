export interface Conversation {
  id:                    string
  source:                'json' | 'sheets'
  phone:                 string
  customerName:          string
  archetypeKey:          string   // raw enum e.g. TRADE_IN_FOCUSED
  archetype:             string   // formatted label e.g. "Trade-in"
  outcome:               string   // TEST_DRIVE_BOOKED | CALLBACK_ARRANGED | DROPOFF | ''
  outcomeDetail:         string
  keyObservations:       string[]
  direction:             'inbound' | 'outbound'   // inbound = customer initiated, outbound = bot initiated
  testDriveConfirmed:    boolean  // true only if BETTY confirmed with date + order ID
  testDriveDate:         string | null // extracted date from confirmation
  testDriveOrderId:      string | null // extracted order ID from confirmation
  timestamp:             string
  messageCount:          number
  lastMessageText:       string
  firstMessageAt:        string
  lastMessageAt:         string
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
