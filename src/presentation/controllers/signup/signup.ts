import { HttpResponse, HttpRequest, Controller, EmailValidator, AddAccount } from './signup-protocols'
import { badRequest, serverError, ok } from '../../helper/http-helper'
import { MissingParamError, InvalidParamError } from '../../error'

export class SignUpController implements Controller{
  private readonly emailValidator: EmailValidator
  private readonly addAccount: AddAccount

  constructor(emailValidator: EmailValidator, addAccount: AddAccount){
    this.emailValidator = emailValidator
    this.addAccount = addAccount
  }
  async handle(httpRequest: HttpRequest): Promise<HttpResponse>{
    try{
      const requiredFields = ['name','email', 'password', 'passowrdConfirmation']
      for (const field of requiredFields){
        if (!httpRequest.body[field]){
          return badRequest( new MissingParamError(field) )
        }
      }
      if(httpRequest.body.password !== httpRequest.body.passowrdConfirmation){
        return badRequest( new InvalidParamError('passowrdConfirmation') )
      }
      const isValid = this.emailValidator.isValid(httpRequest.body.email)
      if(!isValid){
        return badRequest( new InvalidParamError('email') )
      }
      const account = await this.addAccount.add({
        name: httpRequest.body.name,
        email: httpRequest.body.email,
        password: httpRequest.body.password
      })

      return ok(account)
    } catch (error){
      return serverError()
    }
  }
}