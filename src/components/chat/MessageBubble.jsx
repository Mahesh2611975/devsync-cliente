import React from "react";

export default function MessageBubble({ message }) {

    const senderLabel =
        message?.senderId
            ? String(message.senderId)
                  .substring(0, 2)
                  .toUpperCase()
            : "U";

    return (

        <div
            className="
                flex
                gap-3
                hover:bg-white/5
                p-2
                rounded-lg
                transition
            "
        >

            {/* Avatar */}
            <div
                className="
                    h-8
                    w-8
                    rounded-full
                    bg-[#1a1a1a]
                    flex
                    items-center
                    justify-center
                    text-xs
                    font-bold
                    text-[#FF4500]
                    shrink-0
                "
            >
                {senderLabel}
            </div>

            {/* Message Content */}
            <div className="flex flex-col">

                <div
                    className="
                        flex
                        items-center
                        gap-2
                    "
                >

                    <span
                        className="
                            text-xs
                            font-bold
                            text-gray-300
                        "
                    >
                        User {message?.senderId ?? "Unknown"}
                    </span>

                </div>

                <p
                    className="
                        text-sm
                        text-gray-400
                        break-words
                    "
                >
                    {message?.content || ""}
                </p>

            </div>

        </div>
    );
}