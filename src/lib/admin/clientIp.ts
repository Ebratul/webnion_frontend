// The first address Vercel records is the visitor's. The API logs it, because from there every call seems to come from this server.
export const clientIpHeader = (request: Request): Record<string, string> => {
  const address = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return address ? { 'X-Webnion-Client-Ip': address } : {};
};
