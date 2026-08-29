// Re-export contract namespaces to avoid TS2308 star-export type ambiguities
export * as CityMapContract from './CityMap.gen';
export * as DaoContract from './Dao.gen';
export * as DaoVoterContract from './DaoVoter.gen';
export * as FossFiContract from './FossFi.gen';
export * as FossFiWalletContract from './FossFiWallet.gen';
export * as LocationContract from './Location.gen';
export * as LotteryContract from './Lottery.gen';
export * as PersonalContract from './Personal.gen';
export * as PersonalWalletContract from './PersonalWallet.gen';

// Re-export primary contract classes
export { CityMap } from './CityMap.gen';
export { Dao } from './Dao.gen';
export { DaoVoter } from './DaoVoter.gen';
export { FossFi } from './FossFi.gen';
export { FossFiWallet } from './FossFiWallet.gen';
export { Location, Location as LocationContractClass } from './Location.gen';
export { Lottery } from './Lottery.gen';
export { PersonalMinter } from './Personal.gen';
export { PersonalWallet } from './PersonalWallet.gen';
