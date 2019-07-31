import { httpGet, httpPost } from './Common'

function handleError (response) {
  if (response.status === 401) {
    return { session: null }
  } else {
    throw { response }
  }
}

// ============
function signup ({ email, password, firstName, lastName, captcha }) {
  const data = {
    email,
    password,
    firstName,
    lastName,
    captcha,
  }

  const url = '/api/auth/signup'
  return httpPost(url, data).then(
    ({ body }) => ({
      signupStatus: body,
    }),
  ).catch((reason) => { throw { error: 'FAILED', reason } })
}

// ============
function login ({ email, password, remember }) {
  const data = {
    email,
    password,
    remember,
  }

  const url = '/api/auth/login'
  return httpPost(url, data).then(
    ({ body }) => ({
      session: body,
    }),
  ).catch((reason) => { throw { error: 'FAILED', reason } })
}

// ============
function logout () {
  const url = '/api/auth/logout'
  return httpGet(url)
    .then(({ body }) => { return ({ logoutStatus: body }) })
}

// ============
function validateSession () {
  const url = '/api/auth/session'

  return httpGet(url)
    .then(({ body }) => ({ session: body }))
    .catch(handleError)
}

// ============
function resetPassword ({ email }) {
  const url = `/api/auth/reset?email=${email}`

  const data = {
    email,
  }

  return httpPost(url, data)
    .then(({ body }) => ({ resetStatus: body }))
}

// =============
function verifyResetToken ({ email, token }) {
  const url = `/api/auth/reset/${email}/${token}`

  return httpGet(url)
    .then(({ body }) => ({ session: body }))
    .catch((reason) => { throw { error: 'FAILED', reason } })
}

// =============
function updatePassword ({ email, password }) {
  const url = `/api/auth/reset/${email}`

  const data = {
    password,
  }

  return httpPost(url, data)
    .then(({ text }) => ({ updatePasswordStatus: text }))
}

export default {
  signup,
  login,
  logout,
  validateSession,
  resetPassword,
  verifyResetToken,
  updatePassword,
}