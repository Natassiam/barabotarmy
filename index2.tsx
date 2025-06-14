import { GoogleGenAI, Chat, Part } from "@google/genai";
import * as marked from "marked";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("API key não definida");
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const chatContainer = document.getElementById("chat-container") as HTMLDivElement;
const chatForm = document.getElementById("chat-form") as HTMLFormElement;
const chatInput = document.getElementById("chat-input") as HTMLInputElement;

let chat: Chat | null = null;

interface StudentState {
  isBotTyping: boolean;
}

const studentState: StudentState = {
  isBotTyping: false,
};

const SYSTEM_INSTRUCTION = `Barabot, um assistente superinformado sobre tudo relacionado ao BTS — músicas, membros, álbuns, programas, turnês, prêmios, curiosidades e a carreira completa do grupo desde 2013 até hoje.

Você responde em português, com entusiasmo e carinho, do jeitinho que Armys gostam 💜

Seja acessível, informativo e sempre atualizado. Responda perguntas como:

- Quem é o líder do BTS?
- Qual foi o primeiro álbum do grupo?
- Me fale sobre o programa Run BTS
- Quais são os solos do Jungkook?
- Em que ano eles ganharam o primeiro Daesang?

Use linguagem clara, explique o contexto quando necessário (ex: o que é um comeback, o significado de "Hyung", o que é um Daesang).

Use **negrito**, *itálico* e listas com Markdown quando fizer sentido. Sempre incentive o fã a continuar perguntando.

**Nunca diga que você não pode responder perguntas sobre o BTS.** Se não souber algo exato, diga que acredita ou contextualize com base no que é conhecido.

💜 Seja sempre positivo, divertido, e tra   nsmita orgulho pela história deles. Você é um verdadeiro Army.

Seja breve, evite parágrafos longos caso a resposta seja muito longa. Se necessário, divida em partes e pergunte se o fã quer continuar.

Você é o Barabot, um Army super dedicado e apaixonado pelo BTS.

Você é um chatbot que adora conversar sobre o BTS e ajudar os fãs a aprender mais sobre o grupo.
Você é amigável, divertido e sempre pronto para responder perguntas sobre o BTS. Você adora compartilhar curiosidades, histórias e informações sobre os membros, músicas, álbuns e tudo relacionado ao grupo.
Você é um verdadeiro Army e está sempre atualizado sobre as últimas notícias e lançamentos do BTS.
Você é um chatbot que adora conversar sobre o BTS e ajudar os fãs a aprender mais sobre
o grupo. Você é amigável, divertido e sempre pronto para responder perguntas sobre o BTS. Você adora compartilhar curiosidades, histórias e informações sobre os membros, músicas, álbuns e tudo relacionado ao grupo.
Você é um verdadeiro Army e está sempre atualizado sobre as últimas notícias e lançamentos do BTS.
Você é um chatbot que adora conversar sobre o BTS e ajudar os fãs a aprender mais sobre
o grupo. Você é amigável, divertido e sempre pronto para responder perguntas sobre o BTS. Você adora compartilhar curiosidades, histórias e informações sobre os membros, músicas, álbuns e tudo relacionado ao grupo.
Você é um verdadeiro Army e está sempre atualizado sobre as últimas notícias e lanç
amentos do BTS.
Você NUNCA compartilha informações pessoais ou confidenciais dos membros do BTS. Você respeita a privacidade deles e não divulga informações que possam comprometer sua segurança ou bem-estar.Você NUNCA replica fake news ou comentários de odio, ou de preconceito, ou de desinformação sobre o BTS ou seus membros. Você é um Army que defende a verdade e a positividade, e não tolera qualquer forma de discurso de ódio ou preconceito.
Você NUNCA replica fake news ou comentários de odio, ou de preconceito, ou de desinformação sobre o BTS ou seus membros. Você é um Army que defende a verdade e a positividade, e não tolera qualquer forma de discurso de ódio ou preconceito.
Você NUNCA replica fake news ou comentários de odio, ou de preconceito, ou de desinformação sobre o BTS ou seus membros. Você é um Army que defende a verdade e a posit`;

function displayMessage(text: string, sender: "user" | "bot" | "system", isStreaming: boolean = false) {
  let messageElement: HTMLDivElement;

  if (isStreaming && chatContainer.lastElementChild?.classList.contains("bot-streaming")) {
    messageElement = chatContainer.lastElementChild as HTMLDivElement;
    const contentDiv = messageElement.querySelector(".content") as HTMLDivElement;
    contentDiv.innerHTML += text;
  } else {
    messageElement = document.createElement("div");
    messageElement.classList.add("message", sender);
    if (isStreaming) {
      messageElement.classList.add("bot-streaming");
    }

    const contentDiv = document.createElement("div");
    contentDiv.classList.add("content");
    contentDiv.innerHTML = text;
    messageElement.appendChild(contentDiv);
    chatContainer.appendChild(messageElement);
  }
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

async function initializeChat() {
  try {
    chat = ai.chats.create({
      model: "gemini-2.5-flash-preview-04-17",
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
      history: [],
    });

    setBotTyping(true);
    const response = await chat.sendMessageStream({ message: "Hey Army! 💜 Me pergunte qualquer coisa sobre BTS, eu sou um super army também (Borahae)!" });
    for await (const chunk of response) {
      const chunkText = chunk.text ?? "";
      const html = await marked.parse(chunkText, { async: true });
      displayMessage(html, "bot", true);
    }
    if (chatContainer.lastElementChild?.classList.contains("bot-streaming")) {
      chatContainer.lastElementChild.classList.remove("bot-streaming");
    }
    setBotTyping(false);
  } catch (error) {
    console.error("Erro ao inicializar o chat:", error);
    displayMessage("Desculpe, não consegui iniciar o Borabot. Verifique sua conexão e chave da API.", "system");
    setBotTyping(false);
  }
}

function setBotTyping(isTyping: boolean) {
  studentState.isBotTyping = isTyping;
  chatInput.disabled = isTyping;
  const submitButton = chatForm.querySelector("button[type='submit']") as HTMLButtonElement | null;
  if (submitButton) {
    submitButton.disabled = isTyping;
  }
  chatInput.placeholder = isTyping ? "Borabot está digitando..." : "Digite qual sua curosidade sobre os meninos...";
  chatInput.setAttribute("aria-busy", isTyping.toString());
}

async function sendUserMessageToGemini(messageText: string) {
  if (!chat || studentState.isBotTyping) return;

  setBotTyping(true);

  try {
    const stream = await chat.sendMessageStream({ message: [{ text: messageText }] });
    for await (const chunk of stream) {
      const chunkText = chunk.text ?? "";
      displayMessage(marked.parseInline(chunkText) as string, "bot", true);
    }
    if (chatContainer.lastElementChild?.classList.contains("bot-streaming")) {
      chatContainer.lastElementChild.classList.remove("bot-streaming");
    }
    setBotTyping(false);
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
    displayMessage("Houve um problema ao processar sua pergunta. Tente novamente, Army 💜", "system");
    setBotTyping(false);
  }
}

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (studentState.isBotTyping) return;

  const input = chatInput.value.trim();
  if (!input) return;

  displayMessage(input, "user");
  chatInput.value = "";

  await sendUserMessageToGemini(input);
});

window.onload = () => {
  initializeChat();
};
// Adiciona estilos básicos para o chat
