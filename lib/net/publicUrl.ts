import net from "net";
import dns from "dns";

/**
 * Guards against server-side request forgery on routes that fetch a
 * caller-supplied URL.
 *
 * Parsing a URL is not validating it: `new URL()` happily accepts
 * `http://169.254.169.254/`, `http://127.0.0.1:8080/` and `http://10.0.0.5/`.
 * Everything here exists to make sure a socket is only ever opened to a
 * globally-routable address, and that it stays that way across redirects.
 */

/**
 * Address ranges that are not globally reachable (IANA IPv4/IPv6 special-purpose
 * registries). Anything resolving inside one of them is refused, which is what
 * keeps these routes from reaching cloud metadata (169.254.169.254), loopback
 * admin panels or container-internal services.
 *
 * Each entry is the exact registered prefix — never the enclosing /16 — so that
 * allocated public space stays reachable (e.g. 192.0.77.0/24, Automattic's
 * Photon CDN behind i0.wp.com, sits next to the reserved 192.0.0.0/24).
 */
const NON_PUBLIC_RANGES = new net.BlockList();
NON_PUBLIC_RANGES.addSubnet("0.0.0.0", 8, "ipv4"); // "this network"
NON_PUBLIC_RANGES.addSubnet("10.0.0.0", 8, "ipv4"); // private
NON_PUBLIC_RANGES.addSubnet("100.64.0.0", 10, "ipv4"); // carrier-grade NAT
NON_PUBLIC_RANGES.addSubnet("127.0.0.0", 8, "ipv4"); // loopback
NON_PUBLIC_RANGES.addSubnet("169.254.0.0", 16, "ipv4"); // link-local / cloud metadata
NON_PUBLIC_RANGES.addSubnet("172.16.0.0", 12, "ipv4"); // private
NON_PUBLIC_RANGES.addSubnet("192.0.0.0", 24, "ipv4"); // IETF protocol assignments
NON_PUBLIC_RANGES.addSubnet("192.0.2.0", 24, "ipv4"); // TEST-NET-1
NON_PUBLIC_RANGES.addSubnet("192.168.0.0", 16, "ipv4"); // private
NON_PUBLIC_RANGES.addSubnet("198.18.0.0", 15, "ipv4"); // benchmarking
NON_PUBLIC_RANGES.addSubnet("198.51.100.0", 24, "ipv4"); // TEST-NET-2
NON_PUBLIC_RANGES.addSubnet("203.0.113.0", 24, "ipv4"); // TEST-NET-3
NON_PUBLIC_RANGES.addSubnet("224.0.0.0", 4, "ipv4"); // multicast
NON_PUBLIC_RANGES.addSubnet("240.0.0.0", 4, "ipv4"); // reserved + broadcast
NON_PUBLIC_RANGES.addSubnet("::", 96, "ipv6"); // unspecified, loopback, IPv4-compatible
NON_PUBLIC_RANGES.addSubnet("64:ff9b::", 96, "ipv6"); // NAT64 well-known (embeds IPv4)
NON_PUBLIC_RANGES.addSubnet("64:ff9b:1::", 48, "ipv6"); // NAT64 local-use
NON_PUBLIC_RANGES.addSubnet("100::", 64, "ipv6"); // discard-only
NON_PUBLIC_RANGES.addSubnet("2001::", 32, "ipv6"); // Teredo (embeds IPv4)
NON_PUBLIC_RANGES.addSubnet("2001:db8::", 32, "ipv6"); // documentation
NON_PUBLIC_RANGES.addSubnet("2002::", 16, "ipv6"); // 6to4 (embeds IPv4)
NON_PUBLIC_RANGES.addSubnet("fc00::", 7, "ipv6"); // unique local
NON_PUBLIC_RANGES.addSubnet("fe80::", 10, "ipv6"); // link-local
NON_PUBLIC_RANGES.addSubnet("ff00::", 8, "ipv6"); // multicast

/** URL the server refuses to fetch — surfaced to the caller as a 400. */
export class BlockedUrlError extends Error {}
/** Transport-level failure — reported generically, details stay in the logs. */
export class RemoteFetchError extends Error {}

/** URL.hostname keeps the brackets around IPv6 literals; DNS and TCP need them off. */
export function hostnameOf(target: URL): string {
  return target.hostname.replace(/^\[|\]$/g, "");
}

export function isPublicAddress(address: string, family: number): boolean {
  if (family !== 4 && family !== 6) return false;
  return !NON_PUBLIC_RANGES.check(address, family === 6 ? "ipv6" : "ipv4");
}

/** Refuses anything but http/https, so a redirect to file:/gopher:/data: is caught. */
export function assertFetchableScheme(target: URL): void {
  if (target.protocol !== "https:" && target.protocol !== "http:") {
    throw new BlockedUrlError("URL non autorisée : seuls http et https sont acceptés");
  }
}

/** Resolves a hostname and refuses it unless *every* record is a public address. */
export async function resolvePublicAddresses(hostname: string): Promise<dns.LookupAddress[]> {
  let addresses: dns.LookupAddress[];
  try {
    addresses = await dns.promises.lookup(hostname, { all: true, verbatim: true });
  } catch {
    throw new RemoteFetchError("Impossible de résoudre l'hôte distant");
  }
  if (addresses.length === 0) {
    throw new BlockedUrlError("URL non autorisée : hôte sans adresse publique");
  }
  for (const { address, family } of addresses) {
    if (!isPublicAddress(address, family)) {
      throw new BlockedUrlError("URL non autorisée : elle pointe vers une adresse réseau interne");
    }
  }
  return addresses;
}

/**
 * Feeds the connection the addresses already validated above instead of a second,
 * unchecked DNS round-trip — so a rebinding record that flips to an internal
 * address between validation and connect is never used. Every address in the list
 * passed validation, so handing back the whole list (rather than just the first)
 * keeps Node's IPv6/IPv4 fallback working on IPv4-only or IPv6-only egress.
 */
export function pinnedLookup(
  expectedHostname: string,
  addresses: dns.LookupAddress[]
): net.LookupFunction {
  return (hostname, options, callback) => {
    if (hostname !== expectedHostname) {
      callback(new Error("Résolution DNS non autorisée"), "", 0);
      return;
    }
    const requested = options.family;
    const family = requested === "IPv4" ? 4 : requested === "IPv6" ? 6 : requested ?? 0;
    const matching = family === 4 || family === 6 ? addresses.filter((a) => a.family === family) : addresses;
    const first = matching[0];
    if (!first) {
      callback(new Error("Aucune adresse autorisée pour cet hôte"), "", 0);
      return;
    }
    if (options.all) {
      callback(null, matching);
    } else {
      callback(null, first.address, first.family);
    }
  };
}
