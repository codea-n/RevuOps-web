export type Repo = {
  id: string
  repo_full_name: string
}

export type Review = {
  id: string
  repo: string
  pr_number: number
  created_at: string
  review_text?: string
  user_id?: string | null
  security_findings?: SecurityFindings
  performance_findings?: PerformanceFindings
  architecture_findings?: ArchitectureFindings
  model_version?: string
}

export type SecurityIssue = {
  code?: string
  rule_code?: string
  line: number
  message: string
  severity?: string
  confidence?: string
}

export type SecurityFindings = {
  issues?: SecurityIssue[]
  high_count?: number
  skipped?: boolean
}

export type PerformanceHotspot = {
  function: string
  line: number
  complexity: number
  loc: number
  issues: string[]
}

export type PerformanceFindings = {
  hotspots?: PerformanceHotspot[]
  total_functions?: number
  skipped?: boolean
}

export type ArchitectureNote = {
  type: string
  context: string
}

export type ArchitectureFindings = {
  notes?: ArchitectureNote[]
  has_rag?: boolean
  skipped?: boolean
}