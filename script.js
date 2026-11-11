// Set this to the class-hosted Cloudflare Worker URL from your course materials.
const workerUrl = "https://08-prj-loreal-chatbot.shahvir1.workers.dev/api/chat";

/* Find the page elements the chatbot needs to update. */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const sendBtn = document.getElementById("sendBtn");
const chatStatus = document.getElementById("chatStatus");

// This instruction keeps the assistant focused and sets expectations for recommendations.
const systemPrompt = `You are the L'Oréal Beauty Advisor. Help with L'Oréal products, beauty routines, and beauty-related questions such as skincare, makeup, haircare, and fragrance. Politely and briefly decline unrelated requests, then invite the user to ask a beauty question. Never invent product details, ingredients, availability, or results; say when you are unsure. Give inclusive, practical suggestions without diagnosing conditions. For persistent irritation, allergies, or medical concerns, recommend speaking with a qualified healthcare professional.`;

// Keep earlier messages so replies can use context from this conversation.
const conversation = [{ role: "system", content: systemPrompt }];

// Add a welcome message when the page first opens.
addMessage("assistant", "Hello! I'm your L'Oréal Beauty Advisor. What would you like help discovering today?");

// Add a message as text so user input is never treated as HTML.
function addMessage(role, text) {
  const message = document.createElement("article");
  message.className = `message ${role}`;

  const speaker = document.createElement("p");
  speaker.className = "message-speaker";
  speaker.textContent = role === "user" ? "YOU" : "L'ORÉAL BEAUTY ADVISOR";

  const bubble = document.createElement("p");
  bubble.className = "message-bubble";
  bubble.textContent = text;

  message.append(speaker, bubble);
  chatWindow.append(message);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Send the current question and earlier conversation to the Cloudflare Worker.
chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const question = userInput.value.trim();

  if (!question) {
    return;
  }

  // Show only the latest exchange while keeping earlier turns in conversation for context.
  chatWindow.replaceChildren();
  addMessage("user", question);
  userInput.value = "";
  chatStatus.textContent = "Thinking through your question...";
  sendBtn.disabled = true;

  if (workerUrl === "PASTE_YOUR_CLOUDFLARE_WORKER_URL_HERE") {
    addMessage("assistant", "This chatbot is not connected yet. Add your class-hosted Cloudflare Worker URL near the top of script.js, then try again.");
    chatStatus.textContent = "Add your Cloudflare Worker URL in script.js to connect the advisor.";
    sendBtn.disabled = false;
    userInput.focus();
    return;
  }

  conversation.push({ role: "user", content: question });

  try {
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: conversation }),
    });

    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error(`The Worker returned a non-JSON response (HTTP ${response.status}). Check that workerUrl points to the deployed chat Worker.`);
    }

    const reply = data.choices?.[0]?.message?.content;

    if (!response.ok) {
      throw new Error(data.error?.message || data.error || `The Worker returned HTTP ${response.status}.`);
    }

    if (!reply) {
      throw new Error("The Worker response did not include a chat reply.");
    }

    conversation.push({ role: "assistant", content: reply });
    addMessage("assistant", reply);
    chatStatus.textContent = "Beauty advice, thoughtfully tailored. For personal medical advice, consult a professional.";
  } catch (error) {
    // Do not keep a question that the assistant could not answer in the conversation history.
    conversation.pop();
    const errorMessage = error instanceof Error ? error.message : "Unknown connection error.";
    addMessage("assistant", `I couldn't get a reply: ${errorMessage}`);
    chatStatus.textContent = "Connection issue. Check the Worker URL, deployment, and Cloudflare secret.";
  } finally {
    sendBtn.disabled = false;
    userInput.focus();
  }
});
