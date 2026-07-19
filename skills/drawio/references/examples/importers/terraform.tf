resource "aws_security_group" "web" {}

resource "aws_instance" "api" {
  vpc_security_group_ids = [aws_security_group.web.id]
  depends_on             = [aws_security_group.web]
  tags = {
    Name = var.service_name
  }
}
