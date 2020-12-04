import { Controller, Post, Body, HttpException, HttpStatus, Logger, Res } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { WebauthnService } from './webauthn.service';
import { CreateCredentialDto } from './dto/create-credential.dto';
import { ResponseData } from '../common/dto/response-data';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthenticationCredentialDto } from './dto/authentication-credential-dto';

@Controller('webauthn')
export class WebauthnController {

  constructor(private readonly webauthnSercice: WebauthnService) { }

  /**
   * challenge生成のエンドポイントです。
   * @param createUserDto リクエストボディー
   */
  @Post('/register')
  async register(@Body() createUserDto: CreateUserDto): Promise<ResponseData> {
    const userCreationOptions = await this.webauthnSercice.generateServerMakeCredRequest(createUserDto);
    if (!userCreationOptions) {
      // do something
    }
    const responseData = new ResponseData();
    responseData.status = HttpStatus.CREATED;
    responseData.data = userCreationOptions;
    return responseData;
  }

  /**
   * 認証器で生成した認証情報を受け取るエンドポイントです。
   * @param createCredentialDto リクエストボディー
   */
  @Post('/response')
  async response(@Body() createCredentialDto: CreateCredentialDto): Promise<ResponseData> {
    const verifyResult = await this.webauthnSercice.isValidCredential(createCredentialDto);
    const responseData = new ResponseData();
    verifyResult ? responseData.status = HttpStatus.CREATED : responseData.status = HttpStatus.INTERNAL_SERVER_ERROR;
    return responseData;
  }

  /**
   * 認証処理開始のエンドポイント
   * @param loginUserDto リクエストボディー
   */
  @Post('/login')
  async login(@Body() loginUserDto: LoginUserDto): Promise<ResponseData> {
    const responseData = new ResponseData();
    const userAuthenticationOption = await this.webauthnSercice.generateServerGetAssertion(loginUserDto);
    if (!userAuthenticationOption) {
      responseData.status = HttpStatus.BAD_REQUEST;
    } else {
      responseData.status = HttpStatus.CREATED;
      responseData.data = userAuthenticationOption;
    }
    return responseData;
  }

  @Post('/assertion-response')
  async assertionResponse(@Body() authenticationCredentialDto: AuthenticationCredentialDto): Promise<ResponseData> {
    const responseData = new ResponseData();
    const verifyResult = await this.webauthnSercice.isValidCredentialForAuthentication(authenticationCredentialDto);
    verifyResult ? responseData.status = HttpStatus.OK : responseData.status = HttpStatus.INTERNAL_SERVER_ERROR;
    return responseData;
  }
}
