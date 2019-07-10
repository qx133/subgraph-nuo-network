import {
  EthereumBlock,
  BigInt,
  Address,
  BigDecimal
} from '@graphprotocol/graph-ts'
import {
  LogAccountCreated
} from '../generated/AccountFactory/AccountFactory'
import {
  LogAccountCreated as LogAccountCreatedV2
} from '../generated/AccountFactoryV2/AccountFactoryV2'
import {
  LogOrderCreated,
  LogOrderCancelled,
  LogLock,
  LogRelease
} from '../generated/Reserve/Reserve'
import {
  LogOrderCreated as KLogOrderCreated,
  LogOrderRepaid as KLogOrderRepaid,
  LogOrderDefaulted as KLogOrderDefaulted
} from '../generated/Kernel/Kernel'
import {
  LogOrderCreated as MKLogOrderCreated,
  LogOrderLiquidatedByUser as MKLogOrderLiquidatedByUser,
  LogOrderStoppedAtProfit as MKLogOrderStoppedAtProfit,
  LogOrderDefaulted as MKLogOrderDefaulted
} from '../generated/MKernel/MKernel'
import {
  LogTransfer
} from '../generated/ReserveEscrow/ReserveEscrow'
import {
  Account,
  Pool,
  LendOrder,
  Lock,
  Release,
  BorrowOrder,
  MarginOrder
} from '../generated/schema'
import {
  hardcodedTokens,
  hardcodedTokensMap,
  hardcodedAccountsMap
} from './hardcoded'

function initPools(block: BigInt, timestamp: BigInt): void {

  let init = Pool.load('MKR-latest')
  if (init == null) {
    for (let i = 0; i < hardcodedTokens.length; i++) {
      let pool = new Pool(hardcodedTokens[i].symbol + '-latest')
      pool.block = block
      pool.timestamp = timestamp
      pool.symbol = hardcodedTokens[i].symbol
      pool.available = BigDecimal.fromString('0')
      pool.reserve = BigDecimal.fromString('0')
      pool.active = BigDecimal.fromString('0')
      pool.profit = BigDecimal.fromString('0')
      pool.loss = BigDecimal.fromString('0')
      pool.save()
    }
  }

}

function createPool(pool: Pool, latest: Pool): void {

  pool.available = latest.available
  pool.reserve = latest.reserve
  pool.active = latest.active
  pool.profit = latest.profit
  pool.loss = latest.loss

}

export function handleLogAccountCreated(event: LogAccountCreated): void {

  let account = new Account(event.params.account.toHexString())
  account.txid = event.transaction.hash.toHexString()
  account.timestamp = event.block.timestamp
  account.user = event.params.user.toHexString()
  account.account = event.params.account.toHexString()
  account.by = event.params.by.toHexString()
  account.save()

}

export function handleLogAccountCreatedV2(event: LogAccountCreatedV2): void {

  let account = new Account(event.params.account.toHexString())
  account.txid = event.transaction.hash.toHexString()
  account.timestamp = event.block.timestamp
  account.user = event.params.user.toHexString()
  account.account = event.params.account.toHexString()
  account.by = event.params.by.toHexString()
  account.save()

}

export function handleLogOrderCreated(event: LogOrderCreated): void {

  initPools(event.block.number, event.block.timestamp)

  let symbol = hardcodedTokensMap.get(event.params.token.toHexString()).symbol
  let divisor = BigDecimal.fromString(hardcodedTokensMap.get(event.params.token.toHexString()).divisor)
  let latest = Pool.load(symbol + '-latest')
  let pool = Pool.load(symbol + '-' + event.block.number.toString())
  if (pool == null) {
    pool = new Pool(symbol + '-' + event.block.number.toString())
    pool.block = event.block.number
    pool.timestamp = event.block.timestamp
    pool.symbol = symbol
    createPool(pool as Pool, latest as Pool)
  }

  let tokenAmount = event.params.value.toBigDecimal().div(divisor)

  pool.available = pool.available.plus(tokenAmount)
  pool.reserve = pool.reserve.plus(tokenAmount)
  pool.save()

  latest.block = event.block.number
  latest.timestamp = event.block.timestamp
  latest.available = latest.available.plus(tokenAmount)
  latest.reserve = latest.reserve.plus(tokenAmount)
  latest.save()

  let lendOrder = new LendOrder(event.params.orderHash.toHexString())
  lendOrder.txid = event.transaction.hash.toHexString()
  lendOrder.timestamp = event.block.timestamp
  lendOrder.account = event.params.account.toHexString()
  lendOrder.token = symbol
  lendOrder.byUser = event.params.byUser.toHexString()
  lendOrder.value = tokenAmount
  lendOrder.expiration = event.params.expirationTimestamp
  lendOrder.active = true
  lendOrder.save()

}

export function handleLogOrderCancelled(event: LogOrderCancelled): void {

  let lendOrder = LendOrder.load(event.params.orderHash.toHexString())
  lendOrder.active = false
  lendOrder.save()

}

export function handleLogLock(event: LogLock): void {

  let symbol = hardcodedTokensMap.get(event.params.token.toHexString()).symbol
  let divisor = BigDecimal.fromString(hardcodedTokensMap.get(event.params.token.toHexString()).divisor)
  let latest = Pool.load(symbol + '-latest')
  let pool = Pool.load(symbol + '-' + event.block.number.toString())
  if (pool == null) {
    pool = new Pool(symbol + '-' + event.block.number.toString())
    pool.block = event.block.number
    pool.timestamp = event.block.timestamp
    pool.symbol = symbol
    createPool(pool as Pool, latest as Pool)
  }

  let tokenAmount = event.params.value.toBigDecimal().div(divisor)
  let tokenAmountProfit = event.params.profit.toBigDecimal().div(divisor)
  let tokenAmountLoss = event.params.loss.toBigDecimal().div(divisor)

  pool.available = pool.available.plus(tokenAmount)
  pool.reserve = pool.reserve.plus(tokenAmountProfit)
  pool.reserve = pool.reserve.minus(tokenAmountLoss)
  pool.profit = pool.profit.plus(tokenAmountProfit)
  pool.loss = pool.loss.plus(tokenAmountLoss)
  pool.save()

  latest.block = event.block.number
  latest.timestamp = event.block.timestamp
  latest.available = latest.available.plus(tokenAmount)
  latest.reserve = latest.reserve.plus(tokenAmountProfit)
  latest.reserve = latest.reserve.minus(tokenAmountLoss)
  latest.profit = latest.profit.plus(tokenAmountProfit)
  latest.loss = latest.loss.plus(tokenAmountLoss)
  latest.save()

  let lock = new Lock(event.transaction.hash.toHexString() + event.logIndex.toString())
  lock.txid = event.transaction.hash.toHexString()
  lock.timestamp = event.block.timestamp
  lock.token = symbol
  lock.from = event.params.from.toHexString()
  lock.value = tokenAmount
  lock.profit = tokenAmountProfit
  lock.loss = tokenAmountLoss
  lock.by = event.params.by.toHexString()
  lock.save()

}

export function handleLogRelease(event: LogRelease): void {

  let symbol = hardcodedTokensMap.get(event.params.token.toHexString()).symbol
  let divisor = BigDecimal.fromString(hardcodedTokensMap.get(event.params.token.toHexString()).divisor)
  let latest = Pool.load(symbol + '-latest')
  let pool = Pool.load(symbol + '-' + event.block.number.toString())
  if (pool == null) {
    pool = new Pool(symbol + '-' + event.block.number.toString())
    pool.block = event.block.number
    pool.timestamp = event.block.timestamp
    pool.symbol = symbol
    createPool(pool as Pool, latest as Pool)
  }

  let tokenAmount = event.params.value.toBigDecimal().div(divisor)

  pool.reserve = pool.reserve.plus(tokenAmount)
  pool.save()

  latest.block = event.block.number
  latest.timestamp = event.block.timestamp
  latest.reserve = latest.reserve.plus(tokenAmount)
  latest.save()

  let release = new Release(event.transaction.hash.toHexString() + event.logIndex.toString())
  release.txid = event.transaction.hash.toHexString()
  release.timestamp = event.block.timestamp
  release.token = symbol
  release.to = event.params.to.toHexString()
  release.value = tokenAmount
  release.by = event.params.by.toHexString()
  release.save()

}

export function handleKLogOrderCreated(event: KLogOrderCreated): void {

  let principalToken = hardcodedTokensMap.get(event.params.principalToken.toHexString()).symbol
  let collateralToken = hardcodedTokensMap.get(event.params.collateralToken.toHexString()).symbol
  let principalDivisor = BigDecimal.fromString(hardcodedTokensMap.get(event.params.principalToken.toHexString()).divisor)
  let collateralDivisor = BigDecimal.fromString(hardcodedTokensMap.get(event.params.collateralToken.toHexString()).divisor)
  let principalAmount = event.params.principalAmount.toBigDecimal().div(principalDivisor)
  let collateralAmount = event.params.collateralAmount.toBigDecimal().div(collateralDivisor)
  let borrowOrder = new BorrowOrder(event.params.orderHash.toHexString())
  borrowOrder.txid = event.transaction.hash.toHexString()
  borrowOrder.timestamp = event.block.timestamp
  borrowOrder.account = event.params.account.toHexString()
  borrowOrder.principalToken = principalToken
  borrowOrder.collateralToken = collateralToken
  borrowOrder.byUser = event.params.byUser.toHexString()
  borrowOrder.principalAmount = principalAmount
  borrowOrder.collateralAmount = collateralAmount
  borrowOrder.premium = event.params.premium.toBigDecimal()
  borrowOrder.expiration = event.params.expirationTimestamp
  borrowOrder.fee = event.params.fee.toBigDecimal()
  borrowOrder.active = 1
  borrowOrder.save()

}

export function handleKLogOrderRepaid(event: KLogOrderRepaid): void {

  let borrowOrder = BorrowOrder.load(event.params.orderHash.toHexString())
  borrowOrder.active = 2
  borrowOrder.save()

}

export function handleKLogOrderDefaulted(event: KLogOrderDefaulted): void {

  let borrowOrder = BorrowOrder.load(event.params.orderHash.toHexString())
  borrowOrder.active = 3
  borrowOrder.save()

}

export function handleMKLogOrderCreated(event: MKLogOrderCreated): void {

  let marginOrder = new MarginOrder(event.params.orderHash.toHexString())
  marginOrder.txid = event.transaction.hash.toHexString()
  marginOrder.timestamp = event.block.timestamp
  marginOrder.active = 1
  marginOrder.save()

}

export function handleMKLogOrderLiquidatedByUser(event: MKLogOrderLiquidatedByUser): void {

  let marginOrder = MarginOrder.load(event.params.orderHash.toHexString())
  marginOrder.active = 2
  marginOrder.save()

}

export function handleMKLogOrderStoppedAtProfit(event: MKLogOrderStoppedAtProfit): void {

  let marginOrder = MarginOrder.load(event.params.orderHash.toHexString())
  marginOrder.active = 3
  marginOrder.save()

}

export function handleMKLogOrderDefaulted(event: MKLogOrderDefaulted): void {

  let marginOrder = MarginOrder.load(event.params.orderHash.toHexString())
  marginOrder.active = 4
  marginOrder.save()

}

export function handleLogTransfer(event: LogTransfer): void {

  initPools(event.block.number, event.block.timestamp)

  let symbol = hardcodedTokensMap.get(event.params.token.toHexString()).symbol
  let divisor = BigDecimal.fromString(hardcodedTokensMap.get(event.params.token.toHexString()).divisor)
  let latest = Pool.load(symbol + '-latest')
  let pool = Pool.load(symbol + '-' + event.block.number.toString())
  if (pool == null) {
    pool = new Pool(symbol + '-' + event.block.number.toString())
    pool.block = event.block.number
    pool.timestamp = event.block.timestamp
    pool.symbol = symbol
    createPool(pool as Pool, latest as Pool)
  }

  let tokenAmount = event.params.value.toBigDecimal().div(divisor)

  pool.available = pool.available.minus(tokenAmount)
  pool.reserve = pool.reserve.minus(tokenAmount)
  pool.save()

  latest.block = event.block.number
  latest.timestamp = event.block.timestamp
  latest.available = latest.available.minus(tokenAmount)
  latest.reserve = latest.reserve.minus(tokenAmount)
  latest.save()

}
