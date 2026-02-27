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
import { SafeMath } from '@btc-vision/btc-runtime/runtime/types/SafeMath';
import { u256 } from '@btc-vision/as-bignum/assembly';
import { ScoreSubmittedEvent } from '../events/ScoreSubmittedEvent';

// 32-byte zero subPointer for global storage slots
const ZERO_PTR: Uint8Array = new Uint8Array(32);

@final
export class LeaderboardContract extends OP_NET {

    private readonly topScore:     StoredU256 = new StoredU256(2, ZERO_PTR);
    private readonly totalPlayers: StoredU256 = new StoredU256(3, ZERO_PTR);

    public constructor() {
        super();
    }

    public override onDeployment(_calldata: Calldata): void {
        Blockchain.log('OpNet-Trivia Leaderboard deployed!');
    }

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

    private submitScore(calldata: Calldata): BytesWriter {
        const caller:   Address    = Blockchain.tx.sender;
        const newScore: u256       = calldata.readU256();

        // Address extends Uint8Array directly — use it as subPointer
        const current:  StoredU256 = new StoredU256(1, caller as Uint8Array);
        const isNew:    bool       = u256.eq(current.value, u256.Zero);

        const writer = new BytesWriter(1);

        if (u256.gt(newScore, current.value)) {
            current.value = newScore;

            if (u256.gt(newScore, this.topScore.value)) {
                this.topScore.value = newScore;
            }

            if (isNew) {
                this.totalPlayers.value = SafeMath.add(this.totalPlayers.value, u256.One);
            }

            this.emitEvent(new ScoreSubmittedEvent(caller, newScore));
            writer.writeBoolean(true);
        } else {
            writer.writeBoolean(false);
        }

        return writer;
    }

    private getScore(calldata: Calldata): BytesWriter {
        const addr:   Address    = calldata.readAddress();
        const stored: StoredU256 = new StoredU256(1, addr as Uint8Array);
        const writer             = new BytesWriter(32);
        writer.writeU256(stored.value);
        return writer;
    }

    private getTopScore(): BytesWriter {
        const writer = new BytesWriter(32);
        writer.writeU256(this.topScore.value);
        return writer;
    }

    private getTotalPlayers(): BytesWriter {
        const writer = new BytesWriter(32);
        writer.writeU256(this.totalPlayers.value);
        return writer;
    }
}
