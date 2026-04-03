output "s3_bucket_name" {
  description = "Nome do bucket (sync do dist/)."
  value       = aws_s3_bucket.site.bucket
}

output "s3_bucket_arn" {
  description = "ARN do bucket."
  value       = aws_s3_bucket.site.arn
}

output "cloudfront_distribution_id" {
  description = "ID da distribuição (invalidation)."
  value       = aws_cloudfront_distribution.site.id
}

output "cloudfront_distribution_arn" {
  description = "ARN da distribuição (IAM policies / módulo OIDC deploy)."
  value       = aws_cloudfront_distribution.site.arn
}

output "cloudfront_domain_name" {
  description = "Hostname HTTPS (*.cloudfront.net)."
  value       = aws_cloudfront_distribution.site.domain_name
}

output "cloudfront_url" {
  description = "URL base com HTTPS."
  value       = "https://${aws_cloudfront_distribution.site.domain_name}"
}

output "cloudfront_hosted_zone_id" {
  description = "Hosted zone ID fixo do CloudFront (alias Route 53 A/AAAA)."
  value       = aws_cloudfront_distribution.site.hosted_zone_id
}
