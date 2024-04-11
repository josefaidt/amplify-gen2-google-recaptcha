import type { DefineAuthChallengeTriggerHandler } from "aws-lambda"

export const handler: DefineAuthChallengeTriggerHandler = async (event) => {
  const { response } = event
  const [srp, password, captcha] = event.request.session

  response.issueTokens = false
  response.failAuthentication = true

  if (srp?.challengeName === "SRP_A") {
    response.failAuthentication = false
    response.challengeName = "PASSWORD_VERIFIER"
  }

  if (
    password?.challengeName === "PASSWORD_VERIFIER" &&
    password.challengeResult === true
  ) {
    response.failAuthentication = false
    response.challengeName = "CUSTOM_CHALLENGE"
  }

  if (
    captcha?.challengeName === "CUSTOM_CHALLENGE" &&
    // check for the challenge metadata set in "create-auth-challenge"
    captcha?.challengeMetadata === "CAPTCHA_CHALLENGE" &&
    captcha.challengeResult === true
  ) {
    response.issueTokens = true
    response.failAuthentication = false
  }

  return event
}
