import { resolveTxt } from 'node:dns/promises'

export async function verifyDns(
  domain: string,
  expectedToken: string,
): Promise<boolean> {
  try {
    const records = await resolveTxt(`_showvibe.${domain}`)
    return records.flat().some((r) => r === expectedToken)
  } catch {
    return false
  }
}
