export const serloDomain =
  process.env.NEXT_PUBLIC_ENV === 'production'
    ? 'serlo.org'
    : process.env.NEXT_PUBLIC_SERLO_DOMAIN_STAGING
