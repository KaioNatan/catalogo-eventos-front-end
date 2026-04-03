# Fase 1: CloudFront com certificado default (*.cloudfront.net).
# Fase 2: opcional — ACM (us-east-1) + Route 53 + aliases + HSTS (ver phase2_custom_domain.tf).
#
# Backend remoto (recomendado para time): descomente e ajuste.
# terraform {
#   backend "s3" {
#     bucket         = "seu-terraform-state"
#     key            = "celeiro-front/dev/terraform.tfstate"
#     region         = "us-east-1"
#     dynamodb_table = "terraform-locks"
#     encrypt        = true
#   }
# }

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Certificados para CloudFront devem existir em us-east-1 (requisito AWS).
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

module "spa" {
  source = "../../modules/spa_static_site"

  project_name = var.project_name
  environment  = var.environment
  price_class  = var.cloudfront_price_class

  domain_aliases      = local.phase2_custom_domain ? var.cloudfront_aliases : []
  acm_certificate_arn = local.acm_cert_arn_for_cloudfront
  hsts_max_age_sec    = local.phase2_custom_domain ? var.hsts_max_age_sec : 0

  tags = {
    ManagedBy = "terraform"
  }
}
