variable "project_name" {
  description = "Prefixo dos recursos (ex.: celeiro-front)."
  type        = string
}

variable "environment" {
  description = "Nome do ambiente."
  type        = string
  default     = "dev"
}

variable "aws_region" {
  description = "Região AWS do bucket S3."
  type        = string
  default     = "us-east-1"
}

variable "cloudfront_price_class" {
  description = "PriceClass do CloudFront."
  type        = string
  default     = "PriceClass_100"
}

# --- Fase 2: domínio próprio (ACM us-east-1 + Route 53) ---

variable "enable_phase2_custom_domain" {
  description = "Se true, solicita certificado ACM, valida via DNS na zona Route 53 e associa aliases + HSTS no CloudFront."
  type        = bool
  default     = false
}

variable "dns_hosted_zone_name" {
  description = "Nome da hosted zone pública (ex.: \"exemplo.com.br.\" — com ponto final)."
  type        = string
  default     = ""
}

variable "cloudfront_aliases" {
  description = "Hostnames servidos pelo CloudFront (devem estar cobertos pelo certificado ACM)."
  type        = list(string)
  default     = []
}

variable "acm_primary_domain_name" {
  description = "Nome primário do certificado ACM (ex.: app.exemplo.com.br). Deve coincidir com um alias ou ser FQDN válido para a zona."
  type        = string
  default     = ""
}

variable "acm_subject_alternative_names" {
  description = "SANs extras no certificado (ex.: www.app.exemplo.com.br)."
  type        = list(string)
  default     = []
}

variable "hsts_max_age_sec" {
  description = "HSTS enviado pelo CloudFront quando Fase 2 ativa. Ex.: 31536000 (1 ano). Use 0 só se precisar desligar HSTS explicitamente."
  type        = number
  default     = 31536000
}
