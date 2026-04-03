# IAM role para GitHub Actions publicar o front (S3 sync + invalidação CloudFront) via OIDC.
# O OIDC provider GitHub costuma ser compartilhado na conta; use create_oidc_provider=false se já existir.
#
# Trust padrão (allow_all_branches=false): refs/heads/main OU, se github_environment_name estiver definido,
# repo:ORG/REPO:environment:NOME (alinhado ao job com `environment:` no GitHub Actions). Para qualquer branch,
# defina allow_all_branches = true (só laboratório).

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

locals {
  # Com job usando `environment:` no workflow, o claim OIDC `sub` é
  # repo:ORG/REPO:environment:NOME — não ref:refs/heads/... (ver variável github_environment_name).
  default_main_sub = "repo:${var.github_org}/${var.github_repo}:ref:refs/heads/main"
  default_env_sub  = trimspace(var.github_environment_name) != "" ? "repo:${var.github_org}/${var.github_repo}:environment:${trimspace(var.github_environment_name)}" : local.default_main_sub
  effective_ref    = trimspace(var.allowed_ref_pattern) != "" ? trimspace(var.allowed_ref_pattern) : local.default_env_sub
  github_oidc_arn  = var.create_oidc_provider ? aws_iam_openid_connect_provider.github[0].arn : data.aws_iam_openid_connect_provider.github[0].arn
}

data "aws_iam_openid_connect_provider" "github" {
  count = var.create_oidc_provider ? 0 : 1
  url   = "https://token.actions.githubusercontent.com"
}

resource "aws_iam_openid_connect_provider" "github" {
  count = var.create_oidc_provider ? 1 : 0

  url             = "https://token.actions.githubusercontent.com"
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = ["6938fd4d98bab03faadb97b34396831e3780aea1"]
}

data "aws_iam_policy_document" "assume_github" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]
    principals {
      type        = "Federated"
      identifiers = [local.github_oidc_arn]
    }
    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }
    dynamic "condition" {
      for_each = var.allow_all_branches ? [1] : []
      content {
        test     = "StringLike"
        variable = "token.actions.githubusercontent.com:sub"
        values   = ["repo:${var.github_org}/${var.github_repo}:*"]
      }
    }
    dynamic "condition" {
      for_each = var.allow_all_branches ? [] : [1]
      content {
        test     = "StringEquals"
        variable = "token.actions.githubusercontent.com:sub"
        values   = [local.effective_ref]
      }
    }
  }
}

resource "aws_iam_role" "github_deploy" {
  name               = var.role_name
  assume_role_policy = data.aws_iam_policy_document.assume_github.json
}

data "aws_iam_policy_document" "deploy" {
  statement {
    sid    = "S3SyncDist"
    effect = "Allow"
    actions = [
      "s3:PutObject",
      "s3:GetObject",
      "s3:DeleteObject",
      "s3:ListBucket",
    ]
    resources = [
      var.s3_bucket_arn,
      "${var.s3_bucket_arn}/*",
    ]
  }

  statement {
    sid       = "CloudFrontInvalidate"
    effect    = "Allow"
    actions   = ["cloudfront:CreateInvalidation"]
    resources = [var.cloudfront_distribution_arn]
  }
}

resource "aws_iam_role_policy" "github_deploy" {
  name   = "${var.role_name}-policy"
  role   = aws_iam_role.github_deploy.id
  policy = data.aws_iam_policy_document.deploy.json
}

output "role_arn" {
  value       = aws_iam_role.github_deploy.arn
  description = "Use como secret AWS_ROLE_ARN no GitHub Actions."
}
