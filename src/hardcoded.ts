export class Token {
  symbol: string
  name: string
  tokenAddress: string
  tokenDecimals: number
  divisor: string
}

export class Escrow {
  name: string
  address: string
}

export let hardcodedTokens: Array<Token> = [
  {
    symbol: "MKR",
    name: "Maker",
    tokenAddress: "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2",
    tokenDecimals: 18,
    divisor: "1000000000000000000",
  },
  {
    symbol: "WETH",
    name: "Wrapped Ether",
    tokenAddress: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    tokenDecimals: 18,
    divisor: "1000000000000000000",
  },
  {
    symbol: "DAI",
    name: "Dai Stablecoin v1.0",
    tokenAddress: "0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359",
    tokenDecimals: 18,
    divisor: "1000000000000000000",
  },
  {
    symbol: "TUSD",
    name: "TrueUSD",
    tokenAddress: "0x8dd5fbce2f6a956c3022ba3663759011dd51e73e",
    tokenDecimals: 18,
    divisor: "1000000000000000000",
  },
  {
    symbol: "USDC",
    name: "USDC",
    tokenAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    tokenDecimals: 6,
    divisor: "1000000",
  },
  {
    symbol: "BAT",
    name: "Basic Attention Token",
    tokenAddress: "0x0d8775f648430679a709e98d2b0cb6250d2887ef",
    tokenDecimals: 18,
    divisor: "1000000000000000000",
  },
  {
    symbol: "REP",
    name: "Reputation",
    tokenAddress: "0x1985365e9f78359a9b6ad760e32412f4a445e862",
    tokenDecimals: 18,
    divisor: "1000000000000000000",
  },
  {
    symbol: "ZRX",
    name: "0x Protocol Token",
    tokenAddress: "0xe41d2489571d322189246dafa5ebde1f4699f498",
    tokenDecimals: 18,
    divisor: "1000000000000000000",
  },
  {
    symbol: "LINK",
    name: "ChainLink Token",
    tokenAddress: "0x514910771af9ca656af840dff83e8264ecf986ca",
    tokenDecimals: 18,
    divisor: "1000000000000000000",
  },
  {
    symbol: "KNC",
    name: "Kyber Network Crystal",
    tokenAddress: "0xdd974d5c2e2928dea5f71b9825b8b646686bd200",
    tokenDecimals: 18,
    divisor: "1000000000000000000",
  },
  {
    symbol: "WBTC",
    name: "Wrapped BTC",
    tokenAddress: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
    tokenDecimals: 8,
    divisor: "100000000",
  }
]

export let hardcodedTokensMap = new Map <string, Token> ()
for (let i = 0; i < hardcodedTokens.length; i++) {
  hardcodedTokensMap.set(hardcodedTokens[i].tokenAddress, hardcodedTokens[i])
}

export let hardcodedAccounts: Array<Escrow> = [
  {
    name: "ReserveEscrow",
    address: "0x802275979b020f0ec871c5ec1db6e412b72ff20b",
  },
  {
    name: "KernelEscrow",
    address: "0xaf38668f4719ecf9452dc0300be3f6c83cbf3721",
  },
  {
    name: "KFeeWallet",
    address: "0x3e990e787a88cd4426fb3af9b90dd1d951e2cb87",
  },
  {
    name: "MKFeeWallet",
    address: "0xf12c4e73868a4a028382ac51b57482b627a323d2",
  }
]

export let hardcodedAccountsMap = new Map <string, Escrow> ()
for (let i = 0; i < hardcodedAccounts.length; i++) {
  hardcodedAccountsMap.set(hardcodedAccounts[i].address, hardcodedAccounts[i])
}
