output "s3_bucket_name" {
  value = module.spa.s3_bucket_name
}

output "s3_bucket_arn" {
  description = "ARN do bucket (módulo github_oidc_frontend_deploy / políticas IAM)."
  value       = module.spa.s3_bucket_arn
}

output "cloudfront_distribution_id" {
  value = module.spa.cloudfront_distribution_id
}

output "cloudfront_distribution_arn" {
  description = "ARN da distribuição (módulo github_oidc_frontend_deploy / políticas IAM)."
  value       = module.spa.cloudfront_distribution_arn
}

output "cloudfront_domain_name" {
  value = module.spa.cloudfront_domain_name
}

output "cloudfront_url" {
  value = module.spa.cloudfront_url
}

output "cloudfront_hosted_zone_id" {
  description = "Para registros alias manuais, se necessário."
  value       = module.spa.cloudfront_hosted_zone_id
}

output "phase2_custom_domain_enabled" {
  description = "Indica se Fase 2 (ACM + Route 53) está ativa neste workspace."
  value       = local.phase2_custom_domain
}

output "public_https_urls" {
  description = "URLs públicas: aliases (Fase 2) ou hostname CloudFront (Fase 1)."
  value = (
    local.phase2_custom_domain
    ? [for h in var.cloudfront_aliases : "https://${h}"]
    : [module.spa.cloudfront_url]
  )
}

output "acm_certificate_arn" {
  description = "ARN do certificado ACM (null se Fase 2 desligada)."
  value       = length(aws_acm_certificate.spa) > 0 ? aws_acm_certificate.spa[0].arn : null
}
