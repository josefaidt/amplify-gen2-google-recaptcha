import type { CreateAuthChallengeTriggerHandler } from "aws-lambda"

export const handler: CreateAuthChallengeTriggerHandler = async (event) => {
  const { request, response } = event

  if (
    request.session.length === 2 &&
    request.challengeName === "CUSTOM_CHALLENGE"
  ) {
    response.publicChallengeParameters = { trigger: "true" }
    response.privateChallengeParameters = { answer: "" }
    response.challengeMetadata = "CAPTCHA_CHALLENGE"
  }

  return event
}
