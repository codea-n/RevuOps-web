// types.ts (or lib/types.ts)
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
}