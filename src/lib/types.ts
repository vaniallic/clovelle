export type Purchase = {
  id: string
  name: string
  qty: number
  price: number
}

export type Batch = {
  id: string
  name: string
  date: string
  purchases: Purchase[]
  unitsProduced: number
  unitsSold: number
  sellPrice: number
  note: string
}

export type Withdrawal = {
  id: string
  date: string
  amount: number
  note: string
}

export type Store = {
  startingCapital: number
  startingCapitalSet: boolean
  batches: Batch[]
  withdrawals: Withdrawal[]
}

export const emptyStore: Store = {
  startingCapital: 0,
  startingCapitalSet: false,
  batches: [],
  withdrawals: [],
}
