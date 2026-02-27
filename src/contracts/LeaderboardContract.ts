import {
    Address,
    Blockchain,
    BytesWriter,
    Calldata,
    encodeSelector,
    OP_NET,
    Selector,
    StoredU256,
} from '@btc-vision/btc-runtime/runtime';
import { u256 } from '@btc-vision/as-bignum/assembly';
import { ScoreSubmittedEvent } from '../events/ScoreSubmittedEvent';

/**
 * OpNet-Trivia Leaderboard Contract
 *
 * Stores player scores permanently on Bitcoin via OP_NET.
 * Scores are only updated when the new score is strictly higher than the previous best.
 *
 * Methods:
 *   submitScore(uint256)  — Submit a score for the calling wallet
 *   getScore(address)     — Read the best score of any wallet
 *   getTopScore()         — Read the global highest score
 *   getTotalPlayers()     — Read the total number of unique players
 */
@final
export class LeaderboardContract extends OP_NET {

    // Storage pointer IDs (must be unique per slot)
    private readonly POINTER_SCORES:  u16 = 1; // Map: address => score
    private readonly POINTER_TOP:     u16 = 2; // Global top score
    private readonly POINTER_PLAYERS: u16 = 3; // Total unique player count

    private readonly topScore:     StoredU256;
    private readonly totalPlayers: StoredU256;

    public constructor() {
        super();
        this.topScore     = new StoredU256(this.POINTER_TOP,     u256.Zero);
        this.totalPlayers = new StoredU256(this.POINTER_PLAYERS, u256.Zero);
    }

    /**
     * Called once when the contract is first deployed.
     */
    public override onDeployment(_calldata: Calldata): void {
        this.topScore.value     = u256.Zero;
        this.totalPlayers.value = u256.Zero;
        Blockchain.log('OpNet-Trivia Leaderboard deployed!');
    }

    /**
     * Routes method selectors to handler functions.
     */
    public override execute(method: Selector, calldata: Calldata): BytesWriter {
        switch (method) {
            case encodeSelector('submitScore(uint256)'):
                return this.submitScore(calldata);

            case encodeSelector('getScore(address)'):
                return this.getScore(calldata);

            case encodeSelector('getTopScore()'):
                return this.getTopScore();

            case encodeSelector('getTotalPlayers()'):
                return this.getTotalPlayers();

            default:
                return super.execute(method, calldata);
        }
    }

    // ── Write Methods ────────────────────────────────────────────────────────

    /**
     * submitScore(uint256) → bool
     *
     * Saves a player's score on-chain.
     * Only updates storage if the new score is higher than their current best.
     * Returns true if the score was updated, false otherwise.
     */
    private submitScore(calldata: Calldata): BytesWriter {
        const caller:    Address   = Blockchain.tx.sender;
        const newScore:  u256      = calldata.readU256();
        const current:   StoredU256 = this._loadPlayerScore(caller);
        const isNewPlayer: bool    = current.value == u256.Zero;

        const writer = new BytesWriter(1);

        if (newScore > current.value) {
            current.value = newScore;

            if (newScore > this.topScore.value) {
                this.topScore.value = newScore;
            }

            if (isNewPlayer) {
                this.totalPlayers.value = this.totalPlayers.value + u256.One;
            }

            const event = new ScoreSubmittedEvent(caller, newScore);
            this.emitEvent(event);

            writer.writeBoolean(true);
        } else {
            writer.writeBoolean(false);
        }

        return writer;
    }

    // ── Read Methods ─────────────────────────────────────────────────────────

    /**
     * getScore(address) → uint256
     *
     * Returns the best score for the given wallet address.
     */
    private getScore(calldata: Calldata): BytesWriter {
        const addr:   Address    = calldata.readAddress();
        const stored: StoredU256 = this._loadPlayerScore(addr);
        const writer             = new BytesWriter(32);
        writer.writeU256(stored.value);
        return writer;
    }

    /**
     * getTopScore() → uint256
     *
     * Returns the highest score ever submitted on-chain.
     */
    private getTopScore(): BytesWriter {
        const writer = new BytesWriter(32);
        writer.writeU256(this.topScore.value);
        return writer;
    }

    /**
     * getTotalPlayers() → uint256
     *
     * Returns the total number of unique players on the leaderboard.
     */
    private getTotalPlayers(): BytesWriter {
        const writer = new BytesWriter(32);
        writer.writeU256(this.totalPlayers.value);
        return writer;
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Loads a player's StoredU256 score slot using their address as a sub-pointer.
     */
    private _loadPlayerScore(addr: Address): StoredU256 {
        const subPointer: u256 = u256.fromBytes(addr.toBytes(), true);
        return new StoredU256(this.POINTER_SCORES, u256.Zero, subPointer);
    }
}
