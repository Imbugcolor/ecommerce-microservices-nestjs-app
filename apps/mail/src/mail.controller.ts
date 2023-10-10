import { Controller } from '@nestjs/common';
import { MailService } from './mail.service';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @EventPattern('send-mail')
  async sendMail(@Payload() data: { email: string; url: string; txt: string }) {
    return this.mailService.sendMail(data.email, data.url, data.txt);
  }
}
