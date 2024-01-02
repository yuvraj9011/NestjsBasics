import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import {
  ExtractJwt,
  Strategy,
} from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(
  Strategy,
  'jwt2',//bydefault jwt added here if we not provided
) {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest:
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: {
    sub: number;
    email: string;
  }) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          id: payload.sub,
        },
      });
      if (user && user.hash) {
        /*
        Assuming your user object has a specific type/interface, and the hash property is not optional, 
        TypeScript may complain about trying to delete a non-optional property. 
        To address this, you can use a type assertion (as any) to inform TypeScript
        that you know what you are doing and that the hash property can be deleted
        */
         // Use type assertion to allow deletion of non-optional property
        (user as any).hash=undefined;
       }
    return user;
  }
}