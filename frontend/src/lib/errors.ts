/** Maps on-chain HubError codes to user-facing messages. */
const HUB_ERRORS: Record<number, string> = {
  1: "Contracts are not initialized on this network.",
  2: "Contract was already initialized.",
  3: "Unauthorized — platform admin wallet required.",
  4: "Record not found on ledger.",
  5: "Invalid grant amount.",
  6: "Invalid state for this action.",
  7: "University must be verified before launching research.",
  8: "Milestone is not ready for funding release.",
  9: "Insufficient treasury balance.",
  10: "Review score must be between 0 and 100.",
  11: "This wallet already registered a university (one per wallet).",
};

export function parseSorobanError(raw: unknown): string {
  const message = raw instanceof Error ? raw.message : String(raw);

  const contractMatch = message.match(/Error\(Contract,\s*#(\d+)\)/i);
  if (contractMatch) {
    const code = Number(contractMatch[1]);
    return HUB_ERRORS[code] ?? `Contract rejected the transaction (error #${code}).`;
  }

  if (/duplicate/i.test(message) || /#11\b/.test(message)) {
    return HUB_ERRORS[11];
  }

  if (message.includes("HostError") && message.length > 180) {
    const head = message.split("Event log")[0]?.trim() ?? message;
    const nested = head.match(/Error\(Contract,\s*#(\d+)\)/i);
    if (nested) {
      const code = Number(nested[1]);
      return HUB_ERRORS[code] ?? `Contract rejected the transaction (error #${code}).`;
    }
  }

  if (/Bad union switch/i.test(message)) {
    return "Network decode error — hard refresh (Ctrl+Shift+R), reconnect Freighter on Testnet, then retry.";
  }

  return message;
}
