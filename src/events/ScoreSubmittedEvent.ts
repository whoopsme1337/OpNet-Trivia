import {
    Address,
    BytesWriter,
    NetEvent,
} from '@btc-vision/btc-runtime/runtime';
import { u256 } from '@btc-vision/as-bignum/assembly';

/**
 * ScoreSubmittedEvent
 *
 * Emitted whenever a player sets a new personal best score on-chain.
 * Block explorers (OP_SCAN) and indexers will pick this up automatically.
 *
 * Data layout: [20 bytes — player address] [32 bytes — score]
 */
export class ScoreSubmittedEvent extends NetEvent {

    public static readonly EVENT_NAME: string = 'ScoreSubmitted';

    constructor(
        public readonly player: Address,
        public readonly score:  u256,
    ) {
        super(ScoreSubmittedEvent.EVENT_NAME);
    }

    public serialize(): BytesWriter {
        const writer = new BytesWriter(52); // 20 + 32
        writer.writeAddress(this.player);
        writer.writeU256(this.score);
        return writer;
    }
}
