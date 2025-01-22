import { Message } from "@/app/types";
import { OpenAIStream } from "@/app/utils";

export const config = { runtime : "edge" }; // Use this instead of `export const config`

export async function POST(request: Request) {
  try {
    const { messages } = (await request.json()) as {
      messages: Message[];
    };

    const charLimit = 12000;
    let charCount = 0;
    let messagesToSend = [];

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      if (charCount + message.content.length > charLimit) {
        break;
      }
      charCount += message.content.length;
      messagesToSend.push(message);
    }

    const stream = await OpenAIStream(messagesToSend);

    return new Response(stream);
  } catch (error) {
    console.error(error);
    return new Response("Error", { status: 500 });
  }
}