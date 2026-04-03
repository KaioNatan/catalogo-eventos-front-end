variable "role_name" {
  description = "Nome da role IAM (ex.: github-celeiro-front-deploy)."
  type        = string
}

variable "github_org" {
  description = "Organização ou usuário GitHub."
  type        = string
}

variable "github_repo" {
  description = "Nome do repositório (sem org)."
  type        = string
}

variable "s3_bucket_arn" {
  description = "ARN do bucket do site (ex.: module.spa.s3_bucket_arn)."
  type        = string
}

variable "cloudfront_distribution_arn" {
  description = "ARN da distribuição CloudFront."
  type        = string
}

variable "allow_all_branches" {
  description = "Se true, qualquer branch do repo pode assumir a role (apenas laboratório). Em produção use false e restrinja refs."
  type        = bool
  default     = false
}

variable "github_environment_name" {
  description = "Nome do GitHub Environment usado no job de deploy (ex.: frontend-deploy). Quando preenchido e allow_all_branches=false, o trust usa sub repo:ORG/REPO:environment:NOME. Deixe vazio para confiar apenas em refs/heads/main (workflow sem environment no job)."
  type        = string
  default     = ""
}

variable "allowed_ref_pattern" {
  description = "Claim OIDC sub exato quando allow_all_branches=false (sobrescreve github_environment_name e o padrão main). Ex.: repo:ORG/REPO:ref:refs/heads/main ou repo:ORG/REPO:environment:frontend-deploy."
  type        = string
  default     = ""
}

variable "create_oidc_provider" {
  description = "Se false, reutiliza o OIDC provider GitHub já existente na conta (evita conflito ao aplicar)."
  type        = bool
  default     = true
}
