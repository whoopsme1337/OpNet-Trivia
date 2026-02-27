import { Address, BytesWriter, NetEvent } from '@btc-vision/btc-runtime/runtime';
import { u256 } from '@btc-vision/as-bignum/assembly';

export class ScoreSubmittedEvent extends NetEvent {
    constructor(player: Address, score: u256) {
        const data = new BytesWriter(32 + 32);
        data.writeAddress(player);
        data.writeU256(score);
        super('ScoreSubmitted', data);
    }
}
