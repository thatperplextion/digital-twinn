// Digital Twin Types
export interface DigitalTwin {
  id: string
  entityType: string
  name: string
  description: string
  staticAttributes: Record<string, any>
  dynamicState: Record<string, any>
  behavioralMetrics: BehavioralMetrics
  temporalPatterns: TemporalPatterns
  contextualMemory: ContextualMemory
  currentState: TwinState
  stateHistory: TwinState[]
  health: TwinHealth
  createdAt: string
  lastUpdatedAt: string
  lastEventAt: string
  version: number
  tags: string[]
  tenantId: string
}

export interface TwinSnapshot {
  id: string
  entityType: string
  name: string
  description: string
  staticAttributes: Record<string, any>
  dynamicState: Record<string, any>
  behavioralMetrics: BehavioralMetrics
  health: TwinHealth
  currentStateName: string
  stateConfidence: number
  lastUpdatedAt: string
  snapshotTime: string
}

export interface BehavioralMetrics {
  activityScore: number
  riskScore: number
  anomalyScore: number
  engagementScore: number
  performanceScore: number
  customMetrics: Record<string, number>
  lastCalculatedAt: string
}

export interface TemporalPatterns {
  hourlyActivity: Record<string, number>
  dailyActivity: Record<string, number>
  weeklyActivity: Record<string, number>
  peakActivityTimes: string[]
  seasonalPatterns: Record<string, any>
}

export interface ContextualMemory {
  shortTermMemory: any[]
  longTermPatterns: Record<string, any>
  frequentContexts: string[]
  lastContexts: any[]
  memorySize: number
}

export interface TwinState {
  id: string
  twinId: string
  stateName: string
  type: 'INITIAL' | 'ACTIVE' | 'IDLE' | 'WARNING' | 'CRITICAL' | 'TERMINAL'
  properties: Record<string, any>
  confidence: number
  transitionType: 'EVENT_DRIVEN' | 'TIME_BASED' | 'RULE_BASED' | 'ML_PREDICTED' | 'SYSTEM'
  transitionProbability: number
  enteredAt: string
  exitedAt?: string
  metadata: Record<string, any>
}

export interface TwinHealth {
  status: 'HEALTHY' | 'DEGRADED' | 'WARNING' | 'CRITICAL' | 'UNKNOWN'
  healthScore: number
  lastHealthCheck: string
  issues: HealthIssue[]
  metrics: Record<string, number>
}

export interface HealthIssue {
  type: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  message: string
  detectedAt: string
  resolved: boolean
}

// Event Types
export interface TwinEvent {
  id: string
  twinId: string
  eventType: string
  category: string
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL'
  source: string
  sourceType: string
  payload: Record<string, any>
  headers: Record<string, string>
  timestamp: string
  receivedAt: string
  correlationId: string
  sessionId: string
  status: 'RECEIVED' | 'PROCESSING' | 'PROCESSED' | 'FAILED'
  traceId: string
}

// Prediction Types
export interface Prediction {
  id: string
  twinId: string
  type: 'NEXT_ACTION' | 'STATE_TRANSITION' | 'RISK_FORECAST' | 'BEHAVIOR_TRAJECTORY' | 'FAILURE_PROBABILITY'
  description: string
  predictedOutcome: string
  predictedValues: Record<string, any>
  probability: number
  confidence: number
  timeHorizon: string
  predictionTime: string
  expiresAt: string
  modelUsed: string
  modelVersion: string
  features: Record<string, any>
  explanation: PredictionExplanation
  status: 'PENDING' | 'VALIDATED' | 'OCCURRED' | 'EXPIRED' | 'INVALIDATED'
  actualOutcome?: string
}

export interface PredictionExplanation {
  summary: string
  keyFactors: Factor[]
  confidence: string
  methodology: string
}

export interface Factor {
  name: string
  value: any
  impact: number
  direction: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'
}

// Anomaly Types
export interface Anomaly {
  id: string
  twinId: string
  type: 'BEHAVIORAL' | 'STATISTICAL' | 'TEMPORAL' | 'SEQUENCE' | 'CONTEXTUAL'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  description: string
  affectedMetrics: string[]
  expectedValue: any
  actualValue: any
  deviation: number
  deviationPercentage: number
  detectedAt: string
  baselineReference: string
  riskScore: number
  explanation: AnomalyExplanation
  status: 'DETECTED' | 'INVESTIGATING' | 'CONFIRMED' | 'RESOLVED' | 'FALSE_POSITIVE'
  resolvedAt?: string
  resolution?: string
}

export interface AnomalyExplanation {
  rootCause: string
  contributingFactors: Factor[]
  historicalContext: string
  recommendations: string[]
}

// Action Types
export interface Action {
  id: string
  twinId: string
  type: 'ALERT' | 'MITIGATION' | 'OPTIMIZATION' | 'INTERVENTION' | 'NOTIFICATION' | 'WORKFLOW'
  name: string
  description: string
  triggerType: 'PREDICTION' | 'ANOMALY' | 'RULE' | 'SCHEDULE' | 'MANUAL'
  triggerReference: string
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL'
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  parameters: Record<string, any>
  result?: ActionResult
  createdAt: string
  startedAt?: string
  completedAt?: string
  executionTimeMs?: number
}

export interface ActionResult {
  success: boolean
  message: string
  outputs: Record<string, any>
  sideEffects: string[]
}

// Dashboard Types
export interface DashboardStats {
  totalTwins: number
  activeTwins: number
  healthyTwins: number
  warningTwins: number
  criticalTwins: number
  totalEvents: number
  eventsPerSecond: number
  totalPredictions: number
  predictionAccuracy: number
  totalAnomalies: number
  activeAnomalies: number
  totalActions: number
  actionsToday: number
  avgLatencyMs: number
  systemHealth: number
}

export interface StreamUpdate {
  updateId: string
  type: 'STATE_CHANGE' | 'PREDICTION' | 'ANOMALY' | 'ACTION' | 'METRIC_UPDATE' | 'HEALTH_CHANGE' | 'TWIN_UPDATED' | 'ANOMALY_DETECTED' | 'PREDICTION_GENERATED' | 'ACTION_EXECUTED' | 'STATS_UPDATE'
  twinId: string
  payload: any
  timestamp: string
  severity?: string
}

// Explainability Report
export interface ExplainabilityReport {
  id: string
  twinId: string
  generatedAt: string
  eventChain: EventChainItem[]
  stateTransitions: StateTransitionItem[]
  decisionPoints: DecisionPoint[]
  rootCauseAnalysis: RootCauseAnalysis
  recommendations: string[]
  confidence: number
}

export interface EventChainItem {
  eventId: string
  eventType: string
  timestamp: string
  impact: string
}

export interface StateTransitionItem {
  fromState: string
  toState: string
  trigger: string
  timestamp: string
  probability: number
}

export interface DecisionPoint {
  id: string
  type: string
  decision: string
  reasoning: string
  confidence: number
  timestamp: string
}

export interface RootCauseAnalysis {
  primaryCause: string
  contributingFactors: string[]
  timeline: TimelineItem[]
  confidence: number
}

export interface TimelineItem {
  timestamp: string
  event: string
  significance: 'LOW' | 'MEDIUM' | 'HIGH'
}

// Create Twin Request
export interface CreateTwinRequest {
  entityType: string
  name: string
  description: string
  staticAttributes: Record<string, any>
  initialState: Record<string, any>
  tags: string[]
  tenantId?: string
}

// Simulation Types
export interface SimulationRequest {
  twinId: string
  scenario: string
  parameters: Record<string, any>
  duration: string
  steps: number
}

export interface SimulationResult {
  id: string
  twinId: string
  scenario: string
  steps: SimulationStep[]
  summary: SimulationSummary
  startTime: string
  endTime: string
}

export interface SimulationStep {
  stepNumber: number
  timestamp: string
  state: TwinState
  predictions: Prediction[]
  anomalies: Anomaly[]
  actions: Action[]
}

export interface SimulationSummary {
  totalSteps: number
  stateChanges: number
  anomaliesDetected: number
  actionsTriggered: number
  riskTrajectory: number[]
}
