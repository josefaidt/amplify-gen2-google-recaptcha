import type { VerifyAuthChallengeResponseTriggerHandler } from "aws-lambda"
import { env } from "$amplify/env/verify-auth-challenge-response"

/**
 * Google ReCAPTCHA verification response
 * @see https://developers.google.com/recaptcha/docs/v3#site_verify_response
 */
type GoogleRecaptchaVerifyResponse = {
  // whether this request was a valid reCAPTCHA token for your site
  success: boolean
  // the score for this request (0.0 - 1.0)
  score: number
  // the action name for this request (important to verify)
  action: string
  // timestamp of the challenge load (ISO format yyyy-MM-dd'T'HH:mm:ssZZ)
  challenge_ts: string
  // the hostname of the site where the reCAPTCHA was solved
  hostname: string
  // optional error codes
  "error-codes"?: unknown[]
}

export const handler: VerifyAuthChallengeResponseTriggerHandler = async (
  event
) => {
  if (!event.request.challengeAnswer) {
    throw new Error("Missing challenge answer")
  }

  // https://developers.google.com/recaptcha/docs/verify#api_request
  const url = new URL("https://www.google.com/recaptcha/api/siteverify")
  const params = new URLSearchParams({
    secret: env.GOOGLE_RECAPTCHA_SECRET_KEY,
    response: event.request.challengeAnswer,
  })
  url.search = params.toString()

  const request = new Request(url, {
    method: "POST",
  })

  const response = await fetch(request)
  const result = (await response.json()) as GoogleRecaptchaVerifyResponse

  if (!result.success) {
    throw new Error("Verification failed", { cause: result["error-codes"] })
  }

  // indicate whether the answer is correct
  event.response.answerCorrect = result.success

  return event
}
