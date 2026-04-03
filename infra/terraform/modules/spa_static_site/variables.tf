variable "project_name" {
  description = "Nome lógico do projeto (prefixo de recursos)."
  type        = string
}

variable "environment" {
  description = "Ambiente (ex.: dev, staging)."
  type        = string
}

variable "price_class" {
  description = "Classe de preço CloudFront (PriceClass_100 = EUA/Europa barato)."
  type        = string
  default     = "PriceClass_100"
}

variable "tags" {
  description = "Tags comuns."
  type        = map(string)
  default     = {}
}

variable "domain_aliases" {
  description = "Hostnames alternativos no CloudFront (ex.: app.exemplo.com). Exige certificado ACM na região us-east-1."
  type        = list(string)
  default     = []
}

variable "acm_certificate_arn" {
  description = "ARN do certificado ACM (us-east-1) para TLS no CloudFront. Vazio = certificado default *.cloudfront.net."
  type        = string
  default     = ""
}

variable "hsts_max_age_sec" {
  description = "HSTS (Strict-Transport-Security) em segundos; 0 = omitir (ex.: laboratório sem domínio próprio)."
  type        = number
  default     = 0
}

