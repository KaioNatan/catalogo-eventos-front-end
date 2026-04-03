# Fase 2 — domínio próprio: ACM (DNS validation) + Route 53 (A/AAAA alias → CloudFront).
# Ative com enable_phase2_custom_domain = true e preencha DNS/aliases (ver terraform.tfvars.example).

locals {
  phase2_custom_domain = (
    var.enable_phase2_custom_domain &&
    var.dns_hosted_zone_name != "" &&
    length(var.cloudfront_aliases) > 0 &&
    var.acm_primary_domain_name != ""
  )

  # Só existe recurso de validação quando a Fase 2 está ligada.
  acm_cert_arn_for_cloudfront = (
    length(aws_acm_certificate_validation.spa) > 0
    ? aws_acm_certificate_validation.spa[0].certificate_arn
    : ""
  )
}

data "aws_route53_zone" "spa" {
  count        = local.phase2_custom_domain ? 1 : 0
  name         = var.dns_hosted_zone_name
  private_zone = false
}

resource "aws_acm_certificate" "spa" {
  count = local.phase2_custom_domain ? 1 : 0

  provider = aws.us_east_1

  domain_name               = var.acm_primary_domain_name
  subject_alternative_names = var.acm_subject_alternative_names
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    ManagedBy   = "terraform"
    Project     = var.project_name
    Environment = var.environment
  }
}

resource "aws_route53_record" "acm_validation" {
  for_each = local.phase2_custom_domain ? {
    for dvo in aws_acm_certificate.spa[0].domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  } : {}

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.aws_route53_zone.spa[0].zone_id
}

resource "aws_acm_certificate_validation" "spa" {
  count = local.phase2_custom_domain ? 1 : 0

  provider = aws.us_east_1

  certificate_arn         = aws_acm_certificate.spa[0].arn
  validation_record_fqdns = [for r in aws_route53_record.acm_validation : r.fqdn]
}

resource "aws_route53_record" "spa_alias_ipv4" {
  for_each = local.phase2_custom_domain ? toset(var.cloudfront_aliases) : toset([])

  zone_id = data.aws_route53_zone.spa[0].zone_id
  name    = each.value
  type    = "A"

  alias {
    name                   = module.spa.cloudfront_domain_name
    zone_id                = module.spa.cloudfront_hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "spa_alias_ipv6" {
  for_each = local.phase2_custom_domain ? toset(var.cloudfront_aliases) : toset([])

  zone_id = data.aws_route53_zone.spa[0].zone_id
  name    = each.value
  type    = "AAAA"

  alias {
    name                   = module.spa.cloudfront_domain_name
    zone_id                = module.spa.cloudfront_hosted_zone_id
    evaluate_target_health = false
  }
}
