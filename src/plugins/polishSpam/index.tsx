import definePlugin from "@utils/types";
import { addButton, removeButton } from "@api/MessagePopover";
import { ChannelStore, EmojiStore, PermissionStore, PermissionsBits, RestAPI } from "@webpack/common";
import { Message } from "discord-types/general";
import { CustomEmoji } from "@webpack/types";
import { sleep } from "@utils/misc";

export default definePlugin({
    name: "Polish flag spam",
    description: "Spams polish flag",
    authors: [
        {
            id: 442720815318827011n,
            name: "Rogal",
        },
    ],

    start() {
        addButton("SpamPL", msg => {
            const channel = ChannelStore.getChannel(msg.channel_id);
            if (channel.guild_id && !(PermissionStore.can(PermissionsBits.ADD_REACTIONS, channel)
                || PermissionStore.can(PermissionsBits.USE_EXTERNAL_EMOJIS, channel)))
                return null;

            return {
                label: "Spam PL",
                icon: this.Icon,
                message: msg,
                channel,
                onClick: () => {
                    for (const id of this.emojis) fetchAndRetryIfNecessary(async () => await addReaction(EmojiStore.getCustomEmojiById(id), msg));
                }
            };
        });
    },
    stop() {
        removeButton("SpamPL");
    },
    emojis: [
        "1187801291519434772",
        "1187801347563737158",
        "1187801401154342993",
        "1187801469802524752",
        "1187801763844198470",
        "1187801804457640046",
        "1187801873361686588",
        "1187801937341591652",
        "1187801975128068208",
        "1187802005650034708"
    ],
    Icon: () => (
        <svg viewBox="0 0 36 36">
            <path fill="#EEE" d="M32 5H4C1.791 5 0 6.791 0 9v9h36V9c0-2.209-1.791-4-4-4z" />
            <path fill="#DC143C" d="M0 27c0 2.209 1.791 4 4 4h28c2.209 0 4-1.791 4-4v-9H0v9z" />
        </svg>),
});

async function addReaction(reaction: CustomEmoji, message: Message) {
    return await RestAPI.put({
        url: `/channels/${message.channel_id}/messages/${message.id}/reactions/${reaction.name}:${reaction.id}/@me?location=Message&type=1&burst=true`
    });
};

async function fetchAndRetryIfNecessary(callAPIFn) {
    const response = await callAPIFn().catch(err => err);
    if (response.status === 429) {
        const retry_after = response.body.retry_after;
        await sleep(retry_after * 1000);
        return await fetchAndRetryIfNecessary(callAPIFn);
    } else if (response.status === 500) {
        await sleep(1000);
        return await fetchAndRetryIfNecessary(callAPIFn);
    }
    return response;
}