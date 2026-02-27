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

@final
export class LeaderboardContract extends OP_NET {

    // ✅ Global storage requires subPointer
    private readonly topScore: StoredU256 =
        new StoredU256(2, new Uint8Array(0));

    private readonly totalPlayers: StoredU256 =
        new StoredU256(3, new Uint8Array(0));

    public constructor() {
        super();
    }

    public override onDeploy(): void {
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
        const caller: Address = Blockchain.tx.sender;
        const newScore: u256 = calldata.readU256();

        const playerPointer: u16 = 1;

        // ✅ Correct conversion for your runtime
        const subPtr: Uint8Array = Uint8Array.wrap(caller.buffer);

        const current = new StoredU256(playerPointer, subPtr);
        const isNew: bool = current.value == u256.Zero;

        const writer = new BytesWriter(1);

        if (newScore > current.value) {
            current.value = newScore;

            if (newScore > this.topScore.value) {
                this.topScore.value = newScore;
            }

            if (isNew) {
                this.totalPlayers.value = u256.add(
                    this.totalPlayers.value,
                    u256.One
                );
            }

            this.emitEvent(new ScoreSubmittedEvent(caller, newScore));
            writer.writeBoolean(true);
        } else {
            writer.writeBoolean(false);
        }

        return writer;
    }

    private getScore(calldata: Calldata): BytesWriter {
        const addr: Address = calldata.readAddress();

        // ✅ Correct conversion
        const subPtr: Uint8Array = Uint8Array.wrap(addr.buffer);

        const stored = new StoredU256(1, subPtr);

        const writer = new BytesWriter(32);
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
