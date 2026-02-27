import { LeaderboardContract } from './contracts/LeaderboardContract';

export function start(): void {
    // Initialize contract (required by OP_NET)
    new LeaderboardContract();
}