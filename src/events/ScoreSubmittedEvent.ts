import {
    Address,
    BytesWriter,
    NetEvent,
} from '@btc-vision/btc-runtime/runtime';
import { u256 } from '@btc-vision/as-bignum/assembly';

const ADDRESS_BYTE_LENGTH: u32 = 32;
const U256_BYTE_LENGTH:    u32 = 32;

export class ScoreSubmittedEvent extends NetEvent {
    constructor(player: Address, score: u256) {
        const writer = new BytesWriter(ADDRESS_BYTE_LENGTH + U256_BYTE_LENGTH);
        writer.writeAddress(player);
        writer.writeU256(score);
        super('ScoreSubmitted', writer);
    }
}
