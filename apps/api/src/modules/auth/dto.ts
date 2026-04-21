import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class SignupDto {
  @ApiProperty({ example: "user@example.com" })
  @IsEmail()
  email!: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;
}

export class LoginDto {
  @ApiProperty({ example: "user@example.com" })
  @IsString()
  email!: string;

  @ApiProperty()
  @IsString()
  password!: string;
}

export class RefreshDto {
  @ApiProperty()
  @IsString()
  refreshToken!: string;
}

